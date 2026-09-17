import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ScoreGauge } from '../home/CivilScoreChecker.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { BureauIcon, BureauTabLabel } from './BureauIcon.jsx'
import CreditReportPanel from './CreditReportPanel.jsx'
import {
  CREDIT_BUREAUS,
  bureauDisplayName,
  buildInlineReportFromResult,
  buildReportDownloadUrl,
  maskPan,
  selectBureauResult,
} from '../../lib/creditCheck.js'
import { useCreditCheckReport } from '../../hooks/useCreditCheck.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'

function mergeReports(inline, fetched) {
  if (!inline && !fetched) return null
  if (!fetched) return inline
  if (!inline) return fetched
  return {
    ...inline,
    ...fetched,
    isMock: Boolean(fetched.isMock || inline.isMock),
    disclaimer: fetched.disclaimer || inline.disclaimer,
    insights: fetched.insights || inline.insights,
    accounts: (fetched.accounts?.length ? fetched.accounts : inline.accounts) || [],
    enquiries: (fetched.enquiries?.length ? fetched.enquiries : inline.enquiries) || [],
    pan: fetched.pan || inline.pan,
    score: fetched.score ?? inline.score,
    scoreBand: fetched.scoreBand || inline.scoreBand,
    loginRequired: Boolean(fetched.loginRequired || inline.loginRequired),
  }
}

