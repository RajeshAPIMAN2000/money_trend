import { bureauDisplayName } from '../../lib/creditCheck.js'
import { bureauIconSrc } from '../../lib/brandAssets.js'

/** Bureau brand marks from /assets/images (TransUnion CIBIL for CIBIL). */
export function BureauIcon({ bureau, className = 'w-8 h-8' }) {
  const name = bureauDisplayName(bureau)
  const src = bureauIconSrc(bureau)

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-white border border-slate-100 overflow-hidden ${className}`}
      title={name}
      aria-label={name}
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full object-contain p-0.5"
        loading="lazy"
        draggable={false}
      />
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
