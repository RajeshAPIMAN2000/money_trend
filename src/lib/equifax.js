/**
 * Equifax consumer engagement — MoneyTrend /api/credit-check/* only.
 * Never store Equifax Client ID / Secret / Equifax tokens in the frontend.
 */

export const EQUIFAX_CONSENT_VERSION = 'v1.0'

export const DEFAULT_FEATURE_CODES = [
  'ONE_B_SCORE',
  'ONE_B_REPORT',
  'THREE_B_CREDIT_MONITORING_OFFLINE',
]

export const DEFAULT_SCORE_FEATURE = 'ONE_B_VANTAGE_SCORE_4'

export const REPORT_SECTIONS = [
  { key: 'summary', label: 'Summary' },
  { key: 'personalInformation', label: 'Personal' },
  { key: 'revolvingAccounts', label: 'Revolving' },
  { key: 'installmentAccounts', label: 'Installment' },
  { key: 'mortgageAccounts', label: 'Mortgage' },
  { key: 'otherAccounts', label: 'Other accounts' },
  { key: 'collections', label: 'Collections' },
  { key: 'inquiries', label: 'Inquiries' },
  { key: 'publicRecords', label: 'Public records' },
  { key: 'consumerStatements', label: 'Statements' },
]

export const EQUIFAX_ERROR_CODES = {
  AUTH_DOCS_REQUIRED: 'EQUIFAX_AUTH_DOCS_REQUIRED',
  CONFIG_INCOMPLETE: 'EQUIFAX_CONFIG_INCOMPLETE',
  DISABLED: 'EQUIFAX_DISABLED',
  AUTH_FAILED: 'EQUIFAX_AUTH_FAILED',
  ENROLLMENT_REQUIRED: 'EQUIFAX_ENROLLMENT_REQUIRED',
  INVALID_TOKEN: 'EQUIFAX_INVALID_TOKEN',
  RESOURCE_NOT_FOUND: 'EQUIFAX_RESOURCE_NOT_FOUND',
  RATE_LIMITED: 'EQUIFAX_RATE_LIMITED',
  FORBIDDEN: 'EQUIFAX_FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
}

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

