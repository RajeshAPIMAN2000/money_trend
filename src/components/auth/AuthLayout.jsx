import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import MoneyTrendLogo from '../common/MoneyTrendLogo.jsx'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 sm:p-6">
      {/* Light brand atmosphere — logo stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37, 99, 235, 0.12), transparent 55%),'
            + 'radial-gradient(ellipse 70% 50% at 90% 100%, rgba(16, 185, 129, 0.10), transparent 50%),'
            + 'linear-gradient(165deg, #F1F5F9 0%, #E8EEF6 42%, #F8FAFC 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),'
            + 'linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <Link
            to="/"
            className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100 inline-flex justify-center"
          >
            <MoneyTrendLogo variant="auth" className="!h-20 sm:!h-24 !max-w-[14rem]" />
          </Link>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-[0_25px_60px_-20px_rgba(15,23,42,0.25)] border border-slate-200/80">
          <h2 className="text-xl font-display font-bold text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </motion.div>
    </div>
  )
}
