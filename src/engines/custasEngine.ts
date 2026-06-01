type TipoOficial =
  | 'deslocamento'
  | 'remoto'
  | 'complemento'

type Settings = {
  postal: number
  oficialDeslocamento: number
  oficialRemoto: number
  oficialComplemento: number
}

type CustasInput = {
  postalQtd: number
  oficialQtd: number
  tipoOficial: TipoOficial
  settings: Settings
}

type CustasResult = {
  correios: number
  oficial: number
  total: number
}

export function calcularCustas({
  postalQtd,
  oficialQtd,
  tipoOficial,
  settings,
}: CustasInput): CustasResult {
  const correios =
    postalQtd * settings.postal

  const mapaOficial = {
    deslocamento: settings.oficialDeslocamento,
    remoto: settings.oficialRemoto,
    complemento: settings.oficialComplemento,
  }

  const oficial =
    oficialQtd * mapaOficial[tipoOficial]

  return {
    correios,
    oficial,
    total: correios + oficial,
  }
}