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
        words.forEach((word, wi) => {
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
  const pageWidth = 210
  const pageHeight = 297
  const imgWidth = 120
  const imgHeight = 80
  const x = (pageWidth - imgWidth) / 2
  const y = (pageHeight - imgHeight) / 2
  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: 0.06 }))
  doc.addImage(logoData, 'PNG', x, y, imgWidth, imgHeight)
  doc.restoreGraphicsState()
}

function header(doc, logoData) {
doc.setFillColor(26, 58, 107)
doc.rect(0, 0, W, 26, 'F')
if (logoData) {
doc.addImage(logoData, 'PNG', M, 3, 28, 20)
}
doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('LIMPLINE COMERCIAL', M + 32, 11)
doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(181, 212, 244)
doc.text('Dispensers Â· PapÃ©is Â· Comodato', M + 32, 17)
doc.setFontSize(7.5); doc.setTextColor(255, 255, 255)
doc.text('(11) 2335-3500 | limplinecomercial.com.br | vendas@limplinecomercial.com.br', W - M, 22, { align: 'right' })
doc.setFillColor(245, 196, 0)
doc.rect(0, 26, W, 0.85, 'F')
}

function footer(doc, pageNum) {
const pageHeight = doc.internal.pageSize.height
doc.setFillColor(245, 196, 0)
doc.rect(0, pageHeight - 14, W, 0.5, 'F')
doc.setFontSize(7); doc.setTextColor(100, 100, 100)
doc.text('Av. Prof. Sylla Mattos, 68 â Jd. Santa Cruz â CEP 04182-010 â SÃ£o Paulo â SP', W / 2, pageHeight - 9, { align: 'center' })
doc.text('vendas@limplinecomercial.com.br | (11) 2335-3500', W / 2, pageHeight - 5, { align: 'center' })
doc.text(`PÃ¡gina ${pageNum}`, W - M, pageHeight - 5, { align: 'right' })
}

export async function generateProposta(data) {
const doc = new jsPDF({ unit: 'mm', format: 'a4' })
const logoData = await loadLogo()
let y = 30

header(doc, logoData)
addWatermark(doc, logoData)

doc.setFillColor(...AMARELO)
doc.rect(M, y, W - M * 2, 8, 'F')
doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
doc.text('PROPOSTA DE COMODATO', W / 2, y + 5.5, { align: 'center' })
y += 14

doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
doc.text(`A: ${data.empresa || 'â'}`, M, y)
doc.text(`Data: ${data.data || new Date().toLocaleDateString('pt-BR')}`, W - M, y, { align: 'right' })
y += 5
doc.text(`Att. ${data.nome || 'â'}${data.cnpj ? ' | CNPJ: ' + data.cnpj : ''}`, M, y)
doc.text(`Validade: ${data.validade || '15 dias'}`, W - M, y, { align: 'right' })
y += 5
y += 3

doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const paragrafos = [
  'HÃ¡ mais de 20 anos, a Limpline Ã© referÃªncia em soluÃ§Ãµes de higiene corporativa atravÃ©s do sistema de comodato, oferecendo qualidade, pontualidade e economia para empresas de todos os portes.',
  'Disponibilizamos equipamentos modernos, com possibilidade de personalizaÃ§Ã£o com o seu logo sem custo, proporcionando ambientes mais organizados, elegantes e funcionais.',
  'No sistema de comodato, sua empresa recebe os equipamentos sem custo de aquisiÃ§Ã£o, contando com instalaÃ§Ã£o, orientaÃ§Ã£o de uso e suporte especializado. A parceria Ã© mantida atravÃ©s da fidelidade no fornecimento dos insumos, garantindo qualidade, padronizaÃ§Ã£o e o abastecimento contÃ­nuo dos produtos.',
]
paragrafos.forEach(p => {
  y = textJustified(doc, p, M, W - M * 2, y, 4.5); y += 3
})
y += 2
doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text('Nossos diferenciais:', M, y); y += 5
doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const info = [
  'â¢ Equipamentos personalizados com o logo da sua empresa;',
  'â¢ SimulaÃ§Ã£o dos espaÃ§os para visualizaÃ§Ã£o do projeto antes da instalaÃ§Ã£o;',
  'â¢ Treinamento da equipe para utilizaÃ§Ã£o e abastecimento correto dos equipamentos;',
  'â¢ Entrega de materiais em atÃ© 2 dias Ãºteis, mantendo o abastecimento sempre em dia;',
  'â¢ ManutenÃ§Ã£o corretiva em atÃ© 5 dias Ãºteis.',
]
info.forEach(line => {
  const il = doc.splitTextToSize(line, W - M * 2)
  doc.text(il, M, y); y += il.length * 4.5 + 0.5
})
y += 4
const labelVend = data.genero === 'm' ? 'Vendedor' : 'Vendedora'
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text(`${labelVend}: `, M, y)
doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
doc.text(data.vendedora || '—', M + doc.getTextWidth(`${labelVend}: `), y)
y += 8

if (data.comodato && data.comodato.length) {
doc.setFillColor(...AZUL_M)
doc.rect(M, y, W - M * 2, 7, 'F')
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('Suportes a serem instalados sem custo', M + 3, y + 4.8)
y += 11
doc.setFillColor(230, 241, 251); doc.rect(M, y - 1, W - M * 2, 6, 'F')
doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
doc.text('Tipo de suporte', M + 2, y + 3.5)
doc.text('Qtd.', W - M - 20, y + 3.5)
y += 8
data.comodato.forEach((item, i) => {
  if (y > 265) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 32 }
  if (i % 2 === 0) { doc.setFillColor(248, 250, 255); doc.rect(M, y - 1, W - M * 2, 6, 'F') }
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  doc.text(item.name || 'â', M + 2, y + 3.5)
  doc.text(String(item.qty || 1), W - M - 20, y + 3.5)
  y += 7
})
y += 6
}

