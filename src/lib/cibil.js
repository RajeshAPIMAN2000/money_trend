/** Score helpers for credit-check UI. No OTP / no direct bureau calls. */

export function getScoreLabel(score) {
  if (score >= 750) return 'Very Good'
  if (score >= 650) return 'Good'
  if (score >= 550) return 'Fair'
  return 'Needs Work'
}

export function maskPhone(phone) {
  const clean = String(phone || '').replace(/\D/g, '')
  if (clean.length < 4) return clean
  return `+91 ${'*'.repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`
}
