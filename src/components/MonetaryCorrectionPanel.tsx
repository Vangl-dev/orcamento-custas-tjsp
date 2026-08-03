import { useState } from 'react'
import { CircleHelp, FileDown, ClipboardCopy } from 'lucide-react'
import {
  LEGAL_INTEREST_SOURCE_LABEL,
  LEGAL_INTEREST_SOURCE_URL,
} from '../data/legalInterestRates'
import type { CorrectionResult } from '../engines/correctionEngine'
import type {
  CorrectionFactor,
  CorrectionTableMetadata,
} from '../services/correctionDataService'
import { getMonthBounds } from '../services/correctionDataService'
import {
  getLegalInterestMonthBounds,
  type LegalInterestResult,
} from '../engines/legalInterestEngine'
import { exportCorrectionPdf } from '../utils/pdfExport'

type Props = {
  valorDisplay: string
  setValorDisplay: (value: string) => void
  termoInicial: string
  setTermoInicial: (value: string) => void
  termoFinal: string
  setTermoFinal: (value: string) => void
  jurosDataInicial: string
  setJurosDataInicial: (value: string) => void
  jurosDataFinal: string
  setJurosDataFinal: (value: string) => void
  resultado: CorrectionResult
  resultadoJuros: LegalInterestResult
  formatBrazilianInput: (value: string) => string
  formatCurrency: (value: number) => string
  correctionFactors: CorrectionFactor[]
  correctionMetadata: CorrectionTableMetadata | null
  limparCalculo: () => void
}

const legalInterestBounds = getLegalInterestMonthBounds()

function formatFactor(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split('-')

  return `${month}/${year}`
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split('-')

  return `${day}/${month}/${year}`
}

function isBehindPreviousMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  const loadedMonth = new Date(year, month - 1, 1)
  const current = new Date()
  const previousMonth = new Date(
    current.getFullYear(),
    current.getMonth() - 1,
    1,
  )

  return loadedMonth.getTime() < previousMonth.getTime()
}

