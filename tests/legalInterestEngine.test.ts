import { describe, expect, it } from 'vitest'
import { calcularJurosLegais } from '../src/engines/legalInterestEngine'
import taxaLegal from '../public/data/taxa-legal.json'

const rates = taxaLegal.rates

function juros(startDate: string, endDate: string, principal = 1000) {
  return calcularJurosLegais({ principal, startDate, endDate, rates })
}

describe('juros legais', () => {
  it('conta todos os dias em período que atravessa o início do horário de verão', () => {
    // Horário de verão começou em 04/11/2018: 01/10 a 30/11 = 61 dias.
    const result = juros('2018-10-01', '2018-11-30')

    expect(result.erro).toBeUndefined()
    expect(result.breakdown).toHaveLength(1)
    expect(result.breakdown[0].days).toBe(61)
    expect(result.juros).toBeCloseTo(1000 * 0.12 * (61 / 365), 10)
  })

  it('separa os regimes do CC/1916, CC/2002 e da Taxa Legal', () => {
    const result = juros('2002-12-01', '2024-09-30')
    const [cc1916, cc2002, taxa] = result.breakdown

    expect(result.erro).toBeUndefined()
    expect(cc1916).toMatchObject({ startDate: '2002-12-01', endDate: '2003-01-11', days: 42 })
    expect(cc2002).toMatchObject({ startDate: '2003-01-12', endDate: '2024-08-29' })
    expect(taxa).toMatchObject({ startDate: '2024-08-30', endDate: '2024-09-30', days: 32 })
  })

  it('aplica a Taxa Legal proporcional aos dias do mês', () => {
    const result = juros('2025-05-01', '2025-05-31')
    const maio2025 = rates.find((r) => r.year === 2025 && r.month === 5)!.monthlyRate

    expect(result.juros).toBeCloseTo(1000 * maio2025, 10)
  })

  it('avisa quando falta a Taxa Legal de algum mês', () => {
    const result = calcularJurosLegais({
      principal: 1000,
      startDate: '2025-05-01',
      endDate: '2025-06-30',
      rates: rates.filter((r) => !(r.year === 2025 && r.month === 6)),
    })

    expect(result.erro).toBe('Taxa Legal não cadastrada para 06/2025.')
  })

  it('rejeita data inicial posterior à final', () => {
    expect(juros('2025-06-01', '2025-05-01').erro).toMatch(/anterior/)
  })
})
