import { useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal.jsx'
import { useAdminDeposits, useAdminDeposit } from '../../hooks/useAdminTransactions.js'
import { depositDetailFields } from '../../../lib/adminTransactions.js'

export default function DepositsPage() {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, error, isFetched } = useAdminDeposits()
  const { data: detail } = useAdminDeposit(selectedId)

  return (
    <PageShell
      title="Deposits"
      breadcrumb={['Home', 'Transactions', 'Deposits']}
      description="Track all incoming deposit transactions."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load deposits'}
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'reference', label: 'ID' },
          { key: 'user', label: 'User' },
          { key: 'amount', label: 'Amount' },
          { key: 'method', label: 'Method' },
          { key: 'status', label: 'Status' },
          { key: 'date', label: 'Date' },
        ]}
        rows={data?.items ?? []}
        statusColumn="status"
        searchPlaceholder="Search deposits..."
        emptyTitle="No record found"
        emptyDescription="No deposit records are available from the server."
        actions={(row) => (
          <button
            type="button"
            onClick={() => setSelectedId(row.id)}
            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      <TransactionDetailModal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Deposit Details"
        description="Deposit transaction information"
        fields={depositDetailFields(detail)}
      />
    </PageShell>
  )
}
