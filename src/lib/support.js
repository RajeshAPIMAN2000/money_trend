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

/** Stages: pending → Pending · in_process → In Process · fixed/resolved → Resolved */
export const SUPPORT_STATUSES = ['pending', 'in_process', 'resolved']

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

export function normalizeSupportStatus(status) {
  const value = String(status || '').toLowerCase().trim()
  if (value === 'fixed' || value === 'resolved' || value === 'closed' || value === 'done') return 'resolved'
  if (value === 'in_process' || value === 'in-process' || value === 'in process' || value === 'processing') {
    return 'in_process'
  }
  if (value === 'pending' || value === 'open' || value === 'new') return 'pending'
  return value || 'pending'
}

export function supportStatusLabel(status) {
  const value = normalizeSupportStatus(status)
  if (value === 'in_process') return 'In Process'
  if (value === 'resolved') return 'Resolved'
  if (value === 'pending') return 'Pending'
  return status ? String(status) : '—'
}

export function supportStatusTone(status) {
  const value = normalizeSupportStatus(status)
  if (value === 'resolved') return 'success'
  if (value === 'in_process') return 'info'
  if (value === 'pending') return 'warning'
  return 'default'
}

export function supportStatusBadgeTone(status) {
  const value = normalizeSupportStatus(status)
  if (value === 'resolved') return 'green'
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

function parseReplyEntry(entry) {
  if (!entry) return null
  if (typeof entry === 'string') {
    const text = entry.trim()
    if (!text) return null
    return { text, createdAt: null, createdAtLabel: '—', by: 'Support' }
  }
  const text = String(
    entry.reply ?? entry.message ?? entry.description ?? entry.admin_note ?? entry.body ?? '',
  ).trim()
  if (!text) return null
  return {
    text,
    createdAt: entry.created_at ?? entry.replied_at ?? entry.updated_at ?? null,
    createdAtLabel: formatDate(entry.created_at ?? entry.replied_at ?? entry.updated_at),
    by: entry.replied_by_name ?? entry.admin_name ?? entry.by ?? 'Support',
  }
}

function parseAgentUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ?? raw.admin_id ?? raw.user_id ?? raw.assigned_to ?? null
  if (id == null) return null
  const openCount = Number(
    raw.open_tickets ?? raw.open_count ?? raw.active_tickets ?? raw.assigned_open ?? 0,
  )
  const statusRaw = String(raw.status ?? raw.availability ?? '').toLowerCase()
  const isBusy = statusRaw === 'busy'
    || statusRaw === 'occupied'
    || (statusRaw !== 'free' && openCount > 0)
  return {
    id,
    name: raw.full_name ?? raw.name ?? raw.email ?? `Agent #${id}`,
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    openTickets: openCount,
    status: isBusy ? 'busy' : 'free',
    statusLabel: isBusy ? 'Busy' : 'Free',
  }
}

export function parseSupportAgents(payload) {
  const root = unwrap(payload)
  const freeRaw = root.free ?? root.free_agents ?? root.available ?? []
  const busyRaw = root.busy ?? root.busy_agents ?? root.occupied ?? []
  const allRaw = root.agents ?? root.staff ?? root.items ?? []

  let free = (Array.isArray(freeRaw) ? freeRaw : []).map(parseAgentUser).filter(Boolean)
  let busy = (Array.isArray(busyRaw) ? busyRaw : []).map(parseAgentUser).filter(Boolean)

  if (!free.length && !busy.length && Array.isArray(allRaw)) {
    const all = allRaw.map(parseAgentUser).filter(Boolean)
    free = all.filter((a) => a.status === 'free')
    busy = all.filter((a) => a.status === 'busy')
  }

  // Prefer explicit lists; mark free/busy correctly
  free = free.map((a) => ({ ...a, status: 'free', statusLabel: 'Free' }))
  busy = busy.map((a) => ({ ...a, status: 'busy', statusLabel: 'Busy' }))

  const summary = root.summary ?? root.agents_summary ?? {}
  return {
    free,
    busy,
    agents: [...free, ...busy],
    freeCount: Number(summary.free ?? free.length),
    busyCount: Number(summary.busy ?? busy.length),
  }
}

