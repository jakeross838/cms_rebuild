/**
 * Module 17 — Change Order Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 17 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ChangeType,
  ChangeOrderStatus,
  RequesterType,
  ChangeOrderHistoryAction,
  ChangeOrder,
  ChangeOrderItem,
  ChangeOrderHistory,
} from '@/types/change-orders'

import {
  CHANGE_TYPES,
  CHANGE_ORDER_STATUSES,
  REQUESTER_TYPES,
  CHANGE_ORDER_HISTORY_ACTIONS,
} from '@/types/change-orders'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  changeTypeEnum,
  changeOrderStatusEnum,
  requesterTypeEnum,
  changeOrderHistoryActionEnum,
  listChangeOrdersSchema,
  createChangeOrderSchema,
  updateChangeOrderSchema,
  submitChangeOrderSchema,
  approveChangeOrderSchema,
  listChangeOrderItemsSchema,
  createChangeOrderItemSchema,
  updateChangeOrderItemSchema,
} from '@/lib/validation/schemas/change-orders'

// ============================================================================
// Type System
// ============================================================================

describe('Module 17 — Change Order Types', () => {
  test('ChangeType has 6 values', () => {
    const types: ChangeType[] = [
      'owner_requested', 'field_condition', 'design_change', 'regulatory', 'allowance', 'credit',
    ]
    expect(types).toHaveLength(6)
  })

  test('ChangeOrderStatus has 5 values', () => {
    const statuses: ChangeOrderStatus[] = [
      'draft', 'pending_approval', 'approved', 'rejected', 'voided',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('RequesterType has 3 values', () => {
    const types: RequesterType[] = ['builder', 'client', 'vendor']
    expect(types).toHaveLength(3)
  })

  test('ChangeOrderHistoryAction has 7 values', () => {
    const actions: ChangeOrderHistoryAction[] = [
      'created', 'submitted', 'approved', 'rejected', 'voided', 'revised', 'client_approved',
    ]
    expect(actions).toHaveLength(7)
  })

  test('ChangeOrder interface has all required fields', () => {
    const co: ChangeOrder = {
      id: '1', company_id: '1', job_id: '1', co_number: 'CO-001',
      title: 'Add outlet', description: null, change_type: 'owner_requested',
      status: 'draft', requested_by_type: 'client', requested_by_id: null,
      amount: 1500.00, cost_impact: 1500.00, schedule_impact_days: 0,
      approval_chain: [], approved_by: null, approved_at: null,
      client_approved: false, client_approved_at: null,
      document_id: null, budget_id: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(co.co_number).toBe('CO-001')
    expect(co.status).toBe('draft')
    expect(co.amount).toBe(1500.00)
  })

  test('ChangeOrderItem interface has all required fields', () => {
    const item: ChangeOrderItem = {
      id: '1', change_order_id: '1', description: 'Additional outlet',
      cost_code_id: null, quantity: 1, unit_price: 250.00, amount: 250.00,
      markup_pct: 15, markup_amount: 37.50, total: 287.50,
      vendor_id: null, sort_order: 0,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(item.description).toBe('Additional outlet')
    expect(item.total).toBe(287.50)
    expect(item.markup_pct).toBe(15)
  })

  test('ChangeOrderHistory interface has all required fields', () => {
    const entry: ChangeOrderHistory = {
      id: '1', change_order_id: '1', action: 'created',
      previous_status: null, new_status: 'draft',
      details: {}, performed_by: '1', created_at: '2026-01-15',
    }
    expect(entry.action).toBe('created')
    expect(entry.new_status).toBe('draft')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 17 — Constants', () => {
  test('CHANGE_TYPES has 6 entries with value and label', () => {
    expect(CHANGE_TYPES).toHaveLength(6)
    for (const ct of CHANGE_TYPES) {
      expect(ct).toHaveProperty('value')
      expect(ct).toHaveProperty('label')
      expect(ct.label.length).toBeGreaterThan(0)
    }
  })

  test('CHANGE_ORDER_STATUSES has 5 entries with value and label', () => {
    expect(CHANGE_ORDER_STATUSES).toHaveLength(5)
    for (const s of CHANGE_ORDER_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('REQUESTER_TYPES has 3 entries', () => {
    expect(REQUESTER_TYPES).toHaveLength(3)
    const values = REQUESTER_TYPES.map((r) => r.value)
    expect(values).toContain('builder')
    expect(values).toContain('client')
    expect(values).toContain('vendor')
  })

  test('CHANGE_ORDER_HISTORY_ACTIONS has 7 entries', () => {
    expect(CHANGE_ORDER_HISTORY_ACTIONS).toHaveLength(7)
    const values = CHANGE_ORDER_HISTORY_ACTIONS.map((a) => a.value)
    expect(values).toContain('created')
    expect(values).toContain('submitted')
    expect(values).toContain('approved')
    expect(values).toContain('client_approved')
  })
})

// ============================================================================
// Schemas
// ============================================================================

describe('Module 17 — Validation Schemas', () => {
  test('changeTypeEnum accepts all 6 change types', () => {
    for (const ct of ['owner_requested', 'field_condition', 'design_change', 'regulatory', 'allowance', 'credit']) {
      expect(changeTypeEnum.parse(ct)).toBe(ct)
    }
  })

  test('changeTypeEnum rejects invalid type', () => {
    expect(() => changeTypeEnum.parse('unknown')).toThrow()
  })

  test('changeOrderStatusEnum accepts all 5 statuses', () => {
    for (const s of ['draft', 'pending_approval', 'approved', 'rejected', 'voided']) {
      expect(changeOrderStatusEnum.parse(s)).toBe(s)
    }
  })

  test('changeOrderStatusEnum rejects invalid status', () => {
    expect(() => changeOrderStatusEnum.parse('cancelled')).toThrow()
  })

  test('requesterTypeEnum accepts all 3 types', () => {
    for (const t of ['builder', 'client', 'vendor']) {
      expect(requesterTypeEnum.parse(t)).toBe(t)
    }
  })

  test('changeOrderHistoryActionEnum accepts all 7 actions', () => {
    for (const a of ['created', 'submitted', 'approved', 'rejected', 'voided', 'revised', 'client_approved']) {
      expect(changeOrderHistoryActionEnum.parse(a)).toBe(a)
    }
  })

  test('listChangeOrdersSchema accepts valid params', () => {
    const result = listChangeOrdersSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listChangeOrdersSchema rejects limit > 100', () => {
    expect(() => listChangeOrdersSchema.parse({ limit: 200 })).toThrow()
  })

  test('listChangeOrdersSchema accepts filters', () => {
    const result = listChangeOrdersSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'draft',
      change_type: 'owner_requested',
      q: 'outlet',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('draft')
    expect(result.change_type).toBe('owner_requested')
    expect(result.q).toBe('outlet')
  })

  test('createChangeOrderSchema accepts valid change order', () => {
    const result = createChangeOrderSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      co_number: 'CO-001',
      title: 'Add electrical outlet to kitchen island',
    })
    expect(result.co_number).toBe('CO-001')
    expect(result.title).toBe('Add electrical outlet to kitchen island')
    expect(result.status).toBe('draft')
    expect(result.change_type).toBe('owner_requested')
    expect(result.amount).toBe(0)
    expect(result.schedule_impact_days).toBe(0)
  })

  test('createChangeOrderSchema requires job_id, co_number, title', () => {
    expect(() => createChangeOrderSchema.parse({})).toThrow()
    expect(() => createChangeOrderSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
    expect(() => createChangeOrderSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000', co_number: 'CO-001' })).toThrow()
  })

  test('createChangeOrderSchema rejects co_number > 20 chars', () => {
    expect(() => createChangeOrderSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      co_number: 'A'.repeat(21),
      title: 'Test',
    })).toThrow()
  })

  test('createChangeOrderSchema rejects title > 255 chars', () => {
    expect(() => createChangeOrderSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      co_number: 'CO-001',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('updateChangeOrderSchema accepts partial updates', () => {
    const result = updateChangeOrderSchema.parse({ title: 'Updated title' })
    expect(result.title).toBe('Updated title')
    expect(result.co_number).toBeUndefined()
  })

  test('submitChangeOrderSchema accepts empty object', () => {
    const result = submitChangeOrderSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('submitChangeOrderSchema accepts notes', () => {
    const result = submitChangeOrderSchema.parse({ notes: 'Ready for review' })
    expect(result.notes).toBe('Ready for review')
  })

  test('approveChangeOrderSchema accepts client_approved flag', () => {
    const result = approveChangeOrderSchema.parse({ client_approved: true, notes: 'Approved by PM' })
    expect(result.client_approved).toBe(true)
    expect(result.notes).toBe('Approved by PM')
  })

  test('createChangeOrderItemSchema accepts valid item', () => {
    const result = createChangeOrderItemSchema.parse({
      description: 'Additional outlet installation',
      quantity: 2,
      unit_price: 150.00,
      amount: 300.00,
      markup_pct: 15,
      markup_amount: 45.00,
      total: 345.00,
    })
    expect(result.description).toBe('Additional outlet installation')
    expect(result.quantity).toBe(2)
    expect(result.total).toBe(345.00)
  })

  test('createChangeOrderItemSchema requires description', () => {
    expect(() => createChangeOrderItemSchema.parse({})).toThrow()
  })

  test('createChangeOrderItemSchema has correct defaults', () => {
    const result = createChangeOrderItemSchema.parse({ description: 'Test item' })
    expect(result.quantity).toBe(1)
    expect(result.unit_price).toBe(0)
    expect(result.amount).toBe(0)
    expect(result.markup_pct).toBe(0)
    expect(result.markup_amount).toBe(0)
    expect(result.total).toBe(0)
    expect(result.sort_order).toBe(0)
  })

  test('updateChangeOrderItemSchema accepts partial updates', () => {
    const result = updateChangeOrderItemSchema.parse({ quantity: 5, unit_price: 200 })
    expect(result.quantity).toBe(5)
    expect(result.unit_price).toBe(200)
    expect(result.description).toBeUndefined()
  })

  test('listChangeOrderItemsSchema accepts valid params with defaults', () => {
    const result = listChangeOrderItemsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })
})
