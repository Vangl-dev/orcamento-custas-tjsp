type HeaderProps = {
  onSettingsClick: () => void
}

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <div className="brand-badge">TJSP • Custas</div>
        <h1>Orçamento Custas TJSP</h1>
        <p>
          Simulador inteligente de custas processuais do Tribunal de Justiça de
          São Paulo
        </p>
      </div>

      <button className="ghost-button" onClick={onSettingsClick}>
        Parâmetros
      </button>
    </header>
  )
}
