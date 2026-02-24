/**
 * Module 09 — Budget & Cost Tracking Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 09 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  BudgetStatus,
  TransactionType,
  Budget,
  BudgetLine,
  CostTransaction,
  BudgetChangeLog,
} from '@/types/budget'

import {
  BUDGET_STATUSES,
  TRANSACTION_TYPES,
} from '@/types/budget'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  budgetStatusEnum,
  transactionTypeEnum,
  listBudgetsSchema,
  createBudgetSchema,
  updateBudgetSchema,
  listBudgetLinesSchema,
  createBudgetLineSchema,
  updateBudgetLineSchema,
  createCostTransactionSchema,
  listCostTransactionsSchema,
} from '@/lib/validation/schemas/budget'

// ============================================================================
// Type System
// ============================================================================

describe('Module 09 — Budget Types', () => {
  test('BudgetStatus has 4 values', () => {
    const statuses: BudgetStatus[] = ['draft', 'active', 'locked', 'archived']
    expect(statuses).toHaveLength(4)
  })

  test('TransactionType has 4 values', () => {
    const types: TransactionType[] = ['commitment', 'actual', 'adjustment', 'transfer']
    expect(types).toHaveLength(4)
  })

  test('Budget interface has all required fields', () => {
    const budget: Budget = {
      id: '1',
      company_id: 'c1',
      job_id: 'j1',
      name: 'Original Budget',
      status: 'draft',
      total_amount: 500000.00,
      approved_by: null,
      approved_at: null,
      version: 1,
      notes: null,
      created_by: 'u1',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(budget.name).toBe('Original Budget')
    expect(budget.status).toBe('draft')
    expect(budget.total_amount).toBe(500000.00)
    expect(budget.version).toBe(1)
  })

  test('BudgetLine interface has all required fields', () => {
    const line: BudgetLine = {
      id: '1',
      budget_id: 'b1',
      company_id: 'c1',
      job_id: 'j1',
      cost_code_id: 'cc1',
      phase: 'Foundation',
      description: 'Concrete work',
      estimated_amount: 50000.00,
      committed_amount: 45000.00,
      actual_amount: 30000.00,
      projected_amount: 48000.00,
      variance_amount: 2000.00,
      sort_order: 1,
      notes: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    }
    expect(line.description).toBe('Concrete work')
    expect(line.estimated_amount).toBe(50000.00)
    expect(line.committed_amount).toBe(45000.00)
    expect(line.actual_amount).toBe(30000.00)
  })

  test('CostTransaction interface has all required fields', () => {
    const tx: CostTransaction = {
      id: '1',
      company_id: 'c1',
      job_id: 'j1',
      budget_line_id: 'bl1',
      cost_code_id: 'cc1',
      transaction_type: 'actual',
      amount: 15000.00,
      description: 'Invoice #1234 payment',
      reference_type: 'invoice',
      reference_id: 'inv-1',
      transaction_date: '2026-02-15',
      vendor_id: 'v1',
      created_by: 'u1',
      created_at: '2026-02-15',
    }
    expect(tx.transaction_type).toBe('actual')
    expect(tx.amount).toBe(15000.00)
    expect(tx.reference_type).toBe('invoice')
  })

  test('BudgetChangeLog interface has all required fields', () => {
    const log: BudgetChangeLog = {
      id: '1',
      budget_id: 'b1',
      field_changed: 'status',
      old_value: 'draft',
      new_value: 'active',
      changed_by: 'u1',
      created_at: '2026-02-01',
    }
    expect(log.field_changed).toBe('status')
    expect(log.old_value).toBe('draft')
    expect(log.new_value).toBe('active')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 09 — Constants', () => {
  test('BUDGET_STATUSES has 4 entries with value and label', () => {
    expect(BUDGET_STATUSES).toHaveLength(4)
    for (const s of BUDGET_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('BUDGET_STATUSES contains expected values', () => {
    const values = BUDGET_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('active')
    expect(values).toContain('locked')
    expect(values).toContain('archived')
  })

  test('TRANSACTION_TYPES has 4 entries with value and label', () => {
    expect(TRANSACTION_TYPES).toHaveLength(4)
    for (const t of TRANSACTION_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('TRANSACTION_TYPES contains expected values', () => {
    const values = TRANSACTION_TYPES.map((t) => t.value)
    expect(values).toContain('commitment')
    expect(values).toContain('actual')
    expect(values).toContain('adjustment')
    expect(values).toContain('transfer')
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 09 — Schema Enums', () => {
  test('budgetStatusEnum accepts all 4 statuses', () => {
    for (const s of ['draft', 'active', 'locked', 'archived']) {
      expect(budgetStatusEnum.parse(s)).toBe(s)
    }
  })

  test('budgetStatusEnum rejects invalid status', () => {
    expect(() => budgetStatusEnum.parse('pending')).toThrow()
    expect(() => budgetStatusEnum.parse('closed')).toThrow()
    expect(() => budgetStatusEnum.parse('')).toThrow()
  })

  test('transactionTypeEnum accepts all 4 types', () => {
    for (const t of ['commitment', 'actual', 'adjustment', 'transfer']) {
      expect(transactionTypeEnum.parse(t)).toBe(t)
    }
  })

  test('transactionTypeEnum rejects invalid type', () => {
    expect(() => transactionTypeEnum.parse('payment')).toThrow()
    expect(() => transactionTypeEnum.parse('refund')).toThrow()
  })
})

// ============================================================================
// Schemas — Budgets
// ============================================================================

describe('Module 09 — Budget Schemas', () => {
  test('listBudgetsSchema accepts valid params with defaults', () => {
    const result = listBudgetsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listBudgetsSchema accepts valid filter params', () => {
    const result = listBudgetsSchema.parse({
      page: '2',
      limit: '50',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'active',
      q: 'original',
    })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(50)
    expect(result.status).toBe('active')
  })

  test('listBudgetsSchema rejects limit > 100', () => {
    expect(() => listBudgetsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createBudgetSchema accepts valid budget', () => {
    const result = createBudgetSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Original Budget',
    })
    expect(result.name).toBe('Original Budget')
    expect(result.status).toBe('draft')
    expect(result.total_amount).toBe(0)
  })

  test('createBudgetSchema requires job_id and name', () => {
    expect(() => createBudgetSchema.parse({})).toThrow()
    expect(() => createBudgetSchema.parse({ name: 'Budget' })).toThrow()
    expect(() => createBudgetSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createBudgetSchema rejects empty name', () => {
    expect(() => createBudgetSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: '',
    })).toThrow()
  })

  test('updateBudgetSchema accepts partial updates', () => {
    const result = updateBudgetSchema.parse({ name: 'Revised Budget' })
    expect(result.name).toBe('Revised Budget')
    expect(result.status).toBeUndefined()
    expect(result.total_amount).toBeUndefined()
  })

  test('updateBudgetSchema accepts status change', () => {
    const result = updateBudgetSchema.parse({ status: 'active' })
    expect(result.status).toBe('active')
  })

  test('updateBudgetSchema rejects invalid status', () => {
    expect(() => updateBudgetSchema.parse({ status: 'invalid' })).toThrow()
  })
})

// ============================================================================
// Schemas — Budget Lines
// ============================================================================

describe('Module 09 — Budget Line Schemas', () => {
  test('listBudgetLinesSchema accepts defaults', () => {
    const result = listBudgetLinesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createBudgetLineSchema accepts valid line', () => {
    const result = createBudgetLineSchema.parse({
      description: 'Concrete foundations',
      estimated_amount: 50000.00,
    })
    expect(result.description).toBe('Concrete foundations')
    expect(result.estimated_amount).toBe(50000.00)
    expect(result.committed_amount).toBe(0)
    expect(result.actual_amount).toBe(0)
  })

  test('createBudgetLineSchema requires description', () => {
    expect(() => createBudgetLineSchema.parse({})).toThrow()
    expect(() => createBudgetLineSchema.parse({ estimated_amount: 1000 })).toThrow()
  })

  test('createBudgetLineSchema rejects empty description', () => {
    expect(() => createBudgetLineSchema.parse({ description: '' })).toThrow()
  })

  test('createBudgetLineSchema accepts optional cost_code_id and phase', () => {
    const result = createBudgetLineSchema.parse({
      description: 'Framing',
      cost_code_id: '550e8400-e29b-41d4-a716-446655440000',
      phase: 'Structure',
    })
    expect(result.cost_code_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.phase).toBe('Structure')
  })

  test('updateBudgetLineSchema accepts partial updates', () => {
    const result = updateBudgetLineSchema.parse({ estimated_amount: 55000.00 })
    expect(result.estimated_amount).toBe(55000.00)
    expect(result.description).toBeUndefined()
  })

  test('createBudgetLineSchema rejects negative estimated_amount', () => {
    expect(() => createBudgetLineSchema.parse({
      description: 'Test',
      estimated_amount: -100,
    })).toThrow()
  })

  test('updateBudgetLineSchema allows negative variance_amount', () => {
    const result = updateBudgetLineSchema.parse({ variance_amount: -5000.00 })
    expect(result.variance_amount).toBe(-5000.00)
  })
})

// ============================================================================
// Schemas — Cost Transactions
// ============================================================================

describe('Module 09 — Cost Transaction Schemas', () => {
  test('createCostTransactionSchema accepts valid transaction', () => {
    const result = createCostTransactionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'actual',
      amount: 15000.00,
      description: 'Invoice payment',
    })
    expect(result.transaction_type).toBe('actual')
    expect(result.amount).toBe(15000.00)
  })

  test('createCostTransactionSchema requires job_id, transaction_type, amount', () => {
    expect(() => createCostTransactionSchema.parse({})).toThrow()
    expect(() => createCostTransactionSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
    expect(() => createCostTransactionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'actual',
    })).toThrow()
  })

  test('createCostTransactionSchema allows negative amount for adjustments', () => {
    const result = createCostTransactionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'adjustment',
      amount: -5000.00,
    })
    expect(result.amount).toBe(-5000.00)
  })

  test('createCostTransactionSchema accepts transaction_date in YYYY-MM-DD', () => {
    const result = createCostTransactionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'commitment',
      amount: 25000.00,
      transaction_date: '2026-03-15',
    })
    expect(result.transaction_date).toBe('2026-03-15')
  })

  test('createCostTransactionSchema rejects invalid date format', () => {
    expect(() => createCostTransactionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'actual',
      amount: 1000,
      transaction_date: '20260315',
    })).toThrow()
  })

  test('listCostTransactionsSchema accepts valid filter params', () => {
    const result = listCostTransactionsSchema.parse({
      page: '1',
      limit: '25',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'actual',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
    })
    expect(result.page).toBe(1)
    expect(result.transaction_type).toBe('actual')
    expect(result.date_from).toBe('2026-01-01')
    expect(result.date_to).toBe('2026-12-31')
  })

  test('listCostTransactionsSchema rejects invalid date_from', () => {
    expect(() => listCostTransactionsSchema.parse({
      date_from: 'not-a-date',
    })).toThrow()
  })

  test('createCostTransactionSchema rejects invalid transaction_type', () => {
    expect(() => createCostTransactionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_type: 'payment',
      amount: 1000,
    })).toThrow()
  })
})
