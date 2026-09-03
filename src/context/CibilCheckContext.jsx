import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CibilCheckContext = createContext(null)

export function CibilCheckProvider({ children }) {
  const [open, setOpen] = useState(false)

  const openCibilCheck = useCallback(() => setOpen(true), [])
  const closeCibilCheck = useCallback(() => setOpen(false), [])

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
