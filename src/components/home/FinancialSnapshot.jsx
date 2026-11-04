import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts'

const allocationData = [
  { name: 'Equity', value: 60, color: '#0056D2' },
  { name: 'Debt', value: 25, color: '#10B981' },
  { name: 'Gold', value: 10, color: '#F59E0B' },
  { name: 'Others', value: 5, color: '#94A3B8' },
]

const netWorthTrend = [
  { v: 10.2 }, { v: 10.5 }, { v: 10.3 }, { v: 10.8 }, { v: 11.1 },
  { v: 11.4 }, { v: 11.2 }, { v: 11.8 }, { v: 12.1 }, { v: 12.4 }, { v: 12.75 },
]

function formatINR(value) {
  return Number(value).toLocaleString('en-IN')
}

function SectionCard({ className = '', children }) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-[0_8px_32px_rgba(15,23,42,0.1)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.12)] transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

export default function FinancialSnapshot({ dashboard, loading = false }) {
  const snapshot = dashboard?.snapshot
  const chartAllocation = snapshot?.allocation?.length ? snapshot.allocation : allocationData
  const chartTrend = snapshot?.netWorthTrend?.length ? snapshot.netWorthTrend : netWorthTrend

  if (!snapshot) {
    return (
      <div className="space-y-5 h-full">
        <h3 className="font-display font-bold text-[#0F172A] text-lg">My Financial Snapshot</h3>
        <SectionCard className="p-6 h-full grid place-items-center">
          <p className="text-sm text-slate-500">{loading ? 'Loading snapshot…' : 'No snapshot data available yet.'}</p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-5 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-[#0F172A] text-lg">My Financial Snapshot</h3>
        <Link to="/dashboard" className="text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
          View Full →
        </Link>
      </div>
      {loading && <p className="text-xs text-slate-400">Loading snapshot…</p>}

      <SectionCard className="p-6 bg-gradient-to-br from-white to-blue-50/30">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">Net Worth</div>
        <div className="flex items-end justify-between gap-3 mt-3">
          <div>
            <div className="text-3xl font-display font-bold text-[#0F172A]">{snapshot.netWorthDisplay ?? `₹${formatINR(snapshot.netWorth ?? 0)}`}</div>
            {snapshot.changePct != null && (
              <div className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 px-3 py-1 rounded-full w-fit">+{snapshot.changePct}% ▲</div>
            )}
          </div>
          <div className="w-32 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrend}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-4">Asset Allocation</div>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartAllocation} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={2} strokeWidth={0}>
                  {chartAllocation.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {chartAllocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-[#0F172A]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-4">Financial Health Score</div>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray={`${snapshot.healthScore ?? 85}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-[#0F172A] leading-none">{snapshot.healthScore ?? 85}</div>
                <div className="text-xs text-emerald-600 font-bold">{snapshot.healthLabel ?? 'Excellent'}</div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {snapshot.healthMessage ?? "Great going! You're on track with your savings and investment goals."}
            </p>
            <Link to="/dashboard" className="inline-flex mt-3 text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
              Improve Score →
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}