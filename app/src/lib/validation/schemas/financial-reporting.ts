/**
 * Module 19: Financial Reporting Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const reportTypeEnum = z.enum([
  'profit_loss', 'balance_sheet', 'cash_flow', 'wip',
  'job_cost', 'ar_aging', 'ap_aging', 'budget_vs_actual',
  'retainage', 'custom',
])

export const scheduleFrequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'quarterly'])

export const periodStatusEnum = z.enum(['open', 'closed', 'locked'])

// ── Report Definitions ───────────────────────────────────────────────────

export const listReportDefinitionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  report_type: reportTypeEnum.optional(),
  is_active: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createReportDefinitionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  report_type: reportTypeEnum,
  description: z.string().trim().max(2000).nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  is_system: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export const updateReportDefinitionSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  report_type: reportTypeEnum.optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
})

// ── Report Generation ────────────────────────────────────────────────────

export const generateReportSchema = z.object({
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  parameters: z.record(z.string(), z.unknown()).optional(),
})

// ── Report Snapshots ─────────────────────────────────────────────────────

export const listReportSnapshotsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  report_definition_id: z.string().uuid().optional(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// ── Report Schedules ─────────────────────────────────────────────────────

export const listReportSchedulesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  report_definition_id: z.string().uuid().optional(),
  is_active: z.coerce.boolean().optional(),
})

export const createReportScheduleSchema = z.object({
  report_definition_id: z.string().uuid(),
  frequency: scheduleFrequencyEnum,
  day_of_week: z.number().int().min(0).max(6).nullable().optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().trim().min(1).max(200),
  })).min(1),
  is_active: z.boolean().optional(),
})

export const updateReportScheduleSchema = z.object({
  frequency: scheduleFrequencyEnum.optional(),
  day_of_week: z.number().int().min(0).max(6).nullable().optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().trim().min(1).max(200),
  })).min(1).optional(),
  is_active: z.boolean().optional(),
})

// ── Financial Periods ────────────────────────────────────────────────────

export const listFinancialPeriodsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: periodStatusEnum.optional(),
  fiscal_year: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const createFinancialPeriodSchema = z.object({
  period_name: z.string().trim().min(1).max(50),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  fiscal_year: z.number().int().min(2000).max(2100),
  fiscal_quarter: z.number().int().min(1).max(4).nullable().optional(),
})

export const updateFinancialPeriodSchema = z.object({
  period_name: z.string().trim().min(1).max(50).optional(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fiscal_year: z.number().int().min(2000).max(2100).optional(),
  fiscal_quarter: z.number().int().min(1).max(4).nullable().optional(),
})

export const closeFinancialPeriodSchema = z.object({
  notes: z.string().trim().max(1000).optional(),
})
