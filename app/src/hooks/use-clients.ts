'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { CreateClientInput, UpdateClientInput } from '@/lib/validation/schemas/clients'

interface ListClientsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  lead_source?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useClients(params: ListClientsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.search) searchParams.set('search', params.search)
  if (params.lead_source) searchParams.set('lead_source', params.lead_source)

  const qs = searchParams.toString()
  const url = `/api/v1/clients${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchJson(url),
  })
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => fetchJson(`/api/v1/clients/${id}`),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientInput) =>
      fetchJson('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateClientInput) =>
      fetchJson(`/api/v1/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/clients/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
