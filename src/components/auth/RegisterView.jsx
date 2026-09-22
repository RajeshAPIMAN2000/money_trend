import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Phone, User, Calendar } from 'lucide-react'
import FormInput from './FormInput.jsx'
import PasswordStrength from './PasswordStrength.jsx'
import OtpVerification from './OtpVerification.jsx'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { ApiError } from '../../lib/api.js'
import { extractOtpMeta } from '../../lib/auth.js'
import { useOtpCountdown } from '../../hooks/useOtpCountdown.js'
import { NAME_RE, EMAIL_RE, PHONE_RE } from '../../lib/validators.js'

/**
 * Register UX (backend-aligned):
 * 1) Form: full name, mobile, email, DOB, password, confirm password
 * 2) Register → POST /auth/send-email-otp (EMAIL_VERIFICATION)
 * 3) OTP screen → Verify → POST /auth/register with form + otp
 */
export default function RegisterView({ onSuccess }) {
  const { sendRegisterEmailOtp, completeRegister } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState('form') // form | otp
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState(null)
  const { seconds, resendCooldown, start, expired, running } = useOtpCountdown(step === 'otp')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
    },
  })
  const watchPassword = watch('password', '')

  const buildPayload = (data) => {
    const fullName = data.name.trim()
    const firstName = fullName.split(/\s+/)[0] || fullName
    return {
      full_name: fullName,
      first_name: firstName,
      email: data.email.trim().toLowerCase(),
      phone: String(data.phone || '').replace(/\D/g, ''),
      password: data.password,
      confirm_password: data.confirmPassword,
      date_of_birth: data.dateOfBirth,
    }
  }

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

    const payload = buildPayload(data)
    setLoading(true)
    try {
      const res = await sendRegisterEmailOtp({
        email: payload.email,
        first_name: payload.first_name,
      })
      const meta = extractOtpMeta(res)
      setFormData(payload)
      setOtp('')
      setStep('otp')
      start(meta.expiresIn)
      showToast(meta.message || 'Verification code sent to your email')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const onResendOtp = async () => {
    if (!formData) return
    setError('')
    setLoading(true)
    try {
      const res = await sendRegisterEmailOtp({
        email: formData.email,
        first_name: formData.first_name,
      })
      const meta = extractOtpMeta(res)
      setOtp('')
      start(meta.expiresIn)
      showToast(meta.message || 'OTP resent to your email')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const onVerifyAndRegister = async () => {
    if (!formData) return
    setError('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const result = await completeRegister({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirm_password,
        date_of_birth: formData.date_of_birth,
        otp,
      })
      onSuccess(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
            {error}
          </div>
        )}
        <OtpVerification
          channel="email"
          destinationLabel={formData?.email}
          otp={otp}
          onOtpChange={setOtp}
          seconds={seconds}
          resendData={resendCooldown}
          expired={expired}
          running={running}
          error=""
          loading={loading}
          onSubmit={onVerifyAndRegister}
          onResend={onResendOtp}
          submitLabel="Verify OTP"
          loadingLabel="Creating account..."
          onBack={() => { setStep('form'); setError(''); setOtp('') }}
          backLabel="← Edit details"
        />
      </>
    )
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <FormInput
          label="Full Name"
          icon={<User className="w-4 h-4" />}
          placeholder="Rajesh Kumar"
          error={errors.name?.message}
          {...register('name', { required: 'Full name is required' })}
        />
        <FormInput
          label="Mobile"
          type="tel"
          icon={<Phone className="w-4 h-4" />}
          placeholder="9876543210"
          maxLength={10}
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Mobile is required',
            pattern: { value: PHONE_RE, message: 'Enter valid 10-digit number' },
          })}
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
          {loading ? 'Sending OTP...' : 'Register'}
        </Button>
        <p className="text-xs text-slate-500 text-center">
          We&apos;ll email a 6-digit OTP to verify your email, then create your account.
        </p>
      </form>
    </>
  )
}
