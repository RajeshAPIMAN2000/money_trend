import { Eye, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { isSuperAdmin } from '../../data/admin-roles.js'
import {
  useAdminSupportTickets,
  useAdminSupportTicket,
  useAdminSupportAgents,
  useUpdateAdminSupportStatus,
  useReplyAdminSupportTicket,
  useAssignAdminSupportTicket,
} from '../../../hooks/useSupport.js'
import { SUPPORT_STATUSES, supportStatusLabel, supportStatusTone } from '../../../lib/support.js'

export default function AdminSupportPage() {
  const { showToast } = useToast()
  const { adminUser } = useAdmin()
  const canAssign = isSuperAdmin(adminUser)

  const [statusFilter, setStatusFilter] = useState('')
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const ticketParams = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
    ...(unassignedOnly && canAssign ? { unassigned: 1 } : {}),
    limit: 200,
  }

  const { data, isLoading, error, isFetched, refetch } = useAdminSupportTickets(ticketParams)
  const { data: agentsData, refetch: refetchAgents } = useAdminSupportAgents(true)
  const updateStatus = useUpdateAdminSupportStatus()
  const replyMutation = useReplyAdminSupportTicket()
  const assignMutation = useAssignAdminSupportTicket()

  const [selectedId, setSelectedId] = useState(null)
  const [editStatus, setEditStatus] = useState('pending')
  const [adminNote, setAdminNote] = useState('')
  const [replyText, setReplyText] = useState('')
  const [assignTo, setAssignTo] = useState('')

  const { data: detailTicket, isLoading: detailLoading } = useAdminSupportTicket(selectedId)
  const selected = detailTicket || null

  const freeAgents = agentsData?.free ?? []
  const busyAgents = agentsData?.busy ?? []

  useEffect(() => {
    if (!selected) return
    setEditStatus(selected.status || 'pending')
    setAdminNote(selected.adminNote || '')
    setAssignTo(selected.assignedTo != null ? String(selected.assignedTo) : '')
  }, [selected?.id, selected?.status, selected?.adminNote, selected?.assignedTo])

  const summary = data?.summary ?? { pending: 0, inProcess: 0, resolved: 0, fixed: 0, unassigned: 0 }
  const rows = (data?.tickets ?? []).map((t) => ({
    id: t.id,
    ticket: t.ticketNumber,
    subject: t.subject,
    user: t.user?.name || '—',
    email: t.user?.email || '',
    name: t.user?.name || '—',
    agent: t.isUnassigned ? 'Unassigned' : (t.assignedAgent?.name || '—'),
    status: t.statusLabel,
    created: t.createdAtLabel,
    raw: t,
  }))

  function openTicket(ticket) {
    setSelectedId(ticket.id)
    setReplyText('')
    setEditStatus(ticket.status || 'pending')
    setAdminNote(ticket.adminNote || '')
    setAssignTo(ticket.assignedTo != null ? String(ticket.assignedTo) : '')
  }

  function closeTicket() {
    setSelectedId(null)
    setReplyText('')
    setAssignTo('')
  }

  async function handleSaveStatus() {
    if (!selectedId) return
    try {
      await updateStatus.mutateAsync({
        id: selectedId,
        status: editStatus,
        adminNote,
      })
      showToast('Ticket status updated', 'success')
      refetch()
      refetchAgents()
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  async function handleSendReply() {
    if (!selectedId) return
    const text = replyText.trim()
    if (!text) {
      showToast('Enter a reply message', 'error')
      return
    }
    try {
      await replyMutation.mutateAsync({
        id: selectedId,
        reply: text,
        status: editStatus,
        adminNote,
      })
      setReplyText('')
      showToast('Reply sent to user', 'success')
      refetch()
      refetchAgents()
    } catch (err) {
      showToast(err.message || 'Failed to send reply', 'error')
    }
  }

  async function handleAssign() {
    if (!selectedId || !canAssign) return
    if (!assignTo) {
      showToast('Select a free support agent', 'error')
      return
    }
    try {
      await assignMutation.mutateAsync({
        id: selectedId,
        assignedTo: assignTo,
      })
      showToast('Agent assigned — user notified by email', 'success')
      refetch()
      refetchAgents()
    } catch (err) {
      showToast(err.message || 'Failed to assign agent', 'error')
    }
  }

  const columns = [
    { key: 'ticket', label: 'Ticket' },
    { key: 'subject', label: 'Subject' },
    { key: 'user', label: 'User' },
    ...(canAssign ? [{ key: 'agent', label: 'Assigned to' }] : []),
    { key: 'status', label: 'Stage' },
    { key: 'created', label: 'Created' },
  ]

  return (
    <PageShell
      title="Ticket Raised"
      breadcrumb={['Home', 'Communication', 'Ticket Raised']}
      description={canAssign
        ? 'View all tickets, assign free Customer Support agents, reply, and update stage. SEO and Support stay available to Admin.'
        : 'View and resolve tickets assigned to you. Reply and update stage.'}
      stats={isFetched ? [
        { label: 'Tickets Raised', value: String(data?.total ?? rows.length) },
        { label: 'Pending', value: String(summary.pending) },
        { label: 'In Process', value: String(summary.inProcess) },
        { label: 'Resolved', value: String(summary.resolved ?? summary.fixed) },
        ...(canAssign ? [
          { label: 'Unassigned', value: String(summary.unassigned ?? data?.unassignedCount ?? 0) },
          { label: 'Free agents', value: String(agentsData?.freeCount ?? freeAgents.length) },
          { label: 'Busy agents', value: String(agentsData?.busyCount ?? busyAgents.length) },
        ] : []),
      ] : []}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load support tickets'}
        </div>
      )}

      {canAssign && (
        <div className="mb-5 grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-emerald-800">Free Customer Support</h3>
              <AdminBadge tone="success">{freeAgents.length} free</AdminBadge>
            </div>
            {freeAgents.length === 0 ? (
              <p className="text-xs text-emerald-700/80">No free agents — new tickets stay unassigned until someone is free or you assign after a ticket resolves.</p>
            ) : freeAgents.length === 1 ? (
              <p className="text-xs text-emerald-700/80 mb-2">1 free agent — new tickets auto-assign and the user is emailed.</p>
            ) : (
              <p className="text-xs text-emerald-700/80 mb-2">
                {freeAgents.length} free agents — new tickets stay unassigned until you assign manually.
              </p>
            )}
            <ul className="space-y-1.5 max-h-36 overflow-y-auto">
              {freeAgents.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm text-emerald-900">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-xs text-emerald-700">{a.email || 'Free'}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-amber-800">Busy Customer Support</h3>
              <AdminBadge tone="warning">{busyAgents.length} busy</AdminBadge>
            </div>
            <p className="text-xs text-amber-700/80 mb-2">
              Busy = has any open ticket (Pending / In Process). Shown until resolved.
            </p>
            <ul className="space-y-1.5 max-h-36 overflow-y-auto">
              {busyAgents.length === 0 ? (
                <li className="text-xs text-amber-700">No busy agents right now.</li>
              ) : busyAgents.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm text-amber-900">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-xs text-amber-700">
                    {a.openTickets > 0 ? `${a.openTickets} open` : 'Busy'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-center">
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
        {canAssign && (
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={unassignedOnly}
              onChange={(e) => setUnassignedOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            Needs assignment
          </label>
        )}
        <form
          className="flex gap-2 flex-1 min-w-[200px]"
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(searchInput.trim())
          }}
        >
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tickets…"
            className="h-9 flex-1 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <AdminButton type="submit" size="sm" variant="outline">Search</AdminButton>
        </form>
      </div>

      <DataTable
        loading={isLoading}
        columns={columns}
        rows={rows}
        statusColumn="status"
        filters={['Pending', 'In Process', 'Resolved', 'Unassigned']}
        searchPlaceholder="Filter table…"
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
        open={Boolean(selectedId)}
        onClose={closeTicket}
        title={selected ? selected.ticketNumber : 'Ticket'}
        description={selected?.subject}
        wide
        footer={(
          <>
            <AdminButton variant="outline" onClick={closeTicket}>Close</AdminButton>
            {canAssign && (
              <AdminButton
                variant="outline"
                onClick={handleAssign}
                disabled={assignMutation.isPending || !selected || !assignTo}
              >
                <UserCheck className="w-4 h-4" />
                {assignMutation.isPending ? 'Assigning…' : 'Assign agent'}
              </AdminButton>
            )}
            <AdminButton
              variant="outline"
              onClick={handleSaveStatus}
              disabled={updateStatus.isPending || !selected}
            >
              {updateStatus.isPending ? 'Saving…' : 'Update status'}
            </AdminButton>
            <AdminButton
              onClick={handleSendReply}
              disabled={replyMutation.isPending || !selected}
            >
              {replyMutation.isPending ? 'Sending…' : 'Send reply'}
            </AdminButton>
          </>
        )}
      >
        {detailLoading && !selected ? (
          <p className="text-sm text-slate-500 py-6 text-center">Loading ticket…</p>
        ) : selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <AdminBadge tone={supportStatusTone(selected.status)}>{selected.statusLabel}</AdminBadge>
              {selected.isUnassigned ? (
                <AdminBadge tone="warning">Unassigned</AdminBadge>
              ) : (
                <AdminBadge tone="info">
                  {selected.assignedAgent?.name || 'Assigned'}
                </AdminBadge>
              )}
              {selected.user?.email && (
                <span className="text-slate-500">{selected.user.name} · {selected.user.email}</span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 mb-1">Issue</div>
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

            {selected.replies?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Support replies</div>
                {selected.replies.map((r, i) => (
                  <div key={`${r.createdAt}-${i}`} className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                    <p className="whitespace-pre-wrap text-slate-800">{r.text}</p>
                    <div className="mt-1 text-xs text-slate-500">{r.by} · {r.createdAtLabel}</div>
                  </div>
                ))}
              </div>
            )}

            <dl className="grid sm:grid-cols-2 gap-3">
              {[
                ['Created', selected.createdAtLabel],
                ['Updated', selected.updatedAtLabel],
                ['Assigned', selected.isUnassigned ? '—' : (selected.assignedAtLabel || '—')],
                ['Resolved', selected.resolvedAt ? selected.resolvedAtLabel : '—'],
                ['Phone', selected.user?.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>

            {canAssign && (
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Assign to Customer Support (free agents only)
                </label>
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">Select free agent…</option>
                  {freeAgents.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.name}{a.email ? ` · ${a.email}` : ''}
                    </option>
                  ))}
                  {/* Keep currently assigned agent selectable even if now busy */}
                  {selected.assignedTo != null
                    && !freeAgents.some((a) => String(a.id) === String(selected.assignedTo))
                    && (
                      <option value={String(selected.assignedTo)}>
                        {selected.assignedAgent?.name || `Agent #${selected.assignedTo}`} (current)
                      </option>
                    )}
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  Assigning emails the user that this support agent was assigned. With 2+ free agents, pick manually; with 1 free, new tickets auto-assign.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500">Stage</label>
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
              <label className="text-xs font-semibold text-slate-500">Internal note</label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Looking into this…"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Reply to user (emailed)</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Please re-upload a clear PAN photo and try again."
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        ) : null}
      </AdminModal>
    </PageShell>
  )
}
