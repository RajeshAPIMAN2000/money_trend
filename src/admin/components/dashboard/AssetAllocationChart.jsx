import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'

export default function AssetAllocationChart({ data = [], meta = {} }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{meta.title ?? 'Asset Allocation Overview'}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {data.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center text-sm text-slate-400">No data available</div>
        ) : (
          <>
            <div className="h-[180px] w-full overflow-hidden relative isolate">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {data.map((item) => (
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
  )
}
