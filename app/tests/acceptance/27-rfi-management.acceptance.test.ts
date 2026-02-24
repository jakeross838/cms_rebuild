/**
 * Module 27 — RFI Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 27 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  RfiStatus,
  RfiPriority,
  RfiCategory,
  RoutingStatus,
  Rfi,
  RfiResponse,
  RfiRouting,
  RfiTemplate,
} from '@/types/rfi-management'

import {
  RFI_STATUSES,
  RFI_PRIORITIES,
  RFI_CATEGORIES,
  ROUTING_STATUSES,
} from '@/types/rfi-management'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  rfiStatusEnum,
  rfiPriorityEnum,
  rfiCategoryEnum,
  routingStatusEnum,
  listRfisSchema,
  createRfiSchema,
  updateRfiSchema,
  openRfiSchema,
  closeRfiSchema,
  listRfiResponsesSchema,
  createRfiResponseSchema,
  updateRfiResponseSchema,
  listRfiRoutingSchema,
  createRfiRoutingSchema,
  updateRfiRoutingSchema,
  listRfiTemplatesSchema,
  createRfiTemplateSchema,
  updateRfiTemplateSchema,
} from '@/lib/validation/schemas/rfi-management'

// ============================================================================
// Type System
// ============================================================================

describe('Module 27 — RFI Types', () => {
  test('RfiStatus has 6 values', () => {
    const statuses: RfiStatus[] = [
      'draft', 'open', 'pending_response', 'answered', 'closed', 'voided',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('RfiPriority has 4 values', () => {
    const priorities: RfiPriority[] = ['low', 'normal', 'high', 'urgent']
    expect(priorities).toHaveLength(4)
  })

  test('RfiCategory has 8 values', () => {
    const categories: RfiCategory[] = [
      'design', 'structural', 'mechanical', 'electrical', 'plumbing', 'site', 'finish', 'general',
    ]
    expect(categories).toHaveLength(8)
  })

  test('RoutingStatus has 4 values', () => {
    const statuses: RoutingStatus[] = ['pending', 'viewed', 'responded', 'forwarded']
    expect(statuses).toHaveLength(4)
  })

  test('Rfi interface has all required fields', () => {
    const rfi: Rfi = {
      id: '1', company_id: '1', job_id: '1', rfi_number: 'RFI-001',
      subject: 'Header size clarification', question: 'What is the header size for opening?',
      status: 'draft', priority: 'normal', category: 'structural',
      assigned_to: null, due_date: '2026-03-01', cost_impact: 0,
      schedule_impact_days: 0, related_document_id: null,
      created_by: '1', answered_at: null, closed_at: null, closed_by: null,
      created_at: '2026-02-15', updated_at: '2026-02-15', deleted_at: null,
    }
    expect(rfi.rfi_number).toBe('RFI-001')
    expect(rfi.status).toBe('draft')
    expect(rfi.cost_impact).toBe(0)
  })

  test('RfiResponse interface has all required fields', () => {
    const response: RfiResponse = {
      id: '1', rfi_id: '1', company_id: '1',
      response_text: 'Use LVL 3.5x11.875 header per plan detail A3.',
      responded_by: '1', attachments: [], is_official: true,
      created_at: '2026-02-16', updated_at: '2026-02-16',
    }
    expect(response.response_text).toContain('LVL')
    expect(response.is_official).toBe(true)
  })

  test('RfiRouting interface has all required fields', () => {
    const routing: RfiRouting = {
      id: '1', rfi_id: '1', company_id: '1',
      routed_to: '2', routed_by: '1', routed_at: '2026-02-15',
      status: 'pending', notes: 'Please review structural question',
      created_at: '2026-02-15', updated_at: '2026-02-15',
    }
    expect(routing.status).toBe('pending')
    expect(routing.notes).toContain('structural')
  })

  test('RfiTemplate interface has all required fields', () => {
    const template: RfiTemplate = {
      id: '1', company_id: '1', name: 'Confirm Header Size',
      category: 'structural', subject_template: 'Header size at [location]',
      question_template: 'Please confirm the header size for the opening at [location].',
      default_priority: 'normal', is_active: true,
      created_at: '2026-01-10', updated_at: '2026-01-10',
    }
    expect(template.name).toBe('Confirm Header Size')
    expect(template.category).toBe('structural')
    expect(template.is_active).toBe(true)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 27 — Constants', () => {
  test('RFI_STATUSES has 6 entries with value and label', () => {
    expect(RFI_STATUSES).toHaveLength(6)
    for (const s of RFI_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('RFI_STATUSES includes all expected status values', () => {
    const values = RFI_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('open')
    expect(values).toContain('pending_response')
    expect(values).toContain('answered')
    expect(values).toContain('closed')
    expect(values).toContain('voided')
  })

  test('RFI_PRIORITIES has 4 entries with value and label', () => {
    expect(RFI_PRIORITIES).toHaveLength(4)
    for (const p of RFI_PRIORITIES) {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
      expect(p.label.length).toBeGreaterThan(0)
    }
  })

  test('RFI_CATEGORIES has 8 entries with value and label', () => {
    expect(RFI_CATEGORIES).toHaveLength(8)
    for (const c of RFI_CATEGORIES) {
      expect(c).toHaveProperty('value')
      expect(c).toHaveProperty('label')
      expect(c.label.length).toBeGreaterThan(0)
    }
  })

  test('ROUTING_STATUSES has 4 entries with value and label', () => {
    expect(ROUTING_STATUSES).toHaveLength(4)
    const values = ROUTING_STATUSES.map((r) => r.value)
    expect(values).toContain('pending')
    expect(values).toContain('viewed')
    expect(values).toContain('responded')
    expect(values).toContain('forwarded')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 27 — Enum Schemas', () => {
  test('rfiStatusEnum accepts all 6 statuses', () => {
    for (const s of ['draft', 'open', 'pending_response', 'answered', 'closed', 'voided']) {
      expect(rfiStatusEnum.parse(s)).toBe(s)
    }
  })

  test('rfiStatusEnum rejects invalid status', () => {
    expect(() => rfiStatusEnum.parse('submitted')).toThrow()
  })

  test('rfiPriorityEnum accepts all 4 priorities', () => {
    for (const p of ['low', 'normal', 'high', 'urgent']) {
      expect(rfiPriorityEnum.parse(p)).toBe(p)
    }
  })

  test('rfiPriorityEnum rejects invalid priority', () => {
    expect(() => rfiPriorityEnum.parse('critical')).toThrow()
  })

  test('rfiCategoryEnum accepts all 8 categories', () => {
    for (const c of ['design', 'structural', 'mechanical', 'electrical', 'plumbing', 'site', 'finish', 'general']) {
      expect(rfiCategoryEnum.parse(c)).toBe(c)
    }
  })

  test('rfiCategoryEnum rejects invalid category', () => {
    expect(() => rfiCategoryEnum.parse('hvac')).toThrow()
  })

  test('routingStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'viewed', 'responded', 'forwarded']) {
      expect(routingStatusEnum.parse(s)).toBe(s)
    }
  })

  test('routingStatusEnum rejects invalid status', () => {
    expect(() => routingStatusEnum.parse('cancelled')).toThrow()
  })
})

// ============================================================================
// RFI Schemas
// ============================================================================

describe('Module 27 — RFI Schemas', () => {
  test('listRfisSchema accepts valid params', () => {
    const result = listRfisSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listRfisSchema rejects limit > 100', () => {
    expect(() => listRfisSchema.parse({ limit: 200 })).toThrow()
  })

  test('listRfisSchema accepts all filters', () => {
    const result = listRfisSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'open',
      priority: 'high',
      category: 'structural',
      assigned_to: '550e8400-e29b-41d4-a716-446655440000',
      q: 'header',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('open')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('structural')
    expect(result.q).toBe('header')
  })

  test('createRfiSchema accepts valid RFI', () => {
    const result = createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'RFI-001',
      subject: 'Header size at kitchen opening',
      question: 'Please clarify the header size for the 12ft opening in the kitchen.',
    })
    expect(result.rfi_number).toBe('RFI-001')
    expect(result.subject).toBe('Header size at kitchen opening')
    expect(result.status).toBe('draft')
    expect(result.priority).toBe('normal')
    expect(result.category).toBe('general')
    expect(result.cost_impact).toBe(0)
    expect(result.schedule_impact_days).toBe(0)
  })

  test('createRfiSchema requires job_id, rfi_number, subject, question', () => {
    expect(() => createRfiSchema.parse({})).toThrow()
    expect(() => createRfiSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
    expect(() => createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'RFI-001',
    })).toThrow()
    expect(() => createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'RFI-001',
      subject: 'Test',
    })).toThrow()
  })

  test('createRfiSchema rejects rfi_number > 20 chars', () => {
    expect(() => createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'A'.repeat(21),
      subject: 'Test',
      question: 'Test question?',
    })).toThrow()
  })

  test('createRfiSchema rejects subject > 255 chars', () => {
    expect(() => createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'RFI-001',
      subject: 'A'.repeat(256),
      question: 'Test question?',
    })).toThrow()
  })

  test('createRfiSchema validates due_date format', () => {
    const result = createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'RFI-001',
      subject: 'Test',
      question: 'Test question?',
      due_date: '2026-03-15',
    })
    expect(result.due_date).toBe('2026-03-15')

    expect(() => createRfiSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      rfi_number: 'RFI-001',
      subject: 'Test',
      question: 'Test question?',
      due_date: 'March 15, 2026',
    })).toThrow()
  })

  test('updateRfiSchema accepts partial updates', () => {
    const result = updateRfiSchema.parse({ subject: 'Updated subject' })
    expect(result.subject).toBe('Updated subject')
    expect(result.rfi_number).toBeUndefined()
  })

  test('openRfiSchema accepts empty object', () => {
    const result = openRfiSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('openRfiSchema accepts notes', () => {
    const result = openRfiSchema.parse({ notes: 'Ready for distribution' })
    expect(result.notes).toBe('Ready for distribution')
  })

  test('closeRfiSchema accepts empty object', () => {
    const result = closeRfiSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('closeRfiSchema accepts notes', () => {
    const result = closeRfiSchema.parse({ notes: 'Resolution accepted' })
    expect(result.notes).toBe('Resolution accepted')
  })
})

// ============================================================================
// Response Schemas
// ============================================================================

describe('Module 27 — Response Schemas', () => {
  test('listRfiResponsesSchema accepts valid params with defaults', () => {
    const result = listRfiResponsesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createRfiResponseSchema accepts valid response', () => {
    const result = createRfiResponseSchema.parse({
      response_text: 'Use LVL 3.5x11.875 header per detail A3.',
      is_official: true,
    })
    expect(result.response_text).toBe('Use LVL 3.5x11.875 header per detail A3.')
    expect(result.is_official).toBe(true)
    expect(result.attachments).toEqual([])
  })

  test('createRfiResponseSchema requires response_text', () => {
    expect(() => createRfiResponseSchema.parse({})).toThrow()
  })

  test('createRfiResponseSchema has correct defaults', () => {
    const result = createRfiResponseSchema.parse({ response_text: 'Test response' })
    expect(result.is_official).toBe(false)
    expect(result.attachments).toEqual([])
  })

  test('updateRfiResponseSchema accepts partial updates', () => {
    const result = updateRfiResponseSchema.parse({ is_official: true })
    expect(result.is_official).toBe(true)
    expect(result.response_text).toBeUndefined()
  })
})

// ============================================================================
// Routing Schemas
// ============================================================================

describe('Module 27 — Routing Schemas', () => {
  test('listRfiRoutingSchema accepts valid params with defaults', () => {
    const result = listRfiRoutingSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createRfiRoutingSchema requires routed_to UUID', () => {
    expect(() => createRfiRoutingSchema.parse({})).toThrow()
    expect(() => createRfiRoutingSchema.parse({ routed_to: 'not-a-uuid' })).toThrow()
  })

  test('createRfiRoutingSchema accepts valid routing', () => {
    const result = createRfiRoutingSchema.parse({
      routed_to: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'Please review structural question',
    })
    expect(result.routed_to).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.notes).toBe('Please review structural question')
  })

  test('updateRfiRoutingSchema accepts partial updates', () => {
    const result = updateRfiRoutingSchema.parse({ status: 'viewed' })
    expect(result.status).toBe('viewed')
    expect(result.notes).toBeUndefined()
  })

  test('updateRfiRoutingSchema rejects invalid status', () => {
    expect(() => updateRfiRoutingSchema.parse({ status: 'unknown' })).toThrow()
  })
})

// ============================================================================
// Template Schemas
// ============================================================================

describe('Module 27 — Template Schemas', () => {
  test('listRfiTemplatesSchema accepts valid params', () => {
    const result = listRfiTemplatesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listRfiTemplatesSchema accepts category filter', () => {
    const result = listRfiTemplatesSchema.parse({ category: 'electrical' })
    expect(result.category).toBe('electrical')
  })

  test('createRfiTemplateSchema accepts valid template', () => {
    const result = createRfiTemplateSchema.parse({
      name: 'Confirm Header Size',
      category: 'structural',
      subject_template: 'Header size at [location]',
      question_template: 'Please confirm the header size for the opening at [location].',
      default_priority: 'normal',
    })
    expect(result.name).toBe('Confirm Header Size')
    expect(result.category).toBe('structural')
    expect(result.default_priority).toBe('normal')
    expect(result.is_active).toBe(true)
  })

  test('createRfiTemplateSchema requires name', () => {
    expect(() => createRfiTemplateSchema.parse({})).toThrow()
  })

  test('createRfiTemplateSchema rejects name > 200 chars', () => {
    expect(() => createRfiTemplateSchema.parse({
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createRfiTemplateSchema has correct defaults', () => {
    const result = createRfiTemplateSchema.parse({ name: 'Test Template' })
    expect(result.category).toBe('general')
    expect(result.default_priority).toBe('normal')
    expect(result.is_active).toBe(true)
  })

  test('updateRfiTemplateSchema accepts partial updates', () => {
    const result = updateRfiTemplateSchema.parse({ name: 'Updated Template Name' })
    expect(result.name).toBe('Updated Template Name')
    expect(result.category).toBeUndefined()
  })

  test('updateRfiTemplateSchema rejects invalid category', () => {
    expect(() => updateRfiTemplateSchema.parse({ category: 'hvac' })).toThrow()
  })
})
