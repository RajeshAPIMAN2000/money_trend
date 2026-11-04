import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [view, setView] = useState(null) // null | 'login' | 'register' | 'forgot'
  const [showKycModal, setShowKycModal] = useState(false)

  const openLogin = useCallback(() => setView('login'), [])
  const openRegister = useCallback(() => setView('register'), [])
  const openForgot = useCallback(() => setView('forgot'), [])
  const close = useCallback(() => setView(null), [])

  useEffect(() => {
    document.body.style.overflow = view ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [view])

  return (
    <AuthModalContext.Provider value={{
      view,
      showKycModal,
      setShowKycModal,
      openLogin,
      openRegister,
      openForgot,
      close,
      isOpen: !!view,
    }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider')
  return ctx
}
