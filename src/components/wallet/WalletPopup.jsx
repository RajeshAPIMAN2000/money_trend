import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownToLine,
  Banknote,
  History,
  PieChart,
  Plus,
  Wallet,
  X,
} from 'lucide-react'
import { useWalletModal } from '../../context/WalletModalContext.jsx'
import { usePaymentModal } from '../../context/PaymentModalContext.jsx'
import {
  useCancelDemoInvestment,
  useDemoConfig,
  useDemoInvestments,
  useDemoWallet,
  useDemoWalletTransactions,
} from '../../hooks/useDemoWallet.js'
import { invalidateMoneyQueries } from '../../hooks/useDummyPayment.js'
import { api, ApiError } from '../../lib/api.js'
import {
  DEFAULT_PRESETS,
  MAX_ADD,
  MIN_ADD,
  clampAddAmount,
  formatInr,
} from '../../lib/demoWallet.js'
import { PAYMENT_PURPOSES } from '../../lib/dummyPayment.js'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { cn } from '../../lib/utils.js'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'add', label: 'Add Money', icon: Plus },
  { id: 'withdraw', label: 'Withdraw', icon: Banknote },
  { id: 'transactions', label: 'History', icon: History },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
]

const EMPTY_BANK = {
  account_holder_name: '',
  bank_name: '',
  ifsc: '',
  account_number: '',
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
      <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary text-white p-5">
        <p className="text-xs text-white/70 uppercase tracking-wide">Wallet Balance</p>
        <p className="text-3xl font-display font-bold mt-1 tabular-nums">
          {wallet.availableBalanceDisplay}
        </p>
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

/** Add money via card + OTP payment gateway (wallet_deposit) */
function AddMoneyTab({ presets, onSuccess }) {
  const { openPayment } = usePaymentModal()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(presets[0] ?? 10000)
  const [custom, setCustom] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selected = custom !== '' ? Number(custom) : amount

  const handlePay = () => {
    setError('')
    setSuccess('')
    if (!Number.isFinite(Number(selected)) || Number(selected) < MIN_ADD) {
      setError(`Enter an amount between ${formatInr(MIN_ADD)} and ${formatInr(MAX_ADD)}`)
      return
    }
    const value = clampAddAmount(selected)

    openPayment({
      purpose: PAYMENT_PURPOSES.WALLET_DEPOSIT,
      amount: value,
      title: `Add money · ${formatInr(value)}`,
      description: 'Add money to your wallet',
      meta: { reason: 'wallet_add_money' },
      onSuccess: async () => {
        await invalidateMoneyQueries(queryClient)
        setSuccess(`₹${value.toLocaleString('en-IN')} added to wallet`)
        setCustom('')
        onSuccess?.()
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary mb-2">Quick amounts</p>
        <div className="flex flex-wrap gap-2">
          {(presets.length ? presets : DEFAULT_PRESETS).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setCustom(''); setError(''); setSuccess('') }}
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
            onChange={(e) => { setCustom(e.target.value); setError(''); setSuccess('') }}
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
          {success}
        </div>
      )}

      <Button className="w-full" onClick={handlePay}>
        Continue to Card Payment · {formatInr(clampAddAmount(selected || MIN_ADD))}
      </Button>
    </div>
  )
}

function parseBankAccount(payload) {
  const root = payload?.data ?? payload ?? {}
  const bank = root.bank_account ?? root.bank ?? root.account ?? root
  if (!bank || typeof bank !== 'object') return null
  const holder = bank.account_holder_name ?? bank.holder_name ?? bank.name
  const number = bank.account_number ?? bank.accountNumber
  if (!holder && !number) return null
  return {
    account_holder_name: holder || '',
    bank_name: bank.bank_name ?? bank.bankName ?? '',
    ifsc: bank.ifsc ?? bank.ifsc_code ?? '',
    account_number: number || '',
    masked:
      bank.masked_account_number
      ?? bank.account_number_masked
      ?? (number ? `XXXX${String(number).slice(-4)}` : null),
    raw: bank,
  }
}

function parseWithdrawals(payload) {
  const root = payload?.data ?? payload ?? {}
  const list = Array.isArray(root.withdrawals)
    ? root.withdrawals
    : (Array.isArray(root.items) ? root.items : (Array.isArray(root) ? root : []))
  return list.map((w, i) => ({
    id: w.withdrawal_id ?? w.id ?? w.demo_ref ?? i,
    amount: Number(w.amount ?? 0),
    amountDisplay: formatInr(w.amount ?? 0),
    status: String(w.status || 'pending').toUpperCase(),
    demoRef: w.demo_ref ?? w.reference ?? null,
    method: w.method ?? 'bank',
    bankMasked: w.linked_bank?.masked_account_number
      ?? w.bank_masked
      ?? w.account_number_masked
      ?? null,
    createdAt: w.created_at
      ? new Date(w.created_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
      : '—',
  }))
}

function WithdrawTab({ enabled, availableBalance, onSuccess }) {
  const queryClient = useQueryClient()
  const [bankForm, setBankForm] = useState(EMPTY_BANK)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingBank, setEditingBank] = useState(false)

  const bankQuery = useQuery({
    queryKey: ['wallet', 'bank-account'],
    queryFn: async () => parseBankAccount(await api.getWalletBankAccount()),
    enabled: Boolean(enabled),
    retry: false,
  })

  const historyQuery = useQuery({
    queryKey: ['wallet', 'withdrawals'],
    queryFn: async () => parseWithdrawals(await api.getWalletWithdrawals()),
    enabled: Boolean(enabled),
    staleTime: 0,
  })

  useEffect(() => {
    if (bankQuery.data) {
      setBankForm({
        account_holder_name: bankQuery.data.account_holder_name,
        bank_name: bankQuery.data.bank_name,
        ifsc: bankQuery.data.ifsc,
        account_number: bankQuery.data.account_number,
      })
      setEditingBank(false)
    } else if (bankQuery.isFetched && !bankQuery.data) {
      setEditingBank(true)
    }
  }, [bankQuery.data, bankQuery.isFetched])

  const saveBank = useMutation({
    mutationFn: (body) => api.saveWalletBankAccount(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wallet', 'bank-account'] })
      setSuccess('Bank account saved')
      setEditingBank(false)
    },
  })

  const withdraw = useMutation({
    mutationFn: (value) => api.withdrawWallet({ amount: value }),
    onSuccess: async (res) => {
      const root = res?.data ?? res ?? {}
      await invalidateMoneyQueries(queryClient)
      await queryClient.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] })
      setSuccess(
        root.message
        || `Withdrawal ${root.demo_ref || root.withdrawal_id || ''} submitted (pending).`,
      )
      setAmount('')
      onSuccess?.()
    },
  })

  const hasBank = Boolean(bankQuery.data) && !editingBank

  const onSaveBank = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const { account_holder_name, bank_name, ifsc, account_number } = bankForm
    if (!account_holder_name.trim() || !bank_name.trim() || !ifsc.trim() || !account_number.trim()) {
      setError('Fill all bank account fields')
      return
    }
    try {
      await saveBank.mutateAsync({
        account_holder_name: account_holder_name.trim(),
        bank_name: bank_name.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        account_number: account_number.trim(),
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save bank account')
    }
  }

  const onWithdraw = async () => {
    setError('')
    setSuccess('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value < 1) {
      setError('Enter a valid withdrawal amount')
      return
    }
    if (availableBalance != null && value > availableBalance) {
      setError('Amount exceeds available wallet balance')
      return
    }
    try {
      await withdraw.mutateAsync(value)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Withdrawal failed')
    }
  }

  const fieldClass =
    'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary'

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Withdraw to your linked bank. Admin approval required before payout.
      </p>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">{success}</div>
      )}

      {hasBank ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-1">
          <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-primary">Linked bank</p>
            <button
              type="button"
              className="text-xs text-secondary font-semibold hover:underline"
              onClick={() => setEditingBank(true)}
            >
              Edit
            </button>
          </div>
          <p>{bankQuery.data.account_holder_name}</p>
          <p className="text-slate-600">{bankQuery.data.bank_name} · {bankQuery.data.ifsc}</p>
          <p className="tabular-nums text-slate-600">
            {bankQuery.data.masked || bankQuery.data.account_number}
          </p>
        </div>
      ) : (
        <form onSubmit={onSaveBank} className="space-y-2.5">
          <p className="text-sm font-medium text-primary">Save bank account</p>
          {[
            ['account_holder_name', 'Account holder name'],
            ['bank_name', 'Bank name'],
            ['ifsc', 'IFSC'],
            ['account_number', 'Account number'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-[11px] text-slate-500 mb-0.5">{label}</label>
              <input
                className={fieldClass}
                value={bankForm[key]}
                onChange={(e) => setBankForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={label}
                required
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={saveBank.isPending}>
            {saveBank.isPending ? 'Saving…' : 'Save Bank Account'}
          </Button>
        </form>
      )}

      {hasBank && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">Withdraw amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>
          {availableBalance != null && (
            <p className="text-[11px] text-slate-400">
              Available: {formatInr(availableBalance)}
            </p>
          )}
          <Button
            className="w-full"
            onClick={onWithdraw}
            disabled={withdraw.isPending}
          >
            {withdraw.isPending ? 'Submitting…' : 'Request Withdrawal'}
          </Button>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-primary mb-2">Withdrawal history</p>
        {historyQuery.isLoading ? (
          <p className="text-xs text-slate-500 py-4 text-center">Loading…</p>
        ) : (historyQuery.data?.length ?? 0) === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No withdrawals yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
            {historyQuery.data.map((w) => (
              <div key={w.id} className="flex justify-between gap-2 py-2 text-xs">
                <div>
                  <p className="font-semibold text-primary">{w.amountDisplay}</p>
                  <p className="text-slate-400">{w.createdAt}{w.demoRef ? ` · ${w.demoRef}` : ''}</p>
                </div>
                <Badge tone={w.status === 'PAID' || w.status === 'APPROVED' ? 'green' : 'amber'}>
                  {w.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
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
        <p className="text-sm text-slate-500 py-8 text-center">No active investments.</p>
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
              along with interest / profit back to your wallet.
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
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {wallet?.availableBalanceDisplay
                ? `Balance ${wallet.availableBalanceDisplay}`
                : 'Your wallet'}
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
              onSuccess={() => refetchWallet()}
            />
          )}
          {tab === 'withdraw' && (
            <WithdrawTab
              enabled={tab === 'withdraw'}
              availableBalance={wallet?.availableBalance}
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
