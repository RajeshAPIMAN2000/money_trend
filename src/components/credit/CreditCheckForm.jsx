import { useForm } from 'react-hook-form'
import { Calendar, CreditCard, Phone, User } from 'lucide-react'
import FormInput from '../auth/FormInput.jsx'
import Button from '../ui/Button.jsx'
import { NAME_RE, PAN_RE, PHONE_RE } from '../../lib/validators.js'

/** Public CIBIL form — name, PAN, mobile, DOB + consent (MoneyTrend API fields). */
export default function CreditCheckForm({ onSubmit, loading = false, error = '', submitLabel = 'Check my CIBIL' }) {
  const today = new Date().toISOString().split('T')[0]
  const form = useForm({
    defaultValues: {
      fullName: '',
      pan: '',
      dateOfBirth: '',
      mobile: '',
      consent: false,
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          validate: (value) => {
            if (!value) return 'Date of birth is required'
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) return 'Enter a valid date'
            if (d > new Date()) return 'Date of birth cannot be in the future'
            return true
          },
        })}
      />

      <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 rounded border-slate-300"
          {...form.register('consent', {
            required: 'Consent is required to proceed',
          })}
        />
        <span className="text-sm text-slate-600 leading-relaxed">
          I authorise MoneyTrend Private Limited to request my credit score and related credit information through
          authorised credit bureau providers (including TransUnion CIBIL, Experian and Equifax, subject to availability)
          for the purpose of displaying credit information to me. I understand MoneyTrend does not independently
          calculate, alter or guarantee my credit score. Consent version v1.0.
        </span>
      </label>
      {form.formState.errors.consent && (
        <p className="text-xs text-red-500 -mt-2">{form.formState.errors.consent.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Running credit check…' : submitLabel}
      </Button>
    </form>
  )
}