export default function CreditScoreCard({
  result,
  compact = false,
  onCheckAgain,
  showHistoryLink = true,
  defaultBureau,
  mobile,
  pan,
  onResultRefresh,
  onLoginRequired,
}) {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const loginPromptedRef = useRef(false)

  const available = result?.availableBureaus?.length
    ? result.availableBureaus
    : (result?.score != null || result?.pending)
      ? [String(result.provider || 'cibil').toLowerCase()]
      : []

  const initialBureau = defaultBureau
    || (available.includes('cibil') ? 'cibil' : available[0])
    || 'cibil'

  const [selectedBureau, setSelectedBureau] = useState(initialBureau)

  const active = useMemo(
    () => selectBureauResult(result, selectedBureau),
    [result, selectedBureau],
  )

  const isPending = Boolean(
    active?.pending
    || result?.pending
    || String(active?.status || result?.status || '').toLowerCase() === 'pending',
  )

  const checkId = active?.id || result?.id || result?.bureauScores?.[selectedBureau]?.id || null
  const inlineReport = useMemo(() => buildInlineReportFromResult(result), [result])
  const {
    data: fetchedReport,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useCreditCheckReport(checkId, {
    mobile,
    enabled: !compact && Boolean(checkId),
    refetchInterval: isPending ? 2000 : false,
  })

  const report = useMemo(
    () => mergeReports(inlineReport, fetchedReport),
    [inlineReport, fetchedReport],
  )

  const needsLogin = Boolean(
    !isAuthenticated && (
      result?.loginRequired
      || fetchedReport?.loginRequired
      || reportError?.needsLogin
      || reportError?.status === 401
      || reportError?.status === 403
    ),
  )

  // Full report requires auth → notify parent (close CIBIL modal) or open login
  useEffect(() => {
    if (!needsLogin || loginPromptedRef.current) return
    loginPromptedRef.current = true
    if (onLoginRequired) {
      onLoginRequired()
    } else {
      openLogin()
    }
  }, [needsLogin, onLoginRequired, openLogin])

  // After login, reload report
  useEffect(() => {
    if (!isAuthenticated || !checkId || compact) return
    loginPromptedRef.current = false
    refetchReport()
  }, [isAuthenticated, checkId, compact, refetchReport])

  // When pending check flips to success via report/detail poll, notify parent
  useEffect(() => {
    if (!isPending || !fetchedReport || fetchedReport.score == null) return
    if (String(fetchedReport.status || '').toLowerCase() === 'pending') return
    onResultRefresh?.()
  }, [isPending, fetchedReport, onResultRefresh])

  if (!result || (result.score == null && !available.length && !result.pending)) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="font-display font-bold text-primary">No credit score yet</p>
        <p className="text-sm text-slate-500 mt-1">Run a credit check to see your latest score and report here.</p>
        {onCheckAgain && (
          <Button type="button" className="mt-4" onClick={onCheckAgain}>
            Check my CIBIL
          </Button>
        )}
      </div>
    )
  }

  // Parent will close CIBIL modal and open login — don't keep scores UI visible
  if (needsLogin && onLoginRequired) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        Redirecting to sign in…
      </div>
    )
  }

  const display = active?.score != null ? active : result
  const providerLabel = `${bureauDisplayName(display.provider || selectedBureau)} Credit Score`
  const maskedPan = pan ? maskPan(pan) : report?.pan || null
  const apiDownloadUrl = buildReportDownloadUrl(checkId, { mobile, download: true })
    || (result.reportDownload
      ? `${result.reportDownload}${result.reportDownload.includes('?') ? '&' : '?'}download=1${mobile ? `&mobile=${String(mobile).replace(/\D/g, '')}` : ''}`
      : null)

  const bureauTabs = CREDIT_BUREAUS.filter((b) => {
    const entry = result.bureauScores?.[b.key]
    return entry?.score != null || entry?.pending || available.includes(b.key)
  })

  const tabsToShow = bureauTabs.length
    ? CREDIT_BUREAUS.filter((b) => {
        const entry = result.bureauScores?.[b.key]
        return entry != null || available.includes(b.key) || bureauTabs.some((t) => t.key === b.key)
      })
    : CREDIT_BUREAUS.filter((b) => available.includes(b.key) || String(result.provider).toLowerCase() === b.key)

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? 'p-5' : 'p-6'} space-y-4`}>
      {(result.isMock || report?.isMock) && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs font-medium text-amber-900">
          Sandbox mock — not live bureau. Sample data from MoneyTrend sandbox.
        </div>
      )}

      {result.rateLimited && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-900">
          {result.message
            || 'A credit check was already done recently for these details. Showing your latest saved scores.'}
        </div>
      )}

      {isPending && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 px-3 py-2.5 text-sm text-sky-800 flex items-start gap-2">
          <Loader2 className="w-4 h-4 animate-spin mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Credit check in progress</p>
            <p className="text-xs mt-0.5 text-sky-700">
              Status is PENDING. Scores and the full report will update automatically when the bureau responds (SUCCESS).
            </p>
          </div>
        </div>
      )}

      {tabsToShow.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tabsToShow.map((b) => {
            const entry = result.bureauScores?.[b.key]
            const hasScore = entry?.score != null
              || (String(result.provider).toUpperCase() === b.apiKey && result.score != null)
            const tabPending = entry?.pending || (isPending && selectedBureau === b.key && !hasScore)
            return (
              <button
                key={b.key}
                type="button"
                disabled={!hasScore && !entry && !tabPending}
                onClick={() => setSelectedBureau(b.key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-colors ${
                  selectedBureau === b.key
                    ? 'bg-secondary/10 text-secondary border-secondary/40'
                    : hasScore || tabPending
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-secondary/40'
                      : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                }`}
              >
                <BureauTabLabel bureau={b.apiKey} selected={selectedBureau === b.key} />
                {hasScore && (
                  <span className="font-bold tabular-nums">{entry?.score ?? result.score}</span>
                )}
                {!hasScore && tabPending && (
                  <span className="text-[10px] font-semibold uppercase text-sky-600">Pending</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {display.score == null ? (
        <div className={`rounded-xl border p-4 text-sm ${
          isPending
            ? 'bg-sky-50 border-sky-200 text-sky-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {isPending
            ? `${bureauDisplayName(selectedBureau)} score is still processing…`
            : `${bureauDisplayName(selectedBureau)} score is not available for this check.`}
        </div>
      ) : compact ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <BureauIcon bureau={display.provider || selectedBureau} className="w-10 h-10 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{providerLabel}</p>
              <p className="text-3xl font-display font-bold text-primary mt-1">{display.score}</p>
              <p className="text-sm font-semibold text-emerald-600">{display.scoreBand}</p>
            </div>
          </div>
          <ScoreGauge score={display.score} size="sm" gradientId={`dashCreditGauge-${selectedBureau}`} showNeedle={false} />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{providerLabel}</p>
            <h3 className="font-display font-bold text-2xl text-primary mt-1">{display.score}</h3>
            <Badge tone="green" className="mt-2">{display.scoreBand}</Badge>
            {maskedPan && (
              <p className="text-xs text-slate-500 mt-2">Report for PAN {maskedPan}</p>
            )}
          </div>
          <ScoreGauge score={display.score} size="md" gradientId={`creditResultGauge-${selectedBureau}`} showNeedle={false} animated />
        </div>
      )}

      {(display.score != null || isPending) && (
        <dl className={`grid ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-3 text-sm`}>
          <div className="p-3 rounded-xl bg-slate-50">
            <dt className="text-xs text-slate-500">Last checked</dt>
            <dd className="font-semibold text-slate-800 mt-0.5">{display.checkedAtLabel || result.checkedAtLabel}</dd>
          </div>
          {!compact && (
            <>
              <div className="p-3 rounded-xl bg-slate-50">
                <dt className="text-xs text-slate-500">Reference</dt>
                <dd className="font-semibold text-slate-800 mt-0.5 break-all">{display.referenceId || '—'}</dd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <dt className="text-xs text-slate-500">Provider</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{bureauDisplayName(display.provider)}</dd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <dt className="text-xs text-slate-500">Status</dt>
                <dd className="font-semibold text-slate-800 mt-0.5 capitalize">{display.status || result.status}</dd>
              </div>
            </>
          )}
        </dl>
      )}

      {needsLogin && !compact && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 px-3 py-3 text-sm text-sky-900 flex flex-wrap items-center justify-between gap-3">
          <p>Sign in to view the full credit report (accounts &amp; enquiries).</p>
          <Button type="button" size="sm" onClick={openLogin}>Sign in</Button>
        </div>
      )}

      {!compact && (
        <CreditReportPanel
          report={needsLogin && !isAuthenticated ? (report?.accounts?.length || report?.insights ? report : null) : report}
          loading={reportLoading && !report && !needsLogin}
          error={needsLogin ? '' : (reportError?.userMessage || reportError?.message || '')}
          maskedPan={maskedPan}
          onRetry={() => refetchReport()}
          onLogin={needsLogin ? openLogin : undefined}
          apiDownloadUrl={isAuthenticated ? apiDownloadUrl : null}
        />
      )}

      <div className="flex flex-wrap gap-3">
        {onCheckAgain && (
          <Button type="button" variant="outline" onClick={onCheckAgain}>Check again</Button>
        )}
        {showHistoryLink && (
          <Link to="/credit-score/history">
            <Button type="button" variant="outline">View history</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
