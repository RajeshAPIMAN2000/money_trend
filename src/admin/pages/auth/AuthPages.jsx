import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { Lock, Mail, Shield } from 'lucide-react'
import MoneyTrendLogo from '../../../components/common/MoneyTrendLogo.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { ApiError } from '../../../lib/api.js'

function AuthLayout({ title, subtitle, children, footer }) {
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
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl bg-white shadow-[0_25px_60px_-20px_rgba(15,23,42,0.25)] border border-slate-200/80 overflow-hidden">
          {/* Logo on white — always visible; logo above Admin Panel */}
          <div className="px-8 pt-8 pb-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100">
                <MoneyTrendLogo variant="auth" className="!h-20 sm:!h-24 !max-w-[14rem]" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Admin Panel
              </div>
            </div>
          </div>

          <div className="px-8 py-7">
            <h2 className="text-xl font-display font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          MoneyTrend secure access · Authorized staff only
        </p>
      </motion.div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAdmin()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }) => {
    setError('')
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your admin or sub-admin credentials"
      footer={
        <Link to="/admin/forgot-password" className="text-blue-600 hover:underline font-medium">
          Forgot password?
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Email</label>
          <AdminInput {...register('email', { required: 'Email is required' })} type="email" icon={<Mail className="w-4 h-4" />} placeholder="admin@example.com" className="mt-1" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Password</label>
          <AdminInput {...register('password', { required: 'Password is required' })} type="password" icon={<Lock className="w-4 h-4" />} placeholder="••••••••" className="mt-1" />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <AdminButton type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </AdminButton>
      </form>
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm()

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email to receive a reset link"
      footer={<Link to="/admin/login" className="text-blue-600 hover:underline font-medium">Back to login</Link>}
    >
      {isSubmitSuccessful ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600">Reset link sent! Check your email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(() => {})} className="space-y-4">
          <AdminInput {...register('email', { required: true })} type="email" icon={<Mail className="w-4 h-4" />} placeholder="admin@moneytrend.in" />
          <AdminButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </AdminButton>
        </form>
      )}
    </AuthLayout>
  )
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Create a new password for your account"
      footer={<Link to="/admin/login" className="text-blue-600 hover:underline font-medium">Back to login</Link>}
    >
      <form onSubmit={handleSubmit(() => navigate('/admin/login'))} className="space-y-4">
        <AdminInput {...register('password', { required: true, minLength: 8 })} type="password" icon={<Lock className="w-4 h-4" />} placeholder="New password" />
        <AdminInput {...register('confirm', { required: true })} type="password" icon={<Lock className="w-4 h-4" />} placeholder="Confirm password" />
        <AdminButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </AdminButton>
      </form>
    </AuthLayout>
  )
}
