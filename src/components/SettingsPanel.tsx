import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../data/appSettings'
import type { CorrectionTableData } from '../services/correctionDataService'

type Props = {
  settings: AppSettings
  setSettings: (settings: AppSettings) => void
  isOpen: boolean
  onClose: () => void
  correctionTable: CorrectionTableData | null
  correctionError: string
}

export default function SettingsPanel({
  settings,
  setSettings,
  isOpen,
  onClose,
  correctionTable,
  correctionError,
}: Props) {
  if (!isOpen) return null

  const update = (
    field: keyof AppSettings,
    value: number,
  ) => {
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const labelStyle = {
    display: 'block',
    color: '#e2e8f0',
    fontWeight: 500,
  }

  const inputStyle = {
    width: '100%',
    marginTop: '6px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: '1rem',
  }

  const cardStyle = {
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(148, 163, 184, 0.08)',
    marginTop: '20px',
  }

  const meta = correctionTable?.metadata
  const factorCount = correctionTable?.factors.length ?? 0
  const firstFactor = correctionTable?.factors[0]
  const lastFactor = correctionTable?.factors[factorCount - 1]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: '#1e293b',
          padding: '24px',
          borderRadius: '16px',
          width: '520px',
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: 0, color: '#f8fafc' }}>
          Parâmetros
        </h2>

        <div
          style={{
            display: 'grid',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          <label style={labelStyle}>
            UFESP
            <input
              type="number"
              style={inputStyle}
              value={settings.ufesp}
              onChange={(e) =>
                update('ufesp', Number(e.target.value))
              }
            />
          </label>

          <label style={labelStyle}>
            Salário mínimo
            <input
              type="number"
              style={inputStyle}
              value={settings.salarioMinimo}
              onChange={(e) =>
                update(
                  'salarioMinimo',
                  Number(e.target.value),
                )
              }
            />
          </label>

          <label style={labelStyle}>
            Citação postal
            <input
              type="number"
              style={inputStyle}
              value={settings.postal}
              onChange={(e) =>
                update('postal', Number(e.target.value))
              }
            />
          </label>

          <label style={labelStyle}>
            Oficial com deslocamento
            <input
              type="number"
              style={inputStyle}
              value={settings.oficialDeslocamento}
              onChange={(e) =>
                update(
                  'oficialDeslocamento',
                  Number(e.target.value),
                )
              }
            />
          </label>

          <label style={labelStyle}>
            Oficial remoto
            <input
              type="number"
              style={inputStyle}
              value={settings.oficialRemoto}
              onChange={(e) =>
                update(
                  'oficialRemoto',
                  Number(e.target.value),
                )
              }
            />
          </label>

          <label style={labelStyle}>
            Complemento
            <input
              type="number"
              style={inputStyle}
              value={settings.oficialComplemento}
              onChange={(e) =>
                update(
                  'oficialComplemento',
                  Number(e.target.value),
                )
              }
            />
          </label>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
            Tabela Prática
          </h3>

          {correctionError ? (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#f87171', fontSize: '1rem' }}>&#10060;</span>
                <span style={{ color: '#f87171', fontWeight: 500, fontSize: '0.875rem' }}>
                  Dados inválidos
                </span>
              </div>
              <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.8rem', lineHeight: '1.4' }}>
                {correctionError}
              </p>
            </div>
          ) : meta ? (
            <div
              style={{
                display: 'grid',
                gap: '6px',
                marginTop: '10px',
                fontSize: '0.875rem',
                color: '#cbd5e1',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ color: '#86efac', fontSize: '1rem' }}>&#9989;</span>
                <span style={{ color: '#86efac', fontWeight: 500 }}>
                  Dados válidos
                </span>
              </div>
              <div>
                <strong style={{ color: '#94a3b8' }}>Fonte:</strong>{' '}
                {meta.source}
              </div>
              <div>
                <strong style={{ color: '#94a3b8' }}>Versão:</strong>{' '}
                {meta.version}
              </div>
              <div>
                <strong style={{ color: '#94a3b8' }}>Última atualização:</strong>{' '}
                {meta.updatedAt}
              </div>
              <div>
                <strong style={{ color: '#94a3b8' }}>Primeiro registro:</strong>{' '}
                {firstFactor
                  ? `${String(firstFactor.month).padStart(2, '0')}/${firstFactor.year}`
                  : '--'}
              </div>
              <div>
                <strong style={{ color: '#94a3b8' }}>Último registro:</strong>{' '}
                {lastFactor
                  ? `${String(lastFactor.month).padStart(2, '0')}/${lastFactor.year}`
                  : '--'}
              </div>
              <div>
                <strong style={{ color: '#94a3b8' }}>Quantidade de registros:</strong>{' '}
                {factorCount}
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.875rem' }}>
              Carregando...
            </p>
          )}
        </div>

        <div style={{ marginTop: '24px' }}>
          <button
            className="primary-button"
            style={{
                marginRight: '12px',
                background: '#334155',
            }}
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            >
            Restaurar Padrões
          </button>

          <button
            className="primary-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
