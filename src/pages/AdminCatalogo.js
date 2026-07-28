import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { fmtBRL } from '../lib/config'
import { fetchCatalogoTodos, addCatalogoItem, updateCatalogoItem, setCatalogoItemAtivo } from '../lib/catalogoItens'

const LINHAS_SUGERIDAS = ['Linha Elegance (Branca ou Preta)', 'Luxo (Branca ou Preta)', 'Luxo Inox', 'Institucional (branca ou preta)']

export default function AdminCatalogo() {
  const [aba, setAba] = useState('equipamentos')

  return (
    <Layout title="Gestão de Catálogo">
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[['equipamentos', '🧰 Equipamentos'], ['produtos', '📦 Produtos']].map(([v, l]) => (
          <button key={v} onClick={() => setAba(v)}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid ' + (aba === v ? '#1A3A6B' : '#D0D8EC'), background: aba === v ? '#1A3A6B' : '#fff', color: aba === v ? '#fff' : '#555', fontSize: 13, fontWeight: aba === v ? 700 : 400, cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>
      {aba === 'equipamentos' ? <AbaEquipamentos /> : <AbaProdutos />}
    </Layout>
  )
}

function AbaProdutos() {
  return (
    <div style={{ color: '#888', fontSize: 13, padding: '1rem 0' }}>
      Gestão de Produtos vem em seguida — por enquanto, produtos ainda são editados direto no código pelo Claude Code.
    </div>
  )
}

function AbaEquipamentos() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarInativos, setMostrarInativos] = useState(false)
  const [novo, setNovo] = useState({ nome: '', linha: LINHAS_SUGERIDAS[0], valor_padrao: '' })
  const [salvandoNovo, setSalvandoNovo] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editNome, setEditNome] = useState('')
  const [editLinha, setEditLinha] = useState('')
  const [editValor, setEditValor] = useState('')

  async function carregar() {
    setLoading(true)
    const rows = await fetchCatalogoTodos('equipamento')
    setItens(rows)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function handleAdicionar() {
    if (!novo.nome.trim()) { alert('Preencha o nome do equipamento.'); return }
    setSalvandoNovo(true)
    try {
      await addCatalogoItem({
        tipo: 'equipamento',
        nome: novo.nome.trim(),
        linha: novo.linha,
        valor_padrao: novo.valor_padrao === '' ? null : parseFloat(novo.valor_padrao),
        ordem: itens.length + 1,
      })
      setNovo({ nome: '', linha: novo.linha, valor_padrao: '' })
      await carregar()
    } catch (e) { alert('Erro ao adicionar equipamento.'); console.error(e) }
    setSalvandoNovo(false)
  }

  function iniciarEdicao(item) {
    setEditId(item.id)
    setEditNome(item.nome)
    setEditLinha(item.linha || '')
    setEditValor(item.valor_padrao ?? '')
  }

  async function salvarEdicao(id) {
    try {
      await updateCatalogoItem(id, {
        nome: editNome.trim(),
        linha: editLinha,
        valor_padrao: editValor === '' ? null : parseFloat(editValor),
      })
      setEditId(null)
      await carregar()
    } catch (e) { alert('Erro ao salvar equipamento.'); console.error(e) }
  }

  async function alternarAtivo(item) {
    try {
      await setCatalogoItemAtivo(item.id, !item.ativo)
      await carregar()
    } catch (e) { alert('Erro ao atualizar equipamento.'); console.error(e) }
  }

  const visiveis = itens.filter(i => mostrarInativos || i.ativo)
  const linhas = Array.from(new Set(visiveis.map(i => i.linha || '(sem linha)')))

  if (loading) return <div style={{ color: '#888', fontSize: 13 }}>Carregando...</div>

  return (
    <div>
      <div style={{ background: '#F4F6FB', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 10 }}>+ Adicionar equipamento</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 0.8fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Nome</label>
            <input value={novo.nome} onChange={e => setNovo(n => ({ ...n, nome: e.target.value }))}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Linha</label>
            <input value={novo.linha} onChange={e => setNovo(n => ({ ...n, linha: e.target.value }))} list="linhas-sugeridas"
              style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }} />
            <datalist id="linhas-sugeridas">
              {LINHAS_SUGERIDAS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Valor (R$)</label>
            <input type="number" min="0" step="0.01" placeholder="A validar" value={novo.valor_padrao} onChange={e => setNovo(n => ({ ...n, valor_padrao: e.target.value }))}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleAdicionar} disabled={salvandoNovo}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: salvandoNovo ? 'not-allowed' : 'pointer' }}>
            {salvandoNovo ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: '1rem' }}>
        <input type="checkbox" checked={mostrarInativos} onChange={e => setMostrarInativos(e.target.checked)} />
        Mostrar equipamentos desativados
      </label>

      {linhas.map(linha => (
        <div key={linha} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1.5px solid #E8EDF5', paddingBottom: 6, marginBottom: 10 }}>
            {linha}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visiveis.filter(i => (i.linha || '(sem linha)') === linha).map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: item.ativo ? '#fff' : '#F8F8F8', border: '0.5px solid #E8EDF5', borderRadius: 8, padding: '8px 12px', opacity: item.ativo ? 1 : 0.6 }}>
                {editId === item.id ? (
                  <>
                    <input value={editNome} onChange={e => setEditNome(e.target.value)}
                      style={{ flex: 2, padding: '5px 8px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
                    <input value={editLinha} onChange={e => setEditLinha(e.target.value)} list="linhas-sugeridas"
                      style={{ flex: 1.4, padding: '5px 8px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
                    <input type="number" min="0" step="0.01" placeholder="A validar" value={editValor} onChange={e => setEditValor(e.target.value)}
                      style={{ width: 100, padding: '5px 8px', borderRadius: 6, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
                    <button onClick={() => salvarEdicao(item.id)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Salvar</button>
                    <button onClick={() => setEditId(null)} style={{ padding: '5px 12px', borderRadius: 6, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, fontSize: 13, color: '#1A1A2E' }}>{item.nome}</div>
                    <div style={{ width: 100, fontSize: 13, textAlign: 'right', color: item.valor_padrao ? '#333' : '#C0392B', fontWeight: item.valor_padrao ? 400 : 600 }}>
                      {item.valor_padrao ? fmtBRL(item.valor_padrao) : 'A validar'}
                    </div>
                    <button onClick={() => iniciarEdicao(item)} style={{ padding: '5px 12px', borderRadius: 6, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => alternarAtivo(item)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: item.ativo ? '#FEEEEE' : '#EAF3DE', color: item.ativo ? '#C0392B' : '#3B6D11', fontSize: 12, cursor: 'pointer' }}>
                      {item.ativo ? 'Desativar' : 'Reativar'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
