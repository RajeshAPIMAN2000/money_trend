import { cn } from '../../lib/utils.js'

export default function Card({ className = '', children, hover = true, ...rest }) {
  return (
    <div
      {...rest}
      className={cn(
        'bg-white rounded-card shadow-card p-5',
        hover && 'card-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}
