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

export default function TransactionDetailModal({ open, onClose, title, description, fields = [] }) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={<AdminButton variant="outline" onClick={onClose}>Close</AdminButton>}
    >
      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        {fields.map(([label, value]) => (
          <DetailItem key={label} label={label} value={value} />
        ))}
      </dl>
    </AdminModal>
  )
}
