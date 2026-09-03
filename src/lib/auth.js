const ACCESS_TOKEN_KEY = 'moneytrend-token'
const REFRESH_TOKEN_KEY = 'moneytrend-refresh-token'
const USER_KEY = 'moneytrend-user'

export function parseAuthResponse(data) {
  const root = data?.data ?? data ?? {}
  const accessToken = root.accessToken ?? root.access_token ?? root.token ?? null
  const refreshToken = root.refreshToken ?? root.refresh_token ?? null

  return {
    user: root.user ?? null,
    kyc: root.kyc ?? null,
    accessToken,
    refreshToken,
    nextStep: root.next_step ?? root.nextStep ?? null,
    message: data?.message ?? null,
  }
}

export function persistAuthSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function getPostAuthPath(nextStep) {
  switch (nextStep) {
    case 'kyc':
      return { type: 'kyc' }
    case 'nominee':
      return { type: 'route', path: '/onboarding/nominee' }
    case 'profile':
      return { type: 'route', path: '/profile' }
    default:
      return { type: 'route', path: '/' }
  }
}

export function extractOtpMeta(response) {
  const root = response?.data ?? response ?? {}
  return {
    phoneMasked: root.phone_masked ?? root.masked_phone ?? null,
    expiresIn: root.expires_in ?? 600,
    message: root.message ?? response?.message ?? null,
  }
}

export function parseAdminAuthResponse(data) {
  const root = data?.data ?? data ?? {}
  const accessToken = root.accessToken ?? root.access_token ?? root.token ?? null
  const refreshToken = root.refreshToken ?? root.refresh_token ?? null
  const user = root.user ?? root.admin ?? null

  return { accessToken, refreshToken, user, message: data?.message ?? null }
}

export function persistAdminSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    localStorage.setItem('moneytrend-admin-token', accessToken)
    localStorage.setItem('moneytrend-admin-auth', 'true')
  }
  if (refreshToken) {
    localStorage.setItem('moneytrend-admin-refresh-token', refreshToken)
  }
  if (user) {
    localStorage.setItem('moneytrend-admin-user', JSON.stringify(user))
  }
}

export function clearAdminSession() {
  localStorage.removeItem('moneytrend-admin-token')
  localStorage.removeItem('moneytrend-admin-refresh-token')
  localStorage.removeItem('moneytrend-admin-auth')
  localStorage.removeItem('moneytrend-admin-user')
}

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY }
