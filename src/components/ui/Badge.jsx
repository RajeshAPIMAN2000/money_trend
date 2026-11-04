export default function Badge({ tone = 'blue', children, className = '' }) {
  const tones = {
    blue: 'bg-secondary/10 text-secondary',
    green: 'bg-accent/10 text-accent',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
    dark: 'bg-primary text-white',
  }
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${tones[tone]} ${className}`}>{children}</span>
}
