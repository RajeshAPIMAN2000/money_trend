import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, Users, Wallet, TrendingUp, IndianRupee, ShieldCheck, Repeat, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import PageShell from '../components/shared/PageShell.jsx'
import { RevenueChart } from '../components/shared/ModuleChart.jsx'
import InvestmentChart from '../components/dashboard/InvestmentChart.jsx'
import MarketTrendChart from '../components/dashboard/MarketTrendChart.jsx'
import AssetAllocationChart from '../components/dashboard/AssetAllocationChart.jsx'
import TopInvestments from '../components/dashboard/TopInvestments.jsx'
import MarketOverview from '../components/dashboard/MarketOverview.jsx'
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx'
import KycSummaryChart from '../components/dashboard/KycSummaryChart.jsx'
import SystemStatus from '../components/dashboard/SystemStatus.jsx'
import { Card, CardContent } from '../components/ui/AdminCard.jsx'
import { useAdminDashboard } from '../hooks/useAdminDashboard.js'
import { cn } from '../../lib/utils.js'

const mainKpiConfig = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400' },
  { key: 'totalInvestments', label: 'Total Investments', icon: Wallet, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  { key: 'portfolioValue', label: 'Portfolio Value', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  { key: 'revenueGenerated', label: 'Revenue Generated', icon: IndianRupee, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
]

const secondaryKpiConfig = [
  { key: 'todaysDeposits', label: "Today's Deposits", icon: ArrowDownToLine, color: 'text-emerald-600' },
  { key: 'todaysWithdrawals', label: "Today's Withdrawals", icon: ArrowUpFromLine, color: 'text-amber-600' },
  { key: 'pendingKyc', label: 'Pending KYC', icon: ShieldCheck, color: 'text-orange-600' },
  { key: 'activeSips', label: 'Active SIPs', icon: Repeat, color: 'text-blue-600' },
]

const shellProps = {
  title: 'Dashboard',
  breadcrumb: ['Home', 'Dashboard'],
  showExport: true,
  exportType: 'dashboard',
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return (
      <PageShell {...shellProps}>
        <div className="py-16 text-center text-sm text-slate-500">Loading dashboard...</div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell {...shellProps}>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error.message || 'Failed to load dashboard data'}
        </div>
      </PageShell>
    )
  }

  const quickActions = data.quickActions?.length
    ? data.quickActions.map((action) => ({
        label: action.label ?? action.title,
        path: action.path ?? action.url ?? '#',
      }))
    : []

  return (
    <PageShell {...shellProps} dateRangeLabel={data.dateRangeLabel}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainKpiConfig.map((kpi, i) => {
          const stats = data.mainKpis[kpi.key]
          return (
            <motion.div key={kpi.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2.5 rounded-xl', kpi.color)}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    {stats.change && (
                      <span className={cn('text-xs font-semibold', stats.up ? 'text-emerald-600' : 'text-red-500')}>{stats.change}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">{kpi.label}</p>
                  <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5">{stats.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryKpiConfig.map((kpi, i) => {
          const stats = data.secondaryKpis[kpi.key]
          return (
            <motion.div key={kpi.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <Card>
                <CardContent className="py-4 flex items-center gap-3">
                  <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                  <div>
                    <p className="text-[11px] text-slate-500">{kpi.label}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
          <InvestmentChart data={data.investmentTrend} summary={data.investmentSummary} />
          <MarketTrendChart data={data.marketTrend} meta={data.marketTrendMeta} />
        </div>
        <div className="flex flex-col gap-4 min-w-0">
          <AssetAllocationChart data={data.assetAllocation} meta={data.assetAllocationMeta} />
          {quickActions.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.path}
                      to={action.path}
                      className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <RevenueChart data={data.revenueTrend} meta={data.revenueMeta} />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        <TopInvestments data={data.topInvestments} />
        <MarketOverview data={data.marketIndices} />
        <RecentTransactions data={data.recentTransactions} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <KycSummaryChart data={data.kycSummary} meta={data.kycMeta} />
        <SystemStatus data={data.systemStatus} />
      </div>
    </PageShell>
  )
}
