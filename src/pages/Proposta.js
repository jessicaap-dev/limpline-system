import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { COMODATO_DEFAULT, fmtBRL, pluralUnit } from '../lib/config'
import { generateProposta } from '../lib/pdf'
import { supabase } from '../lib/config'
import { fetchCatalogo, equipamentoParaProduto, produtoCatalogoParaProduto } from '../lib/catalogoItens'
import Layout from '../components/Layout'

export default function Proposta() {
const { user } = useAuth()
const [tab, setTab] = useState('cliente')
const [tipoProposta, setTipoProposta] = useState('comodato')

function mudarTipo(novoTipo) {
  setTipoProposta(novoTipo)
  if (novoTipo !== 'comodato' && tab === 'comodato') setTab('cliente')
}
function clienteVazio(incluirContrato) {
  return {
    nome: '', empresa: '', cnpj: '', endereco: '', validade: '15 dias', condicaoPagamento: '',
    data: new Date().toLocaleDateString('pt-BR'), obs: '', incluirContrato, incluirPedidoMinimo: false
  }
}
const [clienteComodato, setClienteComodato] = useState(clienteVazio(true))
const [clienteEquipamentos, setClienteEquipamentos] = useState(clienteVazio(false))
const [clienteInsumos, setClienteInsumos] = useState(clienteVazio(false))
const [clienteInsumosEquipamentos, setClienteInsumosEquipamentos] = useState(clienteVazio(false))
const clienteMap = {
  comodato: [clienteComodato, setClienteComodato],
  equipamentos: [clienteEquipamentos, setClienteEquipamentos],
  insumos: [clienteInsumos, setClienteInsumos],
  insumos_equipamentos: [clienteInsumosEquipamentos, setClienteInsumosEquipamentos],
}
const [cliente, setCliente] = clienteMap[tipoProposta]
const [comodato, setComodato] = useState(COMODATO_DEFAULT.map((c, i) => ({ ...c, id: i })))
const [selected, setSelected] = useState({})
const [selectedEquip, setSelectedEquip] = useState({})
const [selectedInsumos, setSelectedInsumos] = useState({})
const [selectedInsumosEquipProdutos, setSelectedInsumosEquipProdutos] = useState({})
const [selectedInsumosEquipEquip, setSelectedInsumosEquipEquip] = useState({})
const produtosSelectedMap = {
  comodato: [selected, setSelected],
  insumos: [selectedInsumos, setSelectedInsumos],
  insumos_equipamentos: [selectedInsumosEquipProdutos, setSelectedInsumosEquipProdutos],
}
const [produtosSelected, setProdutosSelected] = produtosSelectedMap[tipoProposta] || [{}, () => {}]
const equipSelectedMap = {
  equipamentos: [selectedEquip, setSelectedEquip],
  insumos_equipamentos: [selectedInsumosEquipEquip, setSelectedInsumosEquipEquip],
}
const [equipSelected, setEquipSelected] = equipSelectedMap[tipoProposta] || [{}, () => {}]
const [customComodato, setCustomComodato] = useState([])
const [customEquip, setCustomEquip] = useState([])
const [customInsumos, setCustomInsumos] = useState([])
const [customInsumosEquip, setCustomInsumosEquip] = useState([])
const customMap = {
  comodato: [customComodato, setCustomComodato],
  equipamentos: [customEquip, setCustomEquip],
  insumos: [customInsumos, setCustomInsumos],
  insumos_equipamentos: [customInsumosEquip, setCustomInsumosEquip],
}
const [customProducts, setCustomProducts] = customMap[tipoProposta]

const [selectedPedidoMinimo, setSelectedPedidoMinimo] = useState({})
const pedidoMinimoItens = Object.values(selectedPedidoMinimo)
const pedidoMinimoTotal = pedidoMinimoItens.reduce((s, it) => s + it.qty * (it.price || 0), 0)

function togglePedidoMinimo(p) {
  const s = { ...selectedPedidoMinimo }
  if (s[p.id]) delete s[p.id]
  else s[p.id] = { ...p, qty: 1, price: p.precoDefault || 0, unit: p.units[0] }
  setSelectedPedidoMinimo(s)
}

function updatePedidoMinimoItem(id, field, val) {
  setSelectedPedidoMinimo(s => ({ ...s, [id]: { ...s[id], [field]: field === 'qty' ? (parseInt(val) || 1) : (parseFloat(val) || 0) } }))
}

function toggleEquip(p) {
  const s = { ...equipSelected }
  if (s[p.id]) delete s[p.id]
  else s[p.id] = { ...p, qty: 1, price: p.precoDefault || 0, unit: 'Unidade' }
  setEquipSelected(s)
}

function addCustomProduct() {
setCustomProducts(c => [...c, { id: 'custom-' + Date.now(), name: '', unit: tipoProposta === 'equipamentos' ? 'Unidade' : 'Caixa', qty: 1, price: 0 }])
}
function updateCustomProduct(id, field, val) {
setCustomProducts(c => c.map(x => x.id === id ? { ...x, [field]: field === 'qty' ? (parseInt(val) || 1) : field === 'price' ? (parseFloat(val) || 0) : val } : x))
}
function removeCustomProduct(id) {
setCustomProducts(c => c.filter(x => x.id !== id))
}
const [loading, setLoading] = useState(false)
const [showTotal, setShowTotal] = useState(true)
const [success, setSuccess] = useState('')
const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)
const [equipamentos, setEquipamentos] = useState([])
const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(true)
const [produtosCatalogo, setProdutosCatalogo] = useState([])
const [carregandoProdutos, setCarregandoProdutos] = useState(true)

