import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'
import { investmentTrend, assetAllocation } from '../../data/admin-dashboard-data.js'

export function RevenueChart({ data = [], meta = {} }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>{meta.title ?? 'Revenue Overview'}</CardTitle>
          {meta.subtitle && <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No revenue data available</div>
        ) : (
          <div className="h-[220px] w-full overflow-hidden relative isolate">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" name="Revenue (Cr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ModuleChart({ type }) {
  if (!type || type === 'none') return null

  if (type === 'market') {
    return (
      <Card>
        <CardHeader><CardTitle>Market Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={investmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'performance') {
    const data = [
      { name: 'HDFC Top 100', return: 21.8 },
      { name: 'Axis Bluechip', return: 19.2 },
      { name: 'Nippon Growth', return: 24.5 },
      { name: 'SBI Small Cap', return: 17.6 },
    ]
    return (
      <Card>
        <CardHeader><CardTitle>Fund Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={v => [`${v}%`, 'Return']} />
                <Bar dataKey="return" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'allocation' || type === 'analytics') {
    return (
      <Card>
        <CardHeader><CardTitle>{type === 'analytics' ? 'User Analytics' : 'Asset Allocation'}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetAllocation} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {assetAllocation.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'revenue') return <RevenueChart />

  if (type === 'api') {
    const data = [
      { name: 'NSE', latency: 98 },
      { name: 'BSE', latency: 112 },
      { name: 'Payment', latency: 156 },
      { name: 'KYC', latency: 842 },
      { name: 'SMS', latency: 245 },
    ]
    return (
      <Card>
        <CardHeader><CardTitle>API Latency (ms)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="latency" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
