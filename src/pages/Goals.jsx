import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthModal } from '../context/AuthModalContext.jsx'
import { usePaymentModal } from '../context/PaymentModalContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useGoalMutations, useGoalTypes, useGoals } from '../hooks/useGoals.js'
import { useWallet } from '../hooks/useDummyPayment.js'
import { ApiError } from '../lib/api.js'
import { DEFAULT_GOAL_TYPES, formatGoalInr } from '../lib/goals.js'
import { PAYMENT_PURPOSES, formatInr } from '../lib/dummyPayment.js'
import { cn } from '../lib/utils.js'

function isInsufficientWalletError(err) {
  const code = String(err?.errorCode || err?.data?.code || err?.data?.error_code || '').toUpperCase()
  const msg = String(err?.message || err?.data?.message || '').toLowerCase()
  return (
    code === 'INSUFFICIENT_BALANCE'
    || code === 'INSUFFICIENT_FUNDS'
    || msg.includes('insufficient')
    || (err?.status === 402)
  )
}

export default function Goals() {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { openPayment } = usePaymentModal()
  const { showToast } = useToast()
  const { data: typesData } = useGoalTypes({ enabled: true })
  const { data, isLoading, error } = useGoals({ enabled: isAuthenticated })
  const { data: wallet, refetch: refetchWallet } = useWallet({ enabled: isAuthenticated })
  const { create, contribute, remove } = useGoalMutations()

  const [createOpen, setCreateOpen] = useState(false)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [formError, setFormError] = useState('')
  const [shortfallPrompt, setShortfallPrompt] = useState(null) // { amount, shortfall, balance }
  const [form, setForm] = useState({
    goal_type: 'DREAM_HOUSE',
    title: '',
    target_amount: '500000',
    target_date: '',
    notes: '',
  })
  const [contributeAmount, setContributeAmount] = useState('')

  const types = typesData?.length ? typesData : DEFAULT_GOAL_TYPES
  const goals = data?.items ?? []
  const walletBalance = Number(wallet?.balance ?? 0)
  const selected = useMemo(
    () => goals.find((g) => String(g.id) === String(selectedId)) || goals[0] || null,
    [goals, selectedId],
  )

  const openTopUpPayment = (neededAmount) => {
    const payAmount = Math.max(1, Math.ceil(Number(neededAmount) || 0))
    setShortfallPrompt(null)
    openPayment({
      purpose: PAYMENT_PURPOSES.WALLET_DEPOSIT,
      amount: payAmount,
      title: `Add money to wallet · ${formatInr(payAmount)}`,
      description: contributeGoal
        ? `${contributeGoal.title} — wallet top-up to invest in goal`
        : 'Wallet top-up for goal investment',
      meta: {
        reason: 'goal_contribute_shortfall',
        goal_id: contributeGoal?.id,
        required: payAmount,
      },
      onSuccess: async () => {
        await refetchWallet()
        showToast('Money added to wallet. Press Invest from Wallet to continue.')
      },
    })
  }

  const promptAddMoney = (amount, balance = walletBalance) => {
    const shortfall = Math.max(1, Math.ceil(amount - balance))
    setFormError('')
    setShortfallPrompt({ amount, shortfall, balance })
  }

  const openCreate = () => {
    if (!isAuthenticated) {
      openLogin()
      return
    }
    setFormError('')
    setForm({
      goal_type: types[0]?.code || 'DREAM_HOUSE',
      title: types[0]?.label || 'My Dream House',
      target_amount: '500000',
      target_date: '',
      notes: '',
    })
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    setFormError('')
    const amount = Number(form.target_amount)
    if (!form.goal_type) {
      setFormError('Select a goal type')
      return
    }
    if (!form.title.trim()) {
      setFormError('Enter a goal title')
      return
    }
    if (!Number.isFinite(amount) || amount < 1) {
      setFormError('Enter a valid target amount')
      return
    }
    if (!form.target_date) {
      setFormError('Select a target date')
      return
    }
    try {
      await create.mutateAsync({
        goal_type: form.goal_type,
        title: form.title.trim(),
        target_amount: amount,
        target_date: form.target_date,
        notes: form.notes.trim() || undefined,
      })
      showToast('Goal created successfully')
      setCreateOpen(false)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create goal')
    }
  }

  const handleContribute = async () => {
    if (!contributeGoal) return
    setFormError('')
    const amount = Number(contributeAmount)
    if (!Number.isFinite(amount) || amount < 1) {
      setFormError('Enter a valid amount')
      return
    }

    // Pre-check wallet — prompt Add Money instead of showing insufficient error
    const fresh = await refetchWallet()
    const balance = Number(fresh?.data?.balance ?? wallet?.balance ?? walletBalance ?? 0)
    if (balance < amount) {
      promptAddMoney(amount, balance)
      return
    }

    try {
      await contribute.mutateAsync({
        id: contributeGoal.id,
        amount,
        source: 'wallet',
      })
      showToast(`₹${amount.toLocaleString('en-IN')} added to ${contributeGoal.title}`)
      setContributeGoal(null)
      setContributeAmount('')
      await refetchWallet()
    } catch (err) {
      if (isInsufficientWalletError(err)) {
        const bal = Number(err?.data?.balance ?? err?.data?.available_balance ?? walletBalance ?? 0)
        promptAddMoney(amount, bal)
        return
      }
      setFormError(err instanceof ApiError ? err.message : 'Failed to add money')
    }
  }

  const handleDelete = async (goal) => {
    if (!goal?.id) return
    if (!window.confirm(`Delete goal “${goal.title}”?`)) return
    try {
      await remove.mutateAsync(goal.id)
      showToast('Goal deleted')
      if (String(selectedId) === String(goal.id)) setSelectedId(null)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete goal')
    }
  }

  return (
    <>
      <PageBanner {...getPageBanner('goals')} />
      <PageSideLayout>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-xl text-primary">Your Goals</h2>
              <p className="text-sm text-slate-500">
                Track progress and invest from your wallet into each goal.
              </p>
            </div>
            <Button onClick={openCreate}>+ Add New Goal</Button>
          </div>

          {!isAuthenticated && (
            <Card hover={false} className="mb-6">
              <p className="text-sm text-slate-600">
                Sign in to create goals and invest toward them.{' '}
                <button type="button" className="text-secondary font-semibold hover:underline" onClick={openLogin}>
                  Login
                </button>
              </p>
            </Card>
          )}

          {isAuthenticated && isLoading && (
            <p className="text-sm text-slate-500 py-10 text-center">Loading your goals…</p>
          )}
          {isAuthenticated && error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error.message || 'Failed to load goals'}
            </div>
          )}
          {isAuthenticated && !isLoading && goals.length === 0 && (
            <Card hover={false} className="mb-6 text-center py-10">
              <p className="text-sm text-slate-500 mb-4">No goals yet. Create your first goal to get started.</p>
              <Button onClick={openCreate}>Add Goal</Button>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            {goals.map((g) => (
              <Card
                key={g.id}
                className={cn(
                  'cursor-pointer transition-shadow',
                  String(selected?.id) === String(g.id) && 'ring-2 ring-secondary/30',
                )}
                onClick={() => setSelectedId(g.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 grid place-items-center overflow-hidden shrink-0">
                      {g.iconSrc ? (
                        <img src={g.iconSrc} alt={g.title} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-2xl">{g.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-primary text-lg truncate">{g.title}</h3>
                      <div className="text-xs text-slate-500">
                        {g.goalTypeLabel} · Target by {g.targetDateLabel}
                      </div>
                    </div>
                  </div>
                  <Badge tone={g.pct >= 80 ? 'green' : g.pct >= 50 ? 'amber' : 'blue'}>{g.pct}%</Badge>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span>
                    <span className="font-semibold text-primary">{g.savedDisplay}</span>{' '}
                    <span className="text-slate-500">saved</span>
                  </span>
                  <span className="text-slate-500">of {g.targetDisplay}</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={g.pct} color={g.pct >= 80 ? 'bg-accent' : 'bg-secondary'} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Suggested monthly</div>
                    <div className="font-semibold">
                      {g.sip != null ? formatGoalInr(g.sip) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Remaining</div>
                    <div className="font-semibold">{g.remainingDisplay}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setFormError('')
                      setContributeAmount('')
                      setContributeGoal(g)
                    }}
                  >
                    Add Money
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(g)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {selected && (
            <>
              <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-2">
                {selected.title} — Milestones
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Stage {selected.achievement.currentStage}
                {selected.achievement.nextMilestone?.label
                  ? ` · Next: ${selected.achievement.nextMilestone.label}`
                  : selected.pct >= 100
                    ? ' · Goal Achieved'
                    : ''}
                {selected.market?.fdRate != null && (
                  <span> · Today’s FD rate {selected.market.fdRate}%</span>
                )}
              </p>
              <Card hover={false}>
                <div className="relative pl-4">
                  <div className="absolute left-[14px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  {(selected.milestones.length
                    ? selected.milestones
                    : [
                      { stage: 1, percent: 0, label: 'Goal Started', done: selected.pct >= 0 },
                      { stage: 2, percent: 25, label: 'Foundation', done: selected.pct >= 25 },
                      { stage: 3, percent: 50, label: 'Halfway There', done: selected.pct >= 50 },
                      { stage: 4, percent: 75, label: 'Near Goal', done: selected.pct >= 75 },
                      { stage: 5, percent: 100, label: 'Goal Achieved', done: selected.pct >= 100 },
                    ]
                  ).map((m) => (
                    <div key={m.stage} className="relative pl-8 pb-6 last:pb-0">
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full grid place-items-center text-xs font-bold ${
                          m.done ? 'bg-accent text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {m.done ? '✓' : m.stage}
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {m.percent}% — {m.label}
                      </div>
                      <div className="text-sm text-slate-600">
                        {m.done ? 'Achieved' : 'Upcoming'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          <Modal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            title="Add a new goal"
            footer={(
              <>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={create.isPending}>
                  {create.isPending ? 'Creating…' : 'Create Goal'}
                </Button>
              </>
            )}
          >
            <div className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{formError}</div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500">Goal Type</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"
                  value={form.goal_type}
                  onChange={(e) => {
                    const code = e.target.value
                    const t = types.find((x) => x.code === code)
                    setForm((f) => ({
                      ...f,
                      goal_type: code,
                      title: f.title || t?.label || '',
                    }))
                  }}
                >
                  {types.map((t) => (
                    <option key={t.code} value={t.code}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Title</label>
                <input
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="My Dream House"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Target Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"
                  value={form.target_amount}
                  onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Target Date</label>
                <input
                  type="date"
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"
                  value={form.target_date}
                  onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Notes (optional)</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn text-sm"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
          </Modal>

          <Modal
            open={Boolean(contributeGoal)}
            onClose={() => { setContributeGoal(null); setFormError(''); setShortfallPrompt(null) }}
            title="Add money to goal"
            footer={(
              <>
                <Button variant="outline" onClick={() => { setContributeGoal(null); setShortfallPrompt(null) }}>Cancel</Button>
                <Button onClick={handleContribute} disabled={contribute.isPending}>
                  {contribute.isPending ? 'Investing…' : 'Invest from Wallet'}
                </Button>
              </>
            )}
          >
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Contribute to <strong>{contributeGoal?.title}</strong>. Amount is debited from your wallet.
              </p>
              <p className="text-xs text-slate-500">
                Wallet balance: <strong className="text-primary">{formatInr(walletBalance)}</strong>
              </p>
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{formError}</div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="25000"
                />
              </div>
            </div>
          </Modal>

          <Modal
            open={Boolean(shortfallPrompt)}
            onClose={() => setShortfallPrompt(null)}
            title="Insufficient wallet balance"
            priority
            footer={(
              <>
                <Button variant="outline" onClick={() => setShortfallPrompt(null)}>No</Button>
                <Button onClick={() => openTopUpPayment(shortfallPrompt?.shortfall)}>
                  Yes, Add Money
                </Button>
              </>
            )}
          >
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                Your wallet has <strong>{formatInr(shortfallPrompt?.balance ?? 0)}</strong>, but you need{' '}
                <strong>{formatInr(shortfallPrompt?.amount ?? 0)}</strong> for this goal.
              </p>
              <p>
                Insufficient wallet balance. Would you like to add{' '}
                <strong>{formatInr(shortfallPrompt?.shortfall ?? 0)}</strong> via payment gateway?
              </p>
            </div>
          </Modal>

          <p className="text-xs text-slate-400 mt-8">
            Looking for FD/RD products?{' '}
            <Link to="/fd-rd" className="text-secondary font-semibold hover:underline">Browse marketplace</Link>
          </p>
        </div>
      </PageSideLayout>
    </>
  )
}
