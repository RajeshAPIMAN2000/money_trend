import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import FormInput from '../../components/auth/FormInput.jsx'
import Button from '../../components/ui/Button.jsx'
import { RequireAuth } from '../../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, ApiError } from '../../lib/api.js'
import { RELATIONSHIPS, ID_PROOF_TYPES, PHONE_RE, isMinor } from '../../lib/validators.js'

const emptyNominee = () => ({
  name: '', relationship: 'Spouse', dob: '', phone: '', email: '',
  address: '', idProofType: '', idProofNumber: '', allocationPercent: 100,
  guardianName: '', guardianRelationship: '',
})

function NomineeForm() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [nominees, setNominees] = useState([emptyNominee()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totalAllocation = nominees.reduce((s, n) => s + (Number(n.allocationPercent) || 0), 0)

  const updateNominee = (idx, field, value) => {
    setNominees(prev => prev.map((n, i) => i === idx ? { ...n, [field]: value } : n))
  }

  const addNominee = () => {
    const remaining = Math.max(0, 100 - totalAllocation)
    setNominees(prev => [...prev, { ...emptyNominee(), allocationPercent: remaining || 0 }])
  }

  const removeNominee = (idx) => {
    if (nominees.length <= 1) return
    setNominees(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (totalAllocation !== 100) {
      setError(`Total allocation must equal 100% (currently ${totalAllocation}%)`)
      return
    }

    for (const n of nominees) {
      if (!n.name.trim()) { setError('Nominee name is required'); return }
      if (!n.dob) { setError('Nominee date of birth is required'); return }
      if (!PHONE_RE.test(n.phone)) { setError('Valid nominee phone is required'); return }
      if (!n.address.trim()) { setError('Nominee address is required'); return }
      if (isMinor(n.dob) && !n.guardianName.trim()) {
        setError('Guardian details required for minor nominee')
        return
      }
    }

    setLoading(true)
    try {
      await api.submitNominees(nominees)
      updateUser({ registration_complete: true })
      navigate('/onboarding/success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save nominees')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Nominee Details" subtitle="Add nominee(s) for your investments">
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-6">
        {nominees.map((n, idx) => (
          <div key={idx} className="p-4 border border-slate-200 rounded-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary text-sm">Nominee {idx + 1}</h3>
              {nominees.length > 1 && (
                <button type="button" onClick={() => removeNominee(idx)} className="text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <FormInput label="Full Name" value={n.name} onChange={e => updateNominee(idx, 'name', e.target.value)} />
            <div>
              <label className="text-xs font-semibold text-slate-500">Relationship</label>
              <select
                value={n.relationship}
                onChange={e => updateNominee(idx, 'relationship', e.target.value)}
                className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
              >
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <FormInput label="Date of Birth" type="date" value={n.dob} onChange={e => updateNominee(idx, 'dob', e.target.value)} />
            <FormInput label="Phone" type="tel" maxLength={10} value={n.phone} onChange={e => updateNominee(idx, 'phone', e.target.value)} />
            <FormInput label="Email (optional)" type="email" value={n.email} onChange={e => updateNominee(idx, 'email', e.target.value)} />
            <div>
              <label className="text-xs font-semibold text-slate-500">Address</label>
              <textarea
                value={n.address}
                onChange={e => updateNominee(idx, 'address', e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">ID Proof Type</label>
                <select
                  value={n.idProofType}
                  onChange={e => updateNominee(idx, 'idProofType', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-btn text-sm"
                >
                  <option value="">Optional</option>
                  {ID_PROOF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <FormInput label="ID Number" value={n.idProofNumber} onChange={e => updateNominee(idx, 'idProofNumber', e.target.value)} />
            </div>
            <FormInput
              label="Allocation %"
              type="number"
              min={1}
              max={100}
              value={n.allocationPercent}
              onChange={e => updateNominee(idx, 'allocationPercent', e.target.value)}
            />

            {isMinor(n.dob) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-btn space-y-3">
                <p className="text-xs text-amber-700 font-semibold">Guardian details (nominee is a minor)</p>
                <FormInput label="Guardian Name" value={n.guardianName} onChange={e => updateNominee(idx, 'guardianName', e.target.value)} />
                <FormInput label="Guardian Relationship" value={n.guardianRelationship} onChange={e => updateNominee(idx, 'guardianRelationship', e.target.value)} />
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between text-sm">
          <span className={totalAllocation === 100 ? 'text-accent font-semibold' : 'text-red-500 font-semibold'}>
            Total allocation: {totalAllocation}%
          </span>
          <button type="button" onClick={addNominee} className="flex items-center gap-1 text-secondary text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Another Nominee
          </button>
        </div>

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
