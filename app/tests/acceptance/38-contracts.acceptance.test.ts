/**
 * Module 38 — Contracts & E-Signature Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 38 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ContractStatus,
  ContractType,
  SignerStatus,
  SignerRole,
  Contract,
  ContractVersion,
  ContractSigner,
  ContractTemplate,
  ContractClause,
} from '@/types/contracts'

import {
  CONTRACT_STATUSES,
  CONTRACT_TYPES,
  SIGNER_STATUSES,
  SIGNER_ROLES,
} from '@/types/contracts'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  contractStatusEnum,
  contractTypeEnum,
  signerStatusEnum,
  signerRoleEnum,
  listContractsSchema,
  createContractSchema,
  updateContractSchema,
  sendForSignatureSchema,
  listContractVersionsSchema,
  createContractVersionSchema,
  listContractSignersSchema,
  createContractSignerSchema,
  updateContractSignerSchema,
  signContractSchema,
  declineContractSchema,
  listContractTemplatesSchema,
  createContractTemplateSchema,
  updateContractTemplateSchema,
  listContractClausesSchema,
  createContractClauseSchema,
  updateContractClauseSchema,
} from '@/lib/validation/schemas/contracts'

// ============================================================================
// Type System
// ============================================================================

describe('Module 38 — Contract Types', () => {
  test('ContractStatus has 9 values', () => {
    const statuses: ContractStatus[] = [
      'draft', 'pending_review', 'sent_for_signature', 'partially_signed',
      'fully_signed', 'active', 'expired', 'terminated', 'voided',
    ]
    expect(statuses).toHaveLength(9)
  })

  test('ContractType has 8 values', () => {
    const types: ContractType[] = [
      'prime', 'subcontract', 'purchase_order', 'service_agreement',
      'change_order', 'amendment', 'nda', 'other',
    ]
    expect(types).toHaveLength(8)
  })

  test('SignerStatus has 5 values', () => {
    const statuses: SignerStatus[] = [
      'pending', 'viewed', 'signed', 'declined', 'expired',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('SignerRole has 6 values', () => {
    const roles: SignerRole[] = [
      'owner', 'client', 'subcontractor', 'architect', 'engineer', 'other',
    ]
    expect(roles).toHaveLength(6)
  })

  test('Contract interface has all required fields', () => {
    const c: Contract = {
      id: '1', company_id: '1', job_id: '1', contract_number: 'CTR-001',
      title: 'Prime Contract', description: null, contract_type: 'prime',
      status: 'draft', template_id: null, vendor_id: null, client_id: null,
      contract_value: 500000.00, retention_pct: 10, start_date: '2026-03-01',
      end_date: '2026-12-31', executed_at: null, expires_at: null,
      content: null, metadata: {}, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(c.contract_number).toBe('CTR-001')
    expect(c.status).toBe('draft')
    expect(c.contract_value).toBe(500000.00)
    expect(c.retention_pct).toBe(10)
  })

  test('ContractVersion interface has all required fields', () => {
    const v: ContractVersion = {
      id: '1', contract_id: '1', company_id: '1', version_number: 1,
      change_summary: 'Initial version', content: 'Contract text',
      snapshot_json: {}, created_by: '1', created_at: '2026-01-15',
    }
    expect(v.version_number).toBe(1)
    expect(v.change_summary).toBe('Initial version')
  })

  test('ContractSigner interface has all required fields', () => {
    const s: ContractSigner = {
      id: '1', contract_id: '1', company_id: '1', name: 'John Smith',
      email: 'john@example.com', role: 'client', status: 'pending',
      sign_order: 1, signed_at: null, declined_at: null, decline_reason: null,
      viewed_at: null, ip_address: null, user_agent: null,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(s.name).toBe('John Smith')
    expect(s.email).toBe('john@example.com')
    expect(s.role).toBe('client')
    expect(s.status).toBe('pending')
  })

  test('ContractTemplate interface has all required fields', () => {
    const t: ContractTemplate = {
      id: '1', company_id: '1', name: 'Standard Subcontract',
      description: 'Template for subcontracts', contract_type: 'subcontract',
      content: 'Template content', clauses: [], variables: [],
      is_active: true, is_system: false, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(t.name).toBe('Standard Subcontract')
    expect(t.contract_type).toBe('subcontract')
    expect(t.is_active).toBe(true)
  })

  test('ContractClause interface has all required fields', () => {
    const cl: ContractClause = {
      id: '1', company_id: '1', name: 'Indemnification',
      description: 'Standard indemnification clause', category: 'liability',
      content: 'Clause content text', is_required: true, is_active: true,
      sort_order: 0, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(cl.name).toBe('Indemnification')
    expect(cl.is_required).toBe(true)
    expect(cl.category).toBe('liability')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 38 — Constants', () => {
  test('CONTRACT_STATUSES has 9 entries with value and label', () => {
    expect(CONTRACT_STATUSES).toHaveLength(9)
    for (const s of CONTRACT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('CONTRACT_STATUSES includes all expected status values', () => {
    const values = CONTRACT_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('pending_review')
    expect(values).toContain('sent_for_signature')
    expect(values).toContain('fully_signed')
    expect(values).toContain('active')
    expect(values).toContain('voided')
  })

  test('CONTRACT_TYPES has 8 entries with value and label', () => {
    expect(CONTRACT_TYPES).toHaveLength(8)
    for (const t of CONTRACT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('CONTRACT_TYPES includes all expected type values', () => {
    const values = CONTRACT_TYPES.map((t) => t.value)
    expect(values).toContain('prime')
    expect(values).toContain('subcontract')
    expect(values).toContain('nda')
    expect(values).toContain('amendment')
  })

  test('SIGNER_STATUSES has 5 entries with value and label', () => {
    expect(SIGNER_STATUSES).toHaveLength(5)
    for (const s of SIGNER_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('SIGNER_ROLES has 6 entries with value and label', () => {
    expect(SIGNER_ROLES).toHaveLength(6)
    for (const r of SIGNER_ROLES) {
      expect(r).toHaveProperty('value')
      expect(r).toHaveProperty('label')
      expect(r.label.length).toBeGreaterThan(0)
    }
  })

  test('SIGNER_ROLES includes all expected role values', () => {
    const values = SIGNER_ROLES.map((r) => r.value)
    expect(values).toContain('owner')
    expect(values).toContain('client')
    expect(values).toContain('subcontractor')
    expect(values).toContain('architect')
    expect(values).toContain('engineer')
    expect(values).toContain('other')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 38 — Enum Schemas', () => {
  test('contractStatusEnum accepts all 9 statuses', () => {
    for (const s of ['draft', 'pending_review', 'sent_for_signature', 'partially_signed', 'fully_signed', 'active', 'expired', 'terminated', 'voided']) {
      expect(contractStatusEnum.parse(s)).toBe(s)
    }
  })

  test('contractStatusEnum rejects invalid status', () => {
    expect(() => contractStatusEnum.parse('cancelled')).toThrow()
  })

  test('contractTypeEnum accepts all 8 types', () => {
    for (const t of ['prime', 'subcontract', 'purchase_order', 'service_agreement', 'change_order', 'amendment', 'nda', 'other']) {
      expect(contractTypeEnum.parse(t)).toBe(t)
    }
  })

  test('contractTypeEnum rejects invalid type', () => {
    expect(() => contractTypeEnum.parse('warranty')).toThrow()
  })

  test('signerStatusEnum accepts all 5 statuses', () => {
    for (const s of ['pending', 'viewed', 'signed', 'declined', 'expired']) {
      expect(signerStatusEnum.parse(s)).toBe(s)
    }
  })

  test('signerStatusEnum rejects invalid status', () => {
    expect(() => signerStatusEnum.parse('cancelled')).toThrow()
  })

  test('signerRoleEnum accepts all 6 roles', () => {
    for (const r of ['owner', 'client', 'subcontractor', 'architect', 'engineer', 'other']) {
      expect(signerRoleEnum.parse(r)).toBe(r)
    }
  })

  test('signerRoleEnum rejects invalid role', () => {
    expect(() => signerRoleEnum.parse('inspector')).toThrow()
  })
})

// ============================================================================
// Contract Schemas
// ============================================================================

describe('Module 38 — Contract Schemas', () => {
  test('listContractsSchema accepts valid params', () => {
    const result = listContractsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listContractsSchema rejects limit > 100', () => {
    expect(() => listContractsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listContractsSchema accepts filters', () => {
    const result = listContractsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'draft',
      contract_type: 'subcontract',
      vendor_id: '550e8400-e29b-41d4-a716-446655440001',
      client_id: '550e8400-e29b-41d4-a716-446655440002',
      q: 'kitchen',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('draft')
    expect(result.contract_type).toBe('subcontract')
    expect(result.q).toBe('kitchen')
  })

  test('createContractSchema accepts valid contract', () => {
    const result = createContractSchema.parse({
      contract_number: 'CTR-001',
      title: 'Prime Construction Contract',
    })
    expect(result.contract_number).toBe('CTR-001')
    expect(result.title).toBe('Prime Construction Contract')
    expect(result.status).toBe('draft')
    expect(result.contract_type).toBe('prime')
    expect(result.contract_value).toBe(0)
    expect(result.retention_pct).toBe(0)
  })

  test('createContractSchema requires contract_number and title', () => {
    expect(() => createContractSchema.parse({})).toThrow()
    expect(() => createContractSchema.parse({ contract_number: 'CTR-001' })).toThrow()
    expect(() => createContractSchema.parse({ title: 'Test' })).toThrow()
  })

  test('createContractSchema rejects contract_number > 50 chars', () => {
    expect(() => createContractSchema.parse({
      contract_number: 'A'.repeat(51),
      title: 'Test',
    })).toThrow()
  })

  test('createContractSchema rejects title > 255 chars', () => {
    expect(() => createContractSchema.parse({
      contract_number: 'CTR-001',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createContractSchema validates date formats', () => {
    const result = createContractSchema.parse({
      contract_number: 'CTR-001',
      title: 'Test',
      start_date: '2026-03-01',
      end_date: '2026-12-31',
    })
    expect(result.start_date).toBe('2026-03-01')
    expect(result.end_date).toBe('2026-12-31')
  })

  test('createContractSchema rejects invalid date format', () => {
    expect(() => createContractSchema.parse({
      contract_number: 'CTR-001',
      title: 'Test',
      start_date: '03/01/2026',
    })).toThrow()
  })

  test('createContractSchema accepts all optional fields', () => {
    const result = createContractSchema.parse({
      contract_number: 'CTR-001',
      title: 'Full Contract',
      description: 'A comprehensive contract',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      contract_type: 'subcontract',
      template_id: '550e8400-e29b-41d4-a716-446655440001',
      vendor_id: '550e8400-e29b-41d4-a716-446655440002',
      client_id: '550e8400-e29b-41d4-a716-446655440003',
      contract_value: 250000,
      retention_pct: 10,
      start_date: '2026-03-01',
      end_date: '2026-12-31',
      content: 'Contract body text',
      metadata: { custom_field: 'value' },
    })
    expect(result.contract_type).toBe('subcontract')
    expect(result.contract_value).toBe(250000)
    expect(result.retention_pct).toBe(10)
  })

  test('updateContractSchema accepts partial updates', () => {
    const result = updateContractSchema.parse({ title: 'Updated title' })
    expect(result.title).toBe('Updated title')
    expect(result.contract_number).toBeUndefined()
  })

  test('sendForSignatureSchema accepts empty object', () => {
    const result = sendForSignatureSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('sendForSignatureSchema accepts notes', () => {
    const result = sendForSignatureSchema.parse({ notes: 'Ready for signatures' })
    expect(result.notes).toBe('Ready for signatures')
  })
})

// ============================================================================
// Version Schemas
// ============================================================================

describe('Module 38 — Version Schemas', () => {
  test('listContractVersionsSchema accepts valid params with defaults', () => {
    const result = listContractVersionsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createContractVersionSchema accepts valid version', () => {
    const result = createContractVersionSchema.parse({
      version_number: 1,
      change_summary: 'Initial version',
    })
    expect(result.version_number).toBe(1)
    expect(result.change_summary).toBe('Initial version')
    expect(result.snapshot_json).toEqual({})
  })

  test('createContractVersionSchema requires version_number', () => {
    expect(() => createContractVersionSchema.parse({})).toThrow()
  })

  test('createContractVersionSchema defaults snapshot_json to empty object', () => {
    const result = createContractVersionSchema.parse({ version_number: 2 })
    expect(result.snapshot_json).toEqual({})
  })
})

// ============================================================================
// Signer Schemas
// ============================================================================

describe('Module 38 — Signer Schemas', () => {
  test('listContractSignersSchema accepts valid params with defaults', () => {
    const result = listContractSignersSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createContractSignerSchema accepts valid signer', () => {
    const result = createContractSignerSchema.parse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'client',
      sign_order: 1,
    })
    expect(result.name).toBe('Jane Doe')
    expect(result.email).toBe('jane@example.com')
    expect(result.role).toBe('client')
    expect(result.sign_order).toBe(1)
  })

  test('createContractSignerSchema requires name and email', () => {
    expect(() => createContractSignerSchema.parse({})).toThrow()
    expect(() => createContractSignerSchema.parse({ name: 'Jane' })).toThrow()
    expect(() => createContractSignerSchema.parse({ email: 'jane@example.com' })).toThrow()
  })

  test('createContractSignerSchema rejects invalid email', () => {
    expect(() => createContractSignerSchema.parse({
      name: 'Jane',
      email: 'not-an-email',
    })).toThrow()
  })

  test('createContractSignerSchema has correct defaults', () => {
    const result = createContractSignerSchema.parse({
      name: 'Jane',
      email: 'jane@example.com',
    })
    expect(result.role).toBe('other')
    expect(result.sign_order).toBe(0)
  })

  test('createContractSignerSchema rejects name > 200 chars', () => {
    expect(() => createContractSignerSchema.parse({
      name: 'A'.repeat(201),
      email: 'jane@example.com',
    })).toThrow()
  })

  test('updateContractSignerSchema accepts partial updates', () => {
    const result = updateContractSignerSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.email).toBeUndefined()
  })

  test('signContractSchema accepts empty object', () => {
    const result = signContractSchema.parse({})
    expect(result.ip_address).toBeUndefined()
  })

  test('signContractSchema accepts ip_address and user_agent', () => {
    const result = signContractSchema.parse({
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
    })
    expect(result.ip_address).toBe('192.168.1.1')
    expect(result.user_agent).toBe('Mozilla/5.0')
  })

  test('declineContractSchema accepts empty object', () => {
    const result = declineContractSchema.parse({})
    expect(result.decline_reason).toBeUndefined()
  })

  test('declineContractSchema accepts decline_reason', () => {
    const result = declineContractSchema.parse({ decline_reason: 'Terms unacceptable' })
    expect(result.decline_reason).toBe('Terms unacceptable')
  })
})

// ============================================================================
// Template Schemas
// ============================================================================

describe('Module 38 — Template Schemas', () => {
  test('listContractTemplatesSchema accepts valid params', () => {
    const result = listContractTemplatesSchema.parse({ page: '1', limit: '10' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  test('listContractTemplatesSchema accepts contract_type filter', () => {
    const result = listContractTemplatesSchema.parse({ contract_type: 'subcontract' })
    expect(result.contract_type).toBe('subcontract')
  })

  test('createContractTemplateSchema accepts valid template', () => {
    const result = createContractTemplateSchema.parse({
      name: 'Standard Subcontract Agreement',
      contract_type: 'subcontract',
    })
    expect(result.name).toBe('Standard Subcontract Agreement')
    expect(result.contract_type).toBe('subcontract')
    expect(result.is_active).toBe(true)
    expect(result.clauses).toEqual([])
    expect(result.variables).toEqual([])
  })

  test('createContractTemplateSchema requires name', () => {
    expect(() => createContractTemplateSchema.parse({})).toThrow()
  })

  test('createContractTemplateSchema rejects name > 200 chars', () => {
    expect(() => createContractTemplateSchema.parse({
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createContractTemplateSchema has correct defaults', () => {
    const result = createContractTemplateSchema.parse({ name: 'Test Template' })
    expect(result.contract_type).toBe('prime')
    expect(result.is_active).toBe(true)
    expect(result.clauses).toEqual([])
    expect(result.variables).toEqual([])
  })

  test('updateContractTemplateSchema accepts partial updates', () => {
    const result = updateContractTemplateSchema.parse({ name: 'Updated Template' })
    expect(result.name).toBe('Updated Template')
    expect(result.contract_type).toBeUndefined()
  })

  test('updateContractTemplateSchema accepts is_active toggle', () => {
    const result = updateContractTemplateSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
  })
})

// ============================================================================
// Clause Schemas
// ============================================================================

describe('Module 38 — Clause Schemas', () => {
  test('listContractClausesSchema accepts valid params', () => {
    const result = listContractClausesSchema.parse({ page: '1', limit: '50' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listContractClausesSchema accepts category filter', () => {
    const result = listContractClausesSchema.parse({ category: 'liability' })
    expect(result.category).toBe('liability')
  })

  test('listContractClausesSchema accepts is_required filter', () => {
    const result = listContractClausesSchema.parse({ is_required: 'true' })
    expect(result.is_required).toBe(true)
  })

  test('createContractClauseSchema accepts valid clause', () => {
    const result = createContractClauseSchema.parse({
      name: 'Indemnification',
      content: 'The contractor shall indemnify...',
      category: 'liability',
      is_required: true,
    })
    expect(result.name).toBe('Indemnification')
    expect(result.content).toBe('The contractor shall indemnify...')
    expect(result.is_required).toBe(true)
    expect(result.category).toBe('liability')
  })

  test('createContractClauseSchema requires name and content', () => {
    expect(() => createContractClauseSchema.parse({})).toThrow()
    expect(() => createContractClauseSchema.parse({ name: 'Test' })).toThrow()
    expect(() => createContractClauseSchema.parse({ content: 'Some clause' })).toThrow()
  })

  test('createContractClauseSchema rejects name > 200 chars', () => {
    expect(() => createContractClauseSchema.parse({
      name: 'A'.repeat(201),
      content: 'Some clause text',
    })).toThrow()
  })

  test('createContractClauseSchema has correct defaults', () => {
    const result = createContractClauseSchema.parse({
      name: 'Test Clause',
      content: 'Clause content',
    })
    expect(result.is_required).toBe(false)
    expect(result.is_active).toBe(true)
    expect(result.sort_order).toBe(0)
  })

  test('updateContractClauseSchema accepts partial updates', () => {
    const result = updateContractClauseSchema.parse({ name: 'Updated Clause' })
    expect(result.name).toBe('Updated Clause')
    expect(result.content).toBeUndefined()
  })

  test('updateContractClauseSchema accepts is_required toggle', () => {
    const result = updateContractClauseSchema.parse({ is_required: true })
    expect(result.is_required).toBe(true)
  })
})
