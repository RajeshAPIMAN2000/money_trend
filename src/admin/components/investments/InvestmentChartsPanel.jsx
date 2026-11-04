import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'

const EMPTY = (
  <div className="h-[240px] flex items-center justify-center text-sm text-slate-400">
    No chart data available
  </div>
)

export default function InvestmentChartsPanel({ performance, allocationData, productType = 'FD' }) {
  const barData = performance?.barData ?? []
  const allocation = allocationData?.allocation ?? []
  const allocationTitle = allocationData?.title ?? 'Asset Allocation'
  const allocationNote = allocationData?.note

  return (
    <div className="grid lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{performance?.title ?? `${productType} Fund Performance`}</CardTitle>
          {performance?.subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{performance.subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          {barData.length === 0 ? EMPTY : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Rate']} />
                  <Bar dataKey="return" fill="#2563EB" radius={[0, 4, 4, 0]} name="Interest Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{allocationTitle}</CardTitle>
          {allocationNote && allocation.length === 0 && (
            <p className="text-xs text-slate-500 mt-0.5">{allocationNote}</p>
          )}
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
              <div className="grid grid-cols-2 gap-2 mt-2">
                {allocation.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                    <span className="ml-auto font-semibold text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
