import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Pencil } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import KycReviewModal from '../../components/kyc/KycReviewModal.jsx'
import { useAdminUsers } from '../../hooks/useAdminUsers.js'
import { api, ApiError } from '../../../lib/api.js'
import { mapUserToTableRow, computeUserStats, canReviewKyc } from '../../../lib/adminUsers.js'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [viewUser, setViewUser] = useState(null)
  const [actionUser, setActionUser] = useState(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [zoomImage, setZoomImage] = useState(null)

  const { data, isLoading, error } = useAdminUsers()
  const users = data?.users ?? []
  const stats = computeUserStats(users)
  const rows = users.map(mapUserToTableRow)

  const userMap = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users],
  )

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
    const user = userMap[String(row.id)]
    if (user) setViewUser(user)
  }

  return (
    <PageShell
      title="All Users"
      breadcrumb={['Home', 'User Management', 'Users']}
      description="Manage registered users, accounts, and access levels."
      stats={[
        { label: 'Total Users', value: String(stats.total) },
        { label: 'Pending KYC', value: String(stats.pendingKyc) },
        { label: 'Approved KYC', value: String(stats.approvedKyc) },
        { label: 'Rejected KYC', value: String(stats.rejectedKyc) },
      ]}
      actions={
        <Link to="/admin/users/add">
          <AdminButton size="sm"><Plus className="w-4 h-4" /> Add User</AdminButton>
        </Link>
      }
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load users'}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading users...</div>
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
          filters={['Active']}
          searchPlaceholder="Search users..."
          actions={(row) => (
            <>
              <button
                type="button"
                onClick={() => openView(row)}
                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link to={`/admin/users/${row.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <Pencil className="w-4 h-4" />
              </Link>
            </>
          )}
        />
      )}

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
