import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const { openLogin } = useAuthModal()

  useEffect(() => {
    if (!loading && !isAuthenticated) openLogin()
  }, [loading, isAuthenticated, openLogin])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg">
        <p className="text-sm text-slate-500">Please sign in to continue</p>
      </div>
    )
  }

  return children
}

export function RequireGuest({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />
  }

  return children
}

export function KycGate({ children }) {
  const { user, isKycApproved } = useAuth()

  if (!isKycApproved) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-display font-bold text-primary">KYC Verification Required</h2>
        <p className="text-slate-600 mt-2 text-sm">
          {user?.kyc_status === 'pending'
            ? 'Your KYC is under review. Investment features will unlock once approved.'
            : user?.kyc_status === 'rejected'
              ? 'Your KYC was rejected. Please resubmit your documents.'
              : 'Complete your KYC to access investment features.'}
        </p>
        {user?.kyc_status !== 'pending' && (
          <a href="/onboarding/kyc/manual" className="inline-block mt-6 text-sm font-semibold text-secondary hover:underline">
            {user?.kyc_status === 'rejected' ? 'Resubmit KYC' : 'Complete KYC'} →
          </a>
        )}
      </div>
    )
  }

  return children
}
