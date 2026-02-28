'use client'

/**
 * Module 08: Daily Logs React Query Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type { DailyLog, DailyLogEntry, DailyLogLabor } from '@/types/daily-logs'

// ── Daily Logs (main CRUD) ──────────────────────────────────────────────

type LogListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  date_from?: string
  date_to?: string
}

type LogCreateInput = {
  job_id: string
  log_date: string
  weather_summary?: string
  high_temp?: number
  low_temp?: number
  conditions?: string
  notes?: string
}

const logHooks = createApiHooks<LogListParams, LogCreateInput>(
  'daily-logs',
  '/api/v1/daily-logs'
)

export const useDailyLogs = logHooks.useList
export const useDailyLog = logHooks.useDetail
export const useCreateDailyLog = logHooks.useCreate
export const useUpdateDailyLog = logHooks.useUpdate
export const useDeleteDailyLog = logHooks.useDelete

// ── Submit Daily Log ────────────────────────────────────────────────────

export function useSubmitDailyLog(logId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v1/daily-logs/${logId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-logs'] })
    },
  })
}

// ── Log Entries ─────────────────────────────────────────────────────────

export function useDailyLogEntries(logId: string | null) {
  return useQuery({
    queryKey: ['daily-log-entries', logId],
    queryFn: () => fetchJson(`/api/v1/daily-logs/${logId}/entries`),
    enabled: !!logId,
  })
}

export function useCreateDailyLogEntry(logId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { entry_type: string; description: string; time_logged?: string; sort_order?: number }) =>
      fetchJson(`/api/v1/daily-logs/${logId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-log-entries', logId] })
    },
  })
}

// ── Log Labor ───────────────────────────────────────────────────────────

export function useDailyLogLabor(logId: string | null) {
  return useQuery({
    queryKey: ['daily-log-labor', logId],
    queryFn: () => fetchJson(`/api/v1/daily-logs/${logId}/labor`),
    enabled: !!logId,
  })
}

export function useCreateDailyLogLabor(logId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { worker_name: string; trade?: string; hours_worked: number; overtime_hours?: number; headcount?: number }) =>
      fetchJson(`/api/v1/daily-logs/${logId}/labor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-log-labor', logId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────

export type { DailyLog, DailyLogEntry, DailyLogLabor }
