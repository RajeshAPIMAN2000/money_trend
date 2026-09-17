import { bureauDisplayName } from '../../lib/creditCheck.js'

/** Brand-style bureau marks (inline SVG — no external assets required). */
export function BureauIcon({ bureau, className = 'w-8 h-8' }) {
  const key = String(bureau || '').toUpperCase()

  if (key === 'EXPERIAN') {
    return (
      <span className={`inline-flex items-center justify-center rounded-lg bg-[#6B2D5B] text-white ${className}`} title="Experian" aria-label="Experian">
        <svg viewBox="0 0 48 48" className="w-[70%] h-[70%]" fill="none" aria-hidden>
          <path d="M8 30c4-12 12-18 20-18 6 0 10 3 12 8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="34" cy="28" r="5.5" fill="#F5A623" />
          <path d="M10 34h20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (key === 'EQUIFAX') {
    return (
      <span className={`inline-flex items-center justify-center rounded-lg bg-[#E31837] text-white ${className}`} title="Equifax" aria-label="Equifax">
        <svg viewBox="0 0 48 48" className="w-[72%] h-[72%]" fill="currentColor" aria-hidden>
          <path d="M8 14h22c6 0 10 4 10 10s-4 10-10 10H18v6H8V14zm10 14h11c2.8 0 4.5-1.5 4.5-4s-1.7-4-4.5-4H18v8z" />
        </svg>
      </span>
    )
  }

  // CIBIL / TransUnion CIBIL
  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-[#0033A0] text-white ${className}`} title="CIBIL" aria-label="CIBIL">
      <svg viewBox="0 0 48 48" className="w-[78%] h-[78%]" fill="currentColor" aria-hidden>
        <path d="M10 14h8.5c7.2 0 12 4.2 12 10.2S25.7 34.5 18.5 34.5H10V14zm8.2 14.2c3.6 0 5.8-1.9 5.8-4.8s-2.2-4.8-5.8-4.8H16.5v9.6h1.7z" />
        <path d="M32 20.5h6.2v2.8H34.8V24h3.1v2.6h-3.1v1.8H38V31H32V20.5z" opacity="0.9" />
      </svg>
    </span>
  )
}

export function BureauTabLabel({ bureau, selected = false }) {
  const name = bureauDisplayName(bureau)
  return (
    <span className="inline-flex items-center gap-2">
      <BureauIcon bureau={bureau} className="w-6 h-6 shrink-0" />
      <span className={selected ? 'font-bold' : 'font-semibold'}>{name}</span>
    </span>
  )
}
