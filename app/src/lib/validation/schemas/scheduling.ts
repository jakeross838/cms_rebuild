/**
 * Module 07: Scheduling & Calendar Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const taskStatusEnum = z.enum(['not_started', 'in_progress', 'completed', 'delayed', 'on_hold'])

export const taskTypeEnum = z.enum(['task', 'milestone', 'summary'])

export const dependencyTypeEnum = z.enum(['FS', 'SS', 'FF', 'SF'])

// ── List Schedule Tasks ───────────────────────────────────────────────────

export const listScheduleTasksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: taskStatusEnum.optional(),
  parent_task_id: z.string().uuid().optional(),
  phase: z.string().trim().min(1).max(100).optional(),
  trade: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

// ── Create Schedule Task ──────────────────────────────────────────────────

export const createScheduleTaskSchema = z.object({
  name: z.string().trim().min(1).max(255),
  job_id: z.string().uuid(),
  parent_task_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  phase: z.string().trim().max(100).nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  task_type: taskTypeEnum.optional().default('task'),
  planned_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  planned_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  actual_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  actual_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  duration_days: z.number().int().min(0).nullable().optional(),
  progress_pct: z.number().min(0).max(100).optional().default(0),
  status: taskStatusEnum.optional().default('not_started'),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  is_critical_path: z.boolean().optional().default(false),
  total_float: z.number().int().nullable().optional(),
  sort_order: z.number().int().optional().default(0),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Update Schedule Task ──────────────────────────────────────────────────

export const updateScheduleTaskSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  parent_task_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  phase: z.string().trim().max(100).nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  task_type: taskTypeEnum.optional(),
  planned_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  planned_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  actual_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  actual_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  duration_days: z.number().int().min(0).nullable().optional(),
  progress_pct: z.number().min(0).max(100).optional(),
  status: taskStatusEnum.optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  is_critical_path: z.boolean().optional(),
  total_float: z.number().int().nullable().optional(),
  sort_order: z.number().int().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Create Dependency ─────────────────────────────────────────────────────

export const createDependencySchema = z.object({
  predecessor_id: z.string().uuid(),
  successor_id: z.string().uuid(),
  dependency_type: dependencyTypeEnum.optional().default('FS'),
  lag_days: z.number().int().optional().default(0),
})

// ── Create Baseline ───────────────────────────────────────────────────────

export const createBaselineSchema = z.object({
  job_id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  baseline_data: z.record(z.string(), z.unknown()).optional().default({}),
})

// ── List Baselines ────────────────────────────────────────────────────────

export const listBaselinesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid(),
})

// ── Create Weather Record ─────────────────────────────────────────────────

export const createWeatherRecordSchema = z.object({
  job_id: z.string().uuid(),
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  high_temp: z.number().min(-100).max(200).nullable().optional(),
  low_temp: z.number().min(-100).max(200).nullable().optional(),
  conditions: z.string().trim().max(100).nullable().optional(),
  precipitation_inches: z.number().min(0).max(100).nullable().optional(),
  wind_mph: z.number().min(0).max(300).nullable().optional(),
  is_work_day: z.boolean().optional().default(true),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Update Weather Record ─────────────────────────────────────────────────

export const updateWeatherRecordSchema = z.object({
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  high_temp: z.number().min(-100).max(200).nullable().optional(),
  low_temp: z.number().min(-100).max(200).nullable().optional(),
  conditions: z.string().trim().max(100).nullable().optional(),
  precipitation_inches: z.number().min(0).max(100).nullable().optional(),
  wind_mph: z.number().min(0).max(300).nullable().optional(),
  is_work_day: z.boolean().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── List Weather Records ──────────────────────────────────────────────────

export const listWeatherRecordsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})
