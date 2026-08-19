import type { LegalInterestRate } from './legalInterestRates'

/*
  Atualizacoes mensais:

  Taxa Legal BCB, SGS 29543:
  - Copie a taxa mensal percentual e divida por 100.
  - Exemplo: 0,1983% vira 0.001983.
  - Exemplo para varios meses:
    { year: 2026, month: 6, monthlyRate: 0.004321 },
    { year: 2026, month: 7, monthlyRate: 0.00321 },
*/

export const MANUAL_LEGAL_INTEREST_RATES: LegalInterestRate[] = [
  { year: 2026, month: 6, monthlyRate: 0.00450641 },
  { year: 2026, month: 7, monthlyRate: 0.00706607 },
  { year: 2026, month: 8, monthlyRate: 0.01154527 },
]
