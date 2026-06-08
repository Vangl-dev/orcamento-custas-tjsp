import type { LegalInterestRate } from './legalInterestRates'
import type { CorrectionFactor } from './tjspCorrectionFactors'

/*
  Atualizacoes mensais:

  1. Tabela Pratica TJSP:
     - Copie do PDF oficial o fator do mes novo.
     - Use ponto decimal, sem separador de milhar.
     - Exemplo para varios meses:
       { year: 2026, month: 6, factor: 104.999999 },
       { year: 2026, month: 7, factor: 105.123456 },

  2. Taxa Legal BCB, SGS 29543:
     - Copie a taxa mensal percentual e divida por 100.
     - Exemplo: 0,1983% vira 0.001983.
     - Exemplo para varios meses:
       { year: 2026, month: 6, monthlyRate: 0.004321 },
       { year: 2026, month: 7, monthlyRate: 0.00321 },
*/

export const MANUAL_TJSP_CORRECTION_FACTORS: CorrectionFactor[] = [
  // Cole aqui os novos fatores da Tabela Pratica TJSP.
]

export const MANUAL_LEGAL_INTEREST_RATES: LegalInterestRate[] = [
  // Cole aqui as novas taxas legais mensais do BCB.
]
