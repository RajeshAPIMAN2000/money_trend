import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Upload, X } from 'lucide-react'
import AdminModal from '../shared/AdminModal.jsx'
import AdminInput from '../ui/AdminInput.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import { api, ApiError } from '../../../lib/api.js'
import {
  buildAdminUserKycFormData,
  buildAdminUserNomineeFormData,
  extractCreatedAdminUserId,
} from '../../../lib/adminUsers.js'
import {
  AADHAAR_RE,
  EMAIL_RE,
  PAN_RE,
  PHONE_RE,
  RELATIONSHIPS,
  formatAadhaarInput,
  isMinor,
} from '../../../lib/validators.js'
import { cn } from '../../../lib/utils.js'

const STEPS = [
  { id: 'account', label: 'Account' },
  { id: 'otp', label: 'OTP' },
  { id: 'kyc', label: 'KYC' },
  { id: 'nominee', label: 'Nominee' },
  { id: 'done', label: 'Done' },
]

const EMPTY_ACCOUNT = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  password: '',
  confirmPassword: '',
}

const EMPTY_KYC = {
  panNumber: '',
  panFullName: '',
  aadhaarNumber: '',
  autoApprove: true,
}

const EMPTY_NOMINEE = {
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
}

const ALLOWED_FILES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

function StepTabs({ step }) {
  const idx = STEPS.findIndex((s) => s.id === step)
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {STEPS.map((s, i) => (
        <span
          key={s.id}
          className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-semibold',
            i < idx && 'bg-emerald-50 text-emerald-700',
            i === idx && 'bg-blue-600 text-white',
            i > idx && 'bg-slate-100 text-slate-500',
          )}
        >
          {i + 1}. {s.label}
        </span>
      ))}
    </div>
  )
}

