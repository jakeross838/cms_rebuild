/**
 * Module 21 — Selection Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 21 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  SelectionStatus,
  PricingModel,
  OptionSource,
  SelectionHistoryAction,
  SelectionCategory,
  SelectionOption,
  Selection,
  SelectionHistory,
} from '@/types/selections'

import {
  SELECTION_STATUSES,
  PRICING_MODELS,
  OPTION_SOURCES,
  SELECTION_HISTORY_ACTIONS,
} from '@/types/selections'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  selectionStatusEnum,
  pricingModelEnum,
  optionSourceEnum,
  selectionHistoryActionEnum,
  listSelectionCategoriesSchema,
  createSelectionCategorySchema,
  updateSelectionCategorySchema,
  listSelectionOptionsSchema,
  createSelectionOptionSchema,
  updateSelectionOptionSchema,
  listSelectionsSchema,
  createSelectionSchema,
  updateSelectionSchema,
  listSelectionHistorySchema,
} from '@/lib/validation/schemas/selections'

// ============================================================================
// Type System
// ============================================================================

describe('Module 21 — Selection Types', () => {
  test('SelectionStatus has 9 values', () => {
    const statuses: SelectionStatus[] = [
      'pending', 'presented', 'selected', 'approved', 'ordered', 'received', 'installed', 'on_hold', 'cancelled',
    ]
    expect(statuses).toHaveLength(9)
  })

  test('PricingModel has 3 values', () => {
    const models: PricingModel[] = ['allowance', 'fixed', 'cost_plus']
    expect(models).toHaveLength(3)
  })

  test('OptionSource has 4 values', () => {
    const sources: OptionSource[] = ['builder', 'designer', 'client', 'catalog']
    expect(sources).toHaveLength(4)
  })

  test('SelectionHistoryAction has 5 values', () => {
    const actions: SelectionHistoryAction[] = ['viewed', 'considered', 'selected', 'deselected', 'changed']
    expect(actions).toHaveLength(5)
  })

  test('SelectionCategory interface has all required fields', () => {
    const cat: SelectionCategory = {
      id: '1', company_id: '1', job_id: '1', name: 'Flooring',
      room: 'Kitchen', sort_order: 0, pricing_model: 'allowance',
      allowance_amount: 5000.00, deadline: '2026-06-15',
      lead_time_buffer_days: 14, assigned_to: null,
      status: 'pending', designer_access: false, notes: null,
      created_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(cat.name).toBe('Flooring')
    expect(cat.pricing_model).toBe('allowance')
    expect(cat.allowance_amount).toBe(5000.00)
  })

  test('SelectionOption interface has all required fields', () => {
    const opt: SelectionOption = {
      id: '1', company_id: '1', category_id: '1',
      name: 'Oak Hardwood', description: 'Premium white oak planks',
      vendor_id: '1', sku: 'OAK-HW-001', model_number: 'WO-5',
      unit_price: 8.50, quantity: 500, total_price: 4250.00,
      lead_time_days: 21, availability_status: 'in_stock',
      source: 'builder', is_recommended: true, sort_order: 0,
      created_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(opt.name).toBe('Oak Hardwood')
    expect(opt.source).toBe('builder')
    expect(opt.total_price).toBe(4250.00)
  })

  test('Selection interface has all required fields', () => {
    const sel: Selection = {
      id: '1', company_id: '1', category_id: '1', option_id: '1',
      job_id: '1', room: 'Kitchen',
      selected_by: '1', selected_at: '2026-01-15',
      confirmed_by: null, confirmed_at: null,
      status: 'selected', change_reason: null,
      superseded_by: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(sel.status).toBe('selected')
    expect(sel.room).toBe('Kitchen')
    expect(sel.confirmed_by).toBeNull()
  })

  test('SelectionHistory interface has all required fields', () => {
    const hist: SelectionHistory = {
      id: '1', company_id: '1', category_id: '1',
      option_id: '1', action: 'selected',
      actor_id: '1', actor_role: 'builder',
      notes: null, created_at: '2026-01-15',
    }
    expect(hist.action).toBe('selected')
    expect(hist.actor_role).toBe('builder')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 21 — Constants', () => {
  test('SELECTION_STATUSES has 9 entries with value and label', () => {
    expect(SELECTION_STATUSES).toHaveLength(9)
    for (const s of SELECTION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('SELECTION_STATUSES includes all expected status values', () => {
    const values = SELECTION_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('presented')
    expect(values).toContain('selected')
    expect(values).toContain('approved')
    expect(values).toContain('ordered')
    expect(values).toContain('received')
    expect(values).toContain('installed')
    expect(values).toContain('on_hold')
    expect(values).toContain('cancelled')
  })

  test('PRICING_MODELS has 3 entries with value and label', () => {
    expect(PRICING_MODELS).toHaveLength(3)
    for (const p of PRICING_MODELS) {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
      expect(p.label.length).toBeGreaterThan(0)
    }
  })

  test('OPTION_SOURCES has 4 entries with value and label', () => {
    expect(OPTION_SOURCES).toHaveLength(4)
    const values = OPTION_SOURCES.map((s) => s.value)
    expect(values).toContain('builder')
    expect(values).toContain('designer')
    expect(values).toContain('client')
    expect(values).toContain('catalog')
  })

  test('SELECTION_HISTORY_ACTIONS has 5 entries with value and label', () => {
    expect(SELECTION_HISTORY_ACTIONS).toHaveLength(5)
    const values = SELECTION_HISTORY_ACTIONS.map((a) => a.value)
    expect(values).toContain('viewed')
    expect(values).toContain('considered')
    expect(values).toContain('selected')
    expect(values).toContain('deselected')
    expect(values).toContain('changed')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 21 — Enum Schemas', () => {
  test('selectionStatusEnum accepts all 9 statuses', () => {
    for (const s of ['pending', 'presented', 'selected', 'approved', 'ordered', 'received', 'installed', 'on_hold', 'cancelled']) {
      expect(selectionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('selectionStatusEnum rejects invalid status', () => {
    expect(() => selectionStatusEnum.parse('unknown')).toThrow()
  })

  test('pricingModelEnum accepts all 3 models', () => {
    for (const m of ['allowance', 'fixed', 'cost_plus']) {
      expect(pricingModelEnum.parse(m)).toBe(m)
    }
  })

  test('pricingModelEnum rejects invalid model', () => {
    expect(() => pricingModelEnum.parse('hourly')).toThrow()
  })

  test('optionSourceEnum accepts all 4 sources', () => {
    for (const s of ['builder', 'designer', 'client', 'catalog']) {
      expect(optionSourceEnum.parse(s)).toBe(s)
    }
  })

  test('optionSourceEnum rejects invalid source', () => {
    expect(() => optionSourceEnum.parse('ai')).toThrow()
  })

  test('selectionHistoryActionEnum accepts all 5 actions', () => {
    for (const a of ['viewed', 'considered', 'selected', 'deselected', 'changed']) {
      expect(selectionHistoryActionEnum.parse(a)).toBe(a)
    }
  })

  test('selectionHistoryActionEnum rejects invalid action', () => {
    expect(() => selectionHistoryActionEnum.parse('deleted')).toThrow()
  })
})

// ============================================================================
// Category Schemas
// ============================================================================

describe('Module 21 — Category Schemas', () => {
  test('listSelectionCategoriesSchema accepts valid params', () => {
    const result = listSelectionCategoriesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listSelectionCategoriesSchema rejects limit > 100', () => {
    expect(() => listSelectionCategoriesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listSelectionCategoriesSchema accepts filters', () => {
    const result = listSelectionCategoriesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'pending',
      pricing_model: 'allowance',
      room: 'Kitchen',
      q: 'flooring',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('pending')
    expect(result.pricing_model).toBe('allowance')
    expect(result.room).toBe('Kitchen')
    expect(result.q).toBe('flooring')
  })

  test('createSelectionCategorySchema accepts valid category', () => {
    const result = createSelectionCategorySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Kitchen Countertops',
    })
    expect(result.name).toBe('Kitchen Countertops')
    expect(result.status).toBe('pending')
    expect(result.pricing_model).toBe('allowance')
    expect(result.allowance_amount).toBe(0)
    expect(result.sort_order).toBe(0)
    expect(result.designer_access).toBe(false)
    expect(result.lead_time_buffer_days).toBe(0)
  })

  test('createSelectionCategorySchema requires job_id and name', () => {
    expect(() => createSelectionCategorySchema.parse({})).toThrow()
    expect(() => createSelectionCategorySchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createSelectionCategorySchema rejects name > 255 chars', () => {
    expect(() => createSelectionCategorySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'A'.repeat(256),
    })).toThrow()
  })

  test('createSelectionCategorySchema accepts deadline date format', () => {
    const result = createSelectionCategorySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Flooring',
      deadline: '2026-06-15',
    })
    expect(result.deadline).toBe('2026-06-15')
  })

  test('createSelectionCategorySchema rejects invalid deadline format', () => {
    expect(() => createSelectionCategorySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Flooring',
      deadline: 'June 15',
    })).toThrow()
  })

  test('updateSelectionCategorySchema accepts partial updates', () => {
    const result = updateSelectionCategorySchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.room).toBeUndefined()
  })
})

// ============================================================================
// Option Schemas
// ============================================================================

describe('Module 21 — Option Schemas', () => {
  test('listSelectionOptionsSchema accepts valid params', () => {
    const result = listSelectionOptionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listSelectionOptionsSchema accepts filters', () => {
    const result = listSelectionOptionsSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      source: 'builder',
      q: 'oak',
    })
    expect(result.category_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.source).toBe('builder')
    expect(result.q).toBe('oak')
  })

  test('createSelectionOptionSchema accepts valid option', () => {
    const result = createSelectionOptionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Premium White Oak Hardwood',
    })
    expect(result.name).toBe('Premium White Oak Hardwood')
    expect(result.source).toBe('builder')
    expect(result.is_recommended).toBe(false)
    expect(result.unit_price).toBe(0)
    expect(result.quantity).toBe(1)
    expect(result.total_price).toBe(0)
    expect(result.lead_time_days).toBe(0)
    expect(result.sort_order).toBe(0)
  })

  test('createSelectionOptionSchema requires category_id and name', () => {
    expect(() => createSelectionOptionSchema.parse({})).toThrow()
    expect(() => createSelectionOptionSchema.parse({ category_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createSelectionOptionSchema rejects name > 255 chars', () => {
    expect(() => createSelectionOptionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'A'.repeat(256),
    })).toThrow()
  })

  test('createSelectionOptionSchema accepts full option with all fields', () => {
    const result = createSelectionOptionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Granite Countertop',
      description: 'Premium black granite from Brazil',
      vendor_id: '550e8400-e29b-41d4-a716-446655440001',
      sku: 'GRN-BLK-001',
      model_number: 'BG-Premium',
      unit_price: 85.00,
      quantity: 30,
      total_price: 2550.00,
      lead_time_days: 28,
      availability_status: 'in_stock',
      source: 'designer',
      is_recommended: true,
      sort_order: 1,
    })
    expect(result.unit_price).toBe(85.00)
    expect(result.source).toBe('designer')
    expect(result.is_recommended).toBe(true)
    expect(result.lead_time_days).toBe(28)
  })

  test('updateSelectionOptionSchema accepts partial updates', () => {
    const result = updateSelectionOptionSchema.parse({ unit_price: 95.00, is_recommended: true })
    expect(result.unit_price).toBe(95.00)
    expect(result.is_recommended).toBe(true)
    expect(result.name).toBeUndefined()
  })
})

// ============================================================================
// Selection Schemas
// ============================================================================

describe('Module 21 — Selection Schemas', () => {
  test('listSelectionsSchema accepts valid params', () => {
    const result = listSelectionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listSelectionsSchema rejects limit > 100', () => {
    expect(() => listSelectionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listSelectionsSchema accepts filters', () => {
    const result = listSelectionsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      status: 'selected',
      room: 'Kitchen',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.category_id).toBe('550e8400-e29b-41d4-a716-446655440001')
    expect(result.status).toBe('selected')
    expect(result.room).toBe('Kitchen')
  })

  test('createSelectionSchema accepts valid selection', () => {
    const result = createSelectionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      option_id: '550e8400-e29b-41d4-a716-446655440001',
      job_id: '550e8400-e29b-41d4-a716-446655440002',
    })
    expect(result.status).toBe('selected')
    expect(result.category_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.option_id).toBe('550e8400-e29b-41d4-a716-446655440001')
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440002')
  })

  test('createSelectionSchema requires category_id, option_id, and job_id', () => {
    expect(() => createSelectionSchema.parse({})).toThrow()
    expect(() => createSelectionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createSelectionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      option_id: '550e8400-e29b-41d4-a716-446655440001',
    })).toThrow()
  })

  test('createSelectionSchema accepts optional room and change_reason', () => {
    const result = createSelectionSchema.parse({
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      option_id: '550e8400-e29b-41d4-a716-446655440001',
      job_id: '550e8400-e29b-41d4-a716-446655440002',
      room: 'Master Bath',
      change_reason: 'Client prefers marble over granite',
    })
    expect(result.room).toBe('Master Bath')
    expect(result.change_reason).toBe('Client prefers marble over granite')
  })

  test('updateSelectionSchema accepts partial updates', () => {
    const result = updateSelectionSchema.parse({ status: 'approved' })
    expect(result.status).toBe('approved')
    expect(result.option_id).toBeUndefined()
  })

  test('updateSelectionSchema rejects invalid status', () => {
    expect(() => updateSelectionSchema.parse({ status: 'invalid_status' })).toThrow()
  })
})

// ============================================================================
// History Schema
// ============================================================================

describe('Module 21 — History Schema', () => {
  test('listSelectionHistorySchema accepts valid params with defaults', () => {
    const result = listSelectionHistorySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listSelectionHistorySchema accepts custom page and limit', () => {
    const result = listSelectionHistorySchema.parse({ page: '2', limit: '10' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
  })

  test('listSelectionHistorySchema rejects limit > 100', () => {
    expect(() => listSelectionHistorySchema.parse({ limit: 200 })).toThrow()
  })
})
