const CHART_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#CA8A04', '#DC2626']

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

function formatCurrency(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return String(value ?? '—')
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatPercent(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return String(value ?? '—')
  return `${num}%`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function parseFundPerformance(payload, productType = 'FD') {
  const root = unwrap(payload)
  const comparison = root.comparison_table ?? []
  const barData = comparison.map((row) => ({
    name: row.bank_code?.toUpperCase() || row.bank_name || 'Bank',
    label: row.bank_name || row.bank_code,
    return: Number(row.current_rate ?? row.average_rate ?? 0),
    value: Number(row.projected_value ?? 0),
  }))

  return {
    title: root.title ?? `${productType} Fund Performance`,
    subtitle: root.subtitle ?? root.period_label ?? '',
    productType: root.product_type ?? productType,
    barData,
    comparisonTable: comparison,
    meta: root,
  }
}

function mapAllocationSegments(segments = []) {
  return segments
    .filter((segment) => segment.key !== 'no_data')
    .map((segment, index) => ({
      name: segment.label ?? segment.bank_name ?? segment.name ?? 'Segment',
      value: segment.percent ?? segment.value ?? 0,
      color: segment.color ?? CHART_COLORS[index % CHART_COLORS.length],
      count: segment.count,
    }))
}

export function parseAssetAllocation(payload, productType = 'FD') {
  const root = unwrap(payload)
  const block = productType === 'RD' ? root.recurring_deposits : root.fixed_deposits
  const segments = block?.segments ?? []

  if (!block || block.empty || segments.every((s) => s.key === 'no_data')) {
    return {
      title: block?.title ?? `${productType === 'RD' ? 'Recurring Deposit' : 'Fixed Deposit'} Asset Allocation`,
      allocation: [],
      empty: true,
      note: block?.note ?? `No active ${productType} investments yet`,
    }
  }

  return {
    title: block.title ?? 'Asset Allocation',
    allocation: mapAllocationSegments(segments),
    empty: false,
    note: block.note ?? '',
  }
}

function buildPortfolioAllocation(summary, charts) {
  const chartBlock = charts?.allocation ?? charts?.asset_allocation
  if (chartBlock?.segments?.length) {
    const mapped = mapAllocationSegments(chartBlock.segments)
    if (mapped.length) return { title: chartBlock.title ?? 'Portfolio Allocation', allocation: mapped }
  }

  const items = [
    { name: 'Fixed Deposits', amount: Number(summary.fd_invested ?? 0), color: '#2563EB' },
    { name: 'Recurring Deposits', amount: Number(summary.rd_committed ?? 0), color: '#10B981' },
    { name: 'Wallet Balance', amount: Number(summary.wallet_balance ?? 0), color: '#F59E0B' },
  ].filter((item) => item.amount > 0)

  const total = items.reduce((sum, item) => sum + item.amount, 0)
  if (!total) return { title: 'Portfolio Allocation', allocation: [] }

  return {
    title: 'Portfolio Allocation',
    allocation: items.map((item) => ({
      name: item.name,
      value: Math.round((item.amount / total) * 100),
      color: item.color,
      amount: item.amount,
    })),
  }
}

function buildPortfolioTrend(summary, charts, fixedDeposits = [], recurringDeposits = []) {
  const trendChart = charts?.portfolio_trend ?? charts?.value_trend ?? charts?.growth
  if (trendChart?.labels?.length) {
    const values = trendChart.series?.[0]?.data ?? trendChart.data ?? []
    return {
      title: trendChart.title ?? 'Portfolio Value Trend',
      lineData: trendChart.labels.map((label, index) => ({
        month: label,
        value: values[index] ?? 0,
      })),
    }
  }

  const events = []
  fixedDeposits.forEach((item) => {
    const raw = item.raw ?? item
    const date = raw.start_date ?? raw.created_at
    const value = Number(raw.principal ?? raw.amount ?? 0)
    if (date && value) events.push({ date: new Date(date), value })
  })
  recurringDeposits.forEach((item) => {
    const raw = item.raw ?? item
    const date = raw.start_date ?? raw.created_at
    const value = Number(raw.monthly_amount ?? raw.amount ?? 0)
    if (date && value) events.push({ date: new Date(date), value })
  })

  if (events.length) {
    events.sort((a, b) => a.date - b.date)
    let cumulative = 0
    const grouped = new Map()
    events.forEach((event) => {
      const key = event.date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      cumulative += event.value
      grouped.set(key, cumulative)
    })
    return {
      title: 'Portfolio Value Trend',
      lineData: Array.from(grouped.entries()).map(([month, value]) => ({ month, value })),
    }
  }

  const portfolioValue = Number(summary.portfolio_value ?? 0)
  if (portfolioValue > 0) {
    return {
      title: 'Portfolio Value Trend',
      lineData: [{ month: 'Current', value: portfolioValue }],
    }
  }

  return { title: 'Portfolio Value Trend', lineData: [] }
}

function mapDepositRow(item, type = 'FD') {
  return {
    id: item.id,
    user: item.user_name ?? item.customer_name ?? item.full_name ?? item.user?.full_name ?? '—',
    userId: item.user_id ?? item.user?.id,
    provider: item.bank_name ?? item.provider ?? item.bank?.name ?? '—',
    bank: item.bank_name ?? item.bank?.name ?? '—',
    amount: item.principal_display ?? formatCurrency(item.principal ?? item.amount),
    monthly: item.monthly_amount_display ?? formatCurrency(item.monthly_amount ?? item.monthly),
    rate: item.rate_display ?? formatPercent(item.interest_rate ?? item.rate),
    tenure: item.tenure_label ?? item.tenure ?? '—',
    status: item.status_label ?? item.status ?? 'Active',
    maturity: item.maturity_amount_display ?? formatCurrency(item.maturity_amount),
    startDate: formatDate(item.start_date ?? item.created_at),
    maturityDate: formatDate(item.maturity_date),
    raw: item,
  }
}

export function parseFixedDepositsList(payload) {
  const root = unwrap(payload)
  const items = root.fixed_deposits ?? root.items ?? []
  const summary = root.summary ?? {}
  return {
    count: root.count ?? items.length,
    total: root.total ?? items.length,
    summary: {
      totalPrincipal: summary.total_principal ?? 0,
      totalMaturity: summary.total_maturity ?? 0,
    },
    items: items.map((item) => mapDepositRow(item, 'FD')),
    stats: [
      { label: 'Active FDs', value: String(root.count ?? items.length) },
      { label: 'Total Principal', value: formatCurrency(summary.total_principal ?? 0) },
      { label: 'Total Maturity', value: formatCurrency(summary.total_maturity ?? 0) },
      { label: 'Listed', value: String(items.length) },
    ],
  }
}

export function parseRecurringDepositsList(payload) {
  const root = unwrap(payload)
  const items = root.recurring_deposits ?? root.items ?? []
  const summary = root.summary ?? {}
  return {
    count: root.count ?? items.length,
    total: root.total ?? items.length,
    summary,
    items: items.map((item) => mapDepositRow(item, 'RD')),
    stats: [
      { label: 'Active RDs', value: String(root.count ?? items.length) },
      { label: 'Monthly Inflow', value: formatCurrency(summary.total_monthly ?? summary.monthly_inflow ?? 0) },
      { label: 'Total Committed', value: formatCurrency(summary.total_committed ?? 0) },
      { label: 'Listed', value: String(items.length) },
    ],
  }
}

export function parseDepositDetail(payload, type = 'FD') {
  const root = unwrap(payload)
  const item = root.fixed_deposit ?? root.recurring_deposit ?? root.deposit ?? root
  return mapDepositRow(item, type)
}

export function parseUserPortfolio(payload) {
  const root = unwrap(payload)
  const user = root.user ?? {}
  const summary = root.summary ?? {}
  const wallet = root.wallet ?? {}
  const charts = root.charts ?? {}
  const fixedDeposits = (root.fixed_deposits ?? []).map((item) => mapDepositRow(item, 'FD'))
  const recurringDeposits = (root.recurring_deposits ?? []).map((item) => mapDepositRow(item, 'RD'))
  const allocationChart = buildPortfolioAllocation(summary, charts)
  const trendChart = buildPortfolioTrend(summary, charts, root.fixed_deposits ?? [], root.recurring_deposits ?? [])

  return {
    user: {
      id: user.id,
      name: user.full_name ?? user.name ?? 'User',
      email: user.email ?? '',
      phone: user.phone ?? '',
      kycStatus: user.kyc_status ?? '',
      memberSince: formatDate(user.member_since ?? user.created_at),
    },
    summary: {
      portfolioValue: formatCurrency(summary.portfolio_value ?? 0),
      fdInvested: formatCurrency(summary.fd_invested ?? 0),
      rdCommitted: formatCurrency(summary.rd_committed ?? 0),
      activeFdCount: summary.active_fd_count ?? 0,
      activeRdCount: summary.active_rd_count ?? 0,
      walletBalance: formatCurrency(summary.wallet_balance ?? wallet.balance ?? 0),
      totalDeposits: formatCurrency(summary.total_deposits_amount ?? 0),
      totalWithdrawals: formatCurrency(summary.total_withdrawals_amount ?? 0),
    },
    charts: {
      allocation: allocationChart,
      trend: trendChart,
    },
    fixedDeposits,
    recurringDeposits,
    wallet,
  }
}

export function buildPortfolioListRows(users) {
  return users.map((user) => ({
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    kyc: user.kycStatusLabel,
    joined: user.joined,
    status: 'Active',
  }))
}
