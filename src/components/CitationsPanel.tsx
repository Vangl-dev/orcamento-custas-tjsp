type Props = {
  incluirCitacoes: boolean
  setIncluirCitacoes: (value: boolean) => void

  postalQtd: number
  setPostalQtd: (value: number) => void

  oficialQtd: number
  setOficialQtd: (value: number) => void

  tipoOficial:
    | 'deslocamento'
    | 'remoto'
    | 'complemento'

  setTipoOficial: (
    value:
      | 'deslocamento'
      | 'remoto'
      | 'complemento',
  ) => void
}

export default function CitationsPanel({
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
    <details
      className="module-accordion"
      style={{ marginTop: '20px' }}
    >
      <summary>
        📨 Citações e Diligências
      </summary>

      <div style={{ marginTop: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={incluirCitacoes}
            onChange={(e) =>
              setIncluirCitacoes(
                e.target.checked,
              )
            }
          />{' '}
          Incluir atos citatórios
        </label>

        {incluirCitacoes && (
          <div
            className="form-grid"
            style={{ marginTop: '20px' }}
          >
            <div>
              <label>
                Citações postais
              </label>

              <input
                type="number"
                min="0"
                value={postalQtd}
                onChange={(e) =>
                  setPostalQtd(
                    Number(e.target.value),
                  )
                }
              />
            </div>

            <div>
              <label>
                Oficiais de justiça
              </label>

              <input
                type="number"
                min="0"
                value={oficialQtd}
                onChange={(e) =>
                  setOficialQtd(
                    Number(e.target.value),
                  )
                }
              />
            </div>

            <div>
              <label>
                Tipo da diligência
              </label>

              <select
                value={tipoOficial}
                onChange={(e) =>
                  setTipoOficial(
                    e.target.value as
                      | 'deslocamento'
                      | 'remoto'
                      | 'complemento',
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
      </div>
    </details>
  )
}