/**
 * DigiLocker e-KYC helpers — parse init / status / documents responses.
 * Tokens, secrets, full Aadhaar and raw document binaries stay on the backend.
 */

function nestedData(res) {
  return res?.data && typeof res.data === 'object' ? res.data : null
}

/** Parse POST /api/kyc/digilocker/init (alias /api/digilocker/start). */
export function parseDigiLockerInit(res) {
  const nested = nestedData(res)
  return {
    isStub: Boolean(res?.isStub ?? res?.is_stub ?? nested?.isStub ?? nested?.is_stub),
    authUrl: res?.authUrl
      || res?.auth_url
      || res?.authorization_url
      || nested?.authUrl
      || nested?.auth_url
      || nested?.authorization_url
      || null,
    sessionId: res?.session_id ?? nested?.session_id ?? null,
    expiresAt: res?.expires_at ?? nested?.expires_at ?? null,
    message: res?.message ?? null,
  }
}

/** Parse GET /api/kyc/digilocker/status. */
export function parseDigiLockerStatus(res) {
  const data = nestedData(res) || res || {}
  const record = data.record && typeof data.record === 'object' ? data.record : {}
  const doc = data.kyc_document && typeof data.kyc_document === 'object' ? data.kyc_document : {}
  const verification = data.verification && typeof data.verification === 'object' ? data.verification : {}
  const kycStatus = String(
    data.kyc_status || record.status || doc.status || 'submitted',
  ).toLowerCase()
  const approval = String(data.moneytrend_approval || '').toLowerCase()

  return {
    userId: data.user_id ?? null,
    kycStatus,
    kycMethod: data.kyc_method || doc.method || 'digilocker',
    providerVerified: Boolean(data.digilocker_provider_verified),
    moneytrendApproval: approval || (kycStatus === 'verified' || kycStatus === 'approved' ? 'approved' : 'pending_admin'),
    verification: {
      authentication: verification.authentication || 'not_started',
      aadhaar: verification.aadhaar || 'not_started',
      pan: verification.pan || 'not_started',
      name: verification.name || 'not_started',
      dob: verification.dob || 'not_started',
      address: verification.address || 'not_started',
      overall: verification.overall || 'not_started',
      reason: verification.reason || null,
    },
    latestSessions: Array.isArray(data.latest_sessions) ? data.latest_sessions : [],
    record: {
      digilockerId: record.digilocker_id || doc.digilocker_ref || null,
      aadhaarLast4: record.aadhaar_last4 || null,
      panMasked: record.pan_masked || null,
      eaadhaarAvailable: Boolean(record.eaadhaar_available),
      status: record.status || kycStatus,
      issuedDocs: Array.isArray(record.issued_docs) ? record.issued_docs : [],
      updatedAt: record.updated_at || null,
    },
    kycDocument: {
      method: doc.method || 'digilocker',
      status: doc.status || kycStatus,
      digilockerRef: doc.digilocker_ref || record.digilocker_id || null,
      panFullName: doc.pan_full_name || null,
      updatedAt: doc.updated_at || null,
    },
  }
}

/** Parse GET /api/kyc/digilocker/documents (optional metadata). */
export function parseDigiLockerDocuments(res) {
  const data = nestedData(res) || res || {}
  return {
    issuedDocs: Array.isArray(data.issued_docs) ? data.issued_docs : [],
    digilockerId: data.digilocker_id || null,
    aadhaarLast4: data.aadhaar_last4 || null,
    panMasked: data.pan_masked || null,
    note: data.note || null,
  }
}

/** User-facing message for DigiLocker API failures (e.g. backend cfg errors). */
export function digilockerErrorMessage(err) {
  const code = String(err?.errorCode || err?.data?.errorCode || '').toUpperCase()
  const raw = String(err?.message || err?.data?.message || '').trim()
  const lower = raw.toLowerCase()

  if (code === 'DIGILOCKER_KYC_INCOMPLETE' || lower.includes('required data missing') || lower.includes('ekyc rejected')) {
    return raw || 'eKYC rejected — required data is missing. Provide correct information and try again.'
  }
  if (code === 'DIGILOCKER_ERROR' || lower.includes('cfg is not defined') || lower.includes('not configured')) {
    return 'DigiLocker e-KYC is temporarily unavailable. Please use Manual KYC or try again later.'
  }
  if (lower.includes('route not found') && lower.includes('digilocker')) {
    return 'DigiLocker callback is not reachable on the server. Redeploy the latest Money Trend backend and ensure /api is proxied to Node.'
  }
  return raw || 'Failed to start DigiLocker'
}

/** Toast copy when DigiLocker returns without required Aadhaar/PAN evidence. */
export function digilockerMissingDataMessage({ missing, message } = {}) {
  const raw = String(message || '').trim()
  if (raw) return raw
  const list = Array.isArray(missing)
    ? missing
    : String(missing || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
  const labels = { aadhaar: 'Aadhaar', pan: 'PAN', name: 'Name', dob: 'Date of birth' }
  if (list.length) {
    const pretty = list.map((m) => labels[m.toLowerCase()] || m).join(', ')
    return `eKYC rejected — required data missing: ${pretty}. Provide correct information as in DigiLocker / Manual KYC.`
  }
  return 'eKYC rejected — required DigiLocker data is missing. Provide correct information and try again.'
}

export function digilockerApprovalNote(status) {
  if (!status) {
    return 'DigiLocker verification succeeded. Final MoneyTrend KYC approval is still pending admin review.'
  }
  if (status.moneytrendApproval === 'approved' || ['verified', 'approved'].includes(status.kycStatus)) {
    return 'Your MoneyTrend KYC is approved.'
  }
  if (status.kycStatus === 'rejected') {
    return 'Your DigiLocker KYC was rejected. Please resubmit via Manual KYC or DigiLocker.'
  }
  return 'DigiLocker verification succeeded. Final MoneyTrend KYC approval is still pending admin review.'
}
