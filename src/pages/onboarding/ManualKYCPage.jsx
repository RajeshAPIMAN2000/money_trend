import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import FormInput from '../../components/auth/FormInput.jsx'
import Button from '../../components/ui/Button.jsx'
import { RequireAuth } from '../../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, ApiError } from '../../lib/api.js'
import { AADHAAR_RE, PAN_RE, PHONE_RE, formatAadhaarInput } from '../../lib/validators.js'

function ManualKYCForm() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [aadhaarPreview, setAadhaarPreview] = useState(null)
  const [panPreview, setPanPreview] = useState(null)
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panFile, setPanFile] = useState(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const handleFile = (type, file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    if (type === 'aadhaar') { setAadhaarFile(file); setAadhaarPreview(url) }
    else { setPanFile(file); setPanPreview(url) }
    setError('')
  }

  const onSubmit = async (data) => {
    if (!aadhaarFile || !panFile) {
      setError('Both Aadhaar and PAN documents are required')
      return
    }
    const cleanAadhaar = data.aadhaarNumber.replace(/\s/g, '')
    if (!AADHAAR_RE.test(cleanAadhaar)) {
      setError('Enter a valid 12-digit Aadhaar number')
      return
    }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      const pan = String(data.panNumber || '').trim().toUpperCase()
      const fullName = String(data.name || '').trim()
      const phone = String(data.phone || '').replace(/\D/g, '')

      // Matches money_trend_backend/controllers/kycController.js (multipart)
      formData.append('pan_number', pan)
      formData.append('pan_full_name', fullName)
      formData.append('full_name', fullName)
      formData.append('aadhaar_number', cleanAadhaar)
      formData.append('phone', phone)
      formData.append('pan_image', panFile)
      formData.append('aadhaar_image', aadhaarFile)

      await api.submitManualKyc(formData)
      updateUser({ kyc_status: 'submitted', kyc_method: 'manual', kyc_type: 'manual' })

      // Skip nominee step if already completed
      try {
        const profileRes = await api.getProfile()
        const nominee = profileRes?.data?.nominee ?? profileRes?.nominee
        if (nominee?.added || nominee?.nominee_name) {
          updateUser({
            nominee,
            nominee_added: true,
            registration_complete: true,
          })
          navigate('/dashboard')
          return
        }
      } catch {
        // continue to nominee form
      }

      navigate('/onboarding/nominee')
    } catch (err) {
      const details = err?.data
      let message = err instanceof ApiError ? err.message : 'KYC submission failed'
      if (details?.hint) message = `${message}. ${details.hint}`
      if (details?.errors) {
        if (Array.isArray(details.errors)) {
          message = details.errors.map((e) => e.message || e.msg || String(e)).filter(Boolean).join('. ') || message
        } else if (typeof details.errors === 'object') {
          message = Object.entries(details.errors)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('. ') || message
        }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Manual KYC" subtitle="Upload your identity documents for verification">
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Aadhaar Number"
          placeholder="1234 5678 9012"
          maxLength={14}
          error={errors.aadhaarNumber?.message}
          {...register('aadhaarNumber', {
            required: 'Aadhaar is required',
            onChange: (e) => setValue('aadhaarNumber', formatAadhaarInput(e.target.value)),
          })}
        />
        <FormInput
          label="PAN Number"
          placeholder="ABCDE1234F"
          className="uppercase"
          error={errors.panNumber?.message}
          {...register('panNumber', {
            required: 'PAN is required',
            pattern: { value: PAN_RE, message: 'Invalid PAN format' },
          })}
        />
        <FormInput
          label="Full Name (as per PAN)"
          error={errors.name?.message}
          {...register('name', { required: 'Full name as per PAN is required' })}
        />
        <FormInput
          label="Phone Number"
          type="tel"
          maxLength={10}
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Phone is required',
            pattern: { value: PHONE_RE, message: 'Valid 10-digit phone required' },
          })}
        />

        {[
          { label: 'Aadhaar Card Photo', type: 'aadhaar', preview: aadhaarPreview, file: aadhaarFile },
          { label: 'PAN Card Photo', type: 'pan', preview: panPreview, file: panFile },
        ].map(({ label, type, preview, file }) => (
          <div key={type}>
            <label className="text-xs font-semibold text-slate-500">{label}</label>
            {file ? (
              <div className="mt-1 flex items-center gap-3 p-3 border border-slate-200 rounded-btn">
                {preview ? (
                  <img src={preview} alt={label} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-lg grid place-items-center text-xs text-slate-500">PDF</div>
                )}
                <div className="flex-1 text-sm truncate">{file.name}</div>
                <button type="button" onClick={() => type === 'aadhaar' ? (setAadhaarFile(null), setAadhaarPreview(null)) : (setPanFile(null), setPanPreview(null))}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-card cursor-pointer hover:border-secondary hover:bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-500">JPG, PNG or PDF (max 5MB)</span>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleFile(type, e.target.files?.[0])} />
              </label>
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Next → Nominee Details'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default function ManualKYCPage() {
  return (
    <RequireAuth>
      <ManualKYCForm />
    </RequireAuth>
  )
}
