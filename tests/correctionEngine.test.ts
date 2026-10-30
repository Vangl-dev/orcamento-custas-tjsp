import { describe, expect, it } from 'vitest'
import { calcularCorrecaoMonetaria } from '../src/engines/correctionEngine'

const factors = [
  { year: 2025, month: 11, factor: 2 },
  { year: 2025, month: 12, factor: 2.5 },
  { year: 2026, month: 1, factor: 3 },
]

describe('correção monetária', () => {
  it('multiplica o principal pela razão entre os fatores', () => {
    const result = calcularCorrecaoMonetaria(factors, {
      valorPrincipal: 1000,
      termoInicial: '2025-11',
      termoFinal: '2026-01',
    })

    expect(result.valorCorrigido).toBe(1500)
    expect(result.diferenca).toBe(500)
    expect(result.aviso).toBeUndefined()
  })

  it('usa o último fator e avisa quando o termo final passa da tabela', () => {
    const result = calcularCorrecaoMonetaria(factors, {
      valorPrincipal: 1000,
      termoInicial: '2025-11',
      termoFinal: '2026-05',
    })

    expect(result.valorCorrigido).toBe(1500)
    expect(result.aviso).toMatch(/01\/2026/)
  })

  it('recusa termo inicial fora da tabela', () => {
    const result = calcularCorrecaoMonetaria(factors, {
      valorPrincipal: 1000,
      termoInicial: '2020-01',
      termoFinal: '2026-01',
    })

    expect(result.erro).toMatch(/Termo inicial/)
  })
})
