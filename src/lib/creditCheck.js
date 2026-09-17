/**
 * Credit-check helpers — frontend talks ONLY to MoneyTrend /api (never Equifax directly).
 */

export const CREDIT_CONSENT_VERSION = 'v1.0'

export const CREDIT_BUREAUS = [
  { key: 'cibil', label: 'CIBIL', apiKey: 'CIBIL' },
  { key: 'experian', label: 'Experian', apiKey: 'EXPERIAN' },
  { key: 'equifax', label: 'Equifax', apiKey: 'EQUIFAX' },
]

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
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

export function bureauDisplayName(bureau) {
  const key = String(bureau || '').toUpperCase()
  if (key === 'EXPERIAN') return 'Experian'
  if (key === 'EQUIFAX') return 'Equifax'
  if (key === 'CIBIL') return 'CIBIL'
  return key || 'Credit'
}

function toScoreNum(score) {
  if (score == null || score === '') return null
  const num = Number(score)
  return Number.isNaN(num) ? null : num
}

function normalizeStatus(status) {
  return String(status || 'unknown').toLowerCase()
}

function normalizeBureauEntry(raw, fallbackBureau = 'CIBIL') {
  if (!raw || typeof raw !== 'object') return null
  const bureau = String(raw.bureau ?? raw.provider ?? fallbackBureau).toUpperCase()
  const score = toScoreNum(raw.score)
  const scoreBand = raw.score_band ?? raw.scoreBand ?? raw.band ?? null
  const status = normalizeStatus(raw.status ?? (score != null ? 'SUCCESS' : 'unknown'))
  const checkedAt = raw.checked_at
    ?? raw.checkedAt
    ?? raw.created_at
    ?? raw.createdAt
    ?? raw.report_date
    ?? null
  const referenceId = raw.report_ref_id
    ?? raw.reportRefId
    ?? raw.reference_id
    ?? raw.referenceId
    ?? null
  const id = raw.id != null && raw.id !== '' ? raw.id : null

  // Keep PENDING rows even without a score yet (sandbox / async bureau)
  if (score == null && !referenceId && !id && status !== 'pending' && status !== 'success') {
    return null
  }

  return {
    id,
    provider: bureau,
    bureau,
    score,
    scoreBand: getScoreBandLabel(score, scoreBand),
    scoreLabel: raw.score_label ?? raw.scoreLabel ?? `${bureauDisplayName(bureau)} Score`,
    referenceId: referenceId != null ? String(referenceId) : null,
    status,
    checkedAt,
    checkedAtLabel: formatCreditDate(checkedAt),
    reportAvailable: Boolean(
      raw.reportAvailable
      ?? raw.report_available
      ?? (score != null && status === 'success'),
    ),
    reportUrl: id ? `/api/credit-check/${id}/report` : null,
    noMatch: status === 'no_match' || status === 'not_found',
    pending: status === 'pending',
  }
}

function pickBureauFromMap(map, key) {
  if (!map || typeof map !== 'object') return null
  return map[key] ?? map[key?.toLowerCase?.()] ?? map[key?.toUpperCase?.()] ?? null
}

function mergeBureauSources(...sources) {
  const merged = {}
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue
    Object.assign(merged, src)
  }
  return Object.keys(merged).length ? merged : null
}

export function extractBureauScores(root) {
  const data = unwrap(root)
  const scores = data.scores ?? {}
  const byBureau = data.scores_by_bureau ?? data.scoresByBureau ?? {}
  const checks = Array.isArray(data.checks) ? data.checks : []
  const latestChecks = Array.isArray(data.latest_checks) ? data.latest_checks : []

  const findInLists = (apiKey) =>
    [...checks, ...latestChecks].find(
      (c) => String(c?.bureau || c?.provider || '').toUpperCase() === apiKey,
    ) || null

  return {
    cibil: normalizeBureauEntry(
      mergeBureauSources(
        data.cibil_score,
        scores.cibil,
        findInLists('CIBIL'),
        pickBureauFromMap(byBureau, 'CIBIL'),
      ),
      'CIBIL',
    ),
    experian: normalizeBureauEntry(
      mergeBureauSources(
        data.experian_score,
        scores.experian,
        findInLists('EXPERIAN'),
        pickBureauFromMap(byBureau, 'EXPERIAN'),
      ),
      'EXPERIAN',
    ),
    equifax: normalizeBureauEntry(
      mergeBureauSources(
        data.equifax_score,
        scores.equifax,
        findInLists('EQUIFAX'),
        pickBureauFromMap(byBureau, 'EQUIFAX'),
      ),
      'EQUIFAX',
    ),
  }
}

