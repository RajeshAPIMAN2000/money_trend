import { useEffect, useState } from 'react'
import { ArrowDownToLine, History, PieChart, Plus, Wallet, X } from 'lucide-react'
import { useWalletModal } from '../../context/WalletModalContext.jsx'
import {
  useAddDemoMoney,
  useCancelDemoInvestment,
  useDemoConfig,
  useDemoInvestments,
  useDemoWallet,
  useDemoWalletTransactions,
} from '../../hooks/useDemoWallet.js'
import { ApiError } from '../../lib/api.js'
import {
  DEFAULT_PRESETS,
  MAX_ADD,
  MIN_ADD,
  clampAddAmount,
  formatInr,
} from '../../lib/demoWallet.js'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { cn } from '../../lib/utils.js'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'add', label: 'Add Money', icon: Plus },
  { id: 'transactions', label: 'History', icon: History },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
]

function DemoNotice({ text }) {
  if (!text) return null
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
      {text}
    </div>
  )
}

function OverviewTab({ wallet }) {
  if (!wallet) {
    return <p className="text-sm text-slate-500 py-8 text-center">Loading wallet…</p>
  }

  const cards = [
    { label: 'Available', value: wallet.availableBalanceDisplay },
    { label: 'Invested', value: formatInr(wallet.totalInvested) },
    { label: 'Returns', value: formatInr(wallet.totalReturns) },
    { label: 'Portfolio', value: wallet.totalPortfolioValueDisplay },
  ]

  return (
    <div className="space-y-4">
      <DemoNotice text={wallet.demoNotice || wallet.label} />
      <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary text-white p-5">
        <p className="text-xs text-white/70 uppercase tracking-wide">Demo Wallet Balance</p>
        <p className="text-3xl font-display font-bold mt-1 tabular-nums">
          {wallet.availableBalanceDisplay}
        </p>
        <p className="text-xs text-white/60 mt-2">{wallet.label}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{c.label}</p>
            <p className="font-semibold text-primary tabular-nums mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>
      {wallet.adminFeePercent > 0 && (
        <p className="text-[11px] text-slate-500">
          Admin fee on invest: {wallet.adminFeePercent}%
        </p>
      )}
    </div>
  )
}

function AddMoneyTab({ presets, notice, onSuccess }) {
  const addMoney = useAddDemoMoney()
  const [amount, setAmount] = useState(presets[0] ?? 10000)
  const [custom, setCustom] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const selected = custom !== '' ? Number(custom) : amount

  const handleAdd = async () => {
    setError('')
    setSuccess(null)
    const value = clampAddAmount(selected)
    if (!Number.isFinite(Number(selected)) || Number(selected) < MIN_ADD) {
      setError(`Enter an amount between ${formatInr(MIN_ADD)} and ${formatInr(MAX_ADD)}`)
      return
    }
    try {
      const result = await addMoney.mutateAsync(value)
      setSuccess(result)
      setCustom('')
      onSuccess?.(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add demo money')
    }
  }

  return (
    <div className="space-y-4">
      <DemoNotice text={notice} />
      <div>
        <p className="text-sm font-medium text-primary mb-2">Quick amounts</p>
        <div className="flex flex-wrap gap-2">
          {(presets.length ? presets : DEFAULT_PRESETS).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setCustom(''); setError(''); setSuccess(null) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors',
                custom === '' && amount === p
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-white text-ink border-slate-200 hover:border-secondary/40',
              )}
            >
              {formatInr(p)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Custom amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
          <input
            type="number"
            min={MIN_ADD}
            max={MAX_ADD}
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setError(''); setSuccess(null) }}
            placeholder="Enter amount"
            className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Min {formatInr(MIN_ADD)} · Max {formatInr(MAX_ADD)}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
          {success.message} — Balance now {formatInr(success.balanceAfter)}
          {success.demoTxnId ? ` (${success.demoTxnId})` : ''}
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleAdd}
        disabled={addMoney.isPending}
      >
        {addMoney.isPending
          ? 'Adding…'
          : `Add ${formatInr(clampAddAmount(selected || MIN_ADD))} to Wallet`}
      </Button>
    </div>
  )
}

