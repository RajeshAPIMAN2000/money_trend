import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, getToken } from '../lib/api.js'
import {
  parseSupportHelp,
  parseSupportTicketsList,
  parseSupportTicketDetail,
  parseSupportAgents,
  buildSupportTicketFormData,
  buildSupportStatusBody,
  buildSupportReplyBody,
  buildSupportAssignBody,
} from '../lib/support.js'

export function useSupportHelp() {
  return useQuery({
    queryKey: ['support', 'help'],
    queryFn: async () => parseSupportHelp(await api.getSupportHelp()),
  })
}

export function useMySupportTickets(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['support', 'my-tickets', params],
    queryFn: async () => parseSupportTicketsList(await api.getMySupportTickets(params)),
    enabled: enabled && Boolean(getToken()),
  })
}

export function useMySupportTicket(id) {
  return useQuery({
    queryKey: ['support', 'my-ticket', id],
    queryFn: async () => parseSupportTicketDetail(await api.getMySupportTicket(id)),
    enabled: Boolean(id) && Boolean(getToken()),
  })
}

export function useSubmitSupportTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ subject, description, attachment }) => {
      const formData = buildSupportTicketFormData({ subject, description, attachment })
      return api.submitSupportTicket(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'my-tickets'] })
    },
  })
}

export function useAdminSupportTickets(params = {}) {
  return useQuery({
    queryKey: ['admin', 'support', params],
    queryFn: async () => parseSupportTicketsList(await api.getAdminSupportTickets(params)),
  })
}

export function useAdminSupportTicket(id) {
  return useQuery({
    queryKey: ['admin', 'support', id],
    queryFn: async () => parseSupportTicketDetail(await api.getAdminSupportTicket(id)),
    enabled: Boolean(id),
  })
}

export function useAdminSupportAgents(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'support', 'agents'],
    queryFn: async () => parseSupportAgents(await api.getAdminSupportAgents()),
    enabled,
    refetchInterval: 30_000,
  })
}

export function useUpdateAdminSupportStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, adminNote }) => {
      const res = await api.updateAdminSupportTicketStatus(
        id,
        buildSupportStatusBody({ status, adminNote }),
      )
      return parseSupportTicketDetail(res)
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] })
      if (vars?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'support', vars.id] })
      }
    },
  })
}

export function useReplyAdminSupportTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reply, status, adminNote }) => {
      const res = await api.replyAdminSupportTicket(
        id,
        buildSupportReplyBody({ reply, status, adminNote }),
      )
      return parseSupportTicketDetail(res)
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] })
      queryClient.invalidateQueries({ queryKey: ['support', 'my-tickets'] })
      if (vars?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'support', vars.id] })
        queryClient.invalidateQueries({ queryKey: ['support', 'my-ticket', vars.id] })
      }
    },
  })
}

export function useAssignAdminSupportTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, assignedTo }) => {
      const res = await api.assignAdminSupportTicket(
        id,
        buildSupportAssignBody({ assignedTo }),
      )
      return parseSupportTicketDetail(res)
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] })
      if (vars?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'support', vars.id] })
      }
    },
  })
}
