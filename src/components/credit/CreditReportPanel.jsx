import { useEffect, useState } from 'react'
import { Download, Eye, FileText, Loader2, Lock, QrCode, X } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { BureauIcon } from './BureauIcon.jsx'
import { bureauDisplayName, parseCreditReport } from '../../lib/creditCheck.js'
import { downloadCreditReportPdf } from '../../lib/creditReportPdf.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useCivilScoreUnlock } from '../../hooks/useDummyPayment.js'
import { CIBIL_REPORT_FEE, formatInr } from '../../lib/dummyPayment.js'
import { api } from '../../lib/api.js'
import { loadRazorpayCheckout } from '../../lib/razorpay.js'

function money(value) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return `₹${n.toLocaleString('en-IN')}`
}

function insightTiles(insights) {
  if (!insights) return []
  return [
    ['Total accounts', insights.totalAccounts],
    ['Active', insights.activeAccounts],
    ['Closed', insights.closedAccounts],
    ['Credit cards', insights.creditCards],
    ['Loans', insights.loans],
    ['Enquiries', insights.totalEnquiries],
    ['Overdue accounts', insights.overdueAccounts],
    ['Overdue amount', insights.totalOverdueAmount != null ? money(insights.totalOverdueAmount) : null],
  ].filter(([, v]) => v != null)
}

export default function CreditReportPanel({
  report,
  loading = false,
  error = '',
  maskedPan,
  onRetry,
  onLogin,
  apiDownloadUrl,
  onUnlocked,
}) {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const reportRef = report?.reportRefId || null
  const checkId = report?.checkId || null
  const reportPaymentParams = { reportRef, checkId }
  const unlockQuery = useCivilScoreUnlock({
    enabled: isAuthenticated,
    ...reportPaymentParams,
  })
  const [downloading, setDownloading] = useState(false)
  const [paymentPending, setPaymentPending] = useState(false)
  const [qrCreating, setQrCreating] = useState(false)
  const [qrPayment, setQrPayment] = useState(null)

  const unlocked = Boolean(unlockQuery.data?.unlocked)
  const unlockReady = !isAuthenticated || !report || unlockQuery.isFetched || unlockQuery.isError
  const fee = CIBIL_REPORT_FEE

  useEffect(() => {
    if (!qrPayment || qrPayment.status !== 'pending') return undefined

    let cancelled = false
    let timeoutId
    const checkPayment = async () => {
      try {
        const response = await api.getCivilScoreQrStatus(qrPayment.paymentId)
        const status = response?.data
        if (cancelled) return
        if (status?.paid) {
          setQrPayment((current) => current?.paymentId === qrPayment.paymentId
            ? { ...current, status: 'paid' }
            : current)
          await unlockQuery.refetch()
          showToast('QR payment verified. Your CIBIL report is unlocked.')
          return
        }
        if (status?.status === 'expired') {
          setQrPayment((current) => current?.paymentId === qrPayment.paymentId
            ? { ...current, status: 'expired' }
            : current)
          return
        }
      } catch {
        // Keep polling while the QR is open; transient API errors should not lose payment confirmation.
      }
      if (!cancelled) timeoutId = setTimeout(checkPayment, 4000)
    }

    timeoutId = setTimeout(checkPayment, 2500)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [qrPayment?.paymentId, qrPayment?.status, unlockQuery.refetch, showToast])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex items-center justify-center gap-2 text-sm text-slate-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading full credit report…
      </div>
    )
  }

  if (onLogin && !report) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900 space-y-3">
        <p className="font-semibold">Login required for full report</p>
        <p className="text-xs text-sky-800">
          Your score may still show above. Sign in to unlock the detailed bureau report.
        </p>
        <Button type="button" size="sm" onClick={onLogin}>Sign in</Button>
      </div>
    )
  }

  if (error && !report) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-y-3">
        <p>{error}</p>
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>Retry</Button>
          )}
          {onLogin && (
            <Button type="button" size="sm" onClick={onLogin}>Sign in</Button>
          )}
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 flex items-start gap-2">
        <FileText className="w-4 h-4 mt-0.5 shrink-0" />
        Full report will appear here after the bureau check completes.
      </div>
    )
  }

  const pan = report.pan || maskedPan || '—'
  const tiles = insightTiles(report.insights)

  const fetchReportIntoWindow = async (reportWindow, autoPrint) => {
    setDownloading(true)
    try {
      await api.downloadCivilScoreReport(reportPaymentParams)
      if (!checkId) throw new Error('This report is missing its check reference. Please refresh and try again.')
      const reportResponse = await api.getCreditCheckReport(checkId)
      const parsed = parseCreditReport(reportResponse)
      if (!parsed || parsed.checkId == null) {
        throw new Error('The saved credit report could not be loaded. Please try again.')
      }
      if (!downloadCreditReportPdf(parsed, { maskedPan: pan, targetWindow: reportWindow, autoPrint })) {
        throw new Error('Allow pop-ups to view your report.')
      }
      onUnlocked?.(parsed || report)
    } catch (err) {
      reportWindow?.close()
      showToast(err.message || 'Unable to load your credit report.')
    } finally {
      setDownloading(false)
    }
  }

  const startRazorpayCheckout = async () => {
    if (!reportRef && !checkId) {
      showToast('This report is missing its reference. Please refresh and try again.')
      return
    }
    setPaymentPending(true)
    try {
      const Razorpay = await loadRazorpayCheckout()
      const response = await api.createCivilScorePaymentOrder(reportPaymentParams)
      const order = response?.data
      if (!order?.order_id || !order?.key_id || !order?.amount) {
        throw new Error('The payment order response was incomplete.')
      }

      const checkout = new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'MoneyTrend',
        description: 'CIBIL report unlock',
        order_id: order.order_id,
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay by UPI',
                instruments: [{ method: 'upi' }],
              },
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (paymentResponse) => {
          try {
            const verification = await api.verifyCivilScorePayment({
              ...paymentResponse,
              report_ref: order.report_ref,
            })
            const result = verification?.data
            if (result?.payment_status !== 'success' || result?.verification_status !== 'verified') {
              throw new Error(result?.message || 'Payment is not captured yet. The report remains locked.')
            }
            await unlockQuery.refetch()
            showToast('Payment verified. Select Download PDF to view your report.')
          } catch (err) {
            showToast(err.message || 'Payment verification failed. The report remains locked.')
          } finally {
            setPaymentPending(false)
          }
        },
        modal: {
          ondismiss: () => setPaymentPending(false),
        },
        theme: { color: '#0f766e' },
      })

      checkout.on('payment.failed', (event) => {
        setPaymentPending(false)
        showToast(event?.error?.description || 'Payment failed. Please try again.')
      })
      checkout.open()
    } catch (err) {
      setPaymentPending(false)
      showToast(err.message || 'Unable to start Razorpay Checkout.')
    }
  }

  const startQrPayment = async () => {
    if (!reportRef && !checkId) {
      showToast('This report is missing its reference. Please refresh and try again.')
      return
    }
    setQrCreating(true)
    try {
      const response = await api.createCivilScoreQrPayment(reportPaymentParams)
      const qr = response?.data
      if (!qr?.payment_id || !qr?.image_url) {
        throw new Error('Razorpay did not return a QR code. Please try card checkout instead.')
      }
      setQrPayment({
        paymentId: qr.payment_id,
        imageUrl: qr.image_url,
        amount: Number(qr.amount || 0),
        expiresAt: qr.expires_at,
        status: 'pending',
      })
    } catch (err) {
      showToast(err.message || 'Unable to create a QR payment.')
    } finally {
      setQrCreating(false)
    }
  }

  const handleReportAction = async (autoPrint) => {
    if (!isAuthenticated) {
      openLogin()
      showToast('Please sign in to view your CIBIL report.')
      return
    }
    if (!unlocked) {
      await startRazorpayCheckout()
      return
    }
    const reportWindow = window.open('about:blank', '_blank')
    if (!reportWindow) {
      showToast('Allow pop-ups to view your report.')
      return
    }
    reportWindow.opener = null
    reportWindow.document.body.textContent = 'Loading your credit report…'
    await fetchReportIntoWindow(reportWindow, autoPrint)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <BureauIcon bureau={report.bureau} className="w-10 h-10" />
          <div>
            <p className="font-display font-bold text-primary">{bureauDisplayName(report.bureau)} Report</p>
            <p className="text-xs text-slate-500 mt-0.5">PAN {pan}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!unlocked && isAuthenticated && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={startQrPayment}
              disabled={downloading || paymentPending || qrCreating || !unlockReady}
            >
              <span className="inline-flex items-center gap-1.5">
                {qrCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                Scan &amp; Pay
              </span>
            </Button>
          )}
          {apiDownloadUrl && (
            <Button type="button" size="sm" variant="outline" onClick={() => handleReportAction(false)} disabled={downloading || paymentPending || !unlockReady}>
              <span className="inline-flex items-center gap-1.5">
                {downloading || paymentPending ? <Loader2 className="w-4 h-4 animate-spin" /> : unlocked ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                View report
              </span>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => handleReportAction(true)}
            disabled={downloading || paymentPending || !unlockReady}
          >
            <span className="inline-flex items-center gap-1.5">
              {downloading || paymentPending || !unlockReady ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : unlocked ? (
                <Download className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {!unlockReady
                ? 'Checking…'
                : unlocked
                  ? 'Download PDF'
                  : `Unlock & Download · ${formatInr(fee)}`}
            </span>
          </Button>
        </div>
      </div>

      {!unlocked && isAuthenticated && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-900">
          Viewing or downloading the full report requires a one-time payment of {formatInr(fee)}.
        </div>
      )}

      {report.isMock && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Sandbox report: this is sample data, not a real CIBIL report. Live bureau credentials and approval are required for real PAN-based data.
        </div>
      )}

      <div className="p-4 space-y-4">
        <dl className="grid sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Score', report.score ?? '—'],
            ['Band', report.scoreBand || '—'],
            ['Status', report.status || '—'],
            ['Report Ref', report.reportRefId || '—'],
            ['Report Date', report.reportDate || '—'],
            ['PAN', pan],
          ].map(([label, value]) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="font-semibold text-slate-800 mt-0.5 break-all">{value}</dd>
            </div>
          ))}
        </dl>

        {tiles.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-primary mb-2">Insights</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tiles.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <p className="text-[11px] text-slate-500">{label}</p>
                  <p className="text-sm font-bold text-primary mt-0.5 tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold text-primary mb-2">
            Accounts ({report.accounts?.length || 0})
          </h4>
          {report.accounts?.length ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Lender</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Limit</th>
                    <th className="px-3 py-2">Balance</th>
                    <th className="px-3 py-2">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.accounts.map((a, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2">{a.accountType}</td>
                      <td className="px-3 py-2">{a.lender}</td>
                      <td className="px-3 py-2">{a.status}</td>
                      <td className="px-3 py-2">{money(a.creditLimit)}</td>
                      <td className="px-3 py-2">{money(a.currentBalance)}</td>
                      <td className="px-3 py-2">{money(a.overdueAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No account records returned for this bureau.</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-primary mb-2">
            Enquiries ({report.enquiries?.length || 0})
          </h4>
          {report.enquiries?.length ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Lender</th>
                    <th className="px-3 py-2">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {report.enquiries.map((e, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2">{e.date}</td>
                      <td className="px-3 py-2">{e.lender}</td>
                      <td className="px-3 py-2">{e.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No enquiry records returned for this bureau.</p>
          )}
        </div>

        {report.disclaimer && (
          <p className="text-[11px] text-slate-400 leading-relaxed">{report.disclaimer}</p>
        )}
      </div>

        {qrPayment && (
          <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" onClick={() => setQrPayment(null)}>
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="cibil-qr-title"
              className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="cibil-qr-title" className="text-lg font-bold text-slate-900">Scan &amp; pay</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Scan with any UPI app to pay {formatInr(qrPayment.amount / 100)}.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close QR payment"
                  onClick={() => setQrPayment(null)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid min-h-56 place-items-center rounded-lg border border-slate-200 bg-white p-4">
                {qrPayment.status === 'paid' ? (
                  <p className="text-center text-sm font-semibold text-emerald-700">Payment received. Your report is unlocked.</p>
                ) : qrPayment.status === 'expired' ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-amber-800">This QR code has expired.</p>
                    <Button type="button" size="sm" className="mt-3" onClick={startQrPayment} disabled={qrCreating}>
                      Create a new QR code
                    </Button>
                  </div>
                ) : (
                  <img src={qrPayment.imageUrl} alt="UPI QR code for CIBIL report payment" className="h-52 w-52 object-contain" />
                )}
              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600" aria-live="polite">
                {qrPayment.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
                {qrPayment.status === 'pending' ? 'Waiting for payment confirmation…' : qrPayment.status === 'paid' ? 'Payment confirmed by Razorpay' : 'Generate a new QR code to try again'}
              </p>
              {qrPayment.status === 'pending' && qrPayment.expiresAt && (
                <p className="mt-1 text-center text-xs text-slate-500">
                  Expires {new Date(qrPayment.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
              {qrPayment.status === 'paid' && (
                <Button type="button" className="mt-4 w-full" onClick={() => setQrPayment(null)}>Done</Button>
              )}
            </section>
          </div>
        )}
    </div>
  )
}
