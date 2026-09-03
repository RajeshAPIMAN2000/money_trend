const unwrap = (payload) => payload?.data ?? payload ?? {}

function formatCurrency(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return value != null && value !== '' ? String(value) : '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatStatus(status) {
  if (!status) return '—'
  return String(status)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function mapDepositRow(item) {
  return {
    id: item.id,
    reference: item.reference ?? item.deposit_ref ?? item.transaction_ref ?? item.id,
    user: item.user_name ?? item.user?.full_name ?? item.full_name ?? '—',
    userId: item.user_id ?? item.user?.id,
    amount: item.amount_display ?? formatCurrency(item.amount),
    method: item.payment_method ?? item.method ?? item.channel ?? '—',
    status: formatStatus(item.status_label ?? item.status),
    date: formatDateTime(item.created_at ?? item.deposited_at ?? item.date),
    bank: item.bank_name ?? item.bank ?? '—',
    raw: item,
  }
}

function mapOrderRow(item) {
  return {
    id: item.id,
    reference: item.order_ref ?? item.reference ?? item.id,
    user: item.user_name ?? item.user?.full_name ?? item.full_name ?? '—',
    userId: item.user_id ?? item.user?.id,
    type: formatStatus(item.order_type ?? item.type ?? item.side),
    instrument: item.instrument ?? item.product_name ?? item.scheme_name ?? '—',
    amount: item.amount_display ?? formatCurrency(item.amount ?? item.invested_amount),
    status: formatStatus(item.status_label ?? item.status),
    date: formatDateTime(item.created_at ?? item.placed_at),
    raw: item,
  }
}

function mapWithdrawalRow(item) {
  return {
    id: item.id,
    reference: item.withdrawal_ref ?? item.reference ?? item.id,
    user: item.user_name ?? item.user?.full_name ?? item.full_name ?? '—',
    userId: item.user_id ?? item.user?.id,
    amount: item.amount_display ?? formatCurrency(item.amount),
    bank: item.bank_name ?? item.bank_account ?? item.bank ?? '—',
    status: formatStatus(item.status_label ?? item.status),
    requested: formatDateTime(item.requested_at ?? item.created_at),
    date: formatDateTime(item.created_at ?? item.requested_at),
    raw: item,
  }
}

function mapTransactionRow(item) {
  return {
    id: item.id,
    reference: item.transaction_ref ?? item.reference ?? item.id,
    user: item.user_name ?? item.user?.full_name ?? item.full_name ?? '—',
    userId: item.user_id ?? item.user?.id,
    type: formatStatus(item.transaction_type ?? item.type ?? item.category),
    amount: item.amount_display ?? formatCurrency(item.amount),
    status: formatStatus(item.status_label ?? item.status),
    date: formatDateTime(item.created_at ?? item.transaction_date ?? item.date),
    method: item.payment_method ?? item.method ?? '—',
    raw: item,
  }
}

function buildStats(summary = {}, defaults = []) {
  if (!summary || Object.keys(summary).length === 0) return defaults
  return Object.entries(summary).slice(0, 4).map(([key, value]) => ({
    label: key.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
    value: typeof value === 'number' && key.includes('amount') ? formatCurrency(value) : String(value),
  }))
}

export function parseDepositsList(payload) {
  const root = unwrap(payload)
  const items = root.deposits ?? root.items ?? []
  const summary = root.summary ?? {}
  return {
    count: root.count ?? items.length,
    items: items.map(mapDepositRow),
    stats: buildStats(summary, [
      { label: 'Total Deposits', value: String(root.count ?? items.length) },
      { label: 'Total Amount', value: formatCurrency(summary.total_amount ?? 0) },
      { label: 'Pending', value: String(summary.pending ?? 0) },
      { label: 'Failed', value: String(summary.failed ?? 0) },
    ]),
  }
}

export function parseDepositDetail(payload) {
  const root = unwrap(payload)
  const item = root.deposit ?? root
  return mapDepositRow(item)
}

export function parseOrdersList(payload) {
  const root = unwrap(payload)
  const items = root.orders ?? root.items ?? []
  const summary = root.summary ?? {}
  return {
    count: root.count ?? items.length,
    items: items.map(mapOrderRow),
    stats: buildStats(summary, [
      { label: 'Total Orders', value: String(root.count ?? items.length) },
      { label: 'Buy Orders', value: String(summary.buy_orders ?? 0) },
      { label: 'Sell Orders', value: String(summary.sell_orders ?? 0) },
      { label: 'Pending', value: String(summary.pending ?? 0) },
    ]),
  }
}

export function parseOrderDetail(payload) {
  const root = unwrap(payload)
  const item = root.order ?? root
  return mapOrderRow(item)
}

export function parseWithdrawalsList(payload) {
  const root = unwrap(payload)
  const items = root.withdrawals ?? root.items ?? []
  const summary = root.summary ?? {}
  return {
    count: root.count ?? items.length,
    items: items.map(mapWithdrawalRow),
    stats: buildStats(summary, [
      { label: 'Total Withdrawals', value: String(root.count ?? items.length) },
      { label: 'Pending', value: String(summary.pending ?? 0) },
      { label: 'Processed', value: String(summary.processed ?? 0) },
      { label: 'Rejected', value: String(summary.rejected ?? 0) },
    ]),
  }
}

export function parseWithdrawalDetail(payload) {
  const root = unwrap(payload)
  const item = root.withdrawal ?? root
  return mapWithdrawalRow(item)
}

export function parseTransactionsList(payload) {
  const root = unwrap(payload)
  const items = root.transactions ?? root.items ?? []
  const summary = root.summary ?? {}
  return {
    count: root.count ?? items.length,
    items: items.map(mapTransactionRow),
    stats: buildStats(summary, [
      { label: 'Total Transactions', value: String(root.count ?? items.length) },
      { label: 'Today', value: String(summary.today ?? 0) },
      { label: 'Volume', value: formatCurrency(summary.total_volume ?? summary.volume ?? 0) },
      { label: 'Success Rate', value: summary.success_rate != null ? `${summary.success_rate}%` : '—' },
    ]),
  }
}

export function parseTransactionDetail(payload) {
  const root = unwrap(payload)
  const item = root.transaction ?? root
  return mapTransactionRow(item)
}

export function depositDetailFields(item) {
  if (!item) return []
  return [
    ['Reference', item.reference],
    ['User', item.user],
    ['Amount', item.amount],
    ['Payment Method', item.method],
    ['Bank', item.bank],
    ['Status', item.status],
    ['Date', item.date],
  ]
}

export function orderDetailFields(item) {
  if (!item) return []
  return [
    ['Order ID', item.reference],
    ['User', item.user],
    ['Type', item.type],
    ['Instrument', item.instrument],
    ['Amount', item.amount],
    ['Status', item.status],
    ['Date', item.date],
  ]
}

export function withdrawalDetailFields(item) {
  if (!item) return []
  return [
    ['Reference', item.reference],
    ['User', item.user],
    ['Amount', item.amount],
    ['Bank', item.bank],
    ['Status', item.status],
    ['Requested', item.requested ?? item.date],
  ]
}

export function transactionDetailFields(item) {
  if (!item) return []
  return [
    ['Transaction ID', item.reference],
    ['User', item.user],
    ['Type', item.type],
    ['Amount', item.amount],
    ['Method', item.method],
    ['Status', item.status],
    ['Date', item.date],
  ]
}
