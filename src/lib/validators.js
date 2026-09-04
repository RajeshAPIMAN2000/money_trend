export const NAME_RE = /^[a-zA-Z\s]+$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^[6-9]\d{9}$/
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
export const AADHAAR_RE = /^\d{12}$/

export function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', checks: {} }
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
  const score = Object.values(checks).filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  return { score, label: labels[score], checks }
}

export function isPasswordValid(pw) {
  const { score } = passwordStrength(pw)
  return score >= 5
}

export function maskAadhaar(num) {
  const clean = String(num || '').replace(/\s/g, '')
  if (clean.length < 4) return clean
  return `XXXX-XXXX-${clean.slice(-4)}`
}

export function formatAadhaarInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function isMinor(dob) {
  if (!dob) return false
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age < 18
}

export const RELATIONSHIPS = [
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandson',
  'Granddaughter',
  'Father-in-law',
  'Mother-in-law',
  'Son-in-law',
  'Daughter-in-law',
  'Others',
]
export const ID_PROOF_TYPES = ['Aadhaar', 'PAN', 'Passport', 'Driving License']
