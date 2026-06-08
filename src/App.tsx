import { useEffect, useState } from 'react'
import Header from './components/Header'
import UfespCard from './components/UfespCard'
import { calcularTaxaJudiciaria } from './engines/taxaEngine'
import { calcularCustas } from './engines/custasEngine'
import { TJSP_FEE_SCHEDULES } from './data/tjspFeeSchedules'
import BudgetSidebar from './components/BudgetSidebar'
import ActionSelector from './components/ActionSelector'
import CitationsPanel from './components/CitationsPanel'
import MonetaryCorrectionPanel from './components/MonetaryCorrectionPanel'
import {
  loadSettings,
  saveSettings,
} from './data/appSettings'
import SettingsPanel from './components/SettingsPanel'
import { calcularCorrecaoMonetaria } from './engines/correctionEngine'
import { calcularJurosLegais } from './engines/legalInterestEngine'

function App() {
  const [settings, setSettings] = useState(loadSettings())
  useEffect(() => {
    saveSettings(settings)
  }, [settings])
  const [year] = useState(2026)

  const [tipoAcao, setTipoAcao] = useState('')
  const [activeTab, setActiveTab] = useState<'custas' | 'correcao'>('custas')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [valorCausaDisplay, setValorCausaDisplay] = useState('')
  const [valorPrestacao, setValorPrestacao] = useState('')
  const [valorApelacao, setValorApelacao] = useState('')
  const [valorCorrecaoDisplay, setValorCorrecaoDisplay] = useState('')
  const [termoInicial, setTermoInicial] = useState('2025-05')
  const [termoFinal, setTermoFinal] = useState('2026-05')
  const [jurosDataInicial, setJurosDataInicial] = useState('2025-05-01')
  const [jurosDataFinal, setJurosDataFinal] = useState('2026-05-31')

  const [incluirCitacoes, setIncluirCitacoes] = useState(false)
  const [postalQtd, setPostalQtd] = useState(0)
  const [oficialQtd, setOficialQtd] = useState(0)

  const [tipoOficial, setTipoOficial] = useState<
    'deslocamento' | 'remoto' | 'complemento'
  >('deslocamento')

  
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const parseBrazilianCurrency = (value: string) => {
      const numeric = value.replace(/\D/g, '')

      if (!numeric) return 0

      return Number(numeric) / 100
    }

  const formatBrazilianInput = (value: string) => {
    const numeric = value.replace(/\D/g, '')

    if (!numeric) return ''

    const number = Number(numeric) / 100

    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const actionLabels: Record<string, string> = {
    cobranca: 'Cobrança',
    execucao: 'Execução',
    cumprimento: 'Cumprimento de sentença',
    inventario: 'Inventário / Partilha',
    penalPrivada: 'Ação penal privada',
    recursoInominado: 'Recurso inominado',
    agravoInstrumento: 'Agravo de instrumento',
    apelacao: 'Apelação',
    embargosExecucao: 'Embargos à execução',
  }
  const resultadoTaxa = calcularTaxaJudiciaria({
    tipoAcao,
    valorCausa: parseBrazilianCurrency(valorCausaDisplay),
    valorPrestacao: Number(valorPrestacao),
    settings,
  })

  const resultadoCustas = calcularCustas({
    postalQtd,
    oficialQtd,
    tipoOficial,
    settings,
  })

  const totalGeral = resultadoTaxa.valor + resultadoCustas.total
  const preparoApelacao =
  parseBrazilianCurrency(valorApelacao) * 0.04

  const resultadoCorrecao = calcularCorrecaoMonetaria({
    valorPrincipal: parseBrazilianCurrency(valorCorrecaoDisplay),
    termoInicial,
    termoFinal,
  })

  const resultadoJuros = calcularJurosLegais({
    principal: resultadoCorrecao.valorCorrigido,
    startDate: jurosDataInicial,
    endDate: jurosDataFinal,
  })

  

  return (
    <div className="app-shell">
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      
      <SettingsPanel
        settings={settings}
        setSettings={setSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <main className="dashboard-layout">
        <section className="main-content">
          <UfespCard ufesp={settings.ufesp} year={year} />

          <div className="tab-list" aria-label="Módulos de cálculo">
            <button
              className={activeTab === 'custas' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('custas')}
            >
              Custas
            </button>

            <button
              className={activeTab === 'correcao' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('correcao')}
            >
              Correção monetária
            </button>
          </div>

          {activeTab === 'custas' ? (
            <section className="hero-card">
              <div style={{ width: '100%' }}>
                <span className="hero-badge">Fluxo principal</span>

                <h2>Custas Iniciais</h2>

                <p>
                  Calcule rapidamente taxa judiciária e atos citatórios iniciais.
                </p>

                <ActionSelector
                  tipoAcao={tipoAcao}
                  setTipoAcao={setTipoAcao}
                  valorCausaDisplay={valorCausaDisplay}
                  setValorCausaDisplay={setValorCausaDisplay}
                  valorPrestacao={valorPrestacao}
                  setValorPrestacao={setValorPrestacao}
                  formatBrazilianInput={formatBrazilianInput}
                  actionLabels={actionLabels}
                  actionKeys={Object.keys(TJSP_FEE_SCHEDULES)}
                />

                <CitationsPanel
                  incluirCitacoes={incluirCitacoes}
                  setIncluirCitacoes={setIncluirCitacoes}
                  postalQtd={postalQtd}
                  setPostalQtd={setPostalQtd}
                  oficialQtd={oficialQtd}
                  setOficialQtd={setOficialQtd}
                  tipoOficial={tipoOficial}
                  setTipoOficial={setTipoOficial}
                />
                  
                <details className="module-accordion" open>
                  <summary>⚖ Recursos</summary>

                  <div style={{ marginTop: '20px' }}>
                    <h4>Embargos de Declaração</h4>
                    <p>Sem preparo recursal.</p>

                    <h4 style={{ marginTop: '20px' }}>
                      Agravo de Instrumento
                    </h4>
                    <p>
                      15 UFESPs ={' '}
                      {formatCurrency(settings.ufesp * 15)}
                    </p>

                    <h4 style={{ marginTop: '20px' }}>
                      Apelação
                    </h4>

                    <p>
                      4% sobre o valor da condenação ou da causa.
                    </p>

                    <div
                      style={{
                        marginTop: '12px',
                        display: 'grid',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <label>
                          Valor da causa/condenação
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0,00"
                          value={valorApelacao}
                          onChange={(e) =>
                            setValorApelacao(
                              formatBrazilianInput(e.target.value),
                            )
                          }
                        />
                      </div>

                      <div
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background:
                            'rgba(148, 163, 184, 0.08)',
                        }}
                      >
                        <strong>
                          Preparo da Apelação:
                        </strong>{' '}
                        {formatCurrency(preparoApelacao)}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </section>
          ) : (
            <MonetaryCorrectionPanel
              valorDisplay={valorCorrecaoDisplay}
              setValorDisplay={setValorCorrecaoDisplay}
              termoInicial={termoInicial}
              setTermoInicial={setTermoInicial}
              termoFinal={termoFinal}
              setTermoFinal={setTermoFinal}
              jurosDataInicial={jurosDataInicial}
              setJurosDataInicial={setJurosDataInicial}
              jurosDataFinal={jurosDataFinal}
              setJurosDataFinal={setJurosDataFinal}
              resultado={resultadoCorrecao}
              resultadoJuros={resultadoJuros}
              formatBrazilianInput={formatBrazilianInput}
              formatCurrency={formatCurrency}
            />
          )}
        </section>
                
        {activeTab === 'custas' && (
          <BudgetSidebar
            tipoAcao={tipoAcao}
            valorCausa={valorCausaDisplay || 'Não informado'}
            taxa={resultadoTaxa.valor}
            correios={resultadoCustas.correios}
            oficial={resultadoCustas.oficial}
            total={totalGeral}
            fundamento={resultadoTaxa.fundamento}
            observacao={resultadoTaxa.observacao}
            formatCurrency={formatCurrency}
          />
        )}
      </main>
    </div>
  )
}

export default App