function TransactionsTab({ enabled }) {
  const { data, isLoading, error } = useDemoWalletTransactions({ enabled, limit: 50 })

  if (isLoading) {
    return <p className="text-sm text-slate-500 py-8 text-center">Loading transactions…</p>
  }
  if (error) {
    return (
      <p className="text-sm text-red-600 py-6 text-center">
        {error.message || 'Failed to load transactions'}
      </p>
    )
  }

  const txns = data?.transactions ?? []

  return (
    <div className="space-y-3">
      <DemoNotice text={data?.demoNotice} />
      {txns.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No wallet transactions yet.</p>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto -mx-1 px-1">
          {txns.map((t) => (
            <div key={t.id} className="flex items-start gap-3 py-3">
              <div className={cn(
                'w-9 h-9 rounded-lg grid place-items-center shrink-0',
                t.credit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
              )}>
                <ArrowDownToLine className={cn('w-4 h-4', !t.credit && 'rotate-180')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{t.typeLabel}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {t.description || t.demoTxnId || t.category}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.dateLabel}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn('text-sm font-semibold tabular-nums', t.credit ? 'text-accent' : 'text-red-600')}>
                  {t.amountDisplay}
                </p>
                <Badge tone="slate">{t.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PortfolioTab({ enabled }) {
  const { data, isLoading, error, refetch } = useDemoInvestments({ enabled, status: 'ACTIVE' })
  const cancelMutation = useCancelDemoInvestment()
  const [confirmItem, setConfirmItem] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const items = data?.items ?? []

  const handleCancel = async () => {
    if (!confirmItem) return
    setActionError('')
    setActionSuccess('')
    try {
      const result = await cancelMutation.mutateAsync({
        type: confirmItem.type,
        id: confirmItem.id,
      })
      setActionSuccess(
        result.message
        || `Cancelled. ${result.totalDisplay} (principal + interest) credited to wallet.`,
      )
      setConfirmItem(null)
      refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to cancel order')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500 py-8 text-center">Loading portfolio…</p>
  }
  if (error) {
    return (
      <p className="text-sm text-red-600 py-6 text-center">
        {error.message || 'Failed to load investments'}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <DemoNotice text={data?.demoNotice} />
      {actionError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
          {actionSuccess}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No active demo investments.</p>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto">
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="rounded-xl border border-slate-200 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{item.product}</p>
                  <p className="text-[11px] text-slate-500">
                    {item.type} · {item.interestRate}% · {item.tenureMonths} mo
                  </p>
                </div>
                <Badge tone="green">{item.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-slate-500">Invested</p>
                  <p className="font-semibold tabular-nums">{item.principalDisplay}</p>
                </div>
                <div>
                  <p className="text-slate-500">Interest / Profit</p>
                  <p className="font-semibold text-accent tabular-nums">{item.profitDisplay}</p>
                </div>
                <div>
                  <p className="text-slate-500">Maturity</p>
                  <p className="font-semibold tabular-nums">{item.maturityDisplay}</p>
                </div>
              </div>
              {item.demoLabel && (
                <p className="text-[10px] text-slate-400">{item.demoLabel}</p>
              )}
              {item.canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => { setConfirmItem(item); setActionError(''); setActionSuccess('') }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmItem && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-lift w-full max-w-sm p-5 space-y-4">
            <h4 className="font-display font-bold text-primary">Cancel Order?</h4>
            <p className="text-sm text-slate-600">
              Cancelling <strong>{confirmItem.product}</strong> will withdraw the invested amount
              along with interest / profit back to your demo wallet.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Principal</span>
                <span className="font-semibold tabular-nums">{confirmItem.principalDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interest / Profit</span>
                <span className="font-semibold text-accent tabular-nums">{confirmItem.profitDisplay}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-medium">Total withdraw</span>
                <span className="font-bold tabular-nums">{confirmItem.maturityDisplay}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmItem(null)}>
                Keep
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                disabled={cancelMutation.isPending}
                onClick={handleCancel}
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel & Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WalletPopup() {
  const { isOpen, session, closeWallet } = useWalletModal()
  const [tab, setTab] = useState('overview')

  const { data: config } = useDemoConfig({ enabled: isOpen })
  const { data: wallet, refetch: refetchWallet } = useDemoWallet({ enabled: isOpen })

  useEffect(() => {
    if (isOpen && session?.tab) setTab(session.tab)
  }, [isOpen, session?.tab])

  if (!isOpen) return null

  const notice = wallet?.demoNotice || wallet?.label || config?.demoNotice
  const presets = config?.presets?.length
    ? config.presets
    : DEFAULT_PRESETS

  return (
    <div
      className="fixed inset-0 z-[55] grid place-items-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={closeWallet}
    >
      <div
        className="bg-white rounded-card shadow-lift w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <Wallet className="w-5 h-5 text-secondary" />
              Wallet
              {(config?.demoMode || wallet?.demoMode) && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Demo
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {wallet?.availableBalanceDisplay
                ? `Balance ${wallet.availableBalanceDisplay}`
                : 'Virtual funds'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeWallet}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 px-3 pt-3 border-b border-slate-100 shrink-0 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors',
                tab === id
                  ? 'text-secondary bg-secondary/5 border-b-2 border-secondary'
                  : 'text-slate-500 hover:text-primary',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'overview' && <OverviewTab wallet={wallet} />}
          {tab === 'add' && (
            <AddMoneyTab
              presets={presets}
              notice={notice}
              onSuccess={() => refetchWallet()}
            />
          )}
          {tab === 'transactions' && <TransactionsTab enabled={tab === 'transactions'} />}
          {tab === 'portfolio' && <PortfolioTab enabled={tab === 'portfolio'} />}
        </div>
      </div>
    </div>
  )
}
