/**
 * Module 13 — AI Invoice Processing Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, constants, schemas,
 * and business logic against the Module 13 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ExtractionStatus,
  FieldDataType,
  ExtractionRuleType,
  ExtractionAuditAction,
  ReviewDecision,
  InvoiceExtraction,
  ExtractionFieldMapping,
  InvoiceLineExtraction,
  ExtractionRule,
  ExtractionAuditLog,
} from '@/types/invoice-processing'

import {
  EXTRACTION_STATUSES,
  FIELD_DATA_TYPES,
  RULE_TYPES,
  AUDIT_ACTIONS,
  REVIEW_DECISIONS,
  CONFIDENCE_THRESHOLDS,
} from '@/types/invoice-processing'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  extractionStatusEnum,
  fieldDataTypeEnum,
  extractionRuleTypeEnum,
  auditActionEnum,
  reviewDecisionEnum,
  listExtractionsSchema,
  createExtractionSchema,
  updateExtractionSchema,
  reviewExtractionSchema,
  createBillFromExtractionSchema,
  createFieldMappingSchema,
  updateFieldMappingSchema,
  listExtractionRulesSchema,
  createExtractionRuleSchema,
  updateExtractionRuleSchema,
} from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// Type System
// ============================================================================

describe('Module 13 — Invoice Processing Types', () => {
  test('ExtractionStatus has 5 values', () => {
    const statuses: ExtractionStatus[] = ['pending', 'processing', 'completed', 'failed', 'needs_review']
    expect(statuses).toHaveLength(5)
  })

  test('FieldDataType has 4 values', () => {
    const types: FieldDataType[] = ['string', 'number', 'date', 'currency']
    expect(types).toHaveLength(4)
  })

  test('ExtractionRuleType has 4 values', () => {
    const types: ExtractionRuleType[] = ['field_mapping', 'auto_code', 'auto_approve', 'skip_review']
    expect(types).toHaveLength(4)
  })

  test('ExtractionAuditAction has 8 values', () => {
    const actions: ExtractionAuditAction[] = [
      'created', 'processing', 'completed', 'failed',
      'reviewed', 'approved', 'rejected', 'matched',
    ]
    expect(actions).toHaveLength(8)
  })

  test('ReviewDecision has 2 values', () => {
    const decisions: ReviewDecision[] = ['approved', 'rejected']
    expect(decisions).toHaveLength(2)
  })

  test('InvoiceExtraction interface has all required fields', () => {
    const extraction: InvoiceExtraction = {
      id: '1', company_id: '1', document_id: 'doc-1',
      status: 'pending', extracted_data: {},
      confidence_score: null, vendor_match_id: null, job_match_id: null,
      matched_bill_id: null, extraction_model: null,
      processing_time_ms: null, error_message: null,
      reviewed_by: null, reviewed_at: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(extraction.status).toBe('pending')
    expect(extraction.document_id).toBe('doc-1')
    expect(extraction.confidence_score).toBeNull()
  })

  test('ExtractionFieldMapping interface has all required fields', () => {
    const mapping: ExtractionFieldMapping = {
      id: '1', company_id: '1',
      field_name: 'vendor_name', extraction_path: 'header.vendor',
      data_type: 'string', is_required: true, default_value: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(mapping.field_name).toBe('vendor_name')
    expect(mapping.is_required).toBe(true)
  })

  test('InvoiceLineExtraction interface has all required fields', () => {
    const line: InvoiceLineExtraction = {
      id: '1', extraction_id: 'ext-1', line_number: 1,
      description: 'Lumber 2x4', quantity: 100, unit_price: 5.99,
      amount: 599.00, cost_code_match_id: null, confidence_score: 92.5,
      created_at: '2026-01-01',
    }
    expect(line.line_number).toBe(1)
    expect(line.amount).toBe(599.00)
  })

  test('ExtractionRule interface has all required fields', () => {
    const rule: ExtractionRule = {
      id: '1', company_id: '1', vendor_id: null,
      rule_type: 'auto_code', conditions: { min_confidence: 90 },
      actions: { cost_code: '31-100' }, is_active: true, priority: 10,
      created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(rule.rule_type).toBe('auto_code')
    expect(rule.is_active).toBe(true)
  })

  test('ExtractionAuditLog interface has all required fields', () => {
    const log: ExtractionAuditLog = {
      id: '1', extraction_id: 'ext-1', action: 'created',
      details: { document_id: 'doc-1' },
      performed_by: 'user-1', created_at: '2026-01-01',
    }
    expect(log.action).toBe('created')
    expect(log.performed_by).toBe('user-1')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 13 — Constants', () => {
  test('EXTRACTION_STATUSES has 5 entries with value and label', () => {
    expect(EXTRACTION_STATUSES).toHaveLength(5)
    for (const s of EXTRACTION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('EXTRACTION_STATUSES includes needs_review', () => {
    const values = EXTRACTION_STATUSES.map((s) => s.value)
    expect(values).toContain('needs_review')
    expect(values).toContain('pending')
    expect(values).toContain('completed')
  })

  test('FIELD_DATA_TYPES has 4 entries', () => {
    expect(FIELD_DATA_TYPES).toHaveLength(4)
    const values = FIELD_DATA_TYPES.map((t) => t.value)
    expect(values).toContain('string')
    expect(values).toContain('currency')
  })

  test('RULE_TYPES has 4 entries', () => {
    expect(RULE_TYPES).toHaveLength(4)
    const values = RULE_TYPES.map((t) => t.value)
    expect(values).toContain('field_mapping')
    expect(values).toContain('auto_code')
    expect(values).toContain('auto_approve')
    expect(values).toContain('skip_review')
  })

  test('AUDIT_ACTIONS has 8 entries', () => {
    expect(AUDIT_ACTIONS).toHaveLength(8)
    const values = AUDIT_ACTIONS.map((a) => a.value)
    expect(values).toContain('created')
    expect(values).toContain('matched')
  })

  test('REVIEW_DECISIONS has 2 entries', () => {
    expect(REVIEW_DECISIONS).toHaveLength(2)
    expect(REVIEW_DECISIONS[0].value).toBe('approved')
    expect(REVIEW_DECISIONS[1].value).toBe('rejected')
  })

  test('CONFIDENCE_THRESHOLDS has spec-defined defaults', () => {
    expect(CONFIDENCE_THRESHOLDS.AUTO_APPROVE).toBe(95)
    expect(CONFIDENCE_THRESHOLDS.HUMAN_REVIEW).toBe(80)
    expect(CONFIDENCE_THRESHOLDS.NEEDS_ATTENTION).toBe(70)
    expect(CONFIDENCE_THRESHOLDS.REJECT).toBe(50)
  })

  test('CONFIDENCE_THRESHOLDS are in descending order', () => {
    expect(CONFIDENCE_THRESHOLDS.AUTO_APPROVE).toBeGreaterThan(CONFIDENCE_THRESHOLDS.HUMAN_REVIEW)
    expect(CONFIDENCE_THRESHOLDS.HUMAN_REVIEW).toBeGreaterThan(CONFIDENCE_THRESHOLDS.NEEDS_ATTENTION)
    expect(CONFIDENCE_THRESHOLDS.NEEDS_ATTENTION).toBeGreaterThan(CONFIDENCE_THRESHOLDS.REJECT)
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 13 — Schema Enums', () => {
  test('extractionStatusEnum accepts all 5 statuses', () => {
    for (const s of ['pending', 'processing', 'completed', 'failed', 'needs_review']) {
      expect(extractionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('extractionStatusEnum rejects invalid status', () => {
    expect(() => extractionStatusEnum.parse('unknown')).toThrow()
    expect(() => extractionStatusEnum.parse('review')).toThrow()
  })

  test('fieldDataTypeEnum accepts all 4 types', () => {
    for (const t of ['string', 'number', 'date', 'currency']) {
      expect(fieldDataTypeEnum.parse(t)).toBe(t)
    }
  })

  test('fieldDataTypeEnum rejects invalid type', () => {
    expect(() => fieldDataTypeEnum.parse('boolean')).toThrow()
  })

  test('extractionRuleTypeEnum accepts all 4 types', () => {
    for (const t of ['field_mapping', 'auto_code', 'auto_approve', 'skip_review']) {
      expect(extractionRuleTypeEnum.parse(t)).toBe(t)
    }
  })

  test('auditActionEnum accepts all 8 actions', () => {
    for (const a of ['created', 'processing', 'completed', 'failed', 'reviewed', 'approved', 'rejected', 'matched']) {
      expect(auditActionEnum.parse(a)).toBe(a)
    }
  })

  test('reviewDecisionEnum accepts approved and rejected', () => {
    expect(reviewDecisionEnum.parse('approved')).toBe('approved')
    expect(reviewDecisionEnum.parse('rejected')).toBe('rejected')
  })

  test('reviewDecisionEnum rejects invalid decision', () => {
    expect(() => reviewDecisionEnum.parse('pending')).toThrow()
  })
})

// ============================================================================
// Schemas — CRUD Operations
// ============================================================================

describe('Module 13 — Validation Schemas', () => {
  test('listExtractionsSchema accepts valid params', () => {
    const result = listExtractionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listExtractionsSchema rejects limit > 100', () => {
    expect(() => listExtractionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listExtractionsSchema accepts status filter', () => {
    const result = listExtractionsSchema.parse({ status: 'needs_review' })
    expect(result.status).toBe('needs_review')
  })

  test('createExtractionSchema requires document_id', () => {
    expect(() => createExtractionSchema.parse({})).toThrow()
    const result = createExtractionSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.document_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('createExtractionSchema accepts optional extraction_model', () => {
    const result = createExtractionSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      extraction_model: 'claude-vision-v1',
    })
    expect(result.extraction_model).toBe('claude-vision-v1')
  })

  test('updateExtractionSchema accepts partial updates', () => {
    const result = updateExtractionSchema.parse({ status: 'completed', confidence_score: 92.5 })
    expect(result.status).toBe('completed')
    expect(result.confidence_score).toBe(92.5)
  })

  test('updateExtractionSchema rejects confidence_score > 100', () => {
    expect(() => updateExtractionSchema.parse({ confidence_score: 101 })).toThrow()
  })

  test('updateExtractionSchema rejects confidence_score < 0', () => {
    expect(() => updateExtractionSchema.parse({ confidence_score: -1 })).toThrow()
  })

  test('reviewExtractionSchema requires decision', () => {
    expect(() => reviewExtractionSchema.parse({})).toThrow()
    const result = reviewExtractionSchema.parse({ decision: 'approved' })
    expect(result.decision).toBe('approved')
  })

  test('reviewExtractionSchema accepts optional notes and corrections', () => {
    const result = reviewExtractionSchema.parse({
      decision: 'rejected',
      notes: 'Vendor name incorrect',
      corrections: { vendor_name: 'Acme Corp' },
    })
    expect(result.decision).toBe('rejected')
    expect(result.notes).toBe('Vendor name incorrect')
    expect(result.corrections).toHaveProperty('vendor_name')
  })

  test('createBillFromExtractionSchema requires vendor_id, bill_number, bill_date, amount', () => {
    expect(() => createBillFromExtractionSchema.parse({})).toThrow()
    expect(() => createBillFromExtractionSchema.parse({ vendor_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()

    const result = createBillFromExtractionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      bill_number: 'INV-001',
      bill_date: '2026-02-15',
      amount: 1500.00,
    })
    expect(result.bill_number).toBe('INV-001')
    expect(result.amount).toBe(1500.00)
  })

  test('createBillFromExtractionSchema rejects invalid date format', () => {
    expect(() => createBillFromExtractionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      bill_number: 'INV-001',
      bill_date: '02-15-2026',
      amount: 1500.00,
    })).toThrow()
  })

  test('createBillFromExtractionSchema accepts optional lines', () => {
    const result = createBillFromExtractionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      bill_number: 'INV-001',
      bill_date: '2026-02-15',
      amount: 1500.00,
      lines: [
        { amount: 1000.00, description: 'Lumber' },
        { amount: 500.00, description: 'Hardware' },
      ],
    })
    expect(result.lines).toHaveLength(2)
  })

  test('createFieldMappingSchema requires field_name and extraction_path', () => {
    expect(() => createFieldMappingSchema.parse({})).toThrow()
    const result = createFieldMappingSchema.parse({
      field_name: 'invoice_number',
      extraction_path: 'header.invoice_number',
    })
    expect(result.field_name).toBe('invoice_number')
    expect(result.data_type).toBe('string') // default
    expect(result.is_required).toBe(false)   // default
  })

  test('createFieldMappingSchema accepts all data types', () => {
    for (const dt of ['string', 'number', 'date', 'currency']) {
      const result = createFieldMappingSchema.parse({
        field_name: 'test',
        extraction_path: 'test.path',
        data_type: dt,
      })
      expect(result.data_type).toBe(dt)
    }
  })

  test('updateFieldMappingSchema accepts partial updates', () => {
    const result = updateFieldMappingSchema.parse({ is_required: true })
    expect(result.is_required).toBe(true)
    expect(result.field_name).toBeUndefined()
  })

  test('listExtractionRulesSchema accepts valid params', () => {
    const result = listExtractionRulesSchema.parse({ page: '2', limit: '10' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
  })

  test('createExtractionRuleSchema requires rule_type', () => {
    expect(() => createExtractionRuleSchema.parse({})).toThrow()
    const result = createExtractionRuleSchema.parse({
      rule_type: 'auto_code',
    })
    expect(result.rule_type).toBe('auto_code')
    expect(result.is_active).toBe(true)   // default
    expect(result.priority).toBe(0)        // default
  })

  test('createExtractionRuleSchema accepts full rule with conditions and actions', () => {
    const result = createExtractionRuleSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      rule_type: 'auto_approve',
      conditions: { min_confidence: 95, vendor_history_count: 50 },
      actions: { auto_create_bill: true },
      is_active: true,
      priority: 100,
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.priority).toBe(100)
  })

  test('updateExtractionRuleSchema accepts partial updates', () => {
    const result = updateExtractionRuleSchema.parse({ is_active: false, priority: 50 })
    expect(result.is_active).toBe(false)
    expect(result.priority).toBe(50)
    expect(result.rule_type).toBeUndefined()
  })

  test('createExtractionRuleSchema rejects priority > 9999', () => {
    expect(() => createExtractionRuleSchema.parse({
      rule_type: 'auto_code',
      priority: 10000,
    })).toThrow()
  })
})
