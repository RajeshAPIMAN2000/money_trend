import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { notificationHref } from '../../lib/notifications.js'
import {
  useUserNotifications,
  useUserUnreadCount,
  useUserNotificationMutations,
  useAdminNotifications,
  useAdminUnreadCount,
  useAdminNotificationMutations,
} from '../../hooks/useNotifications.js'

/**
 * Bell + dropdown for user or admin-panel notifications.
 * variant: 'user' | 'admin'
 */
export default function NotificationBell({
  variant = 'user',
  className = '',
  buttonClassName = '',
  panelClassName = '',
  viewAllTo,
}) {
  const isAdmin = variant === 'admin'
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const userList = useUserNotifications({ limit: 20 }, !isAdmin && open)
  const adminList = useAdminNotifications({ limit: 20 }, isAdmin && open)
  const userUnread = useUserUnreadCount(!isAdmin)
  const adminUnread = useAdminUnreadCount(isAdmin)
  const userMut = useUserNotificationMutations()
  const adminMut = useAdminNotificationMutations()

  const listQuery = isAdmin ? adminList : userList
  const unreadQuery = isAdmin ? adminUnread : userUnread
  const { markRead, markAllRead } = isAdmin ? adminMut : userMut

  const unreadCount = unreadQuery.data?.unreadCount
    ?? listQuery.data?.unreadCount
    ?? 0
  const items = listQuery.data?.notifications ?? []
  const defaultViewAll = isAdmin ? '/admin/notifications' : '/notifications'
  const viewAllHref = viewAllTo ?? defaultViewAll

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleItemClick(item) {
    if (!item.isRead) {
      try {
        await markRead.mutateAsync(item.id)
      } catch {
        // still allow navigation
      }
    }
    setOpen(false)
    const href = notificationHref(item, { admin: isAdmin })
    if (href) navigate(href)
  }

  async function handleMarkAll() {
    try {
      await markAllRead.mutateAsync()
    } catch {
      // ignore
    }
  }

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          buttonClassName || 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[1rem] h-4 px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border shadow-xl z-50 overflow-hidden',
            panelClassName
              || (isAdmin
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                : 'bg-white border-slate-200'),
          )}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className={cn('text-sm font-semibold', isAdmin ? 'text-slate-900 dark:text-white' : 'text-ink')}>
                Notifications
              </p>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markAllRead.isPending || unreadCount === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold text-secondary disabled:opacity-40 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {listQuery.isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Loading…</p>
            ) : listQuery.error ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">
                {listQuery.error.message || 'Failed to load'}
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors',
                        !item.isRead && (isAdmin ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-secondary/5'),
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm font-medium leading-snug',
                          isAdmin ? 'text-slate-900 dark:text-white' : 'text-ink',
                        )}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      {item.body && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{item.body}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{item.eventLabel}</span>
                        <span>·</span>
                        <span>{item.createdAtLabel}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
            <Link
              to={viewAllHref}
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-secondary hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
