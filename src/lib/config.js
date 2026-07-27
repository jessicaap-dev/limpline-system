import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const USERS = [
{ id: 1, name: 'Jéssica', email: 'jessica@limplinecomercial.com.br', role: 'admin', genero: 'f' },
{ id: 2, name: 'Romilda', email: 'romilda@limplinecomercial.com.br', role: 'vendedora', genero: 'f' },
{ id: 3, name: 'Juliana', email: 'juliana@limplinecomercial.com.br', role: 'vendedora', genero: 'f' },
{ id: 4, name: 'Marcos', email: 'marcos@limplinecomercial.com.br', role: 'vendedora', genero: 'm' },
{ id: 5, name: 'Cintia', email: 'cintia@limplinecomercial.com.br', role: 'vendedora', genero: 'f' },
{ id: 6, name: 'Filipe', email: 'filipe@limplinecomercial.com.br', role: 'vendedora', genero: 'm' },
{ id: 7, name: 'Alessandra', email: 'alessandra@limplinecomercial.com.br', role: 'vendedora', genero: 'f' },
{ id: 8, name: 'Sarah', email: 'sarah@limplinecomercial.com.br', role: 'vendedora', genero: 'f' },
]

export const PRODUCTS = [
// PAPEL TOALHA
{ id: 1, name: 'Papel Toalha Bobina Folha Dupla 6x20x150 mts', units: ['Fardo'], categoria: 'Papel Toalha', codigo: '1152', precoDefault: 185 },
{ id: 2, name: 'Papel Toalha Bobina 6x20x200 mts Celulose', units: ['Fardo'], categoria: 'Papel Toalha', codigo: '1026', precoDefault: 197 },
{ id: 3, name: 'Papel Toalha Bobina 6x20x200 mts Premium', units: ['Fardo'], categoria: 'Papel Toalha', codigo: '1', precoDefault: 169 },
{ id: 4, name: 'Papel Toalha Interfolha com 4.800 folhas Luxo', units: ['Caixa'], categoria: 'Papel Toalha', codigo: '17', precoDefault: 196 },
{ id: 5, name: 'Papel Toalha Interfolha com 4.800 folhas Premium', units: ['Caixa'], categoria: 'Papel Toalha', codigo: '16', precoDefault: 169 },
{ id: 6, name: 'Papel Toalha Interfolha Folha Dupla com 2.400 folhas',units: ['Fardo'], categoria: 'Papel Toalha', codigo: '14', precoDefault: 259 },
{ id: 7, name: 'Papel Toalha Interfolha Folha Dupla com 2.000 folhas',units: ['Fardo'], categoria: 'Papel Toalha', codigo: '970', precoDefault: 133 },
// PAPEL HIGIÊNICO
{ id: 8, name: 'Papel Higiênico Cai-Cai com 8.000 folhas', units: ['Caixa'], categoria: 'Papel Higiênico' },
{ id: 9, name: 'Papel Higiênico Rolão 8x300 mts Luxo', units: ['Fardo'], categoria: 'Papel Higiênico', codigo: '40', precoDefault: 113 },
{ id: 10, name: 'Papel Higiênico Rolão 8x300 mts Premium', units: ['Fardo'], categoria: 'Papel Higiênico', codigo: '804', precoDefault: 146 },
{ id: 11, name: 'Papel Higiênico Rolão Folha Dupla 8x240 mts', units: ['Fardo'], categoria: 'Papel Higiênico', codigo: '981', precoDefault: 196 },
// SABONETE
{ id: 12, name: 'Sabonete Espuma Sachê', units: ['Caixa','Unidade'], categoria: 'Sabonete' },
{ id: 13, name: 'Sabonete Espuma Antisséptico', units: ['Caixa','Unidade'], categoria: 'Sabonete' },
{ id: 14, name: 'Sabonete Espuma Galão com 5 lts', units: ['Caixa','Unidade'], categoria: 'Sabonete' },
{ id: 15, name: 'Sabonete Cremoso Galão com 5 lts', units: ['Caixa','Unidade'], categoria: 'Sabonete' },
// ÁLCOOL
{ id: 16, name: 'Álcool Gel Sachê com 800 ml', units: ['Caixa','Unidade'], categoria: 'Álcool' },
{ id: 17, name: 'Álcool Spray Sachê com 800 ml', units: ['Caixa','Unidade'], categoria: 'Álcool' },
{ id: 18, name: 'Álcool Gel Galão com 5 lts', units: ['Caixa','Unidade'], categoria: 'Álcool' },
// OUTROS
{ id: 19, name: 'Protetor de Assento Sanitário com 86 folhas', units: ['Caixa','Pacote'], categoria: 'Outros' },
{ id: 20, name: 'Saquinho para Absorvente com 25 unidades', units: ['Caixa','Pacote'], categoria: 'Outros' },
// REFIS
{ id: 21, name: 'Refil FreeCo', units: ['Unidade'], categoria: 'Refis' },
{ id: 22, name: 'Odorizador Refil', units: ['Unidade'], categoria: 'Refis' },
// EQUIPAMENTOS (para venda)
{ id: 23, name: 'Toalheiro Bobina Auto Corte', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 24, name: 'Saboneteira Espuma', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 25, name: 'Saboneteira Reservatório', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 26, name: 'Suporte Papel Higiênico Rolão', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 27, name: 'Toalheiro Interfolha', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 28, name: 'Suporte Papel Higiênico Cai-Cai', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 29, name: 'Dispenser Álcool Spray', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 30, name: 'Dispenser Álcool Gel', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 31, name: 'Suporte Protetor de Assento Sanitário', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 32, name: 'Suporte Descarte de Absorvente', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 33, name: 'Dispenser FreeCo', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 34, name: 'Kit Enxaguante Bucal (Enxaguante, Fio Dental e Porta Copos)', units: ['Unidade'], categoria: 'Equipamentos' },
{ id: 35, name: 'Desodorizador de Ambiente', units: ['Unidade'], categoria: 'Equipamentos' },
]

export const COMODATO_DEFAULT = [
{ name: 'Toalheiro Bobina Auto Corte', qty: 1 },
{ name: 'Saboneteira Espuma', qty: 1 },
{ name: 'Saboneteira Reservatório', qty: 1 },
{ name: 'Suporte Papel Higiênico Rolão', qty: 1 },
{ name: 'Toalheiro Interfolha', qty: 1 },
{ name: 'Suporte Papel Higiênico Cai-Cai', qty: 1 },
{ name: 'Dispenser Álcool Spray', qty: 1 },
{ name: 'Dispenser Álcool Gel', qty: 1 },
{ name: 'Suporte Protetor de Assento Sanitário', qty: 1 },
{ name: 'Suporte Descarte de Absorvente', qty: 1 },
{ name: 'Dispenser FreeCo', qty: 1 },
{ name: 'Kit Enxaguante Bucal (Enxaguante, Fio Dental e Porta Copos)', qty: 1 },
{ name: 'Desodorizador de Ambiente', qty: 1 },
]

export function pluralUnit(unit, qty) {
return !unit || qty <= 1 ? (unit || '') : ({ 'Unidade': 'Unidades', 'Caixa': 'Caixas', 'Fardo': 'Fardos', 'Pacote': 'Pacotes' }[unit] || unit)
}

export function fmtBRL(v) {
return 'R$ ' + parseFloat(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function fmtDate(d) {
return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
