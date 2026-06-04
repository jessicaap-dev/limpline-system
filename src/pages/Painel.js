import React, { useState, useEffect } from 'react'
import { supabase, fmtDate } from '../lib/config'
import Layout from '../components/Layout'

const TIPO_COLOR = {
  'proposta': { bg: '#E6F1FB', color: '#185FA5' },
  'contrato': { bg: '#EAF3DE', color: '#3B6D11' },
  'proposta+contrato': { bg: '#FAEEDA', color: '#854F0B' },
}

export default function Painel() {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroVendedora, setFiltroVendedora] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [stats, setStats] = useState({ total: 0, propostas: 0, contratos: 0, hoje: 0 })

  useEffect(() => { loadHistorico() }, [])

  async function loadHistorico() {
    setLoading(true)
    try {
      const { data } = await supabase.from('historico').select('*').order('created_at', { ascending: false })
      const items = data || []
      setHistorico(items)
      const hoje = new Date().toDateString()
      setStats({
        total: items.length,
        propostas: items.filter(i => i.tipo.includes('proposta')).length,
        contratos: items.filter(i => i.tipo.includes('contrato')).length,
        hoje: items.filter(i => new Date(i.created_at).toDateString() === hoje).length,
      })
    } catch (e) {
      setHistorico([])
    }
    setLoading(false)
  }

  const vendedoras = ['todas', ...new Set(historico.map(h => h.vendedora))]
  const filtered = historico.filter(h => {
    if (filtroVendedora !== 'todas' && h.vendedora !== filtroVendedora) return false
    if (filtroTipo !== 'todos' && !h.tipo.includes(filtroTipo)) return false
    return true
  })

  return (
    <Layout title="Painel — Histórico">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total gerados', value: stats.total, color: '#1A3A6B' },
          { label: 'Propostas', value: stats.propostas, color: '#185FA5' },
          { label: 'Contratos', value: stats.contratos, color: '#3B6D11' },
          { label: 'Hoje', value: stats.hoje, color: '#854F0B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#F4F6FB', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filtroVendedora} onChange={e => setFiltroVendedora(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13 }}>
          {vendedoras.map(v => <option key={v} value={v}>{v === 'todas' ? 'Todas as vendedoras' : v}</option>)}
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13 }}>
          <option value="todos">Todos os tipos</option>
          <option value="proposta">Propostas</option>
          <option value="contrato">Contratos</option>
        </select>
        <button onClick={loadHistorico} style={{ padding: '7px 14px', borderRadius: 8, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 13, cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
        <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>{filtered.length} registro(s)</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 13 }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 13 }}>Nenhum registro encontrado.</div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #E8EDF5', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1A3A6B' }}>
                {['Data/Hora', 'Vendedora', 'Empresa', 'Responsável', 'Tipo', 'Arquivo'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', color: '#fff', fontWeight: 500, textAlign: 'left', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => {
                const tc = TIPO_COLOR[h.tipo] || { bg: '#F1EFE8', color: '#5F5E5A' }
                return (
                  <tr key={h.id || i} style={{ background: i % 2 === 0 ? '#F8FAFF' : '#fff' }}>
                    <td style={{ padding: '9px 12px', color: '#555', whiteSpace: 'nowrap' }}>{fmtDate(h.created_at)}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 500, color: '#1A3A6B' }}>{h.vendedora}</td>
                    <td style={{ padding: '9px 12px', color: '#333' }}>{h.cliente_empresa}</td>
                    <td style={{ padding: '9px 12px', color: '#555' }}>{h.cliente_nome || '—'}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: tc.bg, color: tc.color, fontWeight: 500 }}>{h.tipo}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#888', fontSize: 11 }}>{h.arquivo}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
