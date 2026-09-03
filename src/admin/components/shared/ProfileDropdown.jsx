import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, User, KeyRound, LogOut } from 'lucide-react'
import { cn } from '../../../lib/utils.js'
import AdminAvatar from '../ui/AdminAvatar.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAdmin()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const items = [
    { label: 'Admin Profile', icon: User, to: '/admin/profile' },
    { label: 'Change Password', icon: KeyRound, to: '/admin/change-password' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700"
      >
        <AdminAvatar name="Admin User" size="sm" />
        <div className="hidden lg:block text-left">
          <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight">Admin User</div>
          <div className="text-[11px] text-slate-500">Super Admin</div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform hidden lg:block', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
          {items.map(item => (
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
          <hr className="my-1 border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            onClick={() => { logout(); navigate('/admin/login') }}
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
