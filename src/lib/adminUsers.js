import { resolveMediaUrl } from './media.js'
import { extractCreditScore, formatCreditDate, getScoreBandLabel } from './creditCheck.js'

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export function resolveUploadUrl(filename) {
  return resolveMediaUrl(filename)
}

export function formatKycStatusLabel(status) {
  const value = String(status ?? '').toLowerCase()
  if (value === 'verified' || value === 'approved') return 'Approved'
  if (value === 'rejected') return 'Rejected'
  if (value === 'submitted') return 'Pending'
  if (value === 'pending') return 'Pending'
  return status ? String(status) : 'Not Submitted'
}

export function normalizeKycStatus(status) {
  const value = String(status ?? '').toLowerCase()
  if (value === 'verified' || value === 'approved') return 'approved'
  if (value === 'rejected') return 'rejected'
  if (value === 'submitted' || value === 'pending') return 'pending'
  return value || 'pending'
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function parseAdminUsersList(payload) {
  const root = unwrap(payload)
  const users = root.users ?? root.items ?? (Array.isArray(root) ? root : [])
  return {
    count: root.count ?? users.length,
    users: users.map(parseAdminUserRecord),
  }
}

export function parseAdminUserDetail(payload) {
  const root = unwrap(payload)
  const user = root.user ?? root
  return parseAdminUserRecord(user)
}

function parseAdminUserRecord(user) {
  if (!user) return null

  const kyc = user.kyc ?? {}
  const nominee = user.nominee ?? {}
  const kycStatus = user.kyc_status ?? kyc.status ?? 'pending'
  const kycMethod = user.kyc_method ?? kyc.method ?? null
  const creditScoreValue = extractCreditScore(user)
  const creditMeta = user.credit_score ?? user.creditScore ?? {}
  const cibilMeta = creditMeta.cibil_score ?? creditMeta.cibilScore ?? {}

  return {
    id: user.id,
    name: user.full_name ?? user.name ?? 'User',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: user.role ?? 'user',
    profileImage: user.profile_image ?? null,
    kycStatus,
    kycStatusLabel: formatKycStatusLabel(kycStatus),
    kycMethod,
    kycMethodLabel: kycMethod === 'digilocker' ? 'DigiLocker' : kycMethod === 'manual' ? 'Manual' : '—',
    joined: formatDate(user.created_at),
    updatedAt: user.updated_at,
    createdAt: user.created_at,
    creditScore: creditScoreValue,
    creditScoreLabel: creditScoreValue != null ? String(creditScoreValue) : '—',
    creditBand: getScoreBandLabel(creditScoreValue, cibilMeta.band ?? cibilMeta.score_band),
    creditProvider: creditMeta.provider ?? cibilMeta.provider ?? (creditScoreValue != null ? 'EXPERIAN' : '—'),
    creditCheckedAt: formatCreditDate(cibilMeta.checked_at ?? cibilMeta.checkedAt ?? creditMeta.checked_at),
    kyc: {
      submitted: Boolean(kyc.submitted),
      message: kyc.message ?? '',
      status: kyc.status ?? kycStatus,
      method: kyc.method ?? kycMethod,
      panNumber: kyc.pan_number ?? '',
      panFullName: kyc.pan_full_name ?? '',
      panImage: resolveUploadUrl(kyc.pan_image),
      aadhaarNumber: kyc.aadhaar_number ?? '',
      aadhaarImage: resolveUploadUrl(kyc.aadhaar_image),
      digilockerRef: kyc.digilocker_ref ?? null,
      createdAt: kyc.created_at,
    },
    nominee: nominee.added
      ? {
          added: true,
          name: nominee.nominee_name ?? '',
          relationship: nominee.relationship ?? '',
          dob: formatDate(nominee.date_of_birth),
          phone: nominee.mobile ?? '',
          email: nominee.email ?? '',
          address: nominee.address ?? '',
          panNumber: nominee.pan_number ?? '',
          aadhaarNumber: nominee.aadhaar_number ?? '',
          panImage: resolveUploadUrl(nominee.pan_image),
          aadhaarImage: resolveUploadUrl(nominee.aadhaar_image),
          allocationPercent: nominee.allocation_percent ?? '',
          isMinor: Boolean(nominee.is_minor),
          guardianName: nominee.guardian_name ?? '',
          guardianRelationship: nominee.guardian_relationship ?? '',
          status: nominee.status ?? '',
        }
      : { added: false, message: nominee.message ?? 'Nominee not added' },
  }
}

export function mapUserToTableRow(user) {
  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    kyc: user.kycStatusLabel,
    kycStatus: normalizeKycStatus(user.kycStatus),
    kycTypeLabel: user.kycMethodLabel,
    kycMethod: user.kycMethod,
    creditScore: user.creditScoreLabel,
    joined: user.joined,
    submittedLabel: user.kyc?.createdAt ? formatDate(user.kyc.createdAt) : '—',
    status: 'Active',
  }
}

export function filterUsersByKycTab(users, tab) {
  if (tab === 'all') return users
  return users.filter((user) => normalizeKycStatus(user.kycStatus) === tab)
}

export function countUsersByKycStatus(users) {
  return users.reduce(
    (acc, user) => {
      const status = normalizeKycStatus(user.kycStatus)
      if (status === 'pending') acc.pending += 1
      else if (status === 'approved') acc.approved += 1
      else if (status === 'rejected') acc.rejected += 1
      return acc
    },
    { pending: 0, approved: 0, rejected: 0 },
  )
}

export function canReviewKyc(user) {
  const status = normalizeKycStatus(user?.kycStatus ?? user?.kyc?.status ?? '')
  return status === 'pending' && Boolean(user?.kyc?.submitted)
}

export function computeUserStats(users) {
  const counts = countUsersByKycStatus(users)
  return {
    total: users.length,
    pendingKyc: counts.pending,
    approvedKyc: counts.approved,
    rejectedKyc: counts.rejected,
  }
}
