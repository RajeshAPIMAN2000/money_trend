import { useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal.jsx'
import { useAdminWithdrawals, useAdminWithdrawal } from '../../hooks/useAdminTransactions.js'
import { withdrawalDetailFields } from '../../../lib/adminTransactions.js'

export default function WithdrawalsPage() {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, error, isFetched } = useAdminWithdrawals()
  const { data: detail } = useAdminWithdrawal(selectedId)

  return (
    <PageShell
      title="Withdrawals"
      breadcrumb={['Home', 'Transactions', 'Withdrawals']}
      description="Manage withdrawal requests and payouts."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load withdrawals'}
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'reference', label: 'ID' },
          { key: 'user', label: 'User' },
          { key: 'amount', label: 'Amount' },
          { key: 'bank', label: 'Bank' },
          { key: 'status', label: 'Status' },
          { key: 'requested', label: 'Requested' },
        ]}
        rows={data?.items ?? []}
        statusColumn="status"
        searchPlaceholder="Search withdrawals..."
        emptyTitle="No record found"
        emptyDescription="No withdrawal records are available from the server."
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
        title="Withdrawal Details"
        description="Withdrawal request information"
        fields={withdrawalDetailFields(detail)}
      />
    </PageShell>
  )
}
