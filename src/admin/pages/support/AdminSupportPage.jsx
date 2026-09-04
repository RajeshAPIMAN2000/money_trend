import { Eye } from 'lucide-react'
import { useState } from 'react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import {
  useAdminSupportTickets,
  useUpdateAdminSupportStatus,
} from '../../../hooks/useSupport.js'
import { SUPPORT_STATUSES, supportStatusLabel, supportStatusTone } from '../../../lib/support.js'

export default function AdminSupportPage() {
  const { showToast } = useToast()
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, error, isFetched, refetch } = useAdminSupportTickets(
    statusFilter ? { status: statusFilter, limit: 200 } : { limit: 200 },
  )
  const updateStatus = useUpdateAdminSupportStatus()

  const [selected, setSelected] = useState(null)
  const [editStatus, setEditStatus] = useState('pending')
  const [adminNote, setAdminNote] = useState('')

  const summary = data?.summary ?? { pending: 0, inProcess: 0, fixed: 0 }
  const rows = (data?.tickets ?? []).map((t) => ({
    id: t.id,
    ticket: t.ticketNumber,
    subject: t.subject,
    user: t.user?.name || '—',
    email: t.user?.email || '',
    name: t.user?.name || '—',
    status: t.statusLabel,
    created: t.createdAtLabel,
    raw: t,
  }))

  function openTicket(ticket) {
    setSelected(ticket)
    setEditStatus(ticket.status || 'pending')
    setAdminNote(ticket.adminNote || '')
  }

  async function handleSaveStatus() {
    if (!selected) return
    try {
      const updated = await updateStatus.mutateAsync({
        id: selected.id,
        status: editStatus,
        adminNote,
      })
      setSelected(updated)
      showToast('Ticket status updated', 'success')
      refetch()
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  return (
    <PageShell
      title="Support Tickets"
      breadcrumb={['Home', 'Communication', 'Support Tickets']}
      description="Review user support tickets and update resolution status."
      stats={isFetched ? [
        { label: 'Total', value: String(data?.total ?? rows.length) },
        { label: 'Pending', value: String(summary.pending) },
        { label: 'In Process', value: String(summary.inProcess) },
        { label: 'Fixed', value: String(summary.fixed) },
      ] : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load support tickets'}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <label className="text-xs font-semibold text-slate-500">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="">All</option>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>{supportStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'ticket', label: 'Ticket' },
          { key: 'subject', label: 'Subject' },
          { key: 'user', label: 'User' },
          { key: 'status', label: 'Status' },
          { key: 'created', label: 'Created' },
        ]}
        rows={rows}
        statusColumn="status"
        filters={['Pending', 'In Process', 'Fixed']}
        searchPlaceholder="Search tickets..."
        emptyTitle="No tickets found"
        emptyDescription="No support tickets match the current filters."
        actions={(row) => (
          <button
            type="button"
            onClick={() => openTicket(row.raw)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.ticketNumber : 'Ticket'}
        description={selected?.subject}
        footer={(
          <>
            <AdminButton variant="outline" onClick={() => setSelected(null)}>Close</AdminButton>
            <AdminButton onClick={handleSaveStatus} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Saving…' : 'Update status'}
            </AdminButton>
          </>
        )}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <AdminBadge tone={supportStatusTone(selected.status)}>{selected.statusLabel}</AdminBadge>
              {selected.user?.email && (
                <span className="text-slate-500">{selected.user.name} · {selected.user.email}</span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 mb-1">Description</div>
              <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{selected.description}</p>
            </div>

            {selected.attachment && (
              <a
                href={selected.attachment}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-semibold hover:underline"
              >
                View attachment
              </a>
            )}

            <dl className="grid sm:grid-cols-2 gap-3">
              {[
                ['Created', selected.createdAtLabel],
                ['Updated', selected.updatedAtLabel],
                ['Resolved', selected.resolvedAt ? selected.resolvedAtLabel : '—'],
                ['Phone', selected.user?.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <label className="text-xs font-semibold text-slate-500">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {SUPPORT_STATUSES.map((s) => (
                  <option key={s} value={s}>{supportStatusLabel(s)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Admin note</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Looking into this…"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        )}
      </AdminModal>
    </PageShell>
  )
}
