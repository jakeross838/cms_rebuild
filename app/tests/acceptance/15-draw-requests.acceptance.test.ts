/**
 * Module 15 — Draw Requests Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 15 spec (AIA G702/G703 format).
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────────

import type {
  DrawRequestStatus,
  DrawHistoryAction,
  DrawRequest,
  DrawRequestLine,
  DrawRequestHistory,
} from '@/types/draw-requests'

import {
  DRAW_STATUSES,
  DRAW_HISTORY_ACTIONS,
} from '@/types/draw-requests'

// ── Schemas ───────────────────────────────────────────────────────────────────

import {
  drawRequestStatusEnum,
  drawHistoryActionEnum,
  listDrawRequestsSchema,
  createDrawRequestSchema,
  updateDrawRequestSchema,
  createDrawRequestLineSchema,
  updateDrawRequestLineSchema,
  batchCreateDrawLinesSchema,
  submitDrawRequestSchema,
  approveDrawRequestSchema,
} from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// Type System
// ============================================================================

describe('Module 15 — Draw Request Types', () => {
  test('DrawRequestStatus has 6 values matching AIA lifecycle', () => {
    const statuses: DrawRequestStatus[] = [
      'draft', 'pending_review', 'approved', 'submitted_to_lender', 'funded', 'rejected',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('DrawHistoryAction has 6 values', () => {
    const actions: DrawHistoryAction[] = [
      'created', 'submitted', 'approved', 'rejected', 'funded', 'revised',
    ]
    expect(actions).toHaveLength(6)
  })

  test('DrawRequest interface has all AIA G702 fields', () => {
    const draw: DrawRequest = {
      id: '1', company_id: '1', job_id: '1',
      draw_number: 1,
      application_date: '2026-01-15',
      period_to: '2026-01-31',
      status: 'draft',
      contract_amount: 500000,
      total_completed: 125000,
      retainage_pct: 10,
      retainage_amount: 12500,
      total_earned: 112500,
      less_previous: 50000,
      current_due: 62500,
      balance_to_finish: 375000,
      submitted_by: null, submitted_at: null,
      approved_by: null, approved_at: null,
      lender_reference: null, notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(draw.draw_number).toBe(1)
    expect(draw.retainage_pct).toBe(10)
    expect(draw.status).toBe('draft')
    expect(draw.deleted_at).toBeNull()
  })

  test('DrawRequestLine interface has all G703 continuation sheet columns', () => {
    const line: DrawRequestLine = {
      id: '1', draw_request_id: '1',
      cost_code_id: null,
      description: 'Framing',
      scheduled_value: 100000,
      previous_applications: 25000,
      current_work: 30000,
      materials_stored: 5000,
      total_completed: 60000,
      pct_complete: 60,
      balance_to_finish: 40000,
      retainage: 6000,
      sort_order: 1,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(line.description).toBe('Framing')
    expect(line.pct_complete).toBe(60)
    expect(line.materials_stored).toBe(5000)
  })

  test('DrawRequestHistory interface has all audit fields', () => {
    const history: DrawRequestHistory = {
      id: '1', draw_request_id: '1',
      action: 'submitted',
      details: { notes: 'Ready for review' },
      performed_by: 'user-1',
      created_at: '2026-01-15',
    }
    expect(history.action).toBe('submitted')
    expect(history.details).toHaveProperty('notes')
  })

  test('DrawRequest supports soft delete via deleted_at', () => {
    const draw: DrawRequest = {
      id: '1', company_id: '1', job_id: '1',
      draw_number: 1, application_date: '2026-01-01', period_to: '2026-01-31',
      status: 'draft',
      contract_amount: 0, total_completed: 0, retainage_pct: 10,
      retainage_amount: 0, total_earned: 0, less_previous: 0,
      current_due: 0, balance_to_finish: 0,
      submitted_by: null, submitted_at: null,
      approved_by: null, approved_at: null,
      lender_reference: null, notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: '2026-02-01',
    }
    expect(draw.deleted_at).toBe('2026-02-01')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 15 — Constants', () => {
  test('DRAW_STATUSES has 6 entries with value and label', () => {
    expect(DRAW_STATUSES).toHaveLength(6)
    for (const ds of DRAW_STATUSES) {
      expect(ds).toHaveProperty('value')
      expect(ds).toHaveProperty('label')
      expect(ds.label.length).toBeGreaterThan(0)
    }
  })

  test('DRAW_STATUSES includes all lifecycle phases', () => {
    const values = DRAW_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('pending_review')
    expect(values).toContain('approved')
    expect(values).toContain('submitted_to_lender')
    expect(values).toContain('funded')
    expect(values).toContain('rejected')
  })

  test('DRAW_HISTORY_ACTIONS has 6 entries', () => {
    expect(DRAW_HISTORY_ACTIONS).toHaveLength(6)
    for (const ha of DRAW_HISTORY_ACTIONS) {
      expect(ha).toHaveProperty('value')
      expect(ha).toHaveProperty('label')
    }
  })

  test('DRAW_HISTORY_ACTIONS includes all audit actions', () => {
    const values = DRAW_HISTORY_ACTIONS.map((a) => a.value)
    expect(values).toContain('created')
    expect(values).toContain('submitted')
    expect(values).toContain('approved')
    expect(values).toContain('rejected')
    expect(values).toContain('funded')
    expect(values).toContain('revised')
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 15 — Schema Enums', () => {
  test('drawRequestStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'pending_review', 'approved', 'submitted_to_lender', 'funded', 'rejected']) {
      expect(drawRequestStatusEnum.parse(s)).toBe(s)
    }
  })

  test('drawRequestStatusEnum rejects invalid status', () => {
    expect(() => drawRequestStatusEnum.parse('unknown')).toThrow()
    expect(() => drawRequestStatusEnum.parse('in_progress')).toThrow()
  })

  test('drawHistoryActionEnum accepts all 6 actions', () => {
    for (const a of ['created', 'submitted', 'approved', 'rejected', 'funded', 'revised']) {
      expect(drawHistoryActionEnum.parse(a)).toBe(a)
    }
  })

  test('drawHistoryActionEnum rejects invalid action', () => {
    expect(() => drawHistoryActionEnum.parse('deleted')).toThrow()
  })
})

// ============================================================================
// Schemas — List Draw Requests
// ============================================================================

describe('Module 15 — List Draw Requests Schema', () => {
  test('listDrawRequestsSchema accepts valid params', () => {
    const result = listDrawRequestsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listDrawRequestsSchema rejects limit > 100', () => {
    expect(() => listDrawRequestsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listDrawRequestsSchema accepts all filter fields', () => {
    const result = listDrawRequestsSchema.parse({
      page: '1', limit: '10',
      job_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      status: 'draft',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      q: 'Draw 5',
    })
    expect(result.job_id).toBeDefined()
    expect(result.status).toBe('draft')
    expect(result.start_date).toBe('2026-01-01')
  })

  test('listDrawRequestsSchema rejects invalid date format', () => {
    expect(() => listDrawRequestsSchema.parse({ start_date: 'Jan 1 2026' })).toThrow()
  })
})

// ============================================================================
// Schemas — Create Draw Request
// ============================================================================

describe('Module 15 — Create Draw Request Schema', () => {
  test('createDrawRequestSchema accepts valid draw request', () => {
    const result = createDrawRequestSchema.parse({
      job_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      draw_number: 1,
      application_date: '2026-02-15',
      period_to: '2026-02-28',
      contract_amount: 500000,
    })
    expect(result.draw_number).toBe(1)
    expect(result.retainage_pct).toBe(10) // default
  })

  test('createDrawRequestSchema requires job_id, draw_number, dates, contract_amount', () => {
    expect(() => createDrawRequestSchema.parse({})).toThrow()
    expect(() => createDrawRequestSchema.parse({ job_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })).toThrow()
  })

  test('createDrawRequestSchema rejects negative contract amount', () => {
    expect(() => createDrawRequestSchema.parse({
      job_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      draw_number: 1,
      application_date: '2026-02-15',
      period_to: '2026-02-28',
      contract_amount: -1000,
    })).toThrow()
  })

  test('createDrawRequestSchema accepts optional lender_reference and notes', () => {
    const result = createDrawRequestSchema.parse({
      job_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      draw_number: 3,
      application_date: '2026-03-15',
      period_to: '2026-03-31',
      contract_amount: 750000,
      retainage_pct: 5,
      lender_reference: 'LOAN-2026-001',
      notes: 'Third draw covering framing completion',
    })
    expect(result.lender_reference).toBe('LOAN-2026-001')
    expect(result.retainage_pct).toBe(5)
  })

  test('createDrawRequestSchema rejects retainage_pct > 100', () => {
    expect(() => createDrawRequestSchema.parse({
      job_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      draw_number: 1,
      application_date: '2026-01-01',
      period_to: '2026-01-31',
      contract_amount: 100000,
      retainage_pct: 150,
    })).toThrow()
  })
})

// ============================================================================
// Schemas — Update Draw Request
// ============================================================================

describe('Module 15 — Update Draw Request Schema', () => {
  test('updateDrawRequestSchema accepts partial updates', () => {
    const result = updateDrawRequestSchema.parse({ draw_number: 2 })
    expect(result.draw_number).toBe(2)
    expect(result.contract_amount).toBeUndefined()
  })

  test('updateDrawRequestSchema accepts all optional fields', () => {
    const result = updateDrawRequestSchema.parse({
      draw_number: 5,
      application_date: '2026-06-01',
      period_to: '2026-06-30',
      contract_amount: 800000,
      retainage_pct: 5,
      lender_reference: 'REF-123',
      notes: 'Updated notes',
    })
    expect(result.lender_reference).toBe('REF-123')
  })

  test('updateDrawRequestSchema accepts nullable lender_reference', () => {
    const result = updateDrawRequestSchema.parse({ lender_reference: null })
    expect(result.lender_reference).toBeNull()
  })
})

// ============================================================================
// Schemas — Line Items
// ============================================================================

describe('Module 15 — Line Item Schemas', () => {
  test('createDrawRequestLineSchema accepts valid line', () => {
    const result = createDrawRequestLineSchema.parse({
      description: 'Foundation',
      scheduled_value: 75000,
      previous_applications: 20000,
      current_work: 25000,
      materials_stored: 5000,
      sort_order: 1,
    })
    expect(result.description).toBe('Foundation')
    expect(result.scheduled_value).toBe(75000)
  })

  test('createDrawRequestLineSchema requires description and scheduled_value', () => {
    expect(() => createDrawRequestLineSchema.parse({})).toThrow()
    expect(() => createDrawRequestLineSchema.parse({ description: 'Test' })).toThrow()
  })

  test('createDrawRequestLineSchema defaults previous/current/stored to 0', () => {
    const result = createDrawRequestLineSchema.parse({
      description: 'Electrical',
      scheduled_value: 50000,
    })
    expect(result.previous_applications).toBe(0)
    expect(result.current_work).toBe(0)
    expect(result.materials_stored).toBe(0)
  })

  test('updateDrawRequestLineSchema accepts partial updates', () => {
    const result = updateDrawRequestLineSchema.parse({ current_work: 15000 })
    expect(result.current_work).toBe(15000)
    expect(result.description).toBeUndefined()
  })

  test('batchCreateDrawLinesSchema requires at least 1 line', () => {
    expect(() => batchCreateDrawLinesSchema.parse({ lines: [] })).toThrow()
  })

  test('batchCreateDrawLinesSchema accepts multiple lines', () => {
    const result = batchCreateDrawLinesSchema.parse({
      lines: [
        { description: 'Foundation', scheduled_value: 75000 },
        { description: 'Framing', scheduled_value: 120000 },
        { description: 'Electrical', scheduled_value: 55000 },
      ],
    })
    expect(result.lines).toHaveLength(3)
  })
})

// ============================================================================
// Schemas — Workflow Transitions
// ============================================================================

describe('Module 15 — Workflow Schemas', () => {
  test('submitDrawRequestSchema accepts optional notes', () => {
    const result = submitDrawRequestSchema.parse({ notes: 'Ready for review' })
    expect(result.notes).toBe('Ready for review')
  })

  test('submitDrawRequestSchema accepts empty body', () => {
    const result = submitDrawRequestSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('approveDrawRequestSchema accepts optional notes', () => {
    const result = approveDrawRequestSchema.parse({ notes: 'Approved for submission' })
    expect(result.notes).toBe('Approved for submission')
  })

  test('approveDrawRequestSchema accepts empty body', () => {
    const result = approveDrawRequestSchema.parse({})
    expect(result.notes).toBeUndefined()
  })
})
