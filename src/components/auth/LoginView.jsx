import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock } from 'lucide-react'
import FormInput from './FormInput.jsx'
import OtpVerification from './OtpVerification.jsx'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { ApiError } from '../../lib/api.js'
import { extractOtpMeta } from '../../lib/auth.js'
import { useOtpCountdown } from '../../hooks/useOtpCountdown.js'
import { EMAIL_RE } from '../../lib/validators.js'

/**
 * Email OTP login — Option B flow:
 * email + password → send-email-otp (LOGIN_VERIFICATION)
 * email + password + otp → login
 */
export default function LoginView({ onSwitchForgot, onSuccess }) {
  const { sendLoginEmailOtp, resendLoginEmailOtp, completeLogin } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState('credentials') // credentials | otp
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const { seconds, resendCooldown, start, expired, running } = useOtpCountdown(step === 'otp')

  const form = useForm({ defaultValues: { email: '', password: '' } })

  const sendOtp = async (data) => {
    setError('')
    setLoading(true)
    try {
      const email = data.email.trim().toLowerCase()
      const password = data.password
      const res = await sendLoginEmailOtp({ email, password })
      const meta = extractOtpMeta(res)
      setCredentials({ email, password })
      setOtp('')
      setStep('otp')
      start(meta.expiresIn)
      showToast(meta.message || 'Verification code sent to your email')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send login OTP')
    } finally {
      setLoading(false)
    }
  }

  const onResendOtp = async () => {
    setError('')
    setLoading(true)
    try {
      const resend = resendLoginEmailOtp || sendLoginEmailOtp
      const res = await resend(credentials)
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

  const onOtpSubmit = async () => {
    setError('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const result = await completeLogin({
        email: credentials.email,
        password: credentials.password,
        otp,
      })
      onSuccess(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}
        <OtpVerification
          channel="email"
          destinationLabel={credentials.email}
          otp={otp}
          onOtpChange={setOtp}
          seconds={seconds}
          resendData={resendCooldown}
          expired={expired}
          running={running}
          error=""
          loading={loading}
          onSubmit={onOtpSubmit}
          onResend={onResendOtp}
          submitLabel="Sign in"
          loadingLabel="Signing in..."
          onBack={() => { setStep('credentials'); setError(''); setOtp('') }}
          backLabel="← Back to login"
        />
      </>
    )
  }

  return (
    <>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}
      <form onSubmit={form.handleSubmit(sendOtp)} className="space-y-4">
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
          {...form.register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          })}
        />
        <div className="text-right">
          <button type="button" onClick={onSwitchForgot} className="text-xs text-secondary hover:underline">
            Forgot Password?
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Continue'}
        </Button>
      </form>
    </>
  )
}
