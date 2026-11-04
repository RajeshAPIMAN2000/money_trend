import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthModal } from '../../context/AuthModalContext.jsx'

export default function AuthModalRedirect() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { openLogin, openRegister, openForgot } = useAuthModal()

  useEffect(() => {
    const auth = params.get('auth')
    if (!auth) return

    if (auth === 'login') openLogin()
    else if (auth === 'register') openRegister()
    else if (auth === 'forgot') openForgot()

    params.delete('auth')
    const next = params.toString()
    navigate({ pathname: window.location.pathname, search: next ? `?${next}` : '' }, { replace: true })
  }, [params, setParams, navigate, openLogin, openRegister, openForgot])

  return null
}
