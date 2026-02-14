'use client'

import { useQuery } from '@tanstack/react-query'

interface AuditLogFilters {
  page?: number
  limit?: number
  userId?: string
  eventType?: string
  startDate?: string
  endDate?: string
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useAuthAuditLog(filters: AuditLogFilters = {}) {
  const searchParams = new URLSearchParams()
  if (filters.page) searchParams.set('page', String(filters.page))
  if (filters.limit) searchParams.set('limit', String(filters.limit))
  if (filters.userId) searchParams.set('user_id', filters.userId)
  if (filters.eventType) searchParams.set('event_type', filters.eventType)
  if (filters.startDate) searchParams.set('start_date', filters.startDate)
  if (filters.endDate) searchParams.set('end_date', filters.endDate)

  const qs = searchParams.toString()
  const url = `/api/v1/audit-log${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['auth-audit-log', filters],
    queryFn: () => fetchJson(url),
  })
}
