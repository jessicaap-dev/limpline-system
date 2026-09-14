import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth'
import { fmtBRL } from '../lib/config'
import { fetchEstoque, addEstoqueItem, updateEstoqueItem, removerEstoqueItem, totalUnidades, valorInvestido, agruparPorMarca } from '../lib/estoque'

const EQUIPAMENTOS_SUGERIDOS = ['Saboneteira Espuma', 'Higiênico Rolão', 'Cai-Cai', 'Auto Corte', 'Interfolha', 'Porta Copos Café', 'Fio Dental', 'Enxaguante', 'Reservatório Espuma']
const CORES_SUGERIDAS = ['Preto', 'Preta', 'Branco', 'Branca', 'Velado', 'Velada']

const inputStyle = { width: '100%', padding: '6px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13, boxSizing: 'border-box' }
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }

export default function Estoque() {
  const { user } = useAuth()
  const ehJessica = user?.role === 'admin'
  // Marcos (id 4) também pode editar o custo unitário, além da Jéssica.
  const podeEditarCusto = ehJessica || user?.id === 4
  // Romilda (id 2) e Juliana (id 3) enxergam a tela e as quantidades
  // normalmente — só não podem ver nem custo unitário nem valor investido
  // (nem como leitura, diferente das outras vendedoras que veem mas não editam).
  const escondeValores = user?.id === 2 || user?.id === 3
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [novo, setNovo] = useState({ equipamento: '', cor: '', marca: 'Fortcom', qtd_avulsa: '', qtd_caixas: '', unidades_por_caixa: '1', custo_unitario: '' })
  const [salvandoNovo, setSalvandoNovo] = useState(false)
  const [editId, setEditId] = useState(null)
  const [edit, setEdit] = useState({})

  async function carregar() {
    setLoading(true)
    setItens(await fetchEstoque())
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function handleAdicionar() {
    if (!novo.equipamento.trim()) { alert('Preencha o equipamento.'); return }
    setSalvandoNovo(true)
    try {
      await addEstoqueItem({
        equipamento: novo.equipamento.trim(),
        cor: novo.cor.trim() || null,
        marca: novo.marca.trim() || 'Fortcom',
        qtd_avulsa: parseInt(novo.qtd_avulsa, 10) || 0,
        qtd_caixas: parseInt(novo.qtd_caixas, 10) || 0,
        unidades_por_caixa: parseInt(novo.unidades_por_caixa, 10) || 1,
        custo_unitario: podeEditarCusto && novo.custo_unitario !== '' ? parseFloat(novo.custo_unitario) : null,
      })
      setNovo({ equipamento: '', cor: '', marca: novo.marca, qtd_avulsa: '', qtd_caixas: '', unidades_por_caixa: '1', custo_unitario: '' })
      await carregar()
    } catch (e) { alert('Erro ao adicionar item.'); console.error(e) }
    setSalvandoNovo(false)
  }

  function iniciarEdicao(item) {
    setEditId(item.id)
    setEdit({
      equipamento: item.equipamento, cor: item.cor || '', marca: item.marca || 'Fortcom',
      qtd_avulsa: item.qtd_avulsa, qtd_caixas: item.qtd_caixas, unidades_por_caixa: item.unidades_por_caixa,
      custo_unitario: item.custo_unitario ?? '',
    })
  }

  async function salvarEdicao(id, custoOriginal) {
    try {
      const fields = {
        equipamento: edit.equipamento.trim(),
        cor: edit.cor.trim() || null,
        marca: edit.marca.trim() || 'Fortcom',
        qtd_avulsa: parseInt(edit.qtd_avulsa, 10) || 0,
        qtd_caixas: parseInt(edit.qtd_caixas, 10) || 0,
        unidades_por_caixa: parseInt(edit.unidades_por_caixa, 10) || 1,
      }
      // Custo unitário só é gravado se for Jéssica ou Marcos editando —
      // outros perfis podem estar com o campo aberto (leitura), mas o valor
      // original é preservado mesmo que o estado local tenha mudado.
      fields.custo_unitario = podeEditarCusto ? (edit.custo_unitario === '' ? null : parseFloat(edit.custo_unitario)) : custoOriginal
      await updateEstoqueItem(id, fields)
      setEditId(null)
      await carregar()
    } catch (e) { alert('Erro ao salvar item.'); console.error(e) }
  }

  async function remover(item) {
    if (!window.confirm(`Remover "${item.equipamento}${item.cor ? ' — ' + item.cor : ''}" do estoque?`)) return
    try {
      await removerEstoqueItem(item.id)
      await carregar()
    } catch (e) { alert('Erro ao remover item.'); console.error(e) }
  }

  const valorTotalInvestido = itens.reduce((s, i) => s + valorInvestido(i), 0)
  const totalGeralUnidades = itens.reduce((s, i) => s + totalUnidades(i), 0)
  const grupos = agruparPorMarca(itens)
  const marcasExistentes = [...new Set(itens.map(i => i.marca).filter(Boolean))]

  if (loading) return <Layout title="📦 Estoque de Equipamentos"><div style={{ color: '#888', fontSize: 13 }}>Carregando...</div></Layout>

  return (
    <Layout title="📦 Estoque de Equipamentos">
      <datalist id="marcas-existentes">{marcasExistentes.map(m => <option key={m} value={m} />)}</datalist>

      {/* Valor investido separado por marca — mais marcas só criam mais cards aqui.
          Romilda/Juliana não veem essa seção (não podem ver valores, só quantidades). */}
      {escondeValores ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>📦 Unidades por marca</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {grupos.map(g => (
              <div key={g.marca} style={{ background: '#F4F6FB', borderRadius: 12, padding: '0.85rem 1.1rem', minWidth: 150 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', marginBottom: 2 }}>{g.marca}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#1A3A6B' }}>{g.totalUnidades} unid.</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{g.itens.length} item(ns)</div>
              </div>
            ))}
            <div style={{ background: '#1A3A6B', borderRadius: 12, padding: '0.85rem 1.1rem', minWidth: 150 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#B5D4F4', marginBottom: 2 }}>Total geral</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>{totalGeralUnidades} unid.</div>
              <div style={{ fontSize: 11, color: '#B5D4F4', marginTop: 2 }}>{itens.length} item(ns)</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>💰 Valor investido por marca</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {grupos.map(g => (
              <div key={g.marca} style={{ background: '#F4F6FB', borderRadius: 12, padding: '0.85rem 1.1rem', minWidth: 150 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A6B', marginBottom: 2 }}>{g.marca}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#1A3A6B' }}>{fmtBRL(g.valorInvestido)}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{g.totalUnidades} unid. · {g.itens.length} item(ns){g.faltaCusto ? ' · custo incompleto' : ''}</div>
              </div>
            ))}
            <div style={{ background: '#1A3A6B', borderRadius: 12, padding: '0.85rem 1.1rem', minWidth: 150 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#B5D4F4', marginBottom: 2 }}>Total geral</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>{fmtBRL(valorTotalInvestido)}</div>
              <div style={{ fontSize: 11, color: '#B5D4F4', marginTop: 2 }}>{totalGeralUnidades} unid. · {itens.length} item(ns)</div>
            </div>
          </div>
          {!podeEditarCusto && <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>Custo unitário só pode ser alterado pela Jéssica ou Marcos.</div>}
        </div>
      )}

      <div style={{ background: '#F4F6FB', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 10 }}>+ Adicionar item ao estoque</div>
        <div style={{ display: 'grid', gridTemplateColumns: podeEditarCusto ? '1.6fr 1fr 0.9fr 0.7fr 0.7fr 0.8fr 0.9fr auto' : '1.6fr 1fr 0.9fr 0.7fr 0.7fr 0.8fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Equipamento</label>
            <input value={novo.equipamento} onChange={e => setNovo(n => ({ ...n, equipamento: e.target.value }))} list="equipamentos-sugeridos" style={inputStyle} />
            <datalist id="equipamentos-sugeridos">{EQUIPAMENTOS_SUGERIDOS.map(e => <option key={e} value={e} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Cor/Acabamento</label>
            <input value={novo.cor} onChange={e => setNovo(n => ({ ...n, cor: e.target.value }))} list="cores-sugeridas" style={inputStyle} />
            <datalist id="cores-sugeridas">{CORES_SUGERIDAS.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Marca</label>
            <input value={novo.marca} onChange={e => setNovo(n => ({ ...n, marca: e.target.value }))} list="marcas-existentes" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Avulsas</label>
            <input type="number" min="0" value={novo.qtd_avulsa} onChange={e => setNovo(n => ({ ...n, qtd_avulsa: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Caixas</label>
            <input type="number" min="0" value={novo.qtd_caixas} onChange={e => setNovo(n => ({ ...n, qtd_caixas: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Unid./caixa</label>
            <input type="number" min="1" value={novo.unidades_por_caixa} onChange={e => setNovo(n => ({ ...n, unidades_por_caixa: e.target.value }))} style={inputStyle} />
          </div>
          {podeEditarCusto && (
            <div>
              <label style={labelStyle}>Custo unit. (R$)</label>
              <input type="number" min="0" step="0.01" value={novo.custo_unitario} onChange={e => setNovo(n => ({ ...n, custo_unitario: e.target.value }))} style={inputStyle} />
            </div>
          )}
          <button onClick={handleAdicionar} disabled={salvandoNovo}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: salvandoNovo ? 'not-allowed' : 'pointer' }}>
            {salvandoNovo ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </div>

      {itens.length === 0 ? (
        <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>Nenhum item no estoque ainda.</div>
      ) : (
        // Uma tabela por marca, pra nunca mais misturar Fortcom/Nobre/etc. na
        // mesma listagem — cada seção já traz seu próprio subtotal no header.
        grupos.map(g => (
          <div key={g.marca} style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #1A3A6B' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3A6B' }}>{g.marca}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{g.itens.length} item(ns) · {g.totalUnidades} unidades{!escondeValores ? ` · ${fmtBRL(g.valorInvestido)}` : ''}</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #E8EDF5' }}>
                    {(escondeValores ? ['Equipamento', 'Cor', 'Avulsas', 'Em caixa', 'Total', ''] : ['Equipamento', 'Cor', 'Avulsas', 'Em caixa', 'Total', 'Custo unit.', 'Investido', '']).map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .6, color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.itens.map(item => (
                    <tr key={item.id} style={{ borderBottom: '0.5px solid #F1F4FB' }}>
                      {editId === item.id ? (
                        <>
                          <td style={{ padding: '6px 10px' }}><input value={edit.equipamento} onChange={e => setEdit(x => ({ ...x, equipamento: e.target.value }))} list="equipamentos-sugeridos" style={{ ...inputStyle, width: 140 }} /></td>
                          <td style={{ padding: '6px 10px' }}><input value={edit.cor} onChange={e => setEdit(x => ({ ...x, cor: e.target.value }))} list="cores-sugeridas" style={{ ...inputStyle, width: 90 }} /></td>
                          <td style={{ padding: '6px 10px' }}><input type="number" min="0" value={edit.qtd_avulsa} onChange={e => setEdit(x => ({ ...x, qtd_avulsa: e.target.value }))} style={{ ...inputStyle, width: 60 }} /></td>
                          <td style={{ padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center' }}>
                            <input type="number" min="0" value={edit.qtd_caixas} onChange={e => setEdit(x => ({ ...x, qtd_caixas: e.target.value }))} style={{ ...inputStyle, width: 50 }} title="Nº de caixas" />
                            <span style={{ color: '#999', fontSize: 11 }}>×</span>
                            <input type="number" min="1" value={edit.unidades_por_caixa} onChange={e => setEdit(x => ({ ...x, unidades_por_caixa: e.target.value }))} style={{ ...inputStyle, width: 50 }} title="Unidades por caixa" />
                          </td>
                          <td style={{ padding: '6px 10px', color: '#888' }}>{totalUnidades({ qtd_avulsa: parseInt(edit.qtd_avulsa, 10) || 0, qtd_caixas: parseInt(edit.qtd_caixas, 10) || 0, unidades_por_caixa: parseInt(edit.unidades_por_caixa, 10) || 1 })}</td>
                          {!escondeValores && (
                            <>
                              <td style={{ padding: '6px 10px' }}>
                                {podeEditarCusto
                                  ? <input type="number" min="0" step="0.01" value={edit.custo_unitario} onChange={e => setEdit(x => ({ ...x, custo_unitario: e.target.value }))} style={{ ...inputStyle, width: 80 }} />
                                  : <span style={{ color: '#888' }}>{item.custo_unitario ? fmtBRL(item.custo_unitario) : '—'}</span>}
                              </td>
                              <td style={{ padding: '6px 10px', color: '#888' }}>—</td>
                            </>
                          )}
                          <td style={{ padding: '6px 10px', display: 'flex', gap: 6 }}>
                            <button onClick={() => salvarEdicao(item.id, item.custo_unitario)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Salvar</button>
                            <button onClick={() => setEditId(null)} style={{ padding: '5px 10px', borderRadius: 6, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1A1A2E' }}>{item.equipamento}</td>
                          <td style={{ padding: '8px 10px', color: '#555' }}>{item.cor || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#555' }}>{item.qtd_avulsa || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#555' }}>{item.qtd_caixas > 0 ? `${item.qtd_caixas} cx × ${item.unidades_por_caixa}` : '—'}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1A3A6B' }}>{totalUnidades(item)}</td>
                          {!escondeValores && (
                            <>
                              <td style={{ padding: '8px 10px' }}>{item.custo_unitario ? fmtBRL(item.custo_unitario) : <span style={{ color: '#C0392B', fontWeight: 600 }}>A preencher</span>}</td>
                              <td style={{ padding: '8px 10px', color: '#333' }}>{item.custo_unitario ? fmtBRL(valorInvestido(item)) : '—'}</td>
                            </>
                          )}
                          <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => iniciarEdicao(item)} style={{ padding: '5px 10px', borderRadius: 6, border: '0.5px solid #D0D8EC', background: '#fff', fontSize: 12, cursor: 'pointer', marginRight: 6 }}>Editar</button>
                            {ehJessica && <button onClick={() => remover(item)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#FEEEEE', color: '#C0392B', fontSize: 12, cursor: 'pointer' }}>Remover</button>}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {itens.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: '10px 4px', borderTop: '1.5px solid #E8EDF5', fontSize: 12, fontWeight: 700, color: '#1A3A6B' }}>
          <span>Total geral: {totalGeralUnidades} unidades</span>
          {!escondeValores && <span>{fmtBRL(valorTotalInvestido)}</span>}
        </div>
      )}
    </Layout>
  )
}
