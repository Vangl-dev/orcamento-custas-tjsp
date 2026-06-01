type TipoOficial =
  | 'deslocamento'
  | 'remoto'
  | 'complemento'

type Props = {
  incluirCitacoes: boolean
  setIncluirCitacoes: (value: boolean) => void
  postalQtd: number
  setPostalQtd: (value: number) => void
  oficialQtd: number
  setOficialQtd: (value: number) => void
  tipoOficial: TipoOficial
  setTipoOficial: (value: TipoOficial) => void
}

export default function CitationSection({
  incluirCitacoes,
  setIncluirCitacoes,
  postalQtd,
  setPostalQtd,
  oficialQtd,
  setOficialQtd,
  tipoOficial,
  setTipoOficial,
}: Props) {
  return (
    <section
      style={{
        marginTop: '28px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <label>
        <input
          type="checkbox"
          checked={incluirCitacoes}
          onChange={(e) =>
            setIncluirCitacoes(e.target.checked)
          }
        />{' '}
        Incluir citações / atos iniciais
      </label>

      {incluirCitacoes && (
        <div className="form-grid" style={{ marginTop: '20px' }}>
          <div>
            <label>Citações postais</label>

            <input
              type="number"
              min="0"
              value={postalQtd}
              onChange={(e) =>
                setPostalQtd(Number(e.target.value))
              }
            />
          </div>

          <div>
            <label>Oficiais de justiça</label>

            <input
              type="number"
              min="0"
              value={oficialQtd}
              onChange={(e) =>
                setOficialQtd(Number(e.target.value))
              }
            />
          </div>

          <div>
            <label>Tipo da diligência</label>

            <select
              value={tipoOficial}
              onChange={(e) =>
                setTipoOficial(
                  e.target.value as TipoOficial,
                )
              }
            >
              <option value="deslocamento">
                Com deslocamento
              </option>

              <option value="remoto">
                Remota / sede do juízo
              </option>

              <option value="complemento">
                Complemento de conversão
              </option>
            </select>
          </div>
        </div>
      )}
    </section>
  )
}