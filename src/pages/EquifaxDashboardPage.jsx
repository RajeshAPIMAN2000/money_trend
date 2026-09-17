import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Loader2, RefreshCw, Shield } from 'lucide-react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import EquifaxEnrollForm from '../components/equifax/EquifaxEnrollForm.jsx'
import { BureauIcon } from '../components/credit/BureauIcon.jsx'
import { ScoreGauge } from '../components/home/CivilScoreChecker.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthModal } from '../context/AuthModalContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  useEquifaxEnrollment,
  useEnrollEquifax,
  useRequestEquifaxScore,
  useEquifaxCreditScore,
  useEquifaxScoreHistory,
  useEquifaxCreditReport,
  useEquifaxReportDetails,
  useEquifaxMonitoring,
  useEquifaxMonitoringAlert,
} from '../hooks/useEquifax.js'
import {
  buildEquifaxEnrollPayload,
  buildEquifaxScorePayload,
  EQUIFAX_ERROR_CODES,
  REPORT_SECTIONS,
} from '../lib/equifax.js'

function ErrorBanner({ error, onLogin, onEnroll }) {
  if (!error) return null
  const msg = error.userMessage || error.message || 'Something went wrong'
  const code = error.errorCode
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{msg}</p>
          {code && <p className="text-xs mt-1 text-amber-700">Code: {code}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {error.needsLogin && (
          <Button type="button" size="sm" onClick={onLogin}>Sign in</Button>
        )}
        {error.needsEnroll && (
          <Button type="button" size="sm" variant="outline" onClick={onEnroll}>Enroll first</Button>
        )}
      </div>
    </div>
  )
}

function ReportSectionPanel({ creditReportId, enrolled }) {
  const [section, setSection] = useState('summary')
  const detailsQuery = useEquifaxReportDetails({
    enabled: enrolled && Boolean(section),
    creditReportId,
    section,
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {REPORT_SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              section === s.key
                ? 'bg-secondary/10 text-secondary border-secondary/40'
                : 'bg-white text-slate-600 border-slate-200 hover:border-secondary/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {detailsQuery.isLoading && (
        <p className="text-sm text-slate-500 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading {section}…
        </p>
      )}
      <ErrorBanner error={detailsQuery.error} />
      {detailsQuery.data && (
        <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-x-auto max-h-72 text-slate-700">
          {JSON.stringify(detailsQuery.data.data, null, 2)}
        </pre>
      )}
    </div>
  )
}

function AlertDetail({ alertId, onClose }) {
  const query = useEquifaxMonitoringAlert(alertId, { enabled: Boolean(alertId) })
  if (!alertId) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-primary text-sm">Alert detail</h4>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>Close</Button>
      </div>
      {query.isLoading && (
        <p className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </p>
      )}
      <ErrorBanner error={query.error} />
      {query.data && (
        <>
          <p className="text-sm font-semibold text-slate-800">{query.data.type}</p>
          <p className="text-xs text-slate-500">{query.data.date}</p>
          {query.data.description && (
            <p className="text-sm text-slate-600">{query.data.description}</p>
          )}
        </>
      )}
    </div>
  )
}

