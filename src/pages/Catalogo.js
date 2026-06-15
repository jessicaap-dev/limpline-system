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
          vendedora: user?.email,
          linhas: selecionadas,
        })
      } catch (_) {}
      const a = document.createElement('a')
      a.href = fn
      a.download = 'catalogo-limpline.pdf'
      a.click()
      URL.revokeObjectURL(fn)
    } catch (e) {
      alert('Erro ao gerar catálogo: ' + e.message)
    } finally {
      setLoading(false)
      setProgresso('')
    }
  }

  const disponiveis = LINHAS_CATALOGO.filter(l => l.disponivel)
  const indisponiveis = LINHAS_CATALOGO.filter(l => !l.disponivel)

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ color: '#1a3a6b', marginBottom: 8 }}>Catálogo de Linhas</h2>
        <p style={{ color: '#555', marginBottom: 24 }}>
          Selecione as linhas desejadas e clique em <strong>Gerar PDF</strong>.
        </p>

        <h3 style={{ color: '#1a3a6b', marginBottom: 12 }}>Linhas disponíveis</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          {disponiveis.map(linha => {
            const sel = selecionadas.includes(linha.id)
            return (
              <div
                key={linha.id}
                onClick={() => toggle(linha.id)}
                style={{
                  border: sel ? '2px solid #1a3a6b' : '2px solid #ddd',
                  borderRadius: 10,
                  padding: '16px 12px',
                  cursor: 'pointer',
                  background: sel ? '#eef3fb' : '#fff',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                <div style={{ fontWeight: 600, color: '#1a3a6b' }}>{linha.nome}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                  {linha.fotos.length} foto{linha.fotos.length !== 1 ? 's' : ''}
                </div>
                {sel && <div style={{ fontSize: 12, color: '#1a3a6b', marginTop: 6 }}>✓ Selecionada</div>}
              </div>
            )
          })}
        </div>

        {indisponiveis.length > 0 && (
          <>
            <h3 style={{ color: '#888', marginBottom: 12 }}>Em breve</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
              {indisponiveis.map(linha => (
                <div
                  key={linha.id}
                  style={{
                    border: '2px solid #eee',
                    borderRadius: 10,
                    padding: '16px 12px',
                    background: '#f9f9f9',
                    opacity: 0.6,
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#aaa' }}>{linha.nome}</div>
                  <div style={{ fontSize: 13, color: '#bbb', marginTop: 4 }}>Em breve</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handleGerar}
            disabled={loading}
            style={{
              background: loading ? '#aaa' : '#1a3a6b',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Gerando...' : 'Gerar PDF'}
          </button>
          {progresso && <span style={{ color: '#555', fontSize: 14 }}>{progresso}</span>}
        </div>
      </div>
    </Layout>
  )
}
