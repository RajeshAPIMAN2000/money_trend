import { useState } from 'react'
export default function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="divide-y divide-slate-200 bg-white rounded-card shadow-card">
      {items.map((it, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between text-left p-5 font-medium text-ink hover:bg-slate-50">
            <span>{it.q}</span>
            <span className={`transition-transform ${open === i ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {open === i && <div className="px-5 pb-5 text-sm text-slate-600 animate-fade-in">{it.a}</div>}
        </div>
      ))}
    </div>
  )
}
