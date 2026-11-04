import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import CreditCheckForm from '../components/credit/CreditCheckForm.jsx'
import CreditScoreCard from '../components/credit/CreditScoreCard.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useLatestCreditCheck, useSubmitCreditCheck } from '../hooks/useCreditCheck.js'
import { buildCreditCheckPayload } from '../lib/creditCheck.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthModal } from '../context/AuthModalContext.jsx'

const MOBILE_KEY = 'moneytrend-credit-mobile'

export default function CreditScorePage() {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const [mobile, setMobile] = useState(() => localStorage.getItem(MOBILE_KEY) || '')
  const [pan, setPan] = useState(() => localStorage.getItem('moneytrend-credit-pan') || '')
  const { data: latest, isLoading: latestLoading, refetch } = useLatestCreditCheck({
    enabled: isAuthenticated || Boolean(mobile),
    mobile: isAuthenticated ? undefined : mobile,
    refetchInterval: (query) => {
      const data = query.state.data
      return data?.pending ? 2000 : false
    },
  })
  const submitMutation = useSubmitCreditCheck()
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState('auto') // auto | form | result

  useEffect(() => {
    if (!latest) return
    if (mode === 'result' || mode === 'auto') {
      setResult(latest)
      if (latest.score != null || latest.pending || latest.availableBureaus?.length) {
        setMode('result')
      }
    }
  }, [latest])

  const showForm = mode === 'form' || (!latest && !result && mode === 'auto')

  const handleSubmit = async (formValues) => {
    setError('')
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
      if (parsed.noMatch || (parsed.score == null && !parsed.availableBureaus?.length && !parsed.pending)) {
        setError('Credit information could not be matched for the details provided.')
        setMode('form')
        return
      }
      setResult(parsed)
      setMode('result')
      showToast(
        parsed.rateLimited
          ? (parsed.message || 'Recent check found — showing your latest scores.')
          : parsed.pending
            ? 'Credit check started — monitoring until SUCCESS…'
            : 'Credit check completed — CIBIL, Experian & Equifax where available.',
      )
      if (parsed.loginRequired && !isAuthenticated) {
        openLogin()
      }
      refetch()
    } catch (err) {
      if (err?.status === 401 || err?.status === 403 || err?.needsLogin) {
        openLogin()
      }
      setError(err.userMessage || 'Unable to complete the credit check.')
    }
  }

  const display = result || latest || null

  return (
    <>
      <PageBanner
        {...getPageBanner('dashboard')}
        eyebrow="Credit Tools"
        title="Credit"
        highlight="Score"
        subtitle="Check CIBIL, Experian and Equifax securely — login optional."
        breadcrumbs={[{ label: 'Credit Score' }]}
        stats={[]}
      />
      <PageSideLayout className="!max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-primary">CIBIL Score Check</h1>
            <p className="text-sm text-slate-500 mt-1">
              Runs via MoneyTrend API only. PENDING checks auto-refresh until SUCCESS.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/equifax">
              <Button variant="outline" size="sm">Equifax</Button>
            </Link>
            {isAuthenticated && (
              <Link to="/credit-score/history">
                <Button variant="outline" size="sm">History</Button>
              </Link>
            )}
          </div>
        </div>

        {latestLoading && !display && (
          <Card hover={false} className="p-8 text-center text-sm text-slate-500">Loading your latest scores…</Card>
        )}

        {!showForm && display && (
          <div className="space-y-4">
            <CreditScoreCard
              key={display.id || display.referenceId || 'latest'}
              result={display}
              mobile={mobile}
              pan={pan}
              showHistoryLink={isAuthenticated}
              onCheckAgain={() => { setMode('form'); setError(''); setResult(null) }}
              onResultRefresh={() => refetch()}
            />
          </div>
        )}

        {showForm && (
          <Card hover={false} className="p-6">
            <CreditCheckForm
              onSubmit={handleSubmit}
              loading={submitMutation.isPending}
              error={error}
            />
          </Card>
        )}
      </PageSideLayout>
    </>
  )
}
