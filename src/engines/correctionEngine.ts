import type { CorrectionFactor } from '../services/correctionDataService'

type CorrectionInput = {
  valorPrincipal: number
  termoInicial: string
  termoFinal: string
}

export type CorrectionResult = {
  valorCorrigido: number
  diferenca: number
  indice: number | null
  fatorInicial: number | null
  fatorFinal: number | null
  erro?: string
  aviso?: string
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

  const sorted = [...factors].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )
  const last = sorted[sorted.length - 1]
  const lastKey = last
    ? `${last.year}-${String(last.month).padStart(2, '0')}`
    : ''

  const fatorInicial = factorsByKey.get(termoInicial)
  let fatorFinal = factorsByKey.get(termoFinal)
  let aviso: string | undefined

  if (fatorFinal === undefined && last && termoFinal > lastKey) {
    fatorFinal = last.factor
    aviso = `A tabela vai até ${String(last.month).padStart(2, '0')}/${last.year}. Para o termo final foi usado o fator desse mês.`
  }

  if (!valorPrincipal || valorPrincipal <= 0) {
    return {
      valorCorrigido: 0,
      diferenca: 0,
      indice: null,
      fatorInicial: fatorInicial ?? null,
      fatorFinal: fatorFinal ?? null,
      erro: 'Informe o valor principal.',
    }
  }

  if (!fatorInicial) {
    return {
      valorCorrigido: 0,
      diferenca: 0,
      indice: null,
      fatorInicial: null,
      fatorFinal: fatorFinal ?? null,
      erro: 'Termo inicial fora da tabela disponível.',
    }
  }

  if (!fatorFinal) {
    return {
      valorCorrigido: 0,
      diferenca: 0,
      indice: null,
      fatorInicial,
      fatorFinal: null,
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
    aviso,
  }
}
