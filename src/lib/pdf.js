import { jsPDF } from 'jspdf'
import { fmtBRL } from './config'

function limparTexto(s) {
  if (!s) return s
  return s
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
}

function pluralUnit(unit, qty) {
  if (!unit || qty <= 1) return unit
  const map = { 'Unidade': 'Unidades', 'Caixa': 'Caixas', 'Fardo': 'Fardos', 'Pacote': 'Pacotes' }
  return map[unit] || unit
}

function textJustified(doc, text, x, lineWidth, y, lineHeight) {
  const lines = doc.splitTextToSize(text, lineWidth)
  lines.forEach((line, idx) => {
    const isLast = idx === lines.length - 1
    if (isLast || line.trim() === '') {
      doc.text(line, x, y)
    } else {
      const words = line.trim().split(' ')
      if (words.length <= 1) {
        doc.text(line, x, y)
      } else {
        const totalWordWidth = words.reduce((sum, w) => sum + doc.getTextWidth(w), 0)
        const totalSpace = lineWidth - totalWordWidth
        const spaceWidth = totalSpace / (words.length - 1)
        let curX = x
        words.forEach((word) => {
          doc.text(word, curX, y)
          curX += doc.getTextWidth(word) + spaceWidth
        })
      }
    }
    y += lineHeight
  })
  return y
}

const AZUL = [26, 58, 107]
const AZUL_M = [46, 95, 171]
const AMARELO = [245, 196, 0]
const CINZA = [100, 100, 100]
const PRETO = [30, 30, 30]
const W = 210
const M = 18

