/**
 * Module 08: Daily Logs Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────
export const logStatusEnum = z.enum(['draft', 'submitted', 'approved', 'rejected'])

export const entryTypeEnum = z.enum([
  'note', 'work_performed', 'material_delivery', 'visitor',
  'delay', 'safety_incident', 'inspection',
])

// ── List Daily Logs ───────────────────────────────────────────────────────
export const listDailyLogsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: logStatusEnum.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})

// ── Create Daily Log ──────────────────────────────────────────────────────
export const createDailyLogSchema = z.object({
  job_id: z.string().uuid(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  weather_summary: z.string().trim().max(500).optional(),
  high_temp: z.number().min(-100).max(200).optional(),
  low_temp: z.number().min(-100).max(200).optional(),
  conditions: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(5000).optional(),
})

// ── Update Daily Log ──────────────────────────────────────────────────────
export const updateDailyLogSchema = z.object({
  weather_summary: z.string().trim().max(500).optional(),
  high_temp: z.number().min(-100).max(200).nullable().optional(),
  low_temp: z.number().min(-100).max(200).nullable().optional(),
  conditions: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Submit Daily Log ──────────────────────────────────────────────────────
export const submitDailyLogSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
})

// ── Create Log Entry ──────────────────────────────────────────────────────
export const createLogEntrySchema = z.object({
  entry_type: entryTypeEnum,
  description: z.string().trim().min(1).max(5000),
  time_logged: z.string().datetime().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Update Log Entry ──────────────────────────────────────────────────────
export const updateLogEntrySchema = z.object({
  description: z.string().trim().min(1).max(5000).optional(),
  time_logged: z.string().datetime().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Create Log Labor ──────────────────────────────────────────────────────
export const createLogLaborSchema = z.object({
  worker_name: z.string().trim().min(1).max(255),
  trade: z.string().trim().max(100).optional(),
  hours_worked: z.number().min(0).max(24),
  overtime_hours: z.number().min(0).max(24).optional(),
  headcount: z.number().int().positive().optional(),
})

// ── Create Log Photo ──────────────────────────────────────────────────────
export const createLogPhotoSchema = z.object({
  storage_path: z.string().trim().min(1).max(500),
  caption: z.string().trim().max(500).optional(),
  taken_at: z.string().datetime().optional(),
  location_description: z.string().trim().max(500).optional(),
})
