// Atualiza os dados usados pela ferramenta:
//   - public/data/correction-table.json  (Tabela Prática TJSP, publicada pela AASP)
//   - public/data/taxa-legal.json        (Taxa Legal, BCB série SGS 29543)
//
// Uso: node scripts/atualizar-dados.mjs
// Só regrava um arquivo quando há dado novo. Termina com erro (código 1) se a
// fonte mudar de formato ou se algum mês já publicado tiver sido alterado, para
// que a atualização pare e alguém confira antes.

import { readFile, writeFile } from 'node:fs/promises'

const AASP_URL =
  'https://www.aasp.org.br/produtos-servicos/indices-economicos/indices-judiciais/tabela-pratica-para-calculo-de-atualizacao-monetaria-ipca-e/'
const BCB_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.29543/dados?formato=json'

const CORRECTION_FILE = new URL('../public/data/correction-table.json', import.meta.url)
const LEGAL_RATES_FILE = new URL('../public/data/taxa-legal.json', import.meta.url)

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const today = new Date().toISOString().slice(0, 10)

function monthKey(item) {
  return `${item.year}-${String(item.month).padStart(2, '0')}`
}

function monthLabel(item) {
  return `${MONTH_NAMES[item.month - 1]}/${item.year}`
}

function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (orcamento-custas-tjsp)' },
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    throw new Error(`${url} respondeu ${response.status}`)
  }

  return response.text()
}

function assertContinuous(items, name) {
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1]
    const curr = items[i]
    const expectedMonth = prev.month === 12 ? 1 : prev.month + 1
    const expectedYear = prev.month === 12 ? prev.year + 1 : prev.year

    if (curr.year !== expectedYear || curr.month !== expectedMonth) {
      throw new Error(
        `${name}: descontinuidade entre ${monthKey(prev)} e ${monthKey(curr)}.`,
      )
    }
  }
}

// Meses já publicados não podem mudar; a fonte só pode acrescentar meses.
function assertOnlyAppended(oldItems, newItems, valueField, name) {
  const newByKey = new Map(newItems.map((item) => [monthKey(item), item]))

  for (const old of oldItems) {
    const current = newByKey.get(monthKey(old))

    if (!current) {
      throw new Error(`${name}: o mês ${monthKey(old)} sumiu da fonte.`)
    }

    if (Math.abs(current[valueField] - old[valueField]) > 1e-9) {
      throw new Error(
        `${name}: o valor de ${monthKey(old)} mudou de ${old[valueField]} para ${current[valueField]}. Conferir antes de atualizar.`,
      )
    }
  }
}

export function parseAaspTable(html) {
  const table = (html.match(/<table[\s\S]*?<\/table>/gi) ?? []).find((t) =>
    normalize(stripTags(t)).includes('janeiro'),
  )

  if (!table) {
    throw new Error('AASP: tabela não encontrada na página.')
  }

  const rows = (table.match(/<tr[\s\S]*?<\/tr>/gi) ?? []).map((row) =>
    (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) ?? []).map(stripTags),
  )

  const header = rows.shift()?.map(normalize) ?? []
  const expectedHeader = MONTH_NAMES.map(normalize)

  if (expectedHeader.some((name, i) => header[i + 1] !== name)) {
    throw new Error(`AASP: cabeçalho inesperado (${header.join(', ')}).`)
  }

  const factors = []

  for (const cells of rows) {
    const year = Number(cells[0])
    if (!Number.isInteger(year)) continue

    for (let month = 1; month <= 12; month++) {
      const text = cells[month] ?? ''
      if (!text) continue

      const factor = Number(text.replace(/\./g, '').replace(',', '.'))

      if (!Number.isFinite(factor) || factor <= 0) {
        throw new Error(`AASP: fator inválido "${text}" em ${month}/${year}.`)
      }

      factors.push({ year, month, factor })
    }
  }

  factors.sort((a, b) => a.year - b.year || a.month - b.month)
  assertContinuous(factors, 'AASP')

  return factors
}

export function parseBcbSeries(json) {
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('BCB: resposta vazia ou inesperada.')
  }

  const rates = json.map(({ data, valor }) => {
    const [, month, year] = String(data).split('/').map(Number)
    const percent = Number(valor)

    if (!year || !month || !Number.isFinite(percent) || percent < 0) {
      throw new Error(`BCB: registro inválido ${JSON.stringify({ data, valor })}.`)
    }

    return { year, month, monthlyRate: Number((percent / 100).toFixed(8)) }
  })

  rates.sort((a, b) => a.year - b.year || a.month - b.month)
  assertContinuous(rates, 'BCB')

  return rates
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return null
  }
}

async function writeJson(file, data) {
  await writeFile(file, JSON.stringify(data, null, 2) + '\n')
}

async function atualizarTabelaPratica() {
  const factors = parseAaspTable(await fetchText(AASP_URL))
  const current = await readJson(CORRECTION_FILE)
  const oldFactors = current?.factors ?? []

  assertOnlyAppended(oldFactors, factors, 'factor', 'AASP')

  if (factors.length === oldFactors.length) {
    console.log(`Tabela Prática: sem novidade (até ${monthLabel(factors.at(-1))}).`)
    return false
  }

  const last = factors.at(-1)

  await writeJson(CORRECTION_FILE, {
    metadata: {
      source: 'AASP',
      sourceUrl: AASP_URL,
      sourceLabel: 'Tabela Prática do Tribunal de Justiça de São Paulo (IPCA-E)',
      updatedAt: today,
      version: `${last.year}.${String(last.month).padStart(2, '0')}`,
      lastMonth: monthLabel(last),
      totalRecords: factors.length,
    },
    factors,
  })

  console.log(`Tabela Prática: atualizada até ${monthLabel(last)}.`)
  return true
}

async function atualizarTaxaLegal() {
  const rates = parseBcbSeries(JSON.parse(await fetchText(BCB_URL)))
  const current = await readJson(LEGAL_RATES_FILE)
  const oldRates = current?.rates ?? []

  assertOnlyAppended(oldRates, rates, 'monthlyRate', 'BCB')

  if (rates.length === oldRates.length) {
    console.log(`Taxa Legal: sem novidade (até ${monthLabel(rates.at(-1))}).`)
    return false
  }

  await writeJson(LEGAL_RATES_FILE, {
    metadata: {
      source: 'Banco Central do Brasil — SGS 29543',
      sourceUrl: BCB_URL,
      updatedAt: today,
      lastMonth: monthLabel(rates.at(-1)),
    },
    rates,
  })

  console.log(`Taxa Legal: atualizada até ${monthLabel(rates.at(-1))}.`)
  return true
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = await Promise.allSettled([
    atualizarTabelaPratica(),
    atualizarTaxaLegal(),
  ])

  const failures = results.filter((r) => r.status === 'rejected')
  for (const failure of failures) console.error(failure.reason.message)

  process.exit(failures.length > 0 ? 1 : 0)
}
