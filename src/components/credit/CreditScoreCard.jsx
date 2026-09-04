import { Link } from 'react-router-dom'
import { ScoreGauge } from '../home/CivilScoreChecker.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'

export default function CreditScoreCard({
  result,
  compact = false,
  onCheckAgain,
  showHistoryLink = true,
}) {
  if (!result || result.score == null) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="font-display font-bold text-primary">No credit score yet</p>
        <p className="text-sm text-slate-500 mt-1">Run a credit check to see your latest score here.</p>
        {onCheckAgain && (
          <Button type="button" className="mt-4" onClick={onCheckAgain}>
            Check my CIBIL
          </Button>
        )}
      </div>
    )
  }

  const providerLabel = result.provider === 'EXPERIAN'
    ? 'Experian Credit Score'
    : result.provider
      ? `${result.provider} Credit Score`
      : 'Credit Score'

  if (compact) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{providerLabel}</p>
            <p className="text-3xl font-display font-bold text-primary mt-1">{result.score}</p>
            <p className="text-sm font-semibold text-emerald-600">{result.scoreBand}</p>
          </div>
          <ScoreGauge score={result.score} size="sm" gradientId="dashCreditGauge" showNeedle={false} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Last checked: {result.checkedAtLabel}</span>
          {result.referenceId && <span>· Ref: {result.referenceId}</span>}
        </div>
        {showHistoryLink && (
          <Link to="/credit-score/history" className="inline-block mt-3 text-sm font-semibold text-secondary hover:underline">
            View history →
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{providerLabel}</p>
          <h3 className="font-display font-bold text-2xl text-primary mt-1">{result.score}</h3>
          <Badge tone="green" className="mt-2">{result.scoreBand}</Badge>
        </div>
        <ScoreGauge score={result.score} size="md" gradientId="creditResultGauge" showNeedle={false} animated />
      </div>

      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-xl bg-slate-50">
          <dt className="text-xs text-slate-500">Last checked</dt>
          <dd className="font-semibold text-slate-800 mt-0.5">{result.checkedAtLabel}</dd>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <dt className="text-xs text-slate-500">Reference</dt>
          <dd className="font-semibold text-slate-800 mt-0.5 break-all">{result.referenceId || '—'}</dd>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <dt className="text-xs text-slate-500">Provider</dt>
          <dd className="font-semibold text-slate-800 mt-0.5">{result.provider}</dd>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <dt className="text-xs text-slate-500">Status</dt>
          <dd className="font-semibold text-slate-800 mt-0.5 capitalize">{result.status}</dd>
        </div>
      </dl>

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
