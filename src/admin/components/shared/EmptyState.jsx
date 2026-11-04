import { Inbox } from 'lucide-react'
import AdminButton from '../ui/AdminButton.jsx'

export default function EmptyState({ title = 'No records found', description = 'Try adjusting your search or filters.', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <AdminButton size="sm" className="mt-4" onClick={onAction}>{actionLabel}</AdminButton>
      )}
    </div>
  )
}
