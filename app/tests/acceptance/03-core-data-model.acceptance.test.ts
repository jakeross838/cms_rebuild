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

import type { Job, Client, Vendor, CostCode, JobStatus, CostCodeCategory } from '@/types/database'

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
  it('includes all 6 job statuses', () => {
    const statuses: JobStatus[] = [
      'pre_construction',
      'active',
      'on_hold',
      'completed',
      'warranty',
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
      email: 'john@smith.com',
      phone: '555-123-4567',
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zip: '75001',
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
      email: 'contact@abcelectric.com',
      phone: '555-456-7890',
      address: '789 Industrial Blvd',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      trade: 'Electrical',
      tax_id: '12-3456789',
      is_active: true,
      notes: 'Preferred electrical vendor',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = createVendorSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = createVendorSchema.safeParse({ name: 'Test', email: 'not-an-email' })
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
  it('has core fields from migration', () => {
    // Compile-time check — if these fields didn't exist on Job, TS would error
    const checkFields: (keyof Job)[] = [
      'id', 'company_id', 'client_id', 'name', 'job_number',
      'notes', 'address', 'city', 'state', 'zip',
      'status', 'contract_type', 'contract_amount',
      'start_date', 'target_completion', 'actual_completion',
      'deleted_at', 'created_at', 'updated_at',
    ]
    expect(checkFields.length).toBeGreaterThan(15)
  })
})

describe('Spec: Client type has all DB columns', () => {
  it('has core fields from migration', () => {
    const checkFields: (keyof Client)[] = [
      'id', 'company_id', 'name',
      'email', 'phone',
      'address', 'city', 'state', 'zip',
      'notes', 'deleted_at', 'created_at',
    ]
    expect(checkFields.length).toBeGreaterThan(10)
  })
})

describe('Spec: Vendor type has all DB columns', () => {
  it('has core fields from migration', () => {
    const checkFields: (keyof Vendor)[] = [
      'id', 'company_id', 'name',
      'email', 'phone',
      'address', 'city', 'state', 'zip',
      'trade', 'tax_id', 'is_active',
      'notes', 'deleted_at', 'created_at',
    ]
    expect(checkFields.length).toBeGreaterThan(12)
  })
})

describe('Spec: CostCode type has all DB columns', () => {
  it('has hierarchy/taxonomy fields from migration', () => {
    const checkFields: (keyof CostCode)[] = [
      'id', 'company_id', 'code', 'division', 'subdivision',
      'name', 'description', 'category', 'trade',
      'parent_id', 'sort_order', 'is_active', 'is_default',
      'deleted_at', 'created_at',
    ]
    expect(checkFields.length).toBeGreaterThan(13)
  })
})
