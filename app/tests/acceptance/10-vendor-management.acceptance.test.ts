/**
 * Module 10 — Vendor Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 10 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  InsuranceType,
  InsuranceStatus,
  ComplianceRequirementType,
  ComplianceStatus,
  RatingCategory,
  VendorContact,
  VendorTrade,
  VendorInsurance,
  VendorCompliance,
  VendorRating,
} from '@/types/vendor-management'

import {
  INSURANCE_TYPES,
  INSURANCE_STATUSES,
  COMPLIANCE_TYPES,
  COMPLIANCE_STATUSES,
  RATING_CATEGORIES,
} from '@/types/vendor-management'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  insuranceTypeEnum,
  insuranceStatusEnum,
  complianceRequirementTypeEnum,
  complianceStatusEnum,
  ratingCategoryEnum,
  createVendorContactSchema,
  updateVendorContactSchema,
  listVendorContactsSchema,
  createVendorInsuranceSchema,
  updateVendorInsuranceSchema,
  listVendorInsuranceSchema,
  createVendorComplianceSchema,
  updateVendorComplianceSchema,
  listVendorComplianceSchema,
  createVendorRatingSchema,
  listVendorRatingsSchema,
} from '@/lib/validation/schemas/vendor-management'

// ============================================================================
// Type System
// ============================================================================

describe('Module 10 — Vendor Management Types', () => {
  test('InsuranceType has 5 values', () => {
    const types: InsuranceType[] = [
      'general_liability', 'workers_comp', 'auto', 'umbrella', 'professional',
    ]
    expect(types).toHaveLength(5)
  })

  test('InsuranceStatus has 4 values', () => {
    const statuses: InsuranceStatus[] = ['active', 'expiring_soon', 'expired', 'not_on_file']
    expect(statuses).toHaveLength(4)
  })

  test('ComplianceRequirementType has 6 values', () => {
    const types: ComplianceRequirementType[] = [
      'license', 'bond', 'w9', 'insurance', 'safety_cert', 'prequalification',
    ]
    expect(types).toHaveLength(6)
  })

  test('ComplianceStatus has 5 values', () => {
    const statuses: ComplianceStatus[] = [
      'compliant', 'non_compliant', 'pending', 'waived', 'expired',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('RatingCategory has 5 values', () => {
    const cats: RatingCategory[] = ['quality', 'schedule', 'communication', 'safety', 'value']
    expect(cats).toHaveLength(5)
  })

  test('VendorContact interface has all required fields', () => {
    const contact: VendorContact = {
      id: '1', vendor_id: '1', company_id: '1',
      name: 'John Smith', title: 'Project Manager',
      email: 'john@example.com', phone: '555-1234',
      is_primary: true,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(contact.name).toBe('John Smith')
    expect(contact.is_primary).toBe(true)
  })

  test('VendorTrade interface has all required fields', () => {
    const trade: VendorTrade = {
      id: '1', vendor_id: '1', company_id: '1',
      trade_name: 'Electrical', is_primary: true,
      created_at: '2026-01-01',
    }
    expect(trade.trade_name).toBe('Electrical')
  })

  test('VendorInsurance interface has all required fields', () => {
    const ins: VendorInsurance = {
      id: '1', vendor_id: '1', company_id: '1',
      insurance_type: 'general_liability',
      carrier_name: 'State Farm', policy_number: 'GL-12345',
      coverage_amount: 1000000, expiration_date: '2027-01-15',
      certificate_document_id: null, status: 'active',
      verified_at: null, verified_by: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(ins.insurance_type).toBe('general_liability')
    expect(ins.coverage_amount).toBe(1000000)
  })

  test('VendorCompliance interface has all required fields', () => {
    const comp: VendorCompliance = {
      id: '1', vendor_id: '1', company_id: '1',
      requirement_type: 'license', requirement_name: 'Electrical License',
      status: 'compliant', expiration_date: '2027-06-30',
      document_id: null, notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(comp.requirement_type).toBe('license')
    expect(comp.status).toBe('compliant')
  })

  test('VendorRating interface has all required fields', () => {
    const rating: VendorRating = {
      id: '1', vendor_id: '1', company_id: '1',
      job_id: null, category: 'quality',
      rating: 4, review_text: 'Great work',
      rated_by: '1',
      created_at: '2026-01-01',
    }
    expect(rating.category).toBe('quality')
    expect(rating.rating).toBe(4)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 10 — Constants', () => {
  test('INSURANCE_TYPES has 5 entries with value and label', () => {
    expect(INSURANCE_TYPES).toHaveLength(5)
    for (const it of INSURANCE_TYPES) {
      expect(it).toHaveProperty('value')
      expect(it).toHaveProperty('label')
      expect(it.label.length).toBeGreaterThan(0)
    }
  })

  test('INSURANCE_STATUSES has 4 entries with value and label', () => {
    expect(INSURANCE_STATUSES).toHaveLength(4)
    for (const is of INSURANCE_STATUSES) {
      expect(is).toHaveProperty('value')
      expect(is).toHaveProperty('label')
    }
  })

  test('COMPLIANCE_TYPES has 6 entries with value and label', () => {
    expect(COMPLIANCE_TYPES).toHaveLength(6)
    for (const ct of COMPLIANCE_TYPES) {
      expect(ct).toHaveProperty('value')
      expect(ct).toHaveProperty('label')
      expect(ct.label.length).toBeGreaterThan(0)
    }
  })

  test('COMPLIANCE_STATUSES has 5 entries with value and label', () => {
    expect(COMPLIANCE_STATUSES).toHaveLength(5)
    for (const cs of COMPLIANCE_STATUSES) {
      expect(cs).toHaveProperty('value')
      expect(cs).toHaveProperty('label')
    }
  })

  test('RATING_CATEGORIES has 5 entries with value and label', () => {
    expect(RATING_CATEGORIES).toHaveLength(5)
    for (const rc of RATING_CATEGORIES) {
      expect(rc).toHaveProperty('value')
      expect(rc).toHaveProperty('label')
      expect(rc.label.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 10 — Schema Enums', () => {
  test('insuranceTypeEnum accepts all 5 types', () => {
    for (const t of ['general_liability', 'workers_comp', 'auto', 'umbrella', 'professional']) {
      expect(insuranceTypeEnum.parse(t)).toBe(t)
    }
  })

  test('insuranceTypeEnum rejects invalid type', () => {
    expect(() => insuranceTypeEnum.parse('health')).toThrow()
  })

  test('insuranceStatusEnum accepts all 4 statuses', () => {
    for (const s of ['active', 'expiring_soon', 'expired', 'not_on_file']) {
      expect(insuranceStatusEnum.parse(s)).toBe(s)
    }
  })

  test('complianceRequirementTypeEnum accepts all 6 types', () => {
    for (const t of ['license', 'bond', 'w9', 'insurance', 'safety_cert', 'prequalification']) {
      expect(complianceRequirementTypeEnum.parse(t)).toBe(t)
    }
  })

  test('complianceStatusEnum accepts all 5 statuses', () => {
    for (const s of ['compliant', 'non_compliant', 'pending', 'waived', 'expired']) {
      expect(complianceStatusEnum.parse(s)).toBe(s)
    }
  })

  test('ratingCategoryEnum accepts all 5 categories', () => {
    for (const c of ['quality', 'schedule', 'communication', 'safety', 'value']) {
      expect(ratingCategoryEnum.parse(c)).toBe(c)
    }
  })

  test('ratingCategoryEnum rejects invalid category', () => {
    expect(() => ratingCategoryEnum.parse('price')).toThrow()
  })
})

// ============================================================================
// Schemas — CRUD
// ============================================================================

describe('Module 10 — CRUD Schemas', () => {
  // ── Contacts ─────────────────────────────────────────────────────────

  test('createVendorContactSchema accepts valid contact', () => {
    const result = createVendorContactSchema.parse({
      name: 'Jane Doe',
      title: 'Safety Director',
      email: 'jane@example.com',
      phone: '555-9876',
      is_primary: true,
    })
    expect(result.name).toBe('Jane Doe')
    expect(result.is_primary).toBe(true)
  })

  test('createVendorContactSchema requires name', () => {
    expect(() => createVendorContactSchema.parse({})).toThrow()
    expect(() => createVendorContactSchema.parse({ name: '' })).toThrow()
  })

  test('updateVendorContactSchema accepts partial updates', () => {
    const result = updateVendorContactSchema.parse({ phone: '555-0000' })
    expect(result.phone).toBe('555-0000')
    expect(result.name).toBeUndefined()
  })

  test('listVendorContactsSchema applies defaults', () => {
    const result = listVendorContactsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  // ── Insurance ────────────────────────────────────────────────────────

  test('createVendorInsuranceSchema accepts valid insurance', () => {
    const result = createVendorInsuranceSchema.parse({
      insurance_type: 'general_liability',
      carrier_name: 'State Farm',
      policy_number: 'GL-12345',
      coverage_amount: 1000000,
      expiration_date: '2027-06-30',
    })
    expect(result.insurance_type).toBe('general_liability')
    expect(result.carrier_name).toBe('State Farm')
    expect(result.status).toBe('active') // default
  })

  test('createVendorInsuranceSchema requires carrier_name, policy_number, expiration_date', () => {
    expect(() => createVendorInsuranceSchema.parse({
      insurance_type: 'auto',
    })).toThrow()
  })

  test('createVendorInsuranceSchema rejects invalid expiration_date format', () => {
    expect(() => createVendorInsuranceSchema.parse({
      insurance_type: 'auto',
      carrier_name: 'Geico',
      policy_number: 'A-1',
      expiration_date: 'not-a-date',
    })).toThrow()
  })

  test('updateVendorInsuranceSchema accepts partial updates', () => {
    const result = updateVendorInsuranceSchema.parse({ status: 'expired' })
    expect(result.status).toBe('expired')
    expect(result.carrier_name).toBeUndefined()
  })

  test('listVendorInsuranceSchema accepts filters', () => {
    const result = listVendorInsuranceSchema.parse({
      status: 'active',
      insurance_type: 'workers_comp',
    })
    expect(result.status).toBe('active')
    expect(result.insurance_type).toBe('workers_comp')
  })

  test('listVendorInsuranceSchema rejects limit > 100', () => {
    expect(() => listVendorInsuranceSchema.parse({ limit: 200 })).toThrow()
  })

  // ── Compliance ───────────────────────────────────────────────────────

  test('createVendorComplianceSchema accepts valid compliance', () => {
    const result = createVendorComplianceSchema.parse({
      requirement_type: 'license',
      requirement_name: 'Electrical License',
      status: 'compliant',
      expiration_date: '2027-12-31',
    })
    expect(result.requirement_type).toBe('license')
    expect(result.requirement_name).toBe('Electrical License')
  })

  test('createVendorComplianceSchema requires requirement_type and requirement_name', () => {
    expect(() => createVendorComplianceSchema.parse({})).toThrow()
    expect(() => createVendorComplianceSchema.parse({
      requirement_type: 'w9',
    })).toThrow()
  })

  test('updateVendorComplianceSchema accepts partial updates', () => {
    const result = updateVendorComplianceSchema.parse({ status: 'expired' })
    expect(result.status).toBe('expired')
  })

  test('listVendorComplianceSchema applies defaults and accepts filters', () => {
    const result = listVendorComplianceSchema.parse({
      status: 'pending',
      requirement_type: 'bond',
    })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.status).toBe('pending')
    expect(result.requirement_type).toBe('bond')
  })

  // ── Ratings ──────────────────────────────────────────────────────────

  test('createVendorRatingSchema accepts valid rating', () => {
    const result = createVendorRatingSchema.parse({
      category: 'quality',
      rating: 5,
      review_text: 'Excellent quality work on this project.',
    })
    expect(result.category).toBe('quality')
    expect(result.rating).toBe(5)
  })

  test('createVendorRatingSchema enforces rating 1-5 range', () => {
    expect(() => createVendorRatingSchema.parse({
      category: 'safety', rating: 0,
    })).toThrow()
    expect(() => createVendorRatingSchema.parse({
      category: 'safety', rating: 6,
    })).toThrow()
  })

  test('createVendorRatingSchema requires category and rating', () => {
    expect(() => createVendorRatingSchema.parse({})).toThrow()
    expect(() => createVendorRatingSchema.parse({ category: 'quality' })).toThrow()
  })

  test('listVendorRatingsSchema accepts category and job_id filters', () => {
    const result = listVendorRatingsSchema.parse({
      category: 'schedule',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.category).toBe('schedule')
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('listVendorRatingsSchema rejects invalid job_id', () => {
    expect(() => listVendorRatingsSchema.parse({
      job_id: 'not-a-uuid',
    })).toThrow()
  })
})
