import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, User, KeyRound, LogOut } from 'lucide-react'
import { cn } from '../../../lib/utils.js'
import AdminAvatar from '../ui/AdminAvatar.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { adminDisplayName, adminRoleSummary, isSuperAdmin } from '../../data/admin-roles.js'

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { logout, adminUser } = useAdmin()

  const name = adminDisplayName(adminUser)
  const roleText = adminRoleSummary(adminUser)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const items = [
    { label: 'Admin Profile', icon: User, to: '/admin/profile' },
    { label: 'Change Password', icon: KeyRound, to: '/admin/change-password' },
  ]

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700"
      >
        <AdminAvatar name={name} size="sm" />
        <div className="hidden lg:block text-left max-w-[140px]">
          <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight truncate">{name}</div>
          <div className="text-[11px] text-slate-500 truncate">{roleText}</div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform hidden lg:block', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-[11px] text-slate-500 truncate">{roleText}</p>
          </div>
          {isSuperAdmin(adminUser) && items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <item.icon className="w-4 h-4 text-slate-400" />
              {item.label}
            </Link>
          ))}
          {!isSuperAdmin(adminUser) && (
            <Link
              to="/admin/change-password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <KeyRound className="w-4 h-4 text-slate-400" />
              Change Password
            </Link>
          )}
          <hr className="my-1 border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
