import { TJSP_CORRECTION_FACTORS } from '../data/tjspCorrectionFactors'

type CorrectionInput = {
  valorPrincipal: number
  termoInicial: string
  termoFinal: string
}

export type CorrectionResult = {
  valorCorrigido: number
  diferenca: number
  indice: number
  fatorInicial: number
  fatorFinal: number
  erro?: string
}

const factorsByKey = new Map(
  TJSP_CORRECTION_FACTORS.map((item) => [
    `${item.year}-${String(item.month).padStart(2, '0')}`,
    item.factor,
  ]),
)

function getFactor(monthKey: string) {
  return factorsByKey.get(monthKey)
}

export function calcularCorrecaoMonetaria({
  valorPrincipal,
  termoInicial,
  termoFinal,
}: CorrectionInput): CorrectionResult {
  const fatorInicial = getFactor(termoInicial)
  const fatorFinal = getFactor(termoFinal)

  if (!valorPrincipal || valorPrincipal <= 0) {
    return {
      valorCorrigido: 0,
      diferenca: 0,
      indice: 0,
      fatorInicial: fatorInicial ?? 0,
      fatorFinal: fatorFinal ?? 0,
      erro: 'Informe o valor principal.',
    }
  }

  if (!fatorInicial) {
    return {
      valorCorrigido: 0,
      diferenca: 0,
      indice: 0,
      fatorInicial: 0,
      fatorFinal: fatorFinal ?? 0,
      erro: 'Termo inicial fora da tabela disponível.',
    }
  }

  if (!fatorFinal) {
    return {
      valorCorrigido: 0,
      diferenca: 0,
      indice: 0,
      fatorInicial,
      fatorFinal: 0,
      erro: 'Termo final fora da tabela disponível.',
    }
  }

  const indice = fatorFinal / fatorInicial
  const valorCorrigido = valorPrincipal * indice

  return {
    valorCorrigido,
    diferenca: valorCorrigido - valorPrincipal,
    indice,
    fatorInicial,
    fatorFinal,
  }
}

export function getCorrectionMonthBounds() {
  const sorted = [...TJSP_CORRECTION_FACTORS].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    min: `${first.year}-${String(first.month).padStart(2, '0')}`,
    max: `${last.year}-${String(last.month).padStart(2, '0')}`,
  }
}
