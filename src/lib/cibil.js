export const CIBIL_BUREAUS = [
  { id: 'experian', name: 'Experian', shortName: 'Experian', color: '#4A90E2' },
  { id: 'transunion', name: 'TransUnion (CIBIL)', shortName: 'TransUnion', color: '#F39C12' },
  { id: 'equifax', name: 'Equifax', shortName: 'Equifax', color: '#92C44E' },
]

export function getScoreLabel(score) {
  if (score >= 750) return 'Very Good'
  if (score >= 650) return 'Good'
  if (score >= 550) return 'Fair'
  return 'Needs Work'
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function maskPhone(phone) {
  const clean = String(phone || '').replace(/\D/g, '')
  if (clean.length < 4) return clean
  return `+91 ${'*'.repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function generateBureauScores({ pan, phone, name }) {
  const seed = hashString(`${pan}|${phone}|${name}`.toUpperCase())

  return CIBIL_BUREAUS.map((bureau, index) => {
    const offset = (seed + index * 37) % 180
    const score = 520 + offset
    return {
      ...bureau,
      score,
      label: getScoreLabel(score),
      reportDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
  })
}
