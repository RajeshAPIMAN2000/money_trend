import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'
import { topPages } from '../../data/admin-dashboard-data.js'

export default function TopPages() {
  const max = Math.max(...topPages.map(p => p.visits))
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Pages / Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPages.map(page => (
          <div key={page.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{page.name}</span>
              <span className="text-slate-500">{page.visits.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-500"
                style={{ width: `${(page.visits / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
