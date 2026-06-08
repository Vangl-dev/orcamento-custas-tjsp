import jsPDF from 'jspdf'

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
}

const actionNames: Record<string, string> = {
  cobranca: 'Cobrança',
  execucao: 'Execução de título extrajudicial',
  cumprimento: 'Cumprimento de sentença',
  inventario: 'Inventário / Partilha',
  penalPrivada: 'Ação penal privada',
  alimentos: 'Alimentos',
}

export function exportBudgetPdf(data: ExportData) {
  const doc = new jsPDF()

  const hoje = new Date().toLocaleString('pt-BR')

  doc.setFontSize(18)
  doc.text('Orçamento Inicial de Custas - TJSP', 20, 20)

  doc.setFontSize(10)
  doc.text(`Gerado em: ${hoje}`, 20, 28)

  doc.setFontSize(12)

  let y = 45

  const linhas = [
    ['Tipo da ação', actionNames[data.tipoAcao] || data.tipoAcao],
    ['Valor da causa', data.valorCausa],
    ['Taxa judiciária', data.taxa],
    ['Correios', data.correios],
    ['Oficial de justiça', data.oficial],
    ['Total estimado', data.total],
    ['Fundamento', data.fundamento || '-'],
    ['Observações', data.observacao || '-'],
  ]

  linhas.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 20, y)
    y += 10
  })

  doc.save('orcamento-custas-tjsp.pdf')
}

export function exportCorrectionPdf(data: CorrectionExportData) {
  const doc = new jsPDF()
  const hoje = new Date().toLocaleString('pt-BR')

  doc.setFontSize(18)
  doc.text('Correção Monetária e Juros - TJSP', 20, 20)

  doc.setFontSize(10)
  doc.text(`Gerado em: ${hoje}`, 20, 28)

  doc.setFontSize(12)

  let y = 45
  const linhas = [
    ['Valor principal', data.valorPrincipal],
    ['Termo inicial', data.termoInicial],
    ['Termo final', data.termoFinal],
    ['Fator inicial', data.fatorInicial],
    ['Fator final', data.fatorFinal],
    ['Índice aplicado', data.indice],
    ['Valor corrigido', data.valorCorrigido],
    ['Correção acumulada', data.correcaoAcumulada],
    ['Início dos juros', data.jurosDataInicial],
    ['Fim dos juros', data.jurosDataFinal],
    ['Juros legais', data.juros],
    ['Total atualizado', data.totalAtualizado],
  ]

  linhas.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 20, y)
    y += 8
  })

  if (data.breakdown.length > 0) {
    y += 6
    doc.setFontSize(14)
    doc.text('Detalhamento dos juros', 20, y)
    y += 9
    doc.setFontSize(11)

    data.breakdown.forEach((item) => {
      const lines = doc.splitTextToSize(
        `${item.label}: ${item.amount} (${item.period}, ${item.days} dias)`,
        170,
      )
      doc.text(lines, 20, y)
      y += lines.length * 6 + 3
    })
  }

  y += 6
  doc.setFontSize(10)
  doc.text(doc.splitTextToSize(`Correção: ${data.fonteCorrecao}`, 170), 20, y)
  y += 10
  doc.text(doc.splitTextToSize(`Juros: ${data.fonteJuros}`, 170), 20, y)

  doc.save('correcao-monetaria-tjsp.pdf')
}
