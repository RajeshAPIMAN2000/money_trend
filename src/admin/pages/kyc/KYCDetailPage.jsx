import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, X, Download, ZoomIn } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import { Card, CardContent } from '../../components/ui/AdminCard.jsx'
import { useAdminUser } from '../../hooks/useAdminUsers.js'
import { api, ApiError } from '../../../lib/api.js'
import { canReviewKyc, formatKycStatusLabel } from '../../../lib/adminUsers.js'

const statusTone = { pending: 'warning', submitted: 'warning', approved: 'success', verified: 'success', rejected: 'danger' }

export default function KYCDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [zoomImage, setZoomImage] = useState(null)

  const { data: user, isLoading, error } = useAdminUser(userId)

  const approveMutation = useMutation({
    mutationFn: () => api.updateUserKycStatus(userId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      navigate('/admin/kyc')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (remarks) => api.updateUserKycStatus(userId, { status: 'rejected', remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setRejectOpen(false)
      navigate('/admin/kyc')
    },
    onError: (err) => setRejectError(err instanceof ApiError ? err.message : 'Rejection failed'),
  })

  if (isLoading) {
    return (
      <PageShell title="Loading..." breadcrumb={['Home', 'KYC']}>
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </PageShell>
    )
  }

  if (error || !user) {
    return (
      <PageShell title="Error" breadcrumb={['Home', 'KYC']}>
        <div className="p-8 text-center text-red-500">{error?.message || 'Failed to load KYC details'}</div>
      </PageShell>
    )
  }

  const isPending = canReviewKyc(user)
  const kycStatusLabel = formatKycStatusLabel(user.kycStatus)
  const statusKey = String(user.kycStatus ?? '').toLowerCase()

  return (
    <PageShell
      title={`KYC Review — ${user.name}`}
      breadcrumb={['Home', 'KYC Verification', user.name]}
      description={`${user.kycMethodLabel} KYC submission`}
    >
      <button type="button" onClick={() => navigate('/admin/kyc')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to list
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">User Information</h3>
                <AdminBadge tone={statusTone[statusKey] || 'default'}>{kycStatusLabel}</AdminBadge>
              </div>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{user.name}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.phone}</dd></div>
                <div><dt className="text-slate-500">KYC Type</dt><dd className="font-medium">{user.kycMethodLabel}</dd></div>
              </dl>
            </CardContent>
          </Card>

          {user.kyc?.submitted && user.kycMethod === 'manual' && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-semibold mb-4">Manual KYC Documents</h3>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm mb-6">
                  <div><dt className="text-slate-500">Aadhaar</dt><dd className="font-medium">{user.kyc.aadhaarNumber || '—'}</dd></div>
                  <div><dt className="text-slate-500">PAN</dt><dd className="font-medium">{user.kyc.panNumber || '—'}</dd></div>
                  <div><dt className="text-slate-500">Name on ID</dt><dd className="font-medium">{user.kyc.panFullName || user.name}</dd></div>
                  <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.phone}</dd></div>
                </dl>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Aadhaar Card', url: user.kyc.aadhaarImage },
                    { label: 'PAN Card', url: user.kyc.panImage },
                  ].map((doc) => (
                    <div key={doc.label} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium flex justify-between">
                        <span>{doc.label}</span>
                        {doc.url && (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => setZoomImage(doc.url)} className="p-1 hover:bg-slate-200 rounded"><ZoomIn className="w-3.5 h-3.5" /></button>
                            <a href={doc.url} download className="p-1 hover:bg-slate-200 rounded"><Download className="w-3.5 h-3.5" /></a>
                          </div>
                        )}
                      </div>
                      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        {doc.url ? (
                          doc.url.endsWith('.pdf') ? (
                            <span className="text-sm text-slate-500">PDF Document</span>
                          ) : (
                            <img src={doc.url} alt={doc.label} className="w-full h-full object-contain cursor-pointer" onClick={() => setZoomImage(doc.url)} />
                          )
                        ) : (
                          <span className="text-sm text-slate-400">No document uploaded</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {user.kycMethod === 'digilocker' && user.kyc?.digilockerRef && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-semibold mb-4">DigiLocker Data</h3>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-slate-500">Reference ID</dt><dd className="font-medium">{user.kyc.digilockerRef}</dd></div>
                  <div><dt className="text-slate-500">Status</dt><dd className="font-medium capitalize">{user.kyc.status}</dd></div>
                </dl>
              </CardContent>
            </Card>
          )}

          {!user.kyc?.submitted && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-slate-500">{user.kyc?.message || 'KYC has not been submitted yet.'}</p>
              </CardContent>
            </Card>
          )}

          {user.nominee?.added && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-semibold mb-4">Nominee Details</h3>
                <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{user.nominee.name}</dd></div>
                  <div><dt className="text-slate-500">Relationship</dt><dd className="font-medium">{user.nominee.relationship}</dd></div>
                  <div><dt className="text-slate-500">DOB</dt><dd className="font-medium">{user.nominee.dob}</dd></div>
                  <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.nominee.phone}</dd></div>
                  <div><dt className="text-slate-500">Allocation</dt><dd className="font-medium">{user.nominee.allocationPercent}%</dd></div>
                  <div className="sm:col-span-2"><dt className="text-slate-500">Address</dt><dd className="font-medium">{user.nominee.address}</dd></div>
                  {user.nominee.guardianName && (
                    <>
                      <div><dt className="text-slate-500">Guardian</dt><dd className="font-medium">{user.nominee.guardianName}</dd></div>
                      <div><dt className="text-slate-500">Guardian Relation</dt><dd className="font-medium">{user.nominee.guardianRelationship}</dd></div>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {isPending && user.kyc?.submitted && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <h3 className="font-semibold">Actions</h3>
                <AdminButton
                  variant="emerald"
                  className="w-full"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <Check className="w-4 h-4" /> {approveMutation.isPending ? 'Approving...' : 'Approve KYC'}
                </AdminButton>
                <AdminButton variant="outline" className="w-full text-red-600 border-red-200" onClick={() => setRejectOpen(true)}>
                  <X className="w-4 h-4" /> Reject KYC
                </AdminButton>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdminModal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject KYC" description="Provide remarks for rejection">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Remarks for Rejection *</label>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={4}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm dark:bg-slate-800 dark:border-slate-700"
              placeholder="Explain why the KYC is being rejected..."
            />
            {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
          </div>
          <div className="flex gap-2">
            <AdminButton variant="outline" className="flex-1" onClick={() => setRejectOpen(false)}>Cancel</AdminButton>
            <AdminButton
              variant="outline"
              className="flex-1 text-red-600 border-red-200"
              disabled={!rejectRemarks.trim() || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(rejectRemarks.trim())}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Document" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </PageShell>
  )
}
