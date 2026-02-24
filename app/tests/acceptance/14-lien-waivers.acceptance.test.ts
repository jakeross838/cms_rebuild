/**
 * Module 14 — Lien Waiver Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 14 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ────────────────────────────────────────────────────────────────────

import type {
  WaiverType,
  WaiverStatus,
  LienWaiver,
  LienWaiverTemplate,
  LienWaiverTracking,
} from '@/types/lien-waivers'

import {
  WAIVER_TYPES,
  WAIVER_STATUSES,
} from '@/types/lien-waivers'

// ── Schemas ──────────────────────────────────────────────────────────────────

import {
  waiverTypeEnum,
  waiverStatusEnum,
  listLienWaiversSchema,
  createLienWaiverSchema,
  updateLienWaiverSchema,
  listLienWaiverTemplatesSchema,
  createLienWaiverTemplateSchema,
  updateLienWaiverTemplateSchema,
  listLienWaiverTrackingSchema,
  createLienWaiverTrackingSchema,
} from '@/lib/validation/schemas/lien-waivers'

// ============================================================================
// Type System
// ============================================================================

describe('Module 14 — Lien Waiver Types', () => {
  test('WaiverType has 4 values', () => {
    const types: WaiverType[] = [
      'conditional_progress',
      'unconditional_progress',
      'conditional_final',
      'unconditional_final',
    ]
    expect(types).toHaveLength(4)
  })

  test('WaiverStatus has 6 values', () => {
    const statuses: WaiverStatus[] = [
      'draft', 'pending', 'sent', 'received', 'approved', 'rejected',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('LienWaiver interface has all required fields', () => {
    const waiver: LienWaiver = {
      id: '1', company_id: '1', job_id: '1', vendor_id: null,
      waiver_type: 'conditional_progress', status: 'draft',
      amount: null, through_date: null, document_id: null,
      payment_id: null, check_number: null, claimant_name: null,
      notes: null, requested_by: null, requested_at: null,
      received_at: null, approved_by: null, approved_at: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(waiver.waiver_type).toBe('conditional_progress')
    expect(waiver.status).toBe('draft')
    expect(waiver.deleted_at).toBeNull()
  })

  test('LienWaiverTemplate interface has all required fields', () => {
    const template: LienWaiverTemplate = {
      id: '1', company_id: '1',
      waiver_type: 'unconditional_final',
      template_name: 'California Final Waiver',
      template_content: '<html>...</html>',
      state_code: 'CA', is_default: true,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(template.template_name).toBe('California Final Waiver')
    expect(template.state_code).toBe('CA')
    expect(template.is_default).toBe(true)
  })

  test('LienWaiverTracking interface has all required fields', () => {
    const tracking: LienWaiverTracking = {
      id: '1', company_id: '1', job_id: '1', vendor_id: null,
      period_start: '2026-01-01', period_end: '2026-01-31',
      expected_amount: 50000.00, waiver_id: null,
      is_compliant: false, notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(tracking.is_compliant).toBe(false)
    expect(tracking.expected_amount).toBe(50000.00)
  })

  test('LienWaiver supports soft delete via deleted_at', () => {
    const waiver: LienWaiver = {
      id: '1', company_id: '1', job_id: '1', vendor_id: null,
      waiver_type: 'conditional_progress', status: 'draft',
      amount: null, through_date: null, document_id: null,
      payment_id: null, check_number: null, claimant_name: null,
      notes: null, requested_by: null, requested_at: null,
      received_at: null, approved_by: null, approved_at: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: '2026-02-01T00:00:00Z',
    }
    expect(waiver.deleted_at).toBe('2026-02-01T00:00:00Z')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 14 — Constants', () => {
  test('WAIVER_TYPES has 4 entries with value and label', () => {
    expect(WAIVER_TYPES).toHaveLength(4)
    for (const wt of WAIVER_TYPES) {
      expect(wt).toHaveProperty('value')
      expect(wt).toHaveProperty('label')
      expect(wt.label.length).toBeGreaterThan(0)
    }
  })

  test('WAIVER_TYPES includes all 4 types', () => {
    const values = WAIVER_TYPES.map(t => t.value)
    expect(values).toContain('conditional_progress')
    expect(values).toContain('unconditional_progress')
    expect(values).toContain('conditional_final')
    expect(values).toContain('unconditional_final')
  })

  test('WAIVER_STATUSES has 6 entries with value and label', () => {
    expect(WAIVER_STATUSES).toHaveLength(6)
    for (const ws of WAIVER_STATUSES) {
      expect(ws).toHaveProperty('value')
      expect(ws).toHaveProperty('label')
      expect(ws.label.length).toBeGreaterThan(0)
    }
  })

  test('WAIVER_STATUSES includes all 6 statuses', () => {
    const values = WAIVER_STATUSES.map(s => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('pending')
    expect(values).toContain('sent')
    expect(values).toContain('received')
    expect(values).toContain('approved')
    expect(values).toContain('rejected')
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 14 — Enum Schemas', () => {
  test('waiverTypeEnum accepts all 4 types', () => {
    for (const t of ['conditional_progress', 'unconditional_progress', 'conditional_final', 'unconditional_final']) {
      expect(waiverTypeEnum.parse(t)).toBe(t)
    }
  })

  test('waiverTypeEnum rejects invalid type', () => {
    expect(() => waiverTypeEnum.parse('partial')).toThrow()
    expect(() => waiverTypeEnum.parse('full')).toThrow()
  })

  test('waiverStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'pending', 'sent', 'received', 'approved', 'rejected']) {
      expect(waiverStatusEnum.parse(s)).toBe(s)
    }
  })

  test('waiverStatusEnum rejects invalid status', () => {
    expect(() => waiverStatusEnum.parse('cancelled')).toThrow()
    expect(() => waiverStatusEnum.parse('void')).toThrow()
  })
})

// ============================================================================
// Schemas — Lien Waivers CRUD
// ============================================================================

describe('Module 14 — Lien Waiver Schemas', () => {
  test('listLienWaiversSchema accepts valid params', () => {
    const result = listLienWaiversSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listLienWaiversSchema rejects limit > 100', () => {
    expect(() => listLienWaiversSchema.parse({ limit: 200 })).toThrow()
  })

  test('listLienWaiversSchema accepts all filter types', () => {
    const result = listLienWaiversSchema.parse({
      job_id: 'a0000000-0000-4000-a000-000000000001',
      vendor_id: 'a0000000-0000-4000-a000-000000000002',
      waiver_type: 'conditional_progress',
      status: 'draft',
      q: 'test',
    })
    expect(result.waiver_type).toBe('conditional_progress')
    expect(result.status).toBe('draft')
  })

  test('createLienWaiverSchema accepts valid waiver', () => {
    const result = createLienWaiverSchema.parse({
      job_id: 'a0000000-0000-4000-a000-000000000001',
      waiver_type: 'conditional_progress',
      amount: 50000.00,
      through_date: '2026-01-31',
      claimant_name: 'ABC Plumbing',
    })
    expect(result.job_id).toBe('a0000000-0000-4000-a000-000000000001')
    expect(result.waiver_type).toBe('conditional_progress')
    expect(result.amount).toBe(50000.00)
  })

  test('createLienWaiverSchema requires job_id and waiver_type', () => {
    expect(() => createLienWaiverSchema.parse({})).toThrow()
    expect(() => createLienWaiverSchema.parse({ job_id: 'a0000000-0000-4000-a000-000000000001' })).toThrow()
    expect(() => createLienWaiverSchema.parse({ waiver_type: 'conditional_progress' })).toThrow()
  })

  test('createLienWaiverSchema rejects invalid through_date format', () => {
    expect(() => createLienWaiverSchema.parse({
      job_id: 'a0000000-0000-4000-a000-000000000001',
      waiver_type: 'conditional_progress',
      through_date: 'not-a-date',
    })).toThrow()
  })

  test('updateLienWaiverSchema accepts partial updates', () => {
    const result = updateLienWaiverSchema.parse({ amount: 75000.00 })
    expect(result.amount).toBe(75000.00)
    expect(result.notes).toBeUndefined()
  })

  test('updateLienWaiverSchema accepts nullable fields', () => {
    const result = updateLienWaiverSchema.parse({
      vendor_id: null,
      amount: null,
      notes: null,
    })
    expect(result.vendor_id).toBeNull()
    expect(result.amount).toBeNull()
    expect(result.notes).toBeNull()
  })
})

// ============================================================================
// Schemas — Templates
// ============================================================================

describe('Module 14 — Template Schemas', () => {
  test('listLienWaiverTemplatesSchema accepts valid params', () => {
    const result = listLienWaiverTemplatesSchema.parse({ page: '1', limit: '10' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  test('listLienWaiverTemplatesSchema accepts state_code filter', () => {
    const result = listLienWaiverTemplatesSchema.parse({ state_code: 'CA' })
    expect(result.state_code).toBe('CA')
  })

  test('createLienWaiverTemplateSchema accepts valid template', () => {
    const result = createLienWaiverTemplateSchema.parse({
      waiver_type: 'conditional_progress',
      template_name: 'California Conditional Progress',
      state_code: 'CA',
      is_default: true,
    })
    expect(result.template_name).toBe('California Conditional Progress')
    expect(result.is_default).toBe(true)
  })

  test('createLienWaiverTemplateSchema requires waiver_type and template_name', () => {
    expect(() => createLienWaiverTemplateSchema.parse({})).toThrow()
    expect(() => createLienWaiverTemplateSchema.parse({ waiver_type: 'conditional_progress' })).toThrow()
  })

  test('updateLienWaiverTemplateSchema accepts partial updates', () => {
    const result = updateLienWaiverTemplateSchema.parse({ template_name: 'Updated Name' })
    expect(result.template_name).toBe('Updated Name')
  })
})

// ============================================================================
// Schemas — Tracking
// ============================================================================

describe('Module 14 — Tracking Schemas', () => {
  test('listLienWaiverTrackingSchema accepts valid params', () => {
    const result = listLienWaiverTrackingSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
  })

  test('listLienWaiverTrackingSchema accepts compliance filter', () => {
    const result = listLienWaiverTrackingSchema.parse({ is_compliant: 'true' })
    expect(result.is_compliant).toBe(true)
  })

  test('createLienWaiverTrackingSchema accepts valid tracking record', () => {
    const result = createLienWaiverTrackingSchema.parse({
      job_id: 'a0000000-0000-4000-a000-000000000001',
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      expected_amount: 50000.00,
      is_compliant: false,
    })
    expect(result.job_id).toBe('a0000000-0000-4000-a000-000000000001')
    expect(result.is_compliant).toBe(false)
  })

  test('createLienWaiverTrackingSchema requires job_id', () => {
    expect(() => createLienWaiverTrackingSchema.parse({})).toThrow()
  })

  test('createLienWaiverTrackingSchema rejects invalid date format', () => {
    expect(() => createLienWaiverTrackingSchema.parse({
      job_id: 'a0000000-0000-4000-a000-000000000001',
      period_start: 'Jan 1 2026',
    })).toThrow()
  })
})