function toNum(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Build enrollment body compatible with both MoneyTrend contracts:
 * - POST /api/credit-check/enrollment (enrollmentSubject + featureCodes)
 * - POST /api/equifax/enrollment (flat applicant fields)
 */
export function buildEquifaxEnrollPayload(form) {
  const consentGiven = Boolean(form.consent ?? form.consent_given ?? form.consentGiven)
  const fullName = String(form.fullName || form.full_name || '').trim()
  const pan = String(form.pan || '').trim().toUpperCase()
  const mobile = String(form.mobile || form.phone || '').replace(/\D/g, '')
  const dateOfBirth = form.dateOfBirth || form.date_of_birth || form.dob || ''
  const consentVersion = form.consentVersion || form.consent_version || EQUIFAX_CONSENT_VERSION

  const enrollmentSubject = form.enrollmentSubject && typeof form.enrollmentSubject === 'object'
    ? form.enrollmentSubject
    : {
        full_name: fullName,
        pan,
        mobile,
        date_of_birth: dateOfBirth,
      }

  const payload = {
    // Shared consent
    consent_given: consentGiven,
    consent: consentGiven,
    consent_version: consentVersion,
    consentVersion,
    // Flat fields (legacy /api/equifax/enrollment)
    full_name: fullName,
    pan,
    mobile,
    date_of_birth: dateOfBirth,
    // Nested subject (newer /api/credit-check/enrollment)
    enrollmentSubject,
    featureCodes: Array.isArray(form.featureCodes) && form.featureCodes.length
      ? form.featureCodes
      : DEFAULT_FEATURE_CODES,
  }

  const crn = form.customerReferenceNumber || form.customer_reference_number
  if (crn) payload.customerReferenceNumber = String(crn)

  return payload
}

export function buildEquifaxScorePayload(form = {}) {
  const body = {
    consent_given: Boolean(form.consent ?? form.consent_given ?? true),
    consent_version: form.consentVersion || form.consent_version || EQUIFAX_CONSENT_VERSION,
  }
  if (form.scoreType) body.scoreType = form.scoreType
  if (form.featureName) body.featureName = form.featureName
  else body.featureName = DEFAULT_SCORE_FEATURE
  return body
}

export function parseEquifaxEnrollment(payload) {
  const root = unwrap(payload)
  const id = root.equifax_enrollment_id
    ?? root.enrollment_id
    ?? root.enrollmentId
    ?? root.id
    ?? null
  const status = String(root.status || root.enrollment_status || 'unknown').toLowerCase()
  return {
    enrollmentId: id != null ? String(id) : null,
    status,
    enrolled: Boolean(id) || ['active', 'enrolled', 'success', 'completed'].includes(status),
    features: root.features ?? root.featureCodes ?? root.feature_codes ?? [],
    lastSyncedAt: root.last_synced_at ?? root.lastSyncedAt ?? null,
    lastSyncedAtLabel: formatDate(root.last_synced_at ?? root.lastSyncedAt),
    message: root.message ?? payload?.message ?? null,
    rawSafe: { status, hasId: Boolean(id) },
  }
}

export function parseEquifaxScore(payload) {
  const root = unwrap(payload)
  const report = root.report && typeof root.report === 'object' ? root.report : null
  const score = toNum(root.score ?? report?.score)
  const scoreDate = root.scoreDate ?? root.score_date ?? root.checked_at ?? root.checkedAt ?? null
  return {
    score,
    scoreBand: root.score_band ?? root.scoreBand ?? report?.score_band ?? null,
    scoreType: root.scoreType ?? root.score_type ?? null,
    featureName: root.featureName ?? root.feature_name ?? null,
    creditScoreId: root.creditScoreId ?? root.credit_score_id ?? null,
    scoreDate,
    checkedAt: scoreDate,
    checkedAtLabel: formatDate(scoreDate),
    report,
    message: root.message ?? payload?.message ?? null,
  }
}

export function parseEquifaxScoreHistory(payload) {
  const root = unwrap(payload)
  const items = Array.isArray(root)
    ? root
    : (root.history ?? root.items ?? root.scores ?? [])
  return {
    items: (Array.isArray(items) ? items : []).map((item) => ({
      score: toNum(item.score),
      scoreBand: item.score_band ?? item.scoreBand ?? null,
      scoreType: item.scoreType ?? item.score_type ?? null,
      featureName: item.featureName ?? item.feature_name ?? null,
      checkedAt: item.scoreDate ?? item.score_date ?? item.checked_at ?? item.checkedAt ?? item.date ?? null,
      checkedAtLabel: formatDate(
        item.scoreDate ?? item.score_date ?? item.checked_at ?? item.checkedAt ?? item.date,
      ),
    })),
  }
}

export function parseEquifaxReport(payload) {
  const root = unwrap(payload)
  const report = root.report ?? root
  const summary = root.summary ?? report.summary ?? null
  return {
    summary,
    report: typeof report === 'object' ? report : null,
    score: toNum(report?.score ?? root.score),
    scoreBand: report?.score_band ?? report?.scoreBand ?? root.score_band ?? null,
    status: report?.status ?? root.status ?? null,
    generatedAt: formatDate(report?.generated_at ?? report?.generatedAt ?? root.generated_at),
    disclaimer: report?.disclaimer ?? root.disclaimer ?? null,
    creditReportId: root.creditReportId ?? root.credit_report_id ?? report?.creditReportId ?? null,
    message: root.message ?? payload?.message ?? null,
  }
}

export function parseEquifaxReportSection(payload) {
  const root = unwrap(payload)
  return {
    section: root.section ?? null,
    data: root.data ?? root.section_data ?? root,
    message: root.message ?? payload?.message ?? null,
  }
}

export function parseEquifaxMonitoring(payload) {
  const root = unwrap(payload)
  const alertsRaw = root.alerts ?? root.items ?? root.changes ?? []
  const alerts = (Array.isArray(alertsRaw) ? alertsRaw : []).map((item, i) => ({
    id: String(item.alert_id ?? item.alertId ?? item.id ?? `alert-${i}`),
    type: item.alert_type ?? item.alertType ?? item.type ?? 'Alert',
    date: formatDate(item.alert_date ?? item.alertDate ?? item.date ?? item.created_at),
    rawDate: item.alert_date ?? item.alertDate ?? item.date ?? null,
    description: item.description ?? item.message ?? item.summary ?? null,
  }))
  return {
    synced: Boolean(root.synced ?? root.sync),
    enrolled: alerts.length > 0 || Boolean(root.enrolled ?? root.active),
    status: root.status ?? null,
    alerts,
    message: root.message ?? payload?.message ?? null,
  }
}

export function parseEquifaxMonitoringAlert(payload) {
  const root = unwrap(payload)
  const alert = root.alert ?? root.data ?? root
  return {
    id: String(alert.alert_id ?? alert.alertId ?? alert.id ?? ''),
    type: alert.alert_type ?? alert.alertType ?? alert.type ?? 'Alert',
    date: formatDate(alert.alert_date ?? alert.alertDate ?? alert.date),
    description: alert.description ?? alert.message ?? alert.summary ?? null,
    detail: alert,
    message: root.message ?? payload?.message ?? null,
  }
}

export function mapEquifaxApiError(err) {
  const status = err?.status
  const data = err?.data
  const code = data?.errorCode ?? data?.code ?? data?.error_code ?? err?.errorCode ?? null
  const message = (typeof data?.message === 'string' && data.message.trim())
    || (typeof err?.message === 'string' ? err.message : '')
    || 'Unable to complete Equifax request.'

  if (/client[_-]?id|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|api\.sandbox\.equifax|private[_-]?key/i.test(message)) {
    if (
      code === EQUIFAX_ERROR_CODES.CONFIG_INCOMPLETE
      || code === EQUIFAX_ERROR_CODES.AUTH_DOCS_REQUIRED
      || code === EQUIFAX_ERROR_CODES.DISABLED
      || status === 503
    ) {
      return {
        code: code || EQUIFAX_ERROR_CODES.CONFIG_INCOMPLETE,
        message: 'Equifax not configured yet',
        needsEnroll: false,
        needsLogin: false,
        configIncomplete: true,
      }
    }
    return {
      code,
      message: 'Unable to complete Equifax request. Please try again later.',
      needsEnroll: false,
      needsLogin: false,
      configIncomplete: false,
    }
  }

  switch (code) {
    case EQUIFAX_ERROR_CODES.CONFIG_INCOMPLETE:
    case EQUIFAX_ERROR_CODES.AUTH_DOCS_REQUIRED:
    case EQUIFAX_ERROR_CODES.DISABLED:
      return {
        code,
        message: 'Equifax not configured yet',
        needsEnroll: false,
        needsLogin: false,
        configIncomplete: true,
      }
    case EQUIFAX_ERROR_CODES.AUTH_FAILED:
    case EQUIFAX_ERROR_CODES.INVALID_TOKEN:
      return {
        code,
        message: status === 401
          ? 'Please sign in to continue.'
          : 'Credit bureau auth failed, try again',
        needsEnroll: false,
        needsLogin: status === 401 || code === EQUIFAX_ERROR_CODES.INVALID_TOKEN,
        configIncomplete: code === EQUIFAX_ERROR_CODES.AUTH_FAILED && status === 503,
      }
    case EQUIFAX_ERROR_CODES.ENROLLMENT_REQUIRED:
      return {
        code,
        message: message || 'Please complete Equifax enrollment first.',
        needsEnroll: true,
        needsLogin: false,
        configIncomplete: false,
      }
    case EQUIFAX_ERROR_CODES.RESOURCE_NOT_FOUND:
      return {
        code,
        message: message || 'Report/score not available',
        needsEnroll: false,
        needsLogin: false,
        configIncomplete: false,
      }
    case EQUIFAX_ERROR_CODES.RATE_LIMITED:
      return {
        code,
        message: message || 'Too many requests. Please wait and try again.',
        needsEnroll: false,
        needsLogin: false,
        configIncomplete: false,
      }
    case EQUIFAX_ERROR_CODES.FORBIDDEN:
      return {
        code,
        message: message || 'Product not entitled',
        needsEnroll: false,
        needsLogin: false,
        configIncomplete: false,
      }
    case EQUIFAX_ERROR_CODES.VALIDATION_ERROR:
      return {
        code,
        message: message || 'Please check the information you entered.',
        needsEnroll: false,
        needsLogin: false,
        configIncomplete: false,
      }
    default:
      break
  }

  if (status === 503) {
    return {
      code: code || EQUIFAX_ERROR_CODES.CONFIG_INCOMPLETE,
      message: 'Equifax not configured yet',
      needsEnroll: false,
      needsLogin: false,
      configIncomplete: true,
    }
  }
  if (status === 401) {
    return {
      code: code || EQUIFAX_ERROR_CODES.INVALID_TOKEN,
      message: 'Please sign in to continue.',
      needsEnroll: false,
      needsLogin: true,
      configIncomplete: false,
    }
  }
  if (status === 429) {
    return {
      code: code || EQUIFAX_ERROR_CODES.RATE_LIMITED,
      message: message || 'Too many requests. Please wait and try again.',
      needsEnroll: false,
      needsLogin: false,
      configIncomplete: false,
    }
  }
  if (status === 403) {
    return {
      code: code || EQUIFAX_ERROR_CODES.FORBIDDEN,
      message: message || 'Product not entitled',
      needsEnroll: false,
      needsLogin: false,
      configIncomplete: false,
    }
  }
  if (status === 404) {
    return {
      code: code || EQUIFAX_ERROR_CODES.RESOURCE_NOT_FOUND,
      message: message || 'Report/score not available',
      needsEnroll: code === EQUIFAX_ERROR_CODES.ENROLLMENT_REQUIRED,
      needsLogin: false,
      configIncomplete: false,
    }
  }
  if (status === 400 || status === 422) {
    return {
      code: code || EQUIFAX_ERROR_CODES.VALIDATION_ERROR,
      message: message || 'Please check the information you entered.',
      needsEnroll: false,
      needsLogin: false,
      configIncomplete: false,
    }
  }

  return { code, message, needsEnroll: false, needsLogin: false, configIncomplete: false }
}
