import { useForm } from 'react-hook-form'
import { Calendar, CreditCard, Phone, User } from 'lucide-react'
import FormInput from '../auth/FormInput.jsx'
import Button from '../ui/Button.jsx'
import { NAME_RE, PAN_RE, PHONE_RE } from '../../lib/validators.js'
import { EQUIFAX_CONSENT_VERSION } from '../../lib/equifax.js'

/** Equifax enrollment via MoneyTrend POST /api/credit-check/enrollment */
export default function EquifaxEnrollForm({
  onSubmit,
  loading = false,
  error = '',
  defaultValues = {},
}) {
  const today = new Date().toISOString().split('T')[0]
  const form = useForm({
    defaultValues: {
      fullName: defaultValues.fullName || '',
      pan: defaultValues.pan || '',
      mobile: defaultValues.mobile || '',
      dateOfBirth: defaultValues.dateOfBirth || '',
      consent: false,
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      consent_given: true,
      consentVersion: EQUIFAX_CONSENT_VERSION,
    })
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <FormInput
        label="Full Name"
        icon={<User className="w-4 h-4" />}
        placeholder="As per PAN card"
        error={form.formState.errors.fullName?.message}
        {...form.register('fullName', {
          required: 'Full name is required',
          pattern: { value: NAME_RE, message: 'Enter a valid name (letters only)' },
        })}
      />

      <FormInput
        label="PAN"
        icon={<CreditCard className="w-4 h-4" />}
        placeholder="ABCDE1234F"
        maxLength={10}
        autoComplete="off"
        error={form.formState.errors.pan?.message}
        {...form.register('pan', {
          required: 'PAN is required',
          onChange: (e) => { e.target.value = e.target.value.toUpperCase().replace(/\s/g, '') },
          pattern: { value: PAN_RE, message: 'Enter a valid PAN (e.g. ABCDE1234F)' },
        })}
      />

      <FormInput
        label="Mobile Number"
        type="tel"
        icon={<Phone className="w-4 h-4" />}
        placeholder="10-digit mobile number"
        maxLength={10}
        error={form.formState.errors.mobile?.message}
        {...form.register('mobile', {
          required: 'Mobile number is required',
          pattern: { value: PHONE_RE, message: 'Enter a valid 10-digit mobile number' },
        })}
      />

      <FormInput
        label="Date of Birth"
        type="date"
        icon={<Calendar className="w-4 h-4" />}
        max={today}
        error={form.formState.errors.dateOfBirth?.message}
        {...form.register('dateOfBirth', {
          required: 'Date of birth is required',
        })}
      />

      <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 rounded border-slate-300"
          {...form.register('consent', {
            required: 'Consent is required to enroll',
          })}
        />
        <span className="text-sm text-slate-600 leading-relaxed">
          I authorise MoneyTrend Private Limited to enroll me for Equifax credit score, report and monitoring
          via MoneyTrend’s secure backend. Consent version {EQUIFAX_CONSENT_VERSION}.
        </span>
      </label>
      {form.formState.errors.consent && (
        <p className="text-xs text-red-500 -mt-2">{form.formState.errors.consent.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Enrolling…' : 'Enroll with Equifax'}
      </Button>
    </form>
  )
}
