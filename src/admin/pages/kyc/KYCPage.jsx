import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, Check, X } from 'lucide-react'
import { motion } from 'motion/react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import KycReviewModal from '../../components/kyc/KycReviewModal.jsx'
import { useAdminUsers } from '../../hooks/useAdminUsers.js'
import { api, ApiError } from '../../../lib/api.js'
import {
  mapUserToTableRow,
  filterUsersByKycTab,
  countUsersByKycStatus,
  canReviewKyc,
} from '../../../lib/adminUsers.js'

const tabs = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

export default function KYCPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewUser, setViewUser] = useState(null)
  const [actionUser, setActionUser] = useState(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [zoomImage, setZoomImage] = useState(null)

  const { data, isLoading, error } = useAdminUsers()
  const users = data?.users ?? []

  const filteredUsers = useMemo(() => {
    let rows = filterUsersByKycTab(users, tab)
    if (typeFilter !== 'all') {
      rows = rows.filter((user) => String(user.kycMethod ?? '').toLowerCase() === typeFilter)
    }
    return rows
  }, [users, tab, typeFilter])

  const userMap = useMemo(
    () => Object.fromEntries(filteredUsers.map((user) => [String(user.id), user])),
    [filteredUsers],
  )

  const counts = countUsersByKycStatus(users)
  const rows = filteredUsers.map(mapUserToTableRow)

  const approveMutation = useMutation({
    mutationFn: (userId) => api.updateUserKycStatus(userId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setViewUser(null)
      setActionUser(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ userId, remarks }) => api.updateUserKycStatus(userId, { status: 'rejected', remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setRejectOpen(false)
      setRejectRemarks('')
      setRejectError('')
      setViewUser(null)
      setActionUser(null)
    },
    onError: (err) => setRejectError(err instanceof ApiError ? err.message : 'Rejection failed'),
  })

  const openView = (row) => {
    const user = userMap[String(row.userId)]
    if (user) setViewUser(user)
  }

  const openApprove = (row) => {
    const user = userMap[String(row.userId)]
    if (user) setActionUser(user)
    approveMutation.mutate(row.userId)
  }

  const openReject = (row) => {
    const user = userMap[String(row.userId)]
    if (user) {
      setActionUser(user)
      setRejectRemarks('')
      setRejectError('')
      setRejectOpen(true)
    }
  }

  return (
    <PageShell
      title="KYC Verification"
      breadcrumb={['Home', 'User Management', 'KYC Verification']}
      description="Review and approve user KYC submissions."
      stats={[
        { label: 'Pending Review', value: String(counts.pending) },
        { label: 'Approved', value: String(counts.approved) },
        { label: 'Rejected', value: String(counts.rejected) },
      ]}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load KYC submissions'}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {t.label}
              {t.id !== 'all' && ` (${counts[t.id] || 0})`}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900"
        >
          <option value="all">All Types</option>
          <option value="manual">Manual</option>
          <option value="digilocker">DigiLocker</option>
        </select>
      </div>

      <motion.div key={`${tab}-${typeFilter}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading submissions...</div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'User' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'kycTypeLabel', label: 'KYC Type' },
              { key: 'submittedLabel', label: 'Submitted' },
              { key: 'kyc', label: 'Status' },
            ]}
            rows={rows}
            avatarColumn="name"
            statusColumn="kyc"
            searchPlaceholder="Search by name, email, phone..."
            actions={(row) => {
              const user = userMap[String(row.userId)]
              const showReviewActions = user && canReviewKyc(user)

              return (
                <>
                  <button
                    type="button"
                    onClick={() => openView(row)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {showReviewActions && (
                    <>
                      <button
                        type="button"
                        onClick={() => openApprove(row)}
                        disabled={approveMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 disabled:opacity-50"
                        title="Approve KYC"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openReject(row)}
                        disabled={rejectMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 disabled:opacity-50"
                        title="Reject KYC"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )
            }}
          />
        )}
      </motion.div>

      <KycReviewModal
        open={Boolean(viewUser)}
        onClose={() => setViewUser(null)}
        user={viewUser}
        showActions={viewUser ? canReviewKyc(viewUser) : false}
        approveLoading={approveMutation.isPending}
        rejectLoading={rejectMutation.isPending}
        onApprove={() => viewUser && approveMutation.mutate(viewUser.id)}
        onReject={() => {
          setActionUser(viewUser)
          setRejectRemarks('')
          setRejectError('')
          setRejectOpen(true)
        }}
        onZoomImage={setZoomImage}
      />

      <AdminModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject KYC"
        description={actionUser ? `Rejecting KYC for ${actionUser.name}` : 'Provide remarks for rejection'}
        footer={(
          <>
            <AdminButton variant="outline" onClick={() => setRejectOpen(false)}>Cancel</AdminButton>
            <AdminButton
              variant="outline"
              className="text-red-600 border-red-200"
              disabled={!rejectRemarks.trim() || rejectMutation.isPending}
              onClick={() => actionUser && rejectMutation.mutate({ userId: actionUser.id, remarks: rejectRemarks.trim() })}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
            </AdminButton>
          </>
        )}
      >
        <div>
          <label className="text-xs font-medium text-slate-600">Remarks for Rejection *</label>
          <textarea
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={4}
            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm dark:bg-slate-800 dark:border-slate-700"
            placeholder="PAN document could not be verified"
          />
          {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
        </div>
      </AdminModal>

      {zoomImage && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Document" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </PageShell>
  )
}
