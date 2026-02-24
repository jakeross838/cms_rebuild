/**
 * Module 18 — Purchase Orders Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 18 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  PurchaseOrderStatus,
  PurchaseOrder,
  PurchaseOrderLine,
  PoReceipt,
  PoReceiptLine,
} from '@/types/purchase-orders'

import { PO_STATUSES } from '@/types/purchase-orders'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  purchaseOrderStatusEnum,
  listPurchaseOrdersSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  createPurchaseOrderLineSchema,
  updatePurchaseOrderLineSchema,
  listPurchaseOrderLinesSchema,
  createPoReceiptSchema,
  listPoReceiptsSchema,
  approvePurchaseOrderSchema,
  sendPurchaseOrderSchema,
} from '@/lib/validation/schemas/purchase-orders'

// ============================================================================
// Type System
// ============================================================================

describe('Module 18 — Purchase Order Types', () => {
  test('PurchaseOrderStatus has 8 values', () => {
    const statuses: PurchaseOrderStatus[] = [
      'draft', 'pending_approval', 'approved', 'sent',
      'partially_received', 'received', 'closed', 'voided',
    ]
    expect(statuses).toHaveLength(8)
  })

  test('PurchaseOrder interface has all required fields', () => {
    const po: PurchaseOrder = {
      id: '1', company_id: '1', job_id: '1', vendor_id: '1',
      po_number: 'PO-0001', title: 'Lumber Order',
      status: 'draft', subtotal: 1000, tax_amount: 80,
      shipping_amount: 50, total_amount: 1130,
      budget_id: null, cost_code_id: null,
      delivery_date: '2026-03-01', shipping_address: null,
      terms: null, notes: null, approved_by: null,
      approved_at: null, sent_at: null, created_by: '1',
      created_at: '2026-02-01', updated_at: '2026-02-01',
      deleted_at: null,
    }
    expect(po.po_number).toBe('PO-0001')
    expect(po.status).toBe('draft')
    expect(po.total_amount).toBe(1130)
  })

  test('PurchaseOrderLine interface has all required fields', () => {
    const line: PurchaseOrderLine = {
      id: '1', po_id: '1', description: '2x4 Lumber',
      quantity: 100, unit: 'each', unit_price: 3.50,
      amount: 350, received_quantity: 0, cost_code_id: null,
      sort_order: 0, created_at: '2026-02-01', updated_at: '2026-02-01',
    }
    expect(line.description).toBe('2x4 Lumber')
    expect(line.quantity).toBe(100)
    expect(line.amount).toBe(350)
  })

  test('PoReceipt interface has all required fields', () => {
    const receipt: PoReceipt = {
      id: '1', po_id: '1', company_id: '1',
      received_date: '2026-03-01', received_by: '1',
      notes: null, document_id: null,
      created_at: '2026-03-01',
    }
    expect(receipt.received_date).toBe('2026-03-01')
  })

  test('PoReceiptLine interface has all required fields', () => {
    const receiptLine: PoReceiptLine = {
      id: '1', receipt_id: '1', po_line_id: '1',
      quantity_received: 50, notes: null,
      created_at: '2026-03-01',
    }
    expect(receiptLine.quantity_received).toBe(50)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 18 — Constants', () => {
  test('PO_STATUSES has 8 entries with value and label', () => {
    expect(PO_STATUSES).toHaveLength(8)
    for (const s of PO_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('PO_STATUSES includes all expected status values', () => {
    const values = PO_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('pending_approval')
    expect(values).toContain('approved')
    expect(values).toContain('sent')
    expect(values).toContain('partially_received')
    expect(values).toContain('received')
    expect(values).toContain('closed')
    expect(values).toContain('voided')
  })
})

// ============================================================================
// Schemas
// ============================================================================

describe('Module 18 — Validation Schemas', () => {
  test('purchaseOrderStatusEnum accepts all 8 statuses', () => {
    for (const s of ['draft', 'pending_approval', 'approved', 'sent', 'partially_received', 'received', 'closed', 'voided']) {
      expect(purchaseOrderStatusEnum.parse(s)).toBe(s)
    }
  })

  test('purchaseOrderStatusEnum rejects invalid status', () => {
    expect(() => purchaseOrderStatusEnum.parse('unknown')).toThrow()
    expect(() => purchaseOrderStatusEnum.parse('cancelled')).toThrow()
  })

  test('listPurchaseOrdersSchema accepts valid params', () => {
    const result = listPurchaseOrdersSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPurchaseOrdersSchema rejects limit > 100', () => {
    expect(() => listPurchaseOrdersSchema.parse({ limit: 200 })).toThrow()
  })

  test('listPurchaseOrdersSchema accepts optional filters', () => {
    const result = listPurchaseOrdersSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'approved',
      q: 'lumber',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('approved')
    expect(result.q).toBe('lumber')
  })

  test('createPurchaseOrderSchema accepts valid PO', () => {
    const result = createPurchaseOrderSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      vendor_id: '550e8400-e29b-41d4-a716-446655440001',
      po_number: 'PO-0001',
      title: 'Lumber Order for Phase 1',
    })
    expect(result.po_number).toBe('PO-0001')
    expect(result.title).toBe('Lumber Order for Phase 1')
    expect(result.status).toBe('draft')
    expect(result.subtotal).toBe(0)
  })

  test('createPurchaseOrderSchema requires job_id, vendor_id, po_number, title', () => {
    expect(() => createPurchaseOrderSchema.parse({})).toThrow()
    expect(() => createPurchaseOrderSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createPurchaseOrderSchema validates delivery_date format', () => {
    expect(() => createPurchaseOrderSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      vendor_id: '550e8400-e29b-41d4-a716-446655440001',
      po_number: 'PO-0001',
      title: 'Test',
      delivery_date: 'not-a-date',
    })).toThrow()

    const result = createPurchaseOrderSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      vendor_id: '550e8400-e29b-41d4-a716-446655440001',
      po_number: 'PO-0001',
      title: 'Test',
      delivery_date: '2026-03-15',
    })
    expect(result.delivery_date).toBe('2026-03-15')
  })

  test('updatePurchaseOrderSchema accepts partial updates', () => {
    const result = updatePurchaseOrderSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
    expect(result.vendor_id).toBeUndefined()
  })

  test('updatePurchaseOrderSchema rejects invalid status', () => {
    expect(() => updatePurchaseOrderSchema.parse({ status: 'invalid' })).toThrow()
  })

  test('createPurchaseOrderLineSchema accepts valid line', () => {
    const result = createPurchaseOrderLineSchema.parse({
      description: '2x4 Lumber 8ft',
      quantity: 100,
      unit: 'each',
      unit_price: 3.50,
      amount: 350,
    })
    expect(result.description).toBe('2x4 Lumber 8ft')
    expect(result.quantity).toBe(100)
    expect(result.unit_price).toBe(3.50)
  })

  test('createPurchaseOrderLineSchema requires description', () => {
    expect(() => createPurchaseOrderLineSchema.parse({})).toThrow()
    expect(() => createPurchaseOrderLineSchema.parse({ description: '' })).toThrow()
  })

  test('createPurchaseOrderLineSchema rejects negative quantity', () => {
    expect(() => createPurchaseOrderLineSchema.parse({
      description: 'Test',
      quantity: -5,
    })).toThrow()
  })

  test('updatePurchaseOrderLineSchema accepts partial updates', () => {
    const result = updatePurchaseOrderLineSchema.parse({ quantity: 200 })
    expect(result.quantity).toBe(200)
    expect(result.description).toBeUndefined()
  })

  test('listPurchaseOrderLinesSchema accepts valid params', () => {
    const result = listPurchaseOrderLinesSchema.parse({ page: '2', limit: '50' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(50)
  })

  test('createPoReceiptSchema requires at least one line', () => {
    expect(() => createPoReceiptSchema.parse({ lines: [] })).toThrow()
  })

  test('createPoReceiptSchema accepts valid receipt with lines', () => {
    const result = createPoReceiptSchema.parse({
      received_date: '2026-03-01',
      notes: 'Delivered on schedule',
      lines: [
        {
          po_line_id: '550e8400-e29b-41d4-a716-446655440000',
          quantity_received: 50,
          notes: 'Good condition',
        },
      ],
    })
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0].quantity_received).toBe(50)
    expect(result.received_date).toBe('2026-03-01')
  })

  test('createPoReceiptSchema rejects non-positive quantity_received', () => {
    expect(() => createPoReceiptSchema.parse({
      lines: [
        {
          po_line_id: '550e8400-e29b-41d4-a716-446655440000',
          quantity_received: 0,
        },
      ],
    })).toThrow()
  })

  test('listPoReceiptsSchema accepts valid params', () => {
    const result = listPoReceiptsSchema.parse({ page: '1', limit: '10' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  test('approvePurchaseOrderSchema accepts optional notes', () => {
    const result = approvePurchaseOrderSchema.parse({ notes: 'Approved by director' })
    expect(result.notes).toBe('Approved by director')
  })

  test('approvePurchaseOrderSchema accepts empty object', () => {
    const result = approvePurchaseOrderSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('sendPurchaseOrderSchema accepts optional notes', () => {
    const result = sendPurchaseOrderSchema.parse({ notes: 'Sent via email' })
    expect(result.notes).toBe('Sent via email')
  })

  test('sendPurchaseOrderSchema accepts empty object', () => {
    const result = sendPurchaseOrderSchema.parse({})
    expect(result.notes).toBeUndefined()
  })
})
