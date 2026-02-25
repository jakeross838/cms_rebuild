'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListLienWaiversParams {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  waiver_type?: string
  status?: string
  q?: string
}

interface CreateLienWaiverInput {
  job_id: string
  waiver_type: string
  vendor_id?: string
  status?: string
  amount?: number
  through_date?: string
  document_id?: string
  payment_id?: string
  check_number?: string
  claimant_name?: string
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

export function useLienWaivers(params: ListLienWaiversParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.vendor_id) searchParams.set('vendor_id', params.vendor_id)
  if (params.waiver_type) searchParams.set('waiver_type', params.waiver_type)
  if (params.status) searchParams.set('status', params.status)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/lien-waivers${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['lien-waivers', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateLienWaiver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLienWaiverInput) =>
      fetchJson('/api/v2/lien-waivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lien-waivers'] })
    },
  })
}
