import { MANUAL_LEGAL_INTEREST_RATES } from './manualDataUpdates'

export type LegalInterestRate = {
  year: number
  month: number
  monthlyRate: number
}

export const LEGAL_INTEREST_SOURCE_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.29543/dados?formato=json'

export const LEGAL_INTEREST_SOURCE_LABEL =
  'Juros legais — Art. 406 do Código Civil · Taxa Legal divulgada pelo Banco Central do Brasil (Série SGS 29543)'

export const LEGAL_INTEREST_PDF_SOURCE_LABEL =
  'Banco Central do Brasil — Taxa Legal (Série SGS 29543)'

const baseLegalInterestRates: LegalInterestRate[] = [
  { year: 2024, month: 8, monthlyRate: 0.006053 },
  { year: 2024, month: 9, monthlyRate: 0.006762 },
  { year: 2024, month: 10, monthlyRate: 0.007042 },
  { year: 2024, month: 11, monthlyRate: 0.003859 },
  { year: 2024, month: 12, monthlyRate: 0.001719 },
  { year: 2025, month: 1, monthlyRate: 0.005894 },
  { year: 2025, month: 2, monthlyRate: 0.009022 },
  { year: 2025, month: 3, monthlyRate: 0 },
  { year: 2025, month: 4, monthlyRate: 0.00322 },
  { year: 2025, month: 5, monthlyRate: 0.006232 },
  { year: 2025, month: 6, monthlyRate: 0.00776 },
  { year: 2025, month: 7, monthlyRate: 0.008349 },
  { year: 2025, month: 8, monthlyRate: 0.009426 },
  { year: 2025, month: 9, monthlyRate: 0.01306 },
  { year: 2025, month: 10, monthlyRate: 0.007364 },
  { year: 2025, month: 11, monthlyRate: 0.010938 },
  { year: 2025, month: 12, monthlyRate: 0.00851 },
  { year: 2026, month: 1, monthlyRate: 0.009675 },
  { year: 2026, month: 2, monthlyRate: 0.009622 },
  { year: 2026, month: 3, monthlyRate: 0.001557 },
  { year: 2026, month: 4, monthlyRate: 0.007687 },
  { year: 2026, month: 5, monthlyRate: 0.001983 },
]

export const LEGAL_INTEREST_RATES: LegalInterestRate[] = Array.from(
  [
    ...baseLegalInterestRates,
    ...MANUAL_LEGAL_INTEREST_RATES,
  ].reduce((map, item) => {
    map.set(`${item.year}-${item.month}`, item)

    return map
  }, new Map<string, LegalInterestRate>()).values(),
).sort((a, b) => a.year - b.year || a.month - b.month)
