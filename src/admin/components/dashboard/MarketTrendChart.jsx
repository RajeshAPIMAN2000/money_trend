import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'

function ChartEmpty({ message = 'No data available' }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  )
}

export default function MarketTrendChart({ data = [], meta = {} }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>{meta.title ?? 'Market Overview'}</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle ?? 'NIFTY 50, SENSEX & Gold trend'}</p>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {data.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-[220px] w-full overflow-hidden relative isolate">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={42} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="nifty" name="NIFTY 50" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sensex" name="SENSEX" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gold" name="Gold" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
