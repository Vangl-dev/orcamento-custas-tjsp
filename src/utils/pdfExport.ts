import jsPDF from 'jspdf'

const APP_VERSION = '1.0.0'

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
  cobranca: 'Cobranca',
  execucao: 'Execucao de titulo extrajudicial',
  cumprimento: 'Cumprimento de sentenca',
  inventario: 'Inventario / Partilha',
  penalPrivada: 'Acao penal privada',
  alimentos: 'Alimentos',
}

const COLORS = {
  primary: [37, 99, 235] as const,
  dark: [15, 23, 42] as const,
  gray: [100, 116, 139] as const,
  lightGray: [148, 163, 184] as const,
  white: [248, 250, 252] as const,
  accent: [34, 197, 94] as const,
  divider: [203, 213, 225] as const,
  summaryBg: [239, 246, 255] as const,
  summaryBorder: [59, 130, 246] as const,
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

function drawSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(14, y, 182, 9, 2, 2, 'F')

  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, y + 6.5)

  return y + 14
}

function drawField(doc: jsPDF, y: number, label: string, value: string, bold = false) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text(label, 20, y)

  doc.setFont('helvetica', bold ? 'bold' : 'normal')
  doc.setTextColor(...COLORS.dark)
  doc.text(value, 72, y)

  return y + 6
}

function drawDivider(doc: jsPDF, y: number) {
  doc.setDrawColor(...COLORS.divider)
  doc.setLineWidth(0.3)
  doc.line(14, y, 196, y)
  return y + 4
}

function drawSummaryBox(doc: jsPDF, y: number, lines: Array<{ label: string; value: string; bold?: boolean }>) {
  const boxHeight = lines.length * 7 + 14

  doc.setFillColor(...COLORS.summaryBg)
  doc.setDrawColor(...COLORS.summaryBorder)
  doc.setLineWidth(0.5)
  doc.roundedRect(14, y, 182, boxHeight, 3, 3, 'FD')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('Resumo Financeiro', 20, y + 9)

  let innerY = y + 18
  for (const line of lines) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    doc.text(line.label, 20, innerY)

    doc.setFont('helvetica', line.bold ? 'bold' : 'normal')
    if (line.bold) {
      doc.setTextColor(...COLORS.primary)
    } else {
      doc.setTextColor(...COLORS.dark)
    }
    doc.text(line.value, 72, innerY)
    innerY += 7
  }

  return y + boxHeight + 4
}

function drawFooter(doc: jsPDF, dataHora: string) {
  const footerY = 272

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

export function exportBudgetPdf(data: ExportData) {
  const doc = new jsPDF()
  const hoje = new Date().toLocaleString('pt-BR')

  drawHeader(doc, 'Memoria de Calculo — Custas Judiciais')

  let y = 52

  y = drawSectionTitle(doc, y, 'Dados do Calculo')
  y = drawField(doc, y, 'Tipo da acao', actionNames[data.tipoAcao] || data.tipoAcao || 'Nao informada')
  y = drawField(doc, y, 'Valor da causa', data.valorCausa)
  y = drawDivider(doc, y + 2)

  y = drawSectionTitle(doc, y, 'Custas Judiciais')
  y = drawField(doc, y, 'Taxa judiciaria', data.taxa, true)
  y = drawField(doc, y, 'Correios (citacao postal)', data.correios)
  y = drawField(doc, y, 'Oficial de justica', data.oficial)
  y = drawDivider(doc, y + 2)

  y = drawSummaryBox(doc, y, [
    { label: 'Taxa judiciaria', value: data.taxa },
    { label: 'Correios', value: data.correios },
    { label: 'Oficial', value: data.oficial },
    { label: 'TOTAL', value: data.total, bold: true },
  ])

  if (data.fundamento) {
    y = drawDivider(doc, y)
    y = drawSectionTitle(doc, y, 'Fundamento')
    y = drawField(doc, y, 'Base legal', data.fundamento)

    if (data.observacao) {
      drawField(doc, y, 'Observacao', data.observacao)
    }
  }

  drawFooter(doc, hoje)

  doc.save('orcamento-custas-tjsp.pdf')
}

export function exportCorrectionPdf(data: CorrectionExportData) {
  const doc = new jsPDF()
  const hoje = new Date().toLocaleString('pt-BR')

  drawHeader(doc, 'Memoria de Calculo — Correcao Monetaria e Juros')

  let y = 52

  y = drawSectionTitle(doc, y, 'Dados do Calculo')
  y = drawField(doc, y, 'Valor principal', data.valorPrincipal)
  y = drawField(doc, y, 'Periodo da correcao', `${data.termoInicial} a ${data.termoFinal}`)
  y = drawField(doc, y, 'Periodo dos juros', `${data.jurosDataInicial} a ${data.jurosDataFinal}`)
  y = drawDivider(doc, y + 2)

  y = drawSectionTitle(doc, y, 'Correcao Monetaria')
  y = drawField(doc, y, 'Tabela utilizada', 'Tabela Pratica do TJSP (IPCA-E)')
  y = drawField(doc, y, 'Fonte', data.fonteCorrecao)
  if (data.versaoTabela) {
    y = drawField(doc, y, 'Versao', data.versaoTabela)
  }
  y = drawField(doc, y, 'Fator inicial', data.fatorInicial)
  y = drawField(doc, y, 'Fator final', data.fatorFinal)
  y = drawField(doc, y, 'Indice aplicado', data.indice)
  y = drawField(doc, y, 'Valor corrigido', data.valorCorrigido, true)
  y = drawField(doc, y, 'Correcao acumulada', data.correcaoAcumulada)
  y = drawDivider(doc, y + 2)

  y = drawSectionTitle(doc, y, 'Juros')
  y = drawField(doc, y, 'Criterio aplicado', 'Juros legais — Art. 406 do Codigo Civil')
  y = drawField(doc, y, 'Fundamento legal', data.fonteJuros)
  if (data.versaoJuros) {
    y = drawField(doc, y, 'Versao', data.versaoJuros)
  }
  y = drawField(doc, y, 'Periodo', `${data.jurosDataInicial} a ${data.jurosDataFinal}`)
  y = drawField(doc, y, 'Valor dos juros', data.juros, true)

  if (data.breakdown.length > 0) {
    y = drawDivider(doc, y + 2)
    y = drawSectionTitle(doc, y, 'Detalhamento dos Juros')

    for (const item of data.breakdown) {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      y = drawField(doc, y, item.label, item.amount)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.gray)
      doc.text(`${item.period} · ${item.days} dias`, 72, y)
      y += 6
    }
  }

  y = drawDivider(doc, y + 2)

  y = drawSummaryBox(doc, y, [
    { label: 'Valor principal', value: data.valorPrincipal },
    { label: 'Correcao monetaria', value: data.correcaoAcumulada },
    { label: 'Juros legais', value: data.juros },
    { label: 'TOTAL', value: data.totalAtualizado, bold: true },
  ])

  y = drawSectionTitle(doc, y, 'Metodologia')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text('Correcao monetaria:', 20, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text('Valor principal x (Fator Final / Fator Inicial)', 26, y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text('Juros:', 20, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text('Aplicacao da Taxa Legal acumulada entre as datas informadas.', 26, y)

  drawFooter(doc, hoje)

  doc.save('correcao-monetaria-tjsp.pdf')
}
