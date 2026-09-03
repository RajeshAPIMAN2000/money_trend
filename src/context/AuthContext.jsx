import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, getToken, ApiError } from '../lib/api.js'
import { authApi } from '../lib/authApi.js'
import {
  parseAuthResponse,
  persistAuthSession,
  clearAuthSession,
  getStoredUser,
  USER_KEY,
} from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(true)

  const applyAuthResult = useCallback((response) => {
    const parsed = parseAuthResponse(response)
    if (!parsed.accessToken) {
      throw new ApiError(response?.message || 'Authentication response missing access token', 500, response)
    }
    persistAuthSession({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: parsed.user,
    })
    setUser(parsed.user)
    return parsed
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return null
    }
    try {
      const res = await api.getMe()
      const u = res?.user ?? res?.data?.user ?? res
      if (u && typeof u === 'object') {
        localStorage.setItem(USER_KEY, JSON.stringify(u))
        setUser(u)
        return u
      }
      return null
    } catch {
      logout()
      return null
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const sendRegisterOtp = useCallback((data) => {
    return authApi.sendRegisterOtp({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirm_password: data.confirm_password,
    })
  }, [])

  const resendRegisterOtp = useCallback((data) => {
    return authApi.resendRegisterOtp({ phone: data.phone })
  }, [])

  const completeRegister = useCallback(async (data) => {
    const res = await authApi.register({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirm_password: data.confirm_password,
      date_of_birth: data.date_of_birth,
      otp: data.otp,
    })
    return applyAuthResult(res)
  }, [applyAuthResult])

  const sendLoginOtp = useCallback((data) => {
    return authApi.sendLoginOtp({
      email: data.email,
      password: data.password,
    })
  }, [])

  const resendLoginOtp = useCallback((data) => {
    return authApi.resendLoginOtp({
      email: data.email,
      password: data.password,
    })
  }, [])

  const completeLogin = useCallback(async (data) => {
    const res = await authApi.login({
      email: data.email,
      password: data.password,
      otp: data.otp,
    })
    return applyAuthResult(res)
  }, [applyAuthResult])

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isKycApproved = user?.kyc_status === 'approved'
  const isKycPending = user?.kyc_status === 'pending'
  const needsKyc = !user || user.kyc_status === 'not_started' || user.kyc_status === 'rejected'
  const needsNominee = user && user.kyc_status !== 'not_started' && !user.registration_complete

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user && !!getToken(),
      isKycApproved,
      isKycPending,
      needsKyc,
      needsNominee,
      sendRegisterOtp,
      resendRegisterOtp,
      completeRegister,
      sendLoginOtp,
      resendLoginOtp,
      completeLogin,
      logout,
      refreshUser,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
