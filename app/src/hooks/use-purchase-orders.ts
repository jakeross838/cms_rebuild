'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListPurchaseOrdersParams {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  status?: string
  q?: string
}

interface CreatePurchaseOrderInput {
  job_id: string
  vendor_id: string
  po_number: string
  title: string
  status?: string
  subtotal: number
  tax_amount?: number
  shipping_amount?: number
  total_amount: number
  budget_id?: string
  cost_code_id?: string
  delivery_date?: string
  terms?: string
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

export function usePurchaseOrders(params: ListPurchaseOrdersParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.vendor_id) searchParams.set('vendor_id', params.vendor_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/purchase-orders${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderInput) =>
      fetchJson('/api/v2/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}