export function parseCreditReport(payload) {
  const root = unwrap(payload)
  const report = root.report ?? root
  const accounts = mapAccounts(report.accounts ?? root.accounts)
  const enquiries = mapEnquiries(report.enquiries ?? root.enquiries)
  const insights = parseInsights(report.insights ?? root.insights)

  return {
    checkId: report.check_id ?? report.id ?? root.id ?? null,
    bureau: String(report.bureau ?? report.provider ?? root.provider ?? 'CIBIL').toUpperCase(),
    scoreLabel: report.score_label ?? report.scoreLabel ?? root.scoreLabel ?? null,
    score: toScoreNum(report.score ?? root.score),
    scoreBand: getScoreBandLabel(report.score ?? root.score, report.score_band ?? report.scoreBand ?? root.scoreBand),
    status: report.status ?? root.status ?? '—',
    reportRefId: report.report_ref_id ?? report.reportRefId ?? root.referenceId ?? null,
    reportDate: formatCreditDate(report.report_date ?? report.reportDate),
    pan: report.pan_number ?? report.pan ?? report.panNumber ?? root.pan ?? null,
    generatedAt: formatCreditDate(report.generated_at ?? report.generatedAt),
    disclaimer: report.disclaimer ?? root.disclaimer ?? null,
    isMock: Boolean(report.is_mock ?? report.isMock ?? root.is_mock ?? root.isMock),
    summary: report.summary ?? report.result_summary ?? null,
    insights,
    accounts,
    enquiries,
  }
}

function mapAccounts(list) {
  if (!Array.isArray(list)) return []
  return list.map((a) => ({
    accountType: a.account_type ?? a.accountType ?? '—',
    lender: a.lender ?? '—',
    status: a.status ?? '—',
    creditLimit: a.credit_limit ?? a.creditLimit ?? null,
    currentBalance: a.current_balance ?? a.currentBalance ?? null,
    overdueAmount: a.overdue_amount ?? a.overdueAmount ?? null,
    paymentHistory: a.payment_history ?? a.paymentHistory ?? null,
  }))
}

function mapEnquiries(list) {
  if (!Array.isArray(list)) return []
  return list.map((e) => ({
    date: formatCreditDate(e.date ?? e.enquiry_date ?? e.enquiryDate),
    lender: e.lender ?? '—',
    purpose: e.purpose ?? '—',
  }))
}

export function parseInsights(raw) {
  if (!raw || typeof raw !== 'object') return null
  const num = (v) => {
    if (v == null || v === '') return null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  }
  return {
    totalAccounts: num(raw.total_accounts ?? raw.totalAccounts),
    activeAccounts: num(raw.active_accounts ?? raw.activeAccounts),
    closedAccounts: num(raw.closed_accounts ?? raw.closedAccounts),
    creditCards: num(raw.credit_cards ?? raw.creditCards),
    loans: num(raw.loans),
    totalEnquiries: num(raw.total_enquiries ?? raw.totalEnquiries),
    overdueAccounts: num(raw.overdue_accounts ?? raw.overdueAccounts),
    totalOverdueAmount: num(raw.total_overdue_amount ?? raw.totalOverdueAmount),
  }
}

export function buildInlineReportFromResult(result) {
  if (!result) return null
  const hasBody = Boolean(
    result.insights
    || result.accounts?.length
    || result.enquiries?.length
    || result.disclaimer
    || result.isMock
    || result.score != null,
  )
  if (!hasBody) return null
  return {
    checkId: result.id,
    bureau: result.provider || 'CIBIL',
    scoreLabel: result.scoreLabel,
    score: result.score,
    scoreBand: result.scoreBand,
    status: result.status,
    reportRefId: result.referenceId,
    reportDate: result.checkedAtLabel,
    pan: null,
    generatedAt: result.checkedAtLabel,
    disclaimer: result.disclaimer,
    isMock: Boolean(result.isMock),
    summary: null,
    insights: result.insights || null,
    accounts: Array.isArray(result.accounts) ? result.accounts : [],
    enquiries: Array.isArray(result.enquiries) ? result.enquiries : [],
  }
}

