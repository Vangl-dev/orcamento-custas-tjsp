import jsPDF from 'jspdf'

const APP_VERSION = '1.0.0'
const PAGE_HEIGHT = 297
const MARGIN_TOP = 14
const MARGIN_BOTTOM = 35
const SECTION_SPACING = 8
const FIELD_SPACING = 6
const TITLE_HEIGHT = 14
const DIVIDER_HEIGHT = 10

type ExportData = {
  tipoAcao: string
  valorCausa: string
  taxa: string
  correios: string
  oficial: string
  total: string
  fundamento?: string
  observacao?: string
}

type CorrectionExportData = {
  valorPrincipal: string
  termoInicial: string
  termoFinal: string
  fatorInicial: string
  fatorFinal: string
  indice: string
  valorCorrigido: string
  correcaoAcumulada: string
  jurosDataInicial: string
  jurosDataFinal: string
  juros: string
  totalAtualizado: string
  breakdown: Array<{
    label: string
    period: string
    days: number
    amount: string
  }>
  fonteCorrecao: string
  fonteJuros: string
  versaoTabela?: string
  fonteTabela?: string
  versaoJuros?: string
}

const actionNames: Record<string, string> = {
  cobranca: 'Cobrança',
  execucao: 'Execução de título extrajudicial',
  cumprimento: 'Cumprimento de sentença',
  inventario: 'Inventário / Partilha',
  penalPrivada: 'Ação penal privada',
  alimentos: 'Alimentos',
}

const COLORS = {
  primary: [37, 99, 235] as const,
  dark: [15, 23, 42] as const,
  gray: [100, 116, 139] as const,
  lightGray: [148, 163, 184] as const,
  white: [248, 250, 252] as const,
  divider: [203, 213, 225] as const,
  summaryBg: [239, 246, 255] as const,
  summaryBorder: [59, 130, 246] as const,
}

function contentBottomY(): number {
  return PAGE_HEIGHT - MARGIN_BOTTOM
}

function ensureSpace(doc: jsPDF, y: number, needed: number, yRef: { value: number }): boolean {
  if (y + needed > contentBottomY()) {
    doc.addPage()
    yRef.value = MARGIN_TOP
    return false
  }
  return true
}

function ensureSectionSpace(doc: jsPDF, yRef: { value: number }, fieldCount: number, hasDividerAfter = true) {
  const dividerCost = hasDividerAfter ? DIVIDER_HEIGHT : 0
  const needed = TITLE_HEIGHT + fieldCount * FIELD_SPACING + dividerCost
  ensureSpace(doc, yRef.value, needed, yRef)
}

function drawHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(14, 14, 182, 28, 3, 3, 'F')

  doc.setTextColor(...COLORS.white)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 24, 32)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`TJSP Toolkit v${APP_VERSION} · Documento gerado automaticamente`, 24, 39)
}

function drawFooterOnPage(doc: jsPDF, dataHora: string) {
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const footerY = PAGE_HEIGHT - 20

    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.3)
    doc.line(14, footerY, 196, footerY)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    doc.text(`TJSP Toolkit v${APP_VERSION}`, 20, footerY + 5)
    doc.text(`Gerado em: ${dataHora}`, 20, footerY + 10)
    doc.text('https://vangl-dev.github.io/orcamento-custas-tjsp', 20, footerY + 15)
  }
}

function drawSectionTitle(doc: jsPDF, yRef: { value: number }, title: string): number {
  ensureSpace(doc, yRef.value, 18, yRef)
  const y = yRef.value

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(14, y, 182, 9, 2, 2, 'F')

  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, y + 6.5)

  yRef.value = y + TITLE_HEIGHT
  return yRef.value
}

function drawField(doc: jsPDF, yRef: { value: number }, label: string, value: string, opts?: { bold?: boolean; alignRight?: boolean }): number {
  const y = yRef.value

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text(label, 20, y)

  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')
  doc.setTextColor(...COLORS.dark)

  if (opts?.alignRight) {
    doc.text(value, 190, y, { align: 'right' })
  } else {
    doc.text(value, 72, y)
  }

  yRef.value = y + FIELD_SPACING
  return yRef.value
}

function drawDivider(doc: jsPDF, yRef: { value: number }): number {
  const y = yRef.value + 2
  doc.setDrawColor(...COLORS.divider)
  doc.setLineWidth(0.3)
  doc.line(14, y, 196, y)
  yRef.value = y + SECTION_SPACING
  return yRef.value
}

function drawSummaryBox(doc: jsPDF, yRef: { value: number }, lines: Array<{ label: string; value: string; bold?: boolean }>): number {
  const boxHeight = lines.length * 8 + 16

  ensureSpace(doc, yRef.value, boxHeight + 6, yRef)
  const y = yRef.value

  doc.setFillColor(...COLORS.summaryBg)
  doc.setDrawColor(...COLORS.summaryBorder)
  doc.setLineWidth(0.5)
  doc.roundedRect(14, y, 182, boxHeight, 3, 3, 'FD')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('Resumo Financeiro', 20, y + 10)

  let innerY = y + 20
  for (const line of lines) {
    if (line.bold) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.primary)
      doc.text(line.label, 20, innerY)
      doc.text(line.value, 190, innerY, { align: 'right' })
    } else {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.gray)
      doc.text(line.label, 20, innerY)
      doc.setTextColor(...COLORS.dark)
      doc.text(line.value, 190, innerY, { align: 'right' })
    }
    innerY += 8
  }

  yRef.value = y + boxHeight + 6
  return yRef.value
}

