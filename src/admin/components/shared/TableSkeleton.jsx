export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 flex-1 bg-slate-100 dark:bg-slate-800 rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}
