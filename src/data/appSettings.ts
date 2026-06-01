export type AppSettings = {
  ufesp: number
  salarioMinimo: number
  postal: number
  oficialDeslocamento: number
  oficialRemoto: number
  oficialComplemento: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  ufesp: 38.42,
  salarioMinimo: 1518,
  postal: 34.35,
  oficialDeslocamento: 115.26,
  oficialRemoto: 38.42,
  oficialComplemento: 76.84,
}

const STORAGE_KEY = 'orcamento-custas-settings'

export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return DEFAULT_SETTINGS
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings),
  )
}