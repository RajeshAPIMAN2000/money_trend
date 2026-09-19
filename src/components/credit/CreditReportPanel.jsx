import { useState } from 'react'
import { Download, FileText, Loader2, Lock } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { BureauIcon } from './BureauIcon.jsx'
import { bureauDisplayName, parseCreditReport } from '../../lib/creditCheck.js'
import { downloadCreditReportPdf } from '../../lib/creditReportPdf.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { usePaymentModal } from '../../context/PaymentModalContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useCibilUnlock, useDummyPaymentConfig } from '../../hooks/useDummyPayment.js'
import {
  CIBIL_REPORT_FEE,
  PAYMENT_PURPOSES,
  formatInr,
} from '../../lib/dummyPayment.js'
import { api } from '../../lib/api.js'

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
  const { openPayment } = usePaymentModal()
  const { showToast } = useToast()
  const unlockQuery = useCibilUnlock({ enabled: isAuthenticated })
  const configQuery = useDummyPaymentConfig({ enabled: isAuthenticated })
  const [downloading, setDownloading] = useState(false)

  const unlocked = Boolean(unlockQuery.data?.unlocked)
  const unlockReady = !isAuthenticated || unlockQuery.isFetched || unlockQuery.isError
  const fee = configQuery.data?.fees?.cibil_report ?? CIBIL_REPORT_FEE

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

  const doDownloadPdf = async (reportData = report) => {
    downloadCreditReportPdf(reportData, { maskedPan: pan })
  }

  const fetchLatestAndDownload = async () => {
    setDownloading(true)
    try {
      const latest = await api.getCreditCheckReportLatest()
      const parsed = parseCreditReport(latest)
      await doDownloadPdf(parsed?.score != null || parsed?.accounts?.length ? parsed : report)
      onUnlocked?.(parsed || report)
    } catch {
      await doDownloadPdf(report)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadClick = () => {
    if (!isAuthenticated) {
      openLogin()
      showToast('Please sign in to download your CIBIL report.')
      return
    }
    if (unlocked) {
      fetchLatestAndDownload()
      return
    }
    openPayment({
      purpose: PAYMENT_PURPOSES.CIBIL_REPORT,
      title: 'Unlock CIBIL Report',
      description: 'CIBIL report download unlock',
      onSuccess: async () => {
        await unlockQuery.refetch()
        showToast('Report unlocked — downloading…')
        await fetchLatestAndDownload()
      },
    })
  }

  const handleBureauFileClick = (e) => {
    if (!apiDownloadUrl) return
    if (!isAuthenticated) {
      e.preventDefault()
      openLogin()
      return
    }
    if (!unlocked) {
      e.preventDefault()
      openPayment({
        purpose: PAYMENT_PURPOSES.CIBIL_REPORT,
        title: 'Unlock CIBIL Report',
        description: 'CIBIL report download unlock',
        onSuccess: async () => {
          await unlockQuery.refetch()
          window.open(apiDownloadUrl, '_blank', 'noopener,noreferrer')
        },
      })
    }
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
          {apiDownloadUrl && (
            <a href={unlocked ? apiDownloadUrl : undefined} target="_blank" rel="noreferrer" onClick={handleBureauFileClick}>
              <Button type="button" size="sm" variant="outline">
                <span className="inline-flex items-center gap-1.5">
                  {unlocked ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Bureau file
                </span>
              </Button>
            </a>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleDownloadClick}
            disabled={downloading || !unlockReady}
          >
            <span className="inline-flex items-center gap-1.5">
              {downloading || !unlockReady ? (
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
          Full PDF download requires a one-time unlock payment of {formatInr(fee)} (dummy gateway).
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
    </div>
  )
}
