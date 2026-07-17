import { jsPDF } from 'jspdf'
import { fmtBRL } from './config'

const AZUL = [26, 58, 107]
const AZUL_M = [46, 95, 171]
const AMARELO = [245, 196, 0]
const CINZA = [100, 100, 100]
const PRETO = [30, 30, 30]
const W = 210
const M = 18

function limpar(s) {
  if (!s) return ''
  return String(s)
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
}

function pluralUnit(unit, qty) {
  if (!unit || qty <= 1) return unit || ''
  const map = { 'Unidade': 'Unidades', 'Caixa': 'Caixas', 'Fardo': 'Fardos', 'Pacote': 'Pacotes' }
  return map[unit] || unit
}

function justified(doc, text, x, w, y, lh) {
  const lines = doc.splitTextToSize(text, w)
  lines.forEach((line, idx) => {
    const isLast = idx === lines.length - 1
    if (isLast || !line.trim()) { doc.text(line, x, y) }
    else {
      const words = line.trim().split(' ')
      if (words.length <= 1) { doc.text(line, x, y) }
      else {
        const tw = words.reduce((s, ww) => s + doc.getTextWidth(ww), 0)
        const sp = (w - tw) / (words.length - 1)
        let cx = x
        words.forEach(ww => { doc.text(ww, cx, y); cx += doc.getTextWidth(ww) + sp })
      }
    }
    y += lh
  })
  return y
}

async function loadLogo() {
  try {
    const r = await fetch('https://raw.githubusercontent.com/jessicaap-dev/limpline-system/main/public/logo.png')
    const blob = await r.blob()
    return new Promise(res => { const fr = new FileReader(); fr.onloadend = () => res(fr.result); fr.readAsDataURL(blob) })
  } catch { return null }
}

function addWatermark(doc, logo) {
  if (!logo) return
  try {
    const pw = 210, ph = 297
    const iw = 60, ih = 40
    const x = (pw - iw) / 2
    const y = (ph - ih) / 2
    doc.setGState(new doc.GState({ opacity: 0.06 }))
    doc.addImage(logo, 'PNG', x, y, iw, ih)
    doc.setGState(new doc.GState({ opacity: 1 }))
  } catch {}
}

function header(doc, logo) {
  doc.setFillColor(...AZUL)
  doc.rect(0, 0, W, 26, 'F')
  if (logo) { try { doc.addImage(logo, 'PNG', M, 3, 28, 20) } catch {} }
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text('LIMPLINE COMERCIAL', M + 32, 11)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(181, 212, 244)
  doc.text('Dispensers · Papéis · Comodato', M + 32, 17)
  doc.setFontSize(7.5); doc.setTextColor(255, 255, 255)
  doc.text('(11) 2335-3500 | limplinecomercial.com.br | vendas@limplinecomercial.com.br', W - M, 22, { align: 'right' })
  doc.setFillColor(...AMARELO)
  doc.rect(0, 26, W, 0.85, 'F')
}

function footer(doc) {
  const ph = doc.internal.pageSize.height
  doc.setFillColor(...AMARELO)
  doc.rect(0, ph - 14, W, 0.5, 'F')
  doc.setFontSize(7); doc.setTextColor(...CINZA)
  doc.text('Av. Prof. Sylla Mattos, 68 - Jd. Santa Cruz - CEP 04182-010 - São Paulo - SP', W / 2, ph - 9, { align: 'center' })
  doc.text('vendas@limplinecomercial.com.br | (11) 2335-3500', W / 2, ph - 5, { align: 'center' })
}

