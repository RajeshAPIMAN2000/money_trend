import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../../lib/api.js'
import {
  parseAdminAuthResponse,
  persistAdminSession,
  clearAdminSession,
} from '../../lib/auth.js'

const AdminContext = createContext(null)
const ADMIN_USER_KEY = 'moneytrend-admin-user'

function getStoredAdminUser() {
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AdminProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin-dark') === 'true')
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('moneytrend-admin-token')))
  const [adminUser, setAdminUser] = useState(getStoredAdminUser)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('admin-dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggleDark = () => setDarkMode(v => !v)
  const toggleSidebar = () => setSidebarCollapsed(v => !v)

  const login = useCallback(async (email, password) => {
    const res = await api.adminLogin({ email, password })
    const parsed = parseAdminAuthResponse(res)

    if (!parsed.accessToken) {
      throw new ApiError(res?.message || 'Admin login response missing access token', 500, res)
    }

    persistAdminSession({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: parsed.user,
    })
    setIsAuthenticated(true)
    setAdminUser(parsed.user)
    return parsed
  }, [])

  const logout = useCallback(() => {
    clearAdminSession()
    setIsAuthenticated(false)
    setAdminUser(null)
  }, [])

  return (
    <AdminContext.Provider value={{
      sidebarCollapsed, setSidebarCollapsed,
      mobileOpen, setMobileOpen,
      darkMode, toggleDark, toggleSidebar,
      isAuthenticated, adminUser, login, logout,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
