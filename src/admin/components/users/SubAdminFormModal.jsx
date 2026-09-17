import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AdminModal from '../shared/AdminModal.jsx'
import AdminInput from '../ui/AdminInput.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import { SUB_ADMIN_ROLES } from '../../data/admin-roles.js'

function RoleCheckboxes({ value, onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((r) => r !== id))
    else onChange([...value, id])
  }

  return (
    <div className="space-y-2">
      {SUB_ADMIN_ROLES.map((role) => {
        const checked = value.includes(role.id)
        return (
          <label
            key={role.id}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              checked ? 'border-blue-500 bg-blue-50/60' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={checked}
              onChange={() => toggle(role.id)}
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">{role.label}</span>
              <span className="block text-xs text-slate-500 mt-0.5">{role.description}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

const EMPTY = {
  name: '',
  email: '',
  password: '',
  phone: '',
  status: 'Active',
  roles: [],
}

/**
 * Popup form for create / edit sub admin.
 */
export default function SubAdminFormModal({
  open,
  onClose,
  mode = 'create',
  initialValues,
  resetKey = 'create',
  onSubmit,
  submitting = false,
  error = '',
}) {
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: { ...EMPTY, ...initialValues },
  })
  const roles = watch('roles') || []

  useEffect(() => {
    if (!open) return
    reset({ ...EMPTY, ...initialValues })
  }, [open, resetKey, reset])

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Sub Admin' : 'Add Sub Admin'}
      description="Email, password, phone and module roles (SEO, Blogs, News)."
      wide={false}
    >
      <form
        id="sub-admin-form"
        onSubmit={handleSubmit((values) => onSubmit({ ...values, roles }))}
        className="space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Name (optional)</label>
            <AdminInput {...register('name')} placeholder="Content Manager" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Email *</label>
            <AdminInput
              {...register('email', { required: true })}
              type="email"
              placeholder="subadmin@moneytrend.in"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Password {mode === 'edit' ? '(leave blank to keep)' : '*'}
            </label>
            <AdminInput
              {...register('password', { required: mode === 'create' })}
              type="password"
              placeholder={mode === 'edit' ? '••••••••' : 'Min 8 characters'}
              className="mt-1"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Phone *</label>
            <AdminInput
              {...register('phone', { required: true })}
              placeholder="+91 98765 43210"
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              {...register('status')}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-2 block">Roles *</label>
          <RoleCheckboxes
            value={roles}
            onChange={(next) => setValue('roles', next, { shouldDirty: true })}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <AdminButton type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={submitting}>
            {submitting
              ? 'Saving…'
              : mode === 'edit'
                ? 'Update Sub Admin'
                : 'Create Sub Admin'}
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  )
}