export function buildReportDownloadUrl(checkId, { mobile, download = false } = {}) {
  if (!checkId) return null
  const q = new URLSearchParams()
  if (mobile) q.set('mobile', String(mobile).replace(/\D/g, ''))
  if (download) q.set('download', '1')
  const qs = q.toString()
  return `/api/credit-check/${encodeURIComponent(checkId)}/report${qs ? `?${qs}` : ''}`
}

export function extractCreditScore(source) {
  if (source == null) return null
  const credit = source.credit_score ?? source.creditScore ?? source
  const cibil = credit?.cibil_score ?? credit?.cibilScore ?? credit
  const score = cibil?.score ?? credit?.score ?? source.score ?? null
  return toScoreNum(score)
}

export function parseCreditCheckResult(payload) {
  const root = unwrap(payload)
  const item = root.check
    ?? root.result
    ?? root.credit_check
    ?? root.creditCheck
    ?? root.report
    ?? root.primary_score
    ?? root

  const bureauScores = extractBureauScores(root)

  // Prefer top-level POST fields (provider/score) then primary_score then suite
  const topLevel = normalizeBureauEntry({
    bureau: root.provider ?? root.bureau ?? item.bureau ?? item.provider,
    provider: root.provider ?? item.provider,
    score: root.score ?? item.score,
    scoreBand: root.scoreBand ?? root.score_band ?? item.score_band,
    scoreLabel: root.scoreLabel ?? root.score_label ?? item.score_label,
    status: root.status ?? item.status,
    referenceId: root.referenceId ?? root.reference_id ?? item.report_ref_id,
    report_ref_id: root.referenceId ?? item.report_ref_id,
    reportAvailable: root.reportAvailable ?? item.reportAvailable,
    id: item.id ?? root.check?.id ?? root.id,
    checked_at: item.created_at ?? item.checked_at ?? root.primary_score?.checked_at,
  }, root.provider || 'CIBIL')

  const primaryFromSuite = bureauScores.cibil
    || bureauScores.experian
    || bureauScores.equifax
  const primary = topLevel || normalizeBureauEntry(item, item.bureau || item.provider || 'CIBIL') || primaryFromSuite

  const score = primary?.score ?? extractCreditScore(root) ?? toScoreNum(root.score)
  const provider = primary?.provider
    ?? root.provider
    ?? item.provider
    ?? item.bureau
    ?? 'CIBIL'

  const storedBureaus = (root.stored_bureaus ?? root.storedBureaus ?? [])
    .map((b) => String(b).toUpperCase())

  const availableBureaus = CREDIT_BUREAUS
    .filter((b) => {
      const entry = bureauScores[b.key]
      return entry?.score != null
        || entry?.pending
        || entry?.id
        || storedBureaus.includes(b.apiKey)
        || String(provider).toUpperCase() === b.apiKey
    })
    .map((b) => b.key)

  if (!availableBureaus.length && (score != null || primary?.pending)) {
    availableBureaus.push(String(provider).toLowerCase() === 'experian' || String(provider).toLowerCase() === 'equifax'
      ? String(provider).toLowerCase()
      : 'cibil')
  }

  const status = normalizeStatus(
    root.status ?? item.status ?? primary?.status ?? (score != null ? 'SUCCESS' : 'unknown'),
  )

  const noMatch = status === 'no_match'
    || status === 'not_found'
    || Boolean(item.no_match ?? item.noMatch)
    || (score == null && !primary?.pending && status !== 'pending' && availableBureaus.length === 0)

  const checkId = item.id
    ?? root.check?.id
    ?? primary?.id
    ?? null

  let reportDownload = root.report_download ?? root.reportDownload ?? primary?.reportUrl ?? null
  if (!reportDownload && checkId) {
    reportDownload = `/api/credit-check/${checkId}/report`
  }

  const accounts = mapAccounts(
    root.accounts
    ?? root.report?.accounts
    ?? item.accounts
    ?? [],
  )
  const enquiries = mapEnquiries(
    root.enquiries
    ?? root.report?.enquiries
    ?? item.enquiries
    ?? [],
  )
  const insights = parseInsights(root.insights ?? root.report?.insights ?? item.insights)
  const isMock = Boolean(root.is_mock ?? root.isMock ?? root.report?.is_mock)
  const disclaimer = root.disclaimer ?? root.report?.disclaimer ?? item.disclaimer ?? null

  return {
    id: checkId,
    provider: String(provider).toUpperCase(),
    score,
    scoreBand: primary?.scoreBand
      ?? getScoreBandLabel(score, root.scoreBand ?? root.score_band),
    scoreLabel: primary?.scoreLabel
      ?? root.scoreLabel
      ?? root.score_label
      ?? 'CIBIL Score',
    referenceId: primary?.referenceId
      ?? (root.referenceId != null ? String(root.referenceId) : null),
    status,
    pending: status === 'pending',
    checkedAt: primary?.checkedAt ?? root.primary_score?.checked_at ?? null,
    checkedAtLabel: primary?.checkedAtLabel
      ?? formatCreditDate(root.primary_score?.checked_at),
    reportAvailable: Boolean(
      root.reportAvailable
      ?? root.report_available
      ?? primary?.reportAvailable
      ?? (score != null && status === 'success'),
    ),
    reportDownload,
    noMatch,
    loginRequired: Boolean(root.loginRequired ?? root.login_required),
    message: item.message ?? root.message ?? payload?.message ?? null,
    errorCode: root.errorCode ?? payload?.errorCode ?? null,
    suite: root.suite ?? item.suite ?? null,
    storedBureaus,
    suiteErrors: root.suite_errors ?? root.suiteErrors ?? [],
    bureauScores,
    availableBureaus: [...new Set(availableBureaus)],
    insights,
    accounts,
    enquiries,
    isMock,
    disclaimer,
    rawSafe: {
      provider: String(provider).toUpperCase(),
      score,
      referenceId: primary?.referenceId,
      status,
      availableBureaus,
      storedBureaus,
      isMock,
    },
  }
}

