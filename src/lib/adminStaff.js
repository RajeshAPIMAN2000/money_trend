/**
 * Sub-admin (staff) helpers — Admin creates via email, password, phone, roles.
 */

import { roleLabel } from '../admin/data/admin-roles.js'

const ROLE_NORMALIZE = {
  blog: 'content_creator',
  blogs: 'content_creator',
  news: 'content_creator',
  content: 'content_creator',
  'content-creator': 'content_creator',
  customer_support: 'support',
  'customer-support': 'support',
  ticket_raised: 'support',
  'ticket-raised': 'support',
}

function normalizeRoleId(value) {
  const s = String(value || '').trim().toLowerCase()
  return ROLE_NORMALIZE[s] || s
}

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

const API_ROLE_IDS = new Set(['seo', 'blog', 'news', 'support'])

/** UI role ids → API roles (content creator covers blog + news). */
export function toApiRoles(roles) {
  const out = []
  for (const role of Array.isArray(roles) ? roles : []) {
    const id = String(role || '').trim().toLowerCase()
    if (!id) continue
    if (id === 'content_creator' || id === 'content' || id === 'blogs' || id === 'content-creator') {
      out.push('blog', 'news')
    } else if (id === 'blog') out.push('blog')
    else if (id === 'news') out.push('news')
    else if (id === 'seo') out.push('seo')
    else if (id === 'support' || id === 'customer_support' || id === 'customer-support' || id === 'ticket_raised') {
      out.push('support')
    }
  }
  return [...new Set(out)].filter((role) => API_ROLE_IDS.has(role))
}

function isStaffActive(raw) {
  if (typeof raw?.staff_active === 'boolean') return raw.staff_active
  if (raw?.staff_active === 1 || raw?.staff_active === '1' || raw?.staff_active === 'true') return true
  if (raw?.staff_active === 0 || raw?.staff_active === '0' || raw?.staff_active === 'false') return false
  const status = String(raw?.status ?? 'active').toLowerCase()
  return status !== 'inactive' && status !== 'suspended'
}

function staffActiveFromStatus(status) {
  const value = String(status || 'active').toLowerCase()
  return value !== 'suspended' && value !== 'inactive'
}

function asEmployeeRecord(payload) {
  const root = unwrap(payload)
  if (!root || typeof root !== 'object' || Array.isArray(root)) return null
  const nested = root.sub_admin ?? root.subAdmin ?? root.employee ?? root.staff
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) return nested
  return root
}

function asList(payload) {
  const root = unwrap(payload)
  if (Array.isArray(root)) return root
  if (Array.isArray(root.sub_admins)) return root.sub_admins
  if (Array.isArray(root.subAdmins)) return root.subAdmins
  if (Array.isArray(root.staff)) return root.staff
  if (Array.isArray(root.admins)) return root.admins
  if (Array.isArray(root.items)) return root.items
  if (Array.isArray(root.users)) return root.users
  return []
}

export function parseSubAdmin(raw) {
  const record = asEmployeeRecord(raw)
  if (!record || typeof record !== 'object') return null
  raw = record
  const rolesRaw = raw.roles ?? raw.role_list ?? raw.permissions ?? []
  const roles = [...new Set(
    (Array.isArray(rolesRaw)
      ? rolesRaw.map((r) => normalizeRoleId(typeof r === 'object' ? (r.id || r.slug || r.name) : r))
      : String(rolesRaw || '')
          .split(/[,|]/)
          .map((s) => normalizeRoleId(s.trim()))
    ).filter(Boolean),
  )]

  const active = isStaffActive(raw)
  return {
    id: raw.id ?? raw._id ?? null,
    name: raw.full_name ?? raw.fullName ?? raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? raw.mobile ?? '',
    roles,
    rolesDisplay: roles.length ? roles.map(roleLabel).join(', ') : '—',
    staffActive: active,
    status: active ? 'Active' : 'Inactive',
    statusRaw: active ? 'active' : 'inactive',
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    createdLabel: formatDate(raw.created_at ?? raw.createdAt),
    raw,
  }
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function parseSubAdminsList(payload) {
  const items = asList(payload).map(parseSubAdmin).filter(Boolean)
  return {
    items,
    stats: [
      { label: 'Total Employees', value: String(items.length) },
      { label: 'Active', value: String(items.filter((i) => i.status === 'Active').length) },
      { label: 'Content Creator', value: String(items.filter((i) => i.roles.includes('content_creator')).length) },
      { label: 'Ticket Raised', value: String(items.filter((i) => i.roles.includes('support')).length) },
      { label: 'SEO Role', value: String(items.filter((i) => i.roles.includes('seo')).length) },
    ],
  }
}

export function buildCreateSubAdminBody({ email, password, phone, roles, name, full_name, status, staff_active } = {}) {
  const displayName = String(full_name || name || '').trim()
  const body = {
    email: String(email || '').trim().toLowerCase(),
    password: String(password || ''),
    phone: String(phone || '').trim(),
    roles: toApiRoles(roles),
    staff_active: staff_active != null ? Boolean(staff_active) : staffActiveFromStatus(status),
  }
  if (displayName) body.full_name = displayName
  return body
}

/** PUT /api/admin/sub-admins/:id — fields the admin is changing. */
export function buildUpdateSubAdminBody({ email, password, phone, roles, name, full_name, status, staff_active } = {}) {
  const body = {}
  const displayName = full_name != null ? full_name : name
  if (displayName != null) body.full_name = String(displayName).trim()
  if (email != null) body.email = String(email).trim().toLowerCase()
  if (phone != null) body.phone = String(phone).trim()
  if (roles != null) body.roles = toApiRoles(roles)
  if (password) body.password = String(password)
  if (staff_active != null) body.staff_active = Boolean(staff_active)
  else if (status != null) body.staff_active = staffActiveFromStatus(status)
  return body
}

export function mapSubAdminToTableRow(item) {
  return {
    id: item.id,
    name: item.name || item.email || 'Employee',
    email: item.email,
    phone: item.phone || '—',
    roles: item.rolesDisplay,
    status: item.status,
    joined: item.createdLabel,
  }
}
