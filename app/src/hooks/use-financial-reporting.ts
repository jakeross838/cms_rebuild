'use client'

/**
 * Module 19: Financial Reporting React Query Hooks
 *
 * Covers: report definitions, report snapshots, report schedules,
 *         financial periods, report generation.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  ReportDefinition,
  ReportSnapshot,
  ReportSchedule,
  FinancialPeriod,
} from '@/types/financial-reporting'

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Report Definitions ──────────────────────────────────────────────────────

type ReportDefListParams = {
  page?: number
  limit?: number
  report_type?: string
  is_active?: boolean
  q?: string
}

type ReportDefCreateInput = {
  name: string
  report_type: string
  description?: string | null
  config?: Record<string, unknown>
  is_active?: boolean
}

const reportDefHooks = createApiHooks<ReportDefListParams, ReportDefCreateInput>(
  'report-definitions',
  '/api/v2/reports/definitions'
)

export const useReportDefinitions = reportDefHooks.useList
export const useReportDefinition = reportDefHooks.useDetail
export const useCreateReportDefinition = reportDefHooks.useCreate
export const useUpdateReportDefinition = reportDefHooks.useUpdate
export const useDeleteReportDefinition = reportDefHooks.useDelete

// ── Generate Report ─────────────────────────────────────────────────────────

/** Generate a report from a definition (creates a snapshot) */
export function useGenerateReport(definitionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { period_start?: string; period_end?: string; parameters?: Record<string, unknown> }) =>
      fetchJson(`/api/v2/reports/definitions/${definitionId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-snapshots'] })
      qc.invalidateQueries({ queryKey: ['report-definitions'] })
    },
  })
}

// ── Report Snapshots ────────────────────────────────────────────────────────

type SnapshotListParams = {
  page?: number
  limit?: number
  report_definition_id?: string
  period_start?: string
  period_end?: string
}

/** List report snapshots */
export function useReportSnapshots(params?: SnapshotListParams) {
  return useQuery<{ data: ReportSnapshot[]; total: number }>({
    queryKey: ['report-snapshots', params],
    queryFn: () => fetchJson(`/api/v2/reports/snapshots${buildQs(params)}`),
  })
}

/** Get a single report snapshot */
export function useReportSnapshot(snapshotId: string | null) {
  return useQuery<{ data: ReportSnapshot }>({
    queryKey: ['report-snapshots', snapshotId],
    queryFn: () => fetchJson(`/api/v2/reports/snapshots/${snapshotId}`),
    enabled: !!snapshotId,
  })
}

// ── Report Schedules ────────────────────────────────────────────────────────

type ScheduleListParams = {
  page?: number
  limit?: number
  report_definition_id?: string
  is_active?: boolean
}

type ScheduleCreateInput = {
  report_definition_id: string
  frequency: string
  day_of_week?: number | null
  day_of_month?: number | null
  recipients?: { email: string; name: string }[]
  is_active?: boolean
}

const scheduleHooks = createApiHooks<ScheduleListParams, ScheduleCreateInput>(
  'report-schedules',
  '/api/v2/reports/schedules'
)

export const useReportSchedules = scheduleHooks.useList
export const useReportSchedule = scheduleHooks.useDetail
export const useCreateReportSchedule = scheduleHooks.useCreate
export const useUpdateReportSchedule = scheduleHooks.useUpdate
export const useDeleteReportSchedule = scheduleHooks.useDelete

// ── Financial Periods ───────────────────────────────────────────────────────

type PeriodListParams = {
  page?: number
  limit?: number
  status?: string
  fiscal_year?: number
}

type PeriodCreateInput = {
  period_name: string
  period_start: string
  period_end: string
  fiscal_year: number
  fiscal_quarter?: number | null
}

const periodHooks = createApiHooks<PeriodListParams, PeriodCreateInput>(
  'financial-periods',
  '/api/v2/financial-periods'
)

export const useFinancialPeriods = periodHooks.useList
export const useFinancialPeriod = periodHooks.useDetail
export const useCreateFinancialPeriod = periodHooks.useCreate
export const useUpdateFinancialPeriod = periodHooks.useUpdate

// ── Close Financial Period ──────────────────────────────────────────────────

/** Close a financial period */
export function useCloseFinancialPeriod(periodId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/financial-periods/${periodId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial-periods'] })
      qc.invalidateQueries({ queryKey: ['financial-periods', periodId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  ReportDefinition,
  ReportSnapshot,
  ReportSchedule,
  FinancialPeriod,
}
