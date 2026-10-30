import {
  LEGAL_INTEREST_SOURCE_URL,
  type LegalInterestRate,
} from '../data/legalInterestRates'

let cachedRates: LegalInterestRate[] | null = null

function rateKey(item: LegalInterestRate) {
  return `${item.year}-${String(item.month).padStart(2, '0')}`
}

function isValidRate(item: LegalInterestRate) {
  return (
    Number.isInteger(item.year) &&
    Number.isInteger(item.month) &&
    item.month >= 1 &&
    item.month <= 12 &&
    Number.isFinite(item.monthlyRate) &&
    item.monthlyRate >= 0
  )
}

async function loadPublishedRates(): Promise<LegalInterestRate[]> {
  const response = await fetch(import.meta.env.BASE_URL + 'data/taxa-legal.json')

  if (!response.ok) {
    throw new Error('Não foi possível carregar a tabela da Taxa Legal.')
  }

  const json = await response.json()
  const rates = json.rates as LegalInterestRate[] | undefined

  if (!Array.isArray(rates) || rates.length === 0 || !rates.every(isValidRate)) {
    throw new Error('Tabela da Taxa Legal com estrutura inválida.')
  }

  return rates
}

// Consulta direta ao BCB: cobre os meses publicados depois da última
// atualização automática do arquivo. Se falhar, fica valendo o arquivo.
async function loadLiveRates(): Promise<LegalInterestRate[]> {
  try {
    const response = await fetch(LEGAL_INTEREST_SOURCE_URL, {
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) return []

    const json = (await response.json()) as Array<{ data: string; valor: string }>

    return json
      .map(({ data, valor }) => {
        const [, month, year] = data.split('/').map(Number)

        return {
          year,
          month,
          monthlyRate: Number((Number(valor) / 100).toFixed(8)),
        }
      })
      .filter(isValidRate)
  } catch {
    return []
  }
}

export async function loadLegalInterestRates(): Promise<LegalInterestRate[]> {
  if (cachedRates) return cachedRates

  const [published, live] = await Promise.all([
    loadPublishedRates(),
    loadLiveRates(),
  ])

  const byKey = new Map(published.map((item) => [rateKey(item), item]))

  // O BCB só acrescenta meses novos; meses já publicados ficam como estão.
  for (const item of live) {
    if (!byKey.has(rateKey(item))) byKey.set(rateKey(item), item)
  }

  cachedRates = [...byKey.values()].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )

  return cachedRates
}