useEffect(() => {
  fetchCatalogo('equipamento').then(rows => {
    setEquipamentos(rows.map(equipamentoParaProduto))
    setCarregandoEquipamentos(false)
  })
  fetchCatalogo('produto').then(rows => {
    setProdutosCatalogo(rows.map(produtoCatalogoParaProduto))
    setCarregandoProdutos(false)
  })
}, [])

const items = [...Object.values(produtosSelected), ...Object.values(equipSelected), ...customProducts]
const total = items.reduce((s, it) => s + it.qty * (it.price || 0), 0)

async function fetchJson(url) {
const ctrl = new AbortController()
const t = setTimeout(() => ctrl.abort(), 8000)
try {
const res = await fetch(url, { signal: ctrl.signal })
if (!res.ok) throw new Error('HTTP ' + res.status)
return await res.json()
} finally { clearTimeout(t) }
}

const fmtEndereco = (logr, num, bairro, mun, uf, cep) =>
`${logr || ''}, ${num || 'S/N'} – ${bairro || ''}, ${mun || ''}/${uf || ''} – CEP ${cep || ''}`

async function buscarCNPJ(cnpj) {
const numeros = cnpj.replace(/\D/g, '')
if (numeros.length !== 14) return
setBuscandoCNPJ(true)
const provedores = [
async () => {
const d = await fetchJson(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`)
if (!d.razao_social) throw new Error('vazio')
return { empresa: d.nome_fantasia || d.razao_social, endereco: fmtEndereco(d.logradouro, d.numero, d.bairro, d.municipio, d.uf, d.cep) }
},
async () => {
const d = await fetchJson(`https://publica.cnpj.ws/cnpj/${numeros}`)
const e = d.estabelecimento
if (!d.razao_social || !e) throw new Error('vazio')
return { empresa: e.nome_fantasia || d.razao_social, endereco: fmtEndereco(e.logradouro, e.numero, e.bairro, e.cidade && e.cidade.nome, e.estado && e.estado.sigla, e.cep) }
},
async () => {
const d = await fetchJson(`https://minhareceita.org/${numeros}`)
if (!d.razao_social) throw new Error('vazio')
return { empresa: d.nome_fantasia || d.razao_social, endereco: fmtEndereco(d.logradouro, d.numero, d.bairro, d.municipio, d.uf, d.cep) }
},
async () => {
const d = await fetchJson(`https://receitaws.com.br/v1/cnpj/${numeros}`)
if (!d.nome) throw new Error('vazio')
return { empresa: d.fantasia || d.nome, endereco: fmtEndereco(d.logradouro, d.numero, d.bairro, d.municipio, d.uf, d.cep) }
},
]
try {
for (const p of provedores) {
try {
const r = await p()
setCliente(c => ({ ...c, ...r }))
return
} catch (e) { /* tenta o próximo */ }
}
alert('Não consegui buscar esse CNPJ agora (os serviços da Receita podem estar instáveis). Preencha empresa e endereço manualmente ou tente de novo em instantes.')
} finally {
setBuscandoCNPJ(false)
}
}

function toggleProduct(p) {
const s = { ...produtosSelected }
if (s[p.id]) delete s[p.id]
else s[p.id] = { ...p, qty: 1, price: p.precoDefault || 0, unit: p.units[0] }
setProdutosSelected(s)
}

function updateItem(id, field, val) {
setProdutosSelected(s => ({ ...s, [id]: { ...s[id], [field]: field === 'qty' ? (parseInt(val) || 1) : (parseFloat(val) || 0) } }))
}

function addComodato() {
setComodato(c => [...c, { id: Date.now(), name: '', qty: 1 }])
}

function updateComodato(id, field, val) {
setComodato(c => c.map(x => x.id === id ? { ...x, [field]: field === 'qty' ? (parseInt(val) || 1) : val } : x))
}

function removeComodato(id) {
setComodato(c => c.filter(x => x.id !== id))
}

const STEP_LABELS = { cliente: 'Cliente', comodato: 'Comodato', produtos: 'Produtos', pedidominimo: 'Pedido Mínimo', resumo: 'Gerar PDF' }
const steps = tipoProposta === 'comodato'
  ? ['cliente', 'comodato', 'produtos', ...(cliente.incluirContrato && cliente.incluirPedidoMinimo ? ['pedidominimo'] : []), 'resumo']
  : ['cliente', 'produtos', 'resumo']

function irProximo() {
  const idx = steps.indexOf(tab)
  if (idx > -1 && idx < steps.length - 1) setTab(steps[idx + 1])
}
function irAnterior() {
  const idx = steps.indexOf(tab)
  if (idx > 0) setTab(steps[idx - 1])
}

async function handleGerar() {
if (!cliente.empresa) { alert('Preencha o nome da empresa.'); return }
setLoading(true)
try {
const comodatoFinal = tipoProposta === 'comodato' ? comodato : []
  const usaPedidoMinimo = tipoProposta === 'comodato' && cliente.incluirContrato && cliente.incluirPedidoMinimo
  const itensPdf = tipoProposta === 'insumos_equipamentos' ? [...Object.values(produtosSelected), ...customProducts, ...Object.values(equipSelected).map(e => ({ ...e, grupo: 'equipamento' }))] : items
  const data = { ...cliente, comodato: comodatoFinal, produtos: itensPdf, vendedora: user.name, genero: user.genero, showTotal, tipoProposta, incluirPedidoMinimo: usaPedidoMinimo, pedidoMinimoItens: usaPedidoMinimo ? pedidoMinimoItens : [] }
const fn = await generateProposta(data)
try {
const { error: insertError } = await supabase.from('historico').insert({
tipo: tipoProposta === 'equipamentos' ? 'equipamentos' : tipoProposta === 'insumos' ? 'insumos' : tipoProposta === 'insumos_equipamentos' ? 'insumos+equipamentos' : cliente.incluirContrato ? 'proposta+contrato' : 'proposta',
vendedora: user.name,
email: user.email,
cliente_nome: cliente.nome || cliente.empresa,
cliente_empresa: cliente.empresa || '',
cliente_cnpj: cliente.cnpj || '',
total_valor: total,
qtd_itens: items.length,
created_at: new Date().toISOString()
})
if (insertError) console.error('Erro histórico:', insertError)
} catch (e) {
console.error('Erro ao salvar histórico:', e)
}
setSuccess(`PDF "${fn}" gerado com sucesso!`)
setTimeout(() => setSuccess(''), 5000)
} catch (e) {
console.error('Erro ao gerar PDF:', e)
alert('Erro ao gerar o PDF. Tente novamente.')
} finally {
setLoading(false)
}
}

return (
<Layout title="Gerar Proposta">
{success && (
<div style={{ background: '#EAF3DE', color: '#3B6D11', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
✓ {success}
</div>
)}

<div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
{[['comodato','🤝 Proposta Comodato'],['equipamentos','📦 Venda de Equipamentos'],['insumos','🧴 Venda de Insumos'],['insumos_equipamentos','🧴📦 Insumos + Equipamentos']].map(([v,l]) => (
<button key={v} onClick={() => mudarTipo(v)}
style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid ' + (tipoProposta === v ? '#1A3A6B' : '#D0D8EC'), background: tipoProposta === v ? '#1A3A6B' : '#fff', color: tipoProposta === v ? '#fff' : '#555', fontSize: 13, fontWeight: tipoProposta === v ? 700 : 400, cursor: 'pointer' }}>
{l}
</button>
))}
</div>

<div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
{steps.map((t, idx) => (
<button key={t} onClick={() => setTab(t)}
style={{ padding: '8px 18px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: tab === t ? '#1A3A6B' : '#fff', color: tab === t ? '#fff' : '#555', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
{(idx + 1) + '. ' + STEP_LABELS[t]}
</button>
))}
</div>

{tab === 'cliente' && (
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
{[['nome', 'Nome do responsável'], ['empresa', 'Empresa *'], ['cnpj', 'CNPJ'], ['endereco', 'Endereço completo']].map(([k, l]) => (
<div key={k}>
<label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{l}</label>
<input value={cliente[k]} onChange={e => setCliente(c => ({ ...c, [k]: e.target.value }))}
onBlur={k === 'cnpj' ? () => buscarCNPJ(cliente.cnpj) : undefined}
style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }} />
{k === 'cnpj' && buscandoCNPJ && <div style={{fontSize:12, color:'#1A7DC4', marginTop:4}}>📄 Buscando dados do CNPJ...</div>}
</div>
))}
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 12 }}>
{[['validade', 'Validade'], ['data', 'Data'], ['condicaoPagamento', 'Condição de pagamento']].map(([k, l]) => (
<div key={k}>
<label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{l}</label>
<input value={cliente[k]} onChange={e => setCliente(c => ({ ...c, [k]: e.target.value }))}
placeholder={k === 'condicaoPagamento' ? 'Ex.: 28 dias / a combinar' : undefined}
style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }} />
</div>
))}
</div>
<div>
<label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Observações</label>
<textarea value={cliente.obs} onChange={e => setCliente(c => ({ ...c, obs: e.target.value }))}
style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
</div>
{tipoProposta === 'comodato' && (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
    <input type="checkbox" checked={cliente.incluirContrato} onChange={e => setCliente(c => ({ ...c, incluirContrato: e.target.checked }))} />
    Incluir minuta do contrato no PDF
  </label>
)}
{tipoProposta === 'comodato' && cliente.incluirContrato && (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
    <input type="checkbox" checked={cliente.incluirPedidoMinimo} onChange={e => setCliente(c => ({ ...c, incluirPedidoMinimo: e.target.checked }))} />
    Incluir cláusula de Pedido Mínimo Mensal
  </label>
)}
<label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
<input type="checkbox" checked={showTotal} onChange={e => setShowTotal(e.target.checked)} />
Exibir valor total no PDF
</label>
<button onClick={irProximo} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
Próximo →
</button>
</div>
)}

