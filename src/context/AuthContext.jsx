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
      // Prefer /profile — includes nominee.added so we can skip nominee onboarding
      let profile = null
      try {
        const profileRes = await api.getProfile()
        profile = profileRes?.data ?? profileRes
      } catch {
        profile = null
      }

      let u = null
      try {
        const res = await api.getMe()
        u = res?.user ?? res?.data?.user ?? res
      } catch {
        u = null
      }

      if (profile && typeof profile === 'object') {
        const nomineeAdded = Boolean(profile.nominee?.added || profile.nominee?.nominee_name)
        const merged = {
          ...(u && typeof u === 'object' ? u : {}),
          id: profile.id ?? u?.id,
          full_name: profile.full_name ?? u?.full_name,
          email: profile.email ?? u?.email,
          phone: profile.phone ?? u?.phone,
          profile_image: profile.profile_image ?? u?.profile_image,
          kyc_status: profile.kyc_status ?? u?.kyc_status,
          kyc_method: profile.kyc_method ?? u?.kyc_method,
          nominee: profile.nominee ?? null,
          nominee_added: nomineeAdded,
          registration_complete: nomineeAdded || Boolean(u?.registration_complete),
        }
        localStorage.setItem(USER_KEY, JSON.stringify(merged))
        setUser(merged)
        return merged
      }

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

  // OTP register helpers — commented out (password-only registration)
  // const sendRegisterOtp = useCallback((data) => {
  //   return authApi.sendRegisterOtp({
  //     full_name: data.full_name,
  //     email: data.email,
  //     phone: data.phone,
  //     password: data.password,
  //     confirm_password: data.confirm_password,
  //     date_of_birth: data.date_of_birth,
  //   })
  // }, [])
  // const resendRegisterOtp = useCallback((data) => {
  //   return authApi.resendRegisterOtp({ phone: data.phone })
  // }, [])

  const completeRegister = useCallback(async (data) => {
    const res = await authApi.register({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirm_password: data.confirm_password,
      date_of_birth: data.date_of_birth,
      // otp: data.otp, // OTP registration disabled
    })
    return applyAuthResult(res)
  }, [applyAuthResult])

  // OTP login helpers — commented out (password-only login)
  // const sendLoginOtp = useCallback((data) => {
  //   return authApi.sendLoginOtp({
  //     email: data.email,
  //     password: data.password,
  //   })
  // }, [])
  // const resendLoginOtp = useCallback((data) => {
  //   return authApi.resendLoginOtp({
  //     email: data.email,
  //     password: data.password,
  //   })
  // }, [])

  const completeLogin = useCallback(async (data) => {
    const res = await authApi.login({
      email: data.email,
      password: data.password,
      // otp: data.otp, // OTP login disabled
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

  const isKycApproved = ['approved', 'verified'].includes(String(user?.kyc_status || '').toLowerCase())
  const isKycPending = ['pending', 'submitted'].includes(String(user?.kyc_status || '').toLowerCase())
  const needsKyc = !user || ['not_started', 'rejected', ''].includes(String(user?.kyc_status || 'not_started').toLowerCase())
  const hasNominee = Boolean(
    user?.nominee_added
    || user?.registration_complete
    || user?.nominee?.added
    || user?.nominee?.nominee_name,
  )
  // Only prompt for nominee when KYC is done and nominee is not yet added
  const needsNominee = Boolean(user) && !needsKyc && !hasNominee && isKycPending

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user && !!getToken(),
      isKycApproved,
      isKycPending,
      needsKyc,
      needsNominee,
      hasNominee,
      // sendRegisterOtp, // OTP disabled
      // resendRegisterOtp, // OTP disabled
      completeRegister,
      // sendLoginOtp, // OTP disabled
      // resendLoginOtp, // OTP disabled
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
