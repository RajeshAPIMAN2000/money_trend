import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import {
  useAdminTestimonials,
  useAdminTestimonialMutations,
} from '../../hooks/useAdminTestimonials.js'

export default function AdminTestimonialsPage() {
  const [status, setStatus] = useState('active')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { data, isLoading, error, isFetched } = useAdminTestimonials({
    limit: 50,
    offset: 0,
    status: status || undefined,
  })
  const { remove } = useAdminTestimonialMutations()

  const items = data?.items ?? []
  const rows = useMemo(
    () => items.map((t) => ({
      id: t.id,
      customer: t.name,
      rating: `${t.rating}/5`,
      review: t.description || t.message,
      status: t.status,
      statusValue: t.status,
      submitted: t.createdAtLabel || '—',
      userId: t.userId,
    })),
    [items],
  )

  const itemMap = useMemo(
    () => Object.fromEntries(items.map((t) => [String(t.id), t])),
    [items],
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // keep modal open for retry
    }
  }

  return (
    <PageShell
      title="Testimonials"
      breadcrumb={['Home', 'Content Management', 'Testimonials']}
      description="Customer reviews from POST /testimonials. Delete removes them from the home page."
      stats={isFetched ? (data?.stats ?? []) : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load testimonials'}
        </div>
      )}

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="active">Active</option>
          <option value="">All statuses</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'customer', label: 'Customer' },
          { key: 'rating', label: 'Rating' },
          { key: 'review', label: 'Description' },
          { key: 'status', label: 'Status' },
          { key: 'submitted', label: 'Submitted' },
        ]}
        rows={rows}
        statusColumn="status"
        searchPlaceholder="Search reviews…"
        emptyTitle="No testimonials yet"
        emptyDescription="When customers submit reviews, they appear here."
        actions={(row) => (
          <div className="flex items-center gap-2">
            {row.userId ? (
              <Link
                to={`/admin/users/${row.userId}`}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                User
              </Link>
            ) : null}
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

      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete testimonial?"
        description={
          deleteTarget
            ? `Remove review by ${deleteTarget.name || deleteTarget.customer}? It will no longer show on the home page.`
            : ''
        }
        footer={
          <div className="flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              className="!bg-red-600 hover:!bg-red-700 text-white"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </AdminButton>
          </div>
        }
      >
        {(deleteTarget?.description || deleteTarget?.message || deleteTarget?.review) ? (
          <p className="text-sm text-slate-600 italic line-clamp-4">
            &ldquo;{deleteTarget.description || deleteTarget.message || deleteTarget.review}&rdquo;
          </p>
        ) : null}
      </AdminModal>
    </PageShell>
  )
}
