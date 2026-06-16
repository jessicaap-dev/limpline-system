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
  { id: 1, name: 'Papel Toalha Bobina Folha Dupla 6x20x150 mts', units: ['Fardo'] },
  { id: 2, name: 'Papel Toalha Bobina 6x20x200 mts Celulose', units: ['Fardo'] },
  { id: 3, name: 'Papel Toalha Bobina 6x20x200 mts Premium', units: ['Fardo'] },
  { id: 4, name: 'Papel Toalha Interfolha com 4.800 folhas Luxo', units: ['Caixa'] },
  { id: 5, name: 'Papel Toalha Interfolha com 4.800 folhas Premium', units: ['Caixa'] },
  { id: 6, name: 'Papel Toalha Interfolha Folha Dupla com 2.000 folhas', units: ['Caixa'] },
  { id: 7, name: 'Papel Higiênico Cai-Cai com 8.000 folhas', units: ['Caixa'] },
  { id: 8, name: 'Papel Higiênico Rolão 8x300 mts Luxo', units: ['Fardo'] },
  { id: 9, name: 'Papel Higiênico Rolão 8x300 mts Premium', units: ['Fardo'] },
  { id: 10, name: 'Papel Higiênico Rolão Folha Dupla 8x240 mts', units: ['Fardo'] },
  { id: 11, name: 'Sabonete Espuma Sache', units: ['Caixa', 'Unidade'] },
  { id: 12, name: 'Sabonete Espuma Galão com 5 lts', units: ['Caixa', 'Unidade'] },
  { id: 13, name: 'Sabonete Cremoso Galão com 5 lts', units: ['Caixa', 'Unidade'] },
  { id: 14, name: 'Álcool Gel Sache com 800 ml', units: ['Caixa', 'Unidade'] },
  { id: 15, name: 'Álcool Gel Galão com 5 lts', units: ['Caixa', 'Unidade'] },
  { id: 16, name: 'Protetor de Assento Sanitário com 86 folhas', units: ['Caixa', 'Pacote'] },
  { id: 17, name: 'Saquinho para Absorvente com 25 unidades', units: ['Caixa', 'Pacote'] },
  { id: 18, name: 'Refil FreeCo', units: ['Unidade'] },
  { id: 19, name: 'Odorizador Refil', units: ['Unidade'] },
]

export const COMODATO_DEFAULT = [
  { name: 'Desodorizador de Ambiente', qty: 1 },
  { name: 'Dispenser FreeCo', qty: 1 },
  { name: 'Dispenser para Álcool Gel', qty: 1 },
  { name: 'Dispenser para Álcool Spray', qty: 1 },
  { name: 'Kit Enxaguante Bucal (Enxaguante, Fio Dental e Porta Copos)', qty: 1 },
  { name: 'Porta Copos', qty: 1 },
  { name: 'Saboneteira Espuma', qty: 1 },
  { name: 'Saboneteira Galão', qty: 1 },
  { name: 'Suporte para Descarte Plástico de Absorvente', qty: 1 },
  { name: 'Suporte para Papel Higiênico Cai-Cai', qty: 1 },
  { name: 'Suporte para Papel Higiênico Rolão', qty: 1 },
  { name: 'Suporte para Protetor de Assento Sanitário', qty: 1 },
  { name: 'Toalheiro Bobina Auto Corte', qty: 1 },
  { name: 'Toalheiro Interfolha', qty: 1 },
]

export function fmtBRL(v) {
  return 'R$ ' + parseFloat(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
