import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import SubAdminFormModal from '../../components/users/SubAdminFormModal.jsx'
import {
  useAdminSubAdmins,
  useAdminSubAdmin,
  useAdminSubAdminMutations,
} from '../../hooks/useAdminStaff.js'
import { mapSubAdminToTableRow } from '../../../lib/adminStaff.js'
import { ApiError } from '../../../lib/api.js'

export default function SubAdminsPage() {
  const { data, isLoading, error } = useAdminSubAdmins()
  const { create, update, remove } = useAdminSubAdminMutations()

  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const { data: editItem, isLoading: editLoading } = useAdminSubAdmin(editId)

  const items = data?.items ?? []
  const rows = items.map(mapSubAdminToTableRow)
  const itemMap = useMemo(
    () => Object.fromEntries(items.map((item) => [String(item.id), item])),
    [items],
  )

  const closeForm = () => {
    setCreateOpen(false)
    setEditId(null)
    setFormError('')
  }

  const handleCreate = async (values) => {
    setFormError('')
    if (!values.roles?.length) {
      setFormError('Select at least one role (SEO, Content Creator, or Ticket Raised).')
      return
    }
    try {
      await create.mutateAsync(values)
      closeForm()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create employee')
    }
  }

  const handleUpdate = async (values) => {
    if (!editId) return
    setFormError('')
    try {
      await update.mutateAsync({
        id: editId,
        fields: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          roles: values.roles,
          status: values.status,
        },
      })
      closeForm()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to update employee')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError('')
    try {
      await remove.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Failed to delete employee')
    }
  }

  const editDefaults = editItem
    ? {
        name: editItem.name || '',
        email: editItem.email || '',
        password: '',
        phone: editItem.phone || '',
        status: editItem.status === 'Active' ? 'Active' : 'Inactive',
        roles: editItem.roles || [],
      }
    : null

  return (
    <PageShell
      title="Employees"
      breadcrumb={['Home', 'User Management', 'Employees']}
      description="Add, edit, or delete employees by account. Roles: SEO, Content Creator (blogs and news), and Customer Support."
      stats={data?.stats ?? []}
      actions={
        <AdminButton
          size="sm"
          type="button"
          onClick={() => { setFormError(''); setCreateOpen(true) }}
        >
          <Plus className="w-4 h-4" /> Add Employee
        </AdminButton>
      }
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load employees'}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading employees…</div>
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'roles', label: 'Roles' },
            { key: 'joined', label: 'Created' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
          avatarColumn="name"
          statusColumn="status"
          filters={['Active', 'Inactive']}
          searchPlaceholder="Search employees…"
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setFormError('')
                  setEditId(row.id)
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setDeleteTarget(row); setDeleteError('') }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      <SubAdminFormModal
        open={createOpen}
        onClose={closeForm}
        mode="create"
        resetKey="create"
        onSubmit={handleCreate}
        submitting={create.isPending}
        error={formError}
      />

      <SubAdminFormModal
        open={Boolean(editId) && Boolean(editDefaults) && !editLoading}
        onClose={closeForm}
        mode="edit"
        resetKey={`edit-${editId}`}
        initialValues={editDefaults || undefined}
        onSubmit={handleUpdate}
        submitting={update.isPending}
        error={formError}
      />

      {editId && editLoading && (
        <AdminModal open onClose={closeForm} title="Edit Employee">
          <p className="text-sm text-slate-500 py-6 text-center">Loading employee…</p>
        </AdminModal>
      )}

      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        footer={(
          <>
            <AdminButton variant="outline" type="button" onClick={() => setDeleteTarget(null)}>Cancel</AdminButton>
            <AdminButton type="button" onClick={handleDelete} disabled={remove.isPending}>
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </AdminButton>
          </>
        )}
      >
        <p className="text-sm text-slate-600">
          Remove access for <strong>{deleteTarget?.email || itemMap[String(deleteTarget?.id)]?.email}</strong>?
          They will no longer be able to sign in to the admin panel.
        </p>
        {deleteError && <p className="mt-3 text-sm text-red-600">{deleteError}</p>}
      </AdminModal>
    </PageShell>
  )
}
