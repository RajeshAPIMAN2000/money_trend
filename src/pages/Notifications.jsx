import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthModal } from '../context/AuthModalContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  useUserNotifications,
  useUserUnreadCount,
  useUserNotificationMutations,
} from '../hooks/useNotifications.js'
import { notificationHref } from '../lib/notifications.js'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data, isLoading, error, refetch } = useUserNotifications(
    { ...(unreadOnly ? { unread: 1 } : {}), limit: 50 },
    Boolean(user),
  )
  const { data: unreadData } = useUserUnreadCount(Boolean(user))
  const { markRead, markAllRead } = useUserNotificationMutations()

  const items = data?.notifications ?? []
  const unreadCount = unreadData?.unreadCount ?? data?.unreadCount ?? 0

  async function onOpen(item) {
    if (!item.isRead) {
      try {
        await markRead.mutateAsync(item.id)
      } catch {
        // continue
      }
    }
    const href = notificationHref(item, { admin: false })
    if (href) navigate(href)
  }

  async function onMarkAll() {
    try {
      const res = await markAllRead.mutateAsync()
      showToast(res.message || 'All notifications marked as read', 'success')
      refetch()
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read', 'error')
    }
  }

  return (
    <div className="bg-bg min-h-[60vh]">
      <div className="bg-primary text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-white/50 mb-2">
            <Link to="/" className="hover:text-white/80">Home</Link>
            <span className="mx-1.5">/</span>
            Notifications
          </p>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-white/70">
            Updates on investments, withdrawals, support, and more.
          </p>
        </div>
      </div>

      <PageSideLayout className="!max-w-3xl">
        {!user ? (
          <Card hover={false}>
            <p className="text-sm text-slate-600 mb-3">Sign in to view your notifications.</p>
            <Button type="button" onClick={openLogin}>Sign in</Button>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Unread only
                </label>
                {unreadCount > 0 && (
                  <Badge tone="amber">{unreadCount} unread</Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="!h-9 !text-xs"
                onClick={onMarkAll}
                disabled={markAllRead.isPending || unreadCount === 0}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading notifications…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error.message || 'Failed to load'}</p>
            ) : items.length === 0 ? (
              <Card hover={false}>
                <p className="text-sm text-slate-500">No notifications yet.</p>
              </Card>
            ) : (
              <div className="space-y-3 pb-8">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item)}
                    className="w-full text-left"
                  >
                    <Card className={!item.isRead ? 'border-secondary/30 bg-secondary/[0.03]' : ''}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-primary">{item.title}</div>
                          {item.body && (
                            <p className="text-sm text-slate-600 mt-1">{item.body}</p>
                          )}
                          <div className="mt-2 text-xs text-slate-400">
                            {item.eventLabel} · {item.createdAtLabel}
                          </div>
                        </div>
                        {!item.isRead ? (
                          <Badge tone="blue">Unread</Badge>
                        ) : (
                          <Badge tone="slate">Read</Badge>
                        )}
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2 mb-8 text-xs text-slate-400">
              Need help? Visit <Link to="/support" className="text-secondary hover:underline">Support</Link>.
            </p>
          </>
        )}
      </PageSideLayout>
    </div>
  )
}
