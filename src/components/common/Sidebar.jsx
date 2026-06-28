import { NavLink } from 'react-router-dom'
const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '◫' },
  { to: '/mutual-funds', label: 'Investments', icon: '↗' },
  { to: '/goals', label: 'Goals', icon: '◎' },
  { to: '/dashboard', label: 'Transactions', icon: '⇆' },
  { to: '/profile', label: 'Profile', icon: '◉' },
]
export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="bg-white rounded-card shadow-card p-3 sticky top-20">
        {items.map(i => (
          <NavLink key={i.label} to={i.to} end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium ${isActive ? 'bg-secondary text-white' : 'text-ink hover:bg-slate-100'}`}>
            <span className="w-5 text-center">{i.icon}</span>{i.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
