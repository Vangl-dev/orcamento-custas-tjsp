import { describe, expect, it } from 'vitest'
// @ts-expect-error script em JavaScript puro, sem tipos
import { parseAaspTable, parseBcbSeries } from '../scripts/atualizar-dados.mjs'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function aaspHtml(rows: string[][]) {
  const head = ['Ano/Mês', ...MONTHS].map((m) => `<th class="x">${m}</th>`).join('')
  const body = rows
    .map((cells) => `<tr>${cells.map((c) => `<td class="x">${c}</td>`).join('')}</tr>`)
    .join('')

  return `<html><table style="w"><tr><td>outra</td></tr></table>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></html>`
}

describe('leitura da tabela da AASP', () => {
  it('converte números no formato brasileiro e ignora meses vazios', () => {
    const html = aaspHtml([
      ['2025', ...Array.from({ length: 12 }, (_, i) => `1.00${i},500000`)],
      ['2026', '8,309359', '8,325977', ...Array(10).fill('')],
    ])
    const factors = parseAaspTable(html)

    expect(factors).toHaveLength(14)
    expect(factors[0]).toEqual({ year: 2025, month: 1, factor: 1000.5 })
    expect(factors.at(-1)).toEqual({ year: 2026, month: 2, factor: 8.325977 })
  })

  it('para com erro se o cabeçalho da página mudar', () => {
    const html = aaspHtml([]).replace('Março', 'Mar')

    expect(() => parseAaspTable(html)).toThrow(/cabeçalho/)
  })
})

describe('leitura da Taxa Legal do BCB', () => {
  it('converte percentual em taxa decimal', () => {
    expect(
      parseBcbSeries([
        { data: '01/05/2026', valor: '0.198293' },
        { data: '01/06/2026', valor: '0.450641' },
      ]),
    ).toEqual([
      { year: 2026, month: 5, monthlyRate: 0.00198293 },
      { year: 2026, month: 6, monthlyRate: 0.00450641 },
    ])
  })

  it('para com erro se faltar um mês na série', () => {
    expect(() =>
      parseBcbSeries([
        { data: '01/05/2026', valor: '0.1' },
        { data: '01/07/2026', valor: '0.1' },
      ]),
    ).toThrow(/descontinuidade/)
  })
})
