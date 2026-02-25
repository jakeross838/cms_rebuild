'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { CreateJobInput, UpdateJobInput } from '@/lib/validation/schemas/jobs'

interface ListJobsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  contract_type?: string
  project_type?: string
  client_id?: string
  search?: string
  startDate?: string
  endDate?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useJobs(params: ListJobsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.status) searchParams.set('status', params.status)
  if (params.contract_type) searchParams.set('contract_type', params.contract_type)
  if (params.project_type) searchParams.set('project_type', params.project_type)
  if (params.client_id) searchParams.set('client_id', params.client_id)
  if (params.search) searchParams.set('search', params.search)
  if (params.startDate) searchParams.set('startDate', params.startDate)
  if (params.endDate) searchParams.set('endDate', params.endDate)

  const qs = searchParams.toString()
  const url = `/api/v1/jobs${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => fetchJson(url),
  })
}

export function useJob(id: string | null) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJson(`/api/v1/jobs/${id}`),
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateJobInput) =>
      fetchJson('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJob(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateJobInput) =>
      fetchJson(`/api/v1/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/jobs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
