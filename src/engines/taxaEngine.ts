import { TJSP_FEE_SCHEDULES } from '../data/tjspFeeSchedules'

type Settings = {
  ufesp: number
  salarioMinimo: number
}

type TaxaInput = {
  tipoAcao: string
  valorCausa: number
  valorPrestacao?: number
  settings: Settings
}

type TaxaResult = {
  valor: number
  fundamento: string
  observacao?: string
}

function aplicarMinimoMaximo(
  valorCalculado: number,
  minimoUfesp: number,
  maximoUfesp: number,
  ufesp: number,
) {
  const minimo = minimoUfesp * ufesp
  const maximo = maximoUfesp * ufesp

  if (valorCalculado < minimo) return minimo
  if (valorCalculado > maximo) return maximo

  return valorCalculado
}

export function calcularTaxaJudiciaria({
  tipoAcao,
  valorCausa,
  valorPrestacao = 0,
  settings,
}: TaxaInput): TaxaResult {
  if (
    tipoAcao === 'alimentos' &&
    valorPrestacao > 0 &&
    valorPrestacao <= settings.salarioMinimo * 2
  ) {
    return {
      valor: 0,
      fundamento: 'Art. 7º, III, Lei 11.608/2003',
      observacao:
        'Não incidência para alimentos até 2 salários mínimos.',
    }
  }

  if (
    tipoAcao === 'penalPrivada'
  ) {
    return {
      valor: 100 * settings.ufesp,
      fundamento: 'Ação penal privada',
    }
  }

  if (!valorCausa || valorCausa <= 0) {
    return {
      valor: 0,
      fundamento: 'Sem base de cálculo',
    }
  }

  const regra = TJSP_FEE_SCHEDULES[tipoAcao]

  if (!regra) {
    return {
      valor: 0,
      fundamento: 'Modalidade não configurada',
    }
  }

  if (regra.kind === 'percentual') {
    const bruto =
      valorCausa * regra.percentual

    return {
      valor: aplicarMinimoMaximo(
        bruto,
        regra.minimoUfesp,
        regra.maximoUfesp,
        settings.ufesp,
      ),
      fundamento: regra.fundamento,
    }
  }

  if (regra.kind === 'faixas') {
    const faixa = regra.faixas.find(
      (f: { ate: number; ufesp: number }) =>
        valorCausa <= f.ate,
    )

    if (!faixa) {
      return {
        valor: 0,
        fundamento: 'Faixa não encontrada',
      }
    }

    return {
      valor: faixa.ufesp * settings.ufesp,
      fundamento: regra.fundamento,
    }
  }

  if (regra.kind === 'fixaUfesp') {
    return {
      valor: regra.ufesp * settings.ufesp,
      fundamento: regra.fundamento,
    }
  }

  return {
    valor: 0,
    fundamento: 'Regra não reconhecida',
  }
}