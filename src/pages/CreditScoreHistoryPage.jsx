import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useCreditCheckHistory } from '../hooks/useCreditCheck.js'

export default function CreditScoreHistoryPage() {
  const { data, isLoading, error } = useCreditCheckHistory()
  const items = data?.items ?? []

  return (
    <>
      <PageBanner
        {...getPageBanner('dashboard')}
        eyebrow="Credit Tools"
        title="Credit Score"
        highlight="History"
        subtitle="Previous credit checks for your account."
        breadcrumbs={[{ label: 'Credit Score', to: '/credit-score' }, { label: 'History' }]}
        stats={[]}
      />
      <PageSideLayout className="!max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-display font-bold text-2xl text-primary">Credit Check History</h1>
          <Link to="/credit-score">
            <Button size="sm">New check</Button>
          </Link>
        </div>

        {isLoading && (
          <Card hover={false} className="p-8 text-center text-sm text-slate-500">Loading history…</Card>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
            {error.message || 'Failed to load credit check history'}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <Card hover={false} className="p-10 text-center">
            <p className="font-display font-bold text-primary">No credit checks yet</p>
            <p className="text-sm text-slate-500 mt-1">Run your first secure credit check to see history here.</p>
            <Link to="/credit-score" className="inline-block mt-4">
              <Button>Check my CIBIL</Button>
            </Link>
          </Card>
        )}

        {items.length > 0 && (
          <Card hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id || item.referenceId} className="border-b border-slate-100">
                      <td className="py-3 px-4">{item.checkedAtLabel}</td>
                      <td className="py-3 px-4 font-medium">{item.provider}</td>
                      <td className="py-3 px-4 font-semibold text-primary">
                        {item.score != null ? item.score : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={item.status === 'completed' ? 'green' : 'slate'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 break-all">{item.referenceId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </PageSideLayout>
    </>
  )
}