if (data.produtos && data.produtos.length) {
  if (y > 225) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 32 }
doc.setFillColor(...AZUL_M)
doc.rect(M, y, W - M * 2, 7, 'F')
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('Valores e sugestÃ£o do pedido', M + 3, y + 4.8)
y += 11
const cw = [96, 22, 28, 28]
doc.setFillColor(230, 241, 251); doc.rect(M, y - 1, cw.reduce((a, b) => a + b), 6, 'F')
doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
doc.text('Produto', M + 2, y + 3.5)
doc.text('Qtd.', M + cw[0] + 2, y + 3.5)
doc.text('Unit.', M + cw[0] + cw[1] + 2, y + 3.5)
doc.text('Total', M + cw[0] + cw[1] + cw[2] + 2, y + 3.5)
y += 8
let total = 0
data.produtos.forEach((it, i) => {
if (y > 265) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 30 }
const sub = it.qty * (it.price || 0)
total += sub
if (i % 2 === 0) { doc.setFillColor(248, 250, 255); doc.rect(M, y - 1, cw.reduce((a, b) => a + b), 6, 'F') }
doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const nl = doc.splitTextToSize(it.name, cw[0] - 4)
doc.text(nl, M + 2, y + 3.5)
doc.text(`${it.qty} ${pluralUnit(it.unit, it.qty)}`, M + cw[0] + 2, y + 3.5)
doc.text(fmtBRL(it.price), M + cw[0] + cw[1] + 2, y + 3.5)
doc.text(fmtBRL(sub), M + cw[0] + cw[1] + cw[2] + 2, y + 3.5)
y += nl.length > 1 ? nl.length * 4.5 + 2 : 7
})
y += 2
if (data.showTotal !== false) {
  doc.setFillColor(...AZUL)
  doc.rect(M, y - 1, W - M * 2, 8, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Total do pedido:', M + 3, y + 4.5)
  doc.text(fmtBRL(total), W - M - 3, y + 4.5, { align: 'right' })
  y += 14
}
}

if (data.condicaoPagamento) {
  if (y > 268) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 32 }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
  doc.text('CondiÃ§Ã£o de pagamento: ', M, y)
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  doc.text(data.condicaoPagamento, M + 42, y)
  y += 8
}

if (data.obs) {
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text('ObservaÃ§Ãµes:', M, y); y += 5
doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
const obsLines = doc.splitTextToSize(data.obs, W - M * 2)
for (let oi = 0; oi < obsLines.length; oi++) {
  if (y > 268) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 32 }
  doc.text(obsLines[oi], M, y); y += 4.5
}
y += 8
}

if (data.incluirContrato) {
doc.addPage(); header(doc, logoData); addWatermark(doc, logoData)
generateContratoPages(doc, data, logoData)
}

footer(doc, doc.internal.getNumberOfPages())
const fn = `Proposta_Limpline_${(data.empresa || 'cliente').replace(/\s/g, '_')}_${(data.data || '').replace(/\//g, '-')}.pdf`
doc.save(fn)
return fn
}

export async function generateContrato(data) {
const doc = new jsPDF({ unit: 'mm', format: 'a4' })
const logoData = await loadLogo()
header(doc, logoData)
addWatermark(doc, logoData)
generateContratoPages(doc, data, logoData)
footer(doc, 1)
const fn = `Contrato_Limpline_${(data.empresa || 'cliente').replace(/\s/g, '_')}_${(data.data || '').replace(/\//g, '-')}.pdf`
doc.save(fn)
return fn
}

