/**
 * Module 03 — Core Data Model Acceptance Tests
 * Verifies schema contracts and type correctness for jobs, clients, vendors, cost codes.
 */

import { describe, it, expect } from 'vitest'

import {
  createJobSchema,
  updateJobSchema,
  listJobsSchema,
  jobStatusEnum,
  contractTypeEnum,
  projectTypeEnum,
} from '@/lib/validation/schemas/jobs'

import {
  createClientSchema,
  updateClientSchema,
  listClientsSchema,
} from '@/lib/validation/schemas/clients'

import {
  createVendorSchema,
  updateVendorSchema,
  listVendorsSchema,
} from '@/lib/validation/schemas/vendors'

import {
  createCostCodeSchema,
  updateCostCodeSchema,
  listCostCodesSchema,
  costCodeCategoryEnum,
} from '@/lib/validation/schemas/cost-codes'

import type { Job, Client, Vendor, CostCode, JobStatus, ProjectType, CostCodeCategory } from '@/types/database'

// ============================================================================
// Spec: Type coverage — deleted_at exists on all 4 entity types
// ============================================================================

describe('Spec: All core entities have deleted_at for soft delete', () => {
  it('Job type includes deleted_at', () => {
    const check: Job['deleted_at'] = null
    expect(check).toBeNull()
  })

  it('Client type includes deleted_at', () => {
    const check: Client['deleted_at'] = null
    expect(check).toBeNull()
  })

  it('Vendor type includes deleted_at', () => {
    const check: Vendor['deleted_at'] = null
    expect(check).toBeNull()
  })

  it('CostCode type includes deleted_at', () => {
    const check: CostCode['deleted_at'] = null
    expect(check).toBeNull()
  })
})

// ============================================================================
// Spec: JobStatus includes all 8 states from DB CHECK constraint
// ============================================================================

describe('Spec: JobStatus enum completeness', () => {
  it('includes all 8 job statuses', () => {
    const statuses: JobStatus[] = [
      'lead',
      'pre_construction',
      'active',
      'on_hold',
      'completed',
      'warranty',
      'closed',
      'cancelled',
    ]
    for (const s of statuses) {
      expect(jobStatusEnum.safeParse(s).success).toBe(true)
    }
  })

  it('rejects invalid status', () => {
    expect(jobStatusEnum.safeParse('invalid_status').success).toBe(false)
  })
})

// ============================================================================
// Spec: ProjectType enum matches DB CHECK constraint
// ============================================================================

describe('Spec: ProjectType enum completeness', () => {
  it('includes all 6 project types', () => {
    const types: ProjectType[] = [
      'new_construction',
      'renovation',
      'addition',
      'remodel',
      'commercial',
      'other',
    ]
    for (const t of types) {
      expect(projectTypeEnum.safeParse(t).success).toBe(true)
    }
  })
})

// ============================================================================
// Spec: CostCodeCategory enum matches DB CHECK constraint
// ============================================================================

describe('Spec: CostCodeCategory enum completeness', () => {
  it('includes all 5 categories', () => {
    const categories: CostCodeCategory[] = [
      'labor',
      'material',
      'subcontractor',
      'equipment',
      'other',
    ]
    for (const c of categories) {
      expect(costCodeCategoryEnum.safeParse(c).success).toBe(true)
    }
  })
})

// ============================================================================
// Spec: Job schema acceptance
// ============================================================================

