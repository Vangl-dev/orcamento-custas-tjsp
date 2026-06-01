import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../data/appSettings'

type Props = {
  settings: AppSettings
  setSettings: (settings: AppSettings) => void
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({
  settings,
  setSettings,
  isOpen,
  onClose,
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