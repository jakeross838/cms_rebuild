'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListChangeOrdersParams {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  change_type?: string
  q?: string
}

interface CreateChangeOrderInput {
  job_id: string
  co_number: string
  title: string
  description?: string
  change_type: string
  status?: string
  amount: number
  cost_impact: number
  schedule_impact_days?: number
  document_id?: string
  budget_id?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useChangeOrders(params: ListChangeOrdersParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.change_type) searchParams.set('change_type', params.change_type)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/change-orders${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['change-orders', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateChangeOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChangeOrderInput) =>
      fetchJson('/api/v2/change-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-orders'] })
    },
  })
}