export default function EquifaxDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const [enrollError, setEnrollError] = useState('')
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [scoreConsent, setScoreConsent] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  const enrollmentQuery = useEquifaxEnrollment({ enabled: isAuthenticated })
  const enrolled = Boolean(enrollmentQuery.data?.enrolled)

  const scoreQuery = useEquifaxCreditScore({ enabled: isAuthenticated && enrolled })
  const historyQuery = useEquifaxScoreHistory({ enabled: isAuthenticated && enrolled })
  const reportQuery = useEquifaxCreditReport({ enabled: isAuthenticated && enrolled })
  const monitoringQuery = useEquifaxMonitoring({ enabled: isAuthenticated && enrolled, sync: true })

  const enrollMutation = useEnrollEquifax()
  const requestScoreMutation = useRequestEquifaxScore()

  const configBlocked = useMemo(() => {
    if (enrollmentQuery.data?.configIncomplete) return true
    const errs = [enrollmentQuery.error, scoreQuery.error, reportQuery.error, monitoringQuery.error, enrollMutation.error]
    return errs.some((e) =>
      e?.configIncomplete
      || e?.errorCode === EQUIFAX_ERROR_CODES.CONFIG_INCOMPLETE
      || e?.errorCode === EQUIFAX_ERROR_CODES.AUTH_DOCS_REQUIRED
      || e?.errorCode === EQUIFAX_ERROR_CODES.DISABLED
      || e?.errorCode === EQUIFAX_ERROR_CODES.AUTH_FAILED
      || e?.status === 503
      || e?.userMessage === 'Equifax not configured yet',
    )
  }, [enrollmentQuery.data, enrollmentQuery.error, scoreQuery.error, reportQuery.error, monitoringQuery.error, enrollMutation.error])

  const handleEnroll = async (formValues) => {
    setEnrollError('')
    try {
      const payload = buildEquifaxEnrollPayload(formValues)
      const result = await enrollMutation.mutateAsync(payload)
      showToast(result.message || 'Equifax enrollment successful')
      setShowEnrollForm(false)
    } catch (err) {
      setEnrollError(err.userMessage || 'Enrollment failed')
      if (err.needsLogin) openLogin()
      showToast(err.userMessage || 'Enrollment failed')
    }
  }

  const handleRequestScore = async () => {
    if (!scoreConsent) {
      showToast('Please accept consent before requesting a score')
      return
    }
    try {
      const parsed = await requestScoreMutation.mutateAsync(buildEquifaxScorePayload({ consent: true }))
      showToast(parsed.score != null ? `Score updated: ${parsed.score}` : 'Score request completed')
      scoreQuery.refetch()
      historyQuery.refetch()
    } catch (err) {
      showToast(err.userMessage || 'Unable to request score')
      if (err.needsLogin) openLogin()
      if (err.needsEnroll) setShowEnrollForm(true)
    }
  }

  const score = scoreQuery.data
  const report = reportQuery.data

  return (
    <>
      <PageBanner
        {...getPageBanner('dashboard')}
        eyebrow="Credit Tools"
        title="Equifax"
        highlight="Dashboard"
        subtitle="Enroll, score, report & monitoring via MoneyTrend — never Equifax directly."
        breadcrumbs={[{ label: 'Equifax' }]}
        stats={[]}
      />

      <PageSideLayout className="!max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-primary">Equifax Credit</h1>
            <p className="text-sm text-slate-500 mt-1">
              Public CIBIL checks stay on Home / Products.{' '}
              <Link to="/credit-score" className="text-secondary font-semibold hover:underline">Open CIBIL check</Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                enrollmentQuery.refetch()
                if (enrolled) {
                  scoreQuery.refetch()
                  reportQuery.refetch()
                  monitoringQuery.refetch()
                }
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </span>
            </Button>
            <Link to="/products#cibil-score">
              <Button type="button" size="sm" variant="outline">CIBIL (Products)</Button>
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <Card hover={false} className="p-6 text-center space-y-3">
            <Shield className="w-8 h-8 text-secondary mx-auto" />
            <p className="font-display font-bold text-primary">Sign in required</p>
            <p className="text-sm text-slate-500">
              Equifax enrollment uses your MoneyTrend access token. Login with email OTP first.
            </p>
            <Button type="button" onClick={openLogin}>Sign in</Button>
          </Card>
        )}

        {configBlocked && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Equifax not configured yet</p>
            <p className="text-xs mt-1 text-amber-800">
              POST /enrollment returned 503 — the MoneyTrend backend needs Equifax sandbox credentials / docs.
              This cannot be fixed from the frontend. Public CIBIL checks via Home/Products still work with{' '}
              <code className="text-[11px]">POST /api/credit-check</code>.
            </p>
          </div>
        )}

        {isAuthenticated && (
          <>
            <Card hover={false} className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BureauIcon bureau="EQUIFAX" className="w-12 h-12" />
                  <div>
                    <h2 className="font-display font-bold text-lg text-primary">Enrollment</h2>
                    <p className="text-xs text-slate-500 mt-0.5">POST /api/credit-check/enrollment</p>
                  </div>
                </div>
                {enrollmentQuery.data?.enrolled ? (
                  <Badge tone="green">{enrollmentQuery.data.status || 'enrolled'}</Badge>
                ) : (
                  <Badge tone="slate">not enrolled</Badge>
                )}
              </div>

              {enrollmentQuery.isLoading && (
                <p className="text-sm text-slate-500 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking enrollment…
                </p>
              )}

              <ErrorBanner
                error={enrollmentQuery.error}
                onLogin={openLogin}
                onEnroll={() => setShowEnrollForm(true)}
              />

              {enrollMutation.error?.configIncomplete || enrollMutation.error?.status === 503 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  {enrollMutation.error.userMessage || 'Equifax not configured yet. Backend Equifax sandbox credentials are required.'}
                </div>
              ) : null}
              {enrolled && !showEnrollForm && (
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <dt className="text-xs text-slate-500">Enrollment ID</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5 break-all">
                      {enrollmentQuery.data.enrollmentId || '—'}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <dt className="text-xs text-slate-500">Last synced</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {enrollmentQuery.data.lastSyncedAtLabel}
                    </dd>
                  </div>
                </dl>
              )}

              {(!enrolled || showEnrollForm) && (
                <EquifaxEnrollForm
                  loading={enrollMutation.isPending}
                  error={enrollError}
                  defaultValues={{
                    fullName: user?.full_name || user?.name || '',
                    mobile: user?.phone || '',
                    dateOfBirth: user?.date_of_birth || '',
                  }}
                  onSubmit={handleEnroll}
                />
              )}

              {enrolled && !showEnrollForm && (
                <Button type="button" size="sm" variant="outline" onClick={() => setShowEnrollForm(true)}>
                  Update enrollment
                </Button>
              )}
            </Card>

            {enrolled && (
              <Card hover={false} className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-lg text-primary">Credit score</h2>
                  <div className="flex flex-col items-end gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={scoreConsent}
                        onChange={(e) => setScoreConsent(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Consent to request score (v1.0)
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      disabled={requestScoreMutation.isPending || !scoreConsent}
                      onClick={handleRequestScore}
                    >
                      {requestScoreMutation.isPending ? 'Requesting…' : 'Request / refresh score'}
                    </Button>
                  </div>
                </div>

                <ErrorBanner
                  error={scoreQuery.error || requestScoreMutation.error}
                  onLogin={openLogin}
                  onEnroll={() => setShowEnrollForm(true)}
                />

                {scoreQuery.isLoading && (
                  <p className="text-sm text-slate-500 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading latest score…
                  </p>
                )}

                {score && (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {score.featureName || 'Equifax Score'}
                      </p>
                      <p className="text-3xl font-display font-bold text-primary mt-1">
                        {score.score != null ? score.score : '—'}
                      </p>
                      {score.scoreBand && <Badge tone="green" className="mt-2">{score.scoreBand}</Badge>}
                      <p className="text-xs text-slate-500 mt-2">As of {score.checkedAtLabel}</p>
                      {score.creditScoreId && (
                        <p className="text-[11px] text-slate-400 mt-1">ID: {score.creditScoreId}</p>
                      )}
                    </div>
                    {score.score != null && (
                      <ScoreGauge score={score.score} size="md" gradientId="equifaxDashGauge" showNeedle={false} animated />
                    )}
                  </div>
                )}

                {historyQuery.data?.items?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2">Score history</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 text-left">
                          <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Score</th>
                            <th className="px-3 py-2">Band</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyQuery.data.items.map((row, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="px-3 py-2">{row.checkedAtLabel}</td>
                              <td className="px-3 py-2 font-semibold">{row.score ?? '—'}</td>
                              <td className="px-3 py-2">{row.scoreBand || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {enrolled && (
              <Card hover={false} className="p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-primary">Credit report</h2>
                <ErrorBanner
                  error={reportQuery.error}
                  onLogin={openLogin}
                  onEnroll={() => setShowEnrollForm(true)}
                />
                {reportQuery.isLoading && (
                  <p className="text-sm text-slate-500 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading report…
                  </p>
                )}
                {report?.summary && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm text-slate-700">
                    {typeof report.summary === 'string'
                      ? report.summary
                      : (
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(report.summary, null, 2)}</pre>
                      )}
                  </div>
                )}
                <ReportSectionPanel
                  enrolled={enrolled}
                  creditReportId={report?.creditReportId}
                />
                {report?.disclaimer && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">{report.disclaimer}</p>
                )}
              </Card>
            )}

            {enrolled && (
              <Card hover={false} className="p-6 space-y-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-primary">Credit monitoring</h2>
                  <p className="text-xs text-slate-500 mt-0.5">GET /api/credit-check/monitoring?sync=true</p>
                </div>

                <ErrorBanner
                  error={monitoringQuery.error}
                  onLogin={openLogin}
                  onEnroll={() => setShowEnrollForm(true)}
                />

                {monitoringQuery.isLoading && (
                  <p className="text-sm text-slate-500 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Syncing alerts…
                  </p>
                )}

                {monitoringQuery.data?.alerts?.length > 0 ? (
                  <ul className="space-y-2">
                    {monitoringQuery.data.alerts.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedAlertId(c.id)}
                          className="w-full text-left rounded-xl border border-slate-200 px-3 py-2.5 text-sm hover:border-secondary/40 transition-colors"
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="font-semibold text-primary">{c.type}</span>
                            <span className="text-xs text-slate-500">{c.date}</span>
                          </div>
                          {c.description && (
                            <p className="text-slate-600 mt-1 text-xs">{c.description}</p>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : !monitoringQuery.isLoading ? (
                  <p className="text-xs text-slate-500">No monitoring alerts yet.</p>
                ) : null}

                <AlertDetail alertId={selectedAlertId} onClose={() => setSelectedAlertId(null)} />
              </Card>
            )}
          </>
        )}
      </PageSideLayout>
    </>
  )
}
