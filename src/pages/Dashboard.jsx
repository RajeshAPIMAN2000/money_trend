import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { allocation, investments, expenses, txns } from '../data/dashboard-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Sidebar from '../components/common/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

function HealthScore() {
  const subs = [['Savings Rate', 85], ['Investment Mix', 72], ['Debt Load', 90], ['Emergency Fund', 65]]
  return (
    <Card>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="78,100" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 grid place-items-center"><div className="text-center"><div className="text-2xl font-display font-bold text-primary">78</div><div className="text-[10px] text-slate-500">/100</div></div></div>
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-primary">Financial Health</h3>
          <p className="text-xs text-slate-500">Good standing — keep building emergency fund</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {subs.map(([n, v]) => (
          <div key={n}>
            <div className="flex justify-between text-xs"><span className="text-slate-600">{n}</span><span className="font-semibold">{v}</span></div>
            <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${v}%` }} /></div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <>
      <PageBanner {...getPageBanner('dashboard')} />
    <PageSideLayout className="!py-8">
      <div className="flex gap-6">
      <Sidebar />
      <div className="flex-1 min-w-0 space-y-6">
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 bg-gradient-to-br from-primary to-secondary text-white">
            <div className="text-sm text-white/70">Net Worth</div>
            <div className="text-4xl font-display font-bold mt-1">₹12,45,800</div>
            <div className="text-sm text-accent mt-2">+₹89,200 (8.3%) this year ▲</div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
              <div><div className="text-xs text-white/60">Invested</div><div className="font-semibold">₹10.2L</div></div>
              <div><div className="text-xs text-white/60">Returns</div><div className="font-semibold text-accent">₹2.25L</div></div>
              <div><div className="text-xs text-white/60">Goals on track</div><div className="font-semibold">3/4</div></div>
            </div>
          </Card>
          <Card hover={false}>
            <h3 className="font-display font-bold text-primary">Portfolio Mix</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={allocation} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {allocation.map((a, i) => <Cell key={i} fill={a.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {allocation.map(a => (
                <div key={a.name} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />{a.name} ₹{(a.value/100000).toFixed(1)}L</div>
              ))}
            </div>
          </Card>
        </div>

        <Card hover={false}>
          <h3 className="font-display font-bold text-primary mb-4">My Investments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200"><tr><th className="py-2">Name</th><th>Invested</th><th>Current</th><th>P&L</th><th>Status</th></tr></thead>
              <tbody>
                {investments.map(i => {
                  const pl = i.current - i.invested
                  const pct = ((pl / i.invested) * 100).toFixed(1)
                  return (
                    <tr key={i.name} className="border-b border-slate-100">
                      <td className="py-3"><div className="font-semibold text-primary">{i.name}</div><div className="text-xs text-slate-500">{i.type}</div></td>
                      <td>₹{i.invested.toLocaleString('en-IN')}</td>
                      <td className="font-semibold">₹{i.current.toLocaleString('en-IN')}</td>
                      <td className="text-accent font-semibold">+₹{pl.toLocaleString('en-IN')} ({pct}%)</td>
                      <td><Badge tone="green">{i.status}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card hover={false} className="lg:col-span-2">
            <h3 className="font-display font-bold text-primary mb-4">Monthly Expenses</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="m" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Housing" stackId="a" fill="#2563EB" />
                <Bar dataKey="Food" stackId="a" fill="#10B981" />
                <Bar dataKey="Transport" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Entertainment" stackId="a" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <HealthScore />
        </div>

        <Card hover={false}>
          <h3 className="font-display font-bold text-primary mb-3">Recent Transactions</h3>
          <div className="divide-y divide-slate-100">
            {txns.map((t, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-sm font-semibold">{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-primary truncate">{t.desc}</div>
                  <div className="text-xs text-slate-500"><Badge tone="slate">{t.cat}</Badge> · {t.date}</div>
                </div>
                <div className={`font-semibold ${t.credit ? 'text-accent' : 'text-red-600'}`}>{t.credit ? '+' : ''}₹{Math.abs(t.amt).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>
    </PageSideLayout>
    </>
  )
}
