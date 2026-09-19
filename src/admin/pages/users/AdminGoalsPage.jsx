import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Target, Clock, Wallet, RefreshCw } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import EmptyState from '../../components/shared/EmptyState.jsx'
import TableSkeleton from '../../components/shared/TableSkeleton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import {
  AdminTable, AdminTableHead, AdminTableHeader, AdminTableBody, AdminTableRow, AdminTableCell,
} from '../../components/ui/AdminTable.jsx'
import { api } from '../../../lib/api.js'
import { formatGoalInr, parseGoalsList } from '../../../lib/goals.js'
import { goalIconSrc } from '../../../lib/brandAssets.js'

function useAdminGoalsList(params) {
  return useQuery({
    queryKey: ['admin', 'goals', params],
    queryFn: async () => parseGoalsList(await api.getAdminGoals(params)),
    staleTime: 0,
  })
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'completed' || s === 'achieved') return 'success'
  if (s === 'paused' || s === 'cancelled') return 'default'
  return 'info'
}

function ProgressBar({ pct }) {
  const value = Math.min(100, Math.max(0, Number(pct) || 0))
  return (
    <div className="mt-1.5 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className={`h-full rounded-full ${value >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function AdminGoalsPage() {
  const [search, setSearch] = useState('')
  const [goalType, setGoalType] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading, error, refetch, isFetching } = useAdminGoalsList({
    search: search || undefined,
    goal_type: goalType || undefined,
    status: status || undefined,
    per_page: 100,
  })

  const items = data?.items ?? []

  const totals = useMemo(() => {
    const invested = items.reduce((sum, g) => sum + (Number(g.saved) || 0), 0)
    const target = items.reduce((sum, g) => sum + (Number(g.target) || 0), 0)
    return { invested, target }
  }, [items])

  return (
    <PageShell
      title="User Goals"
      breadcrumb={['Home', 'User Management', 'Goals']}
      description="Every user goal with purpose, amount invested, and time left until the target date."
      stats={[
        { label: 'Total goals', value: String(data?.summary?.total ?? items.length) },
        { label: 'Active', value: String(data?.summary?.active ?? 0) },
        { label: 'Achieved', value: String(data?.summary?.achieved ?? 0) },
        { label: 'Total invested', value: formatGoalInr(totals.invested) },
      ]}
      actions={
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </AdminButton>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error.message || 'Failed to load goals'}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user, goal, or purpose…"
          className="h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-w-[220px]"
        />
        <select
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="">All purposes</option>
          <option value="DREAM_HOUSE">Dream House</option>
          <option value="RETIREMENT">Retirement</option>
          <option value="CHILD_EDUCATION">Child Education</option>
          <option value="EMERGENCY_FUND">Emergency Fund</option>
          <option value="VACATION">Vacation</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="WEDDING">Wedding</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="achieved">Achieved</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No goals found"
          description="When users create investment goals, they appear here with invested amount, purpose, and time remaining."
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <AdminTable>
              <AdminTableHead>
                <AdminTableHeader>User</AdminTableHeader>
                <AdminTableHeader>Goal / investing for</AdminTableHeader>
                <AdminTableHeader>Invested</AdminTableHeader>
                <AdminTableHeader>Target</AdminTableHeader>
                <AdminTableHeader>Progress</AdminTableHeader>
                <AdminTableHeader>Time remaining</AdminTableHeader>
                <AdminTableHeader>Status</AdminTableHeader>
                <AdminTableHeader className="text-right">Action</AdminTableHeader>
              </AdminTableHead>
              <AdminTableBody>
                {items.map((g) => {
                  const icon = g.iconSrc || goalIconSrc(g.goalType)
                  return (
                    <AdminTableRow key={g.id}>
                      <AdminTableCell>
                        <div className="min-w-[140px]">
                          {g.userId ? (
                            <Link
                              to={`/admin/users/${g.userId}`}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {g.userName || `User #${g.userId}`}
                            </Link>
                          ) : (
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {g.userName || '—'}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {g.userEmail || g.userPhone || '—'}
                          </p>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="flex items-start gap-2.5 min-w-[200px]">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 grid place-items-center overflow-hidden shrink-0">
                            {icon ? (
                              <img src={icon} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              <Target className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {g.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Investing for:{' '}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {g.goalTypeLabel}
                              </span>
                            </p>
                            {g.notes ? (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{g.notes}</p>
                            ) : null}
                          </div>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                              {g.savedDisplay}
                            </p>
                            <p className="text-[11px] text-slate-400">amount invested</p>
                          </div>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{g.targetDisplay}</p>
                        <p className="text-[11px] text-slate-400">{g.remainingDisplay} still needed</p>
                      </AdminTableCell>

                      <AdminTableCell>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{g.pct}%</p>
                        <ProgressBar pct={g.pct} />
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="flex items-start gap-1.5 min-w-[130px]">
                          <Clock
                            className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                              g.remainingOverdue ? 'text-rose-500' : 'text-amber-600'
                            }`}
                          />
                          <div>
                            <p
                              className={`font-semibold text-sm ${
                                g.remainingOverdue
                                  ? 'text-rose-600'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {g.remainingTimeLabel || '—'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Target {g.targetDateLabel}
                              {g.remainingDays != null && g.remainingDays > 0 && !g.remainingOverdue
                                ? ` · ${g.remainingDays} days`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminBadge tone={statusTone(g.status)}>
                          {g.status || 'active'}
                        </AdminBadge>
                      </AdminTableCell>

                      <AdminTableCell className="text-right">
                        {g.userId ? (
                          <Link
                            to={`/admin/users/${g.userId}`}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            View user
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </AdminTableCell>
                    </AdminTableRow>
                  )
                })}
              </AdminTableBody>
            </AdminTable>
          </div>

          {/* Mobile / tablet cards */}
          <div className="grid sm:grid-cols-2 gap-3 lg:hidden">
            {items.map((g) => {
              const icon = g.iconSrc || goalIconSrc(g.goalType)
              return (
                <div
                  key={`card-${g.id}`}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 grid place-items-center overflow-hidden shrink-0">
                      {icon ? (
                        <img src={icon} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <Target className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{g.title}</p>
                      <p className="text-[11px] text-slate-500">
                        For: {g.goalTypeLabel}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {g.userName || g.userEmail || 'User'}
                      </p>
                    </div>
                    <AdminBadge tone={statusTone(g.status)}>{g.status}</AdminBadge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-emerald-700/70">Invested</p>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">{g.savedDisplay}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Target</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{g.targetDisplay}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2 col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-amber-700/70">Time remaining</p>
                      <p className={`font-bold ${g.remainingOverdue ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
                        {g.remainingTimeLabel || '—'}
                      </p>
                      <p className="text-[11px] text-slate-400">Target date: {g.targetDateLabel}</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Progress</span>
                      <span className="font-semibold">{g.pct}%</span>
                    </div>
                    <ProgressBar pct={g.pct} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </PageShell>
  )
}
