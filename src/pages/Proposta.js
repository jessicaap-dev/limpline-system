import React, { useState } from 'react'
import { useAuth } from '../lib/auth'
import { PRODUCTS, COMODATO_DEFAULT, fmtBRL } from '../lib/config'
import { generateProposta } from '../lib/pdf'
import { supabase } from '../lib/config'
import Layout from '../components/Layout'

export default function Proposta() {
const { user } = useAuth()
const [tab, setTab] = useState('cliente')
const [tipoProposta, setTipoProposta] = useState('comodato')
const [cliente, setCliente] = useState({
nome: '', empresa: '', cnpj: '', endereco: '', validade: '15 dias', condicaoPagamento: '',
data: new Date().toLocaleDateString('pt-BR'), obs: '', incluirContrato: true
})
const [comodato, setComodato] = useState(COMODATO_DEFAULT.map((c, i) => ({ ...c, id: i })))
const [selected, setSelected] = useState({})
const [customProducts, setCustomProducts] = useState([])

function addCustomProduct() {
setCustomProducts(c => [...c, { id: 'custom-' + Date.now(), name: '', unit: 'Caixa', qty: 1, price: 0 }])
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

const items = [...Object.values(selected), ...customProducts]
const total = items.reduce((s, it) => s + it.qty * (it.price || 0), 0)

async function buscarCNPJ(cnpj) {
const numeros = cnpj.replace(/\D/g, '')
if (numeros.length !== 14) return
try {
setBuscandoCNPJ(true)
const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`)
if (!res.ok) throw new Error('CNPJ não encontrado')
const data = await res.json()
if (data.razao_social) {
setCliente(c => ({
...c,
empresa: data.nome_fantasia || data.razao_social,
endereco: `${data.logradouro || ''}, ${data.numero || 'S/N'} – ${data.bairro || ''}, ${data.municipio || ''}/${data.uf || ''} – CEP ${data.cep || ''}`
}))
}
} catch (e) {
try {
const res2 = await fetch(`https://receitaws.com.br/v1/cnpj/${numeros}`)
if (!res2.ok) throw new Error('CNPJ não encontrado')
const data2 = await res2.json()
if (data2.nome) {
setCliente(c => ({
...c,
empresa: data2.fantasia || data2.nome,
endereco: `${data2.logradouro || ''}, ${data2.numero || 'S/N'} – ${data2.bairro || ''}, ${data2.municipio || ''}/${data2.uf || ''} – CEP ${data2.cep || ''}`
}))
}
} catch (e2) {
alert('CNPJ não encontrado. Verifique o número e tente novamente.')
}
} finally {
setBuscandoCNPJ(false)
}
}

function toggleProduct(p) {
const s = { ...selected }
if (s[p.id]) delete s[p.id]
else s[p.id] = { ...p, qty: 1, price: 0, unit: p.units[0] }
setSelected(s)
}

function updateItem(id, field, val) {
setSelected(s => ({ ...s, [id]: { ...s[id], [field]: field === 'qty' ? (parseInt(val) || 1) : (parseFloat(val) || 0) } }))
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

async function handleGerar() {
if (!cliente.empresa) { alert('Preencha o nome da empresa.'); return }
setLoading(true)
try {
const data = { ...cliente, comodato: tipoProposta === 'comodato' ? comodato : [], produtos: items, vendedora: user.name, genero: user.genero, showTotal, tipoProposta }
const fn = await generateProposta(data)
try {
const { error: insertError } = await supabase.from('historico').insert({
tipo: tipoProposta === 'equipamentos' ? 'equipamentos' : cliente.incluirContrato ? 'proposta+contrato' : 'proposta',
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
{[['comodato','🤝 Proposta Comodato'],['equipamentos','📦 Venda de Equipamentos']].map(([v,l]) => (
<button key={v} onClick={() => setTipoProposta(v)}
style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid ' + (tipoProposta === v ? '#1A3A6B' : '#D0D8EC'), background: tipoProposta === v ? '#1A3A6B' : '#fff', color: tipoProposta === v ? '#fff' : '#555', fontSize: 13, fontWeight: tipoProposta === v ? 700 : 400, cursor: 'pointer' }}>
{l}
</button>
))}
</div>

<div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
{(tipoProposta === 'comodato' ? ['cliente','comodato','produtos','resumo'] : ['cliente','produtos','resumo']).map((t, idx) => (
<button key={t} onClick={() => setTab(t)}
style={{ padding: '8px 18px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: tab === t ? '#1A3A6B' : '#fff', color: tab === t ? '#fff' : '#555', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
{t === 'cliente' ? '1. Cliente' : t === 'comodato' ? '2. Comodato' : t === 'produtos' ? (tipoProposta === 'comodato' ? '3. Produtos' : '2. Produtos') : (tipoProposta === 'comodato' ? '4. Gerar PDF' : '3. Gerar PDF')}
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
<label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
<input type="checkbox" checked={showTotal} onChange={e => setShowTotal(e.target.checked)} />
Exibir valor total no PDF
</label>
<button onClick={() => setTab(tipoProposta === 'comodato' ? 'comodato' : 'produtos')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
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
<button onClick={() => setTab('cliente')} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
<button onClick={() => setTab('produtos')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Próximo →</button>
</div>
</div>
)}

{tab === 'produtos' && (
<div>
{tipoProposta === 'equipamentos' ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 8, marginBottom: '1rem' }}>
{PRODUCTS.filter(p => p.categoria === 'Equipamentos').map(p => {
const sel = selected[p.id]
return (
<div key={p.id} onClick={() => toggleProduct(p)}
style={{ border: sel ? '1.5px solid #1A7DC4' : '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: sel ? '#E6F1FB' : '#fff' }}>
<div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>{p.name}</div>
{sel && (
<div onClick={e => e.stopPropagation()} style={{ marginTop: 8 }}>
<input type="number" min="1" value={sel.qty} onChange={e => updateItem(p.id, 'qty', e.target.value)}
style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
</div>
)}
</div>
)
})}
</div>
) : ['Papel Toalha','Papel Higiênico','Sabonete','Álcool','Refis','Outros'].map(cat => {
const prods = PRODUCTS.filter(p => p.categoria === cat)
if (prods.length === 0) return null
return (
<div key={cat} style={{ marginBottom: '1.5rem' }}>
<div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1.5px solid #E8EDF5', paddingBottom: 6, marginBottom: 10 }}>
{cat}
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 8 }}>
{prods.map(p => {
const sel = selected[p.id]
return (
<div key={p.id} onClick={() => toggleProduct(p)}
style={{ border: sel ? '1.5px solid #1A7DC4' : '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: sel ? '#E6F1FB' : '#fff', transition: 'all .15s' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
<div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', lineHeight: 1.3 }}>{p.name}</div>
{sel && <span style={{ color: '#1A7DC4', fontSize: 14, flexShrink: 0 }}>"</span>}
</div>
{sel && (
<div onClick={e => e.stopPropagation()} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>Qtd.</span>
<input type="number" min="1" value={sel.qty} onChange={e => updateItem(p.id, 'qty', e.target.value)}
style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
{p.units.length > 1 ? (
<select value={sel.unit} onChange={e => setSelected(s => ({ ...s, [p.id]: { ...s[p.id], unit: e.target.value } }))}
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
)}

<div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
<span style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B' }}>Produto não está na lista?</span>
<button onClick={addCustomProduct} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #1A3A6B', background: '#fff', color: '#1A3A6B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Adicionar produto</button>
</div>
{customProducts.map(cp => (
<div key={cp.id} style={{ border: '0.5px solid #E8EDF5', borderRadius: 10, padding: '10px 12px', marginBottom: 8, background: '#FFFBF0' }}>
<div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
<input placeholder="Descrição do produto" value={cp.name} onChange={e => updateCustomProduct(cp.id, 'name', e.target.value)}
style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
<button onClick={() => removeCustomProduct(cp.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#FEEEEE', color: '#C0392B', fontSize: 12, cursor: 'pointer' }}>Remover</button>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 11, color: '#666' }}>Qtd.</span>
<input type="number" min="1" value={cp.qty} onChange={e => updateCustomProduct(cp.id, 'qty', e.target.value)}
style={{ width: 55, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
<select value={cp.unit} onChange={e => updateCustomProduct(cp.id, 'unit', e.target.value)}
style={{ fontSize: 11, color: '#1A3A6B', fontWeight: 600, background: '#f0f4fb', borderRadius: 4, padding: '3px 6px', border: 'none' }}>
{['Caixa', 'Pacote', 'Fardo', 'Unidade'].map(u => <option key={u} value={u}>{u}</option>)}
</select>
<span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>R$</span>
<input type="number" min="0" step="0.01" value={cp.price} onChange={e => updateCustomProduct(cp.id, 'price', e.target.value)}
style={{ width: 80, padding: '3px 6px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 12 }} />
<span style={{ fontSize: 11, color: '#666' }}>/ {cp.unit}</span>
</div>
</div>
))}
</div>
<div style={{ display: 'flex', gap: 8 }}>
<button onClick={() => setTab(tipoProposta === 'comodato' ? 'comodato' : 'cliente')} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
<button onClick={() => setTab('resumo')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Ver resumo →</button>
</div>
</div>
)}

{tab === 'resumo' && (
<div>
<div style={{ background: '#F4F6FB', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
<div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 8 }}>Cliente</div>
<div style={{ fontSize: 13, color: '#333' }}>{cliente.empresa || '"'} {cliente.nome ? `| ${cliente.nome}` : ''}</div>
{cliente.cnpj && <div style={{ fontSize: 12, color: '#666' }}>CNPJ: {cliente.cnpj}</div>}
<div style={{ fontSize: 12, color: '#666' }}>Validade: {cliente.validade} | Data: {cliente.data}</div>
<div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Vendedora: {user.name}</div>
</div>

{items.length > 0 && (
<div style={{ background: '#fff', border: '0.5px solid #E8EDF5', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
<thead>
<tr style={{ background: '#1A3A6B' }}>
{['Produto', 'Qtd.', 'Unit.', 'Total'].map(h => (
<th key={h} style={{ padding: '8px 12px', color: '#fff', fontWeight: 500, textAlign: h === 'Produto' ? 'left' : 'right', fontSize: 12 }}>{h}</th>
))}
</tr>
</thead>
<tbody>
{items.map((it, i) => (
<tr key={it.id} style={{ background: i % 2 === 0 ? '#F8FAFF' : '#fff' }}>
<td style={{ padding: '8px 12px', color: '#1A1A2E' }}>{it.name}</td>
<td style={{ padding: '8px 12px', textAlign: 'right', color: '#444' }}>{it.qty} {it.unit}</td>
<td style={{ padding: '8px 12px', textAlign: 'right', color: '#444' }}>{fmtBRL(it.price)}</td>
<td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{fmtBRL(it.qty * (it.price || 0))}</td>
</tr>
))}
</tbody>
</table>
<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '12px 16px', borderTop: '0.5px solid #E8EDF5' }}>
<span style={{ fontSize: 13, color: '#666' }}>Total do pedido</span>
<span style={{ fontSize: 20, fontWeight: 600, color: '#1A3A6B' }}>{fmtBRL(total)}</span>
</div>
</div>
)}

{items.length === 0 && <div style={{ color: '#888', fontSize: 13, marginBottom: '1rem' }}>Nenhum produto adicionado.</div>}

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
<button onClick={() => setTab('produtos')} style={{ padding: '10px 20px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
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
