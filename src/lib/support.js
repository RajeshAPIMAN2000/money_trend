import { resolveMediaUrl } from './media.js'

export const SUPPORT_SUBJECTS = [
  'Technical Issue',
  'Account / Login',
  'KYC Verification',
  'FD / RD Investment',
  'Wallet / Payments',
  'Withdrawal',
  'Bank Account',
  'Credit Score / CIBIL',
  'Charges / Fees',
  'Other',
]

export const SUPPORT_STATUSES = ['pending', 'in_process', 'fixed']

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

export function supportStatusLabel(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'in_process') return 'In Process'
  if (value === 'fixed') return 'Fixed'
  if (value === 'pending') return 'Pending'
  return status ? String(status) : '—'
}

export function supportStatusTone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'fixed') return 'success'
  if (value === 'in_process') return 'info'
  if (value === 'pending') return 'warning'
  return 'default'
}

export function supportStatusBadgeTone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'fixed') return 'green'
  if (value === 'in_process') return 'blue'
  if (value === 'pending') return 'amber'
  return 'slate'
}

export function parseSupportHelp(payload) {
  const root = unwrap(payload)
  const stats = root.stats ?? {}
  const faqs = (root.faqs ?? []).map((f) => ({
    id: f.id,
    q: f.question ?? f.q ?? '',
    a: f.answer ?? f.a ?? '',
  }))

  return {
    title: root.title ?? 'How Can We Help You?',
    inbox: root.inbox ?? 'info@moneytrend.in',
    subjects: Array.isArray(root.subjects) && root.subjects.length
      ? root.subjects
      : SUPPORT_SUBJECTS,
    statuses: root.statuses ?? SUPPORT_STATUSES,
    faqs,
    metrics: [
      [stats.avg_response ?? '2 hrs', 'Avg response'],
      [stats.satisfaction ?? '98%', 'Satisfaction'],
      [stats.availability ?? '24×7', 'Support hours'],
      [stats.resolved ?? '50K+', 'Tickets resolved'],
    ],
    actions: root.actions ?? {},
  }
}

export function parseSupportTicket(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    ticketNumber: raw.ticket_number ?? `MT-${raw.id}`,
    userId: raw.user_id,
    subject: raw.subject ?? '',
    description: raw.description ?? '',
    attachment: resolveMediaUrl(raw.attachment),
    attachmentRaw: raw.attachment ?? null,
    status: raw.status ?? 'pending',
    statusLabel: raw.status_label ?? supportStatusLabel(raw.status),
    adminNote: raw.admin_note ?? null,
    resolvedAt: raw.resolved_at ?? null,
    resolvedAtLabel: formatDate(raw.resolved_at),
    createdAt: raw.created_at,
    createdAtLabel: formatDate(raw.created_at),
    updatedAt: raw.updated_at,
    updatedAtLabel: formatDate(raw.updated_at),
    user: raw.user
      ? {
          id: raw.user.id ?? raw.user_id,
          name: raw.user.full_name ?? raw.user.name ?? 'User',
          email: raw.user.email ?? '',
          phone: raw.user.phone ?? '',
        }
      : null,
  }
}

export function parseSupportTicketsList(payload) {
  const root = unwrap(payload)
  const tickets = (root.tickets ?? root.items ?? []).map(parseSupportTicket).filter(Boolean)
  const summary = root.summary ?? {}
  return {
    count: root.count ?? tickets.length,
    total: root.total ?? tickets.length,
    summary: {
      pending: Number(summary.pending ?? 0),
      inProcess: Number(summary.in_process ?? 0),
      fixed: Number(summary.fixed ?? 0),
    },
    tickets,
  }
}

export function parseSupportTicketDetail(payload) {
  const root = unwrap(payload)
  return parseSupportTicket(root.ticket ?? root)
}

export function buildSupportTicketFormData({ subject, description, attachment }) {
  const fd = new FormData()
  fd.append('subject', String(subject || '').trim())
  fd.append('description', String(description || '').trim())
  if (attachment) fd.append('attachment', attachment)
  return fd
}
