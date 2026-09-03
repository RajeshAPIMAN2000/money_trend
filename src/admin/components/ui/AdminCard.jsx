import { cn } from '../../../lib/utils.js'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn('flex items-center justify-between px-5 pt-5 pb-2', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-sm font-semibold text-slate-900 dark:text-white', className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cn('text-xs text-slate-500 dark:text-slate-400', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>
}
