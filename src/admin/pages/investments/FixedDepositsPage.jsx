import { useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import InvestmentChartsPanel from '../../components/investments/InvestmentChartsPanel.jsx'
import InvestmentDetailModal from '../../components/investments/InvestmentDetailModal.jsx'
import { useAdminFixedDeposits, useAdminFixedDeposit, useAdminFundPerformance, useAdminAssetAllocation } from '../../hooks/useAdminInvestments.js'

export default function FixedDepositsPage() {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, error, isFetched } = useAdminFixedDeposits()
  const { data: performance, isLoading: performanceLoading } = useAdminFundPerformance('FD')
  const { data: allocationData, isLoading: allocationLoading } = useAdminAssetAllocation('FD')
  const { data: detail } = useAdminFixedDeposit(selectedId)
  const chartsLoading = performanceLoading || allocationLoading

  return (
    <PageShell
      title="Fixed Deposits"
      breadcrumb={['Home', 'Investments', 'Fixed Deposits']}
      description="Manage FD products, rates, and bookings."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load fixed deposits'}
        </div>
      )}

      {chartsLoading ? (
        <div className="h-[280px] mb-6 rounded-xl bg-slate-50 dark:bg-slate-900 animate-pulse" />
      ) : (
        <InvestmentChartsPanel performance={performance} allocationData={allocationData} productType="FD" />
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'user', label: 'User' },
          { key: 'provider', label: 'Bank/NBFC' },
          { key: 'amount', label: 'Amount' },
          { key: 'rate', label: 'Rate' },
          { key: 'tenure', label: 'Tenure' },
          { key: 'status', label: 'Status' },
        ]}
        rows={data?.items ?? []}
        statusColumn="status"
        searchPlaceholder="Search fixed deposits..."
        emptyTitle="No record found"
        emptyDescription="No fixed deposit records are available from the server."
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

      <InvestmentDetailModal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Fixed Deposit Details"
        item={detail}
        type="FD"
      />
    </PageShell>
  )
}
