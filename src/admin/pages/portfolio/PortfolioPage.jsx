import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import PortfolioChartsPanel from '../../components/investments/PortfolioChartsPanel.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'
import { useAdminUsers } from '../../hooks/useAdminUsers.js'
import { useAdminUserPortfolio } from '../../hooks/useAdminInvestments.js'
import { buildPortfolioListRows } from '../../../lib/adminInvestments.js'

function DetailItem({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{value || '—'}</dd>
    </div>
  )
}

export default function PortfolioPage() {
  const [selectedUserId, setSelectedUserId] = useState(null)
  const { data, isLoading, error } = useAdminUsers()
  const users = data?.users ?? []
  const rows = useMemo(() => buildPortfolioListRows(users), [users])
  const { data: portfolio, isLoading: portfolioLoading } = useAdminUserPortfolio(selectedUserId)

  const stats = [
    { label: 'Total Users', value: String(users.length) },
    { label: 'With KYC Approved', value: String(users.filter((u) => u.kycStatusLabel === 'Approved').length) },
    { label: 'Pending KYC', value: String(users.filter((u) => u.kycStatusLabel === 'Pending').length) },
    { label: 'Portfolios', value: String(users.length) },
  ]

  return (
    <PageShell
      title="Portfolio Management"
      breadcrumb={['Home', 'Investments', 'Portfolio']}
      description="Overview of user portfolios and asset distribution."
      stats={stats}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load users'}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading portfolios...</div>
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'User' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'kyc', label: 'KYC Status' },
            { key: 'joined', label: 'Joined' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
          avatarColumn="name"
          statusColumn="status"
          searchPlaceholder="Search portfolios..."
          actions={(row) => (
            <button
              type="button"
              onClick={() => setSelectedUserId(row.userId)}
              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
              title="View portfolio"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        />
      )}

      <AdminModal
        open={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
        wide
        title={portfolio ? `Portfolio — ${portfolio.user.name}` : 'Portfolio Details'}
        description="User portfolio with allocation and value trend"
        footer={<AdminButton variant="outline" onClick={() => setSelectedUserId(null)}>Close</AdminButton>}
      >
        {portfolioLoading ? (
          <div className="py-8 text-center text-slate-500">Loading portfolio...</div>
        ) : portfolio ? (
          <div className="space-y-5">
            <PortfolioChartsPanel charts={portfolio.charts} />

            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <DetailItem label="User" value={portfolio.user.name} />
              <DetailItem label="Email" value={portfolio.user.email} />
              <DetailItem label="Phone" value={portfolio.user.phone} />
              <DetailItem label="Member Since" value={portfolio.user.memberSince} />
              <DetailItem label="Portfolio Value" value={portfolio.summary.portfolioValue} />
              <DetailItem label="Wallet Balance" value={portfolio.summary.walletBalance} />
              <DetailItem label="FD Invested" value={portfolio.summary.fdInvested} />
              <DetailItem label="RD Committed" value={portfolio.summary.rdCommitted} />
              <DetailItem label="Active FDs" value={String(portfolio.summary.activeFdCount)} />
              <DetailItem label="Active RDs" value={String(portfolio.summary.activeRdCount)} />
            </dl>

            {portfolio.fixedDeposits.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Fixed Deposits</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {portfolio.fixedDeposits.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span>{item.provider}</span>
                      <span className="font-medium">{item.amount}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {portfolio.recurringDeposits.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Recurring Deposits</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {portfolio.recurringDeposits.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span>{item.bank}</span>
                      <span className="font-medium">{item.monthly}/mo</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">Portfolio not found</div>
        )}
      </AdminModal>
    </PageShell>
  )
}
