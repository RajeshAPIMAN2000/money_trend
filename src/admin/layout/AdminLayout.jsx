import { Outlet } from 'react-router-dom'
import { cn } from '../../lib/utils.js'
import { useAdmin } from '../context/AdminContext.jsx'
import AdminSidebar from './AdminSidebar.jsx'

export default function AdminLayout() {
  const { sidebarCollapsed } = useAdmin()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <AdminSidebar />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]',
        )}
      >
        <Outlet />
      </div>
    </div>
  )
}
