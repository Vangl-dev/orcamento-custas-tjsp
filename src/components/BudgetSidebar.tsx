import { exportBudgetPdf } from '../utils/pdfExport'

type Props = {
  tipoAcao: string
  valorCausa: string
  taxa: number
  correios: number
  oficial: number
  total: number
  fundamento?: string
  observacao?: string
  formatCurrency: (value: number) => string
  copiarMemoria: () => void
  limparCalculo: () => void
}

export default function BudgetSidebar({
  tipoAcao,
  valorCausa,
  taxa,
  correios,
  oficial,
  total,
  fundamento,
  observacao,
  formatCurrency,
  copiarMemoria,
  limparCalculo,
}: Props) {
  
  return (
    <aside className="budget-sidebar">
      <h2>Orçamento</h2>

      <div className="budget-row">
        <span>Taxa judiciária</span>
        <span>{formatCurrency(taxa)}</span>
      </div>

      {fundamento && (
        <div
          style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            marginTop: '-8px',
            marginBottom: '16px',
            lineHeight: '1.4',
          }}
        >
          {fundamento}

          {observacao && (
            <>
              <br />
              {observacao}
            </>
          )}
        </div>
      )}

      <div className="budget-row">
        <span>Correios</span>
        <span>{formatCurrency(correios)}</span>
      </div>

      <div className="budget-row">
        <span>Oficial</span>
        <span>{formatCurrency(oficial)}</span>
      </div>

      <hr />

      <div className="budget-total">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div style={{ marginTop: '18px' }}>
      <button
        className="primary-button"
        style={{ width: '100%' }}
        onClick={() =>
          exportBudgetPdf({
            tipoAcao,
            valorCausa,
            taxa: formatCurrency(taxa),
            correios: formatCurrency(correios),
            oficial: formatCurrency(oficial),
            total: formatCurrency(total),
            fundamento,
            observacao,
          })
        }
      >
        📄 Exportar PDF
      </button>
  </div>
      <button
        className="export-button"
        onClick={copiarMemoria}
      >
        📋 Copiar memória
      </button>
      <button
        className="export-button"
        onClick={limparCalculo}
      >
        🧹 Limpar cálculo
      </button>
      <div
        style={{
          marginTop: '18px',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(148, 163, 184, 0.08)',
          fontSize: '0.85rem',
          lineHeight: '1.5',
          color: '#cbd5e1',
        }}
      >
        <strong
          style={{
            display: 'block',
            marginBottom: '6px',
            color: '#f8fafc',
          }}
        >
          Estimativa operacional
        </strong>

        Base parametrizável conforme regras cadastradas.
        <br />
        Conferência final da tabela oficial TJSP recomendada.
      </div>
    </aside>
  )
}