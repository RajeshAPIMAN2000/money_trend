import { useForm } from 'react-hook-form'
import { Calendar, CreditCard, MapPin, Phone, User } from 'lucide-react'
import FormInput from '../auth/FormInput.jsx'
import Button from '../ui/Button.jsx'
import { NAME_RE, PAN_RE, PHONE_RE } from '../../lib/validators.js'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
]

export default function CreditCheckForm({ onSubmit, loading = false, error = '', submitLabel = 'Check my CIBIL' }) {
  const today = new Date().toISOString().split('T')[0]
  const form = useForm({
    defaultValues: {
      fullName: '',
      pan: '',
      dateOfBirth: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
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
        label="Address"
        icon={<MapPin className="w-4 h-4" />}
        placeholder="Residential address"
        error={form.formState.errors.address?.message}
        {...form.register('address', { required: 'Address is required' })}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput
          label="City"
          placeholder="City"
          error={form.formState.errors.city?.message}
          {...form.register('city', { required: 'City is required' })}
        />
        <div>
          <label className="text-xs font-semibold text-slate-500">State</label>
          <select
            className={`mt-1 w-full px-3 py-2.5 border rounded-btn text-sm outline-none ${
              form.formState.errors.state ? 'border-red-400' : 'border-slate-300 focus:border-secondary'
            }`}
            {...form.register('state', { required: 'State is required' })}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {form.formState.errors.state && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.state.message}</p>
          )}
        </div>
      </div>

      <FormInput
        label="Pincode"
        placeholder="6-digit pincode"
        maxLength={6}
        error={form.formState.errors.pincode?.message}
        {...form.register('pincode', {
          required: 'Pincode is required',
          pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit pincode' },
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
          I authorize MoneyTrend to request my credit information from the credit bureau
          for the purpose of providing me with my credit score and related insights.
          I understand this may be a soft enquiry and does not replace formal lending eligibility checks.
        </span>
      </label>
      {form.formState.errors.consent && (
        <p className="text-xs text-red-500 -mt-2">{form.formState.errors.consent.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Securely checking your credit information…' : submitLabel}
      </Button>
    </form>
  )
}
