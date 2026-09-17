const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
    this.errorCode = data?.errorCode ?? data?.code ?? data?.error_code ?? null
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

  // Nominee — POST /api/kyc/nominee (multipart)
  submitNominee: (formData) => request('/kyc/nominee', { method: 'POST', body: formData }),
  // legacy alias
  submitNominees: (formData) => request('/kyc/nominee', { method: 'POST', body: formData }),
  getNominees: () => request('/kyc/nominee'),

  // Admin
  adminLogin: (data) => request('/admin/login', { method: 'POST', body: data }),
  getAdminDashboard: () => request('/admin/dashboard', { admin: true }),
  getAdminUsers: () => request('/admin/users', { admin: true }),
  getAdminUser: (id) => request(`/admin/users/${encodeURIComponent(id)}`, { admin: true }),
  updateUserKycStatus: (id, body) =>
    request(`/admin/users/${encodeURIComponent(id)}/kyc-status`, { method: 'PATCH', body, admin: true }),

  // Sub-admins (created by Super Admin — email, password, phone, roles)
  getAdminSubAdmins: () => request('/admin/sub-admins', { admin: true }),
  getAdminSubAdmin: (id) =>
    request(`/admin/sub-admins/${encodeURIComponent(id)}`, { admin: true }),
  createAdminSubAdmin: (body) =>
    request('/admin/sub-admins', { method: 'POST', body, admin: true }),
  updateAdminSubAdmin: (id, body) =>
    request(`/admin/sub-admins/${encodeURIComponent(id)}`, { method: 'PUT', body, admin: true }),
  deleteAdminSubAdmin: (id) =>
    request(`/admin/sub-admins/${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),

  // SEO management (admin)
  getAdminSeoPages: () => request('/admin/seo/pages', { admin: true }),
  upsertAdminSeoPage: (body) =>
    request('/admin/seo/page', { method: 'PUT', body, admin: true }),
  getAdminSeoSettings: () => request('/admin/seo/settings', { admin: true }),
  updateAdminSeoSettings: (body) =>
    request('/admin/seo/settings', { method: 'PUT', body, admin: true }),
  /** Combined fallback if split endpoints are unavailable */
  getAdminSeo: () => request('/admin/seo', { admin: true }),
  updateAdminSeo: (body) =>
    request('/admin/seo', { method: 'PUT', body, admin: true }),

  // SEO public (frontend / Google)
  getSeoPage: (path) => {
    const q = new URLSearchParams({ path: String(path || '/home') })
    return request(`/seo/page?${q}`)
  },
  getSeoAnalytics: () => request('/seo/analytics'),
  /** Prefer API routes; backends may also serve root /sitemap.xml & /robots.txt */
  getSeoSitemapUrl: () => `${API_BASE}/sitemap.xml`,
  getSeoRobotsUrl: () => `${API_BASE}/robots.txt`,

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

  // Credit Check — public suite (CIBIL + Experian + Equifax)
  submitCreditCheck: (body) =>
    request('/credit-check', { method: 'POST', body }),
  runCreditCheck: (body) =>
    request('/credit-check/run', { method: 'POST', body }),
  getCreditCheckLatest: (params = {}) => {
    const q = new URLSearchParams()
    if (params.mobile) q.set('mobile', String(params.mobile).replace(/\D/g, ''))
    const qs = q.toString()
    return request(`/credit-check/latest${qs ? `?${qs}` : ''}`)
  },
  getCreditChecks: (params = {}) => {
    const q = new URLSearchParams()
    if (params.mobile) q.set('mobile', String(params.mobile).replace(/\D/g, ''))
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.offset != null) q.set('offset', String(params.offset))
    const qs = q.toString()
    return request(`/credit-check${qs ? `?${qs}` : ''}`)
  },
  getCreditCheckById: (id, params = {}) => {
    const q = new URLSearchParams()
    if (params.mobile) q.set('mobile', String(params.mobile).replace(/\D/g, ''))
    const qs = q.toString()
    return request(`/credit-check/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`)
  },
  getCreditCheckReportLatest: (params = {}) => {
    const q = new URLSearchParams()
    if (params.mobile) q.set('mobile', String(params.mobile).replace(/\D/g, ''))
    const qs = q.toString()
    return request(`/credit-check/report/latest${qs ? `?${qs}` : ''}`)
  },
  getCreditCheckReport: (id, params = {}) => {
    const q = new URLSearchParams()
    if (params.mobile) q.set('mobile', String(params.mobile).replace(/\D/g, ''))
    if (params.download) q.set('download', '1')
    const qs = q.toString()
    return request(`/credit-check/${encodeURIComponent(id)}/report${qs ? `?${qs}` : ''}`)
  },
  getAdminCreditChecks: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/credit-checks${q ? `?${q}` : ''}`, { admin: true })
  },

  /**
   * Equifax consumer engagement (authenticated) — MoneyTrend JWT only.
   * Tries /credit-check/* first, then /equifax/* fallback (never Equifax secrets).
   */
  enrollEquifax: async (body) => {
    try {
      return await request('/credit-check/enrollment', { method: 'POST', body })
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        return request('/equifax/enrollment', { method: 'POST', body })
      }
      throw err
    }
  },
  getEquifaxEnrollment: async () => {
    try {
      return await request('/credit-check/enrollment')
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        try {
          return await request('/equifax/enrollment')
        } catch (err2) {
          // Both missing enrollment / route → bubble original 404 as "not enrolled"
          throw err2?.status ? err2 : err
        }
      }
      throw err
    }
  },
  requestEquifaxScore: async (body) => {
    try {
      return await request('/credit-check/score', { method: 'POST', body })
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        return request('/equifax/credit-score', { method: 'POST', body })
      }
      throw err
    }
  },
  getEquifaxCreditScore: async (params = {}) => {
    const q = new URLSearchParams()
    if (params.featureName) q.set('featureName', String(params.featureName))
    if (params.scoreType) q.set('scoreType', String(params.scoreType))
    const qs = q.toString()
    const headers = params.featureName ? { featureName: String(params.featureName) } : {}
    try {
      return await request(`/credit-check/score/latest${qs ? `?${qs}` : ''}`, { headers })
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        return request(`/equifax/credit-score${qs ? `?${qs}` : ''}`, { headers })
      }
      throw err
    }
  },
  getEquifaxCreditScoreHistory: async (params = {}) => {
    const q = new URLSearchParams()
    if (params.historicalLimit != null) q.set('historicalLimit', String(params.historicalLimit))
    if (params.featureName) q.set('featureName', String(params.featureName))
    const qs = q.toString()
    try {
      return await request(`/credit-check/score/history${qs ? `?${qs}` : ''}`)
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        return request(`/equifax/credit-score/history${qs ? `?${qs}` : ''}`)
      }
      throw err
    }
  },
  getEquifaxCreditReport: async (params = {}) => {
    const q = new URLSearchParams()
    if (params.reportType) q.set('reportType', String(params.reportType))
    const qs = q.toString()
    try {
      return await request(`/credit-check/report${qs ? `?${qs}` : ''}`)
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        return request('/equifax/credit-report')
      }
      throw err
    }
  },
  getEquifaxReportSummary: (params = {}) => {
    const q = new URLSearchParams()
    if (params.creditReportId) q.set('creditReportId', String(params.creditReportId))
    const qs = q.toString()
    return request(`/credit-check/report/summary${qs ? `?${qs}` : ''}`)
  },
  getEquifaxReportDetails: (params = {}) => {
    const q = new URLSearchParams()
    if (params.creditReportId) q.set('creditReportId', String(params.creditReportId))
    if (params.section) q.set('section', String(params.section))
    const qs = q.toString()
    return request(`/credit-check/report/details${qs ? `?${qs}` : ''}`)
  },
  getEquifaxMonitoring: async (params = {}) => {
    const q = new URLSearchParams()
    if (params.sync != null) q.set('sync', String(Boolean(params.sync)))
    const qs = q.toString()
    try {
      return await request(`/credit-check/monitoring${qs ? `?${qs}` : ''}`)
    } catch (err) {
      if (err?.status === 404 || err?.status === 405) {
        return request('/equifax/credit-monitoring')
      }
      throw err
    }
  },
  getEquifaxMonitoringAlert: (alertId) =>
    request(`/credit-check/monitoring/${encodeURIComponent(alertId)}`),

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

  // User profile portfolio — GET /api/profile/portfolio (JWT required)
  getProfilePortfolio: () => request('/profile/portfolio'),
  getProfile: () => request('/profile'),
  updateProfile: (userId, body) =>
    request(`/profile/${encodeURIComponent(userId)}`, { method: 'PUT', body }),
  getBankAccount: () => request('/profile/bank-account'),
  /** POST /api/profile/bank-account — create / add */
  createBankAccount: (body) =>
    request('/profile/bank-account', { method: 'POST', body }),
  /** PUT /api/profile/bank-account — update */
  updateBankAccount: (body) =>
    request('/profile/bank-account', { method: 'PUT', body }),
  /** Alias — defaults to PUT (same handler as POST on backend) */
  saveBankAccount: (body, { method = 'PUT' } = {}) =>
    request('/profile/bank-account', { method, body }),

  // Support — user
  getSupportHelp: () => request('/support/help'),
  submitSupportTicket: (formData) =>
    request('/support', { method: 'POST', body: formData }),
  getMySupportTickets: (params = {}) => {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.offset != null) q.set('offset', String(params.offset))
    const qs = q.toString()
    return request(`/support${qs ? `?${qs}` : ''}`)
  },
  getMySupportTicket: (id) =>
    request(`/support/${encodeURIComponent(id)}`),

  // Support — admin
  getAdminSupportTickets: (params = {}) => {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.search) q.set('search', params.search)
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.offset != null) q.set('offset', String(params.offset))
    const qs = q.toString()
    return request(`/admin/support${qs ? `?${qs}` : ''}`, { admin: true })
  },
  getAdminSupportTicket: (id) =>
    request(`/admin/support/${encodeURIComponent(id)}`, { admin: true }),
  updateAdminSupportTicketStatus: (id, body) =>
    request(`/admin/support/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body,
      admin: true,
    }),

  // Articles — Blogs & News
  getBlogs: ({ limit = 10, offset = 0 } = {}) =>
    request(`/articles/blogs?limit=${limit}&offset=${offset}`),
  getBlog: (id) => request(`/articles/blogs/${encodeURIComponent(id)}`),
  getNews: ({ limit = 10, offset = 0 } = {}) =>
    request(`/articles/news?limit=${limit}&offset=${offset}`),
  getNewsArticle: (id) => request(`/articles/news/${encodeURIComponent(id)}`),

  // Dummy payment gateway
  getDummyPaymentConfig: () => request('/payments/dummy/config'),
  createDummyPayment: (body) =>
    request('/payments/dummy/create', { method: 'POST', body }),
  payDummyPayment: (body) =>
    request('/payments/dummy/pay', { method: 'POST', body }),
  getDummyCibilUnlock: () => request('/payments/dummy/cibil-unlock'),
  getDummyPaymentOrder: (orderId) =>
    request(`/payments/dummy/${encodeURIComponent(orderId)}`),

  // Wallet
  getWallet: () => request('/wallet/'),
  /** GET /wallet/can-invest?type=fd|rd&amount=... — wallet-first invest check */
  getWalletCanInvest: ({ type, amount } = {}) => {
    const q = new URLSearchParams()
    if (type) q.set('type', String(type))
    if (amount != null && amount !== '') q.set('amount', String(amount))
    const qs = q.toString()
    return request(`/wallet/can-invest${qs ? `?${qs}` : ''}`)
  },
  getWalletTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/wallet/transactions${q ? `?${q}` : ''}`)
  },
  getWalletBankAccount: () => request('/wallet/bank-account'),
  saveWalletBankAccount: (body) =>
    request('/wallet/bank-account', { method: 'PUT', body }),
  createWalletBankAccount: (body) =>
    request('/wallet/bank-account', { method: 'POST', body }),
  withdrawWallet: (body) =>
    request('/wallet/withdraw', { method: 'POST', body }),
  getWalletTaxReport: () => request('/wallet/tax-report'),

  // FD investments (wallet-funded after dummy pay)
  createFd: (body) => request('/fd/', { method: 'POST', body }),
  getFds: () => request('/fd/'),
  getFdSummary: () => request('/fd/summary'),
  breakFd: (id) => request(`/fd/${encodeURIComponent(id)}/break`, { method: 'POST' }),
  deleteFd: (id) => request(`/fd/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // RD investments
  createRd: (body) => request('/market/rd', { method: 'POST', body }),
  getRds: () => request('/market/rd'),
  getRdSummary: () => request('/market/rd/summary'),
  breakRd: (id) => request(`/market/rd/${encodeURIComponent(id)}/break`, { method: 'POST' }),
  deleteRd: (id) => request(`/market/rd/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export { ApiError, getToken, getAdminToken, request }
