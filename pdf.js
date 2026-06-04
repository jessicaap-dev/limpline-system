import { jsPDF } from 'jspdf'
import { fmtBRL } from './config'

const AZUL = [26, 58, 107]
const AZUL_M = [46, 95, 171]
const AMARELO = [245, 196, 0]
const CINZA = [100, 100, 100]
const PRETO = [30, 30, 30]
const W = 210
const M = 18

function header(doc) {
  doc.setFillColor(...AZUL)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text('LIMPLINE COMERCIAL', M, 12)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255)
  doc.text('Dispensers · Papéis · Comodato', M, 18)
  doc.setFontSize(9); doc.setTextColor(255, 255, 255)
  doc.text('Av. Prof. Sylla Mattos, 68 – Jd. Santa Cruz – SP  |  (11) 2335-3500  |  limplinecomercial.com.br', M, 24)
}

function footer(doc, pageNum) {
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(7); doc.setTextColor(180, 180, 180)
  doc.text('Av. Prof. Sylla Mattos, 68 – Jd. Santa Cruz – CEP 04182-010 – São Paulo – SP  |  vendas@limplinecomercial.com.br', W / 2, pageHeight - 8, { align: 'center' })
  doc.text(`Página ${pageNum}`, W - M, pageHeight - 8, { align: 'right' })
}

