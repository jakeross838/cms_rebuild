/**
 * Module 51: Time Tracking & Labor Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ───────────────────────────────────────────────────────────────────

export const timeEntryStatusEnum = z.enum(['pending', 'approved', 'rejected', 'exported'])

export const rateTypeEnum = z.enum(['regular', 'overtime', 'double_time'])

export const payrollPeriodStatusEnum = z.enum(['open', 'closed', 'exported'])

export const exportFormatEnum = z.enum(['csv', 'quickbooks', 'adp', 'custom'])

export const entryMethodEnum = z.enum(['mobile', 'kiosk', 'manual', 'superintendent'])

// ── GPS Data ────────────────────────────────────────────────────────────────

export const gpsDataSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
})

// ── List / Filter Time Entries ──────────────────────────────────────────────

export const listTimeEntriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  user_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  cost_code_id: z.string().uuid().optional(),
  status: timeEntryStatusEnum.optional(),
  entry_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  entry_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})

// ── Create Time Entry (Manual) ──────────────────────────────────────────────

export const createTimeEntrySchema = z.object({
  user_id: z.string().uuid(),
  job_id: z.string().uuid(),
  cost_code_id: z.string().uuid().optional(),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  clock_in: z.string().datetime().optional(),
  clock_out: z.string().datetime().optional(),
  regular_hours: z.number().min(0).max(24).default(0),
  overtime_hours: z.number().min(0).max(24).default(0),
  double_time_hours: z.number().min(0).max(24).default(0),
  break_minutes: z.number().int().min(0).max(480).default(0),
  notes: z.string().trim().max(2000).optional(),
  gps_clock_in: gpsDataSchema.optional(),
  entry_method: entryMethodEnum.default('manual'),
})

// ── Update Time Entry ───────────────────────────────────────────────────────

export const updateTimeEntrySchema = z.object({
  job_id: z.string().uuid().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  clock_in: z.string().datetime().nullable().optional(),
  clock_out: z.string().datetime().nullable().optional(),
  regular_hours: z.number().min(0).max(24).optional(),
  overtime_hours: z.number().min(0).max(24).optional(),
  double_time_hours: z.number().min(0).max(24).optional(),
  break_minutes: z.number().int().min(0).max(480).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})

// ── Clock In ────────────────────────────────────────────────────────────────

export const clockInSchema = z.object({
  job_id: z.string().uuid(),
  cost_code_id: z.string().uuid().optional(),
  gps: gpsDataSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
})

// ── Clock Out ───────────────────────────────────────────────────────────────

export const clockOutSchema = z.object({
  time_entry_id: z.string().uuid(),
  gps: gpsDataSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
})

// ── Approve Time Entry ──────────────────────────────────────────────────────

export const approveTimeEntrySchema = z.object({
  notes: z.string().trim().max(2000).optional(),
})

// ── Reject Time Entry ───────────────────────────────────────────────────────

export const rejectTimeEntrySchema = z.object({
  rejection_reason: z.string().trim().min(1, 'Rejection reason is required').max(2000),
})

// ── Labor Rates ─────────────────────────────────────────────────────────────

export const listLaborRatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  user_id: z.string().uuid().optional(),
  trade: z.string().trim().min(1).max(100).optional(),
  rate_type: rateTypeEnum.optional(),
})

export const createLaborRateSchema = z.object({
  user_id: z.string().uuid().optional(),
  trade: z.string().trim().min(1).max(100).optional(),
  rate_type: rateTypeEnum,
  hourly_rate: z.number().min(0).max(9999.99),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})

export const updateLaborRateSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  trade: z.string().trim().min(1).max(100).nullable().optional(),
  rate_type: rateTypeEnum.optional(),
  hourly_rate: z.number().min(0).max(9999.99).optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
})

// ── Payroll Periods ─────────────────────────────────────────────────────────

export const listPayrollPeriodsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: payrollPeriodStatusEnum.optional(),
})

export const createPayrollPeriodSchema = z.object({
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
})

export const updatePayrollPeriodSchema = z.object({
  status: payrollPeriodStatusEnum.optional(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})

// ── Payroll Exports ─────────────────────────────────────────────────────────

export const listPayrollExportsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  payroll_period_id: z.string().uuid().optional(),
})

export const createPayrollExportSchema = z.object({
  payroll_period_id: z.string().uuid(),
  export_format: exportFormatEnum,
})

// ── Time Entry Allocations ──────────────────────────────────────────────────

export const createAllocationSchema = z.object({
  job_id: z.string().uuid(),
  cost_code_id: z.string().uuid().optional(),
  hours: z.number().min(0).max(24),
  notes: z.string().trim().max(2000).optional(),
})

export const createAllocationsSchema = z.object({
  allocations: z.array(createAllocationSchema).min(1).max(20),
})
