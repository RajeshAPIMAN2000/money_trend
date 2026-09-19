import { useMemo, useState } from 'react'
import { Check, Eye, Pencil, Trash2, X } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import ArticleFormModal from '../../components/content/ArticleFormModal.jsx'
import ArticleDetailModal from '../../components/content/ArticleDetailModal.jsx'
import { buildArticleFormData, articleToForm } from '../../../lib/adminContent.js'
import { ApiError } from '../../../lib/api.js'
import { useAdmin } from '../../context/AdminContext.jsx'
import { isSuperAdmin } from '../../data/admin-roles.js'

const CONFIG = {
  news: {
    title: 'News Management',
    breadcrumb: ['Home', 'Content Management', 'News'],
    description: 'Sub Admin posts go Pending. Admin approves to publish or rejects with a reason.',
    filters: ['Pending', 'Published', 'Rejected', 'Draft'],
  },
  blog: {
    title: 'Blog Management',
    breadcrumb: ['Home', 'Content Management', 'Blogs'],
    description: 'Sub Admin posts go Pending. Admin approves to publish or rejects with a reason.',
    filters: ['Pending', 'Published', 'Rejected', 'Draft'],
  },
}

export function createContentArticlesPage({ type, useList, useItem, useMutations }) {
  const config = { ...CONFIG[type], useList, useItem, useMutations }

  return function ContentArticlesPage() {
    const { adminUser } = useAdmin()
    const canModerate = isSuperAdmin(adminUser)
    const isSub = !canModerate

    const [viewId, setViewId] = useState(null)
    const [editId, setEditId] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [rejectTarget, setRejectTarget] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [formError, setFormError] = useState('')
    const [actionError, setActionError] = useState('')

    const { data, isLoading, error, isFetched } = useList()
    const { data: viewItem } = useItem(viewId)
    const { data: editItem } = useItem(editId)
    const { create, update, remove, approve, reject } = useMutations()

    const rows = data?.items ?? []
    const itemMap = useMemo(
      () => Object.fromEntries(rows.map((row) => [String(row.id), row])),
      [rows],
    )

    const handleCreate = async (form) => {
      setFormError('')
      try {
        await create.mutateAsync(buildArticleFormData(form, { isSubAdmin: isSub }))
        setCreateOpen(false)
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : 'Failed to create article')
      }
    }

    const handleUpdate = async (form) => {
      if (!editId) return
      setFormError('')
      try {
        const current = editItem ?? itemMap[String(editId)]
        const resubmit = isSub || current?.statusValue === 'rejected'
        await update.mutateAsync({
          id: editId,
          formData: buildArticleFormData({ ...form, resubmit }, { isSubAdmin: isSub }),
        })
        setEditId(null)
        setViewId(null)
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : 'Failed to update article')
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
        // keep modal open; user can retry
      }
    }

    const handleApprove = async (row) => {
      if (!row?.id || !canModerate) return
      setActionError('')
      try {
        await approve.mutateAsync(row.id)
        setViewId(null)
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : 'Failed to approve')
      }
    }

    const handleRejectSubmit = async () => {
      if (!rejectTarget?.id) return
      const reason = rejectReason.trim()
      if (!reason) {
        setActionError('Rejection reason is required')
        return
      }
      setActionError('')
      try {
        await reject.mutateAsync({ id: rejectTarget.id, reason })
        setRejectTarget(null)
        setRejectReason('')
        setViewId(null)
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : 'Failed to reject')
      }
    }

    const moderating = approve?.isPending || reject?.isPending

    return (
      <PageShell
        title={config.title}
        breadcrumb={config.breadcrumb}
        description={config.description}
        stats={isFetched ? (data?.stats ?? []) : []}
      >
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
            {error.message || 'Failed to load articles'}
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
            {actionError}
          </div>
        )}

        <DataTable
          loading={isLoading}
          columns={[
            { key: 'image', label: 'Image' },
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            { key: 'author', label: 'Author' },
            { key: 'published', label: 'Submitted' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
          imageColumn="image"
          statusColumn="status"
          searchPlaceholder="Search articles..."
          filters={config.filters}
          onAdd={() => setCreateOpen(true)}
          addLabel={isSub ? 'Submit New' : 'Add New'}
          emptyTitle="No record found"
          emptyDescription="No articles are available from the server."
          actions={(row) => {
            const pending = row.statusValue === 'pending'
            const canEdit = canModerate || row.statusValue !== 'published'
            return (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewId(row.id)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {canModerate && pending && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(row)}
                      disabled={moderating}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600"
                      title="Approve & publish"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectTarget(row)
                        setRejectReason('')
                        setActionError('')
                      }}
                      disabled={moderating}
                      className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditId(row.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(itemMap[String(row.id)] ?? row)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          }}
        />

        <ArticleDetailModal
          open={Boolean(viewId)}
          onClose={() => setViewId(null)}
          item={viewItem ?? itemMap[String(viewId)]}
          canModerate={canModerate}
          moderating={moderating}
          onApprove={() => handleApprove(viewItem ?? itemMap[String(viewId)])}
          onReject={() => {
            const item = viewItem ?? itemMap[String(viewId)]
            if (item) {
              setRejectTarget(item)
              setRejectReason('')
              setActionError('')
            }
          }}
          onEdit={() => {
            setEditId(viewId)
            setViewId(null)
          }}
          onDelete={() => {
            const item = viewItem ?? itemMap[String(viewId)]
            if (item) setDeleteTarget(item)
          }}
        />

        <ArticleFormModal
          open={createOpen}
          onClose={() => { setCreateOpen(false); setFormError('') }}
          title={isSub ? 'Submit Article' : 'Create Article'}
          description={isSub
            ? 'Submitted as Pending — Admin must approve before it goes public'
            : 'Add a new article with image upload'}
          onSubmit={handleCreate}
          submitting={create.isPending}
          error={formError}
          resetKey="create"
          isSubAdmin={isSub}
        />

        <ArticleFormModal
          open={Boolean(editId)}
          onClose={() => { setEditId(null); setFormError('') }}
          title="Edit Article"
          description={isSub
            ? 'Saving resubmits the post for Admin approval'
            : 'Update article details'}
          initialValues={articleToForm(editItem ?? itemMap[String(editId)])}
          onSubmit={handleUpdate}
          submitting={update.isPending}
          error={formError}
          resetKey={`${editId ?? 'create'}-${editItem?.id ?? 'pending'}`}
          isSubAdmin={isSub}
        />

        <AdminModal
          open={Boolean(rejectTarget)}
          onClose={() => { setRejectTarget(null); setRejectReason(''); setActionError('') }}
          title="Reject Article"
          description="Provide a reason so the Sub Admin can fix and resubmit."
          footer={(
            <>
              <AdminButton
                variant="outline"
                onClick={() => { setRejectTarget(null); setRejectReason('') }}
              >
                Cancel
              </AdminButton>
              <AdminButton
                className="bg-red-600 hover:bg-red-700"
                onClick={handleRejectSubmit}
                disabled={reject?.isPending}
              >
                {reject?.isPending ? 'Rejecting...' : 'Reject'}
              </AdminButton>
            </>
          )}
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Rejecting <strong>{rejectTarget?.title}</strong>
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Rejection reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="e.g. Needs clearer sources"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </AdminModal>

        <AdminModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Article"
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
}
