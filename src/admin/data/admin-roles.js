/**
 * Employee (sub-admin) roles assignable by Super Admin.
 * Maps to admin panel modules: SEO, Content Creator, Ticket Raised.
 */

export const SUPER_ADMIN_ROLE = 'super_admin'

export const SUB_ADMIN_ROLES = [
  {
    id: 'seo',
    label: 'SEO Management',
    description: 'Meta titles & descriptions, Google Analytics, sitemap.xml, robots.txt',
    paths: ['/admin/seo', '/admin/notifications'],
    path: '/admin/seo',
  },
  {
    id: 'content_creator',
    label: 'Content Creator',
    description: 'Create and manage News and Blogs in one workspace (rich-text heading & description)',
    paths: ['/admin/content-creator', '/admin/news', '/admin/blogs', '/admin/notifications'],
    path: '/admin/content-creator',
  },
  {
    id: 'support',
    label: 'Ticket Raised',
    description: 'Handle assigned user tickets; Admin assigns free/busy Customer Support agents',
    paths: ['/admin/support', '/admin/notifications'],
    path: '/admin/support',
  },
]

export const SUB_ADMIN_ROLE_IDS = SUB_ADMIN_ROLES.map((r) => r.id)

const SUPER_ALIASES = new Set(['super_admin', 'superadmin', 'admin', 'full_admin'])
const SUB_TYPE_ALIASES = new Set(['sub_admin', 'subadmin', 'staff', 'editor', 'employee'])

/** Legacy / API aliases → canonical role id */
const ROLE_ALIASES = {
  blog: 'content_creator',
  blogs: 'content_creator',
  news: 'content_creator',
  content: 'content_creator',
  'content-creator': 'content_creator',
  content_creator: 'content_creator',
  customer_support: 'support',
  'customer-support': 'support',
  ticket_raised: 'support',
  'ticket-raised': 'support',
  tickets: 'support',
}

export function roleLabel(roleId) {
  if (SUPER_ALIASES.has(String(roleId || '').toLowerCase())) return 'Super Admin'
  const id = ROLE_ALIASES[String(roleId || '').toLowerCase()] || String(roleId || '')
  return SUB_ADMIN_ROLES.find((r) => r.id === id)?.label || String(roleId || '—')
}

function pushRole(list, value) {
  if (value == null) return
  if (Array.isArray(value)) {
    value.forEach((v) => pushRole(list, v))
    return
  }
  if (typeof value === 'object') {
    const id = value.id ?? value.slug ?? value.name ?? value.key ?? value.permission
    if (id) pushRole(list, id)
    return
  }
  const s = String(value).trim().toLowerCase()
  if (!s) return
  const normalized = ROLE_ALIASES[s] || s
  list.push(normalized)
  // "content.blogs" → also keep last segment (mapped)
  const parts = s.split(/[./]/)
  if (parts.length > 1) {
    const last = parts[parts.length - 1]
    list.push(ROLE_ALIASES[last] || (last === 'blog' ? 'content_creator' : last))
  }
}

/** Normalize roles array from API / stored admin user */
export function normalizeAdminRoles(user) {
  if (!user || typeof user !== 'object') return []
  const collected = []

  pushRole(collected, user.roles)
  pushRole(collected, user.role_list)
  pushRole(collected, user.permissions)
  pushRole(collected, user.modules)
  pushRole(collected, user.allowed_modules)

  const single = user.role
  if (typeof single === 'string' && single.trim()) {
    const s = single.trim().toLowerCase()
    const mapped = ROLE_ALIASES[s] || s
    if (SUPER_ALIASES.has(s) || SUB_ADMIN_ROLE_IDS.includes(mapped)) {
      pushRole(collected, s)
    }
  }

  return [...new Set(collected)]
}

export function isSubAdminAccount(user) {
  if (!user || typeof user !== 'object') return false
  const type = String(user.type || user.user_type || user.admin_type || user.account_type || '').toLowerCase()
  if (SUB_TYPE_ALIASES.has(type)) return true
  const role = String(user.role || '').toLowerCase()
  if (SUB_TYPE_ALIASES.has(role)) return true
  const roles = normalizeAdminRoles(user)
  if (roles.some((r) => SUPER_ALIASES.has(r))) return false
  return roles.some((r) => SUB_ADMIN_ROLE_IDS.includes(r))
}

export function isSuperAdmin(user) {
  if (!user) return false
  if (isSubAdminAccount(user) && !normalizeAdminRoles(user).some((r) => SUPER_ALIASES.has(r))) {
    return false
  }
  const roles = normalizeAdminRoles(user)
  if (roles.some((r) => SUPER_ALIASES.has(r))) return true
  if (!roles.length && !isSubAdminAccount(user)) return true
  return false
}

export function hasAdminPermission(user, permission) {
  if (isSuperAdmin(user)) return true
  const roles = normalizeAdminRoles(user)
  const key = String(permission || '').toLowerCase()
  if (!key) return false

  // Content Creator covers news + blogs (+ content-creator page)
  if (
    (key === 'news' || key === 'blogs' || key === 'blog' || key === 'content_creator' || key === 'content')
    && roles.includes('content_creator')
  ) {
    return true
  }

  if (roles.includes(key)) return true
  return roles.some((r) => r === key || r.endsWith(`.${key}`) || r.includes(key))
}

/** Module cards for the current sub-admin */
export function getAssignedSubAdminModules(user) {
  const roles = normalizeAdminRoles(user)
  return SUB_ADMIN_ROLES.filter((r) => roles.includes(r.id))
}

/** Filter admin nav tree by logged-in admin roles */
export function filterAdminNavByRoles(navItems, user) {
  if (isSuperAdmin(user)) {
    // Super admin: Content Management keeps News & Blogs separate — hide Content Creator hub
    return navItems.map((item) => {
      if (!item.children?.length) return item
      if (item.label !== 'Content Management') return item
      return {
        ...item,
        children: item.children.filter((c) => c.path !== '/admin/content-creator'),
      }
    })
  }

  const roles = normalizeAdminRoles(user)
  const allowedPaths = new Set(['/admin'])

  for (const role of SUB_ADMIN_ROLES) {
    if (roles.includes(role.id)) {
      role.paths.forEach((p) => allowedPaths.add(p))
    }
  }

  // Employees with Content Creator: show the unified hub, not separate News/Blogs
  if (roles.includes('content_creator')) {
    allowedPaths.add('/admin/content-creator')
    allowedPaths.delete('/admin/news')
    allowedPaths.delete('/admin/blogs')
  }

  return navItems
    .map((item) => {
      if (item.path && allowedPaths.has(item.path)) return item
      if (item.children?.length) {
        const children = item.children.filter((c) => allowedPaths.has(c.path))
        if (!children.length) return null
        return { ...item, children }
      }
      return null
    })
    .filter(Boolean)
}

export function adminDisplayName(user) {
  return user?.full_name || user?.name || user?.email || 'Admin'
}

export function adminRoleSummary(user) {
  if (isSuperAdmin(user)) return 'Super Admin'
  const modules = getAssignedSubAdminModules(user)
  if (modules.length) return modules.map((m) => m.label).join(', ')
  return 'Employee'
}
