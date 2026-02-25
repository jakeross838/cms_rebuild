'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListDailyLogsParams {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  date_from?: string
  date_to?: string
}

interface CreateDailyLogInput {
  job_id: string
  log_date: string
  weather_summary?: string
  high_temp?: number
  low_temp?: number
  conditions?: string
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

export function useDailyLogs(params: ListDailyLogsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.date_from) searchParams.set('date_from', params.date_from)
  if (params.date_to) searchParams.set('date_to', params.date_to)

  const qs = searchParams.toString()
  const url = `/api/v2/daily-logs${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['daily-logs', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDailyLogInput) =>
      fetchJson('/api/v2/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] })
    },
  })
}
