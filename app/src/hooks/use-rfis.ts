'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListRfisParams {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  q?: string
}

interface CreateRfiInput {
  job_id: string
  rfi_number: string
  subject: string
  question: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  due_date?: string
  cost_impact?: number
  schedule_impact_days?: number
  related_document_id?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useRfis(params: ListRfisParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.priority) searchParams.set('priority', params.priority)
  if (params.category) searchParams.set('category', params.category)
  if (params.assigned_to) searchParams.set('assigned_to', params.assigned_to)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/rfis${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['rfis', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateRfi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRfiInput) =>
      fetchJson('/api/v2/rfis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfis'] })
    },
  })
}
