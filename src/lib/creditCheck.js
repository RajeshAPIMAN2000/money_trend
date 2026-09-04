/**
 * Credit-check helpers — frontend talks ONLY to our Node backend.
 * Never store or display Experian credentials/tokens.
 */

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export function maskPan(pan) {
  const value = String(pan || '').toUpperCase().replace(/\s/g, '')
  if (value.length < 5) return value || '—'
  return `${value.slice(0, 5)}****${value.slice(-1)}`
}

export function maskMobile(mobile) {
  const clean = String(mobile || '').replace(/\D/g, '')
  if (clean.length < 4) return clean || '—'
  return `******${clean.slice(-4)}`
}

export function formatCreditDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getScoreBandLabel(score, band) {
  if (band) return String(band).replace(/_/g, ' ')
  const n = Number(score)
  if (Number.isNaN(n)) return '—'
  if (n >= 750) return 'Excellent'
  if (n >= 700) return 'Good'
  if (n >= 650) return 'Fair'
  if (n >= 550) return 'Needs Work'
  return 'Poor'
}

export function extractCreditScore(source) {
  if (source == null) return null
  const credit = source.credit_score ?? source.creditScore ?? source
  const cibil = credit?.cibil_score ?? credit?.cibilScore ?? credit
  const score = cibil?.score ?? credit?.score ?? source.score ?? null
  if (score == null || score === '') return null
  const num = Number(score)
  return Number.isNaN(num) ? null : num
}

export function parseCreditCheckResult(payload) {
  const root = unwrap(payload)
  // Backend returns { data: { score, provider, check: {...}, ... } }
  const item = root.result
    ?? root.credit_check
    ?? root.creditCheck
    ?? root.check
    ?? root.report
    ?? root

  const score = extractCreditScore(root) ?? extractCreditScore(item)
  const provider = root.provider
    ?? item.provider
    ?? item.bureau
    ?? 'CIBIL'
  const scoreBand = root.scoreBand
    ?? root.score_band
    ?? item.scoreBand
    ?? item.score_band
    ?? item.band
    ?? item.cibil_score?.band
    ?? item.credit_score?.cibil_score?.band
    ?? null
  const referenceId = root.referenceId
    ?? root.reference_id
    ?? item.referenceId
    ?? item.reference_id
    ?? item.report_ref_id
    ?? item.ref_id
    ?? item.id
    ?? null
  const status = String(
    root.status ?? item.status ?? (score != null ? 'success' : 'unknown'),
  ).toLowerCase()
  const checkedAt = item.checked_at
    ?? item.checkedAt
    ?? item.consent_timestamp
    ?? item.created_at
    ?? item.createdAt
    ?? item.updated_at
    ?? item.report_date
    ?? null
  const reportAvailable = Boolean(
    root.reportAvailable
    ?? root.report_available
    ?? item.reportAvailable
    ?? item.report_available
    ?? (score != null),
  )
  const noMatch = status === 'no_match'
    || status === 'not_found'
    || Boolean(item.no_match ?? item.noMatch)
    || (score == null && (item.message || '').toLowerCase().includes('not found'))

  return {
    id: item.id ?? referenceId,
    provider: String(provider).toUpperCase(),
    score,
    scoreBand: scoreBand ? getScoreBandLabel(score, scoreBand) : getScoreBandLabel(score),
    scoreLabel: root.scoreLabel ?? root.score_label ?? item.score_label ?? 'CIBIL Score',
    referenceId: referenceId != null ? String(referenceId) : null,
    status,
    checkedAt,
    checkedAtLabel: formatCreditDate(checkedAt),
    reportAvailable,
    noMatch,
    loginRequired: Boolean(root.loginRequired ?? root.login_required),
    message: item.message ?? root.message ?? payload?.message ?? null,
    accounts: item.accounts ?? root.accounts ?? [],
    enquiries: item.enquiries ?? root.enquiries ?? [],
    rawSafe: {
      provider: String(provider).toUpperCase(),
      score,
      scoreBand,
      referenceId,
      status,
    },
  }
}

