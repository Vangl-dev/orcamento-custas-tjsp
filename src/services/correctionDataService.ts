export type CorrectionFactor = {
  year: number
  month: number
  factor: number
}

export type CorrectionTableMetadata = {
  version: string
  updatedAt: string
  source: string
  sourceUrl: string
  sourceLabel: string
}

export type CorrectionTableData = {
  metadata: CorrectionTableMetadata
  factors: CorrectionFactor[]
}

let cachedData: CorrectionTableData | null = null

export async function loadCorrectionData(): Promise<CorrectionTableData> {
  if (cachedData) return cachedData

  const response = await fetch(
    import.meta.env.BASE_URL + 'data/correction-table.json',
  )

  if (!response.ok) {
    throw new Error(
      'Não foi possível carregar a tabela de correção. Verifique se o arquivo de dados está disponível.',
    )
  }

  const json = await response.json()

  const metadata = json.metadata as CorrectionTableMetadata | undefined
  const factors = json.factors as CorrectionFactor[] | undefined

  if (
    !metadata ||
    typeof metadata.version !== 'string' ||
    typeof metadata.updatedAt !== 'string' ||
    typeof metadata.source !== 'string' ||
    typeof metadata.sourceUrl !== 'string' ||
    typeof metadata.sourceLabel !== 'string'
  ) {
    throw new Error('Tabela prática com estrutura de metadados inválida.')
  }

  if (!Array.isArray(factors) || factors.length === 0) {
    throw new Error('Tabela prática não contém dados de fatores.')
  }

  for (const f of factors) {
    if (
      typeof f.year !== 'number' ||
      typeof f.month !== 'number' ||
      typeof f.factor !== 'number'
    ) {
      throw new Error(
        `Tabela prática contém registro inválido: ano=${f.year}, mês=${f.month}.`,
      )
    }

    if (f.month < 1 || f.month > 12) {
      throw new Error(
        `Tabela prática contém mês inválido (${f.month}) no registro de ${f.year}.`,
      )
    }

    if (f.factor <= 0) {
      throw new Error(
        `Tabela prática contém fator inválido (${f.factor}) em ${f.month}/${f.year}. O fator deve ser maior que zero.`,
      )
    }
  }

  const sorted = [...factors].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    if (prev.year === curr.year && prev.month === curr.month) {
      throw new Error(
        `Tabela prática contém meses duplicados: ${curr.month}/${curr.year}.`,
      )
    }

    const expectedMonth = prev.month === 12 ? 1 : prev.month + 1
    const expectedYear = prev.month === 12 ? prev.year + 1 : prev.year

    if (curr.year !== expectedYear || curr.month !== expectedMonth) {
      throw new Error(
        `Tabela prática com descontinuidade entre ${prev.month}/${prev.year} e ${curr.month}/${curr.year}.`,
      )
    }
  }

  cachedData = {
    metadata,
    factors: sorted,
  }

  return cachedData
}

export function getMonthBounds(factors: CorrectionFactor[]) {
  if (factors.length === 0) {
    return { min: '', max: '' }
  }

  const sorted = [...factors].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )

  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    min: `${first.year}-${String(first.month).padStart(2, '0')}`,
    max: `${last.year}-${String(last.month).padStart(2, '0')}`,
  }
}
