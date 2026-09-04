import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Phone, User, X, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import FormInput from './FormInput.jsx'
import PasswordStrength from './PasswordStrength.jsx'
import OtpVerification from './OtpVerification.jsx'
import KycSelectionModal from './KycSelectionModal.jsx'
import Button from '../ui/Button.jsx'
import MoneyTrendLogo from '../common/MoneyTrendLogo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { authApi } from '../../lib/authApi.js'
import { api, ApiError } from '../../lib/api.js'
import { extractOtpMeta, getPostAuthPath } from '../../lib/auth.js'
import { useOtpCountdown } from '../../hooks/useOtpCountdown.js'
import { NAME_RE, EMAIL_RE, PHONE_RE } from '../../lib/validators.js'

function AuthModalShell({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-primary/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-card shadow-lift w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center pt-5 px-5 shrink-0">
          <MoneyTrendLogo variant="auth" />
        </div>
        <div className="flex items-start justify-between px-5 pt-3 pb-2 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg text-primary">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100 shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 pb-5 pt-0 text-center text-sm text-slate-500 shrink-0">{footer}</div>}
      </motion.div>
    </div>
  )
}

function LoginView({ onSwitchRegister, onSwitchForgot, onSuccess }) {
  const { completeLogin } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP login flow — commented out
  // const { sendLoginOtp, resendLoginOtp, completeLogin } = useAuth()
  // const { showToast } = useToast()
  // const [step, setStep] = useState('credentials')
  // const [otp, setOtp] = useState('')
  // const [phoneMasked, setPhoneMasked] = useState('')
  // const [credentials, setCredentials] = useState({ email: '', password: '' })
  // const { seconds, resendCooldown, start, expired, running } = useOtpCountdown(step === 'otp')

  const form = useForm({ defaultValues: { email: '', password: '' } })

  const onCredentialsSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      // Direct password login (OTP step disabled)
      const result = await completeLogin({ email: data.email, password: data.password })
      onSuccess(result)

      // OTP send step — commented out
      // const res = await sendLoginOtp(data)
      // const meta = extractOtpMeta(res)
      // setCredentials({ email: data.email, password: data.password })
      // setPhoneMasked(meta.phoneMasked || 'your registered mobile number')
      // setOtp('')
      // setStep('otp')
      // start(meta.expiresIn)
      // if (meta.message) showToast(meta.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // OTP resend / verify — commented out
  // const onResendOtp = async () => { ... }
  // const onOtpSubmit = async () => { ... }
  // if (step === 'otp') { return <OtpVerification ... /> }

  return (
    <>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}
      <form onSubmit={form.handleSubmit(onCredentialsSubmit)} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          icon={<Mail className="w-4 h-4" />}
          placeholder="you@email.com"
          error={form.formState.errors.email?.message}
          {...form.register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_RE, message: 'Invalid email format' },
          })}
        />
        <FormInput
          label="Password"
          type="password"
          icon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
          error={form.formState.errors.password?.message}
          {...form.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
        />
        <div className="text-right">
          <button type="button" onClick={onSwitchForgot} className="text-xs text-secondary hover:underline">Forgot Password?</button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </>
  )
}

function RegisterView({ onSwitchLogin, onSuccess }) {
  const { completeRegister } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP register flow — commented out
  // const { sendRegisterOtp, resendRegisterOtp, completeRegister } = useAuth()
  // const { showToast } = useToast()
  // const [step, setStep] = useState('form')
  // const [otp, setOtp] = useState('')
  // const [phoneMasked, setPhoneMasked] = useState('')
  // const [formData, setFormData] = useState(null)
  // const { seconds, resendCooldown, start, expired, running } = useOtpCountdown(step === 'otp')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', phone: '', dateOfBirth: '', password: '', confirmPassword: '' },
  })
  const watchPassword = watch('password', '')

  const onFormSubmit = async (data) => {
    setError('')
    if (!NAME_RE.test(data.name.trim())) {
      setError('Name must contain only letters and spaces')
      return
    }
    if (data.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const payload = {
      full_name: data.name.trim(),
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirm_password: data.confirmPassword,
      date_of_birth: data.dateOfBirth,
    }

    setLoading(true)
    try {
      // Direct registration (OTP step disabled)
      const result = await completeRegister(payload)
      onSuccess(result)

      // OTP send step — commented out
      // const res = await sendRegisterOtp(payload)
      // const meta = extractOtpMeta(res)
      // setFormData(payload)
      // setPhoneMasked(meta.phoneMasked || `******${data.phone.slice(-4)}`)
      // setOtp('')
      // setStep('otp')
      // start(meta.expiresIn)
      // if (meta.message) showToast(meta.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // OTP resend / verify — commented out
  // const onResendOtp = async () => { ... }
  // const onOtpSubmit = async () => { ... }
  // if (step === 'otp') { return <OtpVerification ... /> }

  return (
    <>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <FormInput
          label="Full Name"
          icon={<User className="w-4 h-4" />}
          placeholder="Rahul Sharma"
          error={errors.name?.message}
          {...register('name', { required: 'Full name is required' })}
        />
        <FormInput
          label="Email"
          type="email"
          icon={<Mail className="w-4 h-4" />}
          placeholder="you@email.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_RE, message: 'Invalid email format' },
          })}
        />
        <FormInput
          label="Phone Number"
          type="tel"
          icon={<Phone className="w-4 h-4" />}
          placeholder="9876543210"
          maxLength={10}
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Phone is required',
            pattern: { value: PHONE_RE, message: 'Enter valid 10-digit number' },
          })}
        />
        <FormInput
          label="Date of Birth"
          type="date"
          icon={<Calendar className="w-4 h-4" />}
          error={errors.dateOfBirth?.message}
          max={new Date().toISOString().split('T')[0]}
          {...register('dateOfBirth', { required: 'Date of birth is required' })}
        />
        <div>
          <FormInput
            label="Password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          <PasswordStrength password={watchPassword} />
        </div>
        <FormInput
          label="Confirm Password"
          type="password"
          icon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { required: 'Please confirm password' })}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </>
  )
}

