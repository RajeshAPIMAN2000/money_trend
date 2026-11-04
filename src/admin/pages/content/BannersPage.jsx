import { useMemo, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import BannerFormModal from '../../components/content/BannerFormModal.jsx'
import BannerDetailModal from '../../components/content/BannerDetailModal.jsx'
import { useAdminBanners, useAdminBanner, useAdminBannerMutations } from '../../hooks/useAdminBanners.js'
import { buildBannerFormData, bannerToForm } from '../../../lib/adminBanners.js'
import { ApiError } from '../../../lib/api.js'

export default function BannersPage() {
  const [viewId, setViewId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formError, setFormError] = useState('')

  const { data, isLoading, error, isFetched } = useAdminBanners()
  const { data: viewItem } = useAdminBanner(viewId)
  const { data: editItem } = useAdminBanner(editId)
  const { create, update, remove } = useAdminBannerMutations()

  const rows = data?.items ?? []
  const itemMap = useMemo(
    () => Object.fromEntries(rows.map((row) => [String(row.id), row])),
    [rows],
  )

  const handleCreate = async (form) => {
    setFormError('')
    try {
      await create.mutateAsync(buildBannerFormData(form))
      setCreateOpen(false)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create banner')
    }
  }

  const handleUpdate = async (form) => {
    if (!editId) return
    setFormError('')
    try {
      await update.mutateAsync({ id: editId, formData: buildBannerFormData(form) })
      setEditId(null)
      setViewId(null)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to update banner')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      setViewId(null)
      setEditId(null)
    } catch {
      // keep modal open for retry
    }
  }

  return (
    <PageShell
      title="Banner Management"
      breadcrumb={['Home', 'Content Management', 'Banners']}
      description="Manage homepage and page banners."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load banners'}
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description' },
          { key: 'created', label: 'Created' },
          { key: 'updated', label: 'Updated' },
        ]}
        rows={rows}
        searchPlaceholder="Search banners..."
        onAdd={() => setCreateOpen(true)}
        addLabel="Add Banner"
        emptyTitle="No record found"
        emptyDescription="No banners are available from the server."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewId(row.id)}
              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditId(row.id)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(itemMap[String(row.id)] ?? row)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <BannerDetailModal
        open={Boolean(viewId)}
        onClose={() => setViewId(null)}
        item={viewItem ?? itemMap[String(viewId)]}
        onEdit={() => {
          setEditId(viewId)
          setViewId(null)
        }}
        onDelete={() => {
          const item = viewItem ?? itemMap[String(viewId)]
          if (item) setDeleteTarget(item)
        }}
      />

      <BannerFormModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setFormError('') }}
        title="Create Banner"
        description="Add a new banner with image upload"
        onSubmit={handleCreate}
        submitting={create.isPending}
        error={formError}
        resetKey="create"
      />

      <BannerFormModal
        open={Boolean(editId)}
        onClose={() => { setEditId(null); setFormError('') }}
        title="Edit Banner"
        description="Update banner details"
        initialValues={bannerToForm(editItem ?? itemMap[String(editId)])}
        onSubmit={handleUpdate}
        submitting={update.isPending}
        error={formError}
        resetKey={`${editId ?? 'create'}-${editItem?.id ?? 'pending'}`}
      />

      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Banner"
        description="This action cannot be undone."
        footer={(
          <>
            <AdminButton variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</AdminButton>
            <AdminButton
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting...' : 'Delete'}
            </AdminButton>
          </>
        )}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
        </p>
      </AdminModal>
    </PageShell>
  )
}
