'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListPunchItemsParams {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  assigned_vendor_id?: string
  q?: string
}

interface CreatePunchItemInput {
  job_id: string
  title: string
  status?: string
  priority?: string
  description?: string
  location?: string
  room?: string
  category?: string
  assigned_to?: string
  assigned_vendor_id?: string
  due_date?: string
  cost_estimate?: number
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function usePunchItems(params: ListPunchItemsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.priority) searchParams.set('priority', params.priority)
  if (params.category) searchParams.set('category', params.category)
  if (params.assigned_to) searchParams.set('assigned_to', params.assigned_to)
  if (params.assigned_vendor_id) searchParams.set('assigned_vendor_id', params.assigned_vendor_id)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/punch-list${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['punch-items', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreatePunchItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePunchItemInput) =>
      fetchJson('/api/v2/punch-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punch-items'] })
    },
  })
}
