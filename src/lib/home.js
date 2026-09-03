const BANK_COLORS = {
  hdfc: '#E11D48',
  icici: '#F97316',
  axis: '#7C3AED',
  sbi: '#2563EB',
  pnb: '#0D9488',
  kotak: '#BE123C',
  bob: '#F59E0B',
}

const HIDDEN_HOME_PRODUCTS = new Set(['mutual_funds', 'sip'])

const PRODUCT_META = {
  fixed_deposits: {
    key: 'fixed_deposits',
    to: '/fd-rd',
    filters: ['Recommended', 'Low Risk'],
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0056D2]',
    icon: 'fd',
  },
  recurring_deposits: {
    key: 'recurring_deposits',
    to: '/fd-rd',
    filters: ['Recommended', 'Low Risk'],
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    icon: 'rd',
  },
  // mutual_funds: {
  //   key: 'mutual_funds',
  //   to: '/mutual-funds',
  //   filters: ['Recommended', 'High Returns'],
  //   iconBg: 'bg-teal-50',
  //   iconColor: 'text-teal-600',
  //   icon: 'mf',
  // },
  // sip: {
  //   key: 'sip',
  //   to: '/mutual-funds',
  //   filters: ['Recommended', 'High Returns', 'Tax Saving'],
  //   iconBg: 'bg-violet-50',
  //   iconColor: 'text-violet-600',
  //   icon: 'sip',
  // },
}

const SERVICE_ROUTES = {
  fd: '/fd-rd',
  rd: '/fd-rd',
  wallet: '/dashboard',
  kyc: '/kyc',
  tax: '/dashboard',
  withdraw: '/dashboard',
}

const SERVICE_CTA = {
  fd: 'Explore',
  rd: 'Explore',
  wallet: 'Open Wallet',
  kyc: 'Verify Now',
  tax: 'View Reports',
  withdraw: 'Withdraw',
}

const SERVICE_STYLES = {
  fd: { color: 'text-[#0056D2]', bg: 'bg-blue-50' },
  rd: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  wallet: { color: 'text-violet-600', bg: 'bg-violet-50' },
  kyc: { color: 'text-orange-500', bg: 'bg-orange-50' },
  tax: { color: 'text-rose-600', bg: 'bg-rose-50' },
  withdraw: { color: 'text-teal-600', bg: 'bg-teal-50' },
}

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export function parseHomeProducts(payload) {
  const root = unwrap(payload)
  const featured = root.featured_products ?? root

  return Object.entries(PRODUCT_META)
    .filter(([id]) => !HIDDEN_HOME_PRODUCTS.has(id))
    .map(([id, meta]) => {
    const item = featured[id] ?? {}
    return {
      id,
      title: item.title ?? meta.key,
      desc: item.subtitle ?? '',
      rate: item.rate_display ?? (item.rate_up_to ? `Up to ${item.rate_up_to}% p.a.` : ''),
      cta: item.cta ?? 'Explore',
      to: item.route?.startsWith('/') && !item.route.startsWith('/api')
        ? (item.route === '/fd' || item.route === '/market/rd' ? '/fd-rd' : item.route)
        : meta.to,
      comingSoon: Boolean(item.coming_soon),
      filters: meta.filters,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      icon: meta.icon,
    }
  })
}

export function parseHomeServices(payload) {
  const root = unwrap(payload)
  const services = root.our_services ?? []

  return services.map((service) => {
    const style = SERVICE_STYLES[service.icon] ?? { color: 'text-[#0056D2]', bg: 'bg-blue-50' }
    return {
      key: service.key,
      title: service.title,
      desc: service.description,
      cta: SERVICE_CTA[service.icon] ?? 'Explore',
      to: SERVICE_ROUTES[service.icon] ?? '/products',
      icon: service.icon,
      ...style,
    }
  })
}

export function parsePlatformStats(payload) {
  const root = unwrap(payload)
  const stats = root.platform_stats ?? {}

  return [
    { label: 'Happy Investors', value: stats.happy_investors ?? '10L+', icon: 'users' },
    { label: 'Financial Products', value: stats.financial_products ?? '500+', icon: 'chart' },
    { label: 'Trusted Partners', value: stats.trusted_partners ?? '50+', icon: 'star' },
    { label: 'Customer Support', value: stats.customer_support ?? '24/7', icon: 'headset' },
  ]
}

