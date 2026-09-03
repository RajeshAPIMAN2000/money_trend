import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { adminNav } from '../data/admin-nav.js'
import { useAdmin } from '../context/AdminContext.jsx'
import AdminAvatar from '../components/ui/AdminAvatar.jsx'
import MoneyTrendLogo from '../../components/common/MoneyTrendLogo.jsx'

function NavItem({ item, collapsed }) {
  const { pathname } = useLocation()
  const { setMobileOpen } = useAdmin()
  const hasChildren = !!item.children?.length
  const isChildActive = hasChildren && item.children.some(c => pathname === c.path || (c.path !== '/admin' && pathname.startsWith(c.path)))
  const [open, setOpen] = useState(isChildActive)

  const closeMobile = () => {
    if (window.innerWidth < 1024) setMobileOpen(false)
  }

  if (!hasChildren) {
    const Icon = item.icon
    return (
      <NavLink
        to={item.path}
        end={item.path === '/admin'}
        onClick={closeMobile}
        className={({ isActive }) => cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
            : 'text-slate-300 hover:text-white hover:bg-white/5',
          collapsed && 'justify-center px-2',
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    )
  }

  const GroupIcon = item.icon
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all',
          isChildActive && 'text-white',
          collapsed && 'justify-center px-2',
        )}
      >
        <GroupIcon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
          </>
        )}
      </button>
      {!collapsed && open && (
        <div className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-0.5">
          {item.children.map(child => {
            const ChildIcon = child.icon
            return (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={closeMobile}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                  isActive
                    ? 'bg-blue-600/90 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                )}
              >
                <ChildIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminSidebar() {
  const { sidebarCollapsed, mobileOpen, setMobileOpen } = useAdmin()

  const sidebar = (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0B1F3A] border-r border-white/5 transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/5', sidebarCollapsed && 'justify-center px-2')}>
        <MoneyTrendLogo variant={sidebarCollapsed ? 'icon' : 'navbar'} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 admin-scrollbar">
        {adminNav.map(item => (
          <NavItem key={item.label} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* User footer */}
      <div className={cn('p-3 border-t border-white/5', sidebarCollapsed && 'flex justify-center')}>
        <div className={cn(
          'flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors cursor-pointer',
          sidebarCollapsed && 'p-2',
        )}>
          <AdminAvatar name="Admin User" size="sm" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Admin User</div>
              <div className="text-[11px] text-slate-400">Super Admin</div>
            </div>
          )}
          {!sidebarCollapsed && <LogOut className="w-4 h-4 text-slate-400 hover:text-white shrink-0" />}
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      {sidebar}
    </>
  )
}
