'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { InviteUserInput, UpdateUserInput } from '@/lib/validation/schemas/users'

interface ListUsersParams {
  page?: number
  limit?: number
  role?: string
  status?: string
  search?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useUsers(params: ListUsersParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.role) searchParams.set('role', params.role)
  if (params.status) searchParams.set('status', params.status)
  if (params.search) searchParams.set('search', params.search)

  const qs = searchParams.toString()
  const url = `/api/v1/users${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchJson(url),
  })
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchJson(`/api/v1/users/${id}`),
    enabled: !!id,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteUserInput) =>
      fetchJson('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      fetchJson(`/api/v1/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/users/${id}/deactivate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/users/${id}/reactivate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