export default function MonetaryCorrectionPanel({
  valorDisplay,
  setValorDisplay,
  termoInicial,
  setTermoInicial,
  termoFinal,
  setTermoFinal,
  jurosDataInicial,
  setJurosDataInicial,
  jurosDataFinal,
  setJurosDataFinal,
  resultado,
  resultadoJuros,
  formatBrazilianInput,
  formatCurrency,
  correctionFactors,
  correctionMetadata,
  limparCalculo,
}: Props) {
  const monthBounds = getMonthBounds(correctionFactors)
  const totalAtualizado = resultado.valorCorrigido + resultadoJuros.juros
  const canExport = !resultado.erro && !resultadoJuros.erro

  const [copiado, setCopiado] = useState(false)

  const gerarMemoriaPeticao = async () => {
    const hoje = new Date().toLocaleDateString('pt-BR')
    const nomeTabela = correctionMetadata?.sourceLabel ?? 'Tabela Pratica do Tribunal de Justica de Sao Paulo (IPCA-E)'
    const texto = `Conforme memoria de calculo gerada pelo TJSP Toolkit, o debito atualizado ate ${hoje} corresponde a ${formatCurrency(totalAtualizado)}, composto por principal de ${valorDisplay || 'nao informado'}, correcao monetaria de ${formatCurrency(resultado.diferenca)}, calculada pela ${nomeTabela}, e juros legais de ${formatCurrency(resultadoJuros.juros)}, calculados conforme o art. 406 do Codigo Civil e Taxa Legal divulgada pelo Banco Central do Brasil.`

    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silently fail
    }
  }

  return (
    <section className="hero-card">
      <div style={{ width: '100%' }}>
        <span className="hero-badge">Tabela Pratica do TJSP</span>

        <h2>Correcao Monetaria</h2>

        <p>
          Atualizacao pela Tabela Pratica do Tribunal de Justica de Sao Paulo (IPCA-E), com juros legais em separado.
        </p>

        <div className="update-status">
          <span
            className={
              monthBounds.max && isBehindPreviousMonth(monthBounds.max)
                ? 'attention'
                : ''
            }
          >
            Tabela Pratica do TJSP (IPCA-E) ate {monthBounds.max ? formatMonthLabel(monthBounds.max) : '--'}
          </span>

          <span
            className={
              isBehindPreviousMonth(legalInterestBounds.max) ? 'attention' : ''
            }
          >
            Taxa Legal até {formatMonthLabel(legalInterestBounds.max)}
          </span>

          <button
            aria-label="Como atualizar as tabelas"
            className="help-tooltip"
            type="button"
          >
            <CircleHelp size={16} aria-hidden="true" />
            <span className="tooltip-content" role="tooltip">
              Para atualizar, substitua o arquivo
              public/data/correction-table.json gerado pelo
              TJSP Data Builder.
            </span>
          </button>
        </div>

        <div className="form-grid">
          <div>
            <label>Valor principal</label>

            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={valorDisplay}
              onChange={(e) =>
                setValorDisplay(formatBrazilianInput(e.target.value))
              }
            />
          </div>

          <div>
            <label>Termo inicial</label>

            <input
              type="month"
              min={monthBounds.min || undefined}
              max={monthBounds.max || undefined}
              value={termoInicial}
              onChange={(e) => setTermoInicial(e.target.value)}
            />
          </div>

          <div>
            <label>Termo final</label>

            <input
              type="month"
              min={monthBounds.min || undefined}
              max={monthBounds.max || undefined}
              value={termoFinal}
              onChange={(e) => setTermoFinal(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid compact-form-grid">
          <div>
            <label>Início dos juros</label>

            <input
              type="date"
              value={jurosDataInicial}
              onChange={(e) => setJurosDataInicial(e.target.value)}
            />
          </div>

          <div>
            <label>Fim dos juros</label>

            <input
              type="date"
              max={legalInterestBounds.maxDate}
              value={jurosDataFinal}
              onChange={(e) => setJurosDataFinal(e.target.value)}
            />
          </div>
        </div>

        <div className="result-grid">
          <div className="result-card">
            <span>Fator inicial</span>
            <strong>{formatFactor(resultado.fatorInicial)}</strong>
          </div>

          <div className="result-card">
            <span>Fator final</span>
            <strong>{formatFactor(resultado.fatorFinal)}</strong>
          </div>

          <div className="result-card">
            <span>Índice aplicado</span>
            <strong>{formatFactor(resultado.indice)}</strong>
          </div>
        </div>

        <div className="correction-result">
          <div>
            <span>Valor corrigido</span>
            <strong>{formatCurrency(resultado.valorCorrigido)}</strong>
          </div>

          <div>
            <span>Correção acumulada</span>
            <strong>{formatCurrency(resultado.diferenca)}</strong>
          </div>
        </div>

        <div className="interest-panel">
          <div className="interest-total">
            <div>
              <span>Juros legais</span>
              <strong>{formatCurrency(resultadoJuros.juros)}</strong>
            </div>

            <div>
              <span>Total atualizado</span>
              <strong>{formatCurrency(totalAtualizado)}</strong>
            </div>
          </div>

          {resultadoJuros.breakdown.length > 0 && (
            <div className="interest-breakdown">
              {resultadoJuros.breakdown.map((item) => (
                <div key={`${item.label}-${item.startDate}`}>
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                  <small>
                    {item.startDate} a {item.endDate} · {item.days} dias
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="primary-button export-button"
          disabled={!canExport}
          type="button"
          onClick={() =>
            exportCorrectionPdf({
              valorPrincipal: valorDisplay || 'Não informado',
              termoInicial: formatMonthLabel(termoInicial),
              termoFinal: formatMonthLabel(termoFinal),
              fatorInicial: formatFactor(resultado.fatorInicial),
              fatorFinal: formatFactor(resultado.fatorFinal),
              indice: formatFactor(resultado.indice),
              valorCorrigido: formatCurrency(resultado.valorCorrigido),
              correcaoAcumulada: formatCurrency(resultado.diferenca),
              jurosDataInicial: formatDateLabel(jurosDataInicial),
              jurosDataFinal: formatDateLabel(jurosDataFinal),
              juros: formatCurrency(resultadoJuros.juros),
              totalAtualizado: formatCurrency(totalAtualizado),
              breakdown: resultadoJuros.breakdown.map((item) => ({
                label: item.label,
                period: `${formatDateLabel(item.startDate)} a ${formatDateLabel(
                  item.endDate,
                )}`,
                days: item.days,
                amount: formatCurrency(item.amount),
              })),
              fonteCorrecao: correctionMetadata?.sourceLabel ?? 'Tabela Prática TJSP',
              fonteJuros: LEGAL_INTEREST_SOURCE_LABEL,
              versaoTabela: correctionMetadata?.version,
              fonteTabela: correctionMetadata?.source,
              versaoJuros: undefined,
            })
          }
        >
          <FileDown size={18} aria-hidden="true" />
          Exportar PDF
        </button>

        <button
          className="export-button"
          type="button"
          onClick={limparCalculo}
        >
          Novo calculo
        </button>

        <button
          className="primary-button export-button"
          disabled={!canExport}
          type="button"
          onClick={gerarMemoriaPeticao}
        >
          <ClipboardCopy size={18} aria-hidden="true" />
          Copiar memoria para peticao
        </button>

        {copiado && (
          <span className="field-warning" style={{ color: '#86efac', marginTop: '8px', display: 'block' }}>
            Copiado!
          </span>
        )}

        {(resultado.erro || resultadoJuros.erro) && (
          <p className="field-warning">
            {resultado.erro || resultadoJuros.erro}
          </p>
        )}

        <div className="source-note">
          <strong>Correcao:</strong>{' '}
          <a
            href={correctionMetadata?.sourceUrl ?? '#'}
            target="_blank"
          >
            {correctionMetadata?.sourceLabel ?? 'Tabela Pratica do TJSP (IPCA-E)'}
          </a>
          <br />
          <strong>Juros:</strong>{' '}
          <a href={LEGAL_INTEREST_SOURCE_URL} target="_blank">
            {LEGAL_INTEREST_SOURCE_LABEL}
          </a>
        </div>
      </div>
    </section>
  )
}
