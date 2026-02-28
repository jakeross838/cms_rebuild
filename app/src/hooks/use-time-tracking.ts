'use client'

/**
 * Module 51: Time Tracking & Labor Management React Query Hooks
 *
 * Covers: time entries, clock in/out, approval, payroll periods, payroll exports, labor rates.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  TimeEntry,
  PayrollPeriod,
  PayrollExport,
  LaborRate,
  GpsData,
} from '@/types/time-tracking'

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

// ── Time Entries ─────────────────────────────────────────────────────────────

type TimeEntryListParams = {
  page?: number
  limit?: number
  job_id?: string
  user_id?: string
  status?: string
  entry_date_from?: string
  entry_date_to?: string
  q?: string
}

type TimeEntryCreateInput = {
  job_id: string
  user_id?: string
  cost_code_id?: string | null
  entry_date: string
  clock_in?: string | null
  clock_out?: string | null
  regular_hours?: number | null
  overtime_hours?: number | null
  double_time_hours?: number | null
  break_minutes?: number | null
  status: string
  notes?: string | null
  entry_method?: string
}

const timeEntryHooks = createApiHooks<TimeEntryListParams, TimeEntryCreateInput>(
  'time-entries',
  '/api/v2/time-entries'
)

export const useTimeEntries = timeEntryHooks.useList
export const useTimeEntry = timeEntryHooks.useDetail
export const useCreateTimeEntry = timeEntryHooks.useCreate
export const useUpdateTimeEntry = timeEntryHooks.useUpdate
export const useDeleteTimeEntry = timeEntryHooks.useDelete

// ── Clock In / Out ──────────────────────────────────────────────────────────

type ClockInInput = {
  job_id: string
  cost_code_id?: string | null
  notes?: string | null
  gps_data?: GpsData | null
}

/** Clock in — creates a new time entry with clock_in timestamp */
export function useClockIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClockInInput) =>
      fetchJson('/api/v2/time-entries/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-entries'] })
    },
  })
}

type ClockOutInput = {
  time_entry_id?: string
  notes?: string | null
  gps_data?: GpsData | null
}

/** Clock out — updates an existing time entry with clock_out timestamp */
export function useClockOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClockOutInput) =>
      fetchJson('/api/v2/time-entries/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-entries'] })
    },
  })
}

// ── Time Entry Approval ─────────────────────────────────────────────────────

/** Approve a time entry */
export function useApproveTimeEntry(entryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/time-entries/${entryId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approved', ...data }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-entries'] })
      qc.invalidateQueries({ queryKey: ['time-entries', entryId] })
    },
  })
}

/** Reject a time entry */
export function useRejectTimeEntry(entryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { rejection_reason?: string }) =>
      fetchJson(`/api/v2/time-entries/${entryId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'rejected', ...data }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-entries'] })
      qc.invalidateQueries({ queryKey: ['time-entries', entryId] })
    },
  })
}

// ── Payroll Periods ─────────────────────────────────────────────────────────

type PayrollPeriodListParams = {
  page?: number
  limit?: number
  status?: string
}

type PayrollPeriodCreateInput = {
  period_start: string
  period_end: string
  status?: string
}

const payrollPeriodHooks = createApiHooks<PayrollPeriodListParams, PayrollPeriodCreateInput>(
  'payroll-periods',
  '/api/v2/payroll/periods'
)

export const usePayrollPeriods = payrollPeriodHooks.useList
export const usePayrollPeriod = payrollPeriodHooks.useDetail
export const useCreatePayrollPeriod = payrollPeriodHooks.useCreate
export const useUpdatePayrollPeriod = payrollPeriodHooks.useUpdate

// ── Payroll Exports ─────────────────────────────────────────────────────────

/** Trigger a payroll export */
export function useCreatePayrollExport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { payroll_period_id?: string; export_format: string }) =>
      fetchJson('/api/v2/payroll/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] })
    },
  })
}

/** List payroll exports */
export function usePayrollExports(params?: { page?: number; limit?: number; payroll_period_id?: string }) {
  return useQuery<{ data: PayrollExport[]; total: number }>({
    queryKey: ['payroll-exports', params],
    queryFn: () => fetchJson(`/api/v2/payroll/exports${buildQs(params)}`),
  })
}

// ── Labor Rates ─────────────────────────────────────────────────────────────

type LaborRateListParams = {
  page?: number
  limit?: number
  user_id?: string
  trade?: string
  rate_type?: string
  q?: string
}

type LaborRateCreateInput = {
  user_id?: string | null
  trade?: string | null
  rate_type: string
  hourly_rate: number
  effective_date: string
  end_date?: string | null
}

const laborRateHooks = createApiHooks<LaborRateListParams, LaborRateCreateInput>(
  'labor-rates',
  '/api/v2/labor-rates'
)

export const useLaborRates = laborRateHooks.useList
export const useLaborRate = laborRateHooks.useDetail
export const useCreateLaborRate = laborRateHooks.useCreate
export const useUpdateLaborRate = laborRateHooks.useUpdate
export const useDeleteLaborRate = laborRateHooks.useDelete

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  TimeEntry,
  PayrollPeriod,
  PayrollExport,
  LaborRate,
  GpsData,
}
