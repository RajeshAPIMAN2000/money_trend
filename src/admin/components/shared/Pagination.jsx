import { ChevronLeft, ChevronRight } from 'lucide-react'
import AdminButton from '../ui/AdminButton.jsx'
import { cn } from '../../../lib/utils.js'

export default function Pagination({ page, totalPages, total, onPageChange, className }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 pt-4', className)}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing page {page} of {totalPages} ({total} records)
      </p>
      <div className="flex items-center gap-1">
        <AdminButton variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </AdminButton>
        {pages.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
              p === page
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            )}
          >
            {p}
          </button>
        ))}
        <AdminButton variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </AdminButton>
      </div>
    </div>
  )
}
