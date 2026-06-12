import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/config'
import { LINHAS_CATALOGO, fotoUrl } from '../lib/catalogo'
import { generateCatalogo } from '../lib/pdf'

export default function Catalogo() {
  const { user } = useAuth()
  const [selecionadas, setSelecionadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [progresso, setProgresso] = useState('')

  function toggle(id) {
    setSelecionadas(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function handleGerar() {
    if (!selecionadas.length) { alert('Selecione pelo menos uma linha.'); return }
    setLoading(true)
    setProgresso('Carregando fotos...')
    const linhas = LINHAS_CATALOGO
      .filter(l => selecionadas.includes(l.id))
      .map(l => ({ ...l, fotos: l.fotos.map(f => ({ ...f, url: fotoUrl(l.id, f.file) })) }))
    try {
      const fn = await generateCatalogo(linhas, (done, total) => {
        setProgresso(`Carregando fotos... ${done} de ${total}`)
      })
      try {
        await supabase.from('historico').insert({
          tipo: 'catalogo',
          vendedora: user.name,
          cliente_nome: '—',
          cliente_empresa: linhas.map(l => l.nome).join(', '),
          arquivo: fn,
          created_at: new Date().toISOString()
        })
      } catch (e) { }
      setProgresso('')
    } catch (e) {
      alert('Erro ao gerar o catálogo. Verifique sua conexão e tente novamente.')
      setProgresso('')
    }
    setLoading(false)
  }

  return (
    <Layout title="Catálogo por Linha">
      <p style={{ fontSize: 13, color: '#667085', marginBottom: '1.25rem' }}>
        Selecione uma ou mais linhas e gere um catálogo em PDF com as fotos dos aparelhos,
        pronto para enviar ao cliente — sem dados de proposta ou valores.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
        {LINHAS_CATALOGO.map(linha => {
          const sel = selecionadas.includes(linha.id)
          return (
            <div key={linha.id}
              onClick={() => linha.disponivel && toggle(linha.id)}
              style={{
                border: sel ? '1.5px solid #1A3A6B' : '0.5px solid #E0E5EE',
                background: !linha.disponivel ? '#F7F8FA' : sel ? '#EAF1FB' : '#fff',
                borderRadius: 12, padding: '14px 16px',
                cursor: linha.disponivel ? 'pointer' : 'not-allowed',
                opacity: linha.disponivel ? 1 : 0.55,
                transition: 'all .15s', userSelect: 'none'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A3A6B' }}>{linha.nome}</span>
                {linha.disponivel
                  ? <span style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: sel ? 'none' : '1.5px solid #C3CCDA',
                      background: sel ? '#1A3A6B' : '#fff',
                      color: '#fff', fontSize: 12, display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>{sel ? '✓' : ''}</span>
                  : <span style={{ fontSize: 10, fontWeight: 600, color: '#98A2B3', background: '#EDF0F5', padding: '2px 8px', borderRadius: 99 }}>EM BREVE</span>
                }
              </div>
              {linha.disponivel && (
                <div style={{ fontSize: 11.5, color: '#98A2B3', marginTop: 4 }}>
                  {linha.fotos.length} foto{linha.fotos.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={handleGerar} disabled={loading}
          style={{
            padding: '10px 26px', borderRadius: 10, border: 'none',
            background: loading ? '#9DB2CE' : '#1A3A6B', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer'
          }}>
          {loading ? 'Gerando...' : '📥 Gerar Catálogo PDF'}
        </button>
        {progresso && <span style={{ fontSize: 12.5, color: '#667085' }}>{progresso}</span>}
      </div>
    </Layout>
  )
}
