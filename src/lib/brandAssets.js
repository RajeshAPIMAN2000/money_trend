/**
 * Static brand / feature icons under /public/assets/images
 * Filenames match the product / goal names where possible.
 */

const IMG = '/assets/images'

export const GOAL_ICONS = {
  dream_house: `${IMG}/Dream%20House.png`,
  'dream home': `${IMG}/Dream%20House.png`,
  'dream house': `${IMG}/Dream%20House.png`,
  'home purchase': `${IMG}/Dream%20House.png`,
  home: `${IMG}/Dream%20House.png`,
  retirement: `${IMG}/Retirement%20Plan.png`,
  'retirement plan': `${IMG}/Retirement%20Plan.png`,
  child_education: `${IMG}/Child%20Education.png`,
  'child education': `${IMG}/Child%20Education.png`,
  education: `${IMG}/Child%20Education.png`,
  emergency_fund: `${IMG}/Emergency%20Fund.png`,
  'emergency fund': `${IMG}/Emergency%20Fund.png`,
  emergency: `${IMG}/Emergency%20Fund.png`,
  'goal planning': `${IMG}/Goal%20Planning.png`,
}

export const BUREAU_ICONS = {
  CIBIL: `${IMG}/transunion%20cibil.svg`,
  'TRANSUNION CIBIL': `${IMG}/transunion%20cibil.svg`,
  TRANSUNION: `${IMG}/transunion%20cibil.svg`,
  EXPERIAN: `${IMG}/experian.svg`,
  EQUIFAX: `${IMG}/equifax.svg`,
  CRIF: `${IMG}/crif.png`,
}

/** Resolve a goal icon by name (case-insensitive). */
export function goalIconSrc(name) {
  const key = String(name || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  const spaced = String(name || '').trim().toLowerCase()
  if (!key && !spaced) return null
  if (GOAL_ICONS[key]) return GOAL_ICONS[key]
  if (GOAL_ICONS[spaced]) return GOAL_ICONS[spaced]
  for (const [phrase, src] of Object.entries(GOAL_ICONS)) {
    if (spaced.includes(phrase) || phrase.includes(spaced) || key.includes(phrase.replace(/\s+/g, '_'))) {
      return src
    }
  }
  return null
}

/** Resolve bureau logo — CIBIL always uses TransUnion CIBIL asset. */
export function bureauIconSrc(bureau) {
  const key = String(bureau || 'CIBIL').toUpperCase().replace(/[-_]/g, ' ').trim()
  if (key.includes('CIBIL') || key.includes('TRANSUNION')) {
    return BUREAU_ICONS.CIBIL
  }
  return BUREAU_ICONS[key] || BUREAU_ICONS.CIBIL
}

export const TRANSUNION_CIBIL_ICON = BUREAU_ICONS.CIBIL
