/**
 * Sub-admin roles assignable by Super Admin.
 * Maps to admin panel modules: SEO, Blogs, News.
 */

export const SUPER_ADMIN_ROLE = 'super_admin'

export const SUB_ADMIN_ROLES = [
  {
    id: 'seo',
    label: 'SEO Management',
    description: 'Meta titles & descriptions, Google Analytics, sitemap.xml, robots.txt',
    paths: ['/admin/seo'],
    path: '/admin/seo',
  },
  {
    id: 'blogs',
    label: 'Blog Management',
    description: 'Add blogs and view / edit blog posts',
    paths: ['/admin/blogs'],
    path: '/admin/blogs',
  },
  {
    id: 'news',
    label: 'News Management',
    description: 'Add news and view / edit news articles',
    paths: ['/admin/news'],
    path: '/admin/news',
  },
]

export const SUB_ADMIN_ROLE_IDS = SUB_ADMIN_ROLES.map((r) => r.id)

const SUPER_ALIASES = new Set(['super_admin', 'superadmin', 'admin', 'full_admin'])
const SUB_TYPE_ALIASES = new Set(['sub_admin', 'subadmin', 'staff', 'editor'])

export function roleLabel(roleId) {
  if (SUPER_ALIASES.has(String(roleId || '').toLowerCase())) return 'Super Admin'
  return SUB_ADMIN_ROLES.find((r) => r.id === roleId)?.label || String(roleId || '—')
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
  // "content.blogs" → also keep "blogs"
  list.push(s)
  const parts = s.split(/[./]/)
  if (parts.length > 1) list.push(parts[parts.length - 1])
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

  // Single role string — only keep if it is a known module or super alias
  const single = user.role
  if (typeof single === 'string' && single.trim()) {
    const s = single.trim().toLowerCase()
    if (SUPER_ALIASES.has(s) || SUB_ADMIN_ROLE_IDS.includes(s)) {
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
  // Has at least one content module role and no super role
  return roles.some((r) => SUB_ADMIN_ROLE_IDS.includes(r))
}

export function isSuperAdmin(user) {
  if (!user) return false
  if (isSubAdminAccount(user) && !normalizeAdminRoles(user).some((r) => SUPER_ALIASES.has(r))) {
    return false
  }
  const roles = normalizeAdminRoles(user)
  if (roles.some((r) => SUPER_ALIASES.has(r))) return true
  // Legacy admin sessions without roles / type → treat as super admin
  if (!roles.length && !isSubAdminAccount(user)) return true
  return false
}

export function hasAdminPermission(user, permission) {
  if (isSuperAdmin(user)) return true
  const roles = normalizeAdminRoles(user)
  const key = String(permission || '').toLowerCase()
  if (!key) return false
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
  if (isSuperAdmin(user)) return navItems

  const roles = normalizeAdminRoles(user)
  const allowedPaths = new Set(['/admin']) // dashboard always

  for (const role of SUB_ADMIN_ROLES) {
    if (roles.includes(role.id)) {
      role.paths.forEach((p) => allowedPaths.add(p))
    }
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
  return 'Sub Admin'
}