function ForgotView({ onSwitchLogin }) {
  const { showToast } = useToast()
  const [step, setStep] = useState('details')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [phoneMasked, setPhoneMasked] = useState('')
  const [account, setAccount] = useState({ email: '', phone: '', dateOfBirth: '' })
  const { seconds, resendCooldown, start, expired, running } = useOtpCountdown(step === 'otp')

  const detailsForm = useForm({ defaultValues: { email: '', phone: '', dateOfBirth: '' } })
  const resetForm = useForm({ defaultValues: { newPassword: '', confirmPassword: '' } })
  const watchPassword = resetForm.watch('newPassword', '')

  const buildAccountPayload = (data) => ({
    email: data.email,
    phone: data.phone,
    date_of_birth: data.dateOfBirth,
  })

  const sendOtp = async (data) => {
    setError('')
    setLoading(true)
    try {
      const payload = buildAccountPayload(data)
      const res = await authApi.sendForgotPasswordOtp(payload)
      const meta = extractOtpMeta(res)
      setAccount({ email: data.email, phone: data.phone, dateOfBirth: data.dateOfBirth })
      setPhoneMasked(meta.phoneMasked || `******${data.phone.slice(-4)}`)
      setOtp('')
      setStep('otp')
      start(meta.expiresIn)
      if (meta.message) showToast(meta.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const onResendOtp = async () => {
    if (running || resendCooldown > 0) return
    setError('')
    setLoading(true)
    try {
      const res = await authApi.resendForgotPasswordOtp(buildAccountPayload(account))
      const meta = extractOtpMeta(res)
      setOtp('')
      start(meta.expiresIn)
      showToast(meta.message || 'OTP sent successfully')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const onResetPassword = async (data) => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP')
      return
    }
    if (expired) {
      setError('OTP has expired. Please request a new one.')
      return
    }
    if (data.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({
        email: account.email,
        phone: account.phone,
        date_of_birth: account.dateOfBirth,
        otp,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      })
      showToast('Password reset successful! Please sign in.')
      onSwitchLogin()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <>
        <OtpVerification
          phoneMasked={phoneMasked}
          otp={otp}
          onOtpChange={setOtp}
          seconds={seconds}
          resendCooldown={resendCooldown}
          expired={expired}
          running={running}
          error={error}
          loading={loading}
          onSubmit={resetForm.handleSubmit(onResetPassword)}
          onResend={onResendOtp}
          submitLabel="Reset Password"
          loadingLabel="Resetting password..."
          onBack={() => { setStep('details'); setOtp(''); setError('') }}
          backLabel="← Back"
        >
          <div className="space-y-4">
            <div>
              <FormInput
                label="New Password"
                type="password"
                icon={<Lock className="w-4 h-4" />}
                placeholder="••••••••"
                error={resetForm.formState.errors.newPassword?.message}
                {...resetForm.register('newPassword', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              <PasswordStrength password={watchPassword} />
            </div>
            <FormInput
              label="Confirm Password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              error={resetForm.formState.errors.confirmPassword?.message}
              {...resetForm.register('confirmPassword', { required: 'Please confirm password' })}
            />
          </div>
        </OtpVerification>
      </>
    )
  }

  return (
    <>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}
      <form onSubmit={detailsForm.handleSubmit(sendOtp)} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          icon={<Mail className="w-4 h-4" />}
          placeholder="you@email.com"
          error={detailsForm.formState.errors.email?.message}
          {...detailsForm.register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_RE, message: 'Invalid email format' },
          })}
        />
        <FormInput
          label="Phone Number"
          type="tel"
          icon={<Phone className="w-4 h-4" />}
          placeholder="9876543210"
          maxLength={10}
          error={detailsForm.formState.errors.phone?.message}
          {...detailsForm.register('phone', {
            required: 'Phone is required',
            pattern: { value: PHONE_RE, message: 'Enter valid 10-digit number' },
          })}
        />
        <FormInput
          label="Date of Birth"
          type="date"
          icon={<Calendar className="w-4 h-4" />}
          error={detailsForm.formState.errors.dateOfBirth?.message}
          max={new Date().toISOString().split('T')[0]}
          {...detailsForm.register('dateOfBirth', { required: 'Date of birth is required' })}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP via SMS'}
        </Button>
        <button type="button" onClick={onSwitchLogin} className="w-full text-sm text-secondary hover:underline">
          ← Back to login
        </button>
      </form>
    </>
  )
}

export default function AuthModal() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { view, close, openLogin, openRegister, openForgot, showKycModal, setShowKycModal } = useAuthModal()

  const handleAuthSuccess = async (result, fallbackMessage) => {
    close()
    const destination = getPostAuthPath(result?.nextStep)

    // If backend says "nominee" but user already has one, skip that step
    if (result?.nextStep === 'nominee') {
      try {
        const profileRes = await api.getProfile()
        const nominee = profileRes?.data?.nominee ?? profileRes?.nominee
        if (nominee?.added || nominee?.nominee_name) {
          navigate('/dashboard')
          showToast(result?.message || fallbackMessage)
          return
        }
      } catch {
        // fall through to nominee route
      }
    }

    if (destination.type === 'kyc') {
      setShowKycModal(true)
    } else {
      navigate(destination.path)
    }
    showToast(result?.message || fallbackMessage)
  }

  const handleManualKyc = () => {
    setShowKycModal(false)
    navigate('/onboarding/kyc/manual')
  }

  const handleDigiLocker = async () => {
    setShowKycModal(false)
    try {
      const session = await api.initDigiLocker()
      if (session.isStub) {
        await api.completeDigiLockerStub()
        try {
          const profileRes = await api.getProfile()
          const nominee = profileRes?.data?.nominee ?? profileRes?.nominee
          if (nominee?.added || nominee?.nominee_name) {
            navigate('/dashboard')
            return
          }
        } catch {
          // fall through
        }
        navigate('/onboarding/nominee')
      } else {
        window.location.href = session.authUrl
      }
    } catch {
      navigate('/onboarding/kyc/digilocker')
    }
  }

  const handleLater = () => {
    setShowKycModal(false)
    navigate('/')
  }

  const titles = {
    login: { title: 'Welcome back', subtitle: 'Sign in to your MoneyTrend account' },
    register: { title: 'Create account', subtitle: 'Join MoneyTrend and start investing' },
    forgot: { title: 'Forgot password', subtitle: 'Verify your identity to reset your password via SMS OTP' },
  }

  const footers = {
    login: (
      <p>
        New user?{' '}
        <button type="button" onClick={openRegister} className="text-secondary font-semibold hover:underline">Register</button>
      </p>
    ),
    register: (
      <p>
        Already have an account?{' '}
        <button type="button" onClick={openLogin} className="text-secondary font-semibold hover:underline">Sign in</button>
      </p>
    ),
  }

  return (
    <>
      <AnimatePresence>
        {view && (
          <AuthModalShell
            title={titles[view]?.title}
            subtitle={titles[view]?.subtitle}
            onClose={close}
            footer={footers[view]}
          >
            {view === 'login' && (
              <LoginView
                onSwitchRegister={openRegister}
                onSwitchForgot={openForgot}
                onSuccess={(result) => handleAuthSuccess(result, 'Login successful! Welcome back.')}
              />
            )}
            {view === 'register' && (
              <RegisterView
                onSwitchLogin={openLogin}
                onSuccess={(result) => handleAuthSuccess(result, 'Registration successful!')}
              />
            )}
            {view === 'forgot' && <ForgotView onSwitchLogin={openLogin} />}
          </AuthModalShell>
        )}
      </AnimatePresence>

      <KycSelectionModal
        open={showKycModal}
        onManual={handleManualKyc}
        onDigiLocker={handleDigiLocker}
        onLater={handleLater}
      />
    </>
  )
}
