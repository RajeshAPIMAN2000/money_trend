import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'
import { SUB_ADMIN_ROLES } from '../../data/admin-roles.js'
import { useAdminSubAdmin, useAdminSubAdminMutations } from '../../hooks/useAdminStaff.js'
import { ApiError } from '../../../lib/api.js'

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

function SubAdminForm({ mode, defaultValues, onSubmit, submitting, formError }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      status: 'Active',
      roles: [],
      ...defaultValues,
    },
  })
  const roles = watch('roles') || []

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Edit Sub Admin' : 'Create Sub Admin'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => onSubmit({
            ...values,
            roles,
          }))}
          className="space-y-5"
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
            <div>
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
            <p className="text-xs text-slate-500 mb-3">
              Assign which modules this sub admin can manage.
            </p>
            <RoleCheckboxes
              value={roles}
              onChange={(next) => setValue('roles', next, { shouldDirty: true })}
            />
          </div>

          {formError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <AdminButton type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'edit' ? 'Update Sub Admin' : 'Create Sub Admin'}
            </AdminButton>
            <Link to="/admin/sub-admins">
              <AdminButton variant="outline" type="button">Cancel</AdminButton>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function AddSubAdminPage() {
  const navigate = useNavigate()
  const { create } = useAdminSubAdminMutations()
  const [formError, setFormError] = useState('')

  const onSubmit = async (values) => {
    setFormError('')
    if (!values.roles?.length) {
      setFormError('Select at least one role (SEO, Blog, or News).')
      return
    }
    try {
      await create.mutateAsync(values)
      navigate('/admin/sub-admins')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create sub admin')
    }
  }

  return (
    <PageShell
      title="Add Sub Admin"
      breadcrumb={['Home', 'User Management', 'Sub Admins', 'Add']}
      showExport={false}
    >
      <SubAdminForm
        mode="create"
        onSubmit={onSubmit}
        submitting={create.isPending}
        formError={formError}
      />
    </PageShell>
  )
}

export function EditSubAdminPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useAdminSubAdmin(id)
  const { update } = useAdminSubAdminMutations()
  const [formError, setFormError] = useState('')

  const onSubmit = async (values) => {
    setFormError('')
    if (!values.roles?.length) {
      setFormError('Select at least one role (SEO, Blog, or News).')
      return
    }
    try {
      await update.mutateAsync({ id, fields: values })
      navigate('/admin/sub-admins')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to update sub admin')
    }
  }

  return (
    <PageShell
      title="Edit Sub Admin"
      breadcrumb={['Home', 'User Management', 'Sub Admins', 'Edit']}
      showExport={false}
    >
      {isLoading && <div className="p-8 text-center text-slate-500">Loading…</div>}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load sub admin'}
        </div>
      )}
      {data && (
        <SubAdminForm
          mode="edit"
          defaultValues={{
            name: data.name || '',
            email: data.email || '',
            password: '',
            phone: data.phone || '',
            status: data.status || 'Active',
            roles: data.roles || [],
          }}
          onSubmit={onSubmit}
          submitting={update.isPending}
          formError={formError}
        />
      )}
    </PageShell>
  )
}

export default AddSubAdminPage
