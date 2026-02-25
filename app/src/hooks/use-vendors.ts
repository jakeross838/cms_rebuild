'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { CreateVendorInput, UpdateVendorInput } from '@/lib/validation/schemas/vendors'

interface ListVendorsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  trade?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useVendors(params: ListVendorsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.search) searchParams.set('search', params.search)
  if (params.trade) searchParams.set('trade', params.trade)

  const qs = searchParams.toString()
  const url = `/api/v1/vendors${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => fetchJson(url),
  })
}

export function useVendor(id: string | null) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => fetchJson(`/api/v1/vendors/${id}`),
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVendorInput) =>
      fetchJson('/api/v1/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}

export function useUpdateVendor(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateVendorInput) =>
      fetchJson(`/api/v1/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}

export function useDeleteVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/vendors/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}
