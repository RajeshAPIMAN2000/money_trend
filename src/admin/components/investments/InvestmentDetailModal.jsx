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

export default function InvestmentDetailModal({ open, onClose, title, item, type = 'FD' }) {
  if (!item) return null

  const isRd = type === 'RD'

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description={isRd ? 'Recurring deposit details' : 'Fixed deposit details'}
      footer={<AdminButton variant="outline" onClick={onClose}>Close</AdminButton>}
    >
      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        <DetailItem label="User" value={item.user} />
        <DetailItem label={isRd ? 'Bank' : 'Bank/NBFC'} value={item.provider || item.bank} />
        <DetailItem label={isRd ? 'Monthly Amount' : 'Principal'} value={isRd ? item.monthly : item.amount} />
        <DetailItem label="Interest Rate" value={item.rate} />
        <DetailItem label="Tenure" value={item.tenure} />
        <DetailItem label="Status" value={item.status} />
        {!isRd && <DetailItem label="Maturity Amount" value={item.maturity} />}
        <DetailItem label="Start Date" value={item.startDate} />
        {!isRd && <DetailItem label="Maturity Date" value={item.maturityDate} />}
      </dl>
    </AdminModal>
  )
}
