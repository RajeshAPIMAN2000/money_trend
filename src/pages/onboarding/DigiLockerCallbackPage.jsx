import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Shield, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, Smartphone, FileCheck, BadgeCheck } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import { RequireAuth } from '../../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api, ApiError } from '../../lib/api.js'
import {
  parseDigiLockerInit,
  parseDigiLockerStatus,
  digilockerErrorMessage,
  digilockerApprovalNote,
  digilockerMissingDataMessage,
} from '../../lib/digilocker.js'

function StatusPill({ status }) {
  const s = String(status || 'not_started').toLowerCase()
  const map = {
    passed: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    submitted: { label: 'Submitted', className: 'bg-amber-50 text-amber-800 border-amber-200', Icon: Clock },
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-800 border-amber-200', Icon: Clock },
    manual_review: { label: 'Manual review', className: 'bg-amber-50 text-amber-800 border-amber-200', Icon: AlertTriangle },
    mismatch: { label: 'Mismatch', className: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
    failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
    not_started: { label: 'Not started', className: 'bg-slate-50 text-slate-600 border-slate-200', Icon: Clock },
  }
  const item = map[s] || map.not_started
  const Icon = item.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${item.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  )
}

function VerificationRows({ verification }) {
  const rows = [
    { label: 'Aadhaar', value: verification?.aadhaar },
    { label: 'PAN', value: verification?.pan },
    { label: 'Name match', value: verification?.name },
    { label: 'Date of birth', value: verification?.dob },
    { label: 'Address', value: verification?.address },
  ]
  return (
    <div className="rounded-card border border-slate-100 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-primary">Step 5 – Automatic verification</p>
          <StatusPill status={verification?.overall} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Shown after DigiLocker consent. Checks run only on documents you authorized.
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        <li className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span className="text-slate-600">DigiLocker authentication</span>
          <StatusPill status={verification?.authentication} />
        </li>
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="text-slate-600">{row.label}</span>
            <StatusPill status={row.value} />
          </li>
        ))}
      </ul>
      {verification?.reason ? (
        <p className="px-4 py-3 text-xs text-slate-500 border-t border-slate-100">{verification.reason}</p>
      ) : null}
    </div>
  )
}

