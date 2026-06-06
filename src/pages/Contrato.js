import React, { useState } from 'react'
import { useAuth } from '../lib/auth'
import { COMODATO_DEFAULT } from '../lib/config'
import { generateContrato } from '../lib/pdf'
import { supabase } from '../lib/config'
import Layout from '../components/Layout'

export default function Contrato() {
  const { user } = useAuth()
  const [dados, setDados] = useState({
    nome: '', empresa: '', cnpj: '', endereco: '',
    data: new Date().toLocaleDateString('pt-BR'),
  })
  const [comodato, setComodato] = useState(COMODATO_DEFAULT.map((c, i) => ({ ...c, id: i })))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)

  async function buscarCNPJ(cnpj) {
    const numeros = cnpj.replace(/\D/g, '')
    if (numeros.length !== 14) return
    try {
      setBuscandoCNPJ(true)
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`)
      const data = await res.json()
      if (data.razao_social) {
        setDados(d => ({
          ...d,
          empresa: data.nome_fantasia || data.razao_social,
          endereco: `${data.logradouro}, ${data.numero} – ${data.bairro}, ${data.municipio}/${data.uf} – CEP ${data.cep}`
        }))
      }
    } catch(e) {
      alert('CNPJ não encontrado ou inválido.')
    } finally {
      setBuscandoCNPJ(false)
    }
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
    if (!dados.empresa) { alert('Preencha o nome da empresa.'); return }
    setLoading(true)
    const data = { ...dados, comodato }
    const fn = generateContrato(data)
    try {
      await supabase.from('historico').insert({
        tipo: 'contrato',
        vendedora: user.name,
        cliente_nome: dados.nome,
        cliente_empresa: dados.empresa,
        arquivo: fn,
        created_at: new Date().toISOString()
      })
    } catch (e) { }
    setLoading(false)
    setSuccess(`Contrato "${fn}" gerado com sucesso!`)
    setTimeout(() => setSuccess(''), 5000)
  }

  return (
    <Layout title="Gerar Contrato">
      {success && (
        <div style={{ background: '#EAF3DE', color: '#3B6D11', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 600 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['nome', 'Nome do responsável'], ['empresa', 'Empresa *'], ['cnpj', 'CNPJ'], ['endereco', 'Endereço completo'], ['data', 'Data do contrato']].map(([k, l]) => (
            <div key={k} style={{ gridColumn: k === 'endereco' || k === 'data' ? '1 / -1' : 'auto' }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{l}</label>
              <input value={dados[k]} onChange={e => setDados(d => ({ ...d, [k]: e.target.value }))}
                onBlur={k === 'cnpj' ? () => buscarCNPJ(dados.cnpj) : undefined}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }} />
              {k === 'cnpj' && buscandoCNPJ && <div style={{fontSize:12, color:'#1A7DC4', marginTop:4}}>🔍 Buscando dados do CNPJ...</div>}
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 8 }}>Equipamentos em comodato</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {comodato.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F4F6FB', borderRadius: 8, padding: '8px 12px' }}>
                <input value={item.name} onChange={e => updateComodato(item.id, 'name', e.target.value)} placeholder="Nome do equipamento"
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
                <input type="number" value={item.qty} min="1" onChange={e => updateComodato(item.id, 'qty', e.target.value)}
                  style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, textAlign: 'center' }} />
                <button onClick={() => removeComodato(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 18 }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={addComodato} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', cursor: 'pointer' }}>
            + Adicionar equipamento
          </button>
        </div>

        <button onClick={handleGerar} disabled={loading}
          style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, alignSelf: 'flex-start' }}>
          {loading ? 'Gerando...' : '📄 Gerar Contrato PDF'}
        </button>
      </div>
    </Layout>
  )
}
