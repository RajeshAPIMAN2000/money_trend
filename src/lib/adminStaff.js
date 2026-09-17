/**
 * Sub-admin (staff) helpers — Admin creates via email, password, phone, roles.
 */

import { roleLabel, SUB_ADMIN_ROLE_IDS } from '../admin/data/admin-roles.js'

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
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
  if (!raw || typeof raw !== 'object') return null
  const rolesRaw = raw.roles ?? raw.role_list ?? raw.permissions ?? []
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw.map((r) => String(typeof r === 'object' ? (r.id || r.slug || r.name) : r).toLowerCase()).filter(Boolean)
    : String(rolesRaw || '')
        .split(/[,|]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)

  const status = String(raw.status ?? 'active').toLowerCase()
  return {
    id: raw.id ?? raw._id ?? null,
    name: raw.name ?? raw.full_name ?? raw.fullName ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? raw.mobile ?? '',
    roles,
    rolesDisplay: roles.length ? roles.map(roleLabel).join(', ') : '—',
    status: status === 'inactive' || status === 'suspended' ? 'Suspended' : 'Active',
    statusRaw: status,
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
      { label: 'Total Sub Admins', value: String(items.length) },
      { label: 'Active', value: String(items.filter((i) => i.status === 'Active').length) },
      { label: 'SEO Role', value: String(items.filter((i) => i.roles.includes('seo')).length) },
      { label: 'Content Roles', value: String(items.filter((i) => i.roles.includes('blogs') || i.roles.includes('news')).length) },
    ],
  }
}

export function buildCreateSubAdminBody({ email, password, phone, roles, name, status } = {}) {
  const body = {
    email: String(email || '').trim().toLowerCase(),
    password: String(password || ''),
    phone: String(phone || '').trim(),
    roles: (Array.isArray(roles) ? roles : [])
      .map((r) => String(r).toLowerCase())
      .filter((r) => SUB_ADMIN_ROLE_IDS.includes(r)),
  }
  if (name) body.name = String(name).trim()
  if (status) body.status = String(status).toLowerCase() === 'suspended' ? 'inactive' : 'active'
  return body
}

export function buildUpdateSubAdminBody({ email, password, phone, roles, name, status } = {}) {
  const body = {}
  if (email != null) body.email = String(email).trim().toLowerCase()
  if (phone != null) body.phone = String(phone).trim()
  if (name != null) body.name = String(name).trim()
  if (roles != null) {
    body.roles = (Array.isArray(roles) ? roles : [])
      .map((r) => String(r).toLowerCase())
      .filter((r) => SUB_ADMIN_ROLE_IDS.includes(r))
  }
  if (password) body.password = String(password)
  if (status != null) {
    body.status = String(status).toLowerCase() === 'suspended' || String(status).toLowerCase() === 'inactive'
      ? 'inactive'
      : 'active'
  }
  return body
}

export function mapSubAdminToTableRow(item) {
  return {
    id: item.id,
    name: item.name || item.email || 'Sub Admin',
    email: item.email,
    phone: item.phone || '—',
    roles: item.rolesDisplay,
    status: item.status,
    joined: item.createdLabel,
  }
}
