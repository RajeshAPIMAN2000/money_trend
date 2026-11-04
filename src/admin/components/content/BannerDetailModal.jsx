import AdminModal from '../shared/AdminModal.jsx'
import AdminButton from '../ui/AdminButton.jsx'

function DetailItem({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{value || '—'}</dd>
    </div>
  )
}

export default function BannerDetailModal({ open, onClose, item, onEdit, onDelete }) {
  if (!item) return null

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item.title}
      description="Banner details"
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
          <img src={item.image} alt={item.title} className="w-full max-h-64 object-cover rounded-xl border border-slate-200" />
        )}
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <DetailItem label="Title" value={item.title} />
          <DetailItem label="Created" value={item.created} />
          <DetailItem label="Updated" value={item.updated} />
        </dl>
        {item.description && item.description !== '—' && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
          </div>
        )}
      </div>
    </AdminModal>
  )
}
