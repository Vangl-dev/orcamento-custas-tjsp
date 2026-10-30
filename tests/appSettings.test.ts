import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  DEFAULTS_VERSION,
  loadSettings,
  saveSettings,
} from '../src/data/appSettings'

const STORAGE_KEY = 'orcamento-custas-settings'
const store = new Map<string, string>()

globalThis.localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
} as Storage

describe('parâmetros salvos no navegador', () => {
  beforeEach(() => store.clear())

  it('não grava nada quando o usuário não mudou os padrões', () => {
    saveSettings(DEFAULT_SETTINGS)

    expect(store.has(STORAGE_KEY)).toBe(false)
  })

  it('guarda só o que foi alterado e recupera depois', () => {
    saveSettings({ ...DEFAULT_SETTINGS, postal: 40 })

    expect(JSON.parse(store.get(STORAGE_KEY)!)).toEqual({
      defaultsVersion: DEFAULTS_VERSION,
      overrides: { postal: 40 },
    })
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, postal: 40 })
  })

  it('descarta valores salvos no formato antigo (UFESP velha)', () => {
    store.set(STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ufesp: 35.36 }))

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('descarta ajustes feitos sobre uma versão anterior dos padrões', () => {
    store.set(
      STORAGE_KEY,
      JSON.stringify({ defaultsVersion: '2025-01', overrides: { ufesp: 35.36 } }),
    )

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('não salva campo apagado (zero)', () => {
    saveSettings({ ...DEFAULT_SETTINGS, ufesp: 0 })

    expect(loadSettings().ufesp).toBe(DEFAULT_SETTINGS.ufesp)
  })
})
