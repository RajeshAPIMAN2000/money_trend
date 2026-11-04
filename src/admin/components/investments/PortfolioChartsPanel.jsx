import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'

const EMPTY = (
  <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
    No chart data available
  </div>
)

export default function PortfolioChartsPanel({ charts }) {
  const allocation = charts?.allocation?.allocation ?? []
  const allocationTitle = charts?.allocation?.title ?? 'Portfolio Allocation'
  const lineData = charts?.trend?.lineData ?? []
  const lineTitle = charts?.trend?.title ?? 'Portfolio Value Trend'

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{allocationTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {allocation.length === 0 ? EMPTY : (
            <>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={3}>
                      {allocation.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {allocation.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="ml-auto font-semibold text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{lineTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length === 0 ? EMPTY : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} name="Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
