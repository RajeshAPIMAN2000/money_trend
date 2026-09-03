import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import { RequireAuth } from '../../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, ApiError } from '../../lib/api.js'

function DigiLockerFlow() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { updateUser } = useAuth()
  const [status, setStatus] = useState('init') // init | loading | success | error
  const [error, setError] = useState('')

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state')

    if (code && state) {
      setStatus('loading')
      fetch(`/api/kyc/digilocker/callback?code=${code}&state=${state}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) throw new Error(data.error)
          updateUser({ kyc_status: 'pending', kyc_type: 'digilocker' })
          setStatus('success')
        })
        .catch(err => {
          setError(err.message)
          setStatus('error')
        })
    }
  }, [params, updateUser])

  const startStub = async () => {
    setStatus('loading')
    try {
      await api.completeDigiLockerStub()
      updateUser({ kyc_status: 'pending', kyc_type: 'digilocker' })
      setStatus('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'DigiLocker failed')
      setStatus('error')
    }
  }

  const startOAuth = async () => {
    setStatus('loading')
    try {
      const session = await api.initDigiLocker()
      if (session.isStub) {
        await api.completeDigiLockerStub()
        updateUser({ kyc_status: 'pending', kyc_type: 'digilocker' })
        setStatus('success')
      } else {
        window.location.href = session.authUrl
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start DigiLocker')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <AuthLayout title="DigiLocker KYC Submitted" subtitle="Your documents have been fetched for verification">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Your DigiLocker KYC has been submitted for admin verification.
          </p>
          <Button className="w-full" onClick={() => navigate('/onboarding/nominee')}>
            Continue to Nominee Details →
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="DigiLocker KYC" subtitle="Verify your identity using DigiLocker">
      {status === 'loading' && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-3" />
          <p className="text-sm text-slate-500">Connecting to DigiLocker...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>
          <Button className="w-full" onClick={startOAuth}>Try Again</Button>
        </div>
      )}

      {status === 'init' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-card text-sm text-slate-600">
            <p>You'll be redirected to DigiLocker's official consent screen to fetch your verified Aadhaar and PAN documents.</p>
            <p className="mt-2 text-xs text-slate-400">In development mode, a stub flow is used when API credentials aren't configured.</p>
          </div>
          <Button className="w-full" onClick={startOAuth}>
            <Shield className="w-4 h-4 inline mr-2" />
            Connect DigiLocker
          </Button>
          <Button variant="outline" className="w-full" onClick={startStub}>
            Use Dev Stub (no credentials)
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}

export default function DigiLockerCallbackPage() {
  return (
    <RequireAuth>
      <DigiLockerFlow />
    </RequireAuth>
  )
}
