type Props = {
  tipoAcao: string
  setTipoAcao: (value: string) => void
  valorCausaDisplay: string
  setValorCausaDisplay: (value: string) => void
  valorPrestacao: string
  setValorPrestacao: (value: string) => void
  formatBrazilianInput: (value: string) => string
  actionLabels: Record<string, string>
  actionKeys: string[]
}

export default function ActionSelector({
  tipoAcao,
  setTipoAcao,
  valorCausaDisplay,
  setValorCausaDisplay,
  valorPrestacao,
  setValorPrestacao,
  formatBrazilianInput,
  actionLabels,
  actionKeys,
}: Props) {
  return (
    <>
      <div className="form-grid">
        <div>
          <label>Tipo da ação</label>

          <select
            value={tipoAcao}
            onChange={(e) => setTipoAcao(e.target.value)}
          >
            <option value="">Selecione</option>

            {actionKeys.map((key) => (
              <option key={key} value={key}>
                {actionLabels[key]}
              </option>
            ))}

            <option value="alimentos">Alimentos</option>
          </select>
        </div>

        <div>
          <label>Valor da causa</label>

          <input
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={valorCausaDisplay}
            onChange={(e) => {
              const formatted = formatBrazilianInput(
                e.target.value,
              )
              setValorCausaDisplay(formatted)
            }}
          />
        </div>
      </div>

      {tipoAcao === 'alimentos' && (
        <div style={{ marginTop: '20px' }}>
          <label>Prestação mensal</label>

          <input
            type="number"
            placeholder="Valor mensal"
            value={valorPrestacao}
            onChange={(e) =>
              setValorPrestacao(e.target.value)
            }
          />
        </div>
      )}
    </>
  )
}