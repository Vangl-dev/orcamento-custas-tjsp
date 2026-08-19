import { useEffect, useRef, useState } from 'react'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

type Props = {
  value: string
  onChange: (value: string) => void
}

function parseValue(value: string) {
  const [year, month] = value.split('-').map(Number)

  return { year, month }
}

function formatMonthLabel(value: string) {
  if (!value) return 'Selecionar'

  const { year, month } = parseValue(value)

  if (!year || !month) return 'Selecionar'

  return `${MONTH_NAMES[month - 1].toLowerCase()} de ${year}`
}

export default function MonthYearPicker({ value, onChange }: Props) {
  const { year: valueYear, month: valueMonth } = parseValue(value)
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(
    valueYear || new Date().getFullYear(),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOpen = () => {
    if (!open && valueYear) {
      setViewYear(valueYear)
    }

    setOpen((isOpen) => !isOpen)
  }

  const selectMonth = (month: number) => {
    onChange(`${viewYear}-${String(month).padStart(2, '0')}`)
    setOpen(false)
  }

  const changeYear = (delta: number) => {
    setViewYear((year) => year + delta)
  }

  return (
    <div className="month-year-picker" ref={containerRef}>
      <button
        className="month-year-trigger"
        type="button"
        onClick={toggleOpen}
        aria-haspopup="grid"
        aria-expanded={open}
      >
        {formatMonthLabel(value)}
      </button>

      {open && (
        <div className="month-year-popover" role="grid">
          <div className="month-year-nav">
            <button
              type="button"
              aria-label="Ano anterior"
              onClick={() => changeYear(-1)}
            >
              ‹
            </button>

            <span>{viewYear}</span>

            <button
              type="button"
              aria-label="Próximo ano"
              onClick={() => changeYear(1)}
            >
              ›
            </button>
          </div>

          <div className="month-year-grid">
            {MONTH_NAMES.map((name, index) => {
              const month = index + 1
              const isSelected =
                valueYear === viewYear && valueMonth === month

              return (
                <button
                  key={month}
                  className={isSelected ? 'selected' : ''}
                  type="button"
                  onClick={() => selectMonth(month)}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}