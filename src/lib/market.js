const FD_TENURE_KEYS = {
  All: '1_year',
  '3M': '46-179_days',
  '6M': '180-364_days',
  '1Y': '1_year',
  '2Y': '2_years',
  '3Y': '3_years',
  '5Y': '5_years',
}

const RD_TENURE_KEYS = {
  All: '1_year',
  '6M': '6_months',
  '1Y': '1_year',
  '2Y': '2_years',
  '3Y': '3_years',
  '5Y': '5_years',
}

const TENURE_LABELS = {
  '7-45_days': '7–45 Days',
  '46-179_days': '46–179 Days',
  '180-364_days': '180–364 Days',
  '6_months': '6 Months',
  '1_year': '1 Year',
  '2_years': '2 Years',
  '3_years': '3 Years',
  '5_years': '5 Years',
  '10_years': '10 Years',
}

const TYPE_FILTERS = {
  All: () => true,
  'Public Sector': (item) =>
    item.type === 'Public Sector' || item.type === 'Public Sector Bank',
  'Private Sector': (item) =>
    item.type === 'Private Sector' || item.type === 'Private Sector Bank',
}

function bankLogo(item) {
  if (item.logo && typeof item.logo === 'string' && !item.logo.startsWith('http')) {
    return item.logo.slice(0, 2).toUpperCase()
  }
  const code = item.shortName ?? item.bank_code ?? item.bankName ?? item.bank ?? '??'
  return String(code).slice(0, 2).toUpperCase()
}

function pickRate(rates, tenureKey, product) {
  const map = product === 'rd' ? RD_TENURE_KEYS : FD_TENURE_KEYS
  const key = map[tenureKey] || map.All
  return {
    key,
    value: rates?.[key] ?? rates?.['1_year'] ?? null,
    label: TENURE_LABELS[key] || key,
  }
}

function asList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.banks)) return payload.data.banks
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.banks)) return payload.banks
  return []
}

export function parseBanksList(payload) {
  return asList(payload).map((bank) => ({
    id: bank.id,
    bankName: bank.bankName ?? bank.bank_name ?? bank.bank ?? 'Unknown',
    shortName: bank.shortName ?? bank.short_name ?? bank.bankCode ?? bank.bank_code ?? '',
    logo: bank.logo ?? null,
    website: bank.website ?? null,
    type: bank.bankType ?? bank.type ?? '—',
    raw: bank,
  }))
}

function parseBankInfo(bank) {
  if (!bank || typeof bank !== 'object') {
    return {
      id: null,
      bankName: 'Bank',
      shortName: '',
      logo: null,
      website: null,
      type: '—',
      status: null,
    }
  }

  return {
    id: bank.id,
    bankName: bank.bankName ?? bank.bank_name ?? bank.bank ?? 'Bank',
    shortName: bank.shortName ?? bank.short_name ?? bank.bankCode ?? bank.bank_code ?? '',
    logo: bank.logo ?? null,
    website: bank.website ?? null,
    type: bank.bankType ?? bank.type ?? bank.bank_type ?? '—',
    status: bank.status ?? null,
  }
}

const TENURE_SORT_ORDER = [
  '7-45_days', '46-179_days', '180-364_days', '6_months',
  '1_year', '2_years', '3_years', '5_years', '10_years',
]

function tenureSortIndex(label) {
  const idx = TENURE_SORT_ORDER.indexOf(label)
  return idx === -1 ? 999 : idx
}

/** Groups API rate rows (regular + senior-citizen) by tenure label. */
export function groupRateRecords(records) {
  const byTenure = new Map()

  for (const row of records ?? []) {
    const key = row.tenureLabel ?? row.tenure_label ?? row.tenureDisplay ?? String(row.tenure)
    const entry = byTenure.get(key) ?? {
      tenure: row.tenureDisplay
        ?? TENURE_LABELS[row.tenureLabel ?? row.tenure_label]
        ?? String(row.tenure ?? key),
      tenureLabel: key,
      generalRate: null,
      seniorCitizenRate: null,
    }

    const rate = Number(row.interestRate ?? row.interest_rate ?? row.generalRate ?? row.general_rate ?? row.rate ?? 0)
    const category = row.customerCategory ?? row.customer_category ?? 'regular'

    if (category === 'senior-citizen' || category === 'senior_citizen') {
      entry.seniorCitizenRate = rate
    } else {
      entry.generalRate = rate
    }

    byTenure.set(key, entry)
  }

  return [...byTenure.values()].sort((a, b) => tenureSortIndex(a.tenureLabel) - tenureSortIndex(b.tenureLabel))
}

export function parseBankDetail(bankRes, ratesRes) {
  const bankRaw = bankRes?.data ?? bankRes
  const ratesRoot = ratesRes?.data ?? ratesRes

  const bank = parseBankInfo({
    ...(typeof bankRaw === 'object' && !Array.isArray(bankRaw) ? bankRaw : {}),
    ...(ratesRoot?.bank ?? {}),
  })

  const fdRates = groupRateRecords(ratesRoot?.fd ?? ratesRoot?.rates?.fd)
  const rdRates = groupRateRecords(ratesRoot?.rd ?? ratesRoot?.rates?.rd)

  const oneYearFd = fdRates.find((r) => r.tenureLabel === '1_year')
    ?? fdRates.find((r) => /1\s*year/i.test(r.tenure))
  const oneYearRd = rdRates.find((r) => r.tenureLabel === '1_year')
    ?? rdRates.find((r) => /1\s*year/i.test(r.tenure))

  return {
    bank,
    rates: { fd: fdRates, rd: rdRates },
    featuredFdRate: oneYearFd?.generalRate ?? 0,
    featuredRdRate: oneYearRd?.generalRate ?? 0,
    updatedAt: ratesRoot?.updatedAt ?? null,
  }
}

export function parseBankGraphHistory(payload) {
  const root = payload?.data ?? payload
  const graph = root?.graph ?? root?.history?.graph ?? {}
  const points = graph?.points ?? []
  const labels = graph?.labels ?? []
  const series = graph?.series ?? []

  const fdSeries = series.find((s) => s.key === 'fd_rate')
  const rdSeries = series.find((s) => s.key === 'rd_rate')

  const fromPoints = points.map((point) => ({
    label: point.label ?? point.month ?? point.date ?? '',
    month: point.month ?? null,
    fdRate: point.fd_rate != null ? Number(point.fd_rate) : undefined,
    rdRate: point.rd_rate != null ? Number(point.rd_rate) : undefined,
    fdMaturity: point.fd_maturity_value != null ? Number(point.fd_maturity_value) : undefined,
    rdMaturity: point.rd_maturity_value != null ? Number(point.rd_maturity_value) : undefined,
  }))

  const fromSeries = labels.map((label, index) => ({
    label,
    month: graph?.monthKeys?.[index] ?? null,
    fdRate: fdSeries?.data?.[index] != null ? Number(fdSeries.data[index]) : undefined,
    rdRate: rdSeries?.data?.[index] != null ? Number(rdSeries.data[index]) : undefined,
  }))

  const chartPoints = fromPoints.length ? fromPoints : fromSeries

  return {
    bank: parseBankInfo(root?.bank ?? root),
    period: root?.period ?? '1_year',
    tenure: root?.tenure ?? null,
    series,
    snapshot: graph?.snapshot ?? null,
    points: chartPoints,
    disclaimer: root?.disclaimer ?? '',
  }
}

function average(values) {
  if (!values.length) return null
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
}

/** Prepare bar-chart rows: monthly for 1Y, yearly buckets for 5Y. */
export function aggregateChartForBarGraph(points, period = '1_year') {
  if (!points?.length) return []

  const toRow = (point) => ({
    label: point.label ?? point.month ?? '',
    fdRate: point.fdRate ?? null,
    rdRate: point.rdRate ?? null,
  })

  if (period === '1_year') {
    return points.map(toRow).filter((row) => row.label)
  }

  const byYear = new Map()

  for (const point of points) {
    const year = point.month?.slice(0, 4)
      ?? String(point.label ?? '').match(/\b(20\d{2})\b/)?.[1]
      ?? null
    if (!year) continue

    const bucket = byYear.get(year) ?? { fdRates: [], rdRates: [] }
    if (point.fdRate != null) bucket.fdRates.push(point.fdRate)
    if (point.rdRate != null) bucket.rdRates.push(point.rdRate)
    byYear.set(year, bucket)
  }

  const yearlyRows = Array.from(byYear.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, bucket]) => ({
      label: year,
      fdRate: average(bucket.fdRates),
      rdRate: average(bucket.rdRates),
    }))

  // Not enough distinct years — show the timeline points directly (monthly labels)
  if (yearlyRows.length < 2) {
    return points.map(toRow).filter((row) => row.label)
  }

  const currentYear = new Date().getFullYear()
  const yearSlots = Array.from({ length: 5 }, (_, i) => String(currentYear - 4 + i))
  const slotRows = yearSlots.map((year) => {
    const match = yearlyRows.find((row) => row.label === year)
    return {
      label: year,
      fdRate: match?.fdRate ?? null,
      rdRate: match?.rdRate ?? null,
    }
  })

  const populatedSlots = slotRows.filter((row) => row.fdRate != null || row.rdRate != null)
  if (populatedSlots.length < 2) {
    return points.map(toRow).filter((row) => row.label)
  }

  return slotRows
}

export function parseMarketRatesResponse(payload) {
  const root = payload?.data ?? payload
  return {
    snapshot: root?.snapshot ?? null,
    fdRates: root?.fd_rates ?? [],
    rdRates: root?.rd_rates ?? [],
    bankApiStatus: root?.bank_api_status ?? null,
    regulatory: root?.regulatory ?? null,
    disclaimer: root?.disclaimer ?? payload?.message ?? '',
  }
}

export function attachBankIds(rateItems, banks) {
  return (rateItems ?? []).map((item) => {
    const bank = banks.find((b) => {
      const code = item.bank_code?.toLowerCase()
      const short = b.shortName?.toLowerCase()
      return (
        short === code
        || b.bankName === item.bank
        || String(b.id) === String(item.bank_code)
      )
    })
    return { ...item, bankId: bank?.id ?? null }
  })
}

export function mapBankRateCard(item, tenureFilter, product = 'fd') {
  const rates = item.rates ?? {}
  const { key, value, label } = pickRate(rates, tenureFilter, product)

  return {
    id: String(item.bankId ?? item.bank_code ?? item.id),
    bankId: item.bankId ?? null,
    bank: item.bank,
    type: item.type,
    rate: value ?? 0,
    tenure: label,
    tenureKey: key,
    seniorCitizenExtra: item.senior_citizen_extra,
    live: Boolean(item.live),
    source: item.source,
    logo: bankLogo(item),
    logoUrl: typeof item.logo === 'string' && item.logo.startsWith('http') ? item.logo : null,
    rates,
    product,
    raw: item,
  }
}

export function mapMarketRatesList(items, tenureFilter, product = 'fd') {
  return (items ?? []).map((item) => mapBankRateCard(item, tenureFilter, product))
}

export function filterByBankType(items, typeFilter) {
  const matcher = TYPE_FILTERS[typeFilter] || TYPE_FILTERS.All
  return items.filter(matcher)
}

export function normalizeHistory(payload) {
  const parsed = parseBankGraphHistory(payload)
  if (parsed.points.length) return parsed.points

  return asHistoryList(payload).map((point, index) => ({
    label: point.label ?? point.date ?? point.month ?? point.period ?? `P${index + 1}`,
    fdRate: point.fd_rate != null ? Number(point.fd_rate) : undefined,
    rdRate: point.rd_rate != null ? Number(point.rd_rate) : undefined,
    rate: Number(point.rate ?? point.fd_rate ?? point.rd_rate ?? point.generalRate ?? point.interest_rate ?? point.value ?? 0),
    seniorRate: point.seniorCitizenRate != null ? Number(point.seniorCitizenRate) : undefined,
  }))
}

function asHistoryList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.history?.points)) return payload.data.history.points
  if (Array.isArray(payload?.data?.points)) return payload.data.points
  if (Array.isArray(payload?.history?.points)) return payload.history.points
  if (Array.isArray(payload?.points)) return payload.points
  if (Array.isArray(payload?.data?.history)) return payload.data.history
  if (Array.isArray(payload?.data)) return payload.data
  return []
}


const BANK_CHART_COLORS = ['#4A90E2', '#F39C12', '#92C44E', '#2563EB', '#DC2626', '#7C3AED', '#0891B2', '#DB2777']

/** Parse GET /market/banks/history/trend for multi-bank line chart. */
export function parseMarketBanksTrend(payload, product = 'fd') {
  const root = payload?.data ?? payload
  const labels = root?.labels ?? []
  const banks = root?.banks ?? []
  const rateKey = product === 'rd' ? 'rd_rate' : 'fd_rate'

  const bankSeries = banks.map((entry, index) => {
    const bank = entry.bank ?? {}
    const code = bank.bankCode ?? bank.bank_code ?? `bank_${bank.id ?? index}`
    return {
      id: bank.id,
      code,
      name: bank.bankName ?? bank.bank_name ?? code,
      type: bank.bankType ?? bank.type,
      color: BANK_CHART_COLORS[index % BANK_CHART_COLORS.length],
    }
  })

  const chartRows = labels.map((label, index) => {
    const row = { label }
    for (const entry of banks) {
      const bank = entry.bank ?? {}
      const code = bank.bankCode ?? bank.bank_code ?? `bank_${bank.id}`
      const graph = entry.graph ?? {}
      const series = graph.series?.find((s) => s.key === rateKey)
      const point = graph.points?.[index]
      const value = series?.data?.[index] ?? point?.[rateKey]
      row[code] = value != null ? Number(value) : null
    }
    return row
  })

  return {
    periodLabel: root?.period_label ?? '12-Month Interest Rate Trend',
    period: root?.period ?? '1_year',
    labels,
    chartRows,
    bankSeries,
  }
}

export function formatRateTableRows(items) {
  return [...items]
    .map((item) => ({
      bank: item.bank,
      bankId: item.bankId,
      bankCode: item.bank_code,
      type: item.type,
      rate: item.rates?.['1_year'] ?? 0,
      rates: item.rates ?? {},
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5)
}

export { FD_TENURE_KEYS, RD_TENURE_KEYS, TENURE_LABELS }
