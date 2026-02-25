'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListDrawsParams {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  start_date?: string
  end_date?: string
  q?: string
}

interface CreateDrawInput {
  job_id: string
  draw_number: string
  application_date: string
  period_to: string
  contract_amount: number
  retainage_pct?: number
  lender_reference?: string
  notes?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useDraws(params: ListDrawsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.start_date) searchParams.set('start_date', params.start_date)
  if (params.end_date) searchParams.set('end_date', params.end_date)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/draw-requests${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['draws', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateDraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDrawInput) =>
      fetchJson('/api/v2/draw-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draws'] })
    },
  })
}
