import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Loader2, Lock, X } from 'lucide-react'
import Button from '../ui/Button.jsx'
import FormInput from '../auth/FormInput.jsx'
import { usePaymentModal } from '../../context/PaymentModalContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import {
  useCreateDummyPayment,
  useDummyPaymentConfig,
  usePayDummyPayment,
} from '../../hooks/useDummyPayment.js'
import {
  CIBIL_REPORT_FEE,
  DEMO_CARDS_FALLBACK,
  PAYMENT_PURPOSES,
  formatInr,
  purposeLabel,
} from '../../lib/dummyPayment.js'

export default function DummyPaymentModal() {
  const { session, closePayment } = usePaymentModal()
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const configQuery = useDummyPaymentConfig({ enabled: Boolean(session) })
  const createMutation = useCreateDummyPayment()
  const payMutation = usePayDummyPayment()

  const [card, setCard] = useState({
    card_number: '',
    cvv: '',
    expiry_month: '',
    expiry_year: '',
    card_holder: '',
  })
  const [error, setError] = useState('')
  const [step, setStep] = useState('form') // form | paying | success

  const cards = configQuery.data?.cards?.length
    ? configQuery.data.cards
    : DEMO_CARDS_FALLBACK

  const displayAmount = useMemo(() => {
    if (!session) return 0
    if (session.purpose === PAYMENT_PURPOSES.CIBIL_REPORT) {
      return configQuery.data?.fees?.cibil_report ?? CIBIL_REPORT_FEE
    }
    return Number(session.amount || 0)
  }, [session, configQuery.data])

  useEffect(() => {
    if (!session) {
      setStep('form')
      setError('')
      setCard({
        card_number: '',
        cvv: '',
        expiry_month: '',
        expiry_year: '',
        card_holder: '',
      })
      return
    }
    if (!isAuthenticated) {
      closePayment()
      openLogin()
      showToast('Please sign in to continue payment.')
    }
  }, [session, isAuthenticated, closePayment, openLogin, showToast])

  if (!session || !isAuthenticated) return null

  const applyDemoCard = (demo) => {
    setCard({
      card_number: demo.card_number,
      cvv: demo.cvv,
      expiry_month: demo.expiry_month,
      expiry_year: demo.expiry_year,
      card_holder: demo.card_holder,
    })
    setError('')
  }

  const handleClose = () => {
    session.onCancel?.()
    closePayment()
  }

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    if (!card.card_number || !card.cvv || !card.expiry_month || !card.expiry_year || !card.card_holder) {
      setError('Enter complete card details (or pick a demo card).')
      return
    }
    if (session.purpose !== PAYMENT_PURPOSES.CIBIL_REPORT && !(Number(session.amount) > 0)) {
      setError('Enter a valid amount.')
      return
    }

    setStep('paying')
    try {
      const order = await createMutation.mutateAsync({
        purpose: session.purpose,
        amount: session.purpose === PAYMENT_PURPOSES.CIBIL_REPORT ? undefined : session.amount,
        description: session.description,
        meta: session.meta,
      })
      if (!order?.orderId) {
        throw Object.assign(new Error('Payment order was not created'), {
          userMessage: 'Payment order was not created',
        })
      }
      const paid = await payMutation.mutateAsync({
        orderId: order.orderId,
        card,
      })
      setStep('success')
      showToast(paid.message || 'Payment successful')
      session.onSuccess?.({ order, paid, amount: displayAmount })
      window.setTimeout(() => closePayment(), 700)
    } catch (err) {
      setStep('form')
      setError(err.userMessage || err.message || 'Payment failed')
      showToast(err.userMessage || 'Payment failed')
    }
  }

  const busy = step === 'paying' || createMutation.isPending || payMutation.isPending

  return (
    <div
      className="fixed inset-0 z-[75] grid place-items-center bg-primary/50 backdrop-blur-sm p-4"
      onClick={busy ? undefined : handleClose}
    >
      <div
        className="bg-white rounded-card shadow-lift w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-lg text-primary">
              {session.title || purposeLabel(session.purpose)}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Dummy payment gateway — demo cards only
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Amount payable</p>
              <p className="text-2xl font-display font-bold text-primary">{formatInr(displayAmount)}</p>
            </div>
            <Lock className="w-5 h-5 text-secondary" />
          </div>

          {session.purpose === PAYMENT_PURPOSES.CIBIL_REPORT && (
            <p className="text-xs text-slate-500">
              Paying unlocks full CIBIL report download for your account.
            </p>
          )}
          {(session.purpose === PAYMENT_PURPOSES.FD_INVEST || session.purpose === PAYMENT_PURPOSES.RD_INVEST) && (
            <p className="text-xs text-slate-500">
              {session.meta?.shortfall
                ? 'This tops up only the wallet shortfall. After payment, your investment is booked from wallet.'
                : 'Payment credits your wallet, then the investment is booked from wallet balance.'}
            </p>
          )}
          {session.purpose === PAYMENT_PURPOSES.WALLET_DEPOSIT && (
            <p className="text-xs text-slate-500">
              Dummy top-up credits your wallet balance.
            </p>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Demo cards</p>
            <div className="flex flex-wrap gap-2">
              {cards.map((demo) => (
                <button
                  key={demo.card_number}
                  type="button"
                  disabled={busy}
                  onClick={() => applyDemoCard(demo)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-secondary/40 bg-white"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 'success' ? (
            <div className="py-8 text-center text-sm text-emerald-700 font-semibold">
              Payment successful
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-3">
              <FormInput
                label="Card holder"
                icon={<CreditCard className="w-4 h-4" />}
                value={card.card_holder}
                onChange={(e) => setCard((c) => ({ ...c, card_holder: e.target.value }))}
                disabled={busy}
              />
              <FormInput
                label="Card number"
                inputMode="numeric"
                autoComplete="cc-number"
                value={card.card_number}
                onChange={(e) => setCard((c) => ({
                  ...c,
                  card_number: e.target.value.replace(/[^\d\s]/g, ''),
                }))}
                disabled={busy}
              />
              <div className="grid grid-cols-3 gap-3">
                <FormInput
                  label="MM"
                  maxLength={2}
                  value={card.expiry_month}
                  onChange={(e) => setCard((c) => ({
                    ...c,
                    expiry_month: e.target.value.replace(/\D/g, '').slice(0, 2),
                  }))}
                  disabled={busy}
                />
                <FormInput
                  label="YY"
                  maxLength={2}
                  value={card.expiry_year}
                  onChange={(e) => setCard((c) => ({
                    ...c,
                    expiry_year: e.target.value.replace(/\D/g, '').slice(0, 2),
                  }))}
                  disabled={busy}
                />
                <FormInput
                  label="CVV"
                  maxLength={4}
                  type="password"
                  autoComplete="cc-csc"
                  value={card.cvv}
                  onChange={(e) => setCard((c) => ({
                    ...c,
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                  }))}
                  disabled={busy}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </span>
                ) : (
                  `Pay ${formatInr(displayAmount)}`
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