function generateContratoPages(doc, data, logoData) {
let y = 30

doc.setFillColor(...AMARELO)
doc.rect(M, y, W - M * 2, 8, 'F')
doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL)
doc.text('CONTRATO DE COMODATO DE EQUIPAMENTOS E FORNECIMENTO EXCLUSIVO DE SUPRIMENTOS', W / 2, y + 5.5, { align: 'center' })
y += 14

doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text('IDENTIFICAÃÃO DAS PARTES CONTRATANTES', M, y); y += 7

doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRETO)
doc.text('COMODANTE: LIMPLINE COML DESC LIMP E PAP LTDA', M, y); y += 5
doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
const comodante = 'PESSOA JURÍDICA DE DIREITO PRIVADO, INSCRITA NO CNPJ SOB Nº 07.836.996/0001-19 E INSCRIÇÃO ESTADUAL Nº 117.230.478.114, COM SEDE NA AV. PROF. SYLLA MATTOS Nº 68, JARDIM SANTA CRUZ, SÃO PAULO/SP, CEP 04182-010.'
y = textJustified(doc, comodante, M, W - M * 2, y, 4.5); y += 5

doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRETO)
doc.text(`COMODATÃRIO: ${data.empresa || '___________________________'}`, M, y); y += 5
doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
const comodatario = `Pessoa jurÃ­dica de direito privado, inscrita no CNPJ sob nÂº ${data.cnpj || '___________________________'}, com sede na ${limparTexto(data.endereco) || '___________________________'}.`
const lComodatario = doc.splitTextToSize(comodatario, W - M * 2)
doc.text(lComodatario, M, y); y += lComodatario.length * 4.5 + 8