export function generateProposta(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 36

  header(doc)

  doc.setFillColor(...AMARELO)
  doc.rect(M, y, W - M * 2, 8, 'F')
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
  doc.text('PROPOSTA DE COMODATO', W / 2, y + 5.5, { align: 'center' })
  y += 14

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
  doc.text(`A: ${data.empresa || '—'}`, M, y)
  doc.text(`Data: ${data.data || new Date().toLocaleDateString('pt-BR')}`, W - M, y, { align: 'right' })
  y += 5
  doc.text(`Att. ${data.nome || '—'}${data.cnpj ? ' | CNPJ: ' + data.cnpj : ''}`, M, y)
  doc.text(`Validade: ${data.validade || '15 dias'}`, W - M, y, { align: 'right' })
  y += 5
  doc.text(`Vendedora: ${data.vendedora || '—'}`, M, y)
  y += 10

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  const intro = 'No modelo de comodato, fornecemos os suportes gratuitamente, incluindo instalação, manutenção preventiva e corretiva contínua, sem qualquer custo adicional. A única despesa da empresa será com os consumíveis (papéis e refis).'
  const lines = doc.splitTextToSize(intro, W - M * 2)
  doc.text(lines, M, y); y += lines.length * 4.5 + 6

  const info = [
    '• Manutenções e substituições realizadas em até 48 horas.',
    '• Orientação completa no momento da instalação sobre reposição e manuseio.',
    '• Possibilidade de personalização dos suportes com o logotipo da empresa, sem custo adicional.',
  ]
  info.forEach(line => { doc.text(line, M, y); y += 5 })
  y += 6

  if (data.comodato && data.comodato.length) {
    doc.setFillColor(...AZUL_M)
    doc.rect(M, y, W - M * 2, 7, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Suportes a serem instalados sem custo', M + 3, y + 4.8)
    y += 11
    doc.setFillColor(230, 241, 251); doc.rect(M, y - 1, 130, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
    doc.text('Tipo de suporte', M + 2, y + 3.5)
    doc.text('Qtd.', M + 102, y + 3.5)
    y += 8
    data.comodato.forEach((item, i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 250, 255); doc.rect(M, y - 1, 130, 6, 'F') }
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
      doc.text(item.name || '—', M + 2, y + 3.5)
      doc.text(String(item.qty || 1), M + 102, y + 3.5)
      y += 7
    })
    y += 6
  }

  if (data.produtos && data.produtos.length) {
    doc.setFillColor(...AZUL_M)
    doc.rect(M, y, W - M * 2, 7, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Valores e sugestão do pedido', M + 3, y + 4.8)
    y += 11
    const cw = [82, 22, 28, 28]
    doc.setFillColor(230, 241, 251); doc.rect(M, y - 1, cw.reduce((a, b) => a + b), 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
    doc.text('Produto', M + 2, y + 3.5)
    doc.text('Qtd.', M + cw[0] + 2, y + 3.5)
    doc.text('Unit.', M + cw[0] + cw[1] + 2, y + 3.5)
    doc.text('Total', M + cw[0] + cw[1] + cw[2] + 2, y + 3.5)
    y += 8
    let total = 0
    data.produtos.forEach((it, i) => {
      if (y > 265) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc); y = 36 }
      const sub = it.qty * (it.price || 0); total += sub
      if (i % 2 === 0) { doc.setFillColor(248, 250, 255); doc.rect(M, y - 1, cw.reduce((a, b) => a + b), 6, 'F') }
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
      const nl = doc.splitTextToSize(it.name, cw[0] - 4)
      doc.text(nl, M + 2, y + 3.5)
      doc.text(`${it.qty} ${it.unit}`, M + cw[0] + 2, y + 3.5)
      doc.text(fmtBRL(it.price), M + cw[0] + cw[1] + 2, y + 3.5)
      doc.text(fmtBRL(sub), M + cw[0] + cw[1] + cw[2] + 2, y + 3.5)
      y += nl.length > 1 ? nl.length * 4.5 + 2 : 7
    })
    y += 2
    doc.setFillColor(...AZUL)
    doc.rect(M + cw[0] + cw[1] + cw[2] - 2, y - 1, cw[3] + 2, 8, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Total pedido', M + cw[0] + 2, y + 4.5)
    doc.text(fmtBRL(total), W - M - 2, y + 4.5, { align: 'right' })
    y += 14
  }

  if (data.obs) {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
    doc.text('Observações:', M, y); y += 5
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
    const obsLines = doc.splitTextToSize(data.obs, W - M * 2)
    doc.text(obsLines, M, y); y += obsLines.length * 4.5 + 8
  }

  if (data.incluirContrato) {
    doc.addPage(); header(doc)
    generateContratoPages(doc, data)
  }

  footer(doc, doc.internal.getNumberOfPages())
  const fn = `Proposta_Limpline_${(data.empresa || 'cliente').replace(/\s/g, '_')}_${(data.data || '').replace(/\//g, '-')}.pdf`
  doc.save(fn)
  return fn
}

export function generateContrato(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  header(doc)
  generateContratoPages(doc, data)
  footer(doc, 1)
  const fn = `Contrato_Limpline_${(data.empresa || 'cliente').replace(/\s/g, '_')}_${(data.data || '').replace(/\//g, '-')}.pdf`
  doc.save(fn)
  return fn
}

function generateContratoPages(doc, data) {
  let y = 36

  doc.setFillColor(...AMARELO)
  doc.rect(M, y, W - M * 2, 8, 'F')
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
  doc.text('CONTRATO DE COMODATO DE EQUIPAMENTOS E FORNECIMENTO EXCLUSIVO DE SUPRIMENTOS', W / 2, y + 5.5, { align: 'center' })
  y += 14

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
  doc.text('IDENTIFICAÇÃO DAS PARTES CONTRATANTES', M, y); y += 7

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRETO)
  doc.text('COMODANTE: LIMPLINE COML DESC LIMP E PAP LTDA', M, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
  const comodante = 'Pessoa jurídica de direito privado, inscrita no CNPJ sob nº 07.836.996/0001-19 e Inscrição Estadual nº 117.230.478.114, com sede na Av. Prof. Sylla Mattos nº 68, Jardim Santa Cruz, São Paulo/SP, CEP 04182-010.'
  const lComodante = doc.splitTextToSize(comodante, W - M * 2)
  doc.text(lComodante, M, y); y += lComodante.length * 4.5 + 5

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRETO)
  doc.text(`COMODATÁRIO: ${data.empresa || '___________________________'}`, M, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
  const comodatario = `Pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${data.cnpj || '___________________________'}, com sede na ${data.endereco || '___________________________'}.`
  const lComodatario = doc.splitTextToSize(comodatario, W - M * 2)
  doc.text(lComodatario, M, y); y += lComodatario.length * 4.5 + 8

  const clausulas = [
    {
      titulo: 'CLÁUSULA 1ª — DO OBJETO',
      texto: `O presente contrato tem por objeto a cessão gratuita, em regime de comodato, dos equipamentos abaixo descritos, de propriedade exclusiva do COMODANTE, para utilização pelo COMODATÁRIO:\n${(data.comodato || []).map(c => `• ${c.qty}x ${c.name}`).join('\n') || '• (equipamentos a definir)'}\n\nParágrafo único. Os equipamentos ora cedidos permanecem de propriedade exclusiva do COMODANTE, não gerando ao COMODATÁRIO qualquer direito de retenção, posse definitiva ou aquisição.`
    },
    {
      titulo: 'CLÁUSULA 2ª — DAS OBRIGAÇÕES DO COMODATÁRIO',
      texto: 'O COMODATÁRIO declara receber os equipamentos em perfeito estado de conservação e funcionamento, comprometendo-se a:\nI — Zelar pela guarda, conservação e correta utilização dos equipamentos;\nII — Utilizar exclusivamente produtos e suprimentos fornecidos pelo COMODANTE;\nIII — Comunicar imediatamente ao COMODANTE qualquer defeito, dano ou irregularidade;\nIV — Restituir os equipamentos ao término deste contrato nas mesmas condições em que os recebeu.\n\n§1º O COMODATÁRIO será integralmente responsável pelos danos decorrentes de mau uso, vandalismo ou negligência.\n§2º Não haverá exigência de consumo mínimo mensal, permanecendo a obrigação de exclusividade de aquisição junto ao COMODANTE.'
    },
    {
      titulo: 'CLÁUSULA 3ª — DAS OBRIGAÇÕES DO COMODANTE',
      texto: 'O COMODANTE obriga-se a:\nI — Realizar a instalação dos equipamentos;\nII — Prestar manutenção corretiva sem custos ao COMODATÁRIO;\nIII — Realizar os reparos necessários no prazo máximo de até 5 (cinco) dias úteis após comunicação formal.\n\nParágrafo único. Não estarão cobertos pela manutenção gratuita os danos decorrentes de vandalismo, mau uso ou utilização inadequada dos equipamentos.'
    },
    {
      titulo: 'CLÁUSULA 4ª — DO PRAZO',
      texto: 'O presente contrato vigorará pelo prazo determinado de 12 (doze) meses, contados da data de sua assinatura.\n\n§1º Findo o prazo inicial, o contrato será automaticamente renovado por prazo indeterminado, salvo manifestação expressa e escrita em contrário.\n§2º Permanecendo os equipamentos em posse do COMODATÁRIO após o término do prazo, sem oposição do COMODANTE, considerar-se-á automaticamente prorrogado o presente instrumento.'
    },
    {
      titulo: 'CLÁUSULA 5ª — DA RESCISÃO',
      texto: 'O presente contrato poderá ser rescindido por qualquer das partes, sem incidência de multa ou ônus, mediante aviso prévio por escrito com antecedência mínima de 30 (trinta) dias.\n\n§1º O inadimplemento financeiro superior a 30 (trinta) dias autorizará o COMODANTE a rescindir imediatamente o contrato e promover a retirada dos equipamentos.'
    },
    {
      titulo: 'CLÁUSULA 6ª — DA DEVOLUÇÃO DOS EQUIPAMENTOS',
      texto: 'Encerrado o contrato por qualquer motivo, o COMODATÁRIO deverá disponibilizar os equipamentos para retirada pelo COMODANTE no prazo máximo de 20 (vinte) dias corridos, contados da notificação de encerramento.'
    },
    {
      titulo: 'CLÁUSULA 7ª — DO FORO',
      texto: 'Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.'
    },
  ]

  clausulas.forEach(cl => {
    if (y > 240) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc); y = 36 }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
    doc.text(cl.titulo, M, y); y += 6
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
    const tLines = doc.splitTextToSize(cl.texto, W - M * 2)
    doc.text(tLines, M, y); y += tLines.length * 4.5 + 8
  })

  if (y > 220) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc); y = 36 }
  y += 8
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
  doc.text(`São Paulo, ${data.data || '_____ de ________________ de 2026'}.`, M, y); y += 14

  doc.setDrawColor(...AZUL_M); doc.setLineWidth(0.3)
  doc.line(M, y, M + 65, y); doc.line(W - M - 65, y, W - M, y); y += 5
  doc.setFontSize(8); doc.setTextColor(...CINZA)
  doc.text('LIMPLINE COML DESC LIMP E PAP LTDA', M, y)
  doc.text(data.empresa || 'COMODATÁRIO', W - M, y, { align: 'right' }); y += 4
  doc.setFontSize(7); doc.setTextColor(160, 160, 160)
  doc.text('CNPJ 07.836.996/0001-19', M, y)
  doc.text(data.cnpj || '', W - M, y, { align: 'right' }); y += 12

  doc.text('Testemunha 1: ________________________   CPF: ________________', M, y); y += 8
  doc.text('Testemunha 2: ________________________   CPF: ________________', M, y)
}
