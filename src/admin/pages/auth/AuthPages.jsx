import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { Lock, Mail } from 'lucide-react'
import MoneyTrendLogo from '../../../components/common/MoneyTrendLogo.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { ApiError } from '../../../lib/api.js'

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#0F2744] to-[#0B1F3A] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <MoneyTrendLogo variant="auth" />
          </div>
          <p className="text-sm text-slate-400">Admin Panel</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </div>
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
      subtitle="Sign in to your admin account"
      footer={
        <Link to="/admin/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
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
      footer={<Link to="/admin/login" className="text-blue-600 hover:underline">Back to login</Link>}
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
      footer={<Link to="/admin/login" className="text-blue-600 hover:underline">Back to login</Link>}
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
