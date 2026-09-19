/**
 * Demo wallet helpers — /api/demo/*
 */

const DEFAULT_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000]
const MIN_ADD = 1
const MAX_ADD = 1_000_000

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export function formatInr(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '—'
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function parseDemoConfig(payload) {
  const root = unwrap(payload)
  const presets = Array.isArray(root.add_money_presets)
    ? root.add_money_presets.map(Number).filter((n) => n > 0)
    : DEFAULT_PRESETS
  return {
    demoMode: Boolean(root.demo_mode ?? root.enabled ?? true),
    enabled: Boolean(root.enabled ?? root.demo_mode ?? true),
    demoNotice: root.demo_notice ?? root.notice ?? 'DEMO MODE — Virtual funds only.',
    presets: presets.length ? presets : DEFAULT_PRESETS,
    dummyCardGateway: root.dummy_card_gateway ?? null,
    flow: Array.isArray(root.flow) ? root.flow : [],
    raw: root,
  }
}

export function parseDemoWallet(payload) {
  const root = unwrap(payload)
  // Also accept nested demo_wallet from GET /wallet
  const data = root.demo_wallet && typeof root.demo_wallet === 'object'
    ? { ...root, ...root.demo_wallet }
    : root

  const available = Number(
    data.available_balance
    ?? data.balance
    ?? data.wallet_balance
    ?? 0,
  )

  return {
    demoMode: Boolean(data.demo_mode ?? true),
    demoNotice: data.demo_notice ?? data.notice ?? null,
    label: data.label ?? 'DEMO WALLET — Virtual funds only. No real money.',
    currency: data.currency ?? 'INR',
    availableBalance: available,
    availableBalanceDisplay:
      data.available_balance_display ?? formatInr(available),
    totalDemoMoneyAdded: Number(data.total_demo_money_added ?? 0),
    totalInvested: Number(data.total_invested ?? 0),
    totalReturns: Number(data.total_returns ?? 0),
    totalWithdrawn: Number(data.total_withdrawn ?? 0),
    totalPortfolioValue: Number(
      data.total_portfolio_value ?? available,
    ),
    totalPortfolioValueDisplay:
      data.total_portfolio_value_display
      ?? formatInr(data.total_portfolio_value ?? available),
    activeFdMaturityValue: Number(data.active_fd_maturity_value ?? 0),
    activeRdMaturityValue: Number(data.active_rd_maturity_value ?? 0),
    adminFeePercent: Number(data.admin_fee_percent ?? 0),
    raw: data,
  }
}

const TXN_LABELS = {
  DEMO_CREDIT: 'Demo Credit',
  INVESTMENT_DEBIT: 'Investment',
  INVESTMENT_RETURN: 'Investment Return',
  WITHDRAWAL_REQUEST: 'Withdrawal Request',
  WITHDRAWAL_REJECTED: 'Withdrawal Rejected',
  WITHDRAWAL_COMPLETED: 'Withdrawal Completed',
  REFUND: 'Refund',
}

const CREDIT_TYPES = new Set([
  'DEMO_CREDIT',
  'INVESTMENT_RETURN',
  'WITHDRAWAL_REJECTED',
  'REFUND',
])

export function parseDemoTransactions(payload) {
  const root = unwrap(payload)
  const list = Array.isArray(root.transactions)
    ? root.transactions
    : (Array.isArray(root.items) ? root.items : [])

  const transactions = list.map((t, i) => {
    const type = String(t.type || t.category || '').toUpperCase()
    const amount = Number(t.amount ?? 0)
    const credit = CREDIT_TYPES.has(type) || amount > 0 && type.includes('CREDIT')
    const created = t.created_at ?? t.createdAt ?? null
    return {
      id: t.transaction_id ?? t.demo_txn_id ?? t.id ?? `txn-${i}`,
      demoTxnId: t.demo_txn_id ?? null,
      type,
      typeLabel: TXN_LABELS[type] || type.replace(/_/g, ' ') || 'Transaction',
      category: t.category ?? type,
      amount,
      amountDisplay: `${credit ? '+' : '−'}${formatInr(Math.abs(amount))}`,
      credit,
      balanceBefore: Number(t.balance_before ?? 0),
      balanceAfter: Number(t.balance_after ?? 0),
      description: t.description ?? '',
      status: t.status ?? 'completed',
      createdAt: created,
      dateLabel: created
        ? new Date(created).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        : '—',
      raw: t,
    }
  })

  return {
    demoMode: Boolean(root.demo_mode ?? true),
    demoNotice: root.demo_notice ?? null,
    count: Number(root.count ?? transactions.length),
    transactions,
  }
}

export function parseAddDemoMoney(payload) {
  const root = unwrap(payload)
  return {
    demoMode: Boolean(root.demo_mode ?? true),
    message: root.message ?? payload?.message ?? 'Demo payment successful',
    transactionId: root.transaction_id ?? null,
    demoTxnId: root.demo_txn_id ?? null,
    type: root.type ?? 'DEMO_CREDIT',
    amount: Number(root.amount ?? 0),
    balanceBefore: Number(root.balance_before ?? 0),
    balanceAfter: Number(root.balance_after ?? 0),
    presets: Array.isArray(root.presets) ? root.presets.map(Number) : DEFAULT_PRESETS,
  }
}

export function parseDemoInvestments(payload) {
  const root = unwrap(payload)
  const summary = root.summary ?? {}
  const list = Array.isArray(root.items)
    ? root.items
    : (Array.isArray(root.investments) ? root.investments : [])

  const items = list.map((item) => mapDemoInvestment(item))

  return {
    demoMode: Boolean(root.demo_mode ?? true),
    demoNotice: root.demo_notice ?? null,
    summary: {
      totalInvestments: Number(summary.total_investments ?? items.length),
      activeFd: Number(summary.active_fd ?? 0),
      activeRd: Number(summary.active_rd ?? 0),
      maturedInvestments: Number(summary.matured_investments ?? 0),
      totalInvested: Number(summary.total_invested ?? 0),
    },
    items,
  }
}

export function mapDemoInvestment(item) {
  if (!item || typeof item !== 'object') return null
  const type = String(item.type || 'FD').toUpperCase()
  const principal = Number(
    item.principal
    ?? item.principal_amount
    ?? item.monthly_amount
    ?? item.total_deposit_so_far
    ?? 0,
  )
  const maturity = Number(
    item.maturity_amount
    ?? item.estimated_maturity_amount
    ?? principal,
  )
  const profit = Math.max(0, maturity - principal)
  const status = String(item.status || 'ACTIVE').toUpperCase()

  return {
    id: item.id,
    referenceNumber: item.reference_number ?? item.referenceNumber ?? null,
    type,
    product: item.product ?? item.name ?? `${type} Investment`,
    productCode: item.product_code ?? item.productCode ?? null,
    principal,
    principalDisplay: formatInr(principal),
    interestRate: Number(item.interest_rate ?? 0),
    tenureMonths: Number(item.tenure_months ?? 0),
    startDate: item.start_date ?? null,
    maturityDate: item.maturity_date ?? null,
    maturityAmount: maturity,
    maturityDisplay: formatInr(maturity),
    profit,
    profitDisplay: formatInr(profit),
    status,
    demoLabel: item.demo_label ?? 'Demo product — not an actual bank deposit.',
    monthlyAmount: item.monthly_amount != null ? Number(item.monthly_amount) : null,
    installmentsPaid: item.installments_paid != null ? Number(item.installments_paid) : null,
    createdAt: item.created_at ?? null,
    canCancel: status === 'ACTIVE' || status === 'PENDING',
    raw: item,
  }
}

export function parseDemoInvestmentDetail(payload) {
  const root = unwrap(payload)
  const item = root.investment ?? root.item ?? root
  return mapDemoInvestment(item)
}

export function parseCancelInvestment(payload) {
  const root = unwrap(payload)
  const investment = root.investment ?? root
  const wallet = root.wallet ?? {}
  const principal = Number(
    root.principal
    ?? root.amount_returned
    ?? investment.principal_amount
    ?? investment.principal
    ?? 0,
  )
  const interest = Number(
    root.interest
    ?? root.profit
    ?? root.returns
    ?? 0,
  )
  const total = Number(
    root.total_credited
    ?? root.payout
    ?? wallet.total_credited
    ?? (principal + interest)
    ?? 0,
  )
  return {
    message: root.message ?? payload?.message ?? 'Investment cancelled. Amount credited to wallet.',
    principal,
    interest,
    profit: interest,
    total,
    totalDisplay: formatInr(total),
    balance: wallet.balance != null ? Number(wallet.balance) : null,
    raw: root,
  }
}

export function clampAddAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return MIN_ADD
  return Math.min(MAX_ADD, Math.max(MIN_ADD, Math.round(n)))
}

export { DEFAULT_PRESETS, MIN_ADD, MAX_ADD }
