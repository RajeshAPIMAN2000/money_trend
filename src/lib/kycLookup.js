/** Normalize person name for PAN/Aadhaar match checks. */
export function normalizePersonName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

export function namesMatch(a, b) {
  const left = normalizePersonName(a)
  const right = normalizePersonName(b)
  return Boolean(left && right && left === right)
}

/** Pull full name from KYC lookup API responses. */
export function extractLookupName(res) {
  const root = res?.data ?? res ?? {}
  const nested = root.pan ?? root.aadhaar ?? root.result ?? root.details ?? root.kyc ?? {}
  const candidates = [
    root.full_name,
    root.fullName,
    root.name,
    root.pan_full_name,
    root.aadhaar_full_name,
    nested.full_name,
    nested.fullName,
    nested.name,
    nested.pan_full_name,
  ]
  for (const value of candidates) {
    const text = String(value || '').trim()
    if (text) return text
  }
  return ''
}
