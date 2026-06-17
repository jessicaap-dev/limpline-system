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
doc.text('Dispensers · Papéis · Comodato', M + 32, 17)
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
doc.text('Av. Prof. Sylla Mattos, 68 – Jd. Santa Cruz – CEP 04182-010 – São Paulo – SP', W / 2, pageHeight - 9, { align: 'center' })
doc.text('vendas@limplinecomercial.com.br | (11) 2335-3500', W / 2, pageHeight - 5, { align: 'center' })
doc.text(`Página ${pageNum}`, W - M, pageHeight - 5, { align: 'right' })
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
doc.text(`A: ${data.empresa || '—'}`, M, y)
doc.text(`Data: ${data.data || new Date().toLocaleDateString('pt-BR')}`, W - M, y, { align: 'right' })
y += 5
doc.text(`Att. ${data.nome || '—'}${data.cnpj ? ' | CNPJ: ' + data.cnpj : ''}`, M, y)
doc.text(`Validade: ${data.validade || '15 dias'}`, W - M, y, { align: 'right' })
y += 5
doc.text(`Vendedora: ${data.vendedora || '—'}`, M, y)
y += 10

doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const paragrafos = [
  'Há mais de 20 anos, a Limpline é referência em soluções de higiene corporativa através do sistema de comodato, oferecendo qualidade, pontualidade e economia para empresas de todos os portes.',
  'Disponibilizamos equipamentos modernos, com possibilidade de personalização com o seu logo sem custo, proporcionando ambientes mais organizados, elegantes e funcionais.',
  'No sistema de comodato, sua empresa recebe os equipamentos sem custo de aquisição, contando com instalação, orientação de uso e suporte especializado. A parceria é mantida através da fidelidade no fornecimento dos insumos, garantindo qualidade, padronização e o abastecimento contínuo dos produtos.',
]
paragrafos.forEach(p => {
  const pl = doc.splitTextToSize(p, W - M * 2)
  doc.text(pl, M, y); y += pl.length * 4.5 + 3
})
y += 2
doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text('Nossos diferenciais:', M, y); y += 5
doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const info = [
  '• Equipamentos personalizados com o logo da sua empresa;',
  '• Simulação dos espaços para visualização do projeto antes da instalação;',
  '• Treinamento da equipe para utilização e abastecimento correto dos equipamentos;',
  '• Entrega de materiais em até 2 dias úteis, mantendo o abastecimento sempre em dia;',
  '• Manutenção corretiva em até 5 dias úteis.',
]
info.forEach(line => {
  const il = doc.splitTextToSize(line, W - M * 2)
  doc.text(il, M, y); y += il.length * 4.5 + 0.5
})
y += 6

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
  doc.text(item.name || '—', M + 2, y + 3.5)
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
doc.text('Valores e sugestão do pedido', M + 3, y + 4.8)
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
doc.text(`${it.qty} ${it.unit}`, M + cw[0] + 2, y + 3.5)
doc.text(fmtBRL(it.price), M + cw[0] + cw[1] + 2, y + 3.5)
doc.text(fmtBRL(sub), M + cw[0] + cw[1] + cw[2] + 2, y + 3.5)
y += nl.length > 1 ? nl.length * 4.5 + 2 : 7
})
y += 2
doc.setFillColor(...AZUL)
doc.rect(M, y - 1, W - M * 2, 8, 'F')
doc.setFontSize(9)
doc.setFont('helvetica', 'bold')
doc.setTextColor(255, 255, 255)
doc.text('Total do pedido:', M + 3, y + 4.5)
doc.text(fmtBRL(total), W - M - 3, y + 4.5, { align: 'right' })
y += 14
}

if (data.condicaoPagamento) {
  if (y > 268) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 32 }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
  doc.text('Condição de pagamento: ', M, y)
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
  doc.text(data.condicaoPagamento, M + 42, y)
  y += 8
}

if (data.obs) {
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text('Observações:', M, y); y += 5
doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA)
const obsLines = doc.splitTextToSize(data.obs, W - M * 2)
doc.text(obsLines, M, y); y += obsLines.length * 4.5 + 8
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
const comodatario = `Pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${data.cnpj || '___________________________'}, com sede na ${limparTexto(data.endereco) || '___________________________'}.`const comodatario = `Pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${data.cnpj || '___________________________'}, com sede na ${limparTexto(data.endereco) || '___________________________'}.`
const lComodatario = doc.splitTextToSize(comodatario, W - M * 2)
doc.text(lComodatario, M, y); y += lComodatario.length * 4.5 + 8

const EXTENSO = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte']
function qtdExtenso(n) { const q = parseInt(n) || 1; return EXTENSO[q] ? `${q} (${EXTENSO[q]})` : String(q) }

const clausulas = [
{
titulo: 'CLÁUSULA 1ª — DO OBJETO',
texto: `O presente contrato tem por objeto a cessão gratuita, em regime de comodato, dos equipamentos abaixo descritos, de propriedade exclusiva do COMODANTE, para utilização pelo COMODATÁRIO:\n${(data.comodato || []).map(c => `• ${qtdExtenso(c.qty)} unidade${parseInt(c.qty) > 1 ? 's' : ''} de ${c.name}`).join('\n') || '• (equipamentos a definir)'}\n\nParágrafo único. Os equipamentos ora cedidos permanecem de propriedade exclusiva do COMODANTE, não gerando ao COMODATÁRIO qualquer direito de retenção, posse definitiva ou aquisição.`
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
if (y > 240) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 30 }
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...AZUL_M)
doc.text(cl.titulo, M, y); y += 6
doc.setFont('helvetica', 'normal'); doc.setTextColor(...PRETO)
const tLines = doc.splitTextToSize(cl.texto, W - M * 2)
doc.text(tLines, M, y); y += tLines.length * 4.5 + 8
})

if (y > 220) { footer(doc, doc.internal.getNumberOfPages()); doc.addPage(); header(doc, logoData); addWatermark(doc, logoData); y = 30 }
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

doc.text('Testemunha 1: ________________________ CPF: ________________', M, y); y += 8
doc.text('Testemunha 2: ________________________ CPF: ________________', M, y)
}
