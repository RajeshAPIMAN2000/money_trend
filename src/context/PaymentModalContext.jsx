import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const PaymentModalContext = createContext(null)

/**
 * openPayment({
 *   purpose, amount?, description?, meta?,
 *   title?, onSuccess?(result), onCancel?()
 * })
 */
export function PaymentModalProvider({ children }) {
  const [session, setSession] = useState(null)

  const openPayment = useCallback((opts) => {
    setSession({
      purpose: opts.purpose,
      amount: opts.amount,
      description: opts.description || '',
      meta: opts.meta || {},
      title: opts.title || null,
      onSuccess: opts.onSuccess || null,
      onCancel: opts.onCancel || null,
    })
  }, [])

  const closePayment = useCallback(() => {
    setSession(null)
  }, [])

  useEffect(() => {
    if (!session) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [session])

  return (
    <PaymentModalContext.Provider value={{ session, openPayment, closePayment, isOpen: Boolean(session) }}>
      {children}
    </PaymentModalContext.Provider>
  )
}

export function usePaymentModal() {
  const ctx = useContext(PaymentModalContext)
  if (!ctx) throw new Error('usePaymentModal must be used within PaymentModalProvider')
  return ctx
}
