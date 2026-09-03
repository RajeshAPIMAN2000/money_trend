import AdminModal from '../shared/AdminModal.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import AdminBadge from '../ui/AdminBadge.jsx'

function DetailItem({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{value || '—'}</dd>
    </div>
  )
}

export default function ArticleDetailModal({ open, onClose, item, onEdit, onDelete }) {
  if (!item) return null

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item.title}
      description="Article details"
      wide
      footer={(
        <>
          <AdminButton variant="outline" onClick={onClose}>Close</AdminButton>
          {onDelete && (
            <AdminButton variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={onDelete}>
              Delete
            </AdminButton>
          )}
          {onEdit && <AdminButton onClick={onEdit}>Edit</AdminButton>}
        </>
      )}
    >
      <div className="space-y-4">
        {item.image && (
          <img src={item.image} alt={item.title} className="w-full max-h-56 object-cover rounded-xl border border-slate-200" />
        )}
        <div className="flex flex-wrap gap-2">
          <AdminBadge tone={item.statusValue === 'published' ? 'success' : 'warning'}>{item.status}</AdminBadge>
          {item.category && item.category !== '—' && <AdminBadge>{item.category}</AdminBadge>}
        </div>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <DetailItem label="Author" value={item.author} />
          <DetailItem label="Views" value={String(item.views)} />
          <DetailItem label="Published" value={item.published} />
          <DetailItem label="Status" value={item.status} />
        </dl>
        {item.description && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
          </div>
        )}
        {item.content && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Content</p>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 p-3">
              {item.content}
            </div>
          </div>
        )}
      </div>
    </AdminModal>
  )
}
