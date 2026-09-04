import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Sidebar from '../components/common/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import CreditScoreCard from '../components/credit/CreditScoreCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCibilCheck } from '../context/CibilCheckContext.jsx'
import { useProfilePortfolio } from '../hooks/useProfilePortfolio.js'
import { formatInr } from '../lib/userPortfolio.js'
import { Link } from 'react-router-dom'

function HealthScore({ health, loading }) {
  if (loading) {
    return (
      <Card>
        <p className="text-sm text-slate-500 text-center py-8">Loading financial health…</p>
      </Card>
    )
  }

  const score = health?.score ?? 0
  const max = health?.max ?? 100
  const pct = Math.min(100, Math.max(0, Math.round((score / max) * 100)))
  const metrics = health?.metrics ?? []

  return (
    <Card>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeDasharray={`${pct},100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-primary">{score}</div>
              <div className="text-[10px] text-slate-500">/{max}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-primary">Financial Health</h3>
          <p className="text-xs text-slate-500">{health?.label || '—'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {metrics.map((m) => (
          <div key={m.key || m.label}>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">{m.label}</span>
              <span className="font-semibold">{m.score}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, m.score)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function isKycPending(status) {
  const value = String(status || '').toLowerCase()
  return value === 'pending' || value === 'submitted'
}

export default function Dashboard() {
  const { user, isKycApproved, isAuthenticated } = useAuth()
  const { openCibilCheck } = useCibilCheck()
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
  } = useProfilePortfolio(isAuthenticated)

  const summary = portfolio?.summary
  const mix = portfolio?.portfolioMix
  const allocation = mix?.allocation ?? []
  const monthly = portfolio?.monthlyBarChart
  const investments = portfolio?.investments ?? []
  const transactions = portfolio?.recentTransactions ?? []
  const credit = portfolio?.creditScore
  const health = portfolio?.financialHealth

  const creditCardResult = credit?.hasScore
    ? {
        score: credit.score,
        scoreBand: credit.scoreBand,
        provider: credit.provider,
        checkedAtLabel: credit.checkedAtLabel,
        referenceId: credit.referenceId,
      }
    : null

  return (
    <>
      <PageBanner {...getPageBanner('dashboard')} />
      <PageSideLayout className="!py-8">
        <div className="flex gap-6">
          <Sidebar />
          <div className="flex-1 min-w-0 space-y-6">
            {user && !isKycApproved && (
              <div
                className={`rounded-card p-4 border ${
                  isKycPending(user.kyc_status)
                    ? 'bg-amber-50 border-amber-200'
                    : user.kyc_status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary text-sm">
                      {isKycPending(user.kyc_status) && 'KYC Under Review'}
                      {user.kyc_status === 'rejected' && 'KYC Rejected — Action Required'}
                      {(user.kyc_status === 'not_started' || !user.kyc_status) && 'Complete Your KYC'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Investment features are locked until your KYC is approved.
                    </p>
                  </div>
                  {!isKycPending(user.kyc_status) && (
                    <Link
                      to="/onboarding/kyc/manual"
                      className="text-sm font-semibold text-secondary hover:underline whitespace-nowrap"
                    >
                      {user.kyc_status === 'rejected' ? 'Resubmit KYC' : 'Start KYC'} →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Summary + CIBIL — data.summary + data.credit_score */}
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 bg-gradient-to-br from-primary to-secondary text-white">
                <div className="text-sm text-white/70">Current Balance</div>
                {portfolioLoading ? (
                  <div className="text-2xl font-display font-bold mt-2 text-white/80">Loading…</div>
                ) : portfolioError ? (
                  <div className="mt-2">
                    <div className="text-2xl font-display font-bold">₹0</div>
                    <p className="text-sm text-white/70 mt-2">
                      {portfolioError.message || 'Unable to load portfolio. Please try again.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-display font-bold mt-1">
                      {summary?.currentBalanceDisplay ?? '₹0'}
                    </div>
                    <div className="text-sm text-white/70 mt-2">
                      Live portfolio from your FD, RD & wallet
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
                      <div>
                        <div className="text-xs text-white/60">Invested</div>
                        <div className="font-semibold">{summary?.investedDisplay ?? '₹0'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Active FDs</div>
                        <div className="font-semibold">{summary?.activeFds ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Active RDs</div>
                        <div className="font-semibold">{summary?.activeRds ?? 0}</div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
              <div>
                {portfolioLoading ? (
                  <Card hover={false} className="p-6 text-sm text-slate-500 text-center">
                    Loading credit score…
                  </Card>
                ) : (
                  <CreditScoreCard
                    result={creditCardResult}
                    compact
                    onCheckAgain={openCibilCheck}
                  />
                )}
              </div>
            </div>

            {/* Portfolio Mix pie — data.portfolio_mix */}
            <Card hover={false}>
              <h3 className="font-display font-bold text-primary mb-4">Portfolio Mix</h3>
              {portfolioLoading ? (
                <p className="text-sm text-slate-500 py-8 text-center">Loading portfolio mix…</p>
              ) : !mix?.hasData ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  {mix?.emptyMessage || 'No FD/RD allocation yet.'}
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={allocation} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                        {allocation.map((a, i) => (
                          <Cell key={i} fill={a.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatInr(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    {allocation.map((a) => (
                      <div key={a.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: a.color }} />
                        <span>
                          {a.name} {a.valueDisplay}
                          {a.percent != null ? ` (${a.percent}%)` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* My Investments — data.investments */}
            <Card hover={false}>
              <h3 className="font-display font-bold text-primary mb-4">My Investments</h3>
              {portfolioLoading ? (
                <p className="text-sm text-slate-500 py-6 text-center">Loading investments…</p>
              ) : investments.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No active investments found for your account.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2">Name</th>
                        <th>Invested</th>
                        <th>Maturity Value</th>
                        <th>P&L</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((i) => {
                        const pl = i.current - i.invested
                        const pct = i.invested > 0 ? ((pl / i.invested) * 100).toFixed(1) : '0.0'
                        const positive = pl >= 0
                        return (
                          <tr key={`${i.type}-${i.id}`} className="border-b border-slate-100">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                {i.logo ? (
                                  <img src={i.logo} alt="" className="w-7 h-7 rounded object-contain bg-slate-50" />
                                ) : null}
                                <div>
                                  <div className="font-semibold text-primary">{i.name}</div>
                                  <div className="text-xs text-slate-500">{i.type}</div>
                                </div>
                              </div>
                            </td>
                            <td>{i.investedDisplay}</td>
                            <td className="font-semibold">{i.currentDisplay}</td>
                            <td className={`font-semibold ${positive ? 'text-accent' : 'text-red-600'}`}>
                              {positive ? '+' : ''}
                              {formatInr(pl)} ({pct}%)
                            </td>
                            <td>
                              <Badge tone="green">{i.status}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Monthly bar + Financial Health — data.monthly_bar_chart + data.financial_health */}
            <div className="grid lg:grid-cols-3 gap-5">
              <Card hover={false} className="lg:col-span-2">
                <h3 className="font-display font-bold text-primary mb-4">Monthly Activity</h3>
                {portfolioLoading ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Loading chart…</p>
                ) : !monthly?.hasData ? (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    {monthly?.emptyMessage || 'No wallet activity yet.'}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthly.rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="m" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip formatter={(value) => formatInr(value)} />
                      <Legend />
                      {monthly.series.map((s) => (
                        <Bar
                          key={s.key}
                          dataKey={s.key}
                          name={s.label}
                          stackId="a"
                          fill={s.color}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
              <HealthScore health={health} loading={portfolioLoading} />
            </div>

            {/* Recent Transactions — data.recent_transactions */}
            <Card hover={false}>
              <h3 className="font-display font-bold text-primary mb-3">Recent Transactions</h3>
              {portfolioLoading ? (
                <p className="text-sm text-slate-500 py-6 text-center">Loading transactions…</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No recent transactions.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-sm font-semibold">
                        {t.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary truncate">{t.title}</div>
                        <div className="text-xs text-slate-500">
                          <Badge tone="slate">{t.category}</Badge> · {t.dateLabel}
                        </div>
                      </div>
                      <div className={`font-semibold ${t.credit ? 'text-accent' : 'text-red-600'}`}>
                        {t.amountDisplay}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </PageSideLayout>
    </>
  )
}
