import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import FormInput from '../../components/auth/FormInput.jsx'
import Button from '../../components/ui/Button.jsx'
import { RequireAuth } from '../../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, ApiError, getToken } from '../../lib/api.js'
import { parseProfileNominee } from '../../lib/nominee.js'
import {
  RELATIONSHIPS,
  PHONE_RE,
  EMAIL_RE,
  PAN_RE,
  AADHAAR_RE,
  isMinor,
  formatAadhaarInput,
} from '../../lib/validators.js'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

/**
 * Build multipart body for POST /api/kyc/nominee
 */
export function buildNomineeFormData(form, panFile, aadhaarFile) {
  const pan = String(form.panNumber || '').trim().toUpperCase()
  const aadhaar = String(form.aadhaarNumber || '').replace(/\s/g, '')
  const mobile = String(form.mobile || '').replace(/\D/g, '')
  const allocation = Number(form.allocationPercent ?? 100)

  const fd = new FormData()
  fd.append('nominee_name', String(form.nomineeName || '').trim())
  fd.append('relationship', form.relationship)
  fd.append('dob', form.dob)
  fd.append('date_of_birth', form.dob)
  fd.append('mobile', mobile)
  fd.append('phone', mobile)
  fd.append('email', String(form.email || '').trim().toLowerCase())
  fd.append('address', String(form.address || '').trim())
  fd.append('pan_number', pan)
  fd.append('aadhaar_number', aadhaar)
  fd.append('allocation_percent', String(Number.isFinite(allocation) ? allocation : 100))
  fd.append('pan_image', panFile)
  fd.append('aadhaar_image', aadhaarFile)

  if (isMinor(form.dob)) {
    fd.append('guardian_name', String(form.guardianName || '').trim())
    fd.append('guardian_relationship', String(form.guardianRelationship || '').trim())
  }

  return fd
}

function AlreadyAddedView({ nominee, onContinue }) {
  return (
    <AuthLayout title="Nominee Already Added" subtitle="You have already completed nominee details">
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Nominee details are already on your account. You do not need to add them again.
        </p>
        {nominee?.name && (
          <div className="text-left rounded-btn border border-slate-200 bg-slate-50 p-4 text-sm space-y-2 mb-6">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Name</span>
              <span className="font-semibold text-primary">{nominee.name}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Relationship</span>
              <span className="font-medium">{nominee.relationship}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">DOB</span>
              <span className="font-medium">{nominee.dob}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Mobile</span>
              <span className="font-medium">{nominee.mobile}</span>
            </div>
          </div>
        )}
        <Button className="w-full" onClick={onContinue}>
          Go to Dashboard
        </Button>
      </div>
    </AuthLayout>
  )
}