describe('Spec: createJobSchema validates correctly', () => {
  it('accepts valid minimal job', () => {
    const result = createJobSchema.safeParse({ name: 'Test Project' })
    expect(result.success).toBe(true)
  })

  it('accepts valid full job', () => {
    const result = createJobSchema.safeParse({
      name: 'Custom Home Build',
      client_id: '550e8400-e29b-41d4-a716-446655440000',
      job_number: 'JOB-2026-001',
      description: 'A custom home project',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      latitude: 30.2672,
      longitude: -97.7431,
      project_type: 'new_construction',
      status: 'pre_construction',
      contract_type: 'fixed_price',
      contract_amount: 500000,
      cost_plus_markup: 15.5,
      start_date: '2026-03-01',
      target_completion: '2026-12-31',
      sqft_conditioned: 3200,
      sqft_total: 4500,
      sqft_garage: 600,
      bedrooms: 4,
      bathrooms: 3.5,
      stories: 2,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = createJobSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = createJobSchema.safeParse({ name: 'Test', status: 'bogus' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid contract_type', () => {
    const result = createJobSchema.safeParse({ name: 'Test', contract_type: 'bogus' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid project_type', () => {
    const result = createJobSchema.safeParse({ name: 'Test', project_type: 'bogus' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid client_id (non-UUID)', () => {
    const result = createJobSchema.safeParse({ name: 'Test', client_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects negative contract_amount', () => {
    const result = createJobSchema.safeParse({ name: 'Test', contract_amount: -100 })
    expect(result.success).toBe(false)
  })
})

describe('Spec: updateJobSchema is partial', () => {
  it('accepts empty update (all optional)', () => {
    const result = updateJobSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update with just status', () => {
    const result = updateJobSchema.safeParse({ status: 'active' })
    expect(result.success).toBe(true)
  })
})

describe('Spec: listJobsSchema validates query params', () => {
  it('applies defaults for empty input', () => {
    const result = listJobsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
      expect(result.data.sortBy).toBe('updated_at')
      expect(result.data.sortOrder).toBe('asc')
    }
  })

  it('validates status filter', () => {
    const result = listJobsSchema.safeParse({ status: 'active' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status filter', () => {
    const result = listJobsSchema.safeParse({ status: 'bogus' })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Spec: Client schema acceptance
// ============================================================================

describe('Spec: createClientSchema validates correctly', () => {
  it('accepts valid minimal client', () => {
    const result = createClientSchema.safeParse({ name: 'Jane Doe' })
    expect(result.success).toBe(true)
  })

  it('accepts valid full client', () => {
    const result = createClientSchema.safeParse({
      name: 'John Smith',
      company_name: 'Smith Industries',
      email: 'john@smith.com',
      phone: '555-123-4567',
      mobile_phone: '555-987-6543',
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zip: '75001',
      spouse_name: 'Jane Smith',
      spouse_email: 'jane@smith.com',
      spouse_phone: '555-222-3333',
      lead_source: 'referral',
      referred_by: 'Bob Jones',
      portal_enabled: true,
      notes: 'VIP client',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = createClientSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = createClientSchema.safeParse({ name: 'Test', email: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})

describe('Spec: updateClientSchema is partial', () => {
  it('accepts empty update', () => {
    const result = updateClientSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Spec: Vendor schema acceptance
// ============================================================================

describe('Spec: createVendorSchema validates correctly', () => {
  it('accepts valid minimal vendor', () => {
    const result = createVendorSchema.safeParse({ name: 'ABC Electric' })
    expect(result.success).toBe(true)
  })

  it('accepts valid full vendor', () => {
    const result = createVendorSchema.safeParse({
      name: 'ABC Electric LLC',
      dba_name: 'ABC Electric',
      email: 'contact@abcelectric.com',
      phone: '555-456-7890',
      website: 'https://abcelectric.com',
      address: '789 Industrial Blvd',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      trade: 'Electrical',
      trades: ['Electrical', 'Low Voltage'],
      tax_id: '12-3456789',
      license_number: 'ELEC-123',
      license_expiration: '2027-01-01',
      insurance_expiration: '2026-12-31',
      gl_coverage_amount: 1000000,
      workers_comp_expiration: '2026-12-31',
      payment_terms: 'Net 30',
      is_active: true,
      is_1099: true,
      w9_on_file: true,
      notes: 'Preferred electrical vendor',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = createVendorSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid website URL', () => {
    const result = createVendorSchema.safeParse({ name: 'Test', website: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects negative gl_coverage_amount', () => {
    const result = createVendorSchema.safeParse({ name: 'Test', gl_coverage_amount: -500 })
    expect(result.success).toBe(false)
  })
})

describe('Spec: updateVendorSchema is partial', () => {
  it('accepts empty update', () => {
    const result = updateVendorSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Spec: Cost Code schema acceptance
// ============================================================================

describe('Spec: createCostCodeSchema validates correctly', () => {
  it('accepts valid minimal cost code', () => {
    const result = createCostCodeSchema.safeParse({
      code: '01-100',
      division: '01 - General',
      name: 'Supervision',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid full cost code', () => {
    const result = createCostCodeSchema.safeParse({
      code: '03-200',
      division: '03 - Concrete',
      subdivision: 'Flatwork',
      name: 'Concrete Flatwork',
      description: 'All concrete flatwork including slabs and walks',
      category: 'subcontractor',
      trade: 'Concrete',
      parent_id: '550e8400-e29b-41d4-a716-446655440000',
      sort_order: 10,
      is_active: true,
      is_default: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing code', () => {
    const result = createCostCodeSchema.safeParse({ division: '01', name: 'Test' })
    expect(result.success).toBe(false)
  })

  it('rejects missing division', () => {
    const result = createCostCodeSchema.safeParse({ code: '01', name: 'Test' })
    expect(result.success).toBe(false)
  })

  it('rejects missing name', () => {
    const result = createCostCodeSchema.safeParse({ code: '01', division: '01' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = createCostCodeSchema.safeParse({
      code: '01',
      division: '01',
      name: 'Test',
      category: 'bogus',
    })
    expect(result.success).toBe(false)
  })
})

describe('Spec: updateCostCodeSchema is partial', () => {
  it('accepts empty update', () => {
    const result = updateCostCodeSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Spec: DB type fields match migration columns
// ============================================================================

describe('Spec: Job type has all DB columns', () => {
  it('has project-detail fields from migration', () => {
    // Compile-time check — if these fields didn't exist on Job, TS would error
    const checkFields: (keyof Job)[] = [
      'id', 'company_id', 'client_id', 'name', 'job_number',
      'description', 'address', 'city', 'state', 'zip',
      'latitude', 'longitude', 'project_type', 'status',
      'contract_type', 'contract_amount', 'cost_plus_markup',
      'start_date', 'target_completion', 'actual_completion',
      'sqft_conditioned', 'sqft_total', 'sqft_garage',
      'bedrooms', 'bathrooms', 'stories',
      'budget_total', 'committed_total', 'invoiced_total',
      'paid_total', 'billed_total', 'received_total',
      'settings', 'deleted_at', 'created_at', 'updated_at',
    ]
    expect(checkFields.length).toBeGreaterThan(30)
  })
})

describe('Spec: Client type has all DB columns', () => {
  it('has spouse/portal fields from migration', () => {
    const checkFields: (keyof Client)[] = [
      'id', 'company_id', 'name', 'company_name',
      'email', 'phone', 'mobile_phone',
      'address', 'city', 'state', 'zip',
      'spouse_name', 'spouse_email', 'spouse_phone',
      'lead_source', 'referred_by', 'portal_enabled',
      'notes', 'deleted_at', 'created_at', 'updated_at',
    ]
    expect(checkFields.length).toBeGreaterThan(15)
  })
})

describe('Spec: Vendor type has all DB columns', () => {
  it('has compliance/insurance fields from migration', () => {
    const checkFields: (keyof Vendor)[] = [
      'id', 'company_id', 'name', 'dba_name',
      'email', 'phone', 'website',
      'address', 'city', 'state', 'zip',
      'trade', 'trades', 'tax_id',
      'license_number', 'license_expiration',
      'insurance_expiration', 'gl_coverage_amount',
      'workers_comp_expiration', 'payment_terms',
      'default_cost_code_id', 'is_active', 'is_1099',
      'w9_on_file', 'performance_score',
      'notes', 'deleted_at', 'created_at', 'updated_at',
    ]
    expect(checkFields.length).toBeGreaterThan(25)
  })
})

describe('Spec: CostCode type has all DB columns', () => {
  it('has hierarchy/taxonomy fields from migration', () => {
    const checkFields: (keyof CostCode)[] = [
      'id', 'company_id', 'code', 'division', 'subdivision',
      'name', 'description', 'category', 'trade',
      'parent_id', 'sort_order', 'is_active', 'is_default',
      'deleted_at', 'created_at', 'updated_at',
    ]
    expect(checkFields.length).toBeGreaterThan(14)
  })
})
