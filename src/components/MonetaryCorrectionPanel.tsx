import { useState } from 'react'
import { CircleHelp, FileDown, ClipboardCopy } from 'lucide-react'
import MonthYearPicker from './MonthYearPicker'
import {
  LEGAL_INTEREST_PDF_SOURCE_LABEL,
  LEGAL_INTEREST_SOURCE_LABEL,
  LEGAL_INTEREST_SOURCE_URL,
  type LegalInterestRate,
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
  legalRates: LegalInterestRate[]
  limparCalculo: () => void
}

const DEFAULT_TABLE_LABEL =
  'Tabela Prática do Tribunal de Justiça de São Paulo (IPCA-E)'

function formatFactor(value: number | null) {
  if (value === null) return '—'

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
  legalRates,
  limparCalculo,
}: Props) {
  const monthBounds = getMonthBounds(correctionFactors)
  const legalInterestBounds = getLegalInterestMonthBounds(legalRates)
  const correcaoDisponivel = !resultado.erro
  const jurosDisponivel = !resultadoJuros.erro
  const totalAtualizado = resultado.valorCorrigido + resultadoJuros.juros
  const canExport = correcaoDisponivel && jurosDisponivel
  const valorCorrigidoDisplay = correcaoDisponivel
    ? formatCurrency(resultado.valorCorrigido)
    : '—'
  const correcaoAcumuladaDisplay = correcaoDisponivel
    ? formatCurrency(resultado.diferenca)
    : '—'
  const jurosDisplay = jurosDisponivel
    ? formatCurrency(resultadoJuros.juros)
    : '—'
  const totalDisplay =
    correcaoDisponivel && jurosDisponivel
      ? formatCurrency(totalAtualizado)
      : '—'

  const [copiado, setCopiado] = useState(false)

  const gerarMemoriaPeticao = async () => {
    const hoje = new Date().toLocaleDateString('pt-BR')
    const nomeTabela = correctionMetadata?.sourceLabel ?? DEFAULT_TABLE_LABEL
    const principal = valorDisplay ? `R$ ${valorDisplay}` : 'não informado'
    const texto = `Conforme memória de cálculo anexa, o débito atualizado até ${hoje} corresponde a ${formatCurrency(totalAtualizado)}, composto por principal de ${principal}, correção monetária de ${formatCurrency(resultado.diferenca)}, calculada pela ${nomeTabela}, e juros legais de ${formatCurrency(resultadoJuros.juros)}, calculados conforme o art. 406 do Código Civil e a Taxa Legal divulgada pelo Banco Central do Brasil.`

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
        <span className="hero-badge">Tabela Prática do TJSP</span>

        <h2>Correção Monetária</h2>

        <p>
          Atualização pela Tabela Prática do Tribunal de Justiça de São Paulo (IPCA-E), com juros legais em separado.
        </p>

        <div className="update-status">
          <span
            className={
              monthBounds.max && isBehindPreviousMonth(monthBounds.max)
                ? 'attention'
                : ''
            }
          >
            Tabela Prática do TJSP (IPCA-E) até {monthBounds.max ? formatMonthLabel(monthBounds.max) : '--'}
          </span>

          <span
            className={
              legalInterestBounds.max && isBehindPreviousMonth(legalInterestBounds.max)
                ? 'attention'
                : ''
            }
          >
            Taxa Legal até {legalInterestBounds.max ? formatMonthLabel(legalInterestBounds.max) : '--'}
          </span>

          <button
            aria-label="Como atualizar as tabelas"
            className="help-tooltip"
            type="button"
          >
            <CircleHelp size={16} aria-hidden="true" />
            <span className="tooltip-content" role="tooltip">
              As tabelas são atualizadas automaticamente: o GitHub confere a
              AASP e o Banco Central todos os dias e publica os meses novos.
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

            <MonthYearPicker
              value={termoInicial}
              onChange={setTermoInicial}
            />
          </div>

          <div>
            <label>Termo final</label>

            <MonthYearPicker
              value={termoFinal}
              onChange={setTermoFinal}
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
            <strong>{valorCorrigidoDisplay}</strong>
          </div>

          <div>
            <span>Correção acumulada</span>
            <strong>{correcaoAcumuladaDisplay}</strong>
          </div>
        </div>

        <div className="interest-panel">
          <div className="interest-total">
            <div>
              <span>Juros legais</span>
              <strong>{jurosDisplay}</strong>
            </div>

            <div>
              <span>Total atualizado</span>
              <strong>{totalDisplay}</strong>
            </div>
          </div>

          {jurosDisponivel && resultadoJuros.breakdown.length > 0 && (
            <div className="interest-breakdown">
              {resultadoJuros.breakdown.map((item) => (
                <div key={`${item.label}-${item.startDate}`}>
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                  <small>
                    {formatDateLabel(item.startDate)} a {formatDateLabel(item.endDate)} · {item.days} dias
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
              fonteCorrecao: correctionMetadata?.sourceLabel ?? DEFAULT_TABLE_LABEL,
              fonteJuros: LEGAL_INTEREST_PDF_SOURCE_LABEL,
              versaoTabela: correctionMetadata?.version,
              fonteTabela: correctionMetadata?.source,
              versaoJuros: legalInterestBounds.max
                ? `até ${formatMonthLabel(legalInterestBounds.max)}`
                : undefined,
              aviso: resultado.aviso,
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
          Novo cálculo
        </button>

        <button
          className="primary-button export-button"
          disabled={!canExport}
          type="button"
          onClick={gerarMemoriaPeticao}
        >
          <ClipboardCopy size={18} aria-hidden="true" />
          Copiar memória para petição
        </button>

        {copiado && (
          <span className="field-warning" style={{ color: '#86efac', marginTop: '8px', display: 'block' }}>
            Copiado!
          </span>
        )}

        {(resultado.erro || resultadoJuros.erro || resultado.aviso) && (
          <p className="field-warning">
            {[resultado.erro, resultado.aviso, resultadoJuros.erro]
              .filter(Boolean)
              .join(' ')}
          </p>
        )}

        <div className="source-note">
          <strong>Correção:</strong>{' '}
          <a
            href={correctionMetadata?.sourceUrl ?? '#'}
            target="_blank"
          >
            {correctionMetadata?.sourceLabel ?? DEFAULT_TABLE_LABEL}
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
