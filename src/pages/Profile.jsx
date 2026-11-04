import { useEffect, useState } from 'react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import FormInput from '../components/auth/FormInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  useUserProfile,
  useBankAccount,
  useUpdateProfile,
  useSaveBankAccount,
} from '../hooks/useUserProfile.js'
import {
  kycBadgeLabel,
  kycBadgeTone,
  initialsFromName,
} from '../lib/userProfile.js'
import { EMAIL_RE, PHONE_RE, RELATIONSHIPS } from '../lib/validators.js'
import { ApiError } from '../lib/api.js'

const TABS = ['Personal', 'Bank Accounts', 'Nominees']

function Field({ label, value }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <div className="mt-1 px-3 py-2 border border-slate-200 rounded-btn bg-slate-50 text-sm">
        {value || '—'}
      </div>
    </div>
  )
}

function PersonalTab({ profile, onSaved }) {
  const { showToast } = useToast()
  const updateMutation = useUpdateProfile()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
    })
    setPreview(profile.profileImage)
    setImageFile(null)
  }, [profile])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSave = async () => {
    setError('')
    if (!form.fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!EMAIL_RE.test(form.email)) {
      setError('Enter a valid email')
      return
    }
    if (!PHONE_RE.test(form.phone.replace(/\D/g, ''))) {
      setError('Enter a valid 10-digit mobile number')
      return
    }

    try {
      const updated = await updateMutation.mutateAsync({
        userId: profile.id,
        fields: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        imageFile,
      })
      setEditing(false)
      setImageFile(null)
      onSaved?.(updated)
      showToast('Profile updated successfully')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile')
    }
  }

  if (!editing) {
    return (
      <>
        <div className="flex justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-primary">Personal Details</h3>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={profile.fullName} />
          <Field label="Phone" value={profile.phone ? `+91 ${profile.phone}` : '—'} />
          <Field label="Email" value={profile.email} />
          <Field label="PAN (locked)" value={profile.panNumber || '—'} />
          <Field label="Aadhaar (locked)" value={profile.aadhaarNumber || '—'} />
          <Field label="KYC Status" value={kycBadgeLabel(profile.kycStatus)} />
        </div>
        <p className="text-xs text-slate-500 mt-4">
          PAN and Aadhaar cannot be edited from profile. Contact support if a correction is needed.
        </p>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-between mb-5">
        <h3 className="font-display font-bold text-xl text-primary">Edit Profile</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(false)
              setError('')
              setImageFile(null)
              setPreview(profile.profileImage)
              setForm({
                fullName: profile.fullName || '',
                email: profile.email || '',
                phone: profile.phone || '',
              })
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>
      )}

      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden grid place-items-center text-primary font-bold">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            initialsFromName(form.fullName)
          )}
        </div>
        <label className="text-sm font-semibold text-secondary cursor-pointer hover:underline">
          Change photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setImageFile(file)
              setPreview(URL.createObjectURL(file))
            }}
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
        />
        <FormInput
          label="Phone"
          type="tel"
          maxLength={10}
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
        />
        <FormInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
        />
        <Field label="PAN (not editable)" value={profile.panNumber || '—'} />
        <Field label="Aadhaar (not editable)" value={profile.aadhaarNumber || '—'} />
      </div>
    </>
  )
}

