import { useState } from 'react'
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

export default function CreditScorePage() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { data: latest, isLoading: latestLoading, refetch } = useLatestCreditCheck(isAuthenticated)
  const submitMutation = useSubmitCreditCheck()
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState('auto') // auto | form | result

  const showForm = mode === 'form' || (!latest && !result && mode === 'auto')

  const handleSubmit = async (formValues) => {
    setError('')
    try {
      const parsed = await submitMutation.mutateAsync(buildCreditCheckPayload(formValues))
      if (parsed.noMatch || parsed.score == null) {
        setError('Credit information could not be matched for the details provided.')
        setMode('form')
        return
      }
      setResult(parsed)
      setMode('result')
      showToast('Credit check completed successfully.')
      if (isAuthenticated) refetch()
    } catch (err) {
      setError(err.userMessage || 'Unable to complete the credit check.')
    }
  }

  const display = result || (isAuthenticated ? latest : null)

  return (
    <>
      <PageBanner
        {...getPageBanner('dashboard')}
        eyebrow="Credit Tools"
        title="Credit"
        highlight="Score"
        subtitle="Check your credit score securely — no login required."
        breadcrumbs={[{ label: 'Credit Score' }]}
        stats={[]}
      />
      <PageSideLayout className="!max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-primary">Credit Score Check</h1>
            <p className="text-sm text-slate-500 mt-1">
              No login or OTP needed. Requests go only to MoneyTrend servers.
            </p>
          </div>
          {isAuthenticated && (
            <Link to="/credit-score/history">
              <Button variant="outline" size="sm">History</Button>
            </Link>
          )}
        </div>

        {isAuthenticated && latestLoading && !display && (
          <Card hover={false} className="p-8 text-center text-sm text-slate-500">Loading your latest score…</Card>
        )}

        {!showForm && display && (
          <div className="space-y-4">
            <CreditScoreCard
              result={display}
              showHistoryLink={isAuthenticated}
              onCheckAgain={() => { setMode('form'); setError(''); setResult(null) }}
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
