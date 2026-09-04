/**
 * User portfolio helpers — GET /api/profile/portfolio (Bearer JWT).
 * Maps summary, portfolio_mix, monthly_bar_chart, financial_health,
 * investments, recent_transactions, credit_score, fd, rd.
 */

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export function formatInr(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

function statusLabel(status) {
  return String(status ?? 'active').replace(/^\w/, (c) => c.toUpperCase())
}

function mapInvestmentRow(item) {
  const invested = Number(
    item.amount
      ?? item.principal_amount
      ?? item.invested
      ?? 0,
  )
  const current = Number(
    item.maturity_amount
      ?? item.current_value
      ?? invested,
  )
  const type = String(item.type || 'FD').toUpperCase()

  return {
    id: item.id,
    name: item.title ?? item.bank_name ?? (type === 'RD' ? 'Recurring Deposit' : 'Fixed Deposit'),
    type,
    logo: item.logo ?? item.logo_url ?? item.bank_logo ?? null,
    invested,
    investedDisplay: item.amount_display ?? formatInr(invested),
    current,
    currentDisplay: formatInr(current),
    rate: item.interest_rate ?? item.rate ?? null,
    tenureMonths: item.tenure_months ?? null,
    status: statusLabel(item.status),
    startDate: item.start_date ?? null,
    maturityDate: item.maturity_date ?? null,
  }
}

function mapTransaction(tx) {
  const isCredit = tx.direction === 'credit' || Number(tx.signed_amount) > 0
  const amount = Math.abs(Number(tx.signed_amount ?? tx.amount ?? 0))
  const date = tx.date ?? tx.created_at
  let dateLabel = '—'
  if (date) {
    const d = new Date(date)
    if (!Number.isNaN(d.getTime())) {
      dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }
  }

  return {
    id: tx.id,
    title: tx.title ?? tx.description ?? tx.category ?? 'Transaction',
    category: tx.category ?? '—',
    amount,
    amountDisplay: tx.amount_display ?? `${isCredit ? '+' : '-'}₹${amount.toLocaleString('en-IN')}`,
    credit: isCredit,
    date,
    dateLabel,
    icon: isCredit ? '↓' : '↑',
  }
}

function parseCreditScoreBlock(block) {
  if (!block) return null
  const primary = block.primary ?? block.cibil ?? block.primary_score ?? block.cibil_score ?? null
  const score = primary?.score ?? block.score ?? null
  if (score == null && !block.has_score) {
    return {
      hasScore: false,
      score: null,
      scoreBand: null,
      provider: 'CIBIL',
      message: block.empty_message ?? null,
      ctaLabel: block.cta?.label ?? 'Check my CIBIL',
    }
  }

  const num = score != null ? Number(score) : null
  return {
    hasScore: num != null && !Number.isNaN(num),
    score: num,
    scoreBand: primary?.scoreBand ?? primary?.score_band ?? primary?.band ?? null,
    provider: String(primary?.provider ?? primary?.bureau ?? 'CIBIL').toUpperCase(),
    checkedAt: primary?.checked_at ?? primary?.checkedAt ?? primary?.created_at ?? null,
    checkedAtLabel: (() => {
      const v = primary?.checked_at ?? primary?.checkedAt ?? primary?.created_at
      if (!v) return '—'
      const d = new Date(v)
      return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    })(),
    referenceId: primary?.referenceId ?? primary?.reference_id ?? primary?.report_ref_id ?? null,
    message: block.empty_message ?? null,
    ctaLabel: block.cta?.label ?? 'Check my CIBIL',
  }
}

function parsePortfolioMix(mix) {
  const source = mix ?? {}
  const segments = Array.isArray(source.segments) ? source.segments : []
  const labels = source.labels ?? segments.map((s) => s.label)
  const data = source.data ?? segments.map((s) => Number(s.value ?? 0))
  const colors = source.colors ?? segments.map((s) => s.color)

  const allocation = (segments.length
    ? segments
    : labels.map((label, i) => ({
        label,
        value: data[i],
        color: colors[i],
      }))
  ).map((s, i) => ({
    name: s.label ?? s.name ?? labels[i] ?? 'Segment',
    value: Number(s.value ?? data[i] ?? 0),
    color: s.color ?? colors[i] ?? '#64748B',
    percent: s.percent ?? null,
    valueDisplay: s.value_display ?? formatInr(s.value ?? data[i] ?? 0),
  })).filter((s) => s.value > 0)

  return {
    chartType: source.chart_type ?? 'pie',
    hasData: Boolean(source.has_data ?? allocation.length),
    emptyMessage: source.empty_message ?? 'No FD/RD allocation yet. Book a deposit to see your mix here.',
    total: Number(source.total ?? 0),
    allocation,
    labels,
    data,
    colors,
    segments,
  }
}

function parseMonthlyBarChart(chart) {
  const source = chart ?? {}
  const labels = source.labels ?? []
  const series = source.series ?? source.datasets ?? []

  const rows = labels.map((label, index) => {
    const row = { m: label, month: label }
    for (const s of series) {
      const key = s.key ?? s.label
      row[key] = Number(s.data?.[index] ?? 0)
    }
    return row
  })

  return {
    chartType: source.chart_type ?? 'stacked_bar',
    hasData: Boolean(source.has_data ?? rows.some((r) => Object.keys(r).some((k) => k !== 'm' && k !== 'month' && r[k] > 0))),
    emptyMessage: source.empty_message ?? 'No wallet activity yet.',
    labels,
    series: series.map((s) => ({
      key: s.key ?? s.label,
      label: s.label ?? s.key,
      color: s.color ?? '#64748B',
      data: s.data ?? [],
    })),
    rows,
  }
}

function parseFinancialHealth(health) {
  const source = health ?? {}
  const metrics = (source.metrics ?? []).map((m) => ({
    key: m.key,
    label: m.label ?? m.key,
    score: Number(m.score ?? 0),
  }))

  // Fallback labels if API omits metrics
  if (!metrics.length) {
    ;[
      ['Savings Rate', source.savings_rate],
      ['Investment Mix', source.investment_mix],
      ['Debt Load', source.debt_load],
      ['Emergency Fund', source.emergency_fund],
    ].forEach(([label, score]) => {
      if (score != null) metrics.push({ key: label, label, score: Number(score) })
    })
  }

  return {
    score: Number(source.score ?? 0),
    max: Number(source.max ?? 100),
    label: source.label ?? '—',
    metrics,
  }
}

export function parseProfilePortfolio(payload) {
  const root = unwrap(payload)
  const summaryRaw = root.summary ?? {}
  const fds = Array.isArray(root.fd) ? root.fd : (root.fixed_deposits ?? [])
  const rds = Array.isArray(root.rd) ? root.rd : (root.recurring_deposits ?? [])

  const currentBalance = Number(
    summaryRaw.current_balance
      ?? summaryRaw.total_portfolio_value
      ?? 0,
  )
  const invested = Number(summaryRaw.invested ?? 0)
  const activeFds = Number(summaryRaw.active_fds ?? fds.length)
  const activeRds = Number(summaryRaw.active_rds ?? rds.length)

  const investmentRows = Array.isArray(root.investments) && root.investments.length
    ? root.investments.map(mapInvestmentRow)
    : [
        ...fds.map((f) => mapInvestmentRow({ ...f, type: 'FD', title: `${f.bank_name || 'Bank'} FD`, amount: f.principal_amount })),
        ...rds.map((r) => mapInvestmentRow({ ...r, type: 'RD', title: `${r.bank_name || 'Bank'} RD`, amount: r.monthly_amount })),
      ]

  const portfolioMix = parsePortfolioMix(root.portfolio_mix)
  const monthlyBarChart = parseMonthlyBarChart(root.monthly_bar_chart)
  const financialHealth = parseFinancialHealth(root.financial_health)
  const creditScore = parseCreditScoreBlock(root.credit_score)
  const recentTransactions = (root.recent_transactions ?? []).map(mapTransaction)

  return {
    summary: {
      currentBalance,
      currentBalanceDisplay: summaryRaw.current_balance_display ?? formatInr(currentBalance),
      invested,
      investedDisplay: summaryRaw.invested_display ?? formatInr(invested),
      activeFds,
      activeRds,
      walletBalance: Number(summaryRaw.wallet_balance ?? 0),
      fdInvested: Number(summaryRaw.total_fd_invested ?? 0),
      rdCommitted: Number(summaryRaw.total_rd_committed ?? 0),
      fdMaturity: Number(summaryRaw.total_fd_maturity_value ?? 0),
      rdMaturity: Number(summaryRaw.total_rd_maturity_value ?? 0),
    },
    creditScore,
    portfolioMix,
    monthlyBarChart,
    financialHealth,
    investments: investmentRows,
    recentTransactions,
    fd: fds,
    rd: rds,
    empty: investmentRows.length === 0 && !portfolioMix.hasData,
    links: root.links ?? {},
  }
}
