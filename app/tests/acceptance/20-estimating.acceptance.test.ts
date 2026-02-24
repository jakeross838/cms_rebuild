/**
 * Module 20 — Estimating Engine Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 20 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  EstimateStatus,
  EstimateType,
  ContractType,
  MarkupType,
  LineItemType,
  AiConfidence,
  Estimate,
  EstimateSection,
  EstimateLineItem,
  Assembly,
  AssemblyItem,
  EstimateVersion,
} from '@/types/estimating'

import {
  ESTIMATE_STATUSES,
  ESTIMATE_TYPES,
  CONTRACT_TYPES,
  MARKUP_TYPES,
  LINE_ITEM_TYPES,
  AI_CONFIDENCE_LEVELS,
} from '@/types/estimating'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  estimateStatusEnum,
  estimateTypeEnum,
  contractTypeEnum,
  markupTypeEnum,
  lineItemTypeEnum,
  aiConfidenceEnum,
  listEstimatesSchema,
  createEstimateSchema,
  updateEstimateSchema,
  listEstimateSectionsSchema,
  createEstimateSectionSchema,
  updateEstimateSectionSchema,
  listEstimateLineItemsSchema,
  createEstimateLineItemSchema,
  updateEstimateLineItemSchema,
  listEstimateVersionsSchema,
  createEstimateVersionSchema,
  listAssembliesSchema,
  createAssemblySchema,
  updateAssemblySchema,
  listAssemblyItemsSchema,
  createAssemblyItemSchema,
  updateAssemblyItemSchema,
} from '@/lib/validation/schemas/estimating'

// ============================================================================
// Type System
// ============================================================================

describe('Module 20 — Estimating Types', () => {
  test('EstimateStatus has 6 values', () => {
    const statuses: EstimateStatus[] = [
      'draft', 'pending_review', 'approved', 'rejected', 'revised', 'archived',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('EstimateType has 6 values', () => {
    const types: EstimateType[] = [
      'lump_sum', 'cost_plus', 'time_and_materials', 'unit_price', 'gmp', 'design_build',
    ]
    expect(types).toHaveLength(6)
  })

  test('ContractType has 4 values', () => {
    const types: ContractType[] = ['nte', 'gmp', 'cost_plus', 'fixed']
    expect(types).toHaveLength(4)
  })

  test('MarkupType has 4 values', () => {
    const types: MarkupType[] = ['flat', 'tiered', 'per_line', 'built_in']
    expect(types).toHaveLength(4)
  })

  test('LineItemType has 4 values', () => {
    const types: LineItemType[] = ['line', 'allowance', 'exclusion', 'alternate']
    expect(types).toHaveLength(4)
  })

  test('AiConfidence has 3 values', () => {
    const levels: AiConfidence[] = ['high', 'medium', 'low']
    expect(levels).toHaveLength(3)
  })

  test('Estimate interface has all required fields', () => {
    const est: Estimate = {
      id: '1', company_id: '1', job_id: '1', name: 'Main Estimate',
      description: 'Full build estimate', status: 'draft', estimate_type: 'lump_sum',
      contract_type: 'fixed', version: 1, parent_version_id: null,
      markup_type: 'flat', markup_pct: 10, overhead_pct: 5, profit_pct: 8,
      subtotal: 500000, total: 575000, valid_until: '2026-06-01',
      notes: null, created_by: '1', approved_by: null, approved_at: null,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(est.name).toBe('Main Estimate')
    expect(est.status).toBe('draft')
    expect(est.estimate_type).toBe('lump_sum')
    expect(est.subtotal).toBe(500000)
  })

  test('EstimateSection interface has all required fields', () => {
    const section: EstimateSection = {
      id: '1', estimate_id: '1', company_id: '1', parent_id: null,
      name: 'Foundation', sort_order: 1, subtotal: 50000,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(section.name).toBe('Foundation')
    expect(section.sort_order).toBe(1)
  })

  test('EstimateLineItem interface has all required fields', () => {
    const item: EstimateLineItem = {
      id: '1', estimate_id: '1', company_id: '1', section_id: '1',
      cost_code_id: null, assembly_id: null, description: 'Concrete footing',
      item_type: 'line', quantity: 120, unit: 'lf',
      unit_cost: 45.50, markup_pct: 10, total: 6006,
      alt_group: null, notes: null, sort_order: 0,
      ai_suggested: false, ai_confidence: null,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(item.description).toBe('Concrete footing')
    expect(item.item_type).toBe('line')
    expect(item.quantity).toBe(120)
  })

  test('Assembly interface has all required fields', () => {
    const asm: Assembly = {
      id: '1', company_id: '1', name: 'Exterior Wall Assembly',
      description: 'Standard 2x6 exterior wall', category: 'Framing',
      parameter_unit: 'lf', is_active: true,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(asm.name).toBe('Exterior Wall Assembly')
    expect(asm.category).toBe('Framing')
    expect(asm.is_active).toBe(true)
  })

  test('AssemblyItem interface has all required fields', () => {
    const item: AssemblyItem = {
      id: '1', assembly_id: '1', company_id: '1', cost_code_id: null,
      description: 'Framing labor', qty_per_unit: 0.5,
      unit: 'hour', unit_cost: 65.00, sort_order: 0,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(item.description).toBe('Framing labor')
    expect(item.qty_per_unit).toBe(0.5)
    expect(item.unit_cost).toBe(65.00)
  })

  test('EstimateVersion interface has all required fields', () => {
    const ver: EstimateVersion = {
      id: '1', estimate_id: '1', company_id: '1', version_number: 1,
      snapshot_json: { total: 500000 }, change_summary: 'Initial version',
      created_by: '1', created_at: '2026-01-15',
    }
    expect(ver.version_number).toBe(1)
    expect(ver.change_summary).toBe('Initial version')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 20 — Constants', () => {
  test('ESTIMATE_STATUSES has 6 entries with value and label', () => {
    expect(ESTIMATE_STATUSES).toHaveLength(6)
    for (const s of ESTIMATE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('ESTIMATE_TYPES has 6 entries with value and label', () => {
    expect(ESTIMATE_TYPES).toHaveLength(6)
    for (const t of ESTIMATE_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('CONTRACT_TYPES has 4 entries with value and label', () => {
    expect(CONTRACT_TYPES).toHaveLength(4)
    const values = CONTRACT_TYPES.map((c) => c.value)
    expect(values).toContain('nte')
    expect(values).toContain('gmp')
    expect(values).toContain('cost_plus')
    expect(values).toContain('fixed')
  })

  test('MARKUP_TYPES has 4 entries with value and label', () => {
    expect(MARKUP_TYPES).toHaveLength(4)
    const values = MARKUP_TYPES.map((m) => m.value)
    expect(values).toContain('flat')
    expect(values).toContain('tiered')
    expect(values).toContain('per_line')
    expect(values).toContain('built_in')
  })

  test('LINE_ITEM_TYPES has 4 entries', () => {
    expect(LINE_ITEM_TYPES).toHaveLength(4)
    const values = LINE_ITEM_TYPES.map((l) => l.value)
    expect(values).toContain('line')
    expect(values).toContain('allowance')
    expect(values).toContain('exclusion')
    expect(values).toContain('alternate')
  })

  test('AI_CONFIDENCE_LEVELS has 3 entries', () => {
    expect(AI_CONFIDENCE_LEVELS).toHaveLength(3)
    const values = AI_CONFIDENCE_LEVELS.map((a) => a.value)
    expect(values).toContain('high')
    expect(values).toContain('medium')
    expect(values).toContain('low')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 20 — Enum Schemas', () => {
  test('estimateStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'pending_review', 'approved', 'rejected', 'revised', 'archived']) {
      expect(estimateStatusEnum.parse(s)).toBe(s)
    }
  })

  test('estimateStatusEnum rejects invalid status', () => {
    expect(() => estimateStatusEnum.parse('cancelled')).toThrow()
  })

  test('estimateTypeEnum accepts all 6 types', () => {
    for (const t of ['lump_sum', 'cost_plus', 'time_and_materials', 'unit_price', 'gmp', 'design_build']) {
      expect(estimateTypeEnum.parse(t)).toBe(t)
    }
  })

  test('estimateTypeEnum rejects invalid type', () => {
    expect(() => estimateTypeEnum.parse('unknown')).toThrow()
  })

  test('contractTypeEnum accepts all 4 types', () => {
    for (const t of ['nte', 'gmp', 'cost_plus', 'fixed']) {
      expect(contractTypeEnum.parse(t)).toBe(t)
    }
  })

  test('markupTypeEnum accepts all 4 types', () => {
    for (const t of ['flat', 'tiered', 'per_line', 'built_in']) {
      expect(markupTypeEnum.parse(t)).toBe(t)
    }
  })

  test('lineItemTypeEnum accepts all 4 types', () => {
    for (const t of ['line', 'allowance', 'exclusion', 'alternate']) {
      expect(lineItemTypeEnum.parse(t)).toBe(t)
    }
  })

  test('aiConfidenceEnum accepts all 3 levels', () => {
    for (const l of ['high', 'medium', 'low']) {
      expect(aiConfidenceEnum.parse(l)).toBe(l)
    }
  })
})

// ============================================================================
// Estimate Schemas
// ============================================================================

describe('Module 20 — Estimate Schemas', () => {
  test('listEstimatesSchema accepts valid params', () => {
    const result = listEstimatesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listEstimatesSchema rejects limit > 100', () => {
    expect(() => listEstimatesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listEstimatesSchema accepts filters', () => {
    const result = listEstimatesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'draft',
      estimate_type: 'lump_sum',
      q: 'kitchen',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('draft')
    expect(result.estimate_type).toBe('lump_sum')
    expect(result.q).toBe('kitchen')
  })

  test('createEstimateSchema accepts valid estimate', () => {
    const result = createEstimateSchema.parse({
      name: 'Main Build Estimate',
    })
    expect(result.name).toBe('Main Build Estimate')
    expect(result.status).toBe('draft')
    expect(result.estimate_type).toBe('lump_sum')
    expect(result.markup_pct).toBe(0)
    expect(result.overhead_pct).toBe(0)
    expect(result.profit_pct).toBe(0)
  })

  test('createEstimateSchema requires name', () => {
    expect(() => createEstimateSchema.parse({})).toThrow()
  })

  test('createEstimateSchema rejects name > 255 chars', () => {
    expect(() => createEstimateSchema.parse({
      name: 'A'.repeat(256),
    })).toThrow()
  })

  test('createEstimateSchema validates valid_until format', () => {
    const result = createEstimateSchema.parse({
      name: 'Test',
      valid_until: '2026-06-01',
    })
    expect(result.valid_until).toBe('2026-06-01')
  })

  test('createEstimateSchema rejects invalid valid_until format', () => {
    expect(() => createEstimateSchema.parse({
      name: 'Test',
      valid_until: 'June 1 2026',
    })).toThrow()
  })

  test('createEstimateSchema accepts all optional fields', () => {
    const result = createEstimateSchema.parse({
      name: 'Full Estimate',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Full description',
      status: 'pending_review',
      estimate_type: 'gmp',
      contract_type: 'gmp',
      markup_type: 'tiered',
      markup_pct: 15,
      overhead_pct: 8,
      profit_pct: 10,
      valid_until: '2026-12-31',
      notes: 'Some notes',
    })
    expect(result.estimate_type).toBe('gmp')
    expect(result.contract_type).toBe('gmp')
    expect(result.markup_type).toBe('tiered')
    expect(result.markup_pct).toBe(15)
  })

  test('updateEstimateSchema accepts partial updates', () => {
    const result = updateEstimateSchema.parse({ name: 'Updated name' })
    expect(result.name).toBe('Updated name')
    expect(result.status).toBeUndefined()
  })
})

// ============================================================================
// Section Schemas
// ============================================================================

describe('Module 20 — Section Schemas', () => {
  test('listEstimateSectionsSchema accepts valid params with defaults', () => {
    const result = listEstimateSectionsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createEstimateSectionSchema accepts valid section', () => {
    const result = createEstimateSectionSchema.parse({
      name: 'Foundation',
    })
    expect(result.name).toBe('Foundation')
    expect(result.sort_order).toBe(0)
  })

  test('createEstimateSectionSchema requires name', () => {
    expect(() => createEstimateSectionSchema.parse({})).toThrow()
  })

  test('updateEstimateSectionSchema accepts partial updates', () => {
    const result = updateEstimateSectionSchema.parse({ name: 'Framing' })
    expect(result.name).toBe('Framing')
    expect(result.sort_order).toBeUndefined()
  })
})

// ============================================================================
// Line Item Schemas
// ============================================================================

describe('Module 20 — Line Item Schemas', () => {
  test('listEstimateLineItemsSchema accepts valid params with defaults', () => {
    const result = listEstimateLineItemsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listEstimateLineItemsSchema accepts filters', () => {
    const result = listEstimateLineItemsSchema.parse({
      section_id: '550e8400-e29b-41d4-a716-446655440000',
      item_type: 'allowance',
    })
    expect(result.section_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.item_type).toBe('allowance')
  })

  test('createEstimateLineItemSchema accepts valid line item', () => {
    const result = createEstimateLineItemSchema.parse({
      description: 'Concrete footing',
      quantity: 120,
      unit: 'lf',
      unit_cost: 45.50,
      total: 5460,
    })
    expect(result.description).toBe('Concrete footing')
    expect(result.quantity).toBe(120)
    expect(result.item_type).toBe('line')
  })

  test('createEstimateLineItemSchema requires description', () => {
    expect(() => createEstimateLineItemSchema.parse({})).toThrow()
  })

  test('createEstimateLineItemSchema has correct defaults', () => {
    const result = createEstimateLineItemSchema.parse({ description: 'Test item' })
    expect(result.item_type).toBe('line')
    expect(result.quantity).toBe(1)
    expect(result.unit).toBe('each')
    expect(result.unit_cost).toBe(0)
    expect(result.markup_pct).toBe(0)
    expect(result.total).toBe(0)
    expect(result.sort_order).toBe(0)
    expect(result.ai_suggested).toBe(false)
  })

  test('createEstimateLineItemSchema accepts allowance type', () => {
    const result = createEstimateLineItemSchema.parse({
      description: 'Plumbing fixtures allowance',
      item_type: 'allowance',
      total: 15000,
    })
    expect(result.item_type).toBe('allowance')
  })

  test('createEstimateLineItemSchema accepts exclusion type', () => {
    const result = createEstimateLineItemSchema.parse({
      description: 'Landscaping NOT included',
      item_type: 'exclusion',
      total: 0,
    })
    expect(result.item_type).toBe('exclusion')
  })

  test('updateEstimateLineItemSchema accepts partial updates', () => {
    const result = updateEstimateLineItemSchema.parse({ quantity: 200, unit_cost: 50 })
    expect(result.quantity).toBe(200)
    expect(result.unit_cost).toBe(50)
    expect(result.description).toBeUndefined()
  })
})

// ============================================================================
// Version Schemas
// ============================================================================

describe('Module 20 — Version Schemas', () => {
  test('listEstimateVersionsSchema accepts valid params', () => {
    const result = listEstimateVersionsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('createEstimateVersionSchema accepts valid version', () => {
    const result = createEstimateVersionSchema.parse({
      version_number: 1,
      snapshot_json: { total: 500000, lines: [] },
      change_summary: 'Initial version',
    })
    expect(result.version_number).toBe(1)
    expect(result.change_summary).toBe('Initial version')
  })

  test('createEstimateVersionSchema requires version_number', () => {
    expect(() => createEstimateVersionSchema.parse({})).toThrow()
  })

  test('createEstimateVersionSchema defaults snapshot_json to empty object', () => {
    const result = createEstimateVersionSchema.parse({ version_number: 2 })
    expect(result.snapshot_json).toEqual({})
  })
})

// ============================================================================
// Assembly Schemas
// ============================================================================

describe('Module 20 — Assembly Schemas', () => {
  test('listAssembliesSchema accepts valid params', () => {
    const result = listAssembliesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listAssembliesSchema rejects limit > 100', () => {
    expect(() => listAssembliesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listAssembliesSchema accepts filters', () => {
    const result = listAssembliesSchema.parse({
      category: 'Framing',
      is_active: 'true',
      q: 'wall',
    })
    expect(result.category).toBe('Framing')
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('wall')
  })

  test('createAssemblySchema accepts valid assembly', () => {
    const result = createAssemblySchema.parse({
      name: 'Exterior Wall Assembly',
      description: 'Standard 2x6 exterior wall',
      category: 'Framing',
      parameter_unit: 'lf',
    })
    expect(result.name).toBe('Exterior Wall Assembly')
    expect(result.is_active).toBe(true)
  })

  test('createAssemblySchema requires name', () => {
    expect(() => createAssemblySchema.parse({})).toThrow()
  })

  test('createAssemblySchema rejects name > 255 chars', () => {
    expect(() => createAssemblySchema.parse({
      name: 'A'.repeat(256),
    })).toThrow()
  })

  test('updateAssemblySchema accepts partial updates', () => {
    const result = updateAssemblySchema.parse({ name: 'Updated Assembly', is_active: false })
    expect(result.name).toBe('Updated Assembly')
    expect(result.is_active).toBe(false)
  })
})

// ============================================================================
// Assembly Item Schemas
// ============================================================================

describe('Module 20 — Assembly Item Schemas', () => {
  test('listAssemblyItemsSchema accepts valid params with defaults', () => {
    const result = listAssemblyItemsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createAssemblyItemSchema accepts valid item', () => {
    const result = createAssemblyItemSchema.parse({
      description: 'Framing labor',
      qty_per_unit: 0.5,
      unit: 'hour',
      unit_cost: 65.00,
    })
    expect(result.description).toBe('Framing labor')
    expect(result.qty_per_unit).toBe(0.5)
    expect(result.unit_cost).toBe(65.00)
  })

  test('createAssemblyItemSchema requires description', () => {
    expect(() => createAssemblyItemSchema.parse({})).toThrow()
  })

  test('createAssemblyItemSchema has correct defaults', () => {
    const result = createAssemblyItemSchema.parse({ description: 'Test' })
    expect(result.qty_per_unit).toBe(1)
    expect(result.unit).toBe('each')
    expect(result.unit_cost).toBe(0)
    expect(result.sort_order).toBe(0)
  })

  test('updateAssemblyItemSchema accepts partial updates', () => {
    const result = updateAssemblyItemSchema.parse({ qty_per_unit: 2.5, unit_cost: 100 })
    expect(result.qty_per_unit).toBe(2.5)
    expect(result.unit_cost).toBe(100)
    expect(result.description).toBeUndefined()
  })
})