export function parseCreditCheckHistory(payload) {
  const root = unwrap(payload)
  const items = Array.isArray(root)
    ? root
    : (root.credit_checks
      ?? root.creditChecks
      ?? root.items
      ?? root.results
      ?? root.checks
      ?? root.latest_checks
      ?? [])

  return {
    count: root.count ?? items.length,
    items: items.map((item) => parseCreditCheckResult({ data: item })),
  }
}

export function parseLatestCreditCheck(payload) {
  const root = unwrap(payload)
  if (!root || (root.success === false && !root.score && !root.primary_score && !root.scores_by_bureau)) {
    return null
  }
  if (root.latest === null || root.credit_check === null) return null

  // Prefer primary_score for the main card when present
  const parsed = parseCreditCheckResult({
    data: {
      ...root,
      provider: root.primary_score?.bureau ?? root.provider,
      score: root.primary_score?.score ?? root.cibil_score?.score ?? root.score,
      scoreBand: root.primary_score?.score_band ?? root.scoreBand,
      scoreLabel: root.primary_score?.score_label ?? root.scoreLabel,
      status: root.primary_score?.status ?? root.status,
      referenceId: root.primary_score?.report_ref_id ?? root.referenceId,
    },
  })

  if (
    parsed.score == null
    && !parsed.availableBureaus.length
    && !parsed.referenceId
    && !parsed.pending
  ) {
    return null
  }
  return parsed
}

/** Format backend retryAfter (seconds or ISO date) for UI. */
export function formatRetryAfter(retryAfter) {
  if (retryAfter == null || retryAfter === '') return ''
  const n = Number(retryAfter)
  if (!Number.isNaN(n) && n > 0) {
    if (n >= 86400) {
      const d = Math.ceil(n / 86400)
      return ` Next check available in about ${d} day${d === 1 ? '' : 's'}.`
    }
    if (n >= 3600) {
      const h = Math.ceil(n / 3600)
      return ` Next check available in about ${h} hour${h === 1 ? '' : 's'}.`
    }
    if (n >= 60) {
      const m = Math.ceil(n / 60)
      return ` Try again in about ${m} minute${m === 1 ? '' : 's'}.`
    }
    return ` Try again in ${Math.ceil(n)}s.`
  }
  const d = new Date(retryAfter)
  if (!Number.isNaN(d.getTime())) {
    return ` Next check available after ${d.toLocaleString('en-IN')}.`
  }
  return ''
}

