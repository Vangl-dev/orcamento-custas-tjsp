import type { CorrectionFactor } from '../services/correctionDataService'

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

export function calcularCorrecaoMonetaria(
  factors: CorrectionFactor[],
  { valorPrincipal, termoInicial, termoFinal }: CorrectionInput,
): CorrectionResult {
  const factorsByKey = new Map(
    factors.map((item) => [
      `${item.year}-${String(item.month).padStart(2, '0')}`,
      item.factor,
    ]),
  )

  const fatorInicial = factorsByKey.get(termoInicial)
  const fatorFinal = factorsByKey.get(termoFinal)

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
