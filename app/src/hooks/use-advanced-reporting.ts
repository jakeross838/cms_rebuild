'use client'

/**
 * Module 39: Advanced Reporting & Custom Report Builder React Query Hooks
 *
 * Covers custom reports, report widgets, report dashboards, dashboard widgets, and saved filters.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  CustomReport,
  CustomReportWidget,
  ReportDashboard,
  DashboardWidget,
  SavedFilter,
} from '@/types/advanced-reporting'

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

// ── Custom Reports ───────────────────────────────────────────────────────────

type ReportListParams = {
  page?: number
  limit?: number
  status?: string
  report_type?: string
  audience?: string
  q?: string
}

type ReportCreateInput = {
  name: string
  report_type?: string
  visualization_type?: string
  description?: string | null
  data_sources?: unknown[]
  fields?: unknown[]
  filters?: Record<string, unknown>
  grouping?: unknown[]
  sorting?: unknown[]
  audience?: string
  status?: string
  refresh_frequency?: string
  is_template?: boolean
}

const reportHooks = createApiHooks<ReportListParams, ReportCreateInput>(
  'advanced-reports',
  '/api/v2/advanced-reports'
)

export const useAdvancedReports = reportHooks.useList
export const useAdvancedReport = reportHooks.useDetail
export const useCreateAdvancedReport = reportHooks.useCreate
export const useUpdateAdvancedReport = reportHooks.useUpdate
export const useDeleteAdvancedReport = reportHooks.useDelete

// ── Report Generation ────────────────────────────────────────────────────────

export function useGenerateReport(reportId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/reports/definitions/${reportId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advanced-reports'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { CustomReport, CustomReportWidget, ReportDashboard, DashboardWidget, SavedFilter }
