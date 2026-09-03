import { cn } from '../../../lib/utils.js'

export function AdminTable({ className, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function AdminTableHead({ children }) {
  return (
    <thead className="bg-slate-50 dark:bg-slate-800/50">
      <tr>{children}</tr>
    </thead>
  )
}

export function AdminTableHeader({ className, children }) {
  return (
    <th className={cn('px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400', className)}>
      {children}
    </th>
  )
}

export function AdminTableBody({ children }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">{children}</tbody>
}

export function AdminTableRow({ className, children }) {
  return (
    <tr className={cn('hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors', className)}>
      {children}
    </tr>
  )
}

export function AdminTableCell({ className, children }) {
  return (
    <td className={cn('px-4 py-3.5 text-slate-700 dark:text-slate-300', className)}>
      {children}
    </td>
  )
}