export function mapCreditApiError(err) {
  const status = err?.status
  const data = err?.data
  const detailed = extractValidationMessage(data)
  const retryAfter = data?.retryAfter ?? data?.retry_after
  const fallback = detailed || err?.message || 'Unable to complete the credit check.'

  if (/experian|equifax|access[_-]?token|refresh[_-]?token|client[_-]?secret|client[_-]?id|password/i.test(fallback)) {
    if (status === 400 || status === 422) return 'Please check the information you entered.'
    return 'Unable to complete the credit check. Please try again later.'
  }

  switch (status) {
    case 400:
    case 422:
      return detailed || 'Please check the information you entered (consent, mobile, PAN, DOB).'
    case 401:
      return 'Please sign in to continue.'
    case 403: {
      const code = String(data?.errorCode ?? data?.code ?? '').toUpperCase()
      if (
        code.includes('LOGIN')
        || code.includes('AUTH')
        || /sign in|log in|login required|authentication/i.test(detailed || fallback)
      ) {
        return detailed || 'Please sign in to view the full credit report.'
      }
      return detailed || 'Please sign in to view the full credit report.'
    }
    case 404:
      return 'Credit information could not be matched.'
    case 409:
      return 'A credit check is already in progress. Please wait a moment.'
    case 429: {
      const code = data?.errorCode ? ` (${data.errorCode})` : ''
      const wait = formatRetryAfter(retryAfter)
      return (detailed || 'A credit check was already done recently for these details.') + code + wait
    }
    case 502:
    case 503:
    case 504:
      return 'Credit bureau service is temporarily unavailable. Please try again later.'
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

/**
 * POST /api/credit-check body (MoneyTrend only).
 * Guest form:
 * { full_name, pan, mobile, date_of_birth, consent_given, consent_version, bureau }
 * Logged-in KYC: { consent_given, consent_version, bureau }
 */
export function buildCreditCheckPayload(form, { loggedInKyc = false, bureau = 'CIBIL' } = {}) {
  const consentGiven = Boolean(form.consent ?? form.consent_given ?? form.consentGiven)
  const payload = {
    consent_given: consentGiven,
    consent_version: form.consentVersion || form.consent_version || CREDIT_CONSENT_VERSION,
    bureau: String(form.bureau || bureau).toUpperCase(),
  }

  const pan = String(form.pan || '').trim().toUpperCase()
  const fullName = String(form.fullName || form.full_name || '').trim()
  const mobile = String(form.mobile || form.phone || '').replace(/\D/g, '')
  const dob = form.dateOfBirth || form.date_of_birth || form.dob || ''

  // Logged-in with verified KYC can omit applicant PII
  if (loggedInKyc && !pan && !fullName) {
    return payload
  }

  payload.full_name = fullName
  payload.pan = pan
  payload.mobile = mobile
  payload.date_of_birth = dob

  return payload
}

export function selectBureauResult(result, bureauKey = 'cibil') {
  if (!result) return null
  const key = String(bureauKey || 'cibil').toLowerCase()
  const fromMap = result.bureauScores?.[key]
  if (fromMap && (fromMap.score != null || fromMap.pending || fromMap.id)) {
    return { ...result, ...fromMap, selectedBureau: key }
  }
  if (result.score != null && String(result.provider).toLowerCase() === key) {
    return { ...result, selectedBureau: key }
  }
  return {
    ...result,
    selectedBureau: key,
    score: fromMap?.score ?? null,
    pending: fromMap?.pending || result.pending,
    noMatch: !(fromMap?.pending),
  }
}

/** Poll latest until SUCCESS or attempts exhausted (PENDING → SUCCESS). */
export async function pollLatestCreditCheck(fetchLatest, { attempts = 10, delayMs = 1500 } = {}) {
  let last = null
  for (let i = 0; i < attempts; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    last = await fetchLatest()
    if (last && !last.pending && (last.score != null || last.status === 'success' || last.status === 'failed')) {
      return last
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, delayMs))
  }
  return last
}