function contratoPages(doc, data, logo) {
  let y = 36
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
  doc.text('MINUTA DE CONTRATO DE COMODATO', W / 2, y, { align: 'center' }); y += 4
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
  doc.text('Instrumento Particular de Contrato de Comodato de Equipamentos de Higiene', W / 2, y, { align: 'center' }); y += 10

  const comodatario = limpar(data.empresa || data.cliente || '')
  const cnpj = limpar(data.cnpj || '')

  const clausulas = [
    ['CLÁUSULA 1ª - DAS PARTES',
      'COMODANTE: LIMPLINE COMERCIAL LTDA - Inscrita no CNPJ sob o nº 62.563.688/0001-75, com sede na Av. Prof. Sylla Mattos, 68, Jardim Santa Cruz, São Paulo/SP, CEP 04182-010, doravante denominada COMODANTE.\n\nCOMODATÁRIO: ' + comodatario + (cnpj ? ' - CNPJ nº ' + cnpj : '') + ', doravante denominado COMODATÁRIO.\n\nEquipamentos objeto do presente contrato: ' + (data.comodato || []).filter(e => e.nome || e.name).map(e => (e.nome || e.name) + ' (' + (e.qty || 1) + ' un.)').join(', ') + '.'],
    ['CLÁUSULA 2ª - DO OBJETO',
      'O presente contrato tem por objeto o empréstimo gratuito (comodato) dos equipamentos dispensers de higiene descritos na Cláusula 1ª, de propriedade exclusiva da COMODANTE, para uso exclusivo nas dependências do COMODATÁRIO, pelo prazo de 12 (doze) meses, renovável automaticamente por igual período, salvo manifestação contrária de qualquer das partes com antecedência mínima de 30 (trinta) dias.\n\n§1º Os equipamentos serão instalados gratuitamente pela COMODANTE, que também realizará a manutenção preventiva e corretiva sem custo adicional ao COMODATÁRIO, desde que os danos não sejam decorrentes de mau uso, negligência ou ação de terceiros.\n\n§2º A COMODANTE realizará visita técnica para simulação e planejamento dos espaços antes da instalação dos equipamentos.'],
    ['CLÁUSULA 3ª - DAS OBRIGAÇÕES DO COMODATÁRIO',
      'a) Utilizar os equipamentos exclusivamente para os fins previstos neste contrato;\nb) Adquirir os insumos (papéis, sabonetes e refis) exclusivamente dos fornecidos pela COMODANTE, nas quantidades e frequência necessárias ao bom funcionamento dos equipamentos;\nc) Conservar os equipamentos em perfeito estado, responsabilizando-se por danos causados por mau uso;\nd) Comunicar imediatamente a COMODANTE qualquer avaria, defeito ou problema nos equipamentos;\ne) Permitir o acesso dos técnicos da COMODANTE para realização de manutenção;\nf) Devolver os equipamentos ao término do contrato em perfeito estado de conservação, salvo desgaste natural decorrente do uso.'],
    ['CLÁUSULA 4ª - DAS OBRIGAÇÕES DA COMODANTE',
      'a) Fornecer os equipamentos em perfeito estado de funcionamento e higiene;\nb) Realizar a instalação gratuita com treinamento da equipe do COMODATÁRIO;\nc) Realizar manutenção corretiva em até 5 (cinco) dias úteis após a comunicação do problema;\nd) Substituir equipamentos com defeito de fabricação sem custo ao COMODATÁRIO;\ne) Garantir o abastecimento regular dos insumos solicitados, com entrega em até 2 (dois) dias úteis;\nf) Personalizar os equipamentos com a logomarca do COMODATÁRIO, quando solicitado.'],
    ['CLÁUSULA 5ª - DA RESCISÃO',
      'O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio por escrito com antecedência mínima de 30 (trinta) dias.\n\nParágrafo único: O descumprimento pelo COMODATÁRIO da obrigação de aquisição exclusiva dos insumos da COMODANTE por período superior a 60 (sessenta) dias ensejará a rescisão imediata do contrato, com a devolução dos equipamentos no prazo de 5 (cinco) dias úteis.'],
    ['CLÁUSULA 6ª - DAS DISPOSIÇÕES GERAIS',
      'O presente contrato é regido pela legislação brasileira, especialmente pelos artigos 579 a 585 do Código Civil Brasileiro. As partes elegem o foro da comarca de São Paulo/SP, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias oriundas do presente instrumento.'],
  ]

  clausulas.forEach(([titulo, texto]) => {
    if (y > 245) { footer(doc); doc.addPage(); header(doc, logo); addWatermark(doc, logo); y = 36 }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
    doc.text(titulo, M, y); y += 5
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    y = justified(doc, limpar(texto), M, W - M * 2, y, 5) + 5
  })

  if (y > 210) { footer(doc); doc.addPage(); header(doc, logo); addWatermark(doc, logo); y = 36 }
  y += 8
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  doc.text('São Paulo, ' + (data.data || new Date().toLocaleDateString('pt-BR')), M, y); y += 10
  doc.setDrawColor(...AZUL)
  doc.line(M, y, M + 75, y)
  doc.line(W - M - 75, y, W - M, y); y += 4
  doc.setFontSize(8); doc.setTextColor(...CINZA)
  doc.text('COMODANTE', M + 20, y)
  doc.text('COMODATÁRIO', W - M - 40, y); y += 3
  doc.text('LIMPLINE COMERCIAL LTDA', M, y)
  doc.text(comodatario, W - M, y, { align: 'right' }); y += 10
  doc.line(M, y, M + 75, y)
  doc.line(W - M - 75, y, W - M, y); y += 4
  doc.setFontSize(8); doc.setTextColor(...CINZA)
  doc.text('TESTEMUNHA 1', M + 20, y)
  doc.text('TESTEMUNHA 2', W - M - 40, y); y += 3
  doc.text('Nome: ___________________________', M, y)
  doc.text('Nome: ___________________________', W - M, y, { align: 'right' }); y += 4
  doc.text('CPF: ____________________________', M, y)
  doc.text('CPF: ____________________________', W - M, y, { align: 'right' })
  footer(doc)
}