export function exportBudgetPdf(data: ExportData) {
  const doc = new jsPDF()
  const hoje = new Date().toLocaleString('pt-BR')

  drawHeader(doc, 'Memória de Cálculo — Custas Judiciais')

  const yRef = { value: 52 }

  ensureSectionSpace(doc, yRef, 2)
  drawSectionTitle(doc, yRef, 'Dados do Cálculo')
  drawField(doc, yRef, 'Tipo da ação', actionNames[data.tipoAcao] || data.tipoAcao || 'Não informada')
  drawField(doc, yRef, 'Valor da causa', data.valorCausa, { alignRight: true })
  drawDivider(doc, yRef)

  ensureSectionSpace(doc, yRef, 3)
  drawSectionTitle(doc, yRef, 'Custas Judiciais')
  drawField(doc, yRef, 'Taxa judiciária', data.taxa, { bold: true, alignRight: true })
  drawField(doc, yRef, 'Correios (citação postal)', data.correios, { alignRight: true })
  drawField(doc, yRef, 'Oficial de justiça', data.oficial, { alignRight: true })
  drawDivider(doc, yRef)

  drawSummaryBox(doc, yRef, [
    { label: 'Taxa judiciária', value: data.taxa },
    { label: 'Correios', value: data.correios },
    { label: 'Oficial', value: data.oficial },
    { label: 'TOTAL', value: data.total, bold: true },
  ])

  if (data.fundamento) {
    ensureSectionSpace(doc, yRef, 2)
    drawDivider(doc, yRef)
    drawSectionTitle(doc, yRef, 'Fundamento')
    drawField(doc, yRef, 'Base legal', data.fundamento)

    if (data.observacao) {
      drawField(doc, yRef, 'Observação', data.observacao)
    }
  }

  drawFooterOnPage(doc, hoje)

  doc.save('orcamento-custas-tjsp.pdf')
}

export function exportCorrectionPdf(data: CorrectionExportData) {
  const doc = new jsPDF()
  const hoje = new Date().toLocaleString('pt-BR')

  drawHeader(doc, 'Memória de Cálculo — Correção Monetária e Juros')

  const yRef = { value: 52 }

  const summaryLines = [
    { label: 'Valor principal', value: data.valorPrincipal },
    { label: 'Correção monetária', value: data.correcaoAcumulada },
    { label: 'Juros legais', value: data.juros },
    { label: 'TOTAL', value: data.totalAtualizado, bold: true },
  ]

  ensureSectionSpace(doc, yRef, 3)
  drawSectionTitle(doc, yRef, 'Dados do Cálculo')
  drawField(doc, yRef, 'Valor principal', data.valorPrincipal, { bold: true, alignRight: true })
  drawField(doc, yRef, 'Período da correção', `${data.termoInicial} a ${data.termoFinal}`)
  drawField(doc, yRef, 'Período dos juros', `${data.jurosDataInicial} a ${data.jurosDataFinal}`)
  drawDivider(doc, yRef)

  drawSummaryBox(doc, yRef, summaryLines)

  ensureSectionSpace(doc, yRef, 8)
  drawSectionTitle(doc, yRef, 'Correção Monetária')
  drawField(doc, yRef, 'Tabela utilizada', 'Tabela Prática do Tribunal de Justiça de São Paulo (IPCA-E)')
  drawField(doc, yRef, 'Fonte', data.fonteCorrecao)
  if (data.versaoTabela) {
    drawField(doc, yRef, 'Versão', data.versaoTabela)
  }
  drawField(doc, yRef, 'Fator inicial', data.fatorInicial, { alignRight: true })
  drawField(doc, yRef, 'Fator final', data.fatorFinal, { alignRight: true })
  drawField(doc, yRef, 'Índice aplicado', data.indice, { alignRight: true })
  drawField(doc, yRef, 'Valor corrigido', data.valorCorrigido, { bold: true, alignRight: true })
  drawField(doc, yRef, 'Correção acumulada', data.correcaoAcumulada, { alignRight: true })
  drawDivider(doc, yRef)

  ensureSectionSpace(doc, yRef, 5)
  drawSectionTitle(doc, yRef, 'Juros')
  drawField(doc, yRef, 'Critério aplicado', 'Juros legais — Art. 406 do Código Civil')
  drawField(doc, yRef, 'Fundamento legal', data.fonteJuros)
  if (data.versaoJuros) {
    drawField(doc, yRef, 'Versão', data.versaoJuros)
  }
  drawField(doc, yRef, 'Período', `${data.jurosDataInicial} a ${data.jurosDataFinal}`)
  drawField(doc, yRef, 'Valor dos juros', data.juros, { bold: true, alignRight: true })

  if (data.breakdown.length > 0) {
    ensureSectionSpace(doc, yRef, 1, false)
    drawDivider(doc, yRef)
    drawSectionTitle(doc, yRef, 'Detalhamento dos Juros')

    for (const item of data.breakdown) {
      ensureSpace(doc, yRef.value, 14, yRef)

      drawField(doc, yRef, item.label, item.amount, { alignRight: true })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.gray)
      doc.text(`${item.period} · ${item.days} dias`, 72, yRef.value)
      yRef.value += 5
    }
  }

  ensureSectionSpace(doc, yRef, 6, false)
  drawDivider(doc, yRef)
  drawSectionTitle(doc, yRef, 'Metodologia')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.gray)
  doc.text('Correção monetária:', 20, yRef.value)
  yRef.value += 4
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text('Valor principal × (Fator Final / Fator Inicial)', 26, yRef.value)
  yRef.value += 6
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.gray)
  doc.text('Juros:', 20, yRef.value)
  yRef.value += 4
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text('Aplicação da Taxa Legal acumulada entre as datas informadas.', 26, yRef.value)

  drawFooterOnPage(doc, hoje)

  doc.save('correcao-monetaria-tjsp.pdf')
}
