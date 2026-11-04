import { useState } from 'react'
import { Eye, RefreshCw, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api.js'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import Pagination from '../../components/shared/Pagination.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import {
  AdminTable,
  AdminTableHead,
  AdminTableHeader,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
} from '../../components/ui/AdminTable.jsx'

const PAYMENT_STATUSES = [
  'created',
  'pending',
  'authorized',
  'success',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
]
const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected']

function displayValue(value) {
  if (value == null || value === '') return '—'
  if (value instanceof Date) return value.toLocaleString('en-IN')
  return String(value)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatAmount(paise, currency = 'INR') {
  const amount = Number(paise)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: String(currency || 'INR').toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function badgeTone(status) {
  if (['success', 'verified'].includes(String(status).toLowerCase())) return 'success'
  if (['created', 'pending', 'authorized'].includes(String(status).toLowerCase())) return 'warning'
  if (['failed', 'cancelled', 'rejected'].includes(String(status).toLowerCase())) return 'danger'
  if (['refunded', 'partially_refunded'].includes(String(status).toLowerCase())) return 'info'
  return 'default'
}

function StatusBadge({ status }) {
  const value = String(status || 'unknown').replace(/_/g, ' ')
  return <AdminBadge tone={badgeTone(status)} className="capitalize">{value}</AdminBadge>
}

function DetailField({ label, value, wide = false }) {
  return (
    <div className={`min-w-0 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-white">
        {displayValue(value)}
      </dd>
    </div>
  )
}

export default function CivilCheckerPaymentsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('')
  const [selected, setSelected] = useState(null)

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'civil-score-payments', page, search, paymentStatus, verificationStatus],
    queryFn: async () => {
      const response = await api.getAdminCivilScorePayments({
        page,
        page_size: 25,
        search,
        payment_status: paymentStatus,
        verification_status: verificationStatus,
      })
      return response?.data ?? response
    },
    placeholderData: (previousData) => previousData,
  })

  const items = data?.items ?? []
  const pagination = data?.pagination ?? { page, total_pages: 1, total: 0 }
  const stats = data?.stats
  const statCards = stats ? [
    { label: 'Total Payments', value: String(stats.total_count ?? 0) },
    { label: 'Verified Success', value: String(stats.successful_count ?? 0) },
    { label: 'Pending', value: String(stats.pending_count ?? 0) },
    { label: 'Successful Amount', value: formatAmount(stats.successful_amount_paise) },
  ] : []

  const applySearch = (event) => {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const updatePaymentStatus = (event) => {
    setPage(1)
    setPaymentStatus(event.target.value)
  }

  const updateVerificationStatus = (event) => {
    setPage(1)
    setVerificationStatus(event.target.value)
  }

  return (
    <PageShell
      title="Civil Checker Payments"
      breadcrumb={['Home', 'Transactions', 'Civil Checker Payments']}
      description="Razorpay CIBIL unlock transactions and verification details from the civil_score_payments table."
      stats={statCards}
      actions={(
        <AdminButton variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </AdminButton>
      )}
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message || 'Unable to load civil checker payments.'}
        </div>
      )}

      <section className="space-y-4">
        <form onSubmit={applySearch} className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <AdminInput
              icon={<Search className="h-4 w-4" />}
              placeholder="Search payment, user, report ref, or Razorpay ID"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="max-w-xl"
            />
            <AdminButton type="submit" variant="outline" size="sm">Search</AdminButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter payment status"
              value={paymentStatus}
              onChange={updatePaymentStatus}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">All payment statuses</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              aria-label="Filter verification status"
              value={verificationStatus}
              onChange={updateVerificationStatus}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">All verification statuses</option>
              {VERIFICATION_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </form>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Loading civil checker payments…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-white">No payment records found</p>
            <p className="mt-1 text-sm text-slate-500">Try changing the search or status filters.</p>
          </div>
        ) : (
          <>
            <AdminTable>
              <AdminTableHead>
                <AdminTableHeader>ID / Date</AdminTableHeader>
                <AdminTableHeader>User</AdminTableHeader>
                <AdminTableHeader>Report Ref</AdminTableHeader>
                <AdminTableHeader>Amount</AdminTableHeader>
                <AdminTableHeader>Razorpay Order / Payment</AdminTableHeader>
                <AdminTableHeader>Payment Status</AdminTableHeader>
                <AdminTableHeader>Verification</AdminTableHeader>
                <AdminTableHeader>Downloads</AdminTableHeader>
                <AdminTableHeader>Details</AdminTableHeader>
              </AdminTableHead>
              <AdminTableBody>
                {items.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell className="whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">#{item.id}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(item.created_at)}</div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.user_full_name || `User #${item.user_id ?? '—'}`}
                      </div>
                      <div className="text-xs text-slate-500">{item.user_email || item.user_phone || '—'}</div>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-52 break-all">{item.report_ref || '—'}</AdminTableCell>
                    <AdminTableCell className="whitespace-nowrap font-semibold">
                      {formatAmount(item.amount_paise, item.currency)}
                    </AdminTableCell>
                    <AdminTableCell className="max-w-56">
                      <div className="break-all text-xs">{item.razorpay_order_id || '—'}</div>
                      <div className="mt-1 break-all text-xs text-slate-500">{item.razorpay_payment_id || '—'}</div>
                    </AdminTableCell>
                    <AdminTableCell><StatusBadge status={item.payment_status} /></AdminTableCell>
                    <AdminTableCell><StatusBadge status={item.verification_status} /></AdminTableCell>
                    <AdminTableCell>
                      <div>{Number(item.download_count || 0)} downloads</div>
                      <div className="text-xs text-slate-500">{Number(item.report_downloaded) ? 'Downloaded' : 'Not downloaded'}</div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        title="View payment details"
                        aria-label={`View payment ${item.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
            <Pagination
              page={pagination.page || page}
              totalPages={Math.max(1, pagination.total_pages || 1)}
              total={pagination.total || 0}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Civil Checker Payment #${selected.id}` : 'Civil Checker Payment'}
        description="Payment record fields read from civil_score_payments"
        wide
        footer={<AdminButton variant="outline" onClick={() => setSelected(null)}>Close</AdminButton>}
      >
        {selected && (
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Payment record ID" value={selected.id} />
            <DetailField label="User ID" value={selected.user_id} />
            <DetailField label="User name" value={selected.user_full_name} />
            <DetailField label="User email" value={selected.user_email} />
            <DetailField label="User phone" value={selected.user_phone} />
            <DetailField label="Report reference" value={selected.report_ref} />
            <DetailField label="Provider" value={selected.provider} />
            <DetailField label="Amount (paise)" value={selected.amount_paise} />
            <DetailField label="Currency" value={selected.currency} />
            <DetailField label="Razorpay order ID" value={selected.razorpay_order_id} />
            <DetailField label="Razorpay payment ID" value={selected.razorpay_payment_id} />
            <DetailField label="Razorpay signature" value={selected.razorpay_signature} wide />
            <DetailField label="Payment status" value={selected.payment_status} />
            <DetailField label="Verification status" value={selected.verification_status} />
            <DetailField label="Report downloaded" value={Number(selected.report_downloaded) ? 'Yes' : 'No'} />
            <DetailField label="Download count" value={selected.download_count} />
            <DetailField label="First downloaded at" value={formatDate(selected.first_downloaded_at)} />
            <DetailField label="Last downloaded at" value={formatDate(selected.last_downloaded_at)} />
            <DetailField label="Failure reason" value={selected.failure_reason} wide />
            <DetailField label="Refund amount (paise)" value={selected.refund_amount_paise} />
            <DetailField label="Admin notes" value={selected.admin_notes} wide />
            <DetailField label="Verified by admin ID" value={selected.verified_by} />
            <DetailField label="Verified at" value={formatDate(selected.verified_at)} />
            <DetailField label="Created at" value={formatDate(selected.created_at)} />
            <DetailField label="Updated at" value={formatDate(selected.updated_at)} />
          </dl>
        )}
      </AdminModal>
    </PageShell>
  )
}