function parseAssignedAgent(raw) {
  if (!raw) return null
  if (typeof raw === 'object') {
    return {
      id: raw.id ?? raw.admin_id ?? null,
      name: raw.full_name ?? raw.name ?? raw.email ?? 'Support',
      email: raw.email ?? '',
    }
  }
  return null
}

export function parseSupportTicket(raw) {
  if (!raw) return null
  const status = normalizeSupportStatus(raw.status ?? raw.stage ?? 'pending')
  const replyRaw =
    raw.reply ??
    raw.support_reply ??
    raw.admin_reply ??
    raw.message ??
    null
  const repliesList = Array.isArray(raw.replies)
    ? raw.replies.map(parseReplyEntry).filter(Boolean)
    : []
  const singleReply = parseReplyEntry(
    typeof replyRaw === 'string' ? replyRaw : replyRaw,
  )
  const replies = repliesList.length
    ? repliesList
    : singleReply
      ? [singleReply]
      : []

  const assigned = parseAssignedAgent(
    raw.assigned_agent ?? raw.assignee ?? raw.agent ?? raw.assigned_to_user,
  )
  const assignedToId = raw.assigned_to ?? assigned?.id ?? null
  const isUnassigned = assignedToId == null || assignedToId === '' || assignedToId === 0

  return {
    id: raw.id,
    ticketNumber: raw.ticket_number ?? `MT-${raw.id}`,
    userId: raw.user_id,
    subject: raw.subject ?? '',
    description: raw.description ?? '',
    attachment: resolveMediaUrl(raw.attachment),
    attachmentRaw: raw.attachment ?? null,
    status,
    stage: status,
    statusLabel: raw.status_label ?? raw.stage_label ?? supportStatusLabel(status),
    adminNote: raw.admin_note ?? null,
    reply: singleReply?.text ?? replies[replies.length - 1]?.text ?? null,
    replies,
    assignedTo: assignedToId,
    assignedAt: raw.assigned_at ?? null,
    assignedAtLabel: formatDate(raw.assigned_at),
    assignedAgent: assigned || (assignedToId != null
      ? { id: assignedToId, name: raw.assigned_to_name ?? `Agent #${assignedToId}`, email: '' }
      : null),
    isUnassigned,
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
  const agentsSummary = root.agents_summary ?? root.agent_summary ?? {}
  const agentsParsed = root.agents || root.free || root.busy
    ? parseSupportAgents(root)
    : null

  return {
    count: root.count ?? tickets.length,
    total: root.total ?? tickets.length,
    unassignedCount: Number(
      summary.unassigned
      ?? root.unassigned_count
      ?? tickets.filter((t) => t.isUnassigned).length,
    ),
    summary: {
      pending: Number(summary.pending ?? 0),
      inProcess: Number(summary.in_process ?? 0),
      fixed: Number(summary.fixed ?? summary.resolved ?? 0),
      resolved: Number(summary.resolved ?? summary.fixed ?? 0),
      unassigned: Number(summary.unassigned ?? root.unassigned_count ?? 0),
      freeAgents: Number(agentsSummary.free ?? agentsParsed?.freeCount ?? 0),
      busyAgents: Number(agentsSummary.busy ?? agentsParsed?.busyCount ?? 0),
    },
    agents: agentsParsed,
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

/** Status body for PATCH — API accepts fixed or resolved */
export function buildSupportStatusBody({ status, adminNote } = {}) {
  const normalized = normalizeSupportStatus(status)
  const apiStatus = normalized === 'resolved' ? 'resolved' : normalized
  const body = { status: apiStatus }
  if (adminNote != null) body.admin_note = String(adminNote)
  return body
}

/** Reply body for POST /admin/support/:id/reply */
export function buildSupportReplyBody({ reply, status, description, message, adminNote } = {}) {
  const text = String(reply || description || message || '').trim()
  const body = { reply: text }
  if (description) body.description = String(description).trim()
  if (message) body.message = String(message).trim()
  if (adminNote != null && String(adminNote).trim()) body.admin_note = String(adminNote).trim()
  if (status) body.status = normalizeSupportStatus(status) === 'resolved'
    ? 'resolved'
    : normalizeSupportStatus(status)
  return body
}

export function buildSupportAssignBody({ assignedTo } = {}) {
  return { assigned_to: Number(assignedTo) }
}
