import type { LegalInterestRate } from '../data/legalInterestRates'

type LegalInterestInput = {
  principal: number
  startDate: string
  endDate: string
  rates: LegalInterestRate[]
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

// Datas tratadas em UTC: sem horário de verão nem fuso do navegador
// interferindo na contagem de dias ou na formatação.
const dayInMs = 24 * 60 * 60 * 1000
const cc1916End = parseDate('2003-01-11')
const cc2002Start = parseDate('2003-01-12')
const cc2002End = parseDate('2024-08-29')
const taxaLegalStart = parseDate('2024-08-30')

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * dayInMs)
}

function minDate(a: Date, b: Date) {
  return a.getTime() <= b.getTime() ? a : b
}

function maxDate(a: Date, b: Date) {
  return a.getTime() >= b.getTime() ? a : b
}

function inclusiveDays(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / dayInMs) + 1
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function rateKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
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
  ratesByKey: Map<string, number>,
) {
  let cursor = start
  let amount = 0

  while (cursor.getTime() <= end.getTime()) {
    const year = cursor.getUTCFullYear()
    const month = cursor.getUTCMonth() + 1
    const monthEnd = new Date(Date.UTC(year, month, 0))
    const periodEnd = minDate(monthEnd, end)
    const key = rateKey(year, month)
    const monthlyRate = ratesByKey.get(key)

    if (monthlyRate === undefined) {
      return {
        amount,
        erro: `Taxa Legal não cadastrada para ${String(month).padStart(2, '0')}/${year}.`,
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
  rates,
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

  const start = parseDate(startDate)
  const end = parseDate(endDate)

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
    const ratesByKey = new Map(
      rates.map((item) => [rateKey(item.year, item.month), item.monthlyRate]),
    )
    const taxaLegal = calculateTaxaLegalInterest(
      principal,
      taxaLegalPeriodStart,
      end,
      ratesByKey,
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

export function getLegalInterestMonthBounds(rates: LegalInterestRate[]) {
  if (rates.length === 0) return { min: '', max: '' }

  const sorted = [...rates].sort((a, b) => a.year - b.year || a.month - b.month)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    min: rateKey(first.year, first.month),
    max: rateKey(last.year, last.month),
  }
}
