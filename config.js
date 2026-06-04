import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const USERS = [
  { id: 1, name: 'Jéssica', email: 'jessica@limplinecomercial.com.br', role: 'admin' },
  { id: 2, name: 'Romilda', email: 'romilda@limplinecomercial.com.br', role: 'vendedora' },
  { id: 3, name: 'Juliana', email: 'juliana@limplinecomercial.com.br', role: 'vendedora' },
  { id: 4, name: 'Marcos', email: 'marcos@limplinecomercial.com.br', role: 'vendedora' },
  { id: 5, name: 'Cintia', email: 'cintia@limplinecomercial.com.br', role: 'vendedora' },
  { id: 6, name: 'Filipe', email: 'filipe@limplinecomercial.com.br', role: 'vendedora' },
  { id: 7, name: 'Alessandra', email: 'alessandra@limplinecomercial.com.br', role: 'vendedora' },
  { id: 8, name: 'Sarah', email: 'sarah@limplinecomercial.com.br', role: 'vendedora' },
]

export const PRODUCTS = [
  { id: 1, name: 'Toalheiro interfolhado', cat: 'Dispenser', unit: 'un' },
  { id: 2, name: 'Saboneteira espuma', cat: 'Dispenser', unit: 'un' },
  { id: 3, name: 'Saboneteira álcool gel', cat: 'Dispenser', unit: 'un' },
  { id: 4, name: 'Suporte higiênico cai-cai', cat: 'Dispenser', unit: 'un' },
  { id: 5, name: 'Suporte higiênico rolão', cat: 'Dispenser', unit: 'un' },
  { id: 6, name: 'Toalheiro bobina auto corte', cat: 'Dispenser', unit: 'un' },
  { id: 7, name: 'Suporte descarte absorvente', cat: 'Dispenser', unit: 'un' },
  { id: 8, name: 'Suporte assento sanitário', cat: 'Dispenser', unit: 'un' },
  { id: 9, name: 'Enxaguante bucal', cat: 'Dispenser', unit: 'un' },
  { id: 10, name: 'Aparelho odorizador', cat: 'Dispenser', unit: 'un' },
  { id: 11, name: 'Porta copos', cat: 'Dispenser', unit: 'un' },
  { id: 12, name: 'Papel toalha interfolhado c/2400 FD', cat: 'Papel', unit: 'cx' },
  { id: 13, name: 'Papel higiênico cai-cai c/8000 FD', cat: 'Papel', unit: 'cx' },
  { id: 14, name: 'Papel higiênico rolão 300m c/8', cat: 'Papel', unit: 'pct' },
  { id: 15, name: 'Papel toalha bobina 200m c/6', cat: 'Papel', unit: 'pct' },
  { id: 16, name: 'Papel higiênico interfolhado c/8000', cat: 'Papel', unit: 'cx' },
  { id: 17, name: 'Refil sabonete espuma 6x500ml', cat: 'Refil', unit: 'cx' },
  { id: 18, name: 'Refil álcool gel 6x500ml', cat: 'Refil', unit: 'cx' },
  { id: 19, name: 'Refil saco descarte absorvente c/25', cat: 'Refil', unit: 'cx' },
  { id: 20, name: 'Refil assento sanitário c/40', cat: 'Refil', unit: 'cx' },
  { id: 21, name: 'Refil enxaguante bucal 1L', cat: 'Refil', unit: 'un' },
  { id: 22, name: 'Refil odorizador ambiente', cat: 'Refil', unit: 'un' },
  { id: 23, name: 'Refil fio dental 200m', cat: 'Refil', unit: 'un' },
  { id: 24, name: 'Pano multiuso bobina verde', cat: 'Outros', unit: 'pct' },
  { id: 25, name: 'Pano multiuso bobina azul', cat: 'Outros', unit: 'pct' },
  { id: 26, name: 'Saco de lixo preto reforçado', cat: 'Outros', unit: 'pct' },
]

export const COMODATO_DEFAULT = [
  { name: 'Toalheiro interfolhado', qty: 1 },
  { name: 'Saboneteira espuma', qty: 1 },
  { name: 'Suporte higiênico cai-cai', qty: 1 },
  { name: 'Aparelho odorizador', qty: 1 },
  { name: 'Suporte assento sanitário', qty: 1 },
  { name: 'Suporte descarte absorvente', qty: 1 },
  { name: 'Enxaguante bucal', qty: 1 },
]

export function fmtBRL(v) {
  return 'R$ ' + parseFloat(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
