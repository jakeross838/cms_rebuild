/**
 * Module 08 — Daily Logs Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 08 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  DailyLogStatus,
  DailyLogEntryType,
  DailyLog,
  DailyLogEntry,
  DailyLogLabor,
  DailyLogPhoto,
} from '@/types/daily-logs'

import {
  LOG_STATUSES,
  ENTRY_TYPES,
} from '@/types/daily-logs'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  logStatusEnum,
  entryTypeEnum,
  listDailyLogsSchema,
  createDailyLogSchema,
  updateDailyLogSchema,
  submitDailyLogSchema,
  createLogEntrySchema,
  updateLogEntrySchema,
  createLogLaborSchema,
  createLogPhotoSchema,
} from '@/lib/validation/schemas/daily-logs'

// ============================================================================
// Type System
// ============================================================================

describe('Module 08 — Daily Log Types', () => {
  test('DailyLogStatus has 4 values', () => {
    const statuses: DailyLogStatus[] = ['draft', 'submitted', 'approved', 'rejected']
    expect(statuses).toHaveLength(4)
  })

  test('DailyLogEntryType has 7 values', () => {
    const types: DailyLogEntryType[] = [
      'note', 'work_performed', 'material_delivery', 'visitor',
      'delay', 'safety_incident', 'inspection',
    ]
    expect(types).toHaveLength(7)
  })

  test('DailyLog interface has all required fields', () => {
    const log: DailyLog = {
      id: '1', company_id: '1', job_id: '1', log_date: '2026-02-20',
      status: 'draft', weather_summary: null, high_temp: null,
      low_temp: null, conditions: null, submitted_by: null,
      submitted_at: null, approved_by: null, approved_at: null,
      notes: null, created_by: '1',
      created_at: '2026-02-20', updated_at: '2026-02-20', deleted_at: null,
    }
    expect(log.status).toBe('draft')
    expect(log.company_id).toBe('1')
    expect(log.job_id).toBe('1')
  })

  test('DailyLogEntry interface has all required fields', () => {
    const entry: DailyLogEntry = {
      id: '1', daily_log_id: '1', entry_type: 'work_performed',
      description: 'Framing work completed', time_logged: null,
      sort_order: 0, created_by: '1',
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(entry.entry_type).toBe('work_performed')
    expect(entry.description).toBe('Framing work completed')
  })

  test('DailyLogLabor interface has all required fields', () => {
    const labor: DailyLogLabor = {
      id: '1', daily_log_id: '1', company_id: '1',
      worker_name: 'John Smith', trade: 'Carpenter',
      hours_worked: 8, overtime_hours: 0, headcount: 1,
      created_at: '2026-02-20',
    }
    expect(labor.worker_name).toBe('John Smith')
    expect(labor.hours_worked).toBe(8)
  })

  test('DailyLogPhoto interface has all required fields', () => {
    const photo: DailyLogPhoto = {
      id: '1', daily_log_id: '1', storage_path: '/photos/site-1.jpg',
      caption: 'Foundation work', taken_at: '2026-02-20T10:30:00Z',
      location_description: 'North side', created_by: '1',
      created_at: '2026-02-20',
    }
    expect(photo.storage_path).toBe('/photos/site-1.jpg')
    expect(photo.caption).toBe('Foundation work')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 08 — Constants', () => {
  test('LOG_STATUSES has 4 entries with value and label', () => {
    expect(LOG_STATUSES).toHaveLength(4)
    for (const s of LOG_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('LOG_STATUSES contains all 4 status values', () => {
    const values = LOG_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('submitted')
    expect(values).toContain('approved')
    expect(values).toContain('rejected')
  })

  test('ENTRY_TYPES has 7 entries with value and label', () => {
    expect(ENTRY_TYPES).toHaveLength(7)
    for (const e of ENTRY_TYPES) {
      expect(e).toHaveProperty('value')
      expect(e).toHaveProperty('label')
      expect(e.label.length).toBeGreaterThan(0)
    }
  })

  test('ENTRY_TYPES contains all 7 entry type values', () => {
    const values = ENTRY_TYPES.map((e) => e.value)
    expect(values).toContain('note')
    expect(values).toContain('work_performed')
    expect(values).toContain('material_delivery')
    expect(values).toContain('visitor')
    expect(values).toContain('delay')
    expect(values).toContain('safety_incident')
    expect(values).toContain('inspection')
  })
})

// ============================================================================
// Schemas
// ============================================================================

describe('Module 08 — Validation Schemas', () => {
  test('logStatusEnum accepts all 4 statuses', () => {
    for (const s of ['draft', 'submitted', 'approved', 'rejected']) {
      expect(logStatusEnum.parse(s)).toBe(s)
    }
  })

  test('logStatusEnum rejects invalid status', () => {
    expect(() => logStatusEnum.parse('in_review')).toThrow()
    expect(() => logStatusEnum.parse('unknown')).toThrow()
  })

  test('entryTypeEnum accepts all 7 types', () => {
    for (const t of ['note', 'work_performed', 'material_delivery', 'visitor', 'delay', 'safety_incident', 'inspection']) {
      expect(entryTypeEnum.parse(t)).toBe(t)
    }
  })

  test('entryTypeEnum rejects invalid type', () => {
    expect(() => entryTypeEnum.parse('unknown')).toThrow()
    expect(() => entryTypeEnum.parse('work')).toThrow()
  })

  // ── listDailyLogsSchema ────────────────────────────────────────────────

  test('listDailyLogsSchema accepts valid params with defaults', () => {
    const result = listDailyLogsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listDailyLogsSchema coerces string page/limit to numbers', () => {
    const result = listDailyLogsSchema.parse({ page: '3', limit: '50' })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(50)
  })

  test('listDailyLogsSchema rejects limit > 100', () => {
    expect(() => listDailyLogsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listDailyLogsSchema accepts date filters', () => {
    const result = listDailyLogsSchema.parse({
      date_from: '2026-01-01',
      date_to: '2026-12-31',
    })
    expect(result.date_from).toBe('2026-01-01')
    expect(result.date_to).toBe('2026-12-31')
  })

  test('listDailyLogsSchema rejects invalid date format', () => {
    expect(() => listDailyLogsSchema.parse({ date_from: '20260101' })).toThrow()
    expect(() => listDailyLogsSchema.parse({ date_to: 'not-a-date' })).toThrow()
  })

  // ── createDailyLogSchema ───────────────────────────────────────────────

  test('createDailyLogSchema accepts valid daily log', () => {
    const result = createDailyLogSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      log_date: '2026-02-20',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.log_date).toBe('2026-02-20')
  })

  test('createDailyLogSchema requires job_id and log_date', () => {
    expect(() => createDailyLogSchema.parse({})).toThrow()
    expect(() => createDailyLogSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
    expect(() => createDailyLogSchema.parse({ log_date: '2026-02-20' })).toThrow()
  })

  test('createDailyLogSchema accepts optional weather fields', () => {
    const result = createDailyLogSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      log_date: '2026-02-20',
      weather_summary: 'Sunny and warm',
      high_temp: 85,
      low_temp: 60,
      conditions: 'Clear',
      notes: 'Good progress today',
    })
    expect(result.weather_summary).toBe('Sunny and warm')
    expect(result.high_temp).toBe(85)
    expect(result.low_temp).toBe(60)
    expect(result.conditions).toBe('Clear')
    expect(result.notes).toBe('Good progress today')
  })

  test('createDailyLogSchema rejects invalid date format', () => {
    expect(() => createDailyLogSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      log_date: '02-20-2026',
    })).toThrow()
  })

  test('createDailyLogSchema rejects invalid UUID for job_id', () => {
    expect(() => createDailyLogSchema.parse({
      job_id: 'not-a-uuid',
      log_date: '2026-02-20',
    })).toThrow()
  })

  // ── updateDailyLogSchema ───────────────────────────────────────────────

  test('updateDailyLogSchema accepts partial updates', () => {
    const result = updateDailyLogSchema.parse({ notes: 'Updated notes' })
    expect(result.notes).toBe('Updated notes')
    expect(result.weather_summary).toBeUndefined()
  })

  test('updateDailyLogSchema accepts nullable fields', () => {
    const result = updateDailyLogSchema.parse({ high_temp: null, notes: null })
    expect(result.high_temp).toBeNull()
    expect(result.notes).toBeNull()
  })

  // ── submitDailyLogSchema ───────────────────────────────────────────────

  test('submitDailyLogSchema accepts empty body', () => {
    const result = submitDailyLogSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('submitDailyLogSchema accepts optional notes', () => {
    const result = submitDailyLogSchema.parse({ notes: 'Ready for review' })
    expect(result.notes).toBe('Ready for review')
  })

  // ── createLogEntrySchema ───────────────────────────────────────────────

  test('createLogEntrySchema accepts valid entry', () => {
    const result = createLogEntrySchema.parse({
      entry_type: 'work_performed',
      description: 'Completed framing on second floor',
    })
    expect(result.entry_type).toBe('work_performed')
    expect(result.description).toBe('Completed framing on second floor')
  })

  test('createLogEntrySchema requires entry_type and description', () => {
    expect(() => createLogEntrySchema.parse({})).toThrow()
    expect(() => createLogEntrySchema.parse({ entry_type: 'note' })).toThrow()
    expect(() => createLogEntrySchema.parse({ description: 'some text' })).toThrow()
  })

  test('createLogEntrySchema rejects empty description', () => {
    expect(() => createLogEntrySchema.parse({
      entry_type: 'note',
      description: '',
    })).toThrow()
  })

  test('createLogEntrySchema rejects invalid entry type', () => {
    expect(() => createLogEntrySchema.parse({
      entry_type: 'unknown',
      description: 'Some work',
    })).toThrow()
  })

  // ── updateLogEntrySchema ───────────────────────────────────────────────

  test('updateLogEntrySchema accepts partial updates', () => {
    const result = updateLogEntrySchema.parse({ description: 'Updated description' })
    expect(result.description).toBe('Updated description')
  })

  // ── createLogLaborSchema ───────────────────────────────────────────────

  test('createLogLaborSchema accepts valid labor record', () => {
    const result = createLogLaborSchema.parse({
      worker_name: 'John Smith',
      trade: 'Carpenter',
      hours_worked: 8,
      overtime_hours: 1.5,
      headcount: 3,
    })
    expect(result.worker_name).toBe('John Smith')
    expect(result.trade).toBe('Carpenter')
    expect(result.hours_worked).toBe(8)
    expect(result.overtime_hours).toBe(1.5)
    expect(result.headcount).toBe(3)
  })

  test('createLogLaborSchema requires worker_name and hours_worked', () => {
    expect(() => createLogLaborSchema.parse({})).toThrow()
    expect(() => createLogLaborSchema.parse({ worker_name: 'John' })).toThrow()
  })

  test('createLogLaborSchema rejects negative hours', () => {
    expect(() => createLogLaborSchema.parse({
      worker_name: 'John Smith',
      hours_worked: -1,
    })).toThrow()
  })

  test('createLogLaborSchema rejects hours > 24', () => {
    expect(() => createLogLaborSchema.parse({
      worker_name: 'John Smith',
      hours_worked: 25,
    })).toThrow()
  })

  // ── createLogPhotoSchema ───────────────────────────────────────────────

  test('createLogPhotoSchema accepts valid photo record', () => {
    const result = createLogPhotoSchema.parse({
      storage_path: '/company-1/job-1/photos/site-photo.jpg',
      caption: 'Foundation pour in progress',
      location_description: 'North wing',
    })
    expect(result.storage_path).toBe('/company-1/job-1/photos/site-photo.jpg')
    expect(result.caption).toBe('Foundation pour in progress')
  })

  test('createLogPhotoSchema requires storage_path', () => {
    expect(() => createLogPhotoSchema.parse({})).toThrow()
    expect(() => createLogPhotoSchema.parse({ caption: 'A photo' })).toThrow()
  })

  test('createLogPhotoSchema rejects empty storage_path', () => {
    expect(() => createLogPhotoSchema.parse({ storage_path: '' })).toThrow()
  })
})
