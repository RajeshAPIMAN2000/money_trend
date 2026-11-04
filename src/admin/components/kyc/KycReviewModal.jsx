import { Download, ZoomIn } from 'lucide-react'
import AdminModal from '../shared/AdminModal.jsx'
import AdminBadge from '../ui/AdminBadge.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import { formatKycStatusLabel } from '../../../lib/adminUsers.js'

const statusTone = { pending: 'warning', submitted: 'warning', approved: 'success', verified: 'success', rejected: 'danger' }

function DetailItem({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{value || '—'}</dd>
    </div>
  )
}

function DocumentPreview({ label, url, onZoom }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium flex justify-between items-center">
        <span>{label}</span>
        {url && (
          <div className="flex gap-1">
            <button type="button" onClick={() => onZoom(url)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <a href={url} download className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        {url ? (
          url.endsWith('.pdf') ? (
            <span className="text-sm text-slate-500">PDF Document</span>
          ) : (
            <img src={url} alt={label} className="w-full h-full object-contain cursor-pointer" onClick={() => onZoom(url)} />
          )
        ) : (
          <span className="text-sm text-slate-400">No document uploaded</span>
        )}
      </div>
    </div>
  )
}

export default function KycReviewModal({
  open,
  onClose,
  user,
  onApprove,
  onReject,
  showActions = false,
  approveLoading = false,
  rejectLoading = false,
  onZoomImage,
}) {
  if (!user) return null

  const statusKey = String(user.kycStatus ?? '').toLowerCase()
  const statusLabel = formatKycStatusLabel(user.kycStatus)

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={`KYC Details — ${user.name}`}
      description={`${user.kycMethodLabel} submission review`}
      footer={showActions ? (
        <>
          <AdminButton variant="outline" onClick={onClose}>Close</AdminButton>
          <AdminButton
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={onReject}
            disabled={approveLoading || rejectLoading}
          >
            {rejectLoading ? 'Rejecting...' : 'Reject'}
          </AdminButton>
          <AdminButton
            variant="emerald"
            onClick={onApprove}
            disabled={approveLoading || rejectLoading}
          >
            {approveLoading ? 'Approving...' : 'Approve'}
          </AdminButton>
        </>
      ) : (
        <AdminButton variant="outline" onClick={onClose}>Close</AdminButton>
      )}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">User Information</h3>
          <AdminBadge tone={statusTone[statusKey] || 'default'}>{statusLabel}</AdminBadge>
        </div>

        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <DetailItem label="Full Name" value={user.name} />
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="Phone" value={user.phone} />
          <DetailItem label="KYC Type" value={user.kycMethodLabel} />
          <DetailItem label="Joined" value={user.joined} />
          <DetailItem
            label="Submitted On"
            value={user.kyc?.createdAt ? new Date(user.kyc.createdAt).toLocaleString() : '—'}
          />
        </dl>

        {user.kyc?.submitted ? (
          <>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Submitted KYC Data</h3>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <DetailItem label="PAN Number" value={user.kyc.panNumber} />
                <DetailItem label="Name on PAN" value={user.kyc.panFullName} />
                <DetailItem label="Aadhaar Number" value={user.kyc.aadhaarNumber} />
                <DetailItem label="KYC Method" value={user.kycMethodLabel} />
              </dl>
            </div>

            {user.kycMethod === 'manual' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <DocumentPreview label="Aadhaar Card" url={user.kyc.aadhaarImage} onZoom={onZoomImage} />
                <DocumentPreview label="PAN Card" url={user.kyc.panImage} onZoom={onZoomImage} />
              </div>
            )}

            {user.kycMethod === 'digilocker' && user.kyc.digilockerRef && (
              <DetailItem label="DigiLocker Reference" value={user.kyc.digilockerRef} />
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">{user.kyc?.message || 'KYC has not been submitted yet.'}</p>
        )}

        {user.nominee?.added && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Nominee Details</h3>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <DetailItem label="Nominee Name" value={user.nominee.name} />
              <DetailItem label="Relationship" value={user.nominee.relationship} />
              <DetailItem label="Date of Birth" value={user.nominee.dob} />
              <DetailItem label="Mobile" value={user.nominee.phone} />
              <DetailItem label="Email" value={user.nominee.email} />
              <DetailItem label="Allocation" value={user.nominee.allocationPercent ? `${user.nominee.allocationPercent}%` : '—'} />
              <div className="sm:col-span-2">
                <DetailItem label="Address" value={user.nominee.address} />
              </div>
              {user.nominee.guardianName && (
                <>
                  <DetailItem label="Guardian Name" value={user.nominee.guardianName} />
                  <DetailItem label="Guardian Relationship" value={user.nominee.guardianRelationship} />
                </>
              )}
            </dl>
          </div>
        )}
      </div>
    </AdminModal>
  )
}
