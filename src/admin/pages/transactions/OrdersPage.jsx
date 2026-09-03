import { useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal.jsx'
import { useAdminOrders, useAdminOrder } from '../../hooks/useAdminTransactions.js'
import { orderDetailFields } from '../../../lib/adminTransactions.js'

export default function OrdersPage() {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, error, isFetched } = useAdminOrders()
  const { data: detail } = useAdminOrder(selectedId)

  return (
    <PageShell
      title="Orders"
      breadcrumb={['Home', 'Transactions', 'Orders']}
      description="View and manage all investment orders."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load orders'}
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'reference', label: 'Order ID' },
          { key: 'user', label: 'User' },
          { key: 'type', label: 'Type' },
          { key: 'instrument', label: 'Instrument' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
        ]}
        rows={data?.items ?? []}
        statusColumn="status"
        searchPlaceholder="Search orders..."
        emptyTitle="No record found"
        emptyDescription="No order records are available from the server."
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
        title="Order Details"
        description="Investment order information"
        fields={orderDetailFields(detail)}
      />
    </PageShell>
  )
}
