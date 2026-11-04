import { Eye } from 'lucide-react'
import { useState } from 'react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import { useAdminCreditChecks } from '../../../hooks/useCreditCheck.js'

export default function AdminCreditChecksPage() {
  const { data, isLoading, error, isFetched } = useAdminCreditChecks()
  const [selected, setSelected] = useState(null)
  const rows = (data?.items ?? []).map((item) => ({
    id: item.id || item.referenceId,
    date: item.checkedAtLabel,
    provider: item.provider,
    score: item.score != null ? String(item.score) : '—',
    band: item.scoreBand || '—',
    status: item.status,
    reference: item.referenceId || '—',
    raw: item,
  }))

  return (
    <PageShell
      title="Credit Reports"
      breadcrumb={['Home', 'Reports & Analytics', 'Credit Reports']}
      description="All user credit-check results returned by the backend credit service."
      stats={isFetched ? [
        { label: 'Total Checks', value: String(data?.count ?? rows.length) },
        { label: 'With Score', value: String(rows.filter((r) => r.score !== '—').length) },
        { label: 'Completed', value: String(rows.filter((r) => r.status === 'completed').length) },
        { label: 'No Match', value: String(rows.filter((r) => r.status.includes('no') || r.status.includes('not')).length) },
      ] : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load credit checks'}
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'provider', label: 'Provider' },
          { key: 'score', label: 'Score' },
          { key: 'band', label: 'Band' },
          { key: 'status', label: 'Status' },
          { key: 'reference', label: 'Reference' },
        ]}
        rows={rows}
        statusColumn="status"
        searchPlaceholder="Search credit checks..."
        emptyTitle="No record found"
        emptyDescription="No credit-check records are available from the server."
        actions={(row) => (
          <button
            type="button"
            onClick={() => setSelected(row.raw)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Credit Check Details"
        description="Authorized fields from the backend only"
        footer={<AdminButton variant="outline" onClick={() => setSelected(null)}>Close</AdminButton>}
      >
        {selected && (
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Provider', selected.provider],
              ['Score', selected.score != null ? String(selected.score) : '—'],
              ['Band', selected.scoreBand],
              ['Status', selected.status],
              ['Reference', selected.referenceId],
              ['Checked', selected.checkedAtLabel],
            ].map(([label, value]) => (
              <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{value || '—'}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <AdminBadge>{selected.provider}</AdminBadge>
            </div>
          </dl>
        )}
      </AdminModal>
    </PageShell>
  )
}
