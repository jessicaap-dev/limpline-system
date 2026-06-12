const BASE = 'https://raw.githubusercontent.com/jessicaap-dev/limpline-system/main/public/catalogo'

// Para adicionar uma nova linha:
// 1. Suba as fotos (JPG, 1080x1350) em public/catalogo/<id-da-linha>/
// 2. Adicione ou atualize a linha abaixo com disponivel: true e a lista de fotos
export const LINHAS_CATALOGO = [
  {
    id: 'elegance-preta',
    nome: 'Elegance Preta',
    disponivel: true,
    fotos: [
      { file: 'capa.jpg', nome: 'Linha completa' },
      { file: 'toalheiro-bobina.jpg', nome: 'Toalheiro Bobina Auto Corte' },
      { file: 'toalheiro-interfolha.jpg', nome: 'Toalheiro Interfolha' },
      { file: 'suporte-rolao.jpg', nome: 'Suporte Papel Higiênico Rolão' },
      { file: 'suporte-cai-cai.jpg', nome: 'Suporte Papel Higiênico Cai-cai' },
      { file: 'saboneteira.jpg', nome: 'Saboneteira Espuma/Spray/Galão' },
      { file: 'descarte-absorvente.jpg', nome: 'Suporte Descarte de Absorvente' },
      { file: 'protetor-assento.jpg', nome: 'Suporte Protetor de Assento Sanitário' },
    ],
  },
  {
    id: 'luxo-branca',
    nome: 'Luxo Branca',
    disponivel: true,
    fotos: [
      { file: 'capa.jpg', nome: 'Linha completa' },
      { file: 'toalheiro-bobina.jpg', nome: 'Toalheiro Bobina Auto Corte' },
      { file: 'suporte-rolao.jpg', nome: 'Suporte Papel Higiênico Rolão' },
      { file: 'saboneteira.jpg', nome: 'Saboneteira' },
    ],
  },
  { id: 'elegance-branca', nome: 'Elegance Branca', disponivel: false, fotos: [] },
  { id: 'luxo-preta', nome: 'Luxo Preta', disponivel: false, fotos: [] },
  { id: 'luxo-inox', nome: 'Luxo Inox', disponivel: false, fotos: [] },
  { id: 'luxo-translucida', nome: 'Luxo Translúcida', disponivel: false, fotos: [] },
  { id: 'institucional', nome: 'Institucional', disponivel: false, fotos: [] },
]

export function fotoUrl(linhaId, file) {
  return `${BASE}/${linhaId}/${file}`
}
