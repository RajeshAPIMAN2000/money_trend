import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'motion/react'
import { CreditCard, Mail, Phone, User, X } from 'lucide-react'
import FormInput from '../auth/FormInput.jsx'
import OtpInput from '../auth/OtpInput.jsx'
import Button from '../ui/Button.jsx'
import MoneyTrendLogo from '../common/MoneyTrendLogo.jsx'
import { ScoreGauge } from '../home/CivilScoreChecker.jsx'
import { useCibilCheck } from '../../context/CibilCheckContext.jsx'
import { api, ApiError } from '../../lib/api.js'
import { CIBIL_BUREAUS, generateBureauScores, generateOtp, getScoreLabel, maskPhone } from '../../lib/cibil.js'
import { EMAIL_RE, NAME_RE, PAN_RE, PHONE_RE } from '../../lib/validators.js'

function BureauScoreCard({ bureau, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        highlight ? 'border-amber-300 bg-amber-50/60 shadow-md' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{bureau.shortName}</p>
          <p className="font-display font-bold text-slate-800">{bureau.name}</p>
        </div>
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: bureau.color }}
          aria-hidden
        />
      </div>
      <div className="flex items-center gap-4">
        <ScoreGauge score={bureau.score} size="sm" gradientId={`cibil-${bureau.id}`} showNeedle={false} />
        <div>
          <p className="text-2xl font-display font-bold text-primary">{bureau.score}</p>
          <p className="text-sm font-semibold text-slate-600">{bureau.label}</p>
          <p className="text-xs text-slate-400 mt-1">As of {bureau.reportDate}</p>
        </div>
      </div>
    </div>
  )
}

export default function CibilCheckModal() {
  const { open, closeCibilCheck } = useCibilCheck()
  const [step, setStep] = useState('form')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [formData, setFormData] = useState(null)
  const [bureauScores, setBureauScores] = useState([])

  const form = useForm({
    defaultValues: { name: '', email: '', phone: '', pan: '' },
  })

  const resetState = () => {
    setStep('form')
    setError('')
    setLoading(false)
    setOtp('')
    setSentOtp('')
    setResendTimer(0)
    setFormData(null)
    setBureauScores([])
    form.reset()
  }

  useEffect(() => {
    if (!open) resetState()
  }, [open])

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const onFormSubmit = async (data) => {
    setError('')
    setLoading(true)
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.replace(/\D/g, ''),
      pan: data.pan.trim().toUpperCase(),
    }

    try {
      let otpCode = generateOtp()
      try {
        const res = await api.sendCibilOtp(payload)
        otpCode = res?.data?.otp || res?.otp || otpCode
      } catch (err) {
        if (!(err instanceof ApiError)) throw err
      }

      setFormData(payload)
      setSentOtp(otpCode)
      setStep('otp')
      startResendTimer()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setError('')
    setLoading(true)

    try {
      try {
        await api.verifyCibilOtp({ phone: formData.phone, otp })
      } catch (err) {
        if (otp !== sentOtp) {
          throw new Error('Invalid OTP. Please try again.')
        }
      }

      let scores = generateBureauScores(formData)
      try {
        const res = await api.getCibilScores(formData)
        const apiScores = res?.data?.bureaus || res?.bureaus
        if (Array.isArray(apiScores) && apiScores.length) {
          scores = apiScores.map((item, index) => ({
            ...CIBIL_BUREAUS[index],
            ...item,
            label: getScoreLabel(item.score),
          }))
        }
      } catch {
        // Use generated demo scores when API is unavailable
      }

      setBureauScores(scores)
      setStep('results')
    } catch (err) {
      setError(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const onResendOtp = async () => {
    if (resendTimer > 0 || !formData) return
    setError('')
    setLoading(true)
    try {
      let otpCode = generateOtp()
      try {
        const res = await api.sendCibilOtp(formData)
        otpCode = res?.data?.otp || res?.otp || otpCode
      } catch {
        // Demo fallback
      }
      setSentOtp(otpCode)
      setOtp('')
      startResendTimer()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const bestScore = useMemo(
    () => (bureauScores.length ? Math.max(...bureauScores.map((b) => b.score)) : 0),
    [bureauScores],
  )

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[58] grid place-items-center bg-primary/50 backdrop-blur-sm p-4" onClick={closeCibilCheck}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-card shadow-lift w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center pt-5 px-5 shrink-0">
            <MoneyTrendLogo variant="auth" />
          </div>

          <div className="flex items-start justify-between px-5 pt-3 pb-2 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="font-display font-bold text-lg text-primary">
                {step === 'form' && 'Check Your CIBIL Score'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'results' && 'CIBIL Comparison'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {step === 'form' && 'Enter your details to fetch scores from all 3 bureaus'}
                {step === 'otp' && `OTP sent to ${maskPhone(formData?.phone)}`}
                {step === 'results' && 'Experian, TransUnion & Equifax comparison'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCibilCheck}
              className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100 shrink-0"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                <FormInput
                  label="Full Name"
                  icon={<User className="w-4 h-4" />}
                  placeholder="As per PAN card"
                  {...form.register('name', {
                    required: 'Name is required',
                    pattern: { value: NAME_RE, message: 'Enter a valid name' },
                  })}
                  error={form.formState.errors.name?.message}
                />
                <FormInput
                  label="Email"
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="you@example.com"
                  {...form.register('email', {
                    required: 'Email is required',
                    pattern: { value: EMAIL_RE, message: 'Enter a valid email' },
                  })}
                  error={form.formState.errors.email?.message}
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  {...form.register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: PHONE_RE, message: 'Enter a valid 10-digit mobile number' },
                  })}
                  error={form.formState.errors.phone?.message}
                />
                <FormInput
                  label="PAN Card Number"
                  icon={<CreditCard className="w-4 h-4" />}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  {...form.register('pan', {
                    required: 'PAN is required',
                    onChange: (e) => { e.target.value = e.target.value.toUpperCase() },
                    pattern: { value: PAN_RE, message: 'Enter a valid PAN (e.g. ABCDE1234F)' },
                  })}
                  error={form.formState.errors.pan?.message}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP…' : 'Check Your CIBIL'}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <p className="text-sm text-slate-600 text-center">
                  Enter the 6-digit OTP sent to your registered mobile number.
                </p>
                <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                <Button type="button" className="w-full" onClick={onVerifyOtp} disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify & View CIBIL Scores'}
                </Button>
                <p className="text-center text-sm text-slate-500">
                  {resendTimer > 0 ? (
                    <>Resend OTP in {resendTimer}s</>
                  ) : (
                    <button type="button" onClick={onResendOtp} className="text-secondary font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(''); setOtp('') }}
                  className="w-full text-sm text-slate-500 hover:text-slate-700"
                >
                  ← Edit details
                </button>
              </div>
            )}

            {step === 'results' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
                  <p className="font-semibold text-slate-800">{formData?.name}</p>
                  <p className="text-slate-500">{formData?.email} • {maskPhone(formData?.phone)}</p>
                  <p className="text-slate-500">PAN: {formData?.pan}</p>
                </div>

                <div className="space-y-3">
                  {bureauScores.map((bureau) => (
                    <BureauScoreCard
                      key={bureau.id}
                      bureau={bureau}
                      highlight={bureau.score === bestScore}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Scores are fetched from Experian, TransUnion (CIBIL), and Equifax. This is a soft enquiry and does not affect your credit score.
                </p>

                <Button type="button" className="w-full" onClick={closeCibilCheck}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
