import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, getAdminToken, getToken } from '../lib/api.js'
import {
  parseNotificationsList,
  parseUnreadCount,
  parseMarkReadResult,
} from '../lib/notifications.js'

/** User notifications — Bearer user token */
export function useUserNotifications(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'user', params],
    queryFn: async () => parseNotificationsList(await api.getNotifications(params)),
    enabled: enabled && Boolean(getToken()),
    refetchInterval: 60_000,
  })
}

export function useUserUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'user', 'unread-count'],
    queryFn: async () => parseUnreadCount(await api.getNotificationsUnreadCount()),
    enabled: enabled && Boolean(getToken()),
    refetchInterval: 45_000,
  })
}

export function useUserNotificationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'user'] })
  }

  const markRead = useMutation({
    mutationFn: async (id) => parseMarkReadResult(await api.markNotificationRead(id)),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: async () => parseMarkReadResult(await api.markAllNotificationsRead()),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead }
}

/** Admin / support / content-manager — Bearer admin token */
export function useAdminNotifications(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'admin', params],
    queryFn: async () => parseNotificationsList(await api.getAdminNotifications(params)),
    enabled: enabled && Boolean(getAdminToken()),
    refetchInterval: 60_000,
  })
}

export function useAdminUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'admin', 'unread-count'],
    queryFn: async () => parseUnreadCount(await api.getAdminNotificationsUnreadCount()),
    enabled: enabled && Boolean(getAdminToken()),
    refetchInterval: 45_000,
  })
}

export function useAdminNotificationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'admin'] })
  }

  const markRead = useMutation({
    mutationFn: async (id) => parseMarkReadResult(await api.markAdminNotificationRead(id)),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: async () => parseMarkReadResult(await api.markAllAdminNotificationsRead()),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead }
}
