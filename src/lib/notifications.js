/** In-app notifications — user (/api/notifications) and admin panel (/api/admin/notifications). */

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

function formatDate(value) {
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

const EVENT_LABELS = {
  fd_booked: 'FD booked',
  rd_booked: 'RD booked',
  fd_broken: 'FD broken',
  rd_broken: 'RD broken',
  withdrawal_requested: 'Withdrawal requested',
  withdrawal_approved: 'Withdrawal approved',
  withdrawal_rejected: 'Withdrawal rejected',
  withdrawal_pending: 'Withdrawal pending',
  support_ticket_created: 'Support ticket',
  support_assigned: 'Support assigned',
  support_ticket_assigned: 'Ticket assigned',
  support_replied: 'Support reply',
  support_status_changed: 'Support status',
  article_published: 'Article published',
  article_pending_approval: 'Pending approval',
  article_submitted: 'Article submitted',
  article_approved: 'Article approved',
  article_rejected: 'Article rejected',
  investment_offer_email: 'Investment offer',
}

export function notificationEventLabel(eventType) {
  const key = String(eventType || '').toLowerCase()
  return EVENT_LABELS[key] || (eventType ? String(eventType).replace(/_/g, ' ') : 'Notification')
}

/** Deep-link hint for clicking a notification (optional navigation). */
export function notificationHref(item, { admin = false } = {}) {
  if (!item) return null
  const type = String(item.referenceType || item.eventType || '').toLowerCase()
  const id = item.referenceId

  if (admin) {
    if (type.includes('support') || item.eventType?.includes('support')) {
      return '/admin/support'
    }
    if (type.includes('article') || item.eventType?.includes('article')) {
      return '/admin/content-creator'
    }
    if (type.includes('withdraw')) return '/admin/withdrawals'
    if (type === 'fd' || type === 'rd') return '/admin/fixed-deposits'
    return '/admin/notifications'
  }

  if (type.includes('support')) return id ? `/support` : '/support'
  if (type === 'fd' || type === 'rd' || type.includes('invest')) return '/dashboard'
  if (type.includes('withdraw')) return '/dashboard'
  if (type.includes('article') || type.includes('blog') || type.includes('news')) {
    return item.eventType?.includes('news') ? '/news' : '/blog'
  }
  return null
}

export function parseNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id,
    audience: raw.audience ?? 'user',
    eventType: raw.event_type ?? raw.eventType ?? '',
    eventLabel: notificationEventLabel(raw.event_type ?? raw.eventType),
    title: raw.title ?? '',
    body: raw.body ?? raw.message ?? '',
    referenceType: raw.reference_type ?? raw.referenceType ?? null,
    referenceId: raw.reference_id ?? raw.referenceId ?? null,
    meta: raw.meta && typeof raw.meta === 'object' ? raw.meta : {},
    isRead: Boolean(raw.is_read ?? raw.isRead ?? raw.read_at ?? raw.readAt),
    readAt: raw.read_at ?? raw.readAt ?? null,
    readAtLabel: formatDate(raw.read_at ?? raw.readAt),
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    createdAtLabel: formatDate(raw.created_at ?? raw.createdAt),
    raw,
  }
}

export function parseNotificationsList(payload) {
  const root = unwrap(payload)
  const list = root.notifications ?? root.items ?? root.results ?? []
  const notifications = (Array.isArray(list) ? list : []).map(parseNotification).filter(Boolean)
  return {
    count: Number(root.count ?? notifications.length),
    total: Number(root.total ?? notifications.length),
    unreadCount: Number(root.unread_count ?? root.unreadCount ?? 0),
    notifications,
  }
}

export function parseUnreadCount(payload) {
  const root = unwrap(payload)
  return {
    unreadCount: Number(root.unread_count ?? root.unreadCount ?? root.count ?? 0),
  }
}

export function parseMarkReadResult(payload) {
  const root = unwrap(payload)
  return {
    id: root.id ?? null,
    isRead: Boolean(root.is_read ?? root.isRead ?? true),
    marked: Number(root.marked ?? 0),
    message: payload?.message ?? root.message ?? '',
  }
}
