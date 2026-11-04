const CHART_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
const KYC_COLORS = { Approved: '#10B981', Pending: '#F59E0B', Rejected: '#EF4444' }

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

function formatGrowth(percent) {
  if (percent == null || percent === '') return ''
  const num = Number(percent)
  if (Number.isNaN(num)) return String(percent)
  return `${num >= 0 ? '+' : ''}${num}%`
}

function mapSummaryCard(card) {
  if (!card) return { value: '0', change: '', up: true }
  const growth = card.growth_percent ?? card.growthPercent
  return {
    value: card.display ?? String(card.value ?? '0'),
    change: formatGrowth(growth),
    up: growth == null ? true : Number(growth) >= 0,
  }
}

function mapActivityCard(card) {
  if (!card) return { value: '0', change: '', up: true }
  return {
    value: card.display ?? String(card.value ?? '0'),
    change: '',
    up: true,
  }
}

function mapLabeledSeries(chart, valueKey = 'value') {
  if (!chart?.labels?.length) return []
  const seriesData = chart.series?.[0]?.data ?? chart.data ?? []
  return chart.labels.map((label, index) => ({
    day: label,
    month: label,
    [valueKey]: seriesData[index] ?? 0,
    value: seriesData[index] ?? 0,
  }))
}

function mapMarketOverviewChart(chart) {
  if (!chart?.labels?.length || !chart?.series?.length) return []

  const seriesByKey = {}
  chart.series.forEach((series) => {
    const name = String(series.name ?? '').toLowerCase()
    if (name.includes('nifty')) seriesByKey.nifty = series.data
    else if (name.includes('sensex')) seriesByKey.sensex = series.data
    else if (name.includes('gold')) seriesByKey.gold = series.data
  })

  return chart.labels.map((month, index) => ({
    month,
    nifty: seriesByKey.nifty?.[index] ?? 0,
    sensex: seriesByKey.sensex?.[index] ?? 0,
    gold: seriesByKey.gold?.[index] ?? 0,
  }))
}

function mapRevenueChart(chart) {
  if (!chart?.labels?.length) return []
  const values = chart.series?.[0]?.data ?? chart.monthly ?? []
  return chart.labels.map((month, index) => ({
    month,
    revenue: values[index] ?? 0,
  }))
}

function mapAssetAllocation(chart) {
  if (chart?.segments?.length) {
    return chart.segments.map((segment, index) => ({
      name: segment.label ?? segment.name,
      value: segment.percent ?? segment.value ?? 0,
      color: segment.color ?? CHART_COLORS[index % CHART_COLORS.length],
    }))
  }

  if (chart?.labels?.length) {
    return chart.labels.map((label, index) => ({
      name: label,
      value: chart.percentages?.[index] ?? 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
  }

  return []
}

function mapTopInvestments(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    name: item.name,
    return: item.return_percent ?? item.return ?? 0,
    progress: item.progress_percent ?? item.return_percent ?? item.return ?? 0,
  }))
}

function mapMarketIndices(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    name: item.name,
    value: item.value_display ?? String(item.value ?? ''),
    change: item.change_display ?? formatGrowth(item.change_percent),
    up: item.direction === 'up' || Number(item.change_percent) >= 0,
    spark: item.spark ?? item.sparkline ?? item.history ?? [],
  }))
}

function mapTransactions(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    user: item.user ?? item.user_name ?? item.name ?? 'User',
    action: item.action ?? item.description ?? item.type ?? '',
    amount: item.amount_display ?? String(item.amount ?? ''),
    time: item.time ?? item.created_at ?? item.timestamp ?? '',
    up: item.direction === 'up' || item.is_credit === true || item.type === 'credit',
  }))
}

function mapKycSummary(summary) {
  if (summary?.chart?.labels?.length) {
    return summary.chart.labels.map((name, index) => ({
      name,
      value: summary.chart.data?.[index] ?? 0,
      color: KYC_COLORS[name] ?? CHART_COLORS[index % CHART_COLORS.length],
    }))
  }

  if (!summary) return []

  return [
    { name: 'Approved', value: summary.approved?.count ?? 0, color: KYC_COLORS.Approved },
    { name: 'Pending', value: summary.pending?.count ?? 0, color: KYC_COLORS.Pending },
    { name: 'Rejected', value: summary.rejected?.count ?? 0, color: KYC_COLORS.Rejected },
  ].filter((item) => item.value > 0)
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  return String(status)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function mapSystemStatus(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    name: item.name,
    status: formatStatus(item.status),
  }))
}

export function parseAdminDashboard(payload) {
  const root = unwrap(payload)
  const summary = root.summary_cards ?? {}
  const activity = root.activity_cards ?? {}
  const charts = root.charts ?? {}

  const investmentChart = charts.investment_overview ?? charts.investmentOverview ?? {}
  const marketChart = charts.market_overview ?? charts.marketOverview ?? {}
  const revenueChart = charts.revenue_overview ?? charts.revenueOverview ?? {}
  const allocationChart = charts.asset_allocation ?? charts.assetAllocation ?? {}

  return {
    dateRangeLabel: root.date_range?.label ?? summary.date_range?.label ?? '',
    mainKpis: {
      totalUsers: mapSummaryCard(summary.total_users ?? summary.totalUsers),
      totalInvestments: mapSummaryCard(summary.total_investments ?? summary.totalInvestments),
      portfolioValue: mapSummaryCard(summary.portfolio_value ?? summary.portfolioValue),
      revenueGenerated: mapSummaryCard(summary.revenue_generated ?? summary.revenueGenerated),
    },
    secondaryKpis: {
      todaysDeposits: mapActivityCard(activity.todays_deposits ?? activity.todaysDeposits),
      todaysWithdrawals: mapActivityCard(activity.todays_withdrawals ?? activity.todaysWithdrawals),
      pendingKyc: mapActivityCard(activity.pending_kyc ?? activity.pendingKyc),
      activeSips: mapActivityCard(activity.active_sips ?? activity.activeSips),
    },
    investmentSummary: {
      title: investmentChart.title ?? 'Investment Overview',
      subtitle: investmentChart.subtitle ?? '',
      total: summary.total_investments?.display ?? '₹0',
      growth: formatGrowth(summary.total_investments?.growth_percent),
    },
    investmentTrend: mapLabeledSeries(investmentChart),
    marketTrend: mapMarketOverviewChart(marketChart),
    marketTrendMeta: {
      title: marketChart.title ?? 'Market Overview',
      subtitle: marketChart.subtitle ?? '',
    },
    revenueTrend: mapRevenueChart(revenueChart),
    revenueMeta: {
      title: revenueChart.title ?? 'Revenue Overview',
      subtitle: revenueChart.subtitle ?? '',
    },
    assetAllocation: mapAssetAllocation(allocationChart),
    assetAllocationMeta: {
      title: allocationChart.title ?? 'Asset Allocation Overview',
    },
    topInvestments: mapTopInvestments(root.top_performing_investments ?? root.topInvestments),
    marketIndices: mapMarketIndices(root.market_indices ?? root.marketIndices),
    recentTransactions: mapTransactions(root.recent_transactions ?? root.recentTransactions),
    kycSummary: mapKycSummary(root.kyc_verification_summary ?? root.kycSummary),
    kycMeta: {
      title: root.kyc_verification_summary?.title ?? 'KYC Verification Summary',
      total: root.kyc_verification_summary?.total ?? 0,
    },
    systemStatus: mapSystemStatus(root.system_status ?? root.systemStatus),
    quickActions: root.quick_actions ?? root.quickActions ?? [],
  }
}