export async function generateProposta(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logo = await loadLogo()

  // PAGINA 1 - Proposta
  header(doc, logo)
  addWatermark(doc, logo)
  let y = 36

  const titulo = data.tipoProposta === 'equipamentos' ? 'PROPOSTA DE VENDA DE EQUIPAMENTOS' : 'PROPOSTA DE COMODATO'
  doc.setFillColor(...AMARELO)
  doc.rect(M, y, W - M * 2, 8, 'F')
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
  doc.text(titulo, W / 2, y + 5.5, { align: 'center' }); y += 13

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  doc.text('A: ' + limpar(data.empresa || data.cliente || ''), M, y)
  doc.text('Data: ' + (data.data || ''), W - M, y, { align: 'right' }); y += 5
  doc.text('Att. ' + limpar(data.nome || data.att || '') + ' | CNPJ: ' + limpar(data.cnpj || ''), M, y)
  doc.text('Validade: ' + (data.validade || '15 dias'), W - M, y, { align: 'right' }); y += 10

  const intro = data.tipoProposta === 'equipamentos'
    ? 'A Limpline oferece equipamentos modernos de higiene corporativa, desenvolvidos para garantir praticidade, durabilidade e eficiência no dia a dia das empresas.\n\nNossa linha de produtos atende diferentes necessidades de ambientes corporativos, contribuindo para espaços mais organizados, higiênicos e funcionais.\n\nA Limpline é referência em soluções práticas para higiene corporativa, oferecendo qualidade e confiança em cada produto.'
    : 'A Limpline oferece um completo Sistema de Comodato, disponibilizando equipamentos modernos e personalizados de higiene sem custo de aquisição. Nossa proposta é simples: você recebe os dispensers instalados gratuitamente, com treinamento da equipe, e adquire apenas os insumos necessários para o funcionamento.\n\nRealizamos uma simulação dos espaços antes da instalação, garantindo o melhor aproveitamento e estética para o ambiente da sua empresa.\n\nCom mais de 20 anos no mercado, a Limpline é referência em soluções práticas e econômicas para higiene corporativa, atendendo restaurantes, hospitais, escritórios, escolas e muito mais.'

  doc.setFontSize(9)
  y = justified(doc, limpar(intro), M, W - M * 2, y, 5.5); y += 6

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
  doc.text('Nossos diferenciais:', M, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  const difs = data.tipoProposta === 'equipamentos'
    ? [
        '• Equipamentos modernos e de alta qualidade;',
        '• Produtos resistentes e de excelente durabilidade;',
        '• Linha completa para higiene corporativa;',
        '• Entrega em até 2 dias úteis em toda Grande SP;',
        '• Atendimento especializado e suporte pós-venda.',
      ]
    : [
        '• Equipamentos personalizados com a logomarca da sua empresa;',
        '• Simulação dos espaços antes da instalação;',
        '• Treinamento da equipe para uso correto dos dispensers;',
        '• Entrega de insumos em até 2 dias úteis em toda Grande SP;',
        '• Manutenção corretiva realizada em até 5 dias úteis, sem custo.',
      ]
  difs.forEach(d => { doc.setFontSize(9); doc.text(d, M, y); y += 5 }); y += 3

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
  doc.text('Vendedora: ' + limpar(data.vendedora || ''), M, y); y += 10

  // Tabela comodato (pagina 1 - apenas equipamentos)
  const comodatoItens = (data.comodato || []).filter(e => e.nome || e.name)
  if (data.tipoProposta !== 'equipamentos' && comodatoItens.length > 0) {
    doc.setFillColor(...AZUL)
    doc.rect(M, y, W - M * 2, 7, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Suportes a serem instalados sem custo', M + 2, y + 4.5); y += 9
    const cw2 = [130, 26]
    doc.setFillColor(230, 236, 245); doc.rect(M, y, W - M * 2, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
    doc.text('Tipo de suporte', M + 2, y + 4)
    doc.text('Qtd.', M + cw2[0] + 13, y + 4, { align: 'center' })
    y += 7; doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    comodatoItens.forEach((eq, idx) => {
      if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(M, y - 1, W - M * 2, 6, 'F') }
      doc.setFontSize(8)
      doc.text(limpar(eq.nome || eq.name || ''), M + 2, y + 3)
      doc.text(String(eq.qty || 1), M + cw2[0] + 13, y + 3, { align: 'center' })
      y += 6
    }); y += 4
  }

  footer(doc)

  // PAGINA 2 - Tabela de produtos/precos
  const produtos = data.produtos || data.items || []
  if (produtos.length > 0) {
    doc.addPage(); header(doc, logo); addWatermark(doc, logo); y = 36
    doc.setFillColor(...AZUL)
    doc.rect(M, y, W - M * 2, 7, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Valores e sugestão do pedido', M + 2, y + 4.5); y += 9
    const cw = [90, 28, 28, 28]
    doc.setFillColor(230, 236, 245); doc.rect(M, y, W - M * 2, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
    let cx = M + 2
    ;['Produto', 'Qtd.', 'Unit.', 'Total'].forEach((h, i) => {
      doc.text(h, cx, y + 4, { align: i === 0 ? 'left' : 'center' }); cx += cw[i]
    })
    y += 7; doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    let total = 0
    produtos.forEach((item, idx) => {
      if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(M, y - 1, W - M * 2, 6, 'F') }
      const preco = item.preco || item.price || 0
      const qty = item.qty || 1
      const sub = qty * preco; total += sub
      cx = M + 2; doc.setFontSize(8)
      doc.text(limpar(item.name || item.nome || ''), cx, y + 3); cx += cw[0]
      doc.text(qty + ' ' + pluralUnit(item.unit, qty), cx, y + 3, { align: 'center' }); cx += cw[1]
      doc.text(fmtBRL(preco), cx, y + 3, { align: 'center' }); cx += cw[2]
      doc.text(fmtBRL(sub), cx, y + 3, { align: 'center' }); y += 6
    })
    if (data.mostrarTotal !== false && data.showTotal !== false) {
      doc.setFillColor(...AZUL); doc.rect(M, y, W - M * 2, 7, 'F')
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
      doc.text('Total do pedido:', M + 2, y + 4.5)
      doc.text(fmtBRL(total), W - M - 2, y + 4.5, { align: 'right' }); y += 10
    }
    footer(doc)
  }

  // Contrato (pagina separada)
  if (data.tipoProposta !== 'equipamentos' && data.incluirContrato) {
    doc.addPage(); header(doc, logo); addWatermark(doc, logo)
    contratoPages(doc, data, logo)
  }

  doc.save('Proposta_Limpline.pdf')
  return 'Proposta_Limpline.pdf'
}

export async function generateContrato(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logo = await loadLogo()
  header(doc, logo)
  addWatermark(doc, logo)
  contratoPages(doc, data, logo)
  doc.save('Contrato_Limpline.pdf')
  return 'Contrato_Limpline.pdf'
}
