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
      `Falha ao carregar tabela de correção: ${response.status}`,
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
    throw new Error('Estrutura de metadata inválida no correction-table.json')
  }

  if (!Array.isArray(factors)) {
    throw new Error('Campo "factors" inválido no correction-table.json')
  }

  for (const f of factors) {
    if (
      typeof f.year !== 'number' ||
      typeof f.month !== 'number' ||
      typeof f.factor !== 'number'
    ) {
      throw new Error(
        `Fator inválido encontrado: ${JSON.stringify(f)}`,
      )
    }
  }

  cachedData = {
    metadata,
    factors: [...factors].sort(
      (a, b) => a.year - b.year || a.month - b.month,
    ),
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
