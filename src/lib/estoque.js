import { supabase } from './config'

export async function fetchEstoque() {
  const { data, error } = await supabase
    .from('estoque_equipamentos')
    .select('*')
    .order('marca', { ascending: true })
    .order('equipamento', { ascending: true })
    .order('cor', { ascending: true })
  if (error) { console.error('Erro ao buscar estoque:', error); return [] }
  return data
}

export async function addEstoqueItem(item) {
  const { error } = await supabase.from('estoque_equipamentos').insert(item)
  if (error) throw error
}

export async function updateEstoqueItem(id, fields) {
  const { error } = await supabase.from('estoque_equipamentos').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function removerEstoqueItem(id) {
  const { error } = await supabase.from('estoque_equipamentos').delete().eq('id', id)
  if (error) throw error
}

// Total de unidades = avulsas na prateleira + o que está fechado em caixa.
export function totalUnidades(item) {
  return (item.qtd_avulsa || 0) + (item.qtd_caixas || 0) * (item.unidades_por_caixa || 1)
}

// Valor investido nesse item = total de unidades × custo unitário real.
export function valorInvestido(item) {
  if (!item.custo_unitario) return 0
  return totalUnidades(item) * item.custo_unitario
}

// Agrupa os itens por marca (mantendo a ordem em que aparecem — já vem
// ordenado por marca/equipamento/cor do fetchEstoque), pra render em seções
// e permitir subtotal de unidades/valor investido por marca na tela.
export function agruparPorMarca(itens) {
  const grupos = []
  const porNome = {}
  for (const item of itens) {
    const marca = item.marca || 'Sem marca'
    if (!porNome[marca]) {
      porNome[marca] = { marca, itens: [] }
      grupos.push(porNome[marca])
    }
    porNome[marca].itens.push(item)
  }
  return grupos.map(g => ({
    ...g,
    totalUnidades: g.itens.reduce((s, i) => s + totalUnidades(i), 0),
    valorInvestido: g.itens.reduce((s, i) => s + valorInvestido(i), 0),
    faltaCusto: g.itens.some(i => !i.custo_unitario),
  }))
}
