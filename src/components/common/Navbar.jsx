import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const link = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-btn ${isActive ? 'text-secondary bg-secondary/10' : 'text-ink hover:text-secondary hover:bg-slate-100'}`
  return (
    <header className={`sticky top-0 z-40 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-card' : 'bg-white/60 backdrop-blur'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-display font-bold text-sm">M</div>
          <span className="font-display font-bold text-xl text-primary">MoneyTrend</span>
        </Link>
        <div className="hidden lg:flex items-center gap-1">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/products" className={link}>Products</NavLink>
          <NavLink to="/fd-rd" className={link}>FD & RD</NavLink>
          <NavLink to="/mutual-funds" className={link}>Mutual Funds</NavLink>
          <NavLink to="/calculators" className={link}>Calculators</NavLink>
          <NavLink to="/news" className={link}>News</NavLink>
          <NavLink to="/blog" className={link}>Blog</NavLink>
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/profile" className="text-sm font-medium text-ink hover:text-secondary px-3 py-2">Login</Link>
          <Link to="/kyc" className="text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-btn hover:bg-secondary/90 shadow-card">Get Started</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-btn hover:bg-slate-100" aria-label="Menu">
          <div className="w-5 h-0.5 bg-ink mb-1"></div><div className="w-5 h-0.5 bg-ink mb-1"></div><div className="w-5 h-0.5 bg-ink"></div>
        </button>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-fade-in">
          {[['/','Home'],['/products','Products'],['/fd-rd','FD & RD'],['/mutual-funds','Mutual Funds'],['/calculators','Calculators'],['/news','News'],['/blog','Blog'],['/dashboard','Dashboard'],['/goals','Goals'],['/support','Support'],['/profile','Profile']].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={link}>{label}</NavLink>
          ))}
          <Link to="/kyc" onClick={() => setOpen(false)} className="block text-center text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-btn mt-2">Get Started</Link>
        </div>
      )}
    </header>
  )
}
