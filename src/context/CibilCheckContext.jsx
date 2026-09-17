import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useAuthModal } from './AuthModalContext.jsx'

const CibilCheckContext = createContext(null)

export function CibilCheckProvider({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const { openLogin, isOpen: authModalOpen } = useAuthModal()
  const [open, setOpen] = useState(false)
  const [pendingAfterLogin, setPendingAfterLogin] = useState(false)

  const openCibilCheck = useCallback(() => {
    if (loading) return
    // Guests must sign in first — show Login popup, not CIBIL form
    if (!isAuthenticated) {
      setPendingAfterLogin(true)
      openLogin()
      return
    }
    setPendingAfterLogin(false)
    setOpen(true)
  }, [isAuthenticated, loading, openLogin])

  const closeCibilCheck = useCallback(() => setOpen(false), [])

  // After successful login, open the CIBIL check that was requested
  useEffect(() => {
    if (!isAuthenticated || !pendingAfterLogin) return
    setPendingAfterLogin(false)
    setOpen(true)
  }, [isAuthenticated, pendingAfterLogin])

  // User closed login without signing in — cancel pending CIBIL open
  useEffect(() => {
    if (!authModalOpen && !isAuthenticated && pendingAfterLogin) {
      setPendingAfterLogin(false)
    }
  }, [authModalOpen, isAuthenticated, pendingAfterLogin])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <CibilCheckContext.Provider value={{ open, openCibilCheck, closeCibilCheck }}>
      {children}
    </CibilCheckContext.Provider>
  )
}

export function useCibilCheck() {
  const ctx = useContext(CibilCheckContext)
  if (!ctx) throw new Error('useCibilCheck must be used within CibilCheckProvider')
  return ctx
}
