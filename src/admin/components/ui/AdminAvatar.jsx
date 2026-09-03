import { cn } from '../../../lib/utils.js'

export default function AdminAvatar({ name, className, size = 'md' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-semibold text-white shrink-0',
      sizes[size],
      className,
    )}>
      {initials}
    </div>
  )
}
