import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext.jsx'
import { isSuperAdmin, normalizeAdminRoles, SUB_ADMIN_ROLES, isSubAdminAccount } from '../../data/admin-roles.js'

function subAdminAllowedPath(pathname, user) {
  if (pathname === '/admin' || pathname === '/admin/') return true
  if (pathname.startsWith('/admin/change-password')) return true
  // Sub-admins do not get full profile admin page unless super
  if (pathname.startsWith('/admin/profile') && isSuperAdmin(user)) return true
  const roles = normalizeAdminRoles(user)
  for (const role of SUB_ADMIN_ROLES) {
    if (!roles.includes(role.id)) continue
    for (const path of role.paths) {
      if (pathname === path || pathname.startsWith(`${path}/`)) return true
    }
  }
  return false
}

export default function RequireAuth() {
  const { isAuthenticated, adminUser } = useAdmin()
  const { pathname } = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: pathname }} replace />
  }

  // Sub-admins may only open modules granted by their roles (+ dashboard)
  if ((isSubAdminAccount(adminUser) || !isSuperAdmin(adminUser)) && !subAdminAllowedPath(pathname, adminUser)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export function RequireGuest() {
  const { isAuthenticated } = useAdmin()
  if (isAuthenticated) return <Navigate to="/admin" replace />
  return <Outlet />
}
