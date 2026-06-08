import { LEGAL_INTEREST_RATES } from '../data/legalInterestRates'

type LegalInterestInput = {
  principal: number
  startDate: string
  endDate: string
}

export type LegalInterestBreakdown = {
  label: string
  startDate: string
  endDate: string
  days: number
  amount: number
}

export type LegalInterestResult = {
  juros: number
  breakdown: LegalInterestBreakdown[]
  erro?: string
}

const dayInMs = 24 * 60 * 60 * 1000
const cc1916End = parseLocalDate('2003-01-11')
const cc2002Start = parseLocalDate('2003-01-12')
const cc2002End = parseLocalDate('2024-08-29')
const taxaLegalStart = parseLocalDate('2024-08-30')

const legalRatesByKey = new Map(
  LEGAL_INTEREST_RATES.map((item) => [
    `${item.year}-${String(item.month).padStart(2, '0')}`,
    item.monthlyRate,
  ]),
)

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addDays(value: Date, days: number) {
  const next = new Date(value)
  next.setDate(next.getDate() + days)

  return next
}

function minDate(a: Date, b: Date) {
  return a.getTime() <= b.getTime() ? a : b
}

function maxDate(a: Date, b: Date) {
  return a.getTime() >= b.getTime() ? a : b
}

function inclusiveDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / dayInMs) + 1
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function simpleAnnualInterest(
  principal: number,
  start: Date,
  end: Date,
  annualRate: number,
) {
  const days = inclusiveDays(start, end)

  return principal * annualRate * (days / 365)
}

function calculateTaxaLegalInterest(
  principal: number,
  start: Date,
  end: Date,
) {
  let cursor = new Date(start)
  let amount = 0

  while (cursor.getTime() <= end.getTime()) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth() + 1
    const monthEnd = new Date(year, month, 0)
    const periodEnd = minDate(monthEnd, end)
    const key = `${year}-${String(month).padStart(2, '0')}`
    const monthlyRate = legalRatesByKey.get(key)

    if (monthlyRate === undefined) {
      return {
        amount,
        erro: `Taxa Legal não cadastrada para ${key}.`,
      }
    }

    const periodDays = inclusiveDays(cursor, periodEnd)
    amount += principal * monthlyRate * (periodDays / daysInMonth(year, month))
    cursor = addDays(periodEnd, 1)
  }

  return { amount }
}

function addBreakdown(
  breakdown: LegalInterestBreakdown[],
  label: string,
  start: Date,
  end: Date,
  amount: number,
) {
  if (start.getTime() > end.getTime()) return

  breakdown.push({
    label,
    startDate: formatDate(start),
    endDate: formatDate(end),
    days: inclusiveDays(start, end),
    amount,
  })
}

export function calcularJurosLegais({
  principal,
  startDate,
  endDate,
}: LegalInterestInput): LegalInterestResult {
  if (!principal || principal <= 0) {
    return {
      juros: 0,
      breakdown: [],
      erro: 'Informe o valor principal para calcular juros.',
    }
  }

  if (!startDate || !endDate) {
    return {
      juros: 0,
      breakdown: [],
      erro: 'Informe a data inicial e a data final dos juros.',
    }
  }

  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)

  if (start.getTime() > end.getTime()) {
    return {
      juros: 0,
      breakdown: [],
      erro: 'A data inicial dos juros deve ser anterior à data final.',
    }
  }

  const breakdown: LegalInterestBreakdown[] = []

  const cc1916Start = start
  const cc1916PeriodEnd = minDate(end, cc1916End)
  if (cc1916Start.getTime() <= cc1916PeriodEnd.getTime()) {
    addBreakdown(
      breakdown,
      'Código Civil 1916: 6% a.a.',
      cc1916Start,
      cc1916PeriodEnd,
      simpleAnnualInterest(principal, cc1916Start, cc1916PeriodEnd, 0.06),
    )
  }

  const cc2002PeriodStart = maxDate(start, cc2002Start)
  const cc2002PeriodEnd = minDate(end, cc2002End)
  if (cc2002PeriodStart.getTime() <= cc2002PeriodEnd.getTime()) {
    addBreakdown(
      breakdown,
      'CC/2002 + CTN: 12% a.a.',
      cc2002PeriodStart,
      cc2002PeriodEnd,
      simpleAnnualInterest(principal, cc2002PeriodStart, cc2002PeriodEnd, 0.12),
    )
  }

  const taxaLegalPeriodStart = maxDate(start, taxaLegalStart)
  if (taxaLegalPeriodStart.getTime() <= end.getTime()) {
    const taxaLegal = calculateTaxaLegalInterest(
      principal,
      taxaLegalPeriodStart,
      end,
    )

    addBreakdown(
      breakdown,
      'Taxa Legal, art. 406 do CC',
      taxaLegalPeriodStart,
      end,
      taxaLegal.amount,
    )

    if (taxaLegal.erro) {
      return {
        juros: breakdown.reduce((sum, item) => sum + item.amount, 0),
        breakdown,
        erro: taxaLegal.erro,
      }
    }
  }

  return {
    juros: breakdown.reduce((sum, item) => sum + item.amount, 0),
    breakdown,
  }
}

export function getLegalInterestMonthBounds() {
  const sorted = [...LEGAL_INTEREST_RATES].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    min: `${first.year}-${String(first.month).padStart(2, '0')}`,
    max: `${last.year}-${String(last.month).padStart(2, '0')}`,
    maxDate: `${last.year}-${String(last.month).padStart(2, '0')}-${String(
      daysInMonth(last.year, last.month),
    ).padStart(2, '0')}`,
  }
}