const EXTENSO = ['', 'uma', 'duas', 'trÃªs', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte', 'vinte e uma', 'vinte e duas', 'vinte e trÃªs', 'vinte e quatro', 'vinte e cinco', 'vinte e seis', 'vinte e sete', 'vinte e oito', 'vinte e nove', 'trinta', 'trinta e uma', 'trinta e duas', 'trinta e trÃªs', 'trinta e quatro', 'trinta e cinco', 'trinta e seis', 'trinta e sete', 'trinta e oito', 'trinta e nove', 'quarenta']
function qtdExtenso(n) { const q = parseInt(n) || 1; return EXTENSO[q] ? `${q} (${EXTENSO[q]})` : String(q) }

const clausulas = [
{
titulo: 'CLÃUSULA 1Âª â DO OBJETO',
texto: `O presente contrato tem por objeto a cessÃ£o gratuita, em regime de comodato, dos equipamentos abaixo descritos, de propriedade exclusiva do COMODANTE, para utilizaÃ§Ã£o pelo COMODATÃRIO:\n${(data.comodato || []).map(c => `â¢ ${qtdExtenso(c.qty)} unidade${parseInt(c.qty) > 1 ? 's' : ''} de ${c.name}`).join('\n') || 'â¢ (equipamentos a definir)'}\n\nParÃ¡grafo Ãºnico. Os equipamentos ora cedidos permanecem de propriedade exclusiva do COMODANTE, nÃ£o gerando ao COMODATÃRIO qualquer direito de retenÃ§Ã£o, posse definitiva ou aquisiÃ§Ã£o.`
},
{
titulo: 'CLÃUSULA 2Âª â DAS OBRIGAÃÃES DO COMODATÃRIO',
texto: 'O COMODATÃRIO declara receber os equipamentos em perfeito estado de conservaÃ§Ã£o e funcionamento, comprometendo-se a:\nI â Zelar pela guarda, conservaÃ§Ã£o e correta utilizaÃ§Ã£o dos equipamentos;\nII â Utilizar exclusivamente produtos e suprimentos fornecidos pelo COMODANTE;\nIII â Comunicar imediatamente ao COMODANTE qualquer defeito, dano ou irregularidade;\nIV â Restituir os equipamentos ao tÃ©rmino deste contrato nas mesmas condiÃ§Ãµes em que os recebeu.\n\nÂ§1Âº O COMODATÃRIO serÃ¡ integralmente responsÃ¡vel pelos danos decorrentes de mau uso, vandalismo ou negligÃªncia.\nÂ§2Âº NÃ£o haverÃ¡ exigÃªncia de consumo mÃ­nimo mensal, permanecendo a obrigaÃ§Ã£o de exclusividade de aquisiÃ§Ã£o junto ao COMODANTE.'
},
{
titulo: 'CLÃUSULA 3Âª â DAS OBRIGAÃÃES DO COMODANTE',
texto: 'O COMODANTE obriga-se a:\nI â Realizar a instalaÃ§Ã£o dos equipamentos;\nII â Prestar manutenÃ§Ã£o corretiva sem custos ao COMODATÃRIO;\nIII â Realizar os reparos necessÃ¡rios no prazo mÃ¡ximo de atÃ© 5 (cinco) dias Ãºteis apÃ³s comunicaÃ§Ã£o formal.\n\nParÃ¡grafo Ãºnico. NÃ£o estarÃ£o cobertos pela manutenÃ§Ã£o gratuita os danos decorrentes de vandalismo, mau uso ou utilizaÃ§Ã£o inadequada dos equipamentos.'
},
{
titulo: 'CLÃUSULA 4Âª â DO PRAZO',
texto: 'O presente contrato vigorarÃ¡ pelo prazo determinado de 12 (doze) meses, contados da data de sua assinatura.\n\nÂ§1Âº Findo o prazo inicial, o contrato serÃ¡ automaticamente renovado por prazo indeterminado, salvo manifestaÃ§Ã£o expressa e escrita em contrÃ¡rio.\nÂ§2Âº Permanecendo os equipamentos em posse do COMODATÃRIO apÃ³s o tÃ©rmino do prazo, sem oposiÃ§Ã£o do COMODANTE, considerar-se-Ã¡ automaticamente prorrogado o presente instrumento.'
},
{
titulo: 'CLÃUSULA 5Âª â DA RESCISÃO',
texto: 'O presente contrato poderÃ¡ ser rescindido por qualquer das partes, sem incidÃªncia de multa ou Ã´nus, mediante aviso prÃ©vio por escrito com antecedÃªncia mÃ­nima de 30 (trinta) dias.\n\nÂ§1Âº O inadimplemento financeiro superior a 30 (trinta) dias autorizarÃ¡ o COMODANTE a rescindir imediatamente o contrato e promover a retirada dos equipamentos.'
},
{
titulo: 'CLÃUSULA 6Âª â DA DEVOLUÃÃO DOS EQUIPAMENTOS',
texto: 'Encerrado o contrato por qualquer motivo, o COMODATÃRIO deverÃ¡ disponibilizar os equipamentos para retirada pelo COMODANTE no prazo mÃ¡ximo de 20 (vinte) dias corridos, contados da notificaÃ§Ã£o de encerramento.'
},
{
titulo: 'CLÃUSULA 7Âª â DO FORO',
texto: 'Fica eleito o foro da Comarca de SÃ£o Paulo/SP para dirimir quaisquer controvÃ©rsias oriundas deste contrato, com renÃºncia expressa a qualquer outro, por mais privilegiado que seja.'
},
]

clausulas.forEach(cl => {
if (y > 240) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 30 }
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text(cl.titulo, M, y); y += 6
doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const blocos = cl.texto.split('\n')
blocos.forEach(bloco => {
if (bloco.trim() === '') { y += 2; return }
const ehLista = bloco.startsWith('•') || bloco.startsWith('I —') || bloco.startsWith('II') || bloco.startsWith('III') || bloco.startsWith('IV') || bloco.startsWith('§')
if (ehLista) {
const bl = doc.splitTextToSize(bloco, W - M * 2)
doc.text(bl, M, y); y += bl.length * 4.5
} else {
y = textJustified(doc, bloco, M, W - M * 2, y, 4.5)
}
})
})

if (y > 220) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 30 }
y += 8
doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
doc.text(`SÃ£o Paulo, ${data.data || '_____ de ________________ de 2026'}.`, M, y); y += 14

doc.setDrawColor(...AZUL_M); doc.setLineWidth(0.3)
const nomeComodatario = (data.empresa || 'COMODATÁRIO').toUpperCase()
doc.setFontSize(8)
const larguraComodatario = Math.max(doc.getTextWidth(nomeComodatario) + 6, 50)
doc.line(M, y, M + 65, y)
doc.line(W - M - larguraComodatario, y, W - M, y)
y += 5
doc.setTextColor(...CINZA)
doc.text('LIMPLINE COML DESC LIMP E PAP LTDA', M, y)
doc.text(nomeComodatario, W - M, y, { align: 'right' }); y += 4
doc.setFontSize(7); doc.setTextColor(160, 160, 160)
doc.text('CNPJ 07.836.996/0001-19', M, y)
doc.text(data.cnpj || '', W - M, y, { align: 'right' }); y += 12

doc.text('Testemunha 1: ________________________ CPF: ________________', M, y); y += 8
doc.text('Testemunha 2: ________________________ CPF: ________________', M, y)
}
