'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

interface ListScheduleTasksParams {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  parent_task_id?: string
  phase?: string
  trade?: string
  q?: string
}

interface CreateScheduleTaskInput {
  job_id: string
  name: string
  description?: string
  phase?: string
  trade?: string
  task_type: string
  planned_start?: string
  planned_end?: string
  duration_days?: number
  progress_pct?: number
  status?: string
  assigned_to?: string
  assigned_vendor_id?: string
  is_critical_path?: boolean
  sort_order?: number
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

export function useScheduleTasks(params: ListScheduleTasksParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.job_id) searchParams.set('job_id', params.job_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.parent_task_id) searchParams.set('parent_task_id', params.parent_task_id)
  if (params.phase) searchParams.set('phase', params.phase)
  if (params.trade) searchParams.set('trade', params.trade)
  if (params.q) searchParams.set('q', params.q)

  const qs = searchParams.toString()
  const url = `/api/v2/schedule/tasks${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['schedule-tasks', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateScheduleTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScheduleTaskInput) =>
      fetchJson('/api/v2/schedule/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-tasks'] })
    },
  })
}