function BankTab({ bankData }) {
  const { showToast } = useToast()
  const saveMutation = useSaveBankAccount()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    branchName: '',
    ifsc: '',
    accountNumber: '',
  })

  useEffect(() => {
    const account = bankData?.account
    if (!account) return
    setForm({
      accountHolderName: account.accountHolderName || '',
      bankName: account.bankName || '',
      branchName: account.branchName || '',
      ifsc: account.ifsc || '',
      accountNumber: '',
    })
  }, [bankData])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const account = bankData?.account

  const onSave = async () => {
    setError('')
    if (!form.accountHolderName.trim() || !form.bankName.trim() || !form.branchName.trim()) {
      setError('Account holder, bank name and branch are required')
      return
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim().toUpperCase())) {
      setError('Enter a valid IFSC (e.g. HDFC0001234)')
      return
    }
    if (!/^\d{9,18}$/.test(form.accountNumber.replace(/\s/g, ''))) {
      setError('Account number must be 9–18 digits')
      return
    }

    try {
      const isUpdate = Boolean(account)
      await saveMutation.mutateAsync({ fields: form, isUpdate })
      setEditing(false)
      setForm((prev) => ({ ...prev, accountNumber: '' }))
      showToast(isUpdate ? 'Bank account updated successfully' : 'Bank account added successfully')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save bank account')
    }
  }

  if (!editing) {
    return (
      <>
        <div className="flex justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-primary">Linked Bank Account</h3>
          <Button size="sm" onClick={() => setEditing(true)}>
            {account ? 'Update' : '+ Add Bank'}
          </Button>
        </div>
        {!account ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            No bank account saved yet. Add one for withdrawals.
          </p>
        ) : (
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 grid place-items-center font-bold text-secondary">
                {(account.bankName || 'BK').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-primary">{account.bankName}</div>
                <div className="text-xs text-slate-500">
                  {account.accountHolderName} · Acc: {account.accountNumberMasked}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {account.branchName} · IFSC {account.ifsc}
                </div>
              </div>
            </div>
            <Badge tone="green">Primary</Badge>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="flex justify-between mb-5">
        <h3 className="font-display font-bold text-xl text-primary">
          {account ? 'Update Bank Account' : 'Add Bank Account'}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditing(false); setError('') }}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? (account ? 'Updating…' : 'Adding…')
              : (account ? 'Update Bank Account' : 'Add Bank Account')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput
          label="Account Holder Name"
          value={form.accountHolderName}
          onChange={(e) => setField('accountHolderName', e.target.value)}
        />
        <FormInput
          label="Bank Name"
          value={form.bankName}
          onChange={(e) => setField('bankName', e.target.value)}
        />
        <FormInput
          label="Branch Name"
          value={form.branchName}
          onChange={(e) => setField('branchName', e.target.value)}
        />
        <FormInput
          label="IFSC"
          placeholder="HDFC0001234"
          value={form.ifsc}
          onChange={(e) => setField('ifsc', e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 11))}
        />
        <FormInput
          label="Account Number"
          placeholder={account ? `Current: ${account.accountNumberMasked}` : '123456789012'}
          value={form.accountNumber}
          onChange={(e) => setField('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))}
        />
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Enter the full account number to save or update. Stored values are shown masked only.
      </p>
    </>
  )
}

function NomineeTab({ profile, onSaved }) {
  const { showToast } = useToast()
  const updateMutation = useUpdateProfile()
  const nominee = profile?.nominee
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nomineeName: '',
    relationship: 'Spouse',
    dob: '',
    nomineeMobile: '',
    nomineeEmail: '',
    address: '',
  })

  useEffect(() => {
    if (!nominee?.added) return
    setForm({
      nomineeName: nominee.name || '',
      relationship: nominee.relationship || 'Spouse',
      dob: nominee.dobInput || '',
      nomineeMobile: String(nominee.mobile || '').replace(/\D/g, '').slice(-10),
      nomineeEmail: nominee.email || '',
      address: nominee.address || '',
    })
  }, [nominee])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSave = async () => {
    setError('')
    if (!form.nomineeName.trim() || !form.relationship || !form.dob) {
      setError('Nominee name, relationship and date of birth are required')
      return
    }
    if (!PHONE_RE.test(form.nomineeMobile)) {
      setError('Enter a valid nominee mobile number')
      return
    }
    if (!EMAIL_RE.test(form.nomineeEmail)) {
      setError('Enter a valid nominee email')
      return
    }
    if (!form.address.trim()) {
      setError('Nominee address is required')
      return
    }

    try {
      const updated = await updateMutation.mutateAsync({
        userId: profile.id,
        fields: form,
      })
      setEditing(false)
      onSaved?.(updated)
      showToast('Nominee details updated')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update nominee')
    }
  }

  if (!nominee?.added && !editing) {
    return (
      <>
        <div className="flex justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-primary">Nominees</h3>
          <Button size="sm" onClick={() => setEditing(true)}>+ Add Nominee</Button>
        </div>
        <p className="text-sm text-slate-500 py-6 text-center">
          {nominee?.message || 'Nominee not added yet.'}
        </p>
      </>
    )
  }

  if (!editing && nominee?.added) {
    return (
      <>
        <div className="flex justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-primary">Nominees</h3>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
        <div className="p-4 border border-slate-200 rounded-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-accent/20 text-accent grid place-items-center font-bold shrink-0">
              {initialsFromName(nominee.name)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-primary truncate">{nominee.name}</div>
              <div className="text-xs text-slate-500">
                {nominee.relationship} · DOB {nominee.dobInput || nominee.dob || '—'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">
                {nominee.mobile} · {nominee.email}
              </div>
            </div>
          </div>
          <Badge tone="blue">{nominee.allocationPercent || 100}% Share</Badge>
        </div>
        {nominee.address && (
          <p className="text-sm text-slate-600 mt-3">
            <span className="font-semibold text-slate-500">Address:</span> {nominee.address}
          </p>
        )}
      </>
    )
  }

  return (
    <>
      <div className="flex justify-between mb-5">
        <h3 className="font-display font-bold text-xl text-primary">
          {nominee?.added ? 'Edit Nominee' : 'Add Nominee'}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditing(false); setError('') }}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput
          label="Nominee Full Name"
          value={form.nomineeName}
          onChange={(e) => setField('nomineeName', e.target.value)}
        />
        <div>
          <label className="text-xs font-semibold text-slate-500">Relationship</label>
          <select
            className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
            value={form.relationship}
            onChange={(e) => setField('relationship', e.target.value)}
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
          onChange={(e) => setField('dob', e.target.value)}
        />
        <FormInput
          label="Mobile"
          type="tel"
          maxLength={10}
          value={form.nomineeMobile}
          onChange={(e) => setField('nomineeMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
        />
        <FormInput
          label="Email"
          type="email"
          value={form.nomineeEmail}
          onChange={(e) => setField('nomineeEmail', e.target.value)}
        />
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">Address</label>
          <textarea
            className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
            rows={2}
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
          />
        </div>
      </div>
    </>
  )
}

export default function Profile() {
  const { updateUser } = useAuth()
  const [tab, setTab] = useState('Personal')
  const { data: profile, isLoading, error, refetch } = useUserProfile(true)
  const { data: bankData, isLoading: bankLoading } = useBankAccount(true)

  const syncAuthUser = (updated) => {
    if (!updated) return
    updateUser({
      id: updated.id,
      full_name: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      profile_image: updated.profileImageRaw,
      kyc_status: updated.kycStatus,
      nominee: updated.raw?.nominee,
      nominee_added: Boolean(updated.nominee?.added),
    })
    refetch()
  }

  return (
    <>
      <PageBanner {...getPageBanner('profile')} />
      <PageSideLayout className="!max-w-5xl">
        <div>
          {isLoading ? (
            <Card hover={false} className="p-8 text-center text-sm text-slate-500">
              Loading profile…
            </Card>
          ) : error || !profile ? (
            <Card hover={false} className="p-8 text-center text-sm text-red-600">
              {error?.message || 'Failed to load profile'}
            </Card>
          ) : (
            <>
              <Card hover={false} className="bg-gradient-to-br from-primary to-secondary text-white">
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="w-20 h-20 rounded-full bg-white text-primary grid place-items-center font-display font-bold text-2xl overflow-hidden">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initialsFromName(profile.fullName)
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-display font-bold">{profile.fullName || 'User'}</h1>
                    <div className="text-white/70 text-sm">
                      {profile.email}
                      {profile.memberSince !== '—' ? ` • Member since ${profile.memberSince}` : ''}
                    </div>
                    <Badge tone={kycBadgeTone(profile.kycStatus)} className="mt-2">
                      {kycBadgeLabel(profile.kycStatus)}
                    </Badge>
                  </div>
                </div>
              </Card>

              <div className="mt-6">
                <Tabs tabs={TABS} active={tab} onChange={setTab} />
              </div>

              <Card hover={false} className="mt-6 animate-fade-in">
                {tab === 'Personal' && (
                  <PersonalTab profile={profile} onSaved={syncAuthUser} />
                )}
                {tab === 'Bank Accounts' && (
                  bankLoading ? (
                    <p className="text-sm text-slate-500 py-6 text-center">Loading bank account…</p>
                  ) : (
                    <BankTab bankData={bankData} />
                  )
                )}
                {tab === 'Nominees' && (
                  <NomineeTab profile={profile} onSaved={syncAuthUser} />
                )}
              </Card>
            </>
          )}
        </div>
      </PageSideLayout>
    </>
  )
}
