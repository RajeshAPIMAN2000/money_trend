const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

function getToken() {
  return localStorage.getItem('moneytrend-token')
}

function getAdminToken() {
  return localStorage.getItem('moneytrend-admin-token')
}

async function request(path, options = {}) {
  const { admin = false, body, headers = {}, ...rest } = options
  const token = admin ? getAdminToken() : getToken()

  const config = {
    cache: 'no-store',
    credentials: 'include',
    ...rest,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      'Cache-Control': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }

  if (body instanceof FormData) {
    config.body = body
  } else if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, config)
  const text = await res.text()
  const data = text ? (() => {
    try { return JSON.parse(text) } catch { return { message: text } }
  })() : {}

  if (!res.ok) {
    throw new ApiError(data.error || data.message || 'Request failed', res.status, data)
  }

  if (data.success === false) {
    throw new ApiError(data.message || 'Request failed', res.status, data)
  }

  return data
}

export const api = {
  getMe: () => request('/auth/me'),

  // KYC
  submitManualKyc: (formData) => request('/kyc/manual', { method: 'POST', body: formData }),
  initDigiLocker: () => request('/kyc/digilocker/init', { method: 'POST' }),
  completeDigiLockerStub: () => request('/kyc/digilocker/complete-stub', { method: 'POST' }),
  getKycStatus: () => request('/kyc/status'),

  // Nominee
  submitNominees: (nominees) => request('/nominee', { method: 'POST', body: { nominees } }),
  getNominees: () => request('/nominee'),

  // Admin
  adminLogin: (data) => request('/admin/login', { method: 'POST', body: data }),
  getAdminDashboard: () => request('/admin/dashboard', { admin: true }),
  getAdminUsers: () => request('/admin/users', { admin: true }),
  getAdminUser: (id) => request(`/admin/users/${encodeURIComponent(id)}`, { admin: true }),
  updateUserKycStatus: (id, body) =>
    request(`/admin/users/${encodeURIComponent(id)}/kyc-status`, { method: 'PATCH', body, admin: true }),

  // Admin Investments
  getAdminFixedDeposits: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/investments/fixed-deposits${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminFixedDeposit: (id) =>
    request(`/admin/investments/fixed-deposits/${encodeURIComponent(id)}`, { admin: true }),
  getAdminRecurringDeposits: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/investments/recurring-deposits${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminRecurringDeposit: (id) =>
    request(`/admin/investments/recurring-deposits/${encodeURIComponent(id)}`, { admin: true }),
  getAdminFundPerformance: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/investments/fund-performance${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminAssetAllocation: () => request('/admin/investments/asset-allocation', { admin: true }),
  getAdminUserPortfolio: (userId) =>
    request(`/admin/investments/portfolio/users/${encodeURIComponent(userId)}`, { admin: true }),

  // Admin Transactions
  getAdminDeposits: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/investments/deposits${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminDeposit: (id) =>
    request(`/admin/investments/deposits/${encodeURIComponent(id)}`, { admin: true }),
  getAdminUserDeposits: (userId) =>
    request(`/admin/investments/deposits/users/${encodeURIComponent(userId)}`, { admin: true }),
  getAdminOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/investments/orders${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminOrder: (id) =>
    request(`/admin/investments/orders/${encodeURIComponent(id)}`, { admin: true }),
  getAdminWithdrawals: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/withdrawals${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminWithdrawal: (id) =>
    request(`/admin/investments/withdrawals/${encodeURIComponent(id)}`, { admin: true }),
  getAdminTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/investments/transactions${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminTransaction: (id) =>
    request(`/admin/investments/transactions/${encodeURIComponent(id)}`, { admin: true }),

  // Admin Content — News
  getAdminNews: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/news${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminNewsItem: (id) =>
    request(`/admin/news/${encodeURIComponent(id)}`, { admin: true }),
  createAdminNews: (formData) =>
    request('/admin/news', { method: 'POST', body: formData, admin: true }),
  updateAdminNews: (id, formData) =>
    request(`/admin/news/${encodeURIComponent(id)}`, { method: 'PUT', body: formData, admin: true }),
  deleteAdminNews: (id) =>
    request(`/admin/news/${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),

  // Admin Content — Blogs
  getAdminBlogs: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/blogs${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminBlog: (id) =>
    request(`/admin/blogs/${encodeURIComponent(id)}`, { admin: true }),
  createAdminBlog: (formData) =>
    request('/admin/blogs', { method: 'POST', body: formData, admin: true }),
  updateAdminBlog: (id, formData) =>
    request(`/admin/blogs/${encodeURIComponent(id)}`, { method: 'PUT', body: formData, admin: true }),
  deleteAdminBlog: (id) =>
    request(`/admin/blogs/${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),

  // Admin Content — Banners
  getAdminBanners: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/banners${q ? `?${q}` : ''}`, { admin: true })
  },
  getAdminBanner: (id) =>
    request(`/admin/banners/${encodeURIComponent(id)}`, { admin: true }),
  createAdminBanner: (formData) =>
    request('/admin/banners', { method: 'POST', body: formData, admin: true }),
  updateAdminBanner: (id, formData) =>
    request(`/banners/${encodeURIComponent(id)}`, { method: 'PUT', body: formData, admin: true }),
  deleteAdminBanner: (id) =>
    request(`/banners/${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),

  // Market / FD & RD
  getMarketRates: () => request('/market/rates'),
  getMarketBanks: () => request('/market/banks'),
  getBank: (id) => request(`/market/banks/${encodeURIComponent(id)}`),
  getBankRates: (id) => request(`/market/banks/${encodeURIComponent(id)}/rates`),
  getBankHistory: (id, period = '1_year') =>
    request(`/market/banks/${encodeURIComponent(id)}/history?period=${encodeURIComponent(period)}`),
  getMarketBanksHistoryTrend: () => request('/market/banks/history/trend'),
  getMarketHistory: (period) => request(`/market/history?period=${encodeURIComponent(period)}`),
  getMarketRepoHistory: () => request('/market/repo-history'),

  // CIBIL / Civil Score
  sendCibilOtp: (data) => request('/cibil/otp/send', { method: 'POST', body: data }),
  verifyCibilOtp: (data) => request('/cibil/otp/verify', { method: 'POST', body: data }),
  getCibilScores: (data) => request('/cibil/scores', { method: 'POST', body: data }),

  // Home
  getHome: () => request('/home'),
  getHomeProducts: () => request('/home/products'),
  getHomeCompare: (params = {}) => {
    const q = new URLSearchParams()
    if (params.type) q.set('type', params.type)
    if (params.tenure) q.set('tenure', params.tenure)
    if (params.amount != null) q.set('amount', String(params.amount))
    const query = q.toString()
    return request(`/home/compare${query ? `?${query}` : ''}`)
  },
  getHomeFull: () => request('/home/full'),
  getHomeDashboard: () => request('/home/dashboard'),

  // Articles — Blogs & News
  getBlogs: ({ limit = 10, offset = 0 } = {}) =>
    request(`/articles/blogs?limit=${limit}&offset=${offset}`),
  getBlog: (id) => request(`/articles/blogs/${encodeURIComponent(id)}`),
  getNews: ({ limit = 10, offset = 0 } = {}) =>
    request(`/articles/news?limit=${limit}&offset=${offset}`),
  getNewsArticle: (id) => request(`/articles/news/${encodeURIComponent(id)}`),
}

export { ApiError, getToken, getAdminToken, request }
