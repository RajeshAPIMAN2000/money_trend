import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext.jsx'
import { hasAdminPermission, isSuperAdmin } from '../../data/admin-roles.js'

/**
 * Gate admin routes by sub-admin role / super admin.
 * permission: 'seo' | 'content_creator' | 'news' | 'blogs' | 'support' | 'sub_admins' | …
 */
export default function RequirePermission({ permission, children, fallback = '/admin' }) {
  const { adminUser } = useAdmin()

  if (permission === 'sub_admins') {
    if (!isSuperAdmin(adminUser)) {
      return <Navigate to={fallback} replace />
    }
    return children
  }

  if (!hasAdminPermission(adminUser, permission)) {
    return <Navigate to={fallback} replace />
  }

  return children
}
