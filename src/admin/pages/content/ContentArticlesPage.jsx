import { useMemo, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import ArticleFormModal from '../../components/content/ArticleFormModal.jsx'
import ArticleDetailModal from '../../components/content/ArticleDetailModal.jsx'
import { buildArticleFormData, articleToForm } from '../../../lib/adminContent.js'
import { ApiError } from '../../../lib/api.js'

const CONFIG = {
  news: {
    title: 'News Management',
    breadcrumb: ['Home', 'Content Management', 'News'],
    description: 'Manage financial news articles and market updates.',
    filters: ['Published', 'Draft'],
    useList: null,
    useItem: null,
    useMutations: null,
  },
  blog: {
    title: 'Blog Management',
    breadcrumb: ['Home', 'Content Management', 'Blogs'],
    description: 'Manage educational blog posts and articles.',
    filters: ['Published', 'Draft'],
    useList: null,
    useItem: null,
    useMutations: null,
  },
}

export function createContentArticlesPage({ type, useList, useItem, useMutations }) {
  const config = { ...CONFIG[type], useList, useItem, useMutations }

  return function ContentArticlesPage() {
    const [viewId, setViewId] = useState(null)
    const [editId, setEditId] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [formError, setFormError] = useState('')

    const { data, isLoading, error, isFetched } = useList()
    const { data: viewItem } = useItem(viewId)
    const { data: editItem } = useItem(editId)
    const { create, update, remove } = useMutations()

    const rows = data?.items ?? []
    const itemMap = useMemo(
      () => Object.fromEntries(rows.map((row) => [String(row.id), row])),
      [rows],
    )

    const handleCreate = async (form) => {
      setFormError('')
      try {
        await create.mutateAsync(buildArticleFormData(form))
        setCreateOpen(false)
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : 'Failed to create article')
      }
    }

    const handleUpdate = async (form) => {
      if (!editId) return
      setFormError('')
      try {
        await update.mutateAsync({ id: editId, formData: buildArticleFormData(form) })
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

        <DataTable
          loading={isLoading}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            { key: 'author', label: 'Author' },
            { key: 'views', label: 'Views' },
            { key: 'published', label: 'Published' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
          statusColumn="status"
          searchPlaceholder="Search articles..."
          filters={config.filters}
          onAdd={() => setCreateOpen(true)}
          addLabel="Add New"
          emptyTitle="No record found"
          emptyDescription="No articles are available from the server."
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

        <ArticleDetailModal
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

        <ArticleFormModal
          open={createOpen}
          onClose={() => { setCreateOpen(false); setFormError('') }}
          title="Create Article"
          description="Add a new article with image upload"
          onSubmit={handleCreate}
          submitting={create.isPending}
          error={formError}
          resetKey="create"
        />

        <ArticleFormModal
          open={Boolean(editId)}
          onClose={() => { setEditId(null); setFormError('') }}
          title="Edit Article"
          description="Update article details"
          initialValues={articleToForm(editItem ?? itemMap[String(editId)])}
          onSubmit={handleUpdate}
          submitting={update.isPending}
          error={formError}
          resetKey={`${editId ?? 'create'}-${editItem?.id ?? 'pending'}`}
        />

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
