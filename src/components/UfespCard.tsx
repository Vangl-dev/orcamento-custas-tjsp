type UfespCardProps = {
  ufesp: number
  year: number
}

export default function UfespCard({ ufesp, year }: UfespCardProps) {
  return (
    <section className="ufesp-card">
      <div>
        <span className="card-label">UFESP vigente</span>
        <strong>R$ {ufesp.toFixed(2).replace('.', ',')}</strong>
      </div>

      <div>
        <span className="card-label">Ano-base</span>
        <strong>{year}</strong>
      </div>
    </section>
  )
}
