import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function RequireAuth() {
  const { isAuthenticated } = useAdmin()
  const { pathname } = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: pathname }} replace />
  }

  return <Outlet />
}

export function RequireGuest() {
  const { isAuthenticated } = useAdmin()
  if (isAuthenticated) return <Navigate to="/admin" replace />
  return <Outlet />
}