function NomineeForm() {
  const navigate = useNavigate()
  const { updateUser, hasNominee, user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [existingNominee, setExistingNominee] = useState(null)
  const [alreadyAdded, setAlreadyAdded] = useState(Boolean(hasNominee))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [panFile, setPanFile] = useState(null)
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panPreview, setPanPreview] = useState(null)
  const [aadhaarPreview, setAadhaarPreview] = useState(null)

  const [form, setForm] = useState({
    nomineeName: '',
    relationship: 'Spouse',
    dob: '',
    mobile: '',
    email: '',
    address: '',
    panNumber: '',
    aadhaarNumber: '',
    allocationPercent: 100,
    guardianName: '',
    guardianRelationship: '',
  })

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const minor = isMinor(form.dob)

  useEffect(() => {
    let cancelled = false

    async function checkExistingNominee() {
      if (hasNominee || user?.nominee?.added) {
        if (!cancelled) {
          setExistingNominee(user?.nominee ? {
            name: user.nominee.nominee_name ?? user.nominee.name,
            relationship: user.nominee.relationship,
            dob: user.nominee.date_of_birth ?? user.nominee.dob,
            mobile: user.nominee.mobile ?? user.nominee.phone,
          } : null)
          setAlreadyAdded(true)
          setChecking(false)
        }
        return
      }

      try {
        const res = await api.getProfile()
        if (cancelled) return
        const parsed = parseProfileNominee(res)
        if (parsed.added) {
          updateUser({
            nominee: res?.data?.nominee ?? res?.nominee,
            nominee_added: true,
            registration_complete: true,
          })
          setExistingNominee(parsed.nominee)
          setAlreadyAdded(true)
        }
      } catch {
        // Allow form if profile check fails
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    checkExistingNominee()
    return () => { cancelled = true }
  }, [hasNominee, user, updateUser])

  const handleFile = (type, file) => {
    if (!file) return
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    if (type === 'pan') {
      setPanFile(file)
      setPanPreview(url)
    } else {
      setAadhaarFile(file)
      setAadhaarPreview(url)
    }
    setError('')
  }

  const validate = () => {
    const pan = form.panNumber.trim().toUpperCase()
    const aadhaar = form.aadhaarNumber.replace(/\s/g, '')
    const allocation = Number(form.allocationPercent)

    if (!getToken()) return 'Please sign in again. A valid JWT token is required.'
    if (!form.nomineeName.trim()) return 'Nominee full name is required'
    if (!RELATIONSHIPS.includes(form.relationship)) return 'Select a valid relationship'
    if (!form.dob) return 'Date of birth is required (YYYY-MM-DD)'
    if (!PHONE_RE.test(form.mobile)) return 'Enter a valid 10-digit Indian mobile number'
    if (!EMAIL_RE.test(form.email)) return 'Enter a valid email address'
    if (!form.address.trim()) return 'Address is required'
    if (!PAN_RE.test(pan)) return 'Enter a valid PAN (e.g. ABCDE1234F)'
    if (!AADHAAR_RE.test(aadhaar)) return 'Enter a valid 12-digit Aadhaar number'
    if (!panFile) return 'PAN image upload is required'
    if (!aadhaarFile) return 'Aadhaar image upload is required'
    if (Number.isNaN(allocation) || allocation < 0.01 || allocation > 100) {
      return 'Allocation percent must be between 0.01 and 100'
    }
    if (minor && !form.guardianName.trim()) return 'Guardian name is required for nominees under 18'
    if (minor && !form.guardianRelationship.trim()) {
      return 'Guardian relationship is required for nominees under 18'
    }
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await api.submitNominee(buildNomineeFormData(form, panFile, aadhaarFile))
      const nomineePayload = res?.data?.nominee ?? res?.nominee ?? { added: true }
      updateUser({
        registration_complete: true,
        nominee_added: true,
        nominee: { ...nomineePayload, added: true },
      })
      navigate('/onboarding/success')
    } catch (err) {
      if (err?.status === 401) {
        setError('Session expired. Please sign in again to submit nominee details.')
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to save nominee')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <AuthLayout title="Nominee Details" subtitle="Checking your nominee status…">
        <p className="text-sm text-slate-500 text-center py-8">Please wait…</p>
      </AuthLayout>
    )
  }

  if (alreadyAdded) {
    return (
      <AlreadyAddedView
        nominee={existingNominee}
        onContinue={() => navigate('/dashboard')}
      />
    )
  }

  const fileSlot = (label, type, file, preview) => (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      {file ? (
        <div className="mt-1 flex items-center gap-3 p-3 border border-slate-200 rounded-btn">
          {preview ? (
            <img src={preview} alt={label} className="w-16 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 bg-slate-100 rounded-lg grid place-items-center text-xs text-slate-500">PDF</div>
          )}
          <div className="flex-1 text-sm truncate">{file.name}</div>
          <button
            type="button"
            onClick={() => {
              if (type === 'pan') { setPanFile(null); setPanPreview(null) }
              else { setAadhaarFile(null); setAadhaarPreview(null) }
            }}
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      ) : (
        <label className="mt-1 flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-card cursor-pointer hover:border-secondary hover:bg-slate-50">
          <Upload className="w-8 h-8 text-slate-400" />
          <span className="text-sm text-slate-500">JPG, PNG or PDF (max 5MB)</span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => handleFile(type, e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  )

  return (
    <AuthLayout title="Nominee Details" subtitle="Add a nominee for your investments (SEBI-compliant)">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
        <FormInput
          label="Nominee Full Name"
          placeholder="Nominee full name"
          value={form.nomineeName}
          onChange={(e) => setField('nomineeName', e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-semibold text-slate-500">Relationship</label>
          <select
            value={form.relationship}
            onChange={(e) => setField('relationship', e.target.value)}
            className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
            required
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <FormInput
          label="Date of Birth"
          type="date"
          value={form.dob}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setField('dob', e.target.value)}
          required
        />

        <FormInput
          label="Mobile"
          type="tel"
          maxLength={10}
          placeholder="10-digit Indian mobile"
          value={form.mobile}
          onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
          required
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="nominee@email.com"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-semibold text-slate-500">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            rows={2}
            required
            className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
          />
        </div>

        <FormInput
          label="PAN Number"
          placeholder="ABCDE1234F"
          maxLength={10}
          value={form.panNumber}
          onChange={(e) => setField('panNumber', e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 10))}
          required
        />

        <FormInput
          label="Aadhaar Number"
          placeholder="1234 5678 9012"
          maxLength={14}
          value={form.aadhaarNumber}
          onChange={(e) => setField('aadhaarNumber', formatAadhaarInput(e.target.value))}
          required
        />

        {fileSlot('PAN Photo', 'pan', panFile, panPreview)}
        {fileSlot('Aadhaar Photo', 'aadhaar', aadhaarFile, aadhaarPreview)}

        <FormInput
          label="Allocation % (optional, default 100)"
          type="number"
          min={0.01}
          max={100}
          step={0.01}
          value={form.allocationPercent}
          onChange={(e) => setField('allocationPercent', e.target.value)}
        />

        {minor && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-btn space-y-3">
            <p className="text-xs text-amber-700 font-semibold">
              Guardian details required (nominee is under 18)
            </p>
            <FormInput
              label="Guardian Name"
              value={form.guardianName}
              onChange={(e) => setField('guardianName', e.target.value)}
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-500">Guardian Relationship</label>
              <select
                value={form.guardianRelationship}
                onChange={(e) => setField('guardianRelationship', e.target.value)}
                className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
                required
              >
                <option value="">Select</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" variant="accent" disabled={loading}>
          {loading ? 'Submitting...' : 'Complete Registration'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default function NomineePage() {
  return (
    <RequireAuth>
      <NomineeForm />
    </RequireAuth>
  )
}
