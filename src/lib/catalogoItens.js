import { supabase } from './config'

export async function fetchCatalogo(tipo) {
  const { data, error } = await supabase
    .from('catalogo_itens')
    .select('*')
    .eq('tipo', tipo)
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true })
  if (error) { console.error('Erro ao buscar catálogo:', error); return [] }
  return data
}

export async function fetchCatalogoTodos(tipo) {
  const { data, error } = await supabase
    .from('catalogo_itens')
    .select('*')
    .eq('tipo', tipo)
    .order('ativo', { ascending: false })
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true })
  if (error) { console.error('Erro ao buscar catálogo:', error); return [] }
  return data
}

export async function addCatalogoItem(item) {
  const { error } = await supabase.from('catalogo_itens').insert(item)
  if (error) throw error
}

export async function updateCatalogoItem(id, fields) {
  const { error } = await supabase.from('catalogo_itens').update(fields).eq('id', id)
  if (error) throw error
}

export async function setCatalogoItemAtivo(id, ativo) {
  const { error } = await supabase.from('catalogo_itens').update({ ativo }).eq('id', id)
  if (error) throw error
}

export function equipamentoParaProduto(row) {
  return {
    id: row.id,
    name: row.nome,
    categoria: row.linha,
    codigo: row.codigo || null,
    precoDefault: row.valor_padrao || 0,
    units: row.unidades && row.unidades.length ? row.unidades : ['Unidade'],
  }
}

export function produtoCatalogoParaProduto(row) {
  return {
    id: row.id,
    name: row.nome,
    categoria: row.categoria,
    codigo: row.codigo || null,
    precoDefault: row.valor_padrao || 0,
    units: row.unidades && row.unidades.length ? row.unidades : ['Unidade'],
  }
}
