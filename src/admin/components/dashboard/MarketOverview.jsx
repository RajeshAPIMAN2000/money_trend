import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'
import { cn } from '../../../lib/utils.js'

function Sparkline({ data, up }) {
  if (!data?.length) return null
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={up ? '#10B981' : '#EF4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function MarketOverview({ data = [] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Market Indices</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No market data available</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data.map((item) => (
              <div key={item.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.name}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{item.value}</div>
                <div className={cn('text-[10px] font-semibold mt-0.5', item.up ? 'text-emerald-600' : 'text-red-500')}>
                  {item.change}
                </div>
                {item.spark?.length > 0 && (
                  <div className="h-8 w-full overflow-hidden mt-1">
                    <Sparkline data={item.spark} up={item.up} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