function FileSlot({ label, file, preview, onPick, onClear }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
          {preview ? (
            <img src={preview} alt="" className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-200 grid place-items-center text-[10px] text-slate-500">
              PDF
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{file.name}</p>
            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button type="button" onClick={onClear} className="p-1 text-slate-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1 h-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-blue-400">
          <Upload className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] text-slate-500">JPG / PNG / PDF · max 5MB</span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  )
}

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="relative mt-1">
        <AdminInput
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? 'Show password' : 'Hide password'}
        >
          {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

/**
 * Multi-step Admin Add User popup:
 * Account → Send OTP → Create user → KYC → Nominee → Done
 */
export default function AdminAddUserModal({ open, onClose, onCreated }) {
  const [step, setStep] = useState('account')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [createdUserId, setCreatedUserId] = useState(null)
  const [createdUserName, setCreatedUserName] = useState('')

  const [account, setAccount] = useState(EMPTY_ACCOUNT)
  const [kyc, setKyc] = useState(EMPTY_KYC)
  const [panFile, setPanFile] = useState(null)
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panPreview, setPanPreview] = useState(null)
  const [aadhaarPreview, setAadhaarPreview] = useState(null)

  const [nominee, setNominee] = useState(EMPTY_NOMINEE)
  const [nomPanFile, setNomPanFile] = useState(null)
  const [nomAadhaarFile, setNomAadhaarFile] = useState(null)
  const [nomPanPreview, setNomPanPreview] = useState(null)
  const [nomAadhaarPreview, setNomAadhaarPreview] = useState(null)

  const nomineeIsMinor = useMemo(() => isMinor(nominee.dob), [nominee.dob])

  const resetAll = () => {
    setStep('account')
    setError('')
    setLoading(false)
    setOtp('')
    setCreatedUserId(null)
    setCreatedUserName('')
    setAccount(EMPTY_ACCOUNT)
    setKyc(EMPTY_KYC)
    setPanFile(null)
    setAadhaarFile(null)
    setPanPreview(null)
    setAadhaarPreview(null)
    setNominee(EMPTY_NOMINEE)
    setNomPanFile(null)
    setNomAadhaarFile(null)
    setNomPanPreview(null)
    setNomAadhaarPreview(null)
  }

  useEffect(() => {
    if (open) resetAll()
  }, [open])

  const pickFile = (file, setFile, setPreview) => {
    if (!file) return
    if (!ALLOWED_FILES.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    setError('')
    setFile(file)
    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }

  const setAccountField = (key, value) => setAccount((prev) => ({ ...prev, [key]: value }))
  const setKycField = (key, value) => setKyc((prev) => ({ ...prev, [key]: value }))
  const setNomineeField = (key, value) => setNominee((prev) => ({ ...prev, [key]: value }))

  const sendOtp = async () => {
    setError('')
    const fullName = account.fullName.trim()
    const email = account.email.trim().toLowerCase()
    const phone = account.phone.replace(/\D/g, '')
    if (!fullName) return setError('Full name is required')
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email')
    if (!PHONE_RE.test(phone)) return setError('Enter a valid 10-digit phone')
    if (!account.dateOfBirth) return setError('Date of birth is required')
    if (account.password.length < 6) return setError('Password must be at least 6 characters')
    if (account.password !== account.confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      const firstName = fullName.split(/\s+/)[0] || fullName
      await api.sendAdminUserEmailOtp({
        email,
        purpose: 'EMAIL_VERIFICATION',
        first_name: firstName,
      })
      setStep('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    setError('')
    if (!/^\d{6}$/.test(otp.trim())) return setError('Enter the 6-digit OTP')
    setLoading(true)
    try {
      const fullName = account.fullName.trim()
      const res = await api.createAdminUser({
        full_name: fullName,
        email: account.email.trim().toLowerCase(),
        password: account.password,
        confirm_password: account.confirmPassword,
        phone: account.phone.replace(/\D/g, ''),
        date_of_birth: account.dateOfBirth,
        dob: account.dateOfBirth,
        otp: otp.trim(),
      })
      const id = extractCreatedAdminUserId(res)
      if (!id) throw new ApiError('User created but id was missing in response', 500, res)
      setCreatedUserId(id)
      setCreatedUserName(fullName)
      setKyc((prev) => ({ ...prev, panFullName: prev.panFullName || fullName }))
      setStep('kyc')
      onCreated?.(id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const submitKyc = async () => {
    setError('')
    if (!createdUserId) return setError('Create the user first')
    const pan = kyc.panNumber.trim().toUpperCase()
    const aadhaar = kyc.aadhaarNumber.replace(/\s/g, '')
    if (!PAN_RE.test(pan)) return setError('Enter a valid PAN (e.g. ABCDE1234F)')
    if (!AADHAAR_RE.test(aadhaar)) return setError('Enter a valid 12-digit Aadhaar number')
    if (!kyc.panFullName.trim()) return setError('Name on PAN is required')
    if (!panFile || !aadhaarFile) return setError('Both PAN and Aadhaar documents are required')

    setLoading(true)
    try {
      await api.submitAdminUserKyc(
        createdUserId,
        buildAdminUserKycFormData({
          panNumber: pan,
          panFullName: kyc.panFullName.trim(),
          aadhaarNumber: aadhaar,
          panImage: panFile,
          aadhaarImage: aadhaarFile,
          autoApprove: Boolean(kyc.autoApprove),
        }),
      )
      setStep('nominee')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'KYC submission failed')
    } finally {
      setLoading(false)
    }
  }

  const submitNominee = async () => {
    setError('')
    if (!createdUserId) return setError('Create the user first')
    const mobile = nominee.mobile.replace(/\D/g, '')
    const pan = nominee.panNumber.trim().toUpperCase()
    const aadhaar = nominee.aadhaarNumber.replace(/\s/g, '')

    if (!nominee.nomineeName.trim()) return setError('Nominee name is required')
    if (!nominee.relationship) return setError('Relationship is required')
    if (!nominee.dob) return setError('Nominee date of birth is required')
    if (!PHONE_RE.test(mobile)) return setError('Enter a valid nominee mobile')
    if (nominee.email && !EMAIL_RE.test(nominee.email)) return setError('Enter a valid nominee email')
    if (!PAN_RE.test(pan)) return setError('Enter a valid nominee PAN')
    if (!AADHAAR_RE.test(aadhaar)) return setError('Enter a valid nominee Aadhaar')
    if (!nomPanFile || !nomAadhaarFile) return setError('Nominee PAN and Aadhaar documents are required')
    if (nomineeIsMinor && (!nominee.guardianName.trim() || !nominee.guardianRelationship.trim())) {
      return setError('Guardian name and relationship are required for minor nominees')
    }

    setLoading(true)
    try {
      await api.submitAdminUserNominee(
        createdUserId,
        buildAdminUserNomineeFormData(nominee, nomPanFile, nomAadhaarFile),
      )
      setStep('done')
      onCreated?.(createdUserId)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nominee submission failed')
    } finally {
      setLoading(false)
    }
  }

  const title = {
    account: 'Add User',
    otp: 'Verify email OTP',
    kyc: 'Submit KYC',
    nominee: 'Add Nominee',
    done: 'User created',
  }[step]

  const description = {
    account: 'Same payload as register — send email OTP, then create the account.',
    otp: `OTP sent to ${account.email}. Create user with the same register body + otp.`,
    kyc: 'Same multipart fields as POST /kyc/manual.',
    nominee: 'Same multipart fields as POST /kyc/nominee.',
    done: 'Account, KYC and nominee saved. Open user detail to review.',
  }[step]

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      wide
    >
      <StepTabs step={step} />

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === 'account' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Full name *</label>
              <AdminInput
                className="mt-1"
                value={account.fullName}
                onChange={(e) => setAccountField('fullName', e.target.value)}
                placeholder="Rahul Sharma"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Email *</label>
              <AdminInput
                className="mt-1"
                type="email"
                value={account.email}
                onChange={(e) => setAccountField('email', e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Phone *</label>
              <AdminInput
                className="mt-1"
                value={account.phone}
                maxLength={10}
                onChange={(e) => setAccountField('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Date of birth *</label>
              <AdminInput
                className="mt-1"
                type="date"
                value={account.dateOfBirth}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAccountField('dateOfBirth', e.target.value)}
              />
            </div>
            <PasswordField
              label="Password *"
              value={account.password}
              onChange={(v) => setAccountField('password', v)}
              placeholder="Secret@123"
            />
            <PasswordField
              label="Confirm password *"
              value={account.confirmPassword}
              onChange={(v) => setAccountField('confirmPassword', v)}
              placeholder="Secret@123"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
            <AdminButton onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send email OTP'}
            </AdminButton>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="text-xs font-medium text-slate-600">6-digit OTP *</label>
            <AdminInput
              className="mt-1 tracking-[0.35em] font-semibold text-center"
              value={otp}
              maxLength={6}
              inputMode="numeric"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
            />
          </div>
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <AdminButton variant="outline" onClick={() => { setStep('account'); setError('') }}>
              ← Edit details
            </AdminButton>
            <div className="flex gap-2">
              <AdminButton variant="outline" onClick={sendOtp} disabled={loading}>
                Resend OTP
              </AdminButton>
              <AdminButton onClick={createUser} disabled={loading || otp.length !== 6}>
                {loading ? 'Creating…' : 'Create user'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {step === 'kyc' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">PAN number *</label>
              <AdminInput
                className="mt-1 uppercase"
                value={kyc.panNumber}
                maxLength={10}
                onChange={(e) => setKycField('panNumber', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Name on PAN *</label>
              <AdminInput
                className="mt-1"
                value={kyc.panFullName}
                onChange={(e) => setKycField('panFullName', e.target.value)}
                placeholder="Rahul Sharma"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Aadhaar number *</label>
              <AdminInput
                className="mt-1"
                value={kyc.aadhaarNumber}
                maxLength={14}
                onChange={(e) => setKycField('aadhaarNumber', formatAadhaarInput(e.target.value))}
                placeholder="1234 5678 9012"
              />
            </div>
            <FileSlot
              label="PAN image *"
              file={panFile}
              preview={panPreview}
              onPick={(f) => pickFile(f, setPanFile, setPanPreview)}
              onClear={() => { setPanFile(null); setPanPreview(null) }}
            />
            <FileSlot
              label="Aadhaar image *"
              file={aadhaarFile}
              preview={aadhaarPreview}
              onPick={(f) => pickFile(f, setAadhaarFile, setAadhaarPreview)}
              onClear={() => { setAadhaarFile(null); setAadhaarPreview(null) }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={kyc.autoApprove}
              onChange={(e) => setKycField('autoApprove', e.target.checked)}
            />
            Auto-approve KYC immediately
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="outline" onClick={() => setStep('nominee')}>
              Skip KYC
            </AdminButton>
            <AdminButton onClick={submitKyc} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit KYC'}
            </AdminButton>
          </div>
        </div>
      )}

      {step === 'nominee' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Nominee name *</label>
              <AdminInput
                className="mt-1"
                value={nominee.nomineeName}
                onChange={(e) => setNomineeField('nomineeName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Relationship *</label>
              <select
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={nominee.relationship}
                onChange={(e) => setNomineeField('relationship', e.target.value)}
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Date of birth *</label>
              <AdminInput
                className="mt-1"
                type="date"
                value={nominee.dob}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNomineeField('dob', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Mobile *</label>
              <AdminInput
                className="mt-1"
                value={nominee.mobile}
                maxLength={10}
                onChange={(e) => setNomineeField('mobile', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <AdminInput
                className="mt-1"
                type="email"
                value={nominee.email}
                onChange={(e) => setNomineeField('email', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Allocation %</label>
              <AdminInput
                className="mt-1"
                type="number"
                min={1}
                max={100}
                value={nominee.allocationPercent}
                onChange={(e) => setNomineeField('allocationPercent', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Address *</label>
              <AdminInput
                className="mt-1"
                value={nominee.address}
                onChange={(e) => setNomineeField('address', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">PAN *</label>
              <AdminInput
                className="mt-1 uppercase"
                value={nominee.panNumber}
                maxLength={10}
                onChange={(e) => setNomineeField('panNumber', e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Aadhaar *</label>
              <AdminInput
                className="mt-1"
                value={nominee.aadhaarNumber}
                maxLength={14}
                onChange={(e) => setNomineeField('aadhaarNumber', formatAadhaarInput(e.target.value))}
              />
            </div>
            <FileSlot
              label="Nominee PAN image *"
              file={nomPanFile}
              preview={nomPanPreview}
              onPick={(f) => pickFile(f, setNomPanFile, setNomPanPreview)}
              onClear={() => { setNomPanFile(null); setNomPanPreview(null) }}
            />
            <FileSlot
              label="Nominee Aadhaar image *"
              file={nomAadhaarFile}
              preview={nomAadhaarPreview}
              onPick={(f) => pickFile(f, setNomAadhaarFile, setNomAadhaarPreview)}
              onClear={() => { setNomAadhaarFile(null); setNomAadhaarPreview(null) }}
            />
            {nomineeIsMinor && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600">Guardian name *</label>
                  <AdminInput
                    className="mt-1"
                    value={nominee.guardianName}
                    onChange={(e) => setNomineeField('guardianName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Guardian relationship *</label>
                  <AdminInput
                    className="mt-1"
                    value={nominee.guardianRelationship}
                    onChange={(e) => setNomineeField('guardianRelationship', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="outline" onClick={() => setStep('done')}>
              Skip nominee
            </AdminButton>
            <AdminButton onClick={submitNominee} disabled={loading}>
              {loading ? 'Saving…' : 'Save nominee'}
            </AdminButton>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4 text-center py-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{createdUserName || 'User'}</span>
            {' '}was created successfully
            {createdUserId ? ` (ID ${createdUserId})` : ''}.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {createdUserId && (
              <Link to={`/admin/users/${createdUserId}`} onClick={onClose}>
                <AdminButton>View user detail</AdminButton>
              </Link>
            )}
            <AdminButton variant="outline" onClick={onClose}>Close</AdminButton>
          </div>
        </div>
      )}
    </AdminModal>
  )
}
