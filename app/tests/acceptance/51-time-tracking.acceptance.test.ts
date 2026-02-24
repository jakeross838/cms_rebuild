/**
 * Module 51 — Time Tracking & Labor Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 51 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  TimeEntryStatus,
  RateType,
  PayrollPeriodStatus,
  ExportFormat,
  EntryMethod,
  GpsData,
  TimeEntry,
  TimeEntryAllocation,
  LaborRate,
  PayrollPeriod,
  PayrollExport,
} from '@/types/time-tracking'

import {
  TIME_ENTRY_STATUSES,
  RATE_TYPES,
  PAYROLL_STATUSES,
  EXPORT_FORMATS,
  ENTRY_METHODS,
  DEFAULT_DAILY_OT_THRESHOLD,
  DEFAULT_WEEKLY_OT_THRESHOLD,
  DEFAULT_DAILY_DT_THRESHOLD,
} from '@/types/time-tracking'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  timeEntryStatusEnum,
  rateTypeEnum,
  payrollPeriodStatusEnum,
  exportFormatEnum,
  entryMethodEnum,
  gpsDataSchema,
  listTimeEntriesSchema,
  createTimeEntrySchema,
  updateTimeEntrySchema,
  clockInSchema,
  clockOutSchema,
  approveTimeEntrySchema,
  rejectTimeEntrySchema,
  listLaborRatesSchema,
  createLaborRateSchema,
  updateLaborRateSchema,
  listPayrollPeriodsSchema,
  createPayrollPeriodSchema,
  updatePayrollPeriodSchema,
  listPayrollExportsSchema,
  createPayrollExportSchema,
  createAllocationSchema,
  createAllocationsSchema,
} from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// Type System
// ============================================================================

describe('Module 51 — Time Tracking Types', () => {
  test('TimeEntryStatus has 4 values', () => {
    const statuses: TimeEntryStatus[] = ['pending', 'approved', 'rejected', 'exported']
    expect(statuses).toHaveLength(4)
  })

  test('RateType has 3 values', () => {
    const types: RateType[] = ['regular', 'overtime', 'double_time']
    expect(types).toHaveLength(3)
  })

  test('PayrollPeriodStatus has 3 values', () => {
    const statuses: PayrollPeriodStatus[] = ['open', 'closed', 'exported']
    expect(statuses).toHaveLength(3)
  })

  test('ExportFormat has 4 values', () => {
    const formats: ExportFormat[] = ['csv', 'quickbooks', 'adp', 'custom']
    expect(formats).toHaveLength(4)
  })

  test('EntryMethod has 4 values', () => {
    const methods: EntryMethod[] = ['mobile', 'kiosk', 'manual', 'superintendent']
    expect(methods).toHaveLength(4)
  })

  test('GpsData interface has lat, lng, accuracy', () => {
    const gps: GpsData = { lat: 34.0522, lng: -118.2437, accuracy: 10 }
    expect(gps.lat).toBe(34.0522)
    expect(gps.lng).toBe(-118.2437)
    expect(gps.accuracy).toBe(10)
  })

  test('TimeEntry interface has all required fields', () => {
    const entry: TimeEntry = {
      id: '1', company_id: '1', user_id: '1', job_id: '1',
      cost_code_id: null, entry_date: '2026-02-23',
      clock_in: '2026-02-23T07:00:00Z', clock_out: '2026-02-23T15:30:00Z',
      regular_hours: 8, overtime_hours: 0, double_time_hours: 0,
      break_minutes: 30, status: 'pending', notes: null,
      gps_clock_in: { lat: 34.0, lng: -118.0, accuracy: 5 },
      gps_clock_out: { lat: 34.0, lng: -118.0, accuracy: 8 },
      entry_method: 'mobile',
      approved_by: null, approved_at: null,
      rejected_by: null, rejected_at: null, rejection_reason: null,
      created_at: '2026-02-23', updated_at: '2026-02-23', deleted_at: null,
    }
    expect(entry.status).toBe('pending')
    expect(entry.regular_hours).toBe(8)
    expect(entry.gps_clock_in?.lat).toBe(34.0)
  })

  test('TimeEntryAllocation interface has all required fields', () => {
    const allocation: TimeEntryAllocation = {
      id: '1', time_entry_id: '1', company_id: '1',
      job_id: '1', cost_code_id: null, hours: 4,
      notes: null, created_at: '2026-02-23',
    }
    expect(allocation.hours).toBe(4)
  })

  test('LaborRate interface has all required fields', () => {
    const rate: LaborRate = {
      id: '1', company_id: '1', user_id: null,
      trade: 'Electrician', rate_type: 'regular',
      hourly_rate: 45.00, effective_date: '2026-01-01',
      end_date: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(rate.trade).toBe('Electrician')
    expect(rate.hourly_rate).toBe(45.00)
  })

  test('PayrollPeriod interface has all required fields', () => {
    const period: PayrollPeriod = {
      id: '1', company_id: '1',
      period_start: '2026-02-17', period_end: '2026-02-23',
      status: 'open', exported_at: null, exported_by: null,
      created_at: '2026-02-17', updated_at: '2026-02-17',
    }
    expect(period.status).toBe('open')
  })

  test('PayrollExport interface has all required fields', () => {
    const exp: PayrollExport = {
      id: '1', company_id: '1', payroll_period_id: '1',
      export_format: 'csv', file_path: null,
      total_hours: 160, total_amount: 7200,
      employee_count: 5, exported_by: '1',
      created_at: '2026-02-23',
    }
    expect(exp.export_format).toBe('csv')
    expect(exp.total_hours).toBe(160)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 51 — Constants', () => {
  test('TIME_ENTRY_STATUSES has 4 entries with value and label', () => {
    expect(TIME_ENTRY_STATUSES).toHaveLength(4)
    for (const s of TIME_ENTRY_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('TIME_ENTRY_STATUSES includes all expected values', () => {
    const values = TIME_ENTRY_STATUSES.map(s => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('approved')
    expect(values).toContain('rejected')
    expect(values).toContain('exported')
  })

  test('RATE_TYPES has 3 entries with value and label', () => {
    expect(RATE_TYPES).toHaveLength(3)
    const values = RATE_TYPES.map(r => r.value)
    expect(values).toContain('regular')
    expect(values).toContain('overtime')
    expect(values).toContain('double_time')
  })

  test('PAYROLL_STATUSES has 3 entries', () => {
    expect(PAYROLL_STATUSES).toHaveLength(3)
    const values = PAYROLL_STATUSES.map(s => s.value)
    expect(values).toContain('open')
    expect(values).toContain('closed')
    expect(values).toContain('exported')
  })

  test('EXPORT_FORMATS has 4 entries', () => {
    expect(EXPORT_FORMATS).toHaveLength(4)
    const values = EXPORT_FORMATS.map(f => f.value)
    expect(values).toContain('csv')
    expect(values).toContain('quickbooks')
    expect(values).toContain('adp')
    expect(values).toContain('custom')
  })

  test('ENTRY_METHODS has 4 entries', () => {
    expect(ENTRY_METHODS).toHaveLength(4)
    const values = ENTRY_METHODS.map(m => m.value)
    expect(values).toContain('mobile')
    expect(values).toContain('kiosk')
    expect(values).toContain('manual')
    expect(values).toContain('superintendent')
  })

  test('DEFAULT_DAILY_OT_THRESHOLD is 8 hours', () => {
    expect(DEFAULT_DAILY_OT_THRESHOLD).toBe(8)
  })

  test('DEFAULT_WEEKLY_OT_THRESHOLD is 40 hours', () => {
    expect(DEFAULT_WEEKLY_OT_THRESHOLD).toBe(40)
  })

  test('DEFAULT_DAILY_DT_THRESHOLD is 12 hours', () => {
    expect(DEFAULT_DAILY_DT_THRESHOLD).toBe(12)
  })
})

// ============================================================================
// Schemas
// ============================================================================

describe('Module 51 — Validation Schemas', () => {
  // ── Enum Schemas ──────────────────────────────────────────────────────────

  test('timeEntryStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'approved', 'rejected', 'exported']) {
      expect(timeEntryStatusEnum.parse(s)).toBe(s)
    }
  })

  test('timeEntryStatusEnum rejects invalid status', () => {
    expect(() => timeEntryStatusEnum.parse('unknown')).toThrow()
    expect(() => timeEntryStatusEnum.parse('draft')).toThrow()
  })

  test('rateTypeEnum accepts all 3 types', () => {
    for (const t of ['regular', 'overtime', 'double_time']) {
      expect(rateTypeEnum.parse(t)).toBe(t)
    }
  })

  test('rateTypeEnum rejects invalid type', () => {
    expect(() => rateTypeEnum.parse('triple_time')).toThrow()
  })

  test('payrollPeriodStatusEnum accepts all 3 statuses', () => {
    for (const s of ['open', 'closed', 'exported']) {
      expect(payrollPeriodStatusEnum.parse(s)).toBe(s)
    }
  })

  test('exportFormatEnum accepts all 4 formats', () => {
    for (const f of ['csv', 'quickbooks', 'adp', 'custom']) {
      expect(exportFormatEnum.parse(f)).toBe(f)
    }
  })

  test('entryMethodEnum accepts all 4 methods', () => {
    for (const m of ['mobile', 'kiosk', 'manual', 'superintendent']) {
      expect(entryMethodEnum.parse(m)).toBe(m)
    }
  })

  // ── GPS Data Schema ───────────────────────────────────────────────────────

  test('gpsDataSchema accepts valid GPS data', () => {
    const result = gpsDataSchema.parse({ lat: 34.0522, lng: -118.2437, accuracy: 10 })
    expect(result.lat).toBe(34.0522)
    expect(result.lng).toBe(-118.2437)
    expect(result.accuracy).toBe(10)
  })

  test('gpsDataSchema rejects invalid latitude range', () => {
    expect(() => gpsDataSchema.parse({ lat: 91, lng: 0, accuracy: 5 })).toThrow()
    expect(() => gpsDataSchema.parse({ lat: -91, lng: 0, accuracy: 5 })).toThrow()
  })

  test('gpsDataSchema rejects invalid longitude range', () => {
    expect(() => gpsDataSchema.parse({ lat: 0, lng: 181, accuracy: 5 })).toThrow()
    expect(() => gpsDataSchema.parse({ lat: 0, lng: -181, accuracy: 5 })).toThrow()
  })

  test('gpsDataSchema rejects negative accuracy', () => {
    expect(() => gpsDataSchema.parse({ lat: 0, lng: 0, accuracy: -1 })).toThrow()
  })

  // ── List Time Entries Schema ──────────────────────────────────────────────

  test('listTimeEntriesSchema accepts valid params', () => {
    const result = listTimeEntriesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listTimeEntriesSchema rejects limit > 100', () => {
    expect(() => listTimeEntriesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listTimeEntriesSchema accepts date range filters', () => {
    const result = listTimeEntriesSchema.parse({
      entry_date_from: '2026-02-01',
      entry_date_to: '2026-02-28',
    })
    expect(result.entry_date_from).toBe('2026-02-01')
    expect(result.entry_date_to).toBe('2026-02-28')
  })

  test('listTimeEntriesSchema rejects invalid date format', () => {
    expect(() => listTimeEntriesSchema.parse({ entry_date_from: '2026/02/01' })).toThrow()
    expect(() => listTimeEntriesSchema.parse({ entry_date_to: 'not-a-date' })).toThrow()
  })

  // ── Create Time Entry Schema ──────────────────────────────────────────────

  test('createTimeEntrySchema accepts valid entry', () => {
    const result = createTimeEntrySchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      entry_date: '2026-02-23',
      regular_hours: 8,
    })
    expect(result.user_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.regular_hours).toBe(8)
  })

  test('createTimeEntrySchema requires user_id, job_id, entry_date', () => {
    expect(() => createTimeEntrySchema.parse({})).toThrow()
    expect(() => createTimeEntrySchema.parse({ user_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createTimeEntrySchema rejects hours > 24', () => {
    expect(() => createTimeEntrySchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      entry_date: '2026-02-23',
      regular_hours: 25,
    })).toThrow()
  })

  test('createTimeEntrySchema rejects break_minutes > 480', () => {
    expect(() => createTimeEntrySchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      entry_date: '2026-02-23',
      break_minutes: 500,
    })).toThrow()
  })

  test('createTimeEntrySchema defaults entry_method to manual', () => {
    const result = createTimeEntrySchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      entry_date: '2026-02-23',
    })
    expect(result.entry_method).toBe('manual')
  })

  // ── Update Time Entry Schema ──────────────────────────────────────────────

  test('updateTimeEntrySchema accepts partial updates', () => {
    const result = updateTimeEntrySchema.parse({ regular_hours: 7.5 })
    expect(result.regular_hours).toBe(7.5)
    expect(result.job_id).toBeUndefined()
  })

  // ── Clock In Schema ───────────────────────────────────────────────────────

  test('clockInSchema requires job_id', () => {
    expect(() => clockInSchema.parse({})).toThrow()
    const result = clockInSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440001' })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('clockInSchema accepts optional GPS data', () => {
    const result = clockInSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      gps: { lat: 34.0522, lng: -118.2437, accuracy: 10 },
    })
    expect(result.gps?.lat).toBe(34.0522)
  })

  // ── Clock Out Schema ──────────────────────────────────────────────────────

  test('clockOutSchema requires time_entry_id', () => {
    expect(() => clockOutSchema.parse({})).toThrow()
    const result = clockOutSchema.parse({ time_entry_id: '550e8400-e29b-41d4-a716-446655440000' })
    expect(result.time_entry_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  // ── Approve/Reject Schemas ────────────────────────────────────────────────

  test('approveTimeEntrySchema accepts empty body', () => {
    const result = approveTimeEntrySchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('rejectTimeEntrySchema requires rejection_reason', () => {
    expect(() => rejectTimeEntrySchema.parse({})).toThrow()
    expect(() => rejectTimeEntrySchema.parse({ rejection_reason: '' })).toThrow()
    const result = rejectTimeEntrySchema.parse({ rejection_reason: 'Hours seem incorrect' })
    expect(result.rejection_reason).toBe('Hours seem incorrect')
  })

  // ── Labor Rates Schemas ───────────────────────────────────────────────────

  test('createLaborRateSchema accepts valid rate', () => {
    const result = createLaborRateSchema.parse({
      rate_type: 'regular',
      hourly_rate: 45.00,
      effective_date: '2026-01-01',
    })
    expect(result.rate_type).toBe('regular')
    expect(result.hourly_rate).toBe(45)
  })

  test('createLaborRateSchema rejects hourly_rate > 9999.99', () => {
    expect(() => createLaborRateSchema.parse({
      rate_type: 'regular',
      hourly_rate: 10000,
      effective_date: '2026-01-01',
    })).toThrow()
  })

  test('updateLaborRateSchema accepts partial updates', () => {
    const result = updateLaborRateSchema.parse({ hourly_rate: 50.00 })
    expect(result.hourly_rate).toBe(50)
    expect(result.trade).toBeUndefined()
  })

  // ── Payroll Periods Schemas ───────────────────────────────────────────────

  test('createPayrollPeriodSchema requires period_start and period_end', () => {
    expect(() => createPayrollPeriodSchema.parse({})).toThrow()
    const result = createPayrollPeriodSchema.parse({
      period_start: '2026-02-17',
      period_end: '2026-02-23',
    })
    expect(result.period_start).toBe('2026-02-17')
    expect(result.period_end).toBe('2026-02-23')
  })

  test('updatePayrollPeriodSchema accepts status change', () => {
    const result = updatePayrollPeriodSchema.parse({ status: 'closed' })
    expect(result.status).toBe('closed')
  })

  // ── Payroll Exports Schema ────────────────────────────────────────────────

  test('createPayrollExportSchema requires payroll_period_id and export_format', () => {
    expect(() => createPayrollExportSchema.parse({})).toThrow()
    const result = createPayrollExportSchema.parse({
      payroll_period_id: '550e8400-e29b-41d4-a716-446655440000',
      export_format: 'csv',
    })
    expect(result.export_format).toBe('csv')
  })

  // ── Allocation Schemas ────────────────────────────────────────────────────

  test('createAllocationSchema accepts valid allocation', () => {
    const result = createAllocationSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      hours: 4,
    })
    expect(result.hours).toBe(4)
  })

  test('createAllocationsSchema requires at least 1 allocation', () => {
    expect(() => createAllocationsSchema.parse({ allocations: [] })).toThrow()
  })

  test('createAllocationsSchema accepts up to 20 allocations', () => {
    const allocations = Array.from({ length: 20 }, (_, i) => ({
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      hours: 0.5,
    }))
    const result = createAllocationsSchema.parse({ allocations })
    expect(result.allocations).toHaveLength(20)
  })

  test('createAllocationsSchema rejects more than 20 allocations', () => {
    const allocations = Array.from({ length: 21 }, () => ({
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      hours: 0.5,
    }))
    expect(() => createAllocationsSchema.parse({ allocations })).toThrow()
  })
})
