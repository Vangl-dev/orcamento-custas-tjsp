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
