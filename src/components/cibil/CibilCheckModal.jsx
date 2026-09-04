import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import MoneyTrendLogo from '../common/MoneyTrendLogo.jsx'
import CreditCheckForm from '../credit/CreditCheckForm.jsx'
import CreditScoreCard from '../credit/CreditScoreCard.jsx'
import Button from '../ui/Button.jsx'
import { useCibilCheck } from '../../context/CibilCheckContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useSubmitCreditCheck } from '../../hooks/useCreditCheck.js'
import { buildCreditCheckPayload } from '../../lib/creditCheck.js'

export default function CibilCheckModal() {
  const { open, closeCibilCheck } = useCibilCheck()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const submitMutation = useSubmitCreditCheck()

  const [step, setStep] = useState('form') // form | loading | success | no_match | error
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const resetState = () => {
    setStep('form')
    setError('')
    setResult(null)
    submitMutation.reset()
  }

  useEffect(() => {
    if (!open) resetState()
  }, [open])

  const handleSubmit = async (formValues) => {
    setError('')
    setStep('loading')
    try {
      const payload = buildCreditCheckPayload(formValues)
      const parsed = await submitMutation.mutateAsync(payload)

      if (parsed.noMatch || parsed.score == null) {
        setResult(parsed)
        setStep('no_match')
        return
      }

      setResult(parsed)
      setStep('success')
      showToast('Credit check completed successfully.')
    } catch (err) {
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
                {step === 'loading' && 'Checking credit information'}
                {step === 'success' && 'Your Credit Score'}
                {step === 'no_match' && 'No match found'}
                {step === 'error' && 'Unable to complete check'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {step === 'form' && 'No login or OTP required. Fill your details and submit securely.'}
                {step === 'loading' && 'Securely checking your credit information…'}
                {step === 'success' && 'Results returned from our secure credit-check service.'}
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
                <p className="text-sm font-medium text-slate-700">Securely checking your credit information…</p>
                <p className="text-xs text-slate-500">This usually takes a few seconds. Please do not close this window.</p>
              </div>
            )}

            {step === 'success' && result && (
              <CreditScoreCard
                result={result}
                showHistoryLink={isAuthenticated}
                onCheckAgain={() => { setStep('form'); setError(''); setResult(null) }}
              />
            )}

            {step === 'no_match' && (
              <div className="space-y-4 text-center py-4">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  Credit information could not be matched. Please verify your name, PAN, date of birth, and address, then try again.
                </div>
                {result?.referenceId && (
                  <p className="text-xs text-slate-500">Reference: {result.referenceId}</p>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={() => { setStep('form'); setError('') }}>Try again</Button>
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
                  <Button type="button" onClick={() => { setStep('form'); setError('') }}>Back to form</Button>
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
