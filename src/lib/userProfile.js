import { resolveMediaUrl } from './media.js'

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function toInputDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    const raw = String(value)
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
    return ''
  }
  return date.toISOString().slice(0, 10)
}

export function parseUserProfile(payload) {
  const root = unwrap(payload)
  const kyc = root.kyc ?? {}
  const nominee = root.nominee ?? {}
  const nomineeAdded = Boolean(nominee.added || nominee.nominee_name)

  return {
    id: root.id,
    fullName: root.full_name ?? root.name ?? '',
    email: root.email ?? '',
    phone: root.phone ?? '',
    profileImage: resolveMediaUrl(root.profile_image),
    profileImageRaw: root.profile_image ?? null,
    role: root.role ?? 'user',
    kycStatus: root.kyc_status ?? kyc.status ?? 'not_started',
    kycMethod: root.kyc_method ?? kyc.method ?? null,
    panNumber: root.pan_number ?? kyc.pan_number ?? '',
    aadhaarNumber: root.aadhaar_number ?? kyc.aadhaar_number ?? '',
    memberSince: formatDate(root.created_at),
    createdAt: root.created_at,
    nominee: nomineeAdded
      ? {
          added: true,
          name: nominee.nominee_name ?? '',
          relationship: nominee.relationship ?? '',
          dob: nominee.date_of_birth ?? nominee.dob ?? '',
          dobInput: toInputDate(nominee.date_of_birth ?? nominee.dob),
          mobile: nominee.mobile ?? '',
          email: nominee.email ?? '',
          address: nominee.address ?? '',
          panNumber: nominee.pan_number ?? '',
          aadhaarNumber: nominee.aadhaar_number ?? '',
          allocationPercent: nominee.allocation_percent ?? 100,
          isMinor: Boolean(nominee.is_minor),
          guardianName: nominee.guardian_name ?? '',
          guardianRelationship: nominee.guardian_relationship ?? '',
          status: nominee.status ?? 'active',
        }
      : { added: false, message: nominee.message ?? 'Nominee not added' },
    raw: root,
  }
}

export function parseBankAccount(payload) {
  const root = unwrap(payload)
  // GET returns { bank_account: {...} }; POST/PUT return fields on data root
  const bank = root.bank_account
    ?? root.bankAccount
    ?? (root.bank_name || root.account_holder_name ? root : null)

  if (!bank || (!bank.bank_name && !bank.account_holder_name && !bank.account_number_masked)) {
    return { added: false, account: null }
  }

  return {
    added: true,
    account: {
      accountHolderName: bank.account_holder_name ?? '',
      bankName: bank.bank_name ?? '',
      branchName: bank.branch_name ?? '',
      ifsc: bank.ifsc_code ?? bank.ifsc ?? '',
      accountNumberMasked: bank.account_number_masked
        ?? (bank.account_last4 ? `XXXXXX${bank.account_last4}` : '—'),
      accountLast4: bank.account_last4 ?? '',
      status: bank.status ?? 'active',
      createdAt: bank.created_at ?? null,
    },
  }
}

/** Build multipart body for PUT /api/profile/:id */
export function buildProfileUpdateFormData(fields, imageFile) {
  const fd = new FormData()
  if (fields.fullName != null) fd.append('full_name', String(fields.fullName).trim())
  if (fields.email != null) fd.append('email', String(fields.email).trim().toLowerCase())
  if (fields.phone != null) fd.append('phone', String(fields.phone).replace(/\D/g, ''))

  if (imageFile) fd.append('profile_image', imageFile)

  // Nominee fields (editable via same endpoint)
  if (fields.nomineeName != null) fd.append('nominee_name', String(fields.nomineeName).trim())
  if (fields.relationship != null) fd.append('relationship', fields.relationship)
  if (fields.dob != null) fd.append('dob', fields.dob)
  if (fields.nomineeMobile != null) fd.append('nominee_mobile', String(fields.nomineeMobile).replace(/\D/g, ''))
  if (fields.nomineeEmail != null) fd.append('nominee_email', String(fields.nomineeEmail).trim().toLowerCase())
  if (fields.address != null) fd.append('address', String(fields.address).trim())
  if (fields.nomineePan != null) fd.append('nominee_pan_number', String(fields.nomineePan).trim().toUpperCase())
  if (fields.nomineeAadhaar != null) {
    fd.append('nominee_aadhaar_number', String(fields.nomineeAadhaar).replace(/\s/g, ''))
  }

  return fd
}

export function buildBankAccountPayload(fields) {
  return {
    account_holder_name: String(fields.accountHolderName || '').trim(),
    bank_name: String(fields.bankName || '').trim(),
    branch_name: String(fields.branchName || '').trim(),
    ifsc: String(fields.ifsc || '').trim().toUpperCase(),
    account_number: String(fields.accountNumber || '').replace(/\s/g, ''),
  }
}

export function kycBadgeLabel(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'verified' || value === 'approved') return 'KYC Verified'
  if (value === 'submitted' || value === 'pending') return 'KYC Under Review'
  if (value === 'rejected') return 'KYC Rejected'
  return 'KYC Not Started'
}

export function kycBadgeTone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'verified' || value === 'approved') return 'green'
  if (value === 'submitted' || value === 'pending') return 'amber'
  if (value === 'rejected') return 'red'
  return 'slate'
}

export function initialsFromName(name) {
  return String(name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'
}
