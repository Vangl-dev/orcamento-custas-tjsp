export const TJSP_RULES = {
  year: 2026,

  ufesp: 38.42,

  salarioMinimo: 1518,

  despesas: {
  postal: 34.35,

    oficial: {
      deslocamento: 115.26,
      remoto: 38.42,
      complemento: 76.84,
  },
},

  taxaJudiciaria: {
    conhecimento: {
      percentual: 0.015,
      minimoUfesp: 5,
      maximoUfesp: 3000,
    },

    execucao: {
      percentual: 0.02,
      minimoUfesp: 5,
      maximoUfesp: 3000,
    },

    cumprimento: {
      percentual: 0.015,
      minimoUfesp: 5,
      maximoUfesp: 3000,
    },

    inventario: {
      percentual: 0.02,
      minimoUfesp: 10,
      maximoUfesp: 3000,
    },
  },
}