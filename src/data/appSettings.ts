export type AppSettings = {
  ufesp: number
  salarioMinimo: number
  postal: number
  oficialDeslocamento: number
  oficialRemoto: number
  oficialComplemento: number
}

// Ao alterar algum valor abaixo, mude também DEFAULTS_VERSION: assim os
// ajustes que cada usuário salvou sobre os valores antigos são descartados.
export const DEFAULTS_VERSION = '2026-10'

export const DEFAULT_SETTINGS: AppSettings = {
  ufesp: 38.42,
  salarioMinimo: 1621,
  postal: 34.35,
  oficialDeslocamento: 115.26,
  oficialRemoto: 38.42,
  oficialComplemento: 76.84,
}

const STORAGE_KEY = 'orcamento-custas-settings'

type StoredSettings = {
  defaultsVersion: string
  overrides: Partial<AppSettings>
}

function isValidValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function loadSettings(): AppSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')

    // Formato antigo (sem versão) ou versão anterior dos padrões: descarta.
    if (!saved || saved.defaultsVersion !== DEFAULTS_VERSION) {
      return DEFAULT_SETTINGS
    }

    const settings = { ...DEFAULT_SETTINGS }

    for (const field of Object.keys(DEFAULT_SETTINGS) as Array<keyof AppSettings>) {
      const value = saved.overrides?.[field]
      if (isValidValue(value)) settings[field] = value
    }

    return settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings) {
  const overrides: Partial<AppSettings> = {}

  for (const field of Object.keys(DEFAULT_SETTINGS) as Array<keyof AppSettings>) {
    if (isValidValue(settings[field]) && settings[field] !== DEFAULT_SETTINGS[field]) {
      overrides[field] = settings[field]
    }
  }

  try {
    if (Object.keys(overrides).length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const stored: StoredSettings = { defaultsVersion: DEFAULTS_VERSION, overrides }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // armazenamento indisponível (aba anônima, bloqueio): segue sem salvar
  }
}