{tab === 'comodato' && tipoProposta === 'comodato' && (
<div>
<p style={{ fontSize: 13, color: '#666', marginBottom: '1rem' }}>Suportes fornecidos gratuitamente em comodato:</p>
<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
{comodato.map(item => (
<div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F4F6FB', borderRadius: 8, padding: '8px 12px' }}>
<input value={item.name} onChange={e => updateComodato(item.id, 'name', e.target.value)} placeholder="Nome do suporte"
style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
<input type="number" value={item.qty} min="1" onChange={e => updateComodato(item.id, 'qty', e.target.value)}
style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, textAlign: 'center' }} />
<button onClick={() => removeComodato(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 18, lineHeight: 1 }}>×</button>
</div>
))}
</div>
<button onClick={addComodato} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', cursor: 'pointer', marginBottom: '1rem' }}>
+ Adicionar suporte
</button>
<div style={{ display: 'flex', gap: 8 }}>
<button onClick={irAnterior} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
<button onClick={irProximo} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Próximo →</button>
</div>
</div>
)}

{tab === 'produtos' && (
<div>
{(tipoProposta === 'equipamentos' || tipoProposta === 'insumos_equipamentos') && (
<div>
      {tipoProposta === 'insumos_equipamentos' && (
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A6B', marginBottom: 10 }}>🧰 Equipamentos</div>
      )}
      {carregandoEquipamentos && (
        <div style={{ color: '#888', fontSize: 13, padding: '0.5rem 0 1rem' }}>Carregando equipamentos...</div>
      )}
      {!carregandoEquipamentos && Array.from(new Set(equipamentos.map(p => p.categoria))).map(linha => (
        <div key={linha} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1.5px solid #E8EDF5', paddingBottom: 6, marginBottom: 10 }}>
            {linha}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
            {equipamentos.filter(p => p.categoria === linha).map(p => {
              const sel = equipSelected[p.id]
              return (
                <div key={p.id} onClick={() => toggleEquip(p)}
                  style={{ border: sel ? '1.5px solid #1A7DC4' : '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: sel ? '#E6F1FB' : '#fff', transition: 'all .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', lineHeight: 1.3 }}>{p.name}</div>
                      {!p.precoDefault && <div style={{ fontSize: 10, color: '#C0392B' }}>Valor a validar</div>}
                    </div>
                    {sel && <span style={{ color: '#1A7DC4', fontSize: 14, flexShrink: 0 }}>✓</span>}
                  </div>
                  {sel && (
                    <div onClick={e => e.stopPropagation()} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#666' }}>Qtd.</span>
                        <input type="number" min="1" value={sel.qty}
                          onChange={e => setEquipSelected(s => ({ ...s, [p.id]: { ...s[p.id], qty: parseInt(e.target.value) || 1 } }))}
                          style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#666' }}>R$</span>
                        <input type="number" min="0" step="0.01" value={sel.price}
                          onChange={e => setEquipSelected(s => ({ ...s, [p.id]: { ...s[p.id], price: parseFloat(e.target.value) || 0 } }))}
                          style={{ flex: 1, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
                        <span style={{ fontSize: 11, color: '#666' }}>/ un.</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
)}
{tipoProposta !== 'equipamentos' && (
<div>
{tipoProposta === 'insumos_equipamentos' && (
  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A6B', margin: '1.5rem 0 10px' }}>🧴 Insumos</div>
)}
{carregandoProdutos ? (
<div style={{ color: '#888', fontSize: 13, padding: '0.5rem 0 1rem' }}>Carregando produtos...</div>
) : Array.from(new Set(produtosCatalogo.map(p => p.categoria))).map(cat => {
const prods = produtosCatalogo.filter(p => p.categoria === cat)
if (prods.length === 0) return null
return (
<div key={cat} style={{ marginBottom: '1.5rem' }}>
<div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1.5px solid #E8EDF5', paddingBottom: 6, marginBottom: 10 }}>
{cat}
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 8 }}>
{prods.map(p => {
const sel = produtosSelected[p.id]
return (
<div key={p.id} onClick={() => toggleProduct(p)}
style={{ border: sel ? '1.5px solid #1A7DC4' : '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: sel ? '#E6F1FB' : '#fff', transition: 'all .15s' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
<div>
<div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', lineHeight: 1.3 }}>{p.name}</div>
{p.codigo && <div style={{ fontSize: 10, color: '#999' }}>Cód. {p.codigo}</div>}
</div>
{sel && <span style={{ color: '#1A7DC4', fontSize: 14, flexShrink: 0 }}>✓</span>}
</div>
{sel && (
<div onClick={e => e.stopPropagation()} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>Qtd.</span>
<input type="number" min="1" value={sel.qty} onChange={e => updateItem(p.id, 'qty', e.target.value)}
style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
{p.units.length > 1 ? (
<select value={sel.unit} onChange={e => setProdutosSelected(s => ({ ...s, [p.id]: { ...s[p.id], unit: e.target.value } }))}
style={{ fontSize: 11, color: '#1A3A6B', fontWeight: 600, background: '#f0f4fb', borderRadius: 4, padding: '2px 6px', border: 'none' }}>
{p.units.map(u => <option key={u} value={u}>{u}</option>)}
</select>
) : (
<span style={{ fontSize: 11, color: '#888', fontWeight: 600, background: '#f0f4fb', borderRadius: 4, padding: '2px 6px' }}>{sel.unit}</span>
)}
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>R$</span>
<input type="number" min="0" step="0.01" value={sel.price} onChange={e => updateItem(p.id, 'price', e.target.value)}
style={{ flex: 1, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
<span style={{ fontSize: 11, color: '#666' }}>/ {sel.unit}</span>
</div>
</div>
)}
</div>
)
})}
</div>
</div>
)
})}
</div>
)}

<div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
<span style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B' }}>
{tipoProposta === 'equipamentos' ? 'Equipamento não está na lista?' : tipoProposta === 'insumos_equipamentos' ? 'Produto ou equipamento não está na lista?' : 'Produto não está na lista?'}
</span>
<button onClick={addCustomProduct} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #1A3A6B', background: '#fff', color: '#1A3A6B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Adicionar</button>
</div>
{customProducts.map(cp => (
<div key={cp.id} style={{ border: '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', marginBottom: 8, background: '#FFFBF0' }}>
<div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
<input placeholder="Descrição do item" value={cp.name} onChange={e => updateCustomProduct(cp.id, 'name', e.target.value)}
style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
<button onClick={() => removeCustomProduct(cp.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#FEEEEE', color: '#C0392B', fontSize: 12, cursor: 'pointer' }}>Remover</button>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>Qtd.</span>
<input type="number" min="1" value={cp.qty} onChange={e => updateCustomProduct(cp.id, 'qty', e.target.value)}
style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
<span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>R$</span>
<input type="number" min="0" step="0.01" value={cp.price} onChange={e => updateCustomProduct(cp.id, 'price', e.target.value)}
style={{ width: 80, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
<select value={cp.unit} onChange={e => updateCustomProduct(cp.id, 'unit', e.target.value)}
style={{ fontSize: 11, color: '#1A3A6B', fontWeight: 600, background: '#f0f4fb', borderRadius: 4, padding: '3px 6px', border: 'none' }}>
{['Unidade', 'Caixa', 'Pacote', 'Fardo'].map(u => <option key={u} value={u}>{u}</option>)}
</select>
<span style={{ fontSize: 11, color: '#666' }}>/ {cp.unit}</span>
</div>
</div>
))}
</div>
<div style={{ display: 'flex', gap: 8 }}>
<button onClick={irAnterior} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
<button onClick={irProximo} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{steps[steps.indexOf('produtos') + 1] === 'pedidominimo' ? 'Próximo →' : 'Ver resumo →'}</button>
</div>
</div>
)}

{tab === 'pedidominimo' && tipoProposta === 'comodato' && (
<div>
<p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Selecione os produtos e quantidades que vão compor o pedido mínimo mensal obrigatório deste cliente:</p>
<p style={{ fontSize: 12, color: '#888', marginBottom: '1rem' }}>Essa seleção é só para a cláusula do contrato — não entra na tabela de "Valores e sugestão do pedido" da proposta.</p>
{carregandoProdutos ? (
<div style={{ color: '#888', fontSize: 13, padding: '0.5rem 0 1rem' }}>Carregando produtos...</div>
) : Array.from(new Set(produtosCatalogo.map(p => p.categoria))).map(cat => {
const prods = produtosCatalogo.filter(p => p.categoria === cat)
if (prods.length === 0) return null
return (
<div key={cat} style={{ marginBottom: '1.5rem' }}>
<div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1.5px solid #E8EDF5', paddingBottom: 6, marginBottom: 10 }}>
{cat}
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 8 }}>
{prods.map(p => {
const sel = selectedPedidoMinimo[p.id]
return (
<div key={p.id} onClick={() => togglePedidoMinimo(p)}
style={{ border: sel ? '1.5px solid #1A7DC4' : '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: sel ? '#E6F1FB' : '#fff', transition: 'all .15s' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
<div>
<div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', lineHeight: 1.3 }}>{p.name}</div>
{p.codigo && <div style={{ fontSize: 10, color: '#999' }}>Cód. {p.codigo}</div>}
</div>
{sel && <span style={{ color: '#1A7DC4', fontSize: 14, flexShrink: 0 }}>✓</span>}
</div>
{sel && (
<div onClick={e => e.stopPropagation()} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>Qtd.</span>
<input type="number" min="1" value={sel.qty} onChange={e => updatePedidoMinimoItem(p.id, 'qty', e.target.value)}
style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
{p.units.length > 1 ? (
<select value={sel.unit} onChange={e => setSelectedPedidoMinimo(s => ({ ...s, [p.id]: { ...s[p.id], unit: e.target.value } }))}
style={{ fontSize: 11, color: '#1A3A6B', fontWeight: 600, background: '#f0f4fb', borderRadius: 4, padding: '2px 6px', border: 'none' }}>
{p.units.map(u => <option key={u} value={u}>{u}</option>)}
</select>
) : (
<span style={{ fontSize: 11, color: '#888', fontWeight: 600, background: '#f0f4fb', borderRadius: 4, padding: '2px 6px' }}>{sel.unit}</span>
)}
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>R$</span>
<input type="number" min="0" step="0.01" value={sel.price} onChange={e => updatePedidoMinimoItem(p.id, 'price', e.target.value)}
style={{ flex: 1, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
<span style={{ fontSize: 11, color: '#666' }}>/ {sel.unit}</span>
</div>
</div>
)}
</div>
)
})}
</div>
</div>
)
})}
<div style={{ background: '#F4F6FB', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<span style={{ fontSize: 13, color: '#666' }}>Valor mínimo mensal ({pedidoMinimoItens.length} {pedidoMinimoItens.length === 1 ? 'item' : 'itens'})</span>
<span style={{ fontSize: 20, fontWeight: 600, color: '#1A3A6B' }}>{fmtBRL(pedidoMinimoTotal)}</span>
</div>
{pedidoMinimoItens.length === 0 && <div style={{ color: '#C0392B', fontSize: 12, marginBottom: '1rem' }}>Selecione pelo menos um produto para a cláusula ser incluída no contrato.</div>}
<div style={{ display: 'flex', gap: 8 }}>
<button onClick={irAnterior} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
<button onClick={irProximo} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Ver resumo →</button>
</div>
</div>
)}

{tab === 'resumo' && (
<div>
<div style={{ background: '#F4F6FB', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
<div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 8 }}>Cliente</div>
<div style={{ fontSize: 13, color: '#333' }}>{cliente.empresa || '—'} {cliente.nome ? `| ${cliente.nome}` : ''}</div>
{cliente.cnpj && <div style={{ fontSize: 12, color: '#666' }}>CNPJ: {cliente.cnpj}</div>}
<div style={{ fontSize: 12, color: '#666' }}>Validade: {cliente.validade} | Data: {cliente.data}</div>
<div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Vendedora: {user.name}</div>
</div>

{(tipoProposta === 'insumos_equipamentos' ? [['Insumos', [...Object.values(produtosSelected), ...customProducts]], ['Equipamentos', Object.values(equipSelected)]] : [[null, items]]).filter(g => g[1].length > 0).map(([titulo, lista]) => (
<div key={titulo || 'todos'} style={{ background: '#fff', border: '0.5px solid #E8EDF5', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
{titulo && <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, color: '#1A3A6B', background: '#E6ECF5' }}>{titulo}</div>}
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
<thead>
<tr style={{ background: '#1A3A6B' }}>
{['Produto', 'Qtd.', 'Unit.', 'Total'].map(h => (
<th key={h} style={{ padding: '8px 12px', color: '#fff', fontWeight: 500, textAlign: h === 'Produto' ? 'left' : 'right', fontSize: 12 }}>{h}</th>
))}
</tr>
</thead>
<tbody>
{lista.map((it, i) => (
<tr key={it.id} style={{ background: i % 2 === 0 ? '#F8FAFF' : '#fff' }}>
<td style={{ padding: '8px 12px', color: '#1A1A2E' }}>{it.name}</td>
<td style={{ padding: '8px 12px', textAlign: 'right', color: '#444' }}>{it.qty} {pluralUnit(it.unit, it.qty)}</td>
<td style={{ padding: '8px 12px', textAlign: 'right', color: '#444' }}>{fmtBRL(it.price)}</td>
<td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{fmtBRL(it.qty * (it.price || 0))}</td>
</tr>
))}
</tbody>
</table>
<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '12px 16px', borderTop: '0.5px solid #E8EDF5' }}>
<span style={{ fontSize: 13, color: '#666' }}>{titulo ? 'Total ' + titulo.toLowerCase() : 'Total do pedido'}</span>
<span style={{ fontSize: 20, fontWeight: 600, color: '#1A3A6B' }}>{fmtBRL(lista.reduce((s, it) => s + it.qty * (it.price || 0), 0))}</span>
</div>
</div>
))}

{items.length === 0 && <div style={{ color: '#888', fontSize: 13, marginBottom: '1rem' }}>Nenhum produto adicionado.</div>}

{tipoProposta === 'comodato' && cliente.incluirContrato && cliente.incluirPedidoMinimo && pedidoMinimoItens.length > 0 && (
<div style={{ background: '#FFFBF0', border: '0.5px solid #F0E0B0', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
<div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 8 }}>Cláusula de Pedido Mínimo Mensal — Anexo I</div>
{pedidoMinimoItens.map(it => (
<div key={it.id} style={{ fontSize: 12, color: '#444', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
<span>{it.name} — {it.qty} {pluralUnit(it.unit, it.qty)}</span>
<span>{fmtBRL(it.qty * (it.price || 0))}</span>
</div>
))}
<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '0.5px solid #F0E0B0' }}>
<span style={{ fontSize: 12, color: '#666' }}>Valor mínimo mensal</span>
<span style={{ fontSize: 15, fontWeight: 600, color: '#1A3A6B' }}>{fmtBRL(pedidoMinimoTotal)}</span>
</div>
</div>
)}

{tipoProposta === 'comodato' && (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: '1rem' }}>
    <input type="checkbox" checked={cliente.incluirContrato} onChange={e => setCliente(c => ({ ...c, incluirContrato: e.target.checked }))} />
    Incluir minuta do contrato no PDF
  </label>
)}
<label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
<input type="checkbox" checked={showTotal} onChange={e => setShowTotal(e.target.checked)} />
Exibir valor total no PDF
</label>

<div style={{ display: 'flex', gap: 8 }}>
<button onClick={irAnterior} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
<button onClick={handleGerar} disabled={loading}
style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
{loading ? 'Gerando...' : '🔍 Gerar PDF'}
</button>
</div>
</div>
)}
</Layout>
)
}