async function loadLogo() {
  const response = await fetch('https://raw.githubusercontent.com/jessicaap-dev/limpline-system/main/public/logo.png')
  const blob = await response.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

async function addWatermark(doc, logoData) {
  if (!logoData) return
  try {
    const pageWidth = 210
    const pageHeight = 297
    const imgWidth = 120
    const imgHeight = 80
    const x = (pageWidth - imgWidth) / 2
    const y = (pageHeight - imgHeight) / 2
    doc.addImage(logoData, 'PNG', x, y, imgWidth, imgHeight)
  } catch(e) {}
}

function header(doc, logoData) {
  doc.setFillColor(...AZUL)
  doc.rect(0, 0, W, 26, 'F')
  if (logoData) doc.addImage(logoData, 'PNG', M, 3, 28, 20)
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text('LIMPLINE COMERCIAL', M + 32, 11)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(181, 212, 244)
  doc.text('Dispensers · Papeis · Comodato', M + 32, 17)
  doc.setFontSize(7.5); doc.setTextColor(255, 255, 255)
  doc.text('(11) 2335-3500 | limplinecomercial.com.br | vendas@limplinecomercial.com.br', W - M, 22, { align: 'right' })
  doc.setFillColor(...AMARELO)
  doc.rect(0, 26, W, 0.85, 'F')
}

function footer(doc) {
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(...AMARELO)
  doc.rect(0, pageHeight - 14, W, 0.5, 'F')
  doc.setFontSize(7); doc.setTextColor(...CINZA)
  doc.text('Av. Prof. Sylla Mattos, 68 - Jd. Santa Cruz - CEP 04182-010 - Sao Paulo - SP', W / 2, pageHeight - 9, { align: 'center' })
  doc.text('vendas@limplinecomercial.com.br | (11) 2335-3500', W / 2, pageHeight - 5, { align: 'center' })
}

export async function generateProposta(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logoData = await loadLogo().catch(() => null)

  header(doc, logoData)
  await addWatermark(doc, logoData)

  let y = 36
  const tituloTxt = data.tipoProposta === 'equipamentos'
    ? 'PROPOSTA DE VENDA DE EQUIPAMENTOS'
    : 'PROPOSTA DE COMODATO'

  doc.setFillColor(...AMARELO)
  doc.rect(M, y, W - M * 2, 8, 'F')
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
  doc.text(tituloTxt, W / 2, y + 5.5, { align: 'center' })
  y += 13

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  doc.text('A: ' + limparTexto(data.cliente || ''), M, y)
  doc.text('Data: ' + (data.data || ''), W - M, y, { align: 'right' })
  y += 5
  doc.text('Att. ' + limparTexto(data.att || '') + ' | CNPJ: ' + limparTexto(data.cnpj || ''), M, y)
  doc.text('Validade: ' + (data.validade || '15 dias'), W - M, y, { align: 'right' })
  y += 10

  const txtIntro = data.tipoProposta === 'equipamentos'
    ? 'A Limpline oferece equipamentos modernos de higiene corporativa, desenvolvidos para garantir praticidade, durabilidade e eficiencia no dia a dia das empresas.\n\nNossa linha de produtos atende diferentes necessidades de ambientes corporativos, contribuindo para espacos mais organizados, higienicos e funcionais.\n\nA Limpline e referencia em solucoes praticas para higiene corporativa, oferecendo qualidade e confianca em cada produto.'
    : 'A Limpline oferece um completo Sistema de Comodato, disponibilizando equipamentos modernos de higiene sem custo de aquisicao. Nossa proposta e simples: voce recebe os dispensers instalados gratuitamente e adquire apenas os insumos necessarios.\n\nCom mais de 20 anos no mercado, a Limpline e referencia em solucoes praticas e economicas para higiene corporativa.'

  doc.setFontSize(9); doc.setTextColor(...PRETO)
  y = textJustified(doc, limparTexto(txtIntro), M, W - M * 2, y, 5.5)
  y += 6

  if (data.tipoProposta !== 'equipamentos') {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
    doc.text('Nossos diferenciais:', M, y); y += 5
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    const difs = [
      '• Equipamentos modernos e de alta qualidade;',
      '• Instalacao e manutencao gratuitas;',
      '• Linha completa de insumos proprios (Limpaper);',
      '• Entrega agil e atendimento especializado.'
    ]
    difs.forEach(d => { doc.text(d, M, y); y += 5 })
    y += 3
  } else {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
    doc.text('Nossos diferenciais:', M, y); y += 5
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    const difs = [
      '• Equipamentos modernos e de alta qualidade;',
      '• Produtos resistentes e de excelente durabilidade;',
      '• Linha completa para higiene corporativa;',
      '• Entrega agil e atendimento especializado.'
    ]
    difs.forEach(d => { doc.text(d, M, y); y += 5 })
    y += 3
  }

  const vendedoraNome = data.vendedora || ''
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
  doc.text('Vendedora: ' + vendedoraNome, M, y); y += 8

  // Tabela de produtos
  if (data.items && data.items.length > 0) {
    doc.setFillColor(...AZUL)
    doc.rect(M, y, W - M * 2, 7, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Valores e sugestao do pedido', M + 2, y + 4.5)
    y += 9

    const colW = [90, 28, 28, 28]
    const headers = ['Produto', 'Qtd.', 'Unit.', 'Total']
    doc.setFillColor(230, 236, 245)
    doc.rect(M, y, W - M * 2, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
    let cx = M + 2
    headers.forEach((h, i) => {
      doc.text(h, cx, y + 4, { align: i === 0 ? 'left' : 'center' })
      cx += colW[i]
    })
    y += 7

    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    let total = 0
    data.items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(245, 248, 255)
        doc.rect(M, y - 1, W - M * 2, 6, 'F')
      }
      doc.setFontSize(8)
      const subtotal = (item.qty || 0) * (item.preco || 0)
      total += subtotal
      cx = M + 2
      doc.text(limparTexto(item.name || ''), cx, y + 3)
      cx += colW[0]
      doc.text((item.qty || 0) + ' ' + pluralUnit(item.unit, item.qty || 0), cx, y + 3, { align: 'center' })
      cx += colW[1]
      doc.text(fmtBRL(item.preco || 0), cx, y + 3, { align: 'center' })
      cx += colW[2]
      doc.text(fmtBRL(subtotal), cx, y + 3, { align: 'center' })
      y += 6
    })

    if (data.mostrarTotal !== false) {
      doc.setFillColor(...AZUL)
      doc.rect(M, y, W - M * 2, 7, 'F')
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
      doc.text('Total do pedido:', M + 2, y + 4.5)
      doc.text(fmtBRL(total), W - M - 2, y + 4.5, { align: 'right' })
      y += 10
    }
  }

  // Comodato (apenas para proposta de comodato)
  if (data.tipoProposta !== 'equipamentos' && data.comodato && data.comodato.length > 0) {
    if (y > 220) { doc.addPage(); header(doc, logoData); await addWatermark(doc, logoData); y = 36 }
    doc.setFillColor(...AZUL)
    doc.rect(M, y, W - M * 2, 7, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Suportes a serem instalados sem custo (Comodato)', M + 2, y + 4.5)
    y += 9

    const colW2 = [100, 30, 26]
    const hds = ['Equipamento', 'Quantidade', 'Observacao']
    doc.setFillColor(230, 236, 245)
    doc.rect(M, y, W - M * 2, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
    let cx2 = M + 2
    hds.forEach((h, i) => {
      doc.text(h, cx2, y + 4, { align: i === 0 ? 'left' : 'center' })
      cx2 += colW2[i]
    })
    y += 7

    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    data.comodato.forEach((eq, idx) => {
      if (!eq.nome) return
      if (idx % 2 === 0) {
        doc.setFillColor(245, 248, 255)
        doc.rect(M, y - 1, W - M * 2, 6, 'F')
      }
      doc.setFontSize(8)
      cx2 = M + 2
      doc.text(limparTexto(eq.nome || ''), cx2, y + 3)
      cx2 += colW2[0]
      doc.text(String(eq.qty || 1), cx2, y + 3, { align: 'center' })
      cx2 += colW2[1]
      doc.text(limparTexto(eq.obs || ''), cx2, y + 3, { align: 'center' })
      y += 6
    })
    y += 4
  }

  footer(doc)

  // Contrato (apenas comodato)
  if (data.tipoProposta !== 'equipamentos' && data.incluirContrato) {
    doc.addPage(); header(doc, logoData); await addWatermark(doc, logoData)
    generateContratoPages(doc, data, logoData)
  }

  doc.save('Proposta_Limpline.pdf')
}

export async function generateContrato(data) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logoData = await loadLogo().catch(() => null)
  header(doc, logoData)
  await addWatermark(doc, logoData)
  generateContratoPages(doc, data, logoData)
  doc.save('Contrato_Limpline.pdf')
}

function generateContratoPages(doc, data, logoData) {
  let y = 36
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
  doc.text('MINUTA DE CONTRATO DE COMODATO', W / 2, y, { align: 'center' }); y += 10

  const clausulas = [
    ['1. DAS PARTES', 'COMODANTE: LIMPLINE COMERCIAL - Av. Prof. Sylla Mattos, 68, Jd. Santa Cruz, Sao Paulo/SP - CNPJ: 62.563.688/0001-75.\nCOMODATARIO: ' + limparTexto(data.cliente || '') + ' - CNPJ: ' + limparTexto(data.cnpj || '') + '.'],
    ['2. DO OBJETO', 'O presente contrato tem por objeto o emprestimo gratuito (comodato) dos equipamentos dispensers descritos na proposta comercial anexa, de propriedade exclusiva da COMODANTE, para uso nas dependencias do COMODATARIO.'],
    ['3. DO PRAZO', 'O contrato vigorara por prazo indeterminado, podendo ser rescindido por qualquer das partes mediante aviso previo de 30 (trinta) dias.'],
    ['4. DAS OBRIGACOES DO COMODATARIO', 'a) Utilizar os equipamentos exclusivamente para os fins previstos;\nb) Adquirir os insumos (papeis, sabonetes e refis) fornecidos pela COMODANTE;\nc) Conservar os equipamentos em bom estado;\nd) Comunicar imediatamente qualquer avaria ou problema;\ne) Devolver os equipamentos ao termino do contrato em perfeito estado.'],
    ['5. DAS OBRIGACOES DA COMODANTE', 'a) Fornecer os equipamentos em perfeito estado de funcionamento;\nb) Realizar a instalacao e manutencao sem custo adicional;\nc) Substituir equipamentos com defeito de fabricacao;\nd) Garantir o abastecimento regular dos insumos solicitados.'],
    ['6. DA MANUTENCAO', 'A COMODANTE responsabiliza-se pela manutencao preventiva e corretiva dos equipamentos, sem onus ao COMODATARIO, desde que os danos nao sejam causados por mau uso ou negligencia.'],
    ['7. DA DEVOLUCAO', 'Ao termino do contrato, os equipamentos deverao ser devolvidos a COMODANTE no prazo de 5 (cinco) dias uteis, nas mesmas condicoes em que foram entregues, salvo desgaste natural pelo uso.'],
    ['8. DAS DISPOSICOES GERAIS', 'O presente contrato e regido pelas leis brasileiras. As partes elegem o foro da comarca de Sao Paulo/SP para dirimir quaisquer controversias.'],
  ]

  clausulas.forEach(([titulo, texto]) => {
    if (y > 250) {
      footer(doc)
      doc.addPage(); header(doc, logoData)
      y = 36
    }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
    doc.text(titulo, M, y); y += 5
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    y = textJustified(doc, limparTexto(texto), M, W - M * 2, y, 5) + 4
  })

  if (y > 220) {
    footer(doc)
    doc.addPage(); header(doc, logoData)
    y = 36
  }

  y += 10
  doc.setDrawColor(...AZUL)
  doc.line(M, y, M + 70, y)
  doc.line(W - M - 70, y, W - M, y)
  y += 4
  doc.setFontSize(8); doc.setTextColor(...CINZA)
  doc.text('COMODANTE: LIMPLINE COMERCIAL', M, y)
  doc.text('COMODATARIO: ' + limparTexto(data.cliente || ''), W - M, y, { align: 'right' })
  y += 4
  doc.text('Data: ' + (data.data || ''), M, y)

  footer(doc)
}
