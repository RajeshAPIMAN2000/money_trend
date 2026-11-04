export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const v = {
    primary: 'bg-secondary text-white hover:bg-secondary/90 shadow-card',
    accent: 'bg-accent text-white hover:bg-accent/90 shadow-card',
    outline: 'border border-slate-300 text-ink hover:bg-slate-50',
    ghost: 'text-ink hover:bg-slate-100',
    dark: 'bg-primary text-white hover:bg-primary/90',
  }[variant]
  const s = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }[size]
  return <button {...rest} className={`font-semibold rounded-btn ${v} ${s} ${className}`}>{children}</button>
}
