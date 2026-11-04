import { useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal.jsx'
import { useAdminTransactions, useAdminTransaction } from '../../hooks/useAdminTransactions.js'
import { transactionDetailFields } from '../../../lib/adminTransactions.js'

export default function TransactionsPage() {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, error, isFetched } = useAdminTransactions()
  const { data: detail } = useAdminTransaction(selectedId)

  return (
    <PageShell
      title="Transaction History"
      breadcrumb={['Home', 'Transactions', 'Transaction History']}
      description="Complete transaction log across all modules."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load transactions'}
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'reference', label: 'TXN ID' },
          { key: 'user', label: 'User' },
          { key: 'type', label: 'Type' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
          { key: 'date', label: 'Date' },
        ]}
        rows={data?.items ?? []}
        statusColumn="status"
        searchPlaceholder="Search transactions..."
        emptyTitle="No record found"
        emptyDescription="No transaction records are available from the server."
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
        title="Transaction Details"
        description="Transaction record information"
        fields={transactionDetailFields(detail)}
      />
    </PageShell>
  )
}
