'use client'

/**
 * Module 01: Users React Query Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'

type UserListParams = {
  page?: number
  limit?: number
  role?: string
  status?: string
  q?: string
}

type UserCreateInput = {
  email: string
  full_name: string
  role?: string
  phone?: string | null
}

const userHooks = createApiHooks<UserListParams, UserCreateInput>(
  'users',
  '/api/v1/users'
)

export const useUsers = userHooks.useList
export const useUser = userHooks.useDetail
export const useCreateUser = userHooks.useCreate
export const useUpdateUser = userHooks.useUpdate

export function useDeactivateUser(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v1/users/${userId}/deactivate`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useReactivateUser(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v1/users/${userId}/reactivate`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
