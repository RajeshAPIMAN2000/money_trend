import { Outlet } from 'react-router-dom'
import AdminProviders from './providers/AdminProviders.jsx'

export default function AdminRoot() {
  return (
    <AdminProviders>
      <Outlet />
    </AdminProviders>
  )
}
