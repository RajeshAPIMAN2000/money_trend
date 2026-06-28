import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/fd-rd', label: 'FD & RD' },
  { to: '/mutual-funds', label: 'Mutual Funds' },
  { to: '/calculators', label: 'Calculators' },
  { to: '/news', label: 'News' },
  { to: '/blog', label: 'Blog' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/goals', label: 'Goals' },
  { to: '/support', label: 'Support' },
  { to: '/profile', label: 'Profile' },
]

export default function Navbar() {
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
          <Link to="/" className="flex items-center gap-2" onClick={close}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-display font-bold text-sm">
              M
            </div>
            <span className="font-display font-bold text-xl text-primary">MoneyTrend</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.slice(0, 8).map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopLink}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/profile" className="text-sm font-medium text-ink hover:text-secondary px-3 py-2">
              Login
            </Link>
            <Link
              to="/kyc"
              className="text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-btn hover:bg-secondary/90 shadow-card"
            >
              Get Started
            </Link>
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-display font-bold text-xs">
                    M
                  </div>
                  <span className="font-display font-bold text-lg text-primary">MoneyTrend</span>
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
                {NAV_LINKS.map(({ to, label, end }, idx) => (
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
              </nav>

              <div className="shrink-0 p-4 border-t border-slate-100 space-y-2 bg-slate-50/80">
                <Link
                  to="/profile"
                  onClick={close}
                  className="block w-full text-center text-sm font-medium text-ink hover:text-secondary px-4 py-3 rounded-xl border border-slate-200 bg-white"
                >
                  Login
                </Link>
                <Link
                  to="/kyc"
                  onClick={close}
                  className="block w-full text-center text-sm font-semibold bg-secondary text-white px-4 py-3 rounded-xl hover:bg-secondary/90 shadow-card"
                >
                  Get Started
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
