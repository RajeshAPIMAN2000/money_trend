import { cn } from '../../../lib/utils.js'

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  emerald: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-9 px-4 text-sm rounded-lg',
  lg: 'h-10 px-5 text-sm rounded-xl',
}

export default function AdminButton({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
