import { useState } from 'react'
import { Check, CheckCheck } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import {
  useAdminNotifications,
  useAdminUnreadCount,
  useAdminNotificationMutations,
} from '../../../hooks/useNotifications.js'
import { notificationHref } from '../../../lib/notifications.js'
import { useNavigate } from 'react-router-dom'

/**
 * In-app notifications for Super Admin, Customer Support, and Content Creator.
 * Data comes from GET /api/admin/notifications (role-scoped by backend).
 */
export default function AdminNotificationsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data, isLoading, error, isFetched, refetch } = useAdminNotifications({
    ...(unreadOnly ? { unread: 1 } : {}),
    limit: 100,
  })
  const { data: unreadData } = useAdminUnreadCount()
  const { markRead, markAllRead } = useAdminNotificationMutations()

  const items = data?.notifications ?? []
  const unreadCount = unreadData?.unreadCount ?? data?.unreadCount ?? 0

  const rows = items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.eventLabel,
    audience: n.audience || '—',
    status: n.isRead ? 'Read' : 'Unread',
    created: n.createdAtLabel,
    raw: n,
  }))

  async function handleMarkRead(row) {
    try {
      await markRead.mutateAsync(row.id)
      showToast('Marked as read', 'success')
      refetch()
    } catch (err) {
      showToast(err.message || 'Failed to mark as read', 'error')
    }
  }

  async function handleMarkAll() {
    try {
      const res = await markAllRead.mutateAsync()
      showToast(res.message || 'All notifications marked as read', 'success')
      refetch()
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read', 'error')
    }
  }

  async function handleOpen(row) {
    if (!row.raw.isRead) {
      try {
        await markRead.mutateAsync(row.id)
      } catch {
        // continue
      }
    }
    const href = notificationHref(row.raw, { admin: true })
    if (href) navigate(href)
  }

  return (
    <PageShell
      title="Notifications"
      breadcrumb={['Home', 'Communication', 'Notifications']}
      description="Alerts for your role — investments, support tickets, and content approvals. Created automatically by the system."
      stats={isFetched ? [
        { label: 'Total', value: String(data?.total ?? rows.length) },
        { label: 'Unread', value: String(unreadCount) },
      ] : []}
      actions={(
        <AdminButton
          size="sm"
          variant="outline"
          type="button"
          onClick={handleMarkAll}
          disabled={markAllRead.isPending || unreadCount === 0}
        >
          <CheckCheck className="w-4 h-4" />
          {markAllRead.isPending ? 'Marking…' : 'Mark all read'}
        </AdminButton>
      )}
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load notifications'}
        </div>
      )}

      <div className="mb-4">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-slate-300"
          />
          Unread only
        </label>
      </div>

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type' },
          { key: 'audience', label: 'Audience' },
          { key: 'status', label: 'Status' },
          { key: 'created', label: 'When' },
        ]}
        rows={rows}
        statusColumn="status"
        filters={['Unread', 'Read']}
        searchPlaceholder="Search notifications…"
        emptyTitle="No notifications"
        emptyDescription="You will see alerts here when tickets, investments, or content events occur."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleOpen(row)}
              className="px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Open"
            >
              Open
            </button>
            {!row.raw.isRead && (
              <button
                type="button"
                onClick={() => handleMarkRead(row)}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                title="Mark read"
                disabled={markRead.isPending}
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      />
    </PageShell>
  )
}
