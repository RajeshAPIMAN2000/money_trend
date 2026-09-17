import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Wallet, X } from 'lucide-react'
import Button from '../ui/Button.jsx'
import FormInput from '../auth/FormInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { usePaymentModal } from '../../context/PaymentModalContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../lib/api.js'
import {
  PAYMENT_PURPOSES,
  formatInr,
  parsePaymentRequiredError,
} from '../../lib/dummyPayment.js'
import { checkWalletCanInvest } from '../../hooks/useDummyPayment.js'

function tenureToMonths(tenureLabel, tenureDisplay) {
  const raw = String(tenureLabel || tenureDisplay || '').toLowerCase()
  if (/10_years|10\s*year/.test(raw)) return 120
  if (/5_years|5\s*year/.test(raw)) return 60
  if (/3_years|3\s*year/.test(raw)) return 36
  if (/2_years|2\s*year/.test(raw)) return 24
  if (/1_year|1\s*year/.test(raw)) return 12
  if (/6_months|6\s*month|180-364/.test(raw)) return 6
  if (/46-179/.test(raw)) return 3
  if (/7-45/.test(raw)) return 1
  const years = raw.match(/(\d+)\s*year/)
  if (years) return Number(years[1]) * 12
  const months = raw.match(/(\d+)\s*month/)
  if (months) return Number(months[1])
  return 12
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

async function bookFdOrRd({ isRd, bankName, bankCode, amountNum, rate, tenureMonths }) {
  if (isRd) {
    return api.createRd({
      bank_name: bankName,
      bank_code: bankCode,
      monthly_amount: amountNum,
      interest_rate: rate,
      tenure_months: tenureMonths,
      start_date: todayIso(),
    })
  }
  return api.createFd({
    bank_name: bankName,
    bank_code: bankCode,
    principal_amount: amountNum,
    interest_rate: rate,
    tenure_months: tenureMonths,
    start_date: todayIso(),
  })
}

/**
 * Wallet-first invest:
 * 1) GET /wallet/can-invest
 * 2) enough balance → POST /fd or /market/rd
 * 3) shortfall → dummy pay shortfall → invest again
 */
export default function InvestNowModal({
  open,
  onClose,
  product = 'fd',
  bank,
  rates = [],
  featuredRate,
}) {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { openPayment } = usePaymentModal()
  const { showToast } = useToast()

  const defaultRow = useMemo(() => {
    if (!rates?.length) return null
    return (
      rates.find((r) => r.tenureLabel === '1_year' || /1\s*year/i.test(r.tenure || ''))
      || rates[0]
    )
  }, [rates])

  const [tenureKey, setTenureKey] = useState('')
  const [amount, setAmount] = useState(product === 'rd' ? '5000' : '10000')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [walletHint, setWalletHint] = useState(null)

  useEffect(() => {
    if (!open) return
    setError('')
    setBusy(false)
    setWalletHint(null)
    setAmount(product === 'rd' ? '5000' : '10000')
    setTenureKey(defaultRow?.tenureLabel || defaultRow?.tenure || '')
  }, [open, product, defaultRow])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const selected = rates.find((r) => (r.tenureLabel || r.tenure) === tenureKey) || defaultRow
  const rate = Number(selected?.generalRate ?? featuredRate ?? 0)
  const tenureMonths = tenureToMonths(selected?.tenureLabel, selected?.tenure)
  const amountNum = Number(amount)
  const isRd = product === 'rd'
  const productType = isRd ? 'rd' : 'fd'
  const bankName = bank?.bankName || 'Bank'
  const bankCode = bank?.shortName || bank?.bankName || 'BANK'
  const defaultPurpose = isRd ? PAYMENT_PURPOSES.RD_INVEST : PAYMENT_PURPOSES.FD_INVEST

  const openShortfallPayment = (check, investPayload) => {
    const payAmount = Number(check.payment?.amount || check.shortfall || 0)
    const purpose = check.payment?.purpose || defaultPurpose
    if (!(payAmount > 0)) {
      setError('Unable to determine top-up amount. Please try again.')
      return
    }

    onClose()
    openPayment({
      purpose,
      amount: payAmount,
      title: `Top up wallet · ${formatInr(payAmount)}`,
      description: isRd
        ? `${bankName} RD shortfall · then book investment`
        : `${bankName} FD shortfall · then book investment`,
      meta: {
        bank_name: bankName,
        bank_code: bankCode,
        product: isRd ? 'RD' : 'FD',
        interest_rate: investPayload.rate,
        tenure_months: investPayload.tenureMonths,
        invest_amount: investPayload.amountNum,
        shortfall: payAmount,
      },
      onSuccess: async () => {
        try {
          await bookFdOrRd(investPayload)
          showToast(isRd ? 'RD booked successfully' : 'FD booked successfully')
        } catch (err) {
          const again = parsePaymentRequiredError(err)
          if (again?.showPaymentGateway) {
            showToast('Wallet still short — complete another top-up to finish.')
            openShortfallPayment(again, investPayload)
            return
          }
          showToast(err?.data?.message || err?.message || 'Payment succeeded but booking failed.')
        }
      },
    })
  }

  const handleContinue = async () => {
    if (!isAuthenticated) {
      openLogin()
      showToast('Please sign in to invest.')
      return
    }
    if (!(amountNum > 0)) {
      setError(isRd ? 'Enter a valid monthly amount.' : 'Enter a valid principal amount.')
      return
    }
    if (!(rate > 0)) {
      setError('Select a tenure with a valid interest rate.')
      return
    }

    const investPayload = {
      isRd,
      bankName,
      bankCode,
      amountNum,
      rate,
      tenureMonths,
    }

    setBusy(true)
    setError('')
    try {
      const check = await checkWalletCanInvest(productType, amountNum)
      setWalletHint(check)

      if (check.canPayFromWallet && !check.showPaymentGateway) {
        try {
          await bookFdOrRd(investPayload)
          showToast(isRd ? 'RD booked from wallet' : 'FD booked from wallet')
          onClose()
          return
        } catch (err) {
          const payHint = parsePaymentRequiredError(err)
          if (payHint?.showPaymentGateway) {
            openShortfallPayment(payHint, investPayload)
            return
          }
          throw err
        }
      }

      if (check.showPaymentGateway) {
        openShortfallPayment(check, investPayload)
        return
      }

      // Ambiguous response — try invest; handle 402
      try {
        await bookFdOrRd(investPayload)
        showToast(isRd ? 'RD booked successfully' : 'FD booked successfully')
        onClose()
      } catch (err) {
        const payHint = parsePaymentRequiredError(err)
        if (payHint?.showPaymentGateway) {
          openShortfallPayment(payHint, investPayload)
          return
        }
        throw err
      }
    } catch (err) {
      const msg = err?.userMessage || err?.data?.message || err?.message || 'Unable to start investment'
      setError(msg)
      showToast(msg)
    } finally {
      setBusy(false)
    }
  }

  const ctaLabel = (() => {
    if (busy) return 'Checking wallet…'
    if (walletHint?.canPayFromWallet && !walletHint?.showPaymentGateway) {
      return `Invest from wallet · ${formatInr(amountNum || 0)}`
    }
    if (walletHint?.showPaymentGateway && (walletHint.shortfall || walletHint.payment?.amount)) {
      return `Top up ${formatInr(walletHint.payment?.amount || walletHint.shortfall)} & invest`
    }
    return `Continue · ${formatInr(amountNum || 0)}`
  })()

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-primary/50 backdrop-blur-sm p-4"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="bg-white rounded-card shadow-lift w-full max-w-md my-auto max-h-[min(90vh,720px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-display font-bold text-lg text-primary">
              Invest in {isRd ? 'RD' : 'FD'}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{bankName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Tenure</label>
            <select
              className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-btn text-sm outline-none focus:border-secondary"
              value={tenureKey}
              onChange={(e) => { setTenureKey(e.target.value); setWalletHint(null) }}
              disabled={busy}
            >
              {(rates.length ? rates : [{ tenure: '1 Year', tenureLabel: '1_year', generalRate: featuredRate }]).map((row) => (
                <option key={row.tenureLabel || row.tenure} value={row.tenureLabel || row.tenure}>
                  {row.tenure} {row.generalRate != null ? `· ${row.generalRate}%` : ''}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label={isRd ? 'Monthly amount (₹)' : 'Principal amount (₹)'}
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^\d]/g, ''))
              setWalletHint(null)
            }}
            disabled={busy}
          />

          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Interest rate</span>
              <span className="font-semibold">{rate > 0 ? `${rate}% p.a.` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tenure</span>
              <span className="font-semibold">{tenureMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invest amount</span>
              <span className="font-semibold text-primary">{formatInr(amountNum || 0)}</span>
            </div>
            {walletHint && (
              <>
                <div className="flex justify-between pt-1 border-t border-slate-200 mt-1">
                  <span className="text-slate-500 inline-flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> Wallet
                  </span>
                  <span className="font-semibold">{formatInr(walletHint.walletBalance)}</span>
                </div>
                {walletHint.requiredTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required (incl. fees)</span>
                    <span className="font-semibold">{formatInr(walletHint.requiredTotal)}</span>
                  </div>
                )}
                {walletHint.showPaymentGateway && (
                  <div className="flex justify-between text-amber-800">
                    <span>Shortfall to pay</span>
                    <span className="font-semibold">
                      {formatInr(walletHint.payment?.amount || walletHint.shortfall)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-xs text-slate-500">
            We check your wallet first. If balance covers the investment, we book directly — no card UI.
            Otherwise you only pay the shortfall via the dummy gateway, then we invest.
          </p>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="button" className="w-full" onClick={handleContinue} disabled={busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {ctaLabel}
              </span>
            ) : (
              ctaLabel
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
