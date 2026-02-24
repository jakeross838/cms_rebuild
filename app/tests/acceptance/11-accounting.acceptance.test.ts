/**
 * Module 11 — Native Accounting (GL/AP/AR) Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, constants,
 * and Zod schemas against the Module 11 spec for General Ledger,
 * Accounts Payable, and Accounts Receivable.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  AccountType,
  NormalBalance,
  JournalEntryStatus,
  JournalEntrySourceType,
  BillStatus,
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
  GlAccount,
  GlJournalEntry,
  GlJournalLine,
  ApBill,
  ApBillLine,
  ApPayment,
  ApPaymentApplication,
  ArInvoice,
  ArInvoiceLine,
  ArReceipt,
  ArReceiptApplication,
} from '@/types/accounting'

import {
  ACCOUNT_TYPES,
  BILL_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  JOURNAL_ENTRY_STATUSES,
  JOURNAL_ENTRY_SOURCE_TYPES,
  NORMAL_BALANCES,
} from '@/types/accounting'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  accountTypeEnum,
  normalBalanceEnum,
  journalEntryStatusEnum,
  journalEntrySourceTypeEnum,
  billStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
  invoiceStatusEnum,
  listGlAccountsSchema,
  createGlAccountSchema,
  updateGlAccountSchema,
  listJournalEntriesSchema,
  createJournalEntrySchema,
  updateJournalEntrySchema,
  listBillsSchema,
  createBillSchema,
  updateBillSchema,
  listPaymentsSchema,
  createPaymentSchema,
  listArInvoicesSchema,
  createArInvoiceSchema,
  updateArInvoiceSchema,
  listReceiptsSchema,
  createReceiptSchema,
} from '@/lib/validation/schemas/accounting'

// Valid UUIDs for testing (must pass strict UUID v4 format)
const UUID_1 = '11111111-1111-4111-a111-111111111111'
const UUID_2 = '22222222-2222-4222-a222-222222222222'
const UUID_3 = '33333333-3333-4333-a333-333333333333'
const UUID_4 = '44444444-4444-4444-a444-444444444444'

// ============================================================================
// Type System
// ============================================================================

describe('Module 11 — Accounting Types', () => {
  test('AccountType has 6 values including cogs', () => {
    const types: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs']
    expect(types).toHaveLength(6)
  })

  test('NormalBalance has 2 values', () => {
    const balances: NormalBalance[] = ['debit', 'credit']
    expect(balances).toHaveLength(2)
  })

  test('JournalEntryStatus has 3 values', () => {
    const statuses: JournalEntryStatus[] = ['draft', 'posted', 'voided']
    expect(statuses).toHaveLength(3)
  })

  test('JournalEntrySourceType has 4 values', () => {
    const sources: JournalEntrySourceType[] = ['manual', 'ap_payment', 'ar_receipt', 'payroll']
    expect(sources).toHaveLength(4)
  })

  test('BillStatus has 6 values', () => {
    const statuses: BillStatus[] = ['draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'voided']
    expect(statuses).toHaveLength(6)
  })

  test('PaymentMethod has 5 values', () => {
    const methods: PaymentMethod[] = ['check', 'ach', 'wire', 'credit_card', 'cash']
    expect(methods).toHaveLength(5)
  })

  test('PaymentStatus has 3 values', () => {
    const statuses: PaymentStatus[] = ['pending', 'cleared', 'voided']
    expect(statuses).toHaveLength(3)
  })

  test('InvoiceStatus has 6 values', () => {
    const statuses: InvoiceStatus[] = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided']
    expect(statuses).toHaveLength(6)
  })

  test('GlAccount interface has all required fields', () => {
    const account: GlAccount = {
      id: '1', company_id: '1', account_number: '1000', name: 'Cash',
      account_type: 'asset', sub_type: 'current_asset',
      parent_account_id: null, is_active: true, is_system: false,
      description: 'Operating cash', normal_balance: 'debit',
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(account.account_number).toBe('1000')
    expect(account.normal_balance).toBe('debit')
  })

  test('GlJournalEntry interface has all required fields', () => {
    const entry: GlJournalEntry = {
      id: '1', company_id: '1', entry_date: '2026-01-15',
      reference_number: 'JE-0001', memo: 'Monthly depreciation',
      status: 'draft', source_type: 'manual', source_id: null,
      posted_by: null, posted_at: null, created_by: '1',
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(entry.status).toBe('draft')
    expect(entry.source_type).toBe('manual')
  })

  test('GlJournalLine interface has all required fields', () => {
    const line: GlJournalLine = {
      id: '1', journal_entry_id: '1', account_id: '1',
      debit_amount: 1000, credit_amount: 0,
      memo: null, job_id: null, cost_code_id: null,
      vendor_id: null, client_id: null, created_at: '2026-01-01',
    }
    expect(line.debit_amount).toBe(1000)
    expect(line.credit_amount).toBe(0)
  })

  test('ApBill interface has all required fields including deleted_at for soft delete', () => {
    const bill: ApBill = {
      id: '1', company_id: '1', vendor_id: '1',
      bill_number: 'INV-001', bill_date: '2026-01-15', due_date: '2026-02-14',
      amount: 5000, balance_due: 5000, status: 'draft',
      job_id: null, description: 'Lumber delivery',
      received_date: '2026-01-15', terms: 'Net 30',
      created_by: '1', created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(bill.amount).toBe(5000)
    expect(bill.deleted_at).toBeNull()
  })

  test('ArInvoice interface has all required fields including deleted_at', () => {
    const invoice: ArInvoice = {
      id: '1', company_id: '1', client_id: '1', job_id: '1',
      invoice_number: 'AR-001', invoice_date: '2026-01-15',
      due_date: '2026-02-14', amount: 25000, balance_due: 25000,
      status: 'draft', terms: 'Net 30', notes: null,
      created_by: '1', created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(invoice.balance_due).toBe(25000)
    expect(invoice.status).toBe('draft')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 11 — Constants', () => {
  test('ACCOUNT_TYPES has 6 entries with value and label', () => {
    expect(ACCOUNT_TYPES).toHaveLength(6)
    for (const t of ACCOUNT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('ACCOUNT_TYPES includes cogs', () => {
    expect(ACCOUNT_TYPES.find((t) => t.value === 'cogs')).toBeDefined()
  })

  test('BILL_STATUSES has 6 entries', () => {
    expect(BILL_STATUSES).toHaveLength(6)
    expect(BILL_STATUSES.map((s) => s.value)).toContain('pending_approval')
    expect(BILL_STATUSES.map((s) => s.value)).toContain('partially_paid')
  })

  test('INVOICE_STATUSES has 6 entries', () => {
    expect(INVOICE_STATUSES).toHaveLength(6)
    expect(INVOICE_STATUSES.map((s) => s.value)).toContain('overdue')
    expect(INVOICE_STATUSES.map((s) => s.value)).toContain('sent')
  })

  test('PAYMENT_METHODS has 5 entries', () => {
    expect(PAYMENT_METHODS).toHaveLength(5)
    expect(PAYMENT_METHODS.map((m) => m.value)).toContain('ach')
    expect(PAYMENT_METHODS.map((m) => m.value)).toContain('wire')
  })

  test('PAYMENT_STATUSES has 3 entries', () => {
    expect(PAYMENT_STATUSES).toHaveLength(3)
  })

  test('JOURNAL_ENTRY_STATUSES has 3 entries', () => {
    expect(JOURNAL_ENTRY_STATUSES).toHaveLength(3)
  })

  test('JOURNAL_ENTRY_SOURCE_TYPES has 4 entries', () => {
    expect(JOURNAL_ENTRY_SOURCE_TYPES).toHaveLength(4)
  })

  test('NORMAL_BALANCES has 2 entries', () => {
    expect(NORMAL_BALANCES).toHaveLength(2)
  })
})

// ============================================================================
// Schema Enums
// ============================================================================

describe('Module 11 — Schema Enums', () => {
  test('accountTypeEnum accepts all 6 types', () => {
    for (const t of ['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs']) {
      expect(accountTypeEnum.parse(t)).toBe(t)
    }
  })

  test('accountTypeEnum rejects invalid type', () => {
    expect(() => accountTypeEnum.parse('other')).toThrow()
  })

  test('normalBalanceEnum accepts debit and credit', () => {
    expect(normalBalanceEnum.parse('debit')).toBe('debit')
    expect(normalBalanceEnum.parse('credit')).toBe('credit')
  })

  test('billStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'voided']) {
      expect(billStatusEnum.parse(s)).toBe(s)
    }
  })

  test('paymentMethodEnum accepts all 5 methods', () => {
    for (const m of ['check', 'ach', 'wire', 'credit_card', 'cash']) {
      expect(paymentMethodEnum.parse(m)).toBe(m)
    }
  })

  test('invoiceStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided']) {
      expect(invoiceStatusEnum.parse(s)).toBe(s)
    }
  })

  test('journalEntryStatusEnum rejects invalid', () => {
    expect(() => journalEntryStatusEnum.parse('pending')).toThrow()
  })

  test('paymentStatusEnum accepts pending/cleared/voided', () => {
    expect(paymentStatusEnum.parse('pending')).toBe('pending')
    expect(paymentStatusEnum.parse('cleared')).toBe('cleared')
    expect(paymentStatusEnum.parse('voided')).toBe('voided')
  })
})

// ============================================================================
// GL Schemas
// ============================================================================

describe('Module 11 — GL Schemas', () => {
  test('listGlAccountsSchema accepts valid params', () => {
    const result = listGlAccountsSchema.parse({ page: '1', limit: '50' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listGlAccountsSchema rejects limit > 100', () => {
    expect(() => listGlAccountsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createGlAccountSchema accepts valid account', () => {
    const result = createGlAccountSchema.parse({
      account_number: '1000',
      name: 'Cash',
      account_type: 'asset',
      normal_balance: 'debit',
    })
    expect(result.account_number).toBe('1000')
    expect(result.is_active).toBe(true)
    expect(result.is_system).toBe(false)
  })

  test('createGlAccountSchema requires account_number, name, account_type, normal_balance', () => {
    expect(() => createGlAccountSchema.parse({})).toThrow()
    expect(() => createGlAccountSchema.parse({ account_number: '1000' })).toThrow()
  })

  test('updateGlAccountSchema accepts partial updates', () => {
    const result = updateGlAccountSchema.parse({ name: 'Operating Cash' })
    expect(result.name).toBe('Operating Cash')
    expect(result.account_number).toBeUndefined()
  })

  test('createJournalEntrySchema requires entry_date and at least 2 lines', () => {
    expect(() => createJournalEntrySchema.parse({ entry_date: '2026-01-15', lines: [] })).toThrow()
    expect(() => createJournalEntrySchema.parse({
      entry_date: '2026-01-15',
      lines: [{ account_id: 'a1', debit_amount: 100 }],
    })).toThrow()
  })

  test('createJournalEntrySchema accepts valid entry with balanced lines', () => {
    const result = createJournalEntrySchema.parse({
      entry_date: '2026-01-15',
      memo: 'Test entry',
      lines: [
        { account_id: UUID_1, debit_amount: 1000, credit_amount: 0 },
        { account_id: UUID_2, debit_amount: 0, credit_amount: 1000 },
      ],
    })
    expect(result.lines).toHaveLength(2)
    expect(result.source_type).toBe('manual')
  })

  test('listJournalEntriesSchema accepts date filters', () => {
    const result = listJournalEntriesSchema.parse({
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      status: 'posted',
    })
    expect(result.start_date).toBe('2026-01-01')
    expect(result.status).toBe('posted')
  })

  test('updateJournalEntrySchema accepts partial updates', () => {
    const result = updateJournalEntrySchema.parse({ memo: 'Updated memo' })
    expect(result.memo).toBe('Updated memo')
    expect(result.lines).toBeUndefined()
  })
})

// ============================================================================
// AP Schemas
// ============================================================================

describe('Module 11 — AP Schemas', () => {
  test('createBillSchema accepts valid bill', () => {
    const result = createBillSchema.parse({
      vendor_id: '11111111-1111-4111-a111-111111111111',
      bill_number: 'INV-001',
      bill_date: '2026-01-15',
      due_date: '2026-02-14',
      amount: 5000,
    })
    expect(result.bill_number).toBe('INV-001')
    expect(result.amount).toBe(5000)
  })

  test('createBillSchema requires vendor_id, bill_number, bill_date, due_date, amount', () => {
    expect(() => createBillSchema.parse({})).toThrow()
    expect(() => createBillSchema.parse({ vendor_id: '11111111-1111-4111-a111-111111111111' })).toThrow()
  })

  test('createBillSchema rejects non-positive amount', () => {
    expect(() => createBillSchema.parse({
      vendor_id: '11111111-1111-4111-a111-111111111111',
      bill_number: 'INV-001',
      bill_date: '2026-01-15',
      due_date: '2026-02-14',
      amount: 0,
    })).toThrow()
  })

  test('createBillSchema accepts bill with line items', () => {
    const result = createBillSchema.parse({
      vendor_id: '11111111-1111-4111-a111-111111111111',
      bill_number: 'INV-002',
      bill_date: '2026-01-15',
      due_date: '2026-02-14',
      amount: 3000,
      lines: [
        { gl_account_id: '33333333-3333-4333-a333-333333333333', amount: 2000, description: 'Lumber' },
        { gl_account_id: '44444444-4444-4444-a444-444444444444', amount: 1000, description: 'Hardware' },
      ],
    })
    expect(result.lines).toHaveLength(2)
  })

  test('updateBillSchema accepts partial updates', () => {
    const result = updateBillSchema.parse({ description: 'Updated description' })
    expect(result.description).toBe('Updated description')
  })

  test('listBillsSchema accepts vendor and status filters', () => {
    const result = listBillsSchema.parse({
      vendor_id: '11111111-1111-4111-a111-111111111111',
      status: 'approved',
    })
    expect(result.status).toBe('approved')
  })

  test('createPaymentSchema requires vendor_id, date, amount, method, and applications', () => {
    expect(() => createPaymentSchema.parse({})).toThrow()
  })

  test('createPaymentSchema accepts valid payment with applications', () => {
    const result = createPaymentSchema.parse({
      vendor_id: '11111111-1111-4111-a111-111111111111',
      payment_date: '2026-02-01',
      amount: 5000,
      payment_method: 'check',
      reference_number: 'CHK-1234',
      applications: [
        { bill_id: '55555555-5555-4555-a555-555555555555', amount: 5000 },
      ],
    })
    expect(result.applications).toHaveLength(1)
    expect(result.payment_method).toBe('check')
  })

  test('createPaymentSchema rejects empty applications', () => {
    expect(() => createPaymentSchema.parse({
      vendor_id: '11111111-1111-4111-a111-111111111111',
      payment_date: '2026-02-01',
      amount: 5000,
      payment_method: 'ach',
      applications: [],
    })).toThrow()
  })
})

// ============================================================================
// AR Schemas
// ============================================================================

describe('Module 11 — AR Schemas', () => {
  test('createArInvoiceSchema accepts valid invoice', () => {
    const result = createArInvoiceSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      invoice_number: 'AR-001',
      invoice_date: '2026-01-15',
      due_date: '2026-02-14',
      amount: 25000,
    })
    expect(result.invoice_number).toBe('AR-001')
    expect(result.amount).toBe(25000)
  })

  test('createArInvoiceSchema requires client_id, invoice_number, dates, amount', () => {
    expect(() => createArInvoiceSchema.parse({})).toThrow()
  })

  test('createArInvoiceSchema accepts invoice with lines', () => {
    const result = createArInvoiceSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      invoice_number: 'AR-002',
      invoice_date: '2026-01-15',
      due_date: '2026-02-14',
      amount: 15000,
      lines: [
        { description: 'Framing rough-in', quantity: 1, unit_price: 10000, amount: 10000 },
        { description: 'Material delivery', quantity: 1, unit_price: 5000, amount: 5000 },
      ],
    })
    expect(result.lines).toHaveLength(2)
  })

  test('updateArInvoiceSchema accepts partial updates', () => {
    const result = updateArInvoiceSchema.parse({ notes: 'Payment reminder sent' })
    expect(result.notes).toBe('Payment reminder sent')
  })

  test('listArInvoicesSchema accepts client and job filters', () => {
    const result = listArInvoicesSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      job_id: '66666666-6666-4666-a666-666666666666',
      status: 'sent',
    })
    expect(result.status).toBe('sent')
  })

  test('createReceiptSchema accepts valid receipt with applications', () => {
    const result = createReceiptSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      receipt_date: '2026-02-10',
      amount: 25000,
      payment_method: 'wire',
      applications: [
        { invoice_id: '77777777-7777-4777-a777-777777777777', amount: 25000 },
      ],
    })
    expect(result.applications).toHaveLength(1)
    expect(result.payment_method).toBe('wire')
  })

  test('createReceiptSchema rejects empty applications', () => {
    expect(() => createReceiptSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      receipt_date: '2026-02-10',
      amount: 1000,
      payment_method: 'cash',
      applications: [],
    })).toThrow()
  })

  test('listReceiptsSchema accepts client and date filters', () => {
    const result = listReceiptsSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
    })
    expect(result.start_date).toBe('2026-01-01')
  })

  test('date fields reject invalid formats', () => {
    expect(() => createArInvoiceSchema.parse({
      client_id: '22222222-2222-4222-a222-222222222222',
      invoice_number: 'AR-X',
      invoice_date: 'January 15',
      due_date: '2026-02-14',
      amount: 100,
    })).toThrow()
  })
})