export function parseRateTicker(payload) {
  const root = unwrap(payload)
  const ticker = root.rate_ticker ?? {}
  const fdRates = ticker.fd ?? []

  return fdRates.slice(0, 12).map((item) => ({
    name: `${item.bankName} FD`,
    val: `${item.interestRate}%`,
    chg: item.tenure ?? '',
    up: true,
    isRate: true,
  }))
}

export function parseCompareInvest(payload) {
  const root = unwrap(payload)
  const compare = root.compare_invest ?? root

  const tabs = [
    { key: 'FD', label: 'FD', data: compare.fd },
    { key: 'RD', label: 'RD', data: compare.rd },
  ].filter((tab) => tab.data)

  const defaultTenure = compare.default_tenure ?? '1_year'
  const tenureOptions = compare.tenure_options ?? compare.fd?.tenure_options ?? []

  return {
    tabs,
    defaultTenure,
    tenureOptions,
    fd: mapCompareTab(compare.fd, 'FD'),
    rd: mapCompareTab(compare.rd, 'RD'),
  }
}

export function parseCompareResponse(payload) {
  const data = unwrap(payload)
  const productType = data.product_type ?? 'FD'
  const tabKey = productType === 'RD' ? 'RD' : 'FD'

  return {
    tabKey,
    ...mapCompareTab(data, tabKey),
    user: data.user ?? null,
  }
}

function mapCompareTab(data, tabKey) {
  if (!data) return null

  const tenureOptions = (data.tenure_options ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
    months: opt.months,
  }))

  return {
    productType: tabKey,
    tenure: data.tenure_label ?? '1_year',
    tenureLabel: data.tenure ?? '1 Year',
    tenureOptions,
    investmentAmount: data.investment_amount ?? (tabKey === 'RD' ? 5000 : 100000),
    highestRate: data.highest_rate,
    viewAllRoute: data.view_all_route ?? '/fd-rd',
    investTo: tabKey === 'RD' ? '/fd-rd' : '/fd-rd',
    banks: (data.banks ?? []).map((bank) => ({
      id: bank.bank_id ?? bank.id,
      name: bank.bank_name,
      code: bank.bank_code,
      rate: bank.interest_rate,
      rateDisplay: bank.rate_display,
      logo: (bank.bank_name ?? 'BK').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      color: BANK_COLORS[bank.bank_code] ?? '#2563EB',
      maturityAmount: bank.maturity_amount,
      interestEarned: bank.interest_earned,
      investLabel: bank.invest_label ?? 'Invest',
      showInvest: bank.show_invest !== false,
    })),
  }
}

export function parseHomeDashboard(payload) {
  const root = unwrap(payload)
  const dashboard = root.dashboard

  if (!dashboard || root.login_required) {
    return {
      isLoggedIn: Boolean(root.is_logged_in),
      loginRequired: Boolean(root.login_required ?? !dashboard),
      message: root.message ?? 'Login to view your financial snapshot',
      snapshot: null,
      goals: [],
    }
  }

  const allocation = (dashboard.asset_allocation ?? dashboard.allocation ?? []).map((item, index) => ({
    name: item.name ?? item.label,
    value: item.value ?? item.percentage,
    color: item.color ?? ['#0056D2', '#10B981', '#F59E0B', '#94A3B8'][index % 4],
  }))

  const netWorthTrend = (dashboard.net_worth_trend ?? dashboard.trend ?? []).map((point) => ({
    v: point.value ?? point.v ?? point.amount,
  }))

  return {
    isLoggedIn: true,
    loginRequired: false,
    message: root.message,
    snapshot: {
      netWorth: dashboard.net_worth ?? dashboard.netWorth,
      netWorthDisplay: dashboard.net_worth_display ?? formatCurrency(dashboard.net_worth),
      changePct: dashboard.change_pct ?? dashboard.changePercent,
      healthScore: dashboard.health_score ?? dashboard.healthScore,
      healthLabel: dashboard.health_label ?? dashboard.healthLabel,
      healthMessage: dashboard.health_message ?? dashboard.healthMessage,
      allocation,
      netWorthTrend,
    },
    goals: (dashboard.goals ?? []).map((goal) => ({
      name: goal.name ?? goal.title,
      target: goal.target_display ?? goal.target,
      pct: goal.progress_pct ?? goal.progress ?? goal.pct ?? 0,
      icon: goal.icon ?? '🎯',
      color: goal.color ?? 'bg-blue-100 text-blue-700',
    })),
  }
}

function formatCurrency(value) {
  if (value == null) return '—'
  return `₹${Number(value).toLocaleString('en-IN')}`
}

export { BANK_COLORS, PRODUCT_META, HIDDEN_HOME_PRODUCTS }
