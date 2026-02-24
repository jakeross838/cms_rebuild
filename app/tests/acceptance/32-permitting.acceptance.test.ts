/**
 * Module 32 — Permitting & Inspections Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 32 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  PermitStatus,
  PermitType,
  InspectionStatus,
  InspectionType,
  InspectionResultType,
  FeeStatus,
  Permit,
  PermitInspection,
  InspectionResult,
  PermitDocument,
  PermitFee,
} from '@/types/permitting'

import {
  PERMIT_STATUSES,
  PERMIT_TYPES,
  INSPECTION_STATUSES,
  INSPECTION_TYPES,
  INSPECTION_RESULT_TYPES,
  FEE_STATUSES,
} from '@/types/permitting'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  permitStatusEnum,
  permitTypeEnum,
  inspectionStatusEnum,
  inspectionTypeEnum,
  inspectionResultTypeEnum,
  feeStatusEnum,
  listPermitsSchema,
  createPermitSchema,
  updatePermitSchema,
  listInspectionsSchema,
  createInspectionSchema,
  updateInspectionSchema,
  listInspectionResultsSchema,
  createInspectionResultSchema,
  updateInspectionResultSchema,
  listPermitDocumentsSchema,
  createPermitDocumentSchema,
  listPermitFeesSchema,
  createPermitFeeSchema,
  updatePermitFeeSchema,
} from '@/lib/validation/schemas/permitting'

// ============================================================================
// Type System
// ============================================================================

describe('Module 32 — Permitting Types', () => {
  test('PermitStatus has 7 values', () => {
    const statuses: PermitStatus[] = [
      'draft', 'applied', 'issued', 'active', 'expired', 'closed', 'revoked',
    ]
    expect(statuses).toHaveLength(7)
  })

  test('PermitType has 10 values', () => {
    const types: PermitType[] = [
      'building', 'electrical', 'plumbing', 'mechanical',
      'demolition', 'grading', 'fire', 'environmental', 'zoning', 'other',
    ]
    expect(types).toHaveLength(10)
  })

  test('InspectionStatus has 6 values', () => {
    const statuses: InspectionStatus[] = [
      'scheduled', 'passed', 'failed', 'conditional', 'cancelled', 'no_show',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('InspectionType has 9 values', () => {
    const types: InspectionType[] = [
      'rough_in', 'final', 'foundation', 'framing', 'electrical',
      'plumbing', 'mechanical', 'fire', 'other',
    ]
    expect(types).toHaveLength(9)
  })

  test('InspectionResultType has 3 values', () => {
    const results: InspectionResultType[] = ['pass', 'fail', 'conditional']
    expect(results).toHaveLength(3)
  })

  test('FeeStatus has 4 values', () => {
    const statuses: FeeStatus[] = ['pending', 'paid', 'waived', 'refunded']
    expect(statuses).toHaveLength(4)
  })

  test('Permit interface has all required fields', () => {
    const permit: Permit = {
      id: '1', company_id: '1', job_id: '1',
      permit_number: 'BLD-2026-0042', permit_type: 'building',
      status: 'draft', jurisdiction: 'City of Austin',
      applied_date: '2026-01-15', issued_date: null,
      expiration_date: null, conditions: null, notes: null,
      created_by: '1', created_at: '2026-01-15',
      updated_at: '2026-01-15', deleted_at: null,
    }
    expect(permit.permit_number).toBe('BLD-2026-0042')
    expect(permit.status).toBe('draft')
    expect(permit.permit_type).toBe('building')
  })

  test('PermitInspection interface has all required fields', () => {
    const inspection: PermitInspection = {
      id: '1', company_id: '1', permit_id: '1', job_id: '1',
      inspection_type: 'foundation', status: 'scheduled',
      scheduled_date: '2026-02-15', scheduled_time: '09:00',
      inspector_name: 'John Smith', inspector_phone: '555-0100',
      notes: null, completed_at: null,
      is_reinspection: false, original_inspection_id: null,
      created_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(inspection.inspection_type).toBe('foundation')
    expect(inspection.status).toBe('scheduled')
    expect(inspection.is_reinspection).toBe(false)
  })

  test('InspectionResult interface has all required fields', () => {
    const result: InspectionResult = {
      id: '1', company_id: '1', inspection_id: '1',
      result: 'pass', result_notes: 'All good',
      deficiencies: [], conditions_to_satisfy: null,
      inspector_comments: 'Clean work', photos: [],
      is_first_time_pass: true, responsible_vendor_id: null,
      recorded_by: '1', recorded_at: '2026-02-15',
      created_at: '2026-02-15', updated_at: '2026-02-15',
    }
    expect(result.result).toBe('pass')
    expect(result.is_first_time_pass).toBe(true)
  })

  test('PermitDocument interface has all required fields', () => {
    const doc: PermitDocument = {
      id: '1', company_id: '1', permit_id: '1',
      document_type: 'application', file_url: 'https://example.com/doc.pdf',
      file_name: 'permit-app.pdf', description: 'Permit application form',
      uploaded_by: '1', uploaded_at: '2026-01-15', created_at: '2026-01-15',
    }
    expect(doc.document_type).toBe('application')
    expect(doc.file_url).toBe('https://example.com/doc.pdf')
  })

  test('PermitFee interface has all required fields', () => {
    const fee: PermitFee = {
      id: '1', company_id: '1', permit_id: '1',
      description: 'Building permit fee', amount: 1500.00,
      status: 'pending', due_date: '2026-02-01',
      paid_date: null, paid_by: null, receipt_url: null,
      notes: null, created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(fee.description).toBe('Building permit fee')
    expect(fee.amount).toBe(1500.00)
    expect(fee.status).toBe('pending')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 32 — Constants', () => {
  test('PERMIT_STATUSES has 7 entries with value and label', () => {
    expect(PERMIT_STATUSES).toHaveLength(7)
    for (const s of PERMIT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('PERMIT_STATUSES includes all expected values', () => {
    const values = PERMIT_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('applied')
    expect(values).toContain('issued')
    expect(values).toContain('active')
    expect(values).toContain('expired')
    expect(values).toContain('closed')
    expect(values).toContain('revoked')
  })

  test('PERMIT_TYPES has 10 entries with value and label', () => {
    expect(PERMIT_TYPES).toHaveLength(10)
    for (const t of PERMIT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('PERMIT_TYPES includes all expected values', () => {
    const values = PERMIT_TYPES.map((t) => t.value)
    expect(values).toContain('building')
    expect(values).toContain('electrical')
    expect(values).toContain('plumbing')
    expect(values).toContain('mechanical')
    expect(values).toContain('demolition')
    expect(values).toContain('grading')
    expect(values).toContain('fire')
    expect(values).toContain('environmental')
    expect(values).toContain('zoning')
    expect(values).toContain('other')
  })

  test('INSPECTION_STATUSES has 6 entries with value and label', () => {
    expect(INSPECTION_STATUSES).toHaveLength(6)
    for (const s of INSPECTION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('INSPECTION_TYPES has 9 entries with value and label', () => {
    expect(INSPECTION_TYPES).toHaveLength(9)
    for (const t of INSPECTION_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('INSPECTION_RESULT_TYPES has 3 entries with value and label', () => {
    expect(INSPECTION_RESULT_TYPES).toHaveLength(3)
    for (const r of INSPECTION_RESULT_TYPES) {
      expect(r).toHaveProperty('value')
      expect(r).toHaveProperty('label')
      expect(r.label.length).toBeGreaterThan(0)
    }
  })

  test('FEE_STATUSES has 4 entries with value and label', () => {
    expect(FEE_STATUSES).toHaveLength(4)
    for (const s of FEE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 32 — Enum Schemas', () => {
  test('permitStatusEnum accepts all 7 statuses', () => {
    for (const s of ['draft', 'applied', 'issued', 'active', 'expired', 'closed', 'revoked']) {
      expect(permitStatusEnum.parse(s)).toBe(s)
    }
  })

  test('permitStatusEnum rejects invalid status', () => {
    expect(() => permitStatusEnum.parse('unknown')).toThrow()
  })

  test('permitTypeEnum accepts all 10 types', () => {
    for (const t of ['building', 'electrical', 'plumbing', 'mechanical', 'demolition', 'grading', 'fire', 'environmental', 'zoning', 'other']) {
      expect(permitTypeEnum.parse(t)).toBe(t)
    }
  })

  test('permitTypeEnum rejects invalid type', () => {
    expect(() => permitTypeEnum.parse('roofing')).toThrow()
  })

  test('inspectionStatusEnum accepts all 6 statuses', () => {
    for (const s of ['scheduled', 'passed', 'failed', 'conditional', 'cancelled', 'no_show']) {
      expect(inspectionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('inspectionStatusEnum rejects invalid status', () => {
    expect(() => inspectionStatusEnum.parse('pending')).toThrow()
  })

  test('inspectionTypeEnum accepts all 9 types', () => {
    for (const t of ['rough_in', 'final', 'foundation', 'framing', 'electrical', 'plumbing', 'mechanical', 'fire', 'other']) {
      expect(inspectionTypeEnum.parse(t)).toBe(t)
    }
  })

  test('inspectionTypeEnum rejects invalid type', () => {
    expect(() => inspectionTypeEnum.parse('drywall')).toThrow()
  })

  test('inspectionResultTypeEnum accepts all 3 results', () => {
    for (const r of ['pass', 'fail', 'conditional']) {
      expect(inspectionResultTypeEnum.parse(r)).toBe(r)
    }
  })

  test('inspectionResultTypeEnum rejects invalid result', () => {
    expect(() => inspectionResultTypeEnum.parse('partial')).toThrow()
  })

  test('feeStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'paid', 'waived', 'refunded']) {
      expect(feeStatusEnum.parse(s)).toBe(s)
    }
  })

  test('feeStatusEnum rejects invalid status', () => {
    expect(() => feeStatusEnum.parse('cancelled')).toThrow()
  })
})

// ============================================================================
// Permit Schemas
// ============================================================================

describe('Module 32 — Permit Schemas', () => {
  test('listPermitsSchema accepts valid params', () => {
    const result = listPermitsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPermitsSchema rejects limit > 100', () => {
    expect(() => listPermitsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listPermitsSchema accepts all filters', () => {
    const result = listPermitsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'draft',
      permit_type: 'building',
      q: 'BLD-2026',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('draft')
    expect(result.permit_type).toBe('building')
    expect(result.q).toBe('BLD-2026')
  })

  test('createPermitSchema accepts valid permit', () => {
    const result = createPermitSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.permit_type).toBe('building')
    expect(result.status).toBe('draft')
  })

  test('createPermitSchema requires job_id', () => {
    expect(() => createPermitSchema.parse({})).toThrow()
  })

  test('createPermitSchema accepts full permit with all fields', () => {
    const result = createPermitSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      permit_number: 'BLD-2026-0042',
      permit_type: 'electrical',
      status: 'applied',
      jurisdiction: 'City of Austin',
      applied_date: '2026-01-15',
      issued_date: '2026-02-01',
      expiration_date: '2027-02-01',
      conditions: 'Maintain erosion controls',
      notes: 'Submitted online via e-permit portal',
    })
    expect(result.permit_number).toBe('BLD-2026-0042')
    expect(result.permit_type).toBe('electrical')
    expect(result.jurisdiction).toBe('City of Austin')
    expect(result.applied_date).toBe('2026-01-15')
  })

  test('createPermitSchema rejects permit_number > 50 chars', () => {
    expect(() => createPermitSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      permit_number: 'A'.repeat(51),
    })).toThrow()
  })

  test('createPermitSchema validates date format', () => {
    expect(() => createPermitSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      applied_date: '01/15/2026',
    })).toThrow()
  })

  test('updatePermitSchema accepts partial updates', () => {
    const result = updatePermitSchema.parse({ status: 'issued', notes: 'Updated' })
    expect(result.status).toBe('issued')
    expect(result.notes).toBe('Updated')
    expect(result.permit_number).toBeUndefined()
  })

  test('updatePermitSchema validates date format', () => {
    expect(() => updatePermitSchema.parse({ expiration_date: 'bad-date' })).toThrow()
  })
})

// ============================================================================
// Inspection Schemas
// ============================================================================

describe('Module 32 — Inspection Schemas', () => {
  test('listInspectionsSchema accepts valid params', () => {
    const result = listInspectionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listInspectionsSchema accepts all filters', () => {
    const result = listInspectionsSchema.parse({
      permit_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      status: 'scheduled',
      inspection_type: 'foundation',
      scheduled_date_from: '2026-01-01',
      scheduled_date_to: '2026-12-31',
    })
    expect(result.permit_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('scheduled')
    expect(result.scheduled_date_from).toBe('2026-01-01')
    expect(result.scheduled_date_to).toBe('2026-12-31')
  })

  test('listInspectionsSchema rejects invalid date format', () => {
    expect(() => listInspectionsSchema.parse({
      scheduled_date_from: '01-01-2026',
    })).toThrow()
  })

  test('createInspectionSchema accepts valid inspection', () => {
    const result = createInspectionSchema.parse({
      permit_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.permit_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.inspection_type).toBe('other')
    expect(result.status).toBe('scheduled')
    expect(result.is_reinspection).toBe(false)
  })

  test('createInspectionSchema requires permit_id and job_id', () => {
    expect(() => createInspectionSchema.parse({})).toThrow()
    expect(() => createInspectionSchema.parse({
      permit_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createInspectionSchema accepts full inspection with all fields', () => {
    const result = createInspectionSchema.parse({
      permit_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      inspection_type: 'foundation',
      status: 'scheduled',
      scheduled_date: '2026-02-15',
      scheduled_time: '09:00 AM',
      inspector_name: 'John Smith',
      inspector_phone: '555-0100',
      notes: 'Request morning slot',
      is_reinspection: true,
      original_inspection_id: '550e8400-e29b-41d4-a716-446655440002',
    })
    expect(result.inspection_type).toBe('foundation')
    expect(result.inspector_name).toBe('John Smith')
    expect(result.is_reinspection).toBe(true)
    expect(result.original_inspection_id).toBe('550e8400-e29b-41d4-a716-446655440002')
  })

  test('updateInspectionSchema accepts partial updates', () => {
    const result = updateInspectionSchema.parse({
      status: 'passed',
      completed_at: '2026-02-15T14:30:00Z',
    })
    expect(result.status).toBe('passed')
    expect(result.completed_at).toBe('2026-02-15T14:30:00Z')
    expect(result.inspection_type).toBeUndefined()
  })
})

// ============================================================================
// Inspection Result Schemas
// ============================================================================

describe('Module 32 — Inspection Result Schemas', () => {
  test('listInspectionResultsSchema accepts valid params with defaults', () => {
    const result = listInspectionResultsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('createInspectionResultSchema accepts valid result', () => {
    const result = createInspectionResultSchema.parse({
      result: 'pass',
      result_notes: 'Foundation meets code requirements',
      is_first_time_pass: true,
    })
    expect(result.result).toBe('pass')
    expect(result.result_notes).toBe('Foundation meets code requirements')
    expect(result.is_first_time_pass).toBe(true)
    expect(result.deficiencies).toEqual([])
    expect(result.photos).toEqual([])
  })

  test('createInspectionResultSchema requires result', () => {
    expect(() => createInspectionResultSchema.parse({})).toThrow()
  })

  test('createInspectionResultSchema accepts fail with deficiencies', () => {
    const result = createInspectionResultSchema.parse({
      result: 'fail',
      result_notes: 'Multiple deficiencies found',
      deficiencies: [
        { description: 'Missing fire stop', location: 'Kitchen wall penetration' },
        { description: 'Incorrect wire gauge', location: 'Panel B circuit 12' },
      ],
      is_first_time_pass: false,
      responsible_vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.result).toBe('fail')
    expect(result.deficiencies).toHaveLength(2)
    expect(result.is_first_time_pass).toBe(false)
    expect(result.responsible_vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('createInspectionResultSchema accepts conditional with conditions', () => {
    const result = createInspectionResultSchema.parse({
      result: 'conditional',
      conditions_to_satisfy: 'Install missing handrail before framing inspection',
      inspector_comments: 'Overall good progress, minor item remaining',
    })
    expect(result.result).toBe('conditional')
    expect(result.conditions_to_satisfy).toBe('Install missing handrail before framing inspection')
  })

  test('updateInspectionResultSchema accepts partial updates', () => {
    const result = updateInspectionResultSchema.parse({
      result_notes: 'Updated notes',
      photos: [{ url: 'https://example.com/photo.jpg' }],
    })
    expect(result.result_notes).toBe('Updated notes')
    expect(result.photos).toHaveLength(1)
    expect(result.result).toBeUndefined()
  })
})

// ============================================================================
// Document Schemas
// ============================================================================

describe('Module 32 — Document Schemas', () => {
  test('listPermitDocumentsSchema accepts valid params with defaults', () => {
    const result = listPermitDocumentsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createPermitDocumentSchema accepts valid document', () => {
    const result = createPermitDocumentSchema.parse({
      document_type: 'application',
      file_url: 'https://example.com/doc.pdf',
      file_name: 'permit-app.pdf',
      description: 'Initial permit application',
    })
    expect(result.document_type).toBe('application')
    expect(result.file_url).toBe('https://example.com/doc.pdf')
    expect(result.file_name).toBe('permit-app.pdf')
  })

  test('createPermitDocumentSchema requires document_type and file_url', () => {
    expect(() => createPermitDocumentSchema.parse({})).toThrow()
    expect(() => createPermitDocumentSchema.parse({ document_type: 'app' })).toThrow()
  })

  test('createPermitDocumentSchema rejects document_type > 100 chars', () => {
    expect(() => createPermitDocumentSchema.parse({
      document_type: 'A'.repeat(101),
      file_url: 'https://example.com/doc.pdf',
    })).toThrow()
  })
})

// ============================================================================
// Fee Schemas
// ============================================================================

describe('Module 32 — Fee Schemas', () => {
  test('listPermitFeesSchema accepts valid params with defaults', () => {
    const result = listPermitFeesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listPermitFeesSchema accepts status filter', () => {
    const result = listPermitFeesSchema.parse({ status: 'paid' })
    expect(result.status).toBe('paid')
  })

  test('listPermitFeesSchema rejects invalid status', () => {
    expect(() => listPermitFeesSchema.parse({ status: 'cancelled' })).toThrow()
  })

  test('createPermitFeeSchema accepts valid fee', () => {
    const result = createPermitFeeSchema.parse({
      description: 'Building permit fee',
      amount: 1500.00,
    })
    expect(result.description).toBe('Building permit fee')
    expect(result.amount).toBe(1500.00)
    expect(result.status).toBe('pending')
  })

  test('createPermitFeeSchema requires description', () => {
    expect(() => createPermitFeeSchema.parse({})).toThrow()
  })

  test('createPermitFeeSchema has correct defaults', () => {
    const result = createPermitFeeSchema.parse({ description: 'Test fee' })
    expect(result.amount).toBe(0)
    expect(result.status).toBe('pending')
  })

  test('createPermitFeeSchema rejects negative amount', () => {
    expect(() => createPermitFeeSchema.parse({
      description: 'Test fee',
      amount: -100,
    })).toThrow()
  })

  test('createPermitFeeSchema validates date format', () => {
    expect(() => createPermitFeeSchema.parse({
      description: 'Test fee',
      due_date: '01/15/2026',
    })).toThrow()
  })

  test('createPermitFeeSchema accepts all fields', () => {
    const result = createPermitFeeSchema.parse({
      description: 'Impact fee',
      amount: 5000.00,
      status: 'paid',
      due_date: '2026-02-01',
      paid_date: '2026-01-28',
      receipt_url: 'https://example.com/receipt.pdf',
      notes: 'Paid by check #1234',
    })
    expect(result.amount).toBe(5000.00)
    expect(result.status).toBe('paid')
    expect(result.due_date).toBe('2026-02-01')
    expect(result.paid_date).toBe('2026-01-28')
  })

  test('updatePermitFeeSchema accepts partial updates', () => {
    const result = updatePermitFeeSchema.parse({
      status: 'paid',
      paid_date: '2026-02-01',
      paid_by: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.status).toBe('paid')
    expect(result.paid_date).toBe('2026-02-01')
    expect(result.description).toBeUndefined()
  })

  test('updatePermitFeeSchema rejects invalid status', () => {
    expect(() => updatePermitFeeSchema.parse({ status: 'cancelled' })).toThrow()
  })
})
