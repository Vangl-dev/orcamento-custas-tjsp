export type FeeRule =
  | {
      kind: 'percentual'
      percentual: number
      minimoUfesp: number
      maximoUfesp: number
      fundamento: string
    }
  | {
      kind: 'faixas'
      faixas: Array<{
        ate: number
        ufesp: number
      }>
      fundamento: string
    }
  | {
      kind: 'fixaUfesp'
      ufesp: number
      fundamento: string
    }

export const TJSP_FEE_SCHEDULES: Record<string, FeeRule> = {
  cobranca: {
    kind: 'percentual',
    percentual: 0.015,
    minimoUfesp: 5,
    maximoUfesp: 3000,
    fundamento: 'Taxa judiciária cível',
  },

  cumprimento: {
    kind: 'percentual',
    percentual: 0.02,
    minimoUfesp: 5,
    maximoUfesp: 3000,
    fundamento: 'Cumprimento de sentença',
  },

  execucao: {
    kind: 'percentual',
    percentual: 0.01,
    minimoUfesp: 5,
    maximoUfesp: 3000,
    fundamento: 'Execução de título extrajudicial',
  },

  inventario: {
    kind: 'faixas',
    fundamento: 'Inventário / Partilha',
    faixas: [
      { ate: 50000, ufesp: 10 },
      { ate: 500000, ufesp: 100 },
      { ate: 2000000, ufesp: 300 },
      { ate: 5000000, ufesp: 1000 },
      { ate: Infinity, ufesp: 3000 },
    ],
  },
  alimentos: {
    kind: 'percentual',
    percentual: 0.015,
    minimoUfesp: 5,
    maximoUfesp: 3000,
    fundamento: 'Ação de alimentos',
  },
  penalPrivada: {
    kind: 'fixaUfesp',
    ufesp: 100,
    fundamento: 'Ação penal privada',
  },
}