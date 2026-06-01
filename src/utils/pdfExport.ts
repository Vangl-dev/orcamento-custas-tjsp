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