import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'

export default function TopInvestments({ data = [] }) {
  const max = Math.max(...data.map((item) => item.progress ?? item.return), 1)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Top Performing Investments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No investment data available</p>
        ) : (
          data.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate pr-2">{item.name}</span>
                <span className="text-emerald-600 font-semibold shrink-0">+{item.return}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                  style={{ width: `${((item.progress ?? item.return) / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