export function parseCreditCheckHistory(payload) {
  const root = unwrap(payload)
  const items = root.credit_checks
    ?? root.creditChecks
    ?? root.items
    ?? root.results
    ?? (Array.isArray(root) ? root : [])

  return {
    count: root.count ?? items.length,
    items: items.map((item) => parseCreditCheckResult({ data: item })),
  }
}

export function parseLatestCreditCheck(payload) {
  const root = unwrap(payload)
  if (!root || (root.success === false && !root.score && !root.credit_score)) {
    return null
  }
  // Empty / no latest
  if (root.latest === null || root.credit_check === null) return null
  const parsed = parseCreditCheckResult(payload)
  if (parsed.score == null && !parsed.referenceId && parsed.status === 'unknown') return null
  return parsed
}

export function mapCreditApiError(err) {
  const status = err?.status
  const data = err?.data
  const detailed = extractValidationMessage(data)
  const fallback = detailed || err?.message || 'Unable to complete the credit check.'

  // Never surface secrets / provider internals
  if (/experian|access[_-]?token|refresh[_-]?token|client[_-]?secret|client[_-]?id|password/i.test(fallback)) {
    if (status === 400 || status === 422) return 'Please check the information you entered.'
    return 'Unable to complete the credit check. Please try again later.'
  }

  switch (status) {
    case 400:
    case 422:
      // Prefer backend validation text so the form can be corrected
      return detailed || 'Please check the information you entered.'
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'Credit information could not be matched.'
    case 409:
      return 'A credit check is already in progress. Please wait a moment.'
    case 429:
      return detailed || 'A credit check was already done recently. Please try again later.'
    case 502:
    case 503:
    case 504:
      return 'Credit information is temporarily unavailable. Please try again later.'
    case 500:
      return 'Something went wrong while checking your credit information. Please try again later.'
    default:
      return fallback
  }
}

function extractValidationMessage(data) {
  if (!data || typeof data !== 'object') return ''

  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim()
  if (typeof data.error === 'string' && data.error.trim()) return data.error.trim()
  if (typeof data.error?.message === 'string') return data.error.message.trim()

  if (Array.isArray(data.errors)) {
    const parts = data.errors
      .map((item) => {
        if (typeof item === 'string') return item
        if (item?.message) return item.field ? `${item.field}: ${item.message}` : item.message
        if (item?.msg) return item.param ? `${item.param}: ${item.msg}` : item.msg
        return null
      })
      .filter(Boolean)
    if (parts.length) return parts.join('. ')
  }

  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const parts = Object.entries(data.errors).map(([key, value]) => {
      const text = Array.isArray(value) ? value.join(', ') : String(value)
      return `${key}: ${text}`
    })
    if (parts.length) return parts.join('. ')
  }

  if (Array.isArray(data.details)) {
    const parts = data.details.map((d) => d.message || d.msg || String(d)).filter(Boolean)
    if (parts.length) return parts.join('. ')
  }

  return ''
}

/** Consent text version required by backend audit compliance. */
export const CREDIT_CONSENT_VERSION = '1.0'

/**
 * Build POST /api/credit-check body (snake_case + consent_version).
 */
export function buildCreditCheckPayload(form) {
  const fullName = String(form.fullName || form.full_name || '').trim()
  const pan = String(form.pan || '').trim().toUpperCase()
  const dateOfBirth = form.dateOfBirth || form.date_of_birth || ''
  const mobile = String(form.mobile || form.phone || '').replace(/\D/g, '')
  const address = String(form.address || '').trim()
  const city = String(form.city || '').trim()
  const state = String(form.state || '').trim()
  const pincode = String(form.pincode || '').replace(/\D/g, '')
  const consent = Boolean(form.consent)

  return {
    full_name: fullName,
    pan,
    date_of_birth: dateOfBirth,
    mobile,
    address,
    city,
    state,
    pincode,
    consent,
    consent_version: form.consentVersion || form.consent_version || CREDIT_CONSENT_VERSION,
  }
}

