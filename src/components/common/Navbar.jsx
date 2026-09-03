import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LayoutDashboard, LogOut, User, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { cn } from '../../lib/utils.js'
import MoneyTrendLogo from './MoneyTrendLogo.jsx'

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/fd-rd', label: 'FD & RD' },
  // { to: '/mutual-funds', label: 'Mutual Funds' },
  { to: '/calculators', label: 'Calculators' },
  { to: '/news', label: 'News' },
  { to: '/blog', label: 'Blog' },
  { to: '/goals', label: 'Goals' },
  { to: '/support', label: 'Support' },
]

const AUTH_NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
]

function UserMenu({ onNavigate, className }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const close = () => {
    setOpen(false)
    onNavigate?.()
  }

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/15 transition-colors"
          aria-label="Profile menu"
          aria-expanded={open}
        >
          <span className="text-sm font-semibold">{initials}</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || user?.phone}</p>
            </div>
            <Link
              to="/profile"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-slate-400" />
              Profile
            </Link>
            <Link
              to="/dashboard"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-slate-50"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              Dashboard
            </Link>
            <hr className="my-1 border-slate-100" />
            <button
              type="button"
              onClick={() => { logout(); close() }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-ink hover:text-secondary hover:bg-slate-100 transition-colors"
        aria-label="Wallet"
        title="Wallet"
      >
        <Wallet className="w-5 h-5" />
      </Link>
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated } = useAuth()
  const { openLogin, openRegister } = useAuthModal()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = () => setOpen(false)

  const link = ({ isActive }) =>
    `block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
      isActive ? 'text-secondary bg-secondary/10' : 'text-ink hover:text-secondary hover:bg-slate-100'
    }`

  const desktopLink = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-btn ${
      isActive ? 'text-secondary bg-secondary/10' : 'text-ink hover:text-secondary hover:bg-slate-100'
    }`

  return (
    <>
      <header className={`sticky top-0 z-40 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-card' : 'bg-white/60 backdrop-blur'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0 py-1" onClick={close}>
            <MoneyTrendLogo variant="navbar" className="hover:opacity-90 transition-opacity" />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {PUBLIC_NAV_LINKS.slice(0, 8).map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopLink}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <button type="button" onClick={openLogin} className="text-sm font-medium text-ink hover:text-secondary px-3 py-2">
                  Login
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-btn hover:bg-secondary/90 shadow-card"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden relative w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className={`block w-5 h-0.5 bg-ink transition-all duration-300 absolute ${open ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`block w-5 h-0.5 bg-ink transition-all duration-300 ${open ? 'opacity-0 scale-0' : 'opacity-100'}`} />
            <span className={`block w-5 h-0.5 bg-ink transition-all duration-300 absolute ${open ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={close}
              aria-label="Close menu overlay"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 z-[60] h-full w-[min(320px,88vw)] bg-white shadow-2xl lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
                <Link to="/" className="flex items-center gap-2" onClick={close}>
                  <MoneyTrendLogo variant="icon" />
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="w-9 h-9 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {PUBLIC_NAV_LINKS.map(({ to, label, end }, idx) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                  >
                    <NavLink to={to} end={end} onClick={close} className={link}>
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
                {isAuthenticated && AUTH_NAV_LINKS.map(({ to, label }, idx) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (PUBLIC_NAV_LINKS.length + idx) * 0.04, duration: 0.3 }}
                  >
                    <NavLink to={to} onClick={close} className={link}>
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="shrink-0 p-4 border-t border-slate-100 space-y-2 bg-slate-50/80">
                {isAuthenticated ? (
                  <UserMenu onNavigate={close} className="justify-center" />
                ) : (
                  <>
                    <button type="button" onClick={() => { openLogin(); close() }} className="block w-full text-center text-sm font-medium text-ink hover:text-secondary px-4 py-3 rounded-xl border border-slate-200 bg-white">
                      Login
                    </button>
                    <button type="button" onClick={() => { openRegister(); close() }} className="block w-full text-center text-sm font-semibold bg-secondary text-white px-4 py-3 rounded-xl hover:bg-secondary/90 shadow-card">
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
