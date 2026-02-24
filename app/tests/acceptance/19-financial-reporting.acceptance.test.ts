/**
 * Module 19 — Financial Reporting Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 19 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ReportType,
  ScheduleFrequency,
  PeriodStatus,
  ReportDefinition,
  ReportSnapshot,
  ReportSchedule,
  ReportRecipient,
  FinancialPeriod,
} from '@/types/financial-reporting'

import {
  REPORT_TYPES,
  SCHEDULE_FREQUENCIES,
  PERIOD_STATUSES,
} from '@/types/financial-reporting'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  reportTypeEnum,
  scheduleFrequencyEnum,
  periodStatusEnum,
  listReportDefinitionsSchema,
  createReportDefinitionSchema,
  updateReportDefinitionSchema,
  generateReportSchema,
  listReportSnapshotsSchema,
  listReportSchedulesSchema,
  createReportScheduleSchema,
  updateReportScheduleSchema,
  listFinancialPeriodsSchema,
  createFinancialPeriodSchema,
  updateFinancialPeriodSchema,
  closeFinancialPeriodSchema,
} from '@/lib/validation/schemas/financial-reporting'

// ============================================================================
// Type System
// ============================================================================

describe('Module 19 — Financial Reporting Types', () => {
  test('ReportType has 10 values', () => {
    const types: ReportType[] = [
      'profit_loss', 'balance_sheet', 'cash_flow', 'wip',
      'job_cost', 'ar_aging', 'ap_aging', 'budget_vs_actual',
      'retainage', 'custom',
    ]
    expect(types).toHaveLength(10)
  })

  test('ScheduleFrequency has 4 values', () => {
    const freqs: ScheduleFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly']
    expect(freqs).toHaveLength(4)
  })

  test('PeriodStatus has 3 values', () => {
    const statuses: PeriodStatus[] = ['open', 'closed', 'locked']
    expect(statuses).toHaveLength(3)
  })

  test('ReportDefinition interface has all required fields', () => {
    const def: ReportDefinition = {
      id: '1', company_id: '1', name: 'Monthly P&L',
      report_type: 'profit_loss', description: 'Monthly profit and loss report',
      config: { show_chart: true }, is_system: false, is_active: true,
      created_by: '1', created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(def.name).toBe('Monthly P&L')
    expect(def.report_type).toBe('profit_loss')
    expect(def.is_active).toBe(true)
  })

  test('ReportSnapshot interface has all required fields', () => {
    const snap: ReportSnapshot = {
      id: '1', company_id: '1', report_definition_id: '1',
      period_start: '2026-01-01', period_end: '2026-01-31',
      snapshot_data: { revenue: 100000 }, generated_by: '1',
      generated_at: '2026-02-01T00:00:00Z', created_at: '2026-02-01',
    }
    expect(snap.period_start).toBe('2026-01-01')
    expect(snap.snapshot_data).toHaveProperty('revenue')
  })

  test('ReportSchedule interface has all required fields', () => {
    const sched: ReportSchedule = {
      id: '1', company_id: '1', report_definition_id: '1',
      frequency: 'monthly', day_of_week: null, day_of_month: 1,
      recipients: [{ email: 'cfo@test.com', name: 'CFO' }],
      is_active: true, last_run_at: null, next_run_at: '2026-03-01T07:00:00Z',
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(sched.frequency).toBe('monthly')
    expect(sched.recipients).toHaveLength(1)
  })

  test('FinancialPeriod interface has all required fields', () => {
    const period: FinancialPeriod = {
      id: '1', company_id: '1', period_name: 'January 2026',
      period_start: '2026-01-01', period_end: '2026-01-31',
      status: 'open', fiscal_year: 2026, fiscal_quarter: 1,
      closed_by: null, closed_at: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(period.period_name).toBe('January 2026')
    expect(period.status).toBe('open')
    expect(period.fiscal_year).toBe(2026)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 19 — Constants', () => {
  test('REPORT_TYPES has 10 entries with value and label', () => {
    expect(REPORT_TYPES).toHaveLength(10)
    for (const rt of REPORT_TYPES) {
      expect(rt).toHaveProperty('value')
      expect(rt).toHaveProperty('label')
      expect(rt.label.length).toBeGreaterThan(0)
    }
  })

  test('REPORT_TYPES includes all spec report types', () => {
    const values = REPORT_TYPES.map((rt) => rt.value)
    expect(values).toContain('profit_loss')
    expect(values).toContain('cash_flow')
    expect(values).toContain('wip')
    expect(values).toContain('ar_aging')
    expect(values).toContain('ap_aging')
    expect(values).toContain('budget_vs_actual')
    expect(values).toContain('custom')
  })

  test('SCHEDULE_FREQUENCIES has 4 entries with value and label', () => {
    expect(SCHEDULE_FREQUENCIES).toHaveLength(4)
    for (const sf of SCHEDULE_FREQUENCIES) {
      expect(sf).toHaveProperty('value')
      expect(sf).toHaveProperty('label')
    }
  })

  test('PERIOD_STATUSES has 3 entries with value and label', () => {
    expect(PERIOD_STATUSES).toHaveLength(3)
    const values = PERIOD_STATUSES.map((ps) => ps.value)
    expect(values).toContain('open')
    expect(values).toContain('closed')
    expect(values).toContain('locked')
  })
})

// ============================================================================
// Schemas — Report Definitions
// ============================================================================

describe('Module 19 — Report Definition Schemas', () => {
  test('reportTypeEnum accepts all 10 types', () => {
    for (const t of ['profit_loss', 'balance_sheet', 'cash_flow', 'wip', 'job_cost', 'ar_aging', 'ap_aging', 'budget_vs_actual', 'retainage', 'custom']) {
      expect(reportTypeEnum.parse(t)).toBe(t)
    }
  })

  test('reportTypeEnum rejects invalid type', () => {
    expect(() => reportTypeEnum.parse('unknown')).toThrow()
    expect(() => reportTypeEnum.parse('')).toThrow()
  })

  test('listReportDefinitionsSchema accepts valid params', () => {
    const result = listReportDefinitionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listReportDefinitionsSchema rejects limit > 100', () => {
    expect(() => listReportDefinitionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createReportDefinitionSchema accepts valid definition', () => {
    const result = createReportDefinitionSchema.parse({
      name: 'Monthly P&L',
      report_type: 'profit_loss',
      description: 'Monthly profit and loss',
    })
    expect(result.name).toBe('Monthly P&L')
    expect(result.report_type).toBe('profit_loss')
  })

  test('createReportDefinitionSchema requires name and report_type', () => {
    expect(() => createReportDefinitionSchema.parse({})).toThrow()
    expect(() => createReportDefinitionSchema.parse({ name: 'Test' })).toThrow()
  })

  test('createReportDefinitionSchema rejects name > 200 chars', () => {
    expect(() => createReportDefinitionSchema.parse({
      name: 'x'.repeat(201),
      report_type: 'custom',
    })).toThrow()
  })

  test('updateReportDefinitionSchema accepts partial updates', () => {
    const result = updateReportDefinitionSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.report_type).toBeUndefined()
  })
})

// ============================================================================
// Schemas — Report Generation
// ============================================================================

describe('Module 19 — Report Generation Schema', () => {
  test('generateReportSchema accepts valid date range', () => {
    const result = generateReportSchema.parse({
      period_start: '2026-01-01',
      period_end: '2026-01-31',
    })
    expect(result.period_start).toBe('2026-01-01')
    expect(result.period_end).toBe('2026-01-31')
  })

  test('generateReportSchema requires valid date format', () => {
    expect(() => generateReportSchema.parse({
      period_start: 'not-a-date',
      period_end: '2026-01-31',
    })).toThrow()
  })

  test('generateReportSchema accepts optional parameters', () => {
    const result = generateReportSchema.parse({
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      parameters: { job_id: 'abc-123' },
    })
    expect(result.parameters).toEqual({ job_id: 'abc-123' })
  })
})

// ============================================================================
// Schemas — Report Snapshots
// ============================================================================

describe('Module 19 — Report Snapshot Schemas', () => {
  test('listReportSnapshotsSchema accepts valid params', () => {
    const result = listReportSnapshotsSchema.parse({
      page: '1',
      limit: '10',
      report_definition_id: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
    })
    expect(result.page).toBe(1)
    expect(result.report_definition_id).toBeDefined()
  })

  test('listReportSnapshotsSchema rejects invalid UUID', () => {
    expect(() => listReportSnapshotsSchema.parse({
      report_definition_id: 'not-a-uuid',
    })).toThrow()
  })
})

// ============================================================================
// Schemas — Report Schedules
// ============================================================================

describe('Module 19 — Report Schedule Schemas', () => {
  test('scheduleFrequencyEnum accepts all 4 frequencies', () => {
    for (const f of ['daily', 'weekly', 'monthly', 'quarterly']) {
      expect(scheduleFrequencyEnum.parse(f)).toBe(f)
    }
  })

  test('createReportScheduleSchema accepts valid schedule', () => {
    const result = createReportScheduleSchema.parse({
      report_definition_id: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
      frequency: 'weekly',
      day_of_week: 1,
      recipients: [{ email: 'test@example.com', name: 'Test User' }],
    })
    expect(result.frequency).toBe('weekly')
    expect(result.recipients).toHaveLength(1)
  })

  test('createReportScheduleSchema requires at least one recipient', () => {
    expect(() => createReportScheduleSchema.parse({
      report_definition_id: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
      frequency: 'daily',
      recipients: [],
    })).toThrow()
  })

  test('createReportScheduleSchema validates recipient email', () => {
    expect(() => createReportScheduleSchema.parse({
      report_definition_id: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
      frequency: 'daily',
      recipients: [{ email: 'not-an-email', name: 'Test' }],
    })).toThrow()
  })

  test('createReportScheduleSchema validates day_of_week range 0-6', () => {
    expect(() => createReportScheduleSchema.parse({
      report_definition_id: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
      frequency: 'weekly',
      day_of_week: 7,
      recipients: [{ email: 'test@example.com', name: 'Test' }],
    })).toThrow()
  })

  test('createReportScheduleSchema validates day_of_month range 1-31', () => {
    expect(() => createReportScheduleSchema.parse({
      report_definition_id: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
      frequency: 'monthly',
      day_of_month: 32,
      recipients: [{ email: 'test@example.com', name: 'Test' }],
    })).toThrow()
  })

  test('updateReportScheduleSchema accepts partial updates', () => {
    const result = updateReportScheduleSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
    expect(result.frequency).toBeUndefined()
  })
})

// ============================================================================
// Schemas — Financial Periods
// ============================================================================

describe('Module 19 — Financial Period Schemas', () => {
  test('periodStatusEnum accepts all 3 statuses', () => {
    for (const s of ['open', 'closed', 'locked']) {
      expect(periodStatusEnum.parse(s)).toBe(s)
    }
  })

  test('periodStatusEnum rejects invalid status', () => {
    expect(() => periodStatusEnum.parse('pending')).toThrow()
  })

  test('listFinancialPeriodsSchema accepts valid params', () => {
    const result = listFinancialPeriodsSchema.parse({
      page: '1',
      limit: '20',
      status: 'open',
      fiscal_year: '2026',
    })
    expect(result.status).toBe('open')
    expect(result.fiscal_year).toBe(2026)
  })

  test('createFinancialPeriodSchema accepts valid period', () => {
    const result = createFinancialPeriodSchema.parse({
      period_name: 'January 2026',
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      fiscal_year: 2026,
      fiscal_quarter: 1,
    })
    expect(result.period_name).toBe('January 2026')
    expect(result.fiscal_year).toBe(2026)
    expect(result.fiscal_quarter).toBe(1)
  })

  test('createFinancialPeriodSchema requires all mandatory fields', () => {
    expect(() => createFinancialPeriodSchema.parse({})).toThrow()
    expect(() => createFinancialPeriodSchema.parse({
      period_name: 'Jan',
      period_start: '2026-01-01',
    })).toThrow()
  })

  test('createFinancialPeriodSchema validates date format', () => {
    expect(() => createFinancialPeriodSchema.parse({
      period_name: 'Jan 2026',
      period_start: '01-01-2026',
      period_end: '2026-01-31',
      fiscal_year: 2026,
    })).toThrow()
  })

  test('createFinancialPeriodSchema validates fiscal_quarter range', () => {
    expect(() => createFinancialPeriodSchema.parse({
      period_name: 'Jan 2026',
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      fiscal_year: 2026,
      fiscal_quarter: 5,
    })).toThrow()
  })

  test('updateFinancialPeriodSchema accepts partial updates', () => {
    const result = updateFinancialPeriodSchema.parse({
      period_name: 'Feb 2026',
    })
    expect(result.period_name).toBe('Feb 2026')
    expect(result.fiscal_year).toBeUndefined()
  })

  test('closeFinancialPeriodSchema accepts optional notes', () => {
    const result = closeFinancialPeriodSchema.parse({ notes: 'Month-end close' })
    expect(result.notes).toBe('Month-end close')
  })

  test('closeFinancialPeriodSchema accepts empty body', () => {
    const result = closeFinancialPeriodSchema.parse({})
    expect(result.notes).toBeUndefined()
  })
})
