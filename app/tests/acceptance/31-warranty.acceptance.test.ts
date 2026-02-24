/**
 * Module 31 — Warranty & Home Care Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 31 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  WarrantyStatus,
  WarrantyType,
  ClaimStatus,
  ClaimPriority,
  ClaimHistoryAction,
  MaintenanceFrequency,
  TaskStatus,
  Warranty,
  WarrantyClaim,
  WarrantyClaimHistory,
  MaintenanceSchedule,
  MaintenanceTask,
} from '@/types/warranty'

import {
  WARRANTY_STATUSES,
  WARRANTY_TYPES,
  CLAIM_STATUSES,
  CLAIM_PRIORITIES,
  CLAIM_HISTORY_ACTIONS,
  MAINTENANCE_FREQUENCIES,
  TASK_STATUSES,
} from '@/types/warranty'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  warrantyStatusEnum,
  warrantyTypeEnum,
  claimStatusEnum,
  claimPriorityEnum,
  claimHistoryActionEnum,
  maintenanceFrequencyEnum,
  taskStatusEnum,
  listWarrantiesSchema,
  createWarrantySchema,
  updateWarrantySchema,
  listWarrantyClaimsSchema,
  createWarrantyClaimSchema,
  updateWarrantyClaimSchema,
  resolveWarrantyClaimSchema,
  listClaimHistorySchema,
  listMaintenanceSchedulesSchema,
  createMaintenanceScheduleSchema,
  updateMaintenanceScheduleSchema,
  listMaintenanceTasksSchema,
  createMaintenanceTaskSchema,
  updateMaintenanceTaskSchema,
  completeMaintenanceTaskSchema,
} from '@/lib/validation/schemas/warranty'

// ============================================================================
// Type System
// ============================================================================

describe('Module 31 — Warranty & Home Care Types', () => {
  test('WarrantyStatus has 4 values', () => {
    const statuses: WarrantyStatus[] = ['active', 'expired', 'voided', 'transferred']
    expect(statuses).toHaveLength(4)
  })

  test('WarrantyType has 9 values', () => {
    const types: WarrantyType[] = [
      'structural', 'mechanical', 'electrical', 'plumbing', 'hvac', 'roofing', 'appliance', 'general', 'workmanship',
    ]
    expect(types).toHaveLength(9)
  })

  test('ClaimStatus has 6 values', () => {
    const statuses: ClaimStatus[] = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'denied', 'escalated']
    expect(statuses).toHaveLength(6)
  })

  test('ClaimPriority has 4 values', () => {
    const priorities: ClaimPriority[] = ['low', 'normal', 'high', 'urgent']
    expect(priorities).toHaveLength(4)
  })

  test('ClaimHistoryAction has 9 values', () => {
    const actions: ClaimHistoryAction[] = [
      'created', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'denied', 'escalated', 'reopened', 'note_added',
    ]
    expect(actions).toHaveLength(9)
  })

  test('MaintenanceFrequency has 5 values', () => {
    const frequencies: MaintenanceFrequency[] = ['weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']
    expect(frequencies).toHaveLength(5)
  })

  test('TaskStatus has 5 values', () => {
    const statuses: TaskStatus[] = ['pending', 'scheduled', 'completed', 'overdue', 'skipped']
    expect(statuses).toHaveLength(5)
  })

  test('Warranty interface has all required fields', () => {
    const w: Warranty = {
      id: '1', company_id: '1', job_id: '1', title: '10-Year Structural Warranty',
      description: null, warranty_type: 'structural', status: 'active',
      vendor_id: null, start_date: '2026-01-15', end_date: '2036-01-15',
      coverage_details: null, exclusions: null, document_id: null,
      contact_name: 'John Ross', contact_phone: '555-0100', contact_email: 'john@ross.com',
      transferred_to: null, transferred_at: null,
      created_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(w.warranty_type).toBe('structural')
    expect(w.status).toBe('active')
    expect(w.end_date).toBe('2036-01-15')
  })

  test('WarrantyClaim interface has all required fields', () => {
    const c: WarrantyClaim = {
      id: '1', company_id: '1', warranty_id: '1', claim_number: 'WC-001',
      title: 'Roof leak', description: 'Water coming through skylight',
      status: 'submitted', priority: 'high', reported_by: '1',
      reported_date: '2026-06-15', assigned_to: null, assigned_vendor_id: null,
      resolution_notes: null, resolution_cost: 0, resolved_at: null, resolved_by: null,
      due_date: '2026-06-22', photos: [],
      created_by: '1', created_at: '2026-06-15', updated_at: '2026-06-15', deleted_at: null,
    }
    expect(c.claim_number).toBe('WC-001')
    expect(c.priority).toBe('high')
    expect(c.resolution_cost).toBe(0)
  })

  test('WarrantyClaimHistory interface has all required fields', () => {
    const h: WarrantyClaimHistory = {
      id: '1', claim_id: '1', company_id: '1', action: 'created',
      previous_status: null, new_status: 'submitted',
      details: {}, performed_by: '1', created_at: '2026-06-15',
    }
    expect(h.action).toBe('created')
    expect(h.new_status).toBe('submitted')
  })

  test('MaintenanceSchedule interface has all required fields', () => {
    const s: MaintenanceSchedule = {
      id: '1', company_id: '1', job_id: '1', title: 'HVAC Filter Replacement',
      description: null, frequency: 'quarterly', category: 'HVAC',
      assigned_to: null, assigned_vendor_id: null,
      start_date: '2026-01-01', end_date: null, next_due_date: '2026-04-01',
      estimated_cost: 150.00, is_active: true, notes: null,
      created_by: '1', created_at: '2026-01-01', updated_at: '2026-01-01', deleted_at: null,
    }
    expect(s.frequency).toBe('quarterly')
    expect(s.is_active).toBe(true)
    expect(s.estimated_cost).toBe(150.00)
  })

  test('MaintenanceTask interface has all required fields', () => {
    const t: MaintenanceTask = {
      id: '1', company_id: '1', schedule_id: '1',
      title: 'Q1 HVAC Filter Change', description: null,
      status: 'pending', due_date: '2026-04-01',
      completed_at: null, completed_by: null, actual_cost: 0,
      notes: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(t.status).toBe('pending')
    expect(t.actual_cost).toBe(0)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 31 — Constants', () => {
  test('WARRANTY_STATUSES has 4 entries with value and label', () => {
    expect(WARRANTY_STATUSES).toHaveLength(4)
    for (const s of WARRANTY_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('WARRANTY_STATUSES includes all expected values', () => {
    const values = WARRANTY_STATUSES.map((s) => s.value)
    expect(values).toContain('active')
    expect(values).toContain('expired')
    expect(values).toContain('voided')
    expect(values).toContain('transferred')
  })

  test('WARRANTY_TYPES has 9 entries with value and label', () => {
    expect(WARRANTY_TYPES).toHaveLength(9)
    for (const t of WARRANTY_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('CLAIM_STATUSES has 6 entries with value and label', () => {
    expect(CLAIM_STATUSES).toHaveLength(6)
    for (const s of CLAIM_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('CLAIM_PRIORITIES has 4 entries with value and label', () => {
    expect(CLAIM_PRIORITIES).toHaveLength(4)
    const values = CLAIM_PRIORITIES.map((p) => p.value)
    expect(values).toContain('low')
    expect(values).toContain('normal')
    expect(values).toContain('high')
    expect(values).toContain('urgent')
  })

  test('CLAIM_HISTORY_ACTIONS has 9 entries with value and label', () => {
    expect(CLAIM_HISTORY_ACTIONS).toHaveLength(9)
    const values = CLAIM_HISTORY_ACTIONS.map((a) => a.value)
    expect(values).toContain('created')
    expect(values).toContain('acknowledged')
    expect(values).toContain('resolved')
    expect(values).toContain('reopened')
    expect(values).toContain('note_added')
  })

  test('MAINTENANCE_FREQUENCIES has 5 entries with value and label', () => {
    expect(MAINTENANCE_FREQUENCIES).toHaveLength(5)
    const values = MAINTENANCE_FREQUENCIES.map((f) => f.value)
    expect(values).toContain('weekly')
    expect(values).toContain('monthly')
    expect(values).toContain('quarterly')
    expect(values).toContain('semi_annual')
    expect(values).toContain('annual')
  })

  test('TASK_STATUSES has 5 entries with value and label', () => {
    expect(TASK_STATUSES).toHaveLength(5)
    for (const s of TASK_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 31 — Enum Schemas', () => {
  test('warrantyStatusEnum accepts all 4 statuses', () => {
    for (const s of ['active', 'expired', 'voided', 'transferred']) {
      expect(warrantyStatusEnum.parse(s)).toBe(s)
    }
  })

  test('warrantyStatusEnum rejects invalid status', () => {
    expect(() => warrantyStatusEnum.parse('cancelled')).toThrow()
  })

  test('warrantyTypeEnum accepts all 9 types', () => {
    for (const t of ['structural', 'mechanical', 'electrical', 'plumbing', 'hvac', 'roofing', 'appliance', 'general', 'workmanship']) {
      expect(warrantyTypeEnum.parse(t)).toBe(t)
    }
  })

  test('warrantyTypeEnum rejects invalid type', () => {
    expect(() => warrantyTypeEnum.parse('unknown')).toThrow()
  })

  test('claimStatusEnum accepts all 6 statuses', () => {
    for (const s of ['submitted', 'acknowledged', 'in_progress', 'resolved', 'denied', 'escalated']) {
      expect(claimStatusEnum.parse(s)).toBe(s)
    }
  })

  test('claimStatusEnum rejects invalid status', () => {
    expect(() => claimStatusEnum.parse('pending')).toThrow()
  })

  test('claimPriorityEnum accepts all 4 priorities', () => {
    for (const p of ['low', 'normal', 'high', 'urgent']) {
      expect(claimPriorityEnum.parse(p)).toBe(p)
    }
  })

  test('claimPriorityEnum rejects invalid priority', () => {
    expect(() => claimPriorityEnum.parse('critical')).toThrow()
  })

  test('claimHistoryActionEnum accepts all 9 actions', () => {
    for (const a of ['created', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'denied', 'escalated', 'reopened', 'note_added']) {
      expect(claimHistoryActionEnum.parse(a)).toBe(a)
    }
  })

  test('claimHistoryActionEnum rejects invalid action', () => {
    expect(() => claimHistoryActionEnum.parse('deleted')).toThrow()
  })

  test('maintenanceFrequencyEnum accepts all 5 frequencies', () => {
    for (const f of ['weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']) {
      expect(maintenanceFrequencyEnum.parse(f)).toBe(f)
    }
  })

  test('maintenanceFrequencyEnum rejects invalid frequency', () => {
    expect(() => maintenanceFrequencyEnum.parse('daily')).toThrow()
  })

  test('taskStatusEnum accepts all 5 statuses', () => {
    for (const s of ['pending', 'scheduled', 'completed', 'overdue', 'skipped']) {
      expect(taskStatusEnum.parse(s)).toBe(s)
    }
  })

  test('taskStatusEnum rejects invalid status', () => {
    expect(() => taskStatusEnum.parse('cancelled')).toThrow()
  })
})

// ============================================================================
// Warranty Schemas
// ============================================================================

describe('Module 31 — Warranty Schemas', () => {
  test('listWarrantiesSchema accepts valid params', () => {
    const result = listWarrantiesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listWarrantiesSchema rejects limit > 100', () => {
    expect(() => listWarrantiesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listWarrantiesSchema accepts filters', () => {
    const result = listWarrantiesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'active',
      warranty_type: 'structural',
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      q: 'roof',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('active')
    expect(result.warranty_type).toBe('structural')
    expect(result.q).toBe('roof')
  })

  test('createWarrantySchema accepts valid warranty', () => {
    const result = createWarrantySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: '10-Year Structural Warranty',
      start_date: '2026-01-15',
      end_date: '2036-01-15',
    })
    expect(result.title).toBe('10-Year Structural Warranty')
    expect(result.warranty_type).toBe('general')
    expect(result.status).toBe('active')
  })

  test('createWarrantySchema requires job_id, title, start_date, end_date', () => {
    expect(() => createWarrantySchema.parse({})).toThrow()
    expect(() => createWarrantySchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
    expect(() => createWarrantySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
    })).toThrow()
    expect(() => createWarrantySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      start_date: '2026-01-15',
    })).toThrow()
  })

  test('createWarrantySchema rejects title > 255 chars', () => {
    expect(() => createWarrantySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
      start_date: '2026-01-15',
      end_date: '2036-01-15',
    })).toThrow()
  })

  test('createWarrantySchema validates date format', () => {
    expect(() => createWarrantySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      start_date: '01/15/2026',
      end_date: '2036-01-15',
    })).toThrow()
  })

  test('createWarrantySchema accepts optional contact fields', () => {
    const result = createWarrantySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      start_date: '2026-01-15',
      end_date: '2036-01-15',
      contact_name: 'John Ross',
      contact_phone: '555-0100',
      contact_email: 'john@ross.com',
    })
    expect(result.contact_name).toBe('John Ross')
    expect(result.contact_phone).toBe('555-0100')
    expect(result.contact_email).toBe('john@ross.com')
  })

  test('updateWarrantySchema accepts partial updates', () => {
    const result = updateWarrantySchema.parse({ title: 'Updated warranty title' })
    expect(result.title).toBe('Updated warranty title')
    expect(result.warranty_type).toBeUndefined()
  })

  test('updateWarrantySchema accepts transferred_to', () => {
    const result = updateWarrantySchema.parse({
      status: 'transferred',
      transferred_to: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.status).toBe('transferred')
    expect(result.transferred_to).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})

// ============================================================================
// Warranty Claim Schemas
// ============================================================================

describe('Module 31 — Warranty Claim Schemas', () => {
  test('listWarrantyClaimsSchema accepts valid params', () => {
    const result = listWarrantyClaimsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listWarrantyClaimsSchema accepts filters', () => {
    const result = listWarrantyClaimsSchema.parse({
      warranty_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'submitted',
      priority: 'high',
      assigned_to: '550e8400-e29b-41d4-a716-446655440000',
      q: 'leak',
    })
    expect(result.status).toBe('submitted')
    expect(result.priority).toBe('high')
    expect(result.q).toBe('leak')
  })

  test('createWarrantyClaimSchema accepts valid claim', () => {
    const result = createWarrantyClaimSchema.parse({
      warranty_id: '550e8400-e29b-41d4-a716-446655440000',
      claim_number: 'WC-001',
      title: 'Roof leak near skylight',
    })
    expect(result.claim_number).toBe('WC-001')
    expect(result.status).toBe('submitted')
    expect(result.priority).toBe('normal')
    expect(result.photos).toEqual([])
  })

  test('createWarrantyClaimSchema requires warranty_id, claim_number, title', () => {
    expect(() => createWarrantyClaimSchema.parse({})).toThrow()
    expect(() => createWarrantyClaimSchema.parse({ warranty_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createWarrantyClaimSchema rejects claim_number > 30 chars', () => {
    expect(() => createWarrantyClaimSchema.parse({
      warranty_id: '550e8400-e29b-41d4-a716-446655440000',
      claim_number: 'A'.repeat(31),
      title: 'Test',
    })).toThrow()
  })

  test('createWarrantyClaimSchema validates date fields', () => {
    expect(() => createWarrantyClaimSchema.parse({
      warranty_id: '550e8400-e29b-41d4-a716-446655440000',
      claim_number: 'WC-001',
      title: 'Test',
      reported_date: '06/15/2026',
    })).toThrow()
  })

  test('createWarrantyClaimSchema accepts optional fields', () => {
    const result = createWarrantyClaimSchema.parse({
      warranty_id: '550e8400-e29b-41d4-a716-446655440000',
      claim_number: 'WC-001',
      title: 'Leak',
      priority: 'urgent',
      due_date: '2026-07-01',
      reported_date: '2026-06-15',
    })
    expect(result.priority).toBe('urgent')
    expect(result.due_date).toBe('2026-07-01')
    expect(result.reported_date).toBe('2026-06-15')
  })

  test('updateWarrantyClaimSchema accepts partial updates', () => {
    const result = updateWarrantyClaimSchema.parse({
      status: 'in_progress',
      priority: 'high',
    })
    expect(result.status).toBe('in_progress')
    expect(result.priority).toBe('high')
    expect(result.title).toBeUndefined()
  })

  test('updateWarrantyClaimSchema accepts resolution fields', () => {
    const result = updateWarrantyClaimSchema.parse({
      resolution_notes: 'Repaired skylight seal',
      resolution_cost: 1500.00,
    })
    expect(result.resolution_notes).toBe('Repaired skylight seal')
    expect(result.resolution_cost).toBe(1500.00)
  })

  test('resolveWarrantyClaimSchema accepts empty object', () => {
    const result = resolveWarrantyClaimSchema.parse({})
    expect(result.resolution_cost).toBe(0)
  })

  test('resolveWarrantyClaimSchema accepts resolution details', () => {
    const result = resolveWarrantyClaimSchema.parse({
      resolution_notes: 'Fixed leak, replaced flashing',
      resolution_cost: 2500.00,
    })
    expect(result.resolution_notes).toBe('Fixed leak, replaced flashing')
    expect(result.resolution_cost).toBe(2500.00)
  })

  test('resolveWarrantyClaimSchema rejects negative cost', () => {
    expect(() => resolveWarrantyClaimSchema.parse({ resolution_cost: -100 })).toThrow()
  })
})

// ============================================================================
// Claim History Schema
// ============================================================================

describe('Module 31 — Claim History Schema', () => {
  test('listClaimHistorySchema accepts valid params with defaults', () => {
    const result = listClaimHistorySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listClaimHistorySchema rejects limit > 100', () => {
    expect(() => listClaimHistorySchema.parse({ limit: 200 })).toThrow()
  })
})

// ============================================================================
// Maintenance Schedule Schemas
// ============================================================================

describe('Module 31 — Maintenance Schedule Schemas', () => {
  test('listMaintenanceSchedulesSchema accepts valid params', () => {
    const result = listMaintenanceSchedulesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMaintenanceSchedulesSchema accepts filters', () => {
    const result = listMaintenanceSchedulesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      frequency: 'quarterly',
      is_active: 'true',
      q: 'HVAC',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.frequency).toBe('quarterly')
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('HVAC')
  })

  test('listMaintenanceSchedulesSchema handles is_active boolean preprocess', () => {
    const trueResult = listMaintenanceSchedulesSchema.parse({ is_active: 'true' })
    expect(trueResult.is_active).toBe(true)

    const falseResult = listMaintenanceSchedulesSchema.parse({ is_active: 'false' })
    expect(falseResult.is_active).toBe(false)
  })

  test('createMaintenanceScheduleSchema accepts valid schedule', () => {
    const result = createMaintenanceScheduleSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'HVAC Filter Replacement',
      start_date: '2026-01-01',
    })
    expect(result.title).toBe('HVAC Filter Replacement')
    expect(result.frequency).toBe('annual')
    expect(result.estimated_cost).toBe(0)
    expect(result.is_active).toBe(true)
  })

  test('createMaintenanceScheduleSchema requires job_id, title, start_date', () => {
    expect(() => createMaintenanceScheduleSchema.parse({})).toThrow()
    expect(() => createMaintenanceScheduleSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createMaintenanceScheduleSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
    })).toThrow()
  })

  test('createMaintenanceScheduleSchema rejects title > 255 chars', () => {
    expect(() => createMaintenanceScheduleSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
      start_date: '2026-01-01',
    })).toThrow()
  })

  test('createMaintenanceScheduleSchema validates date format', () => {
    expect(() => createMaintenanceScheduleSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      start_date: 'January 1, 2026',
    })).toThrow()
  })

  test('createMaintenanceScheduleSchema accepts all optional fields', () => {
    const result = createMaintenanceScheduleSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Schedule',
      start_date: '2026-01-01',
      frequency: 'quarterly',
      category: 'HVAC',
      end_date: '2027-01-01',
      next_due_date: '2026-04-01',
      estimated_cost: 200,
    })
    expect(result.frequency).toBe('quarterly')
    expect(result.category).toBe('HVAC')
    expect(result.end_date).toBe('2027-01-01')
    expect(result.next_due_date).toBe('2026-04-01')
    expect(result.estimated_cost).toBe(200)
  })

  test('updateMaintenanceScheduleSchema accepts partial updates', () => {
    const result = updateMaintenanceScheduleSchema.parse({
      frequency: 'monthly',
      is_active: false,
    })
    expect(result.frequency).toBe('monthly')
    expect(result.is_active).toBe(false)
    expect(result.title).toBeUndefined()
  })
})

// ============================================================================
// Maintenance Task Schemas
// ============================================================================

describe('Module 31 — Maintenance Task Schemas', () => {
  test('listMaintenanceTasksSchema accepts valid params', () => {
    const result = listMaintenanceTasksSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMaintenanceTasksSchema accepts filters', () => {
    const result = listMaintenanceTasksSchema.parse({
      schedule_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'pending',
      q: 'filter',
    })
    expect(result.schedule_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('pending')
    expect(result.q).toBe('filter')
  })

  test('createMaintenanceTaskSchema accepts valid task', () => {
    const result = createMaintenanceTaskSchema.parse({
      schedule_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Q1 HVAC Filter Change',
      due_date: '2026-04-01',
    })
    expect(result.title).toBe('Q1 HVAC Filter Change')
    expect(result.status).toBe('pending')
    expect(result.actual_cost).toBe(0)
  })

  test('createMaintenanceTaskSchema requires schedule_id, title, due_date', () => {
    expect(() => createMaintenanceTaskSchema.parse({})).toThrow()
    expect(() => createMaintenanceTaskSchema.parse({
      schedule_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createMaintenanceTaskSchema.parse({
      schedule_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
    })).toThrow()
  })

  test('createMaintenanceTaskSchema validates due_date format', () => {
    expect(() => createMaintenanceTaskSchema.parse({
      schedule_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      due_date: '04-01-2026',
    })).toThrow()
  })

  test('updateMaintenanceTaskSchema accepts partial updates', () => {
    const result = updateMaintenanceTaskSchema.parse({
      status: 'scheduled',
      actual_cost: 175.00,
    })
    expect(result.status).toBe('scheduled')
    expect(result.actual_cost).toBe(175.00)
    expect(result.title).toBeUndefined()
  })

  test('completeMaintenanceTaskSchema accepts empty object', () => {
    const result = completeMaintenanceTaskSchema.parse({})
    expect(result.actual_cost).toBe(0)
  })

  test('completeMaintenanceTaskSchema accepts cost and notes', () => {
    const result = completeMaintenanceTaskSchema.parse({
      actual_cost: 185.50,
      notes: 'Replaced filter and cleaned coils',
    })
    expect(result.actual_cost).toBe(185.50)
    expect(result.notes).toBe('Replaced filter and cleaned coils')
  })

  test('completeMaintenanceTaskSchema rejects negative cost', () => {
    expect(() => completeMaintenanceTaskSchema.parse({ actual_cost: -50 })).toThrow()
  })
})
