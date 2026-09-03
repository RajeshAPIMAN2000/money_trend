import { forwardRef } from 'react'
import { cn } from '../../../lib/utils.js'
import { Search } from 'lucide-react'

const AdminInput = forwardRef(function AdminInput({ className, icon, ...props }, ref) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon === true ? <Search className="w-4 h-4" /> : icon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
          icon && 'pl-10',
          className,
        )}
        {...props}
      />
    </div>
  )
})

export default AdminInput
