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
    emailMasked: root.email_masked ?? root.masked_email ?? root.email ?? null,
    expiresIn: root.expires_in ?? root.expiresIn ?? 600,
    message: root.message ?? response?.message ?? null,
    purpose: root.purpose ?? null,
  }
}

export function parseAdminAuthResponse(data) {
  const root = data?.data ?? data ?? {}
  const accessToken = root.accessToken ?? root.access_token ?? root.token ?? null
  const refreshToken = root.refreshToken ?? root.refresh_token ?? null
  const rawUser = root.user ?? root.admin ?? null
  let user = rawUser
  if (rawUser && typeof rawUser === 'object') {
    const collected = []
    const push = (val) => {
      if (val == null) return
      if (Array.isArray(val)) {
        val.forEach(push)
        return
      }
      if (typeof val === 'object') {
        push(val.id ?? val.slug ?? val.name ?? val.key ?? val.permission)
        return
      }
      const s = String(val).trim().toLowerCase()
      if (s) collected.push(s === 'blog' ? 'blogs' : s)
    }

    push(rawUser.roles)
    push(rawUser.role_list)
    push(rawUser.permissions)
    push(rawUser.modules)
    push(rawUser.allowed_modules)

    const singleRole = String(rawUser.role || '').trim().toLowerCase()
    if (singleRole && ['super_admin', 'superadmin', 'admin', 'seo', 'blogs', 'news'].includes(singleRole)) {
      push(singleRole)
    }

    const type = String(rawUser.type || rawUser.user_type || rawUser.admin_type || rawUser.role || '').toLowerCase()
    const isSub = ['sub_admin', 'subadmin', 'staff', 'editor'].includes(type)
    let roles = [...new Set(collected)]

    // Default only when clearly a full admin with no role payload
    if (!roles.length && !isSub) {
      roles = ['super_admin']
    }

    user = {
      ...rawUser,
      roles,
      type: rawUser.type || rawUser.user_type || (isSub ? 'sub_admin' : rawUser.type),
    }
  }

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
