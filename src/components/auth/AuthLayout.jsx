import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import MoneyTrendLogo from '../common/MoneyTrendLogo.jsx'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-[#1e3a5f] to-primary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex justify-center">
            <MoneyTrendLogo variant="auth" />
          </Link>
        </div>
        <div className="rounded-card bg-white p-8 shadow-lift">
          <h2 className="text-xl font-display font-bold text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </motion.div>
    </div>
  )
}
