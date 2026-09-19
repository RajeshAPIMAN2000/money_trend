import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import MoneyTrendLogo from '../common/MoneyTrendLogo.jsx'
import CreditCheckForm from '../credit/CreditCheckForm.jsx'
import CreditScoreCard from '../credit/CreditScoreCard.jsx'
import Button from '../ui/Button.jsx'
import { useCibilCheck } from '../../context/CibilCheckContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useLatestCreditCheck, useSubmitCreditCheck } from '../../hooks/useCreditCheck.js'
import { buildCreditCheckPayload } from '../../lib/creditCheck.js'
import { api } from '../../lib/api.js'

const MOBILE_KEY = 'moneytrend-credit-mobile'

export default function CibilCheckModal() {
  const { open, closeCibilCheck } = useCibilCheck()
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const submitMutation = useSubmitCreditCheck()

  const [step, setStep] = useState('form') // form | loading | success | no_match | error
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [preferForm, setPreferForm] = useState(false)
  const [mobile, setMobile] = useState(() => localStorage.getItem(MOBILE_KEY) || '')
  const [pan, setPan] = useState(() => localStorage.getItem('moneytrend-credit-pan') || '')

  const canFetchLatest = open && step === 'success' && (isAuthenticated || Boolean(mobile))
  const { data: latest, refetch: refetchLatest } = useLatestCreditCheck({
    enabled: canFetchLatest,
    mobile: isAuthenticated ? undefined : mobile,
    refetchInterval: (query) => {
      const data = query.state.data
      return data?.pending ? 2000 : false
    },
  })

  const resetState = () => {
    setStep('form')
    setError('')
    setResult(null)
    setPreferForm(true) // always prefer form when (re)opening Check CIBIL
    submitMutation.reset()
  }

  useEffect(() => {
    if (!open) {
      resetState()
      return
    }
    // Always open on the check form — do not skip to a cached empty report
    setStep('form')
    setError('')
    setResult(null)
    setPreferForm(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // While on success and bureau is still PENDING, refresh from latest
  useEffect(() => {
    if (!open || step !== 'success' || !latest?.pending) return
    setResult(latest)
  }, [latest, open, step])

  const requireLogin = () => {
    showToast('Please sign in to view your full credit report.')
    closeCibilCheck()
    window.setTimeout(() => openLogin(), 50)
  }

  const ensureReportAccess = async (parsed, guestMobile) => {
    if (isAuthenticated || !parsed?.id) return true
    try {
      await api.getCreditCheckReport(parsed.id, guestMobile ? { mobile: guestMobile } : {})
      return true
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) return false
      // Other errors: still allow score UI
      return true
    }
  }

  const handleSubmit = async (formValues) => {
    setError('')
    setPreferForm(false)
    setStep('loading')
    try {
      const payload = buildCreditCheckPayload(formValues)
      const parsed = await submitMutation.mutateAsync(payload)

      if (payload.mobile) {
        localStorage.setItem(MOBILE_KEY, payload.mobile)
        setMobile(payload.mobile)
      }
      if (payload.pan) {
        localStorage.setItem('moneytrend-credit-pan', payload.pan)
        setPan(payload.pan)
      }

      if (parsed.loginRequired && !isAuthenticated) {
        requireLogin()
        return
      }

      const hasScore = parsed.score != null
        || Object.values(parsed.bureauScores || {}).some((b) => b?.score != null)

      if (parsed.noMatch || (!hasScore && !parsed.pending)) {
        setResult(parsed)
        setStep('no_match')
        showToast(parsed.message || 'TransUnion CIBIL could not return a score for these details.')
        return
      }

      const canViewReport = await ensureReportAccess(parsed, payload.mobile)
      if (!canViewReport) {
        requireLogin()
        return
      }

      setResult(parsed)
      setStep('success')
      showToast(
        parsed.rateLimited
          ? (parsed.message || 'Recent check found — showing your latest scores.')
          : parsed.pending
            ? 'Credit check started — waiting for bureau SUCCESS…'
            : 'Credit check completed — TransUnion CIBIL report.',
      )
      refetchLatest()
    } catch (err) {
      if (err?.status === 401 || err?.status === 403 || err?.needsLogin) {
        requireLogin()
        return
      }
      setError(err.userMessage || 'Unable to complete the credit check.')
      setStep('error')
      showToast(err.userMessage || 'Unable to complete the credit check.')
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[58] grid place-items-center bg-primary/50 backdrop-blur-sm p-4" onClick={closeCibilCheck}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-card shadow-lift w-full max-w-3xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center pt-5 px-5 shrink-0">
            <MoneyTrendLogo variant="auth" />
          </div>

          <div className="flex items-start justify-between px-5 pt-3 pb-2 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="font-display font-bold text-lg text-primary">
                {step === 'form' && 'Check Your CIBIL Score'}
                {step === 'loading' && 'Running credit check'}
                {step === 'success' && (result?.pending ? 'Check in progress' : 'Your Credit Scores')}
                {step === 'no_match' && 'No match found'}
                {step === 'error' && 'Unable to complete check'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {step === 'form' && 'We fetch your TransUnion CIBIL score with your consent.'}
                {step === 'loading' && 'Securely checking TransUnion CIBIL…'}
                {step === 'success' && (result?.pending
                  ? 'Monitoring until status changes from PENDING to SUCCESS.'
                  : 'Your TransUnion CIBIL report is ready below.')}
                {step === 'no_match' && 'Credit information could not be matched for the details provided.'}
                {step === 'error' && 'Please review the message below and try again.'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCibilCheck}
              className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100 shrink-0"
              disabled={step === 'loading'}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {step === 'form' && (
              <CreditCheckForm
                onSubmit={handleSubmit}
                loading={submitMutation.isPending}
                error={error}
              />
            )}

            {step === 'loading' && (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-700">Running credit check (MoneyTrend API)…</p>
                <p className="text-xs text-slate-500">
                  If the bureau returns PENDING, we keep polling latest scores until SUCCESS.
                </p>
              </div>
            )}

            {step === 'success' && result && (
              <CreditScoreCard
                key={result.id || result.referenceId || 'suite'}
                result={result}
                mobile={mobile}
                pan={pan}
                showHistoryLink={isAuthenticated}
                onCheckAgain={() => {
                  setPreferForm(true)
                  setStep('form')
                  setError('')
                  setResult(null)
                }}
                onResultRefresh={() => refetchLatest()}
                onLoginRequired={requireLogin}
              />
            )}

            {step === 'no_match' && (
              <div className="space-y-4 text-center py-4">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  Credit information could not be matched. Please verify your name, PAN, date of birth, and mobile, then try again.
                </div>
                {result?.referenceId && (
                  <p className="text-xs text-slate-500">Reference: {result.referenceId}</p>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setPreferForm(true)
                      setStep('form')
                      setError('')
                      setResult(null)
                    }}
                  >
                    Try again
                  </Button>
                  <Button type="button" variant="outline" onClick={closeCibilCheck}>Close</Button>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setPreferForm(true)
                      setStep('form')
                      setError('')
                    }}
                  >
                    Back to form
                  </Button>
                  <Button type="button" variant="outline" onClick={closeCibilCheck}>Close</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
