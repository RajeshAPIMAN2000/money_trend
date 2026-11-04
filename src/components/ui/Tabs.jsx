export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${active === t ? 'border-secondary text-secondary' : 'border-transparent text-slate-500 hover:text-ink'}`}>{t}</button>
      ))}
    </div>
  )
}
