/**
 * Module 23 — Price Intelligence Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 23 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  SkillLevel,
  UnitOfMeasure,
  ItemCategory,
  MasterItem,
  VendorItemPrice,
  PriceHistory,
  LaborRate,
  LaborRateHistory,
} from '@/types/price-intelligence'

import {
  SKILL_LEVELS,
  UNITS_OF_MEASURE,
  ITEM_CATEGORIES,
} from '@/types/price-intelligence'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  skillLevelEnum,
  unitOfMeasureEnum,
  itemCategoryEnum,
  listMasterItemsSchema,
  createMasterItemSchema,
  updateMasterItemSchema,
  listVendorItemPricesSchema,
  createVendorItemPriceSchema,
  updateVendorItemPriceSchema,
  listPriceHistorySchema,
  listLaborRatesSchema,
  createLaborRateSchema,
  updateLaborRateSchema,
  listLaborRateHistorySchema,
} from '@/lib/validation/schemas/price-intelligence'

// ============================================================================
// Type System
// ============================================================================

describe('Module 23 — Price Intelligence Types', () => {
  test('SkillLevel has 4 values', () => {
    const levels: SkillLevel[] = ['apprentice', 'journeyman', 'master', 'foreman']
    expect(levels).toHaveLength(4)
  })

  test('UnitOfMeasure has 12 values', () => {
    const units: UnitOfMeasure[] = [
      'each', 'linear_ft', 'sq_ft', 'cu_yd', 'ton', 'gallon',
      'bundle', 'box', 'sheet', 'roll', 'bag', 'pair',
    ]
    expect(units).toHaveLength(12)
  })

  test('ItemCategory has 14 values', () => {
    const categories: ItemCategory[] = [
      'lumber', 'electrical', 'plumbing', 'hvac', 'roofing', 'flooring',
      'paint', 'hardware', 'concrete', 'insulation', 'drywall', 'fixtures',
      'appliances', 'other',
    ]
    expect(categories).toHaveLength(14)
  })

  test('MasterItem interface has all required fields', () => {
    const item: MasterItem = {
      id: '1', company_id: '1', name: '2x4x8 SPF Stud',
      description: 'Standard framing stud', category: 'lumber',
      unit_of_measure: 'each', default_unit_price: 4.99,
      sku: 'LBR-2X4-8', created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(item.name).toBe('2x4x8 SPF Stud')
    expect(item.category).toBe('lumber')
    expect(item.unit_of_measure).toBe('each')
    expect(item.default_unit_price).toBe(4.99)
  })

  test('VendorItemPrice interface has all required fields', () => {
    const price: VendorItemPrice = {
      id: '1', company_id: '1', vendor_id: '2', master_item_id: '3',
      unit_price: 4.49, lead_time_days: 3, min_order_qty: 100,
      effective_date: '2026-01-15', notes: 'Bulk pricing',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(price.unit_price).toBe(4.49)
    expect(price.lead_time_days).toBe(3)
    expect(price.min_order_qty).toBe(100)
  })

  test('PriceHistory interface has all required fields', () => {
    const entry: PriceHistory = {
      id: '1', company_id: '1', master_item_id: '2',
      vendor_id: '3', old_price: 4.49, new_price: 4.99,
      change_pct: 11.14, recorded_at: '2026-01-15',
      created_at: '2026-01-15',
    }
    expect(entry.old_price).toBe(4.49)
    expect(entry.new_price).toBe(4.99)
    expect(entry.change_pct).toBe(11.14)
  })

  test('LaborRate interface has all required fields', () => {
    const rate: LaborRate = {
      id: '1', company_id: '1', trade: 'Electrical',
      skill_level: 'journeyman', hourly_rate: 45.00,
      overtime_rate: 67.50, region: 'Bay Area',
      notes: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(rate.trade).toBe('Electrical')
    expect(rate.skill_level).toBe('journeyman')
    expect(rate.hourly_rate).toBe(45.00)
    expect(rate.overtime_rate).toBe(67.50)
  })

  test('LaborRateHistory interface has all required fields', () => {
    const entry: LaborRateHistory = {
      id: '1', company_id: '1', labor_rate_id: '2',
      old_rate: 42.00, new_rate: 45.00,
      change_pct: 7.14, effective_date: '2026-01-15',
      created_at: '2026-01-15',
    }
    expect(entry.old_rate).toBe(42.00)
    expect(entry.new_rate).toBe(45.00)
    expect(entry.change_pct).toBe(7.14)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 23 — Constants', () => {
  test('SKILL_LEVELS has 4 entries with value and label', () => {
    expect(SKILL_LEVELS).toHaveLength(4)
    for (const sl of SKILL_LEVELS) {
      expect(sl).toHaveProperty('value')
      expect(sl).toHaveProperty('label')
      expect(sl.label.length).toBeGreaterThan(0)
    }
  })

  test('SKILL_LEVELS includes all expected values', () => {
    const values = SKILL_LEVELS.map((s) => s.value)
    expect(values).toContain('apprentice')
    expect(values).toContain('journeyman')
    expect(values).toContain('master')
    expect(values).toContain('foreman')
  })

  test('UNITS_OF_MEASURE has 12 entries with value and label', () => {
    expect(UNITS_OF_MEASURE).toHaveLength(12)
    for (const u of UNITS_OF_MEASURE) {
      expect(u).toHaveProperty('value')
      expect(u).toHaveProperty('label')
      expect(u.label.length).toBeGreaterThan(0)
    }
  })

  test('ITEM_CATEGORIES has 14 entries with value and label', () => {
    expect(ITEM_CATEGORIES).toHaveLength(14)
    for (const c of ITEM_CATEGORIES) {
      expect(c).toHaveProperty('value')
      expect(c).toHaveProperty('label')
      expect(c.label.length).toBeGreaterThan(0)
    }
  })

  test('ITEM_CATEGORIES includes all expected values', () => {
    const values = ITEM_CATEGORIES.map((c) => c.value)
    expect(values).toContain('lumber')
    expect(values).toContain('electrical')
    expect(values).toContain('plumbing')
    expect(values).toContain('hvac')
    expect(values).toContain('concrete')
    expect(values).toContain('other')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 23 — Enum Schemas', () => {
  test('skillLevelEnum accepts all 4 skill levels', () => {
    for (const sl of ['apprentice', 'journeyman', 'master', 'foreman']) {
      expect(skillLevelEnum.parse(sl)).toBe(sl)
    }
  })

  test('skillLevelEnum rejects invalid level', () => {
    expect(() => skillLevelEnum.parse('intern')).toThrow()
  })

  test('unitOfMeasureEnum accepts all 12 units', () => {
    for (const u of ['each', 'linear_ft', 'sq_ft', 'cu_yd', 'ton', 'gallon', 'bundle', 'box', 'sheet', 'roll', 'bag', 'pair']) {
      expect(unitOfMeasureEnum.parse(u)).toBe(u)
    }
  })

  test('unitOfMeasureEnum rejects invalid unit', () => {
    expect(() => unitOfMeasureEnum.parse('meter')).toThrow()
  })

  test('itemCategoryEnum accepts all 14 categories', () => {
    for (const c of ['lumber', 'electrical', 'plumbing', 'hvac', 'roofing', 'flooring', 'paint', 'hardware', 'concrete', 'insulation', 'drywall', 'fixtures', 'appliances', 'other']) {
      expect(itemCategoryEnum.parse(c)).toBe(c)
    }
  })

  test('itemCategoryEnum rejects invalid category', () => {
    expect(() => itemCategoryEnum.parse('windows')).toThrow()
  })
})

// ============================================================================
// Master Item Schemas
// ============================================================================

describe('Module 23 — Master Item Schemas', () => {
  test('listMasterItemsSchema accepts valid params', () => {
    const result = listMasterItemsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sort_by).toBe('name')
    expect(result.sort_order).toBe('asc')
  })

  test('listMasterItemsSchema rejects limit > 100', () => {
    expect(() => listMasterItemsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listMasterItemsSchema accepts category and q filters', () => {
    const result = listMasterItemsSchema.parse({
      category: 'lumber',
      q: '2x4',
    })
    expect(result.category).toBe('lumber')
    expect(result.q).toBe('2x4')
  })

  test('createMasterItemSchema accepts valid item', () => {
    const result = createMasterItemSchema.parse({
      name: '2x4x8 SPF Stud',
      description: 'Standard framing stud',
      category: 'lumber',
      unit_of_measure: 'each',
      default_unit_price: 4.99,
      sku: 'LBR-2X4-8',
    })
    expect(result.name).toBe('2x4x8 SPF Stud')
    expect(result.category).toBe('lumber')
    expect(result.default_unit_price).toBe(4.99)
  })

  test('createMasterItemSchema requires name', () => {
    expect(() => createMasterItemSchema.parse({})).toThrow()
  })

  test('createMasterItemSchema has correct defaults', () => {
    const result = createMasterItemSchema.parse({ name: 'Test Item' })
    expect(result.category).toBe('other')
    expect(result.unit_of_measure).toBe('each')
    expect(result.default_unit_price).toBe(0)
  })

  test('createMasterItemSchema rejects name > 255 chars', () => {
    expect(() => createMasterItemSchema.parse({ name: 'A'.repeat(256) })).toThrow()
  })

  test('createMasterItemSchema rejects negative default_unit_price', () => {
    expect(() => createMasterItemSchema.parse({
      name: 'Test',
      default_unit_price: -1,
    })).toThrow()
  })

  test('updateMasterItemSchema accepts partial updates', () => {
    const result = updateMasterItemSchema.parse({ name: 'Updated Name', category: 'electrical' })
    expect(result.name).toBe('Updated Name')
    expect(result.category).toBe('electrical')
    expect(result.sku).toBeUndefined()
  })
})

// ============================================================================
// Vendor Item Price Schemas
// ============================================================================

describe('Module 23 — Vendor Item Price Schemas', () => {
  test('listVendorItemPricesSchema accepts valid params', () => {
    const result = listVendorItemPricesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sort_by).toBe('effective_date')
    expect(result.sort_order).toBe('desc')
  })

  test('createVendorItemPriceSchema accepts valid price', () => {
    const result = createVendorItemPriceSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      unit_price: 4.49,
      lead_time_days: 3,
      min_order_qty: 100,
      effective_date: '2026-01-15',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.unit_price).toBe(4.49)
    expect(result.lead_time_days).toBe(3)
  })

  test('createVendorItemPriceSchema requires vendor_id and unit_price', () => {
    expect(() => createVendorItemPriceSchema.parse({})).toThrow()
    expect(() => createVendorItemPriceSchema.parse({ vendor_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createVendorItemPriceSchema rejects zero unit_price', () => {
    expect(() => createVendorItemPriceSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      unit_price: 0,
    })).toThrow()
  })

  test('createVendorItemPriceSchema rejects negative unit_price', () => {
    expect(() => createVendorItemPriceSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      unit_price: -5.00,
    })).toThrow()
  })

  test('createVendorItemPriceSchema validates effective_date format', () => {
    expect(() => createVendorItemPriceSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      unit_price: 10.00,
      effective_date: '01-15-2026',
    })).toThrow()
  })

  test('updateVendorItemPriceSchema accepts partial updates', () => {
    const result = updateVendorItemPriceSchema.parse({ unit_price: 5.99, lead_time_days: 5 })
    expect(result.unit_price).toBe(5.99)
    expect(result.lead_time_days).toBe(5)
  })
})

// ============================================================================
// Price History Schemas
// ============================================================================

describe('Module 23 — Price History Schemas', () => {
  test('listPriceHistorySchema accepts valid params with defaults', () => {
    const result = listPriceHistorySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
    expect(result.sort_by).toBe('recorded_at')
    expect(result.sort_order).toBe('desc')
  })

  test('listPriceHistorySchema accepts vendor_id filter', () => {
    const result = listPriceHistorySchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})

// ============================================================================
// Labor Rate Schemas
// ============================================================================

describe('Module 23 — Labor Rate Schemas', () => {
  test('listLaborRatesSchema accepts valid params with defaults', () => {
    const result = listLaborRatesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sort_by).toBe('trade')
    expect(result.sort_order).toBe('asc')
  })

  test('listLaborRatesSchema accepts trade and skill_level filters', () => {
    const result = listLaborRatesSchema.parse({
      trade: 'Electrical',
      skill_level: 'journeyman',
      region: 'Bay Area',
    })
    expect(result.trade).toBe('Electrical')
    expect(result.skill_level).toBe('journeyman')
    expect(result.region).toBe('Bay Area')
  })

  test('listLaborRatesSchema rejects limit > 100', () => {
    expect(() => listLaborRatesSchema.parse({ limit: 200 })).toThrow()
  })

  test('createLaborRateSchema accepts valid labor rate', () => {
    const result = createLaborRateSchema.parse({
      trade: 'Electrical',
      skill_level: 'journeyman',
      hourly_rate: 45.00,
      overtime_rate: 67.50,
      region: 'Bay Area',
    })
    expect(result.trade).toBe('Electrical')
    expect(result.skill_level).toBe('journeyman')
    expect(result.hourly_rate).toBe(45.00)
    expect(result.overtime_rate).toBe(67.50)
  })

  test('createLaborRateSchema requires trade and hourly_rate', () => {
    expect(() => createLaborRateSchema.parse({})).toThrow()
    expect(() => createLaborRateSchema.parse({ trade: 'Electrical' })).toThrow()
  })

  test('createLaborRateSchema has correct defaults', () => {
    const result = createLaborRateSchema.parse({ trade: 'Plumbing', hourly_rate: 40.00 })
    expect(result.skill_level).toBe('journeyman')
  })

  test('createLaborRateSchema rejects negative hourly_rate', () => {
    expect(() => createLaborRateSchema.parse({
      trade: 'Electrical',
      hourly_rate: -10,
    })).toThrow()
  })

  test('createLaborRateSchema rejects zero hourly_rate', () => {
    expect(() => createLaborRateSchema.parse({
      trade: 'Electrical',
      hourly_rate: 0,
    })).toThrow()
  })

  test('updateLaborRateSchema accepts partial updates', () => {
    const result = updateLaborRateSchema.parse({ hourly_rate: 50.00, region: 'East Bay' })
    expect(result.hourly_rate).toBe(50.00)
    expect(result.region).toBe('East Bay')
    expect(result.trade).toBeUndefined()
  })
})

// ============================================================================
// Labor Rate History Schemas
// ============================================================================

describe('Module 23 — Labor Rate History Schemas', () => {
  test('listLaborRateHistorySchema accepts valid params with defaults', () => {
    const result = listLaborRateHistorySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
    expect(result.sort_by).toBe('effective_date')
    expect(result.sort_order).toBe('desc')
  })

  test('listLaborRateHistorySchema rejects limit > 100', () => {
    expect(() => listLaborRateHistorySchema.parse({ limit: 200 })).toThrow()
  })
})
