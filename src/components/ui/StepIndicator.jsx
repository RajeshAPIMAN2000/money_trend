export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full grid place-items-center font-semibold text-sm ${i < current ? 'bg-accent text-white' : i === current ? 'bg-secondary text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${i <= current ? 'text-ink' : 'text-slate-400'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < current ? 'bg-accent' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  )
}
