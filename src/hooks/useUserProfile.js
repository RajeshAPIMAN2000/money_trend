import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import {
  parseUserProfile,
  parseBankAccount,
  buildProfileUpdateFormData,
  buildBankAccountPayload,
} from '../lib/userProfile.js'

export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => parseUserProfile(await api.getProfile()),
    enabled,
  })
}

export function useBankAccount(enabled = true) {
  return useQuery({
    queryKey: ['profile', 'bank-account'],
    queryFn: async () => parseBankAccount(await api.getBankAccount()),
    enabled,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, fields, imageFile }) => {
      const formData = buildProfileUpdateFormData(fields, imageFile)
      return parseUserProfile(await api.updateProfile(userId, formData))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useSaveBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ fields, isUpdate = false }) => {
      const payload = buildBankAccountPayload(fields)
      // POST = create/add, PUT = update (same backend handler)
      const res = isUpdate
        ? await api.updateBankAccount(payload)
        : await api.createBankAccount(payload)
      return parseBankAccount(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'bank-account'] })
    },
  })
}
