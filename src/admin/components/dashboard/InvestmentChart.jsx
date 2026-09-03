import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'

function ChartEmpty({ message = 'No data available' }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  )
}

export default function InvestmentChart({ data = [], summary = {} }) {
  const total = summary.total ?? '₹0'
  const growth = summary.growth ? `${summary.growth} growth` : ''
  const title = summary.title ?? 'Investment Overview'
  const subtitle = summary.subtitle ?? ''

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          <p className="text-lg font-display font-bold text-slate-900 dark:text-white mt-1">{total}</p>
          {growth && <p className="text-xs text-emerald-600 font-medium">{growth}</p>}
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {data.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-[220px] w-full overflow-hidden relative isolate">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => [`₹${v} Cr`, 'Investment']}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fill="url(#invGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
