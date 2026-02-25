'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { CreateCostCodeInput, UpdateCostCodeInput } from '@/lib/validation/schemas/cost-codes'

interface ListCostCodesParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  division?: string
  category?: string
  is_active?: boolean
  parent_id?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useCostCodes(params: ListCostCodesParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.search) searchParams.set('search', params.search)
  if (params.division) searchParams.set('division', params.division)
  if (params.category) searchParams.set('category', params.category)
  if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active))
  if (params.parent_id) searchParams.set('parent_id', params.parent_id)

  const qs = searchParams.toString()
  const url = `/api/v1/cost-codes${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['cost-codes', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCostCode(id: string | null) {
  return useQuery({
    queryKey: ['cost-codes', id],
    queryFn: () => fetchJson(`/api/v1/cost-codes/${id}`),
    enabled: !!id,
  })
}

export function useCreateCostCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCostCodeInput) =>
      fetchJson('/api/v1/cost-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-codes'] })
    },
  })
}

export function useUpdateCostCode(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCostCodeInput) =>
      fetchJson(`/api/v1/cost-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-codes'] })
    },
  })
}

export function useDeleteCostCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/cost-codes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-codes'] })
    },
  })
}
