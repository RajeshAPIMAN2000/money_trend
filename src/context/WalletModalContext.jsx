import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const WalletModalContext = createContext(null)

/**
 * openWallet({ tab?: 'overview' | 'add' | 'transactions' | 'portfolio' })
 */
export function WalletModalProvider({ children }) {
  const [session, setSession] = useState(null)

  const openWallet = useCallback((opts = {}) => {
    setSession({
      tab: opts.tab || 'overview',
    })
  }, [])

  const closeWallet = useCallback(() => {
    setSession(null)
  }, [])

  useEffect(() => {
    if (!session) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [session])

  return (
    <WalletModalContext.Provider
      value={{
        session,
        openWallet,
        closeWallet,
        isOpen: Boolean(session),
      }}
    >
      {children}
    </WalletModalContext.Provider>
  )
}

export function useWalletModal() {
  const ctx = useContext(WalletModalContext)
  if (!ctx) throw new Error('useWalletModal must be used within WalletModalProvider')
  return ctx
}
