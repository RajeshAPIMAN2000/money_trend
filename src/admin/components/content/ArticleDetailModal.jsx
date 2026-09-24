import AdminModal from '../shared/AdminModal.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import AdminBadge from '../ui/AdminBadge.jsx'
import { isHtmlContent } from '../../../lib/html.js'

function DetailItem({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{value || '—'}</dd>
    </div>
  )
}

function HtmlBlock({ label, html }) {
  if (!html) return null
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {isHtmlContent(html) ? (
        <div
          className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 rounded-xl border border-slate-100 dark:border-slate-800 p-3 max-h-64 overflow-y-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{html}</p>
      )}
    </div>
  )
}

function statusTone(statusValue) {
  const s = String(statusValue || '').toLowerCase()
  if (s === 'published') return 'success'
  if (s === 'pending') return 'warning'
  if (s === 'rejected') return 'danger'
  return 'default'
}

export default function ArticleDetailModal({
  open,
  onClose,
  item,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  canModerate = false,
  moderating = false,
}) {
  if (!item) return null

  const pending = item.statusValue === 'pending'
  const heading = item.titleHtml || item.title

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
          {canModerate && pending && (
            <>
              <AdminButton
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={onReject}
                disabled={moderating}
              >
                Reject
              </AdminButton>
              <AdminButton
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={onApprove}
                disabled={moderating}
              >
                {moderating ? 'Working...' : 'Approve'}
              </AdminButton>
            </>
          )}
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
          <AdminBadge tone={statusTone(item.statusValue)}>{item.status}</AdminBadge>
          {item.category && item.category !== '—' && <AdminBadge>{item.category}</AdminBadge>}
        </div>

        {item.statusValue === 'rejected' && item.rejectionReason && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <span className="font-semibold">Rejection reason: </span>
            {item.rejectionReason}
          </div>
        )}

        <HtmlBlock label="Heading" html={heading} />

        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <DetailItem label="Author" value={item.author} />
          <DetailItem label="Status" value={item.status} />
          <DetailItem label="Submitted" value={item.submittedAt || item.published} />
          <DetailItem label="Reviewed" value={item.reviewedAt} />
          {item.category && item.category !== '—' && (
            <DetailItem label="Category" value={item.category} />
          )}
        </dl>

        <HtmlBlock label="Description" html={item.description} />
      </div>
    </AdminModal>
  )
}