function JourneySteps() {
  const steps = [
    {
      n: 1,
      title: 'Start verification',
      body: 'Click Verify with DigiLocker to continue to official DigiLocker authentication.',
      Icon: Shield,
    },
    {
      n: 2,
      title: 'DigiLocker authentication',
      body: 'On DigiLocker, enter your linked mobile number, OTP (if asked), and DigiLocker security PIN. MoneyTrend never sees OTP or PIN.',
      Icon: Smartphone,
    },
    {
      n: 3,
      title: 'Document consent',
      body: 'Review DigiLocker’s consent screen. If Aadhaar / PAN document options appear, authorize them there — MoneyTrend cannot show DigiLocker’s own document picker.',
      Icon: FileCheck,
    },
    {
      n: 4,
      title: 'Proceed',
      body: 'Confirm consent. DigiLocker redirects to MoneyTrend’s secure callback. The backend exchanges the code and retrieves only permitted documents.',
      Icon: BadgeCheck,
    },
    {
      n: 5,
      title: 'Automatic verification',
      body: 'MoneyTrend checks Aadhaar and PAN evidence, authenticity metadata, and compares details with your profile. Verified only when mandatory checks pass.',
      Icon: CheckCircle2,
    },
  ]

  return (
    <ol className="space-y-3">
      {steps.map(({ n, title, body, Icon }) => (
        <li key={n} className="flex gap-3 rounded-card border border-slate-100 p-3">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary grid place-items-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">
              Step {n} – {title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function DigiLockerFlow() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { updateUser } = useAuth()
  const { showToast } = useToast()
  const [status, setStatus] = useState('init') // init | loading | success | error | cancelled
  const [error, setError] = useState('')
  const [approvalNote, setApprovalNote] = useState('')
  const [statusSummary, setStatusSummary] = useState(null)
  const [starting, setStarting] = useState(false)
  const toastShown = useRef(false)

  const applyStatus = useCallback(async (kycFromQuery) => {
    const statusRes = await api.getDigiLockerStatus()
    const parsed = parseDigiLockerStatus(statusRes)
    updateUser({
      kyc_status: parsed.kycStatus || kycFromQuery || 'submitted',
      kyc_method: 'digilocker',
      kyc_type: 'digilocker',
    })
    setStatusSummary(parsed)
    setApprovalNote(digilockerApprovalNote(parsed))
    return parsed
  }, [updateUser])

  const goNominee = useCallback(async () => {
    try {
      const profileRes = await api.getProfile()
      const nominee = profileRes?.data?.nominee ?? profileRes?.nominee
      if (nominee?.added || nominee?.nominee_name) {
        updateUser({ nominee, nominee_added: true, registration_complete: true })
        navigate('/dashboard', { replace: true })
        return
      }
    } catch {
      // fall through
    }
    navigate('/onboarding/nominee?from=digilocker', { replace: true })
  }, [navigate, updateUser])

  useEffect(() => {
    const redirectStatus = String(params.get('status') || '').toLowerCase()
    const code = params.get('code')
    const state = params.get('state')
    const providerError = params.get('error')
    const providerMessage = params.get('message') || params.get('error_description')
    const kycFromQuery = params.get('kyc_status')
    const missingParam = params.get('missing')
    const nextParam = String(params.get('next') || '').toLowerCase()

    let cancelled = false

    function showErrorOnce(msg) {
      if (toastShown.current) return
      toastShown.current = true
      showToast(msg, 'error')
    }

    async function finishSuccess(parsedHint) {
      let parsed = parsedHint
      try {
        parsed = await applyStatus(kycFromQuery)
      } catch {
        if (cancelled) return
        updateUser({
          kyc_status: kycFromQuery || 'submitted',
          kyc_method: 'digilocker',
          kyc_type: 'digilocker',
        })
        setApprovalNote(digilockerApprovalNote(null))
      }
      if (cancelled) return

      const overall = String(parsed?.verification?.overall || '').toUpperCase()
      const kyc = String(parsed?.kycStatus || kycFromQuery || '').toLowerCase()
      const incomplete =
        overall === 'FAILED' ||
        kyc === 'rejected' ||
        overall === 'PENDING'

      if (incomplete && nextParam !== 'nominee') {
        const msg = digilockerMissingDataMessage({
          missing: missingParam,
          message: providerMessage || parsed?.verification?.reason,
        })
        setError(msg)
        setStatus('error')
        showErrorOnce(msg)
        return
      }

      setStatus('success')
      if (!toastShown.current) {
        toastShown.current = true
        showToast('DigiLocker KYC completed. Continue with nominee details.', 'success')
      }
      // Auto-continue to nominee — do not leave users on a dead-end results screen
      window.setTimeout(() => {
        if (!cancelled) goNominee()
      }, 600)
    }

    if (redirectStatus === 'success') {
      setStatus('loading')
      finishSuccess()
      return () => { cancelled = true }
    }

    if (redirectStatus === 'error' || redirectStatus === 'cancelled' || redirectStatus === 'failed' || providerError) {
      const msg = digilockerMissingDataMessage({
        missing: missingParam,
        message: providerMessage || providerError || 'DigiLocker verification was cancelled or failed',
      })
      setError(msg)
      setStatus(redirectStatus === 'cancelled' ? 'cancelled' : 'error')
      showErrorOnce(msg)
      return undefined
    }

    if (code && state) {
      setStatus('loading')
      fetch(`/api/digilocker/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&format=json`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
        .then(async (r) => {
          const data = await r.json().catch(() => ({}))
          if (!r.ok || data.success === false) {
            const msg = digilockerErrorMessage({
              message: data.message || data.error || 'DigiLocker callback failed',
              errorCode: data.errorCode,
            })
            throw Object.assign(new Error(msg), {
              errorCode: data.errorCode,
              data,
            })
          }
          if (data?.data?.next === 'nominee') {
            updateUser({
              kyc_status: data?.data?.kyc_status || 'submitted',
              kyc_method: 'digilocker',
              kyc_type: 'digilocker',
            })
            if (!toastShown.current) {
              toastShown.current = true
              showToast('DigiLocker KYC completed. Continue with nominee details.', 'success')
            }
            await goNominee()
            return
          }
          return finishSuccess(null)
        })
        .catch((err) => {
          if (!cancelled) {
            const msg = digilockerErrorMessage(err)
            setError(msg)
            setStatus('error')
            showErrorOnce(msg)
          }
        })
      return () => { cancelled = true }
    }

    setStatus('init')
    return undefined
  }, [params, updateUser, applyStatus, showToast, goNominee])

  const startOAuth = async () => {
    if (starting) return
    setStarting(true)
    setStatus('loading')
    setError('')
    toastShown.current = false
    try {
      let session
      try {
        session = await api.startDigiLocker()
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
          session = await api.initDigiLocker()
        } else {
          throw err
        }
      }

      const payload = parseDigiLockerInit(session)

      if (payload.isStub || !payload.authUrl) {
        throw Object.assign(
          new Error(
            payload.isStub
              ? 'DigiLocker live mode is not enabled on the server (DIGILOCKER_STUB). Set DIGILOCKER_STUB=false and restart the API to open DigiLocker.'
              : 'DigiLocker authorization URL was not returned. Check DIGILOCKER_CLIENT_SECRET and partner config.',
          ),
          { errorCode: 'DIGILOCKER_ERROR' },
        )
      }

      window.location.assign(payload.authUrl)
    } catch (err) {
      const msg = digilockerErrorMessage(err)
      setError(msg)
      setStatus('error')
      setStarting(false)
      showToast(msg, 'error')
    }
  }

  const verification = statusSummary?.verification
  const record = statusSummary?.record

  if (status === 'success') {
    return (
      <AuthLayout title="Complete your KYC" subtitle="DigiLocker e-KYC results">
        <div className="space-y-5 py-2">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-600">
              DigiLocker verification succeeded. Taking you to nominee details…
            </p>
            {approvalNote ? <p className="text-xs text-slate-500 mt-2">{approvalNote}</p> : null}
          </div>

          <VerificationRows verification={verification} />

          {(record?.aadhaarLast4 || record?.panMasked || statusSummary?.kycDocument?.panFullName) && (
            <div className="rounded-card border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              {statusSummary?.kycDocument?.panFullName && (
                <p><span className="text-slate-400">Name:</span> {statusSummary.kycDocument.panFullName}</p>
              )}
              {record?.panMasked && (
                <p><span className="text-slate-400">PAN:</span> {record.panMasked}</p>
              )}
              {record?.aadhaarLast4 && (
                <p><span className="text-slate-400">Aadhaar:</span> ****{record.aadhaarLast4}</p>
              )}
            </div>
          )}

          <Button className="w-full" onClick={goNominee}>Continue to Nominee →</Button>
          <Link to="/dashboard" className="block text-center text-sm text-secondary hover:underline">
            Go to dashboard
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Complete your KYC" subtitle="Verify your identity securely using DigiLocker">
      {status === 'loading' && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {starting ? 'Opening official DigiLocker…' : 'Processing DigiLocker response…'}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            You will leave MoneyTrend to sign in on DigiLocker. OTP and PIN stay on DigiLocker only.
          </p>
        </div>
      )}

      {(status === 'error' || status === 'cancelled') && (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>
          <JourneySteps />
          <Button className="w-full" onClick={startOAuth} disabled={starting}>
            <Shield className="w-4 h-4 inline mr-2" />
            Try DigiLocker again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/onboarding/kyc/manual')}>
            Switch to Manual KYC
          </Button>
        </div>
      )}

      {status === 'init' && (
        <div className="space-y-5">
          <JourneySteps />

          <Button className="w-full" onClick={startOAuth} disabled={starting}>
            <Shield className="w-4 h-4 inline mr-2" />
            {starting ? 'Redirecting…' : 'Verify with DigiLocker'}
          </Button>
          <p className="text-[11px] text-center text-slate-400">
            Continues to DigiLocker / Meri Pehchaan. MoneyTrend never requests DigiLocker OTP or PIN.
          </p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/onboarding/kyc/manual')}>
            Use Manual KYC instead
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
