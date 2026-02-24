/**
 * Module 52 — Inventory & Materials Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 52 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  LocationType,
  TransactionType,
  RequestStatus,
  RequestPriority,
  InventoryItem,
  InventoryLocation,
  InventoryStock,
  InventoryTransaction,
  MaterialRequest,
  MaterialRequestItem,
} from '@/types/inventory'

import {
  LOCATION_TYPES,
  TRANSACTION_TYPES,
  REQUEST_STATUSES,
  REQUEST_PRIORITIES,
} from '@/types/inventory'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  locationTypeEnum,
  transactionTypeEnum,
  requestStatusEnum,
  requestPriorityEnum,
  listInventoryItemsSchema,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  listInventoryLocationsSchema,
  createInventoryLocationSchema,
  updateInventoryLocationSchema,
  listInventoryStockSchema,
  listInventoryTransactionsSchema,
  createInventoryTransactionSchema,
  listMaterialRequestsSchema,
  createMaterialRequestSchema,
  updateMaterialRequestSchema,
} from '@/lib/validation/schemas/inventory'

// ============================================================================
// Type System
// ============================================================================

describe('Module 52 — Inventory Types', () => {
  test('LocationType has 4 values', () => {
    const types: LocationType[] = ['warehouse', 'job_site', 'vehicle', 'other']
    expect(types).toHaveLength(4)
  })

  test('TransactionType has 5 values', () => {
    const types: TransactionType[] = ['receive', 'transfer', 'consume', 'adjust', 'return']
    expect(types).toHaveLength(5)
  })

  test('RequestStatus has 6 values', () => {
    const statuses: RequestStatus[] = ['draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected']
    expect(statuses).toHaveLength(6)
  })

  test('RequestPriority has 4 values', () => {
    const priorities: RequestPriority[] = ['low', 'normal', 'high', 'urgent']
    expect(priorities).toHaveLength(4)
  })

  test('InventoryItem interface has all required fields', () => {
    const item: InventoryItem = {
      id: '1', company_id: '1', name: '2x4 Lumber', sku: 'LBR-2X4',
      description: 'Standard framing lumber', category: 'Lumber',
      unit_of_measure: 'each', unit_cost: 5.99, reorder_point: 100,
      reorder_quantity: 500, is_active: true, created_at: '2026-01-15',
      updated_at: '2026-01-15', deleted_at: null,
    }
    expect(item.name).toBe('2x4 Lumber')
    expect(item.sku).toBe('LBR-2X4')
    expect(item.unit_cost).toBe(5.99)
    expect(item.deleted_at).toBeNull()
  })

  test('InventoryLocation interface has all required fields', () => {
    const loc: InventoryLocation = {
      id: '1', company_id: '1', name: 'Main Warehouse',
      location_type: 'warehouse', address: '123 Industrial Ave',
      job_id: null, is_active: true,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(loc.location_type).toBe('warehouse')
    expect(loc.is_active).toBe(true)
  })

  test('InventoryStock interface has all required fields', () => {
    const stock: InventoryStock = {
      id: '1', company_id: '1', item_id: '2', location_id: '3',
      quantity_on_hand: 250, quantity_reserved: 50, quantity_available: 200,
      last_counted_at: '2026-01-10', created_at: '2026-01-01',
      updated_at: '2026-01-15',
    }
    expect(stock.quantity_on_hand).toBe(250)
    expect(stock.quantity_available).toBe(200)
  })

  test('InventoryTransaction interface has all required fields', () => {
    const txn: InventoryTransaction = {
      id: '1', company_id: '1', item_id: '2', from_location_id: null,
      to_location_id: '3', transaction_type: 'receive', quantity: 100,
      unit_cost: 5.99, total_cost: 599.00, reference_type: 'purchase_order',
      reference_id: '4', job_id: null, cost_code_id: null,
      notes: 'Initial stock receive', performed_by: '5',
      created_at: '2026-01-15',
    }
    expect(txn.transaction_type).toBe('receive')
    expect(txn.total_cost).toBe(599.00)
  })

  test('MaterialRequest interface has all required fields including deleted_at for soft delete', () => {
    const req: MaterialRequest = {
      id: '1', company_id: '1', job_id: '2', requested_by: '3',
      status: 'submitted', priority: 'high', needed_by: '2026-02-01',
      notes: 'Urgent framing materials', approved_by: null, approved_at: null,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(req.status).toBe('submitted')
    expect(req.priority).toBe('high')
    expect(req.deleted_at).toBeNull()
  })

  test('MaterialRequestItem interface has all required fields', () => {
    const item: MaterialRequestItem = {
      id: '1', request_id: '2', item_id: '3', description: '2x4x8 SPF',
      quantity_requested: 200, quantity_fulfilled: 0, unit: 'each',
      notes: null, created_at: '2026-01-15',
    }
    expect(item.quantity_requested).toBe(200)
    expect(item.quantity_fulfilled).toBe(0)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 52 — Constants', () => {
  test('LOCATION_TYPES has 4 entries with value and label', () => {
    expect(LOCATION_TYPES).toHaveLength(4)
    for (const lt of LOCATION_TYPES) {
      expect(lt).toHaveProperty('value')
      expect(lt).toHaveProperty('label')
      expect(lt.label.length).toBeGreaterThan(0)
    }
  })

  test('TRANSACTION_TYPES has 5 entries with value and label', () => {
    expect(TRANSACTION_TYPES).toHaveLength(5)
    for (const tt of TRANSACTION_TYPES) {
      expect(tt).toHaveProperty('value')
      expect(tt).toHaveProperty('label')
      expect(tt.label.length).toBeGreaterThan(0)
    }
  })

  test('REQUEST_STATUSES has 6 entries with value and label', () => {
    expect(REQUEST_STATUSES).toHaveLength(6)
    for (const rs of REQUEST_STATUSES) {
      expect(rs).toHaveProperty('value')
      expect(rs).toHaveProperty('label')
      expect(rs.label.length).toBeGreaterThan(0)
    }
  })

  test('REQUEST_PRIORITIES has 4 entries with value and label', () => {
    expect(REQUEST_PRIORITIES).toHaveLength(4)
    for (const rp of REQUEST_PRIORITIES) {
      expect(rp).toHaveProperty('value')
      expect(rp).toHaveProperty('label')
      expect(rp.label.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 52 — Enum Schemas', () => {
  test('locationTypeEnum accepts all 4 types', () => {
    for (const t of ['warehouse', 'job_site', 'vehicle', 'other']) {
      expect(locationTypeEnum.parse(t)).toBe(t)
    }
  })

  test('locationTypeEnum rejects invalid type', () => {
    expect(() => locationTypeEnum.parse('garage')).toThrow()
  })

  test('transactionTypeEnum accepts all 5 types', () => {
    for (const t of ['receive', 'transfer', 'consume', 'adjust', 'return']) {
      expect(transactionTypeEnum.parse(t)).toBe(t)
    }
  })

  test('transactionTypeEnum rejects invalid type', () => {
    expect(() => transactionTypeEnum.parse('destroy')).toThrow()
  })

  test('requestStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected']) {
      expect(requestStatusEnum.parse(s)).toBe(s)
    }
  })

  test('requestStatusEnum rejects invalid status', () => {
    expect(() => requestStatusEnum.parse('cancelled')).toThrow()
  })

  test('requestPriorityEnum accepts all 4 priorities', () => {
    for (const p of ['low', 'normal', 'high', 'urgent']) {
      expect(requestPriorityEnum.parse(p)).toBe(p)
    }
  })

  test('requestPriorityEnum rejects invalid priority', () => {
    expect(() => requestPriorityEnum.parse('critical')).toThrow()
  })
})

// ============================================================================
// Schemas — CRUD
// ============================================================================

describe('Module 52 — Validation Schemas', () => {
  // ── Inventory Items ─────────────────────────────────────────────────
  test('listInventoryItemsSchema accepts valid params', () => {
    const result = listInventoryItemsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listInventoryItemsSchema rejects limit > 100', () => {
    expect(() => listInventoryItemsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createInventoryItemSchema accepts valid item', () => {
    const result = createInventoryItemSchema.parse({
      name: '2x4 Lumber',
      sku: 'LBR-2X4',
      unit_of_measure: 'each',
      unit_cost: 5.99,
    })
    expect(result.name).toBe('2x4 Lumber')
    expect(result.unit_cost).toBe(5.99)
  })

  test('createInventoryItemSchema requires name', () => {
    expect(() => createInventoryItemSchema.parse({})).toThrow()
  })

  test('createInventoryItemSchema applies defaults for unit_cost and reorder fields', () => {
    const result = createInventoryItemSchema.parse({ name: 'Nails' })
    expect(result.unit_cost).toBe(0)
    expect(result.reorder_point).toBe(0)
    expect(result.reorder_quantity).toBe(0)
    expect(result.is_active).toBe(true)
    expect(result.unit_of_measure).toBe('each')
  })

  test('updateInventoryItemSchema accepts partial updates', () => {
    const result = updateInventoryItemSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.sku).toBeUndefined()
  })

  // ── Inventory Locations ─────────────────────────────────────────────
  test('listInventoryLocationsSchema accepts valid params', () => {
    const result = listInventoryLocationsSchema.parse({ page: '2', limit: '50' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(50)
  })

  test('createInventoryLocationSchema accepts valid location', () => {
    const result = createInventoryLocationSchema.parse({
      name: 'Main Warehouse',
      location_type: 'warehouse',
      address: '123 Industrial Ave',
    })
    expect(result.name).toBe('Main Warehouse')
    expect(result.location_type).toBe('warehouse')
  })

  test('createInventoryLocationSchema requires name', () => {
    expect(() => createInventoryLocationSchema.parse({})).toThrow()
  })

  test('updateInventoryLocationSchema accepts partial updates', () => {
    const result = updateInventoryLocationSchema.parse({ name: 'Updated Warehouse' })
    expect(result.name).toBe('Updated Warehouse')
    expect(result.location_type).toBeUndefined()
  })

  // ── Inventory Stock ─────────────────────────────────────────────────
  test('listInventoryStockSchema accepts item_id and location_id filters', () => {
    const result = listInventoryStockSchema.parse({
      item_id: '550e8400-e29b-41d4-a716-446655440000',
      location_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.item_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.location_id).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  // ── Inventory Transactions ──────────────────────────────────────────
  test('listInventoryTransactionsSchema accepts date filters', () => {
    const result = listInventoryTransactionsSchema.parse({
      start_date: '2026-01-01',
      end_date: '2026-01-31',
    })
    expect(result.start_date).toBe('2026-01-01')
    expect(result.end_date).toBe('2026-01-31')
  })

  test('listInventoryTransactionsSchema rejects invalid date format', () => {
    expect(() => listInventoryTransactionsSchema.parse({ start_date: '2026/01/01' })).toThrow()
  })

  test('createInventoryTransactionSchema accepts valid transaction', () => {
    const result = createInventoryTransactionSchema.parse({
      item_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'receive',
      quantity: 100,
      unit_cost: 5.99,
      to_location_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.transaction_type).toBe('receive')
    expect(result.quantity).toBe(100)
  })

  test('createInventoryTransactionSchema requires item_id, transaction_type, and quantity', () => {
    expect(() => createInventoryTransactionSchema.parse({})).toThrow()
    expect(() => createInventoryTransactionSchema.parse({ item_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createInventoryTransactionSchema rejects zero or negative quantity', () => {
    expect(() => createInventoryTransactionSchema.parse({
      item_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'receive',
      quantity: 0,
    })).toThrow()
    expect(() => createInventoryTransactionSchema.parse({
      item_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'receive',
      quantity: -5,
    })).toThrow()
  })

  // ── Material Requests ───────────────────────────────────────────────
  test('listMaterialRequestsSchema accepts valid params with status filter', () => {
    const result = listMaterialRequestsSchema.parse({ status: 'submitted', priority: 'high' })
    expect(result.status).toBe('submitted')
    expect(result.priority).toBe('high')
  })

  test('createMaterialRequestSchema requires at least 1 item', () => {
    expect(() => createMaterialRequestSchema.parse({
      items: [],
    })).toThrow()
  })

  test('createMaterialRequestSchema accepts valid request with items', () => {
    const result = createMaterialRequestSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      priority: 'urgent',
      needed_by: '2026-02-15',
      notes: 'Need ASAP for framing',
      items: [
        { item_id: '550e8400-e29b-41d4-a716-446655440001', quantity_requested: 200, unit: 'each' },
        { description: 'Custom trim piece', quantity_requested: 50, unit: 'linear_ft' },
      ],
    })
    expect(result.priority).toBe('urgent')
    expect(result.items).toHaveLength(2)
    expect(result.items[0].quantity_requested).toBe(200)
  })

  test('createMaterialRequestSchema rejects invalid needed_by date format', () => {
    expect(() => createMaterialRequestSchema.parse({
      needed_by: 'next-week',
      items: [{ quantity_requested: 10 }],
    })).toThrow()
  })

  test('updateMaterialRequestSchema accepts partial updates', () => {
    const result = updateMaterialRequestSchema.parse({ priority: 'low' })
    expect(result.priority).toBe('low')
    expect(result.items).toBeUndefined()
  })

  test('updateMaterialRequestSchema accepts status change', () => {
    const result = updateMaterialRequestSchema.parse({ status: 'submitted' })
    expect(result.status).toBe('submitted')
  })
})
