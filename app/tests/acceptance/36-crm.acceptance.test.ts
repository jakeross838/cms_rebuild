/**
 * Module 36 — Lead Pipeline & CRM Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 36 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  LeadStatus,
  LeadSource,
  ActivityType,
  LeadPriority,
  StageType,
  PreconstructionType,
  Lead,
  LeadActivity,
  LeadSourceRecord,
  Pipeline,
  PipelineStage,
} from '@/types/crm'

import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  ACTIVITY_TYPES,
  LEAD_PRIORITIES,
  STAGE_TYPES,
  PRECONSTRUCTION_TYPES,
} from '@/types/crm'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  leadStatusEnum,
  leadSourceEnum,
  activityTypeEnum,
  leadPriorityEnum,
  stageTypeEnum,
  preconstructionTypeEnum,
  listLeadsSchema,
  createLeadSchema,
  updateLeadSchema,
  listLeadActivitiesSchema,
  createLeadActivitySchema,
  updateLeadActivitySchema,
  listLeadSourcesSchema,
  createLeadSourceSchema,
  updateLeadSourceSchema,
  listPipelinesSchema,
  createPipelineSchema,
  updatePipelineSchema,
  listPipelineStagesSchema,
  createPipelineStageSchema,
  updatePipelineStageSchema,
} from '@/lib/validation/schemas/crm'

// ============================================================================
// Type System
// ============================================================================

describe('Module 36 — CRM Types', () => {
  test('LeadStatus has 8 values', () => {
    const statuses: LeadStatus[] = [
      'new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'on_hold',
    ]
    expect(statuses).toHaveLength(8)
  })

  test('LeadSource has 8 values', () => {
    const sources: LeadSource[] = [
      'referral', 'website', 'social_media', 'advertising', 'trade_show', 'cold_call', 'partner', 'other',
    ]
    expect(sources).toHaveLength(8)
  })

  test('ActivityType has 7 values', () => {
    const types: ActivityType[] = [
      'call', 'email', 'meeting', 'note', 'site_visit', 'proposal', 'follow_up',
    ]
    expect(types).toHaveLength(7)
  })

  test('LeadPriority has 4 values', () => {
    const priorities: LeadPriority[] = ['low', 'normal', 'high', 'hot']
    expect(priorities).toHaveLength(4)
  })

  test('StageType has 5 values', () => {
    const types: StageType[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed']
    expect(types).toHaveLength(5)
  })

  test('PreconstructionType has 2 values', () => {
    const types: PreconstructionType[] = ['design_build', 'plan_bid_build']
    expect(types).toHaveLength(2)
  })

  test('Lead interface has all required fields', () => {
    const lead: Lead = {
      id: '1', company_id: '1',
      first_name: 'John', last_name: 'Doe',
      email: 'john@example.com', phone: '555-1234',
      address: '123 Main St', lot_address: '456 Lot Ln',
      source: 'referral', source_detail: 'Past client referral',
      utm_source: null, utm_medium: null, utm_campaign: null,
      project_type: 'New Build',
      budget_range_low: 500000, budget_range_high: 750000,
      timeline: '6 months', lot_status: 'owned',
      financing_status: 'pre-approved',
      preconstruction_type: 'design_build',
      status: 'new', priority: 'high',
      pipeline_id: null, stage_id: null,
      score: 75, assigned_to: null,
      expected_contract_value: 650000, probability_pct: 50,
      lost_reason: null, lost_competitor: null, won_project_id: null,
      created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(lead.first_name).toBe('John')
    expect(lead.status).toBe('new')
    expect(lead.priority).toBe('high')
    expect(lead.score).toBe(75)
  })

  test('LeadActivity interface has all required fields', () => {
    const activity: LeadActivity = {
      id: '1', company_id: '1', lead_id: '1',
      activity_type: 'call',
      subject: 'Initial call', description: 'Discussed project scope',
      performed_by: '1', activity_date: '2026-01-15',
      duration_minutes: 30,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(activity.activity_type).toBe('call')
    expect(activity.duration_minutes).toBe(30)
  })

  test('LeadSourceRecord interface has all required fields', () => {
    const source: LeadSourceRecord = {
      id: '1', company_id: '1',
      name: 'Google Ads', description: 'PPC campaigns',
      source_type: 'advertising', is_active: true,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(source.name).toBe('Google Ads')
    expect(source.source_type).toBe('advertising')
    expect(source.is_active).toBe(true)
  })

  test('Pipeline interface has all required fields', () => {
    const pipeline: Pipeline = {
      id: '1', company_id: '1',
      name: 'Default Pipeline', description: 'Standard sales pipeline',
      is_default: true, is_active: true,
      created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(pipeline.name).toBe('Default Pipeline')
    expect(pipeline.is_default).toBe(true)
  })

  test('PipelineStage interface has all required fields', () => {
    const stage: PipelineStage = {
      id: '1', company_id: '1', pipeline_id: '1',
      name: 'New Lead', stage_type: 'lead',
      sequence_order: 0, probability_default: 10,
      color: '#3B82F6', is_active: true,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(stage.name).toBe('New Lead')
    expect(stage.stage_type).toBe('lead')
    expect(stage.sequence_order).toBe(0)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 36 — Constants', () => {
  test('LEAD_STATUSES has 8 entries with value and label', () => {
    expect(LEAD_STATUSES).toHaveLength(8)
    for (const s of LEAD_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('LEAD_STATUSES includes all expected values', () => {
    const values = LEAD_STATUSES.map((s) => s.value)
    expect(values).toContain('new')
    expect(values).toContain('contacted')
    expect(values).toContain('qualified')
    expect(values).toContain('won')
    expect(values).toContain('lost')
  })

  test('LEAD_SOURCES has 8 entries with value and label', () => {
    expect(LEAD_SOURCES).toHaveLength(8)
    for (const s of LEAD_SOURCES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('ACTIVITY_TYPES has 7 entries with value and label', () => {
    expect(ACTIVITY_TYPES).toHaveLength(7)
    for (const a of ACTIVITY_TYPES) {
      expect(a).toHaveProperty('value')
      expect(a).toHaveProperty('label')
      expect(a.label.length).toBeGreaterThan(0)
    }
  })

  test('LEAD_PRIORITIES has 4 entries with value and label', () => {
    expect(LEAD_PRIORITIES).toHaveLength(4)
    const values = LEAD_PRIORITIES.map((p) => p.value)
    expect(values).toContain('low')
    expect(values).toContain('normal')
    expect(values).toContain('high')
    expect(values).toContain('hot')
  })

  test('STAGE_TYPES has 5 entries with value and label', () => {
    expect(STAGE_TYPES).toHaveLength(5)
    const values = STAGE_TYPES.map((t) => t.value)
    expect(values).toContain('lead')
    expect(values).toContain('qualified')
    expect(values).toContain('proposal')
    expect(values).toContain('negotiation')
    expect(values).toContain('closed')
  })

  test('PRECONSTRUCTION_TYPES has 2 entries with value and label', () => {
    expect(PRECONSTRUCTION_TYPES).toHaveLength(2)
    const values = PRECONSTRUCTION_TYPES.map((t) => t.value)
    expect(values).toContain('design_build')
    expect(values).toContain('plan_bid_build')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 36 — Enum Schemas', () => {
  test('leadStatusEnum accepts all 8 statuses', () => {
    for (const s of ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'on_hold']) {
      expect(leadStatusEnum.parse(s)).toBe(s)
    }
  })

  test('leadStatusEnum rejects invalid status', () => {
    expect(() => leadStatusEnum.parse('unknown')).toThrow()
  })

  test('leadSourceEnum accepts all 8 sources', () => {
    for (const s of ['referral', 'website', 'social_media', 'advertising', 'trade_show', 'cold_call', 'partner', 'other']) {
      expect(leadSourceEnum.parse(s)).toBe(s)
    }
  })

  test('leadSourceEnum rejects invalid source', () => {
    expect(() => leadSourceEnum.parse('billboard')).toThrow()
  })

  test('activityTypeEnum accepts all 7 types', () => {
    for (const t of ['call', 'email', 'meeting', 'note', 'site_visit', 'proposal', 'follow_up']) {
      expect(activityTypeEnum.parse(t)).toBe(t)
    }
  })

  test('activityTypeEnum rejects invalid type', () => {
    expect(() => activityTypeEnum.parse('text_message')).toThrow()
  })

  test('leadPriorityEnum accepts all 4 priorities', () => {
    for (const p of ['low', 'normal', 'high', 'hot']) {
      expect(leadPriorityEnum.parse(p)).toBe(p)
    }
  })

  test('leadPriorityEnum rejects invalid priority', () => {
    expect(() => leadPriorityEnum.parse('critical')).toThrow()
  })

  test('stageTypeEnum accepts all 5 types', () => {
    for (const t of ['lead', 'qualified', 'proposal', 'negotiation', 'closed']) {
      expect(stageTypeEnum.parse(t)).toBe(t)
    }
  })

  test('stageTypeEnum rejects invalid type', () => {
    expect(() => stageTypeEnum.parse('discovery')).toThrow()
  })

  test('preconstructionTypeEnum accepts both types', () => {
    expect(preconstructionTypeEnum.parse('design_build')).toBe('design_build')
    expect(preconstructionTypeEnum.parse('plan_bid_build')).toBe('plan_bid_build')
  })

  test('preconstructionTypeEnum rejects invalid type', () => {
    expect(() => preconstructionTypeEnum.parse('cost_plus')).toThrow()
  })
})

// ============================================================================
// Lead Schemas
// ============================================================================

describe('Module 36 — Lead Schemas', () => {
  test('listLeadsSchema accepts valid params', () => {
    const result = listLeadsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listLeadsSchema rejects limit > 100', () => {
    expect(() => listLeadsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listLeadsSchema accepts all filters', () => {
    const result = listLeadsSchema.parse({
      status: 'new',
      priority: 'hot',
      source: 'referral',
      assigned_to: '550e8400-e29b-41d4-a716-446655440000',
      pipeline_id: '550e8400-e29b-41d4-a716-446655440000',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      q: 'John',
    })
    expect(result.status).toBe('new')
    expect(result.priority).toBe('hot')
    expect(result.source).toBe('referral')
    expect(result.q).toBe('John')
  })

  test('createLeadSchema accepts valid lead', () => {
    const result = createLeadSchema.parse({
      first_name: 'John',
      last_name: 'Doe',
    })
    expect(result.first_name).toBe('John')
    expect(result.last_name).toBe('Doe')
    expect(result.status).toBe('new')
    expect(result.priority).toBe('normal')
    expect(result.source).toBe('other')
    expect(result.score).toBe(0)
    expect(result.expected_contract_value).toBe(0)
    expect(result.probability_pct).toBe(0)
  })

  test('createLeadSchema requires first_name and last_name', () => {
    expect(() => createLeadSchema.parse({})).toThrow()
    expect(() => createLeadSchema.parse({ first_name: 'John' })).toThrow()
    expect(() => createLeadSchema.parse({ last_name: 'Doe' })).toThrow()
  })

  test('createLeadSchema rejects first_name > 100 chars', () => {
    expect(() => createLeadSchema.parse({
      first_name: 'A'.repeat(101),
      last_name: 'Doe',
    })).toThrow()
  })

  test('createLeadSchema accepts full lead with all optional fields', () => {
    const result = createLeadSchema.parse({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '555-9876',
      address: '789 Oak Ave',
      lot_address: '101 Lot Dr',
      source: 'referral',
      source_detail: 'Referred by neighbor',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring2026',
      project_type: 'Custom Home',
      budget_range_low: 500000,
      budget_range_high: 750000,
      timeline: '6-12 months',
      lot_status: 'owned',
      financing_status: 'pre-approved',
      preconstruction_type: 'design_build',
      status: 'qualified',
      priority: 'high',
      score: 85,
      expected_contract_value: 650000,
      probability_pct: 75,
    })
    expect(result.email).toBe('jane@example.com')
    expect(result.source).toBe('referral')
    expect(result.preconstruction_type).toBe('design_build')
    expect(result.score).toBe(85)
  })

  test('createLeadSchema rejects invalid email', () => {
    expect(() => createLeadSchema.parse({
      first_name: 'John',
      last_name: 'Doe',
      email: 'not-an-email',
    })).toThrow()
  })

  test('createLeadSchema rejects score > 100', () => {
    expect(() => createLeadSchema.parse({
      first_name: 'John',
      last_name: 'Doe',
      score: 101,
    })).toThrow()
  })

  test('updateLeadSchema accepts partial updates', () => {
    const result = updateLeadSchema.parse({ first_name: 'Updated', status: 'contacted' })
    expect(result.first_name).toBe('Updated')
    expect(result.status).toBe('contacted')
    expect(result.last_name).toBeUndefined()
  })

  test('updateLeadSchema accepts lost_reason and lost_competitor', () => {
    const result = updateLeadSchema.parse({
      status: 'lost',
      lost_reason: 'Too expensive',
      lost_competitor: 'ABC Builders',
    })
    expect(result.lost_reason).toBe('Too expensive')
    expect(result.lost_competitor).toBe('ABC Builders')
  })
})

// ============================================================================
// Activity Schemas
// ============================================================================

describe('Module 36 — Activity Schemas', () => {
  test('listLeadActivitiesSchema accepts valid params with defaults', () => {
    const result = listLeadActivitiesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listLeadActivitiesSchema accepts activity_type filter', () => {
    const result = listLeadActivitiesSchema.parse({ activity_type: 'call' })
    expect(result.activity_type).toBe('call')
  })

  test('createLeadActivitySchema accepts valid activity', () => {
    const result = createLeadActivitySchema.parse({
      activity_type: 'meeting',
      subject: 'Design consultation',
      description: 'Discussed layout preferences',
      duration_minutes: 60,
    })
    expect(result.activity_type).toBe('meeting')
    expect(result.subject).toBe('Design consultation')
    expect(result.duration_minutes).toBe(60)
  })

  test('createLeadActivitySchema has correct defaults', () => {
    const result = createLeadActivitySchema.parse({})
    expect(result.activity_type).toBe('note')
  })

  test('createLeadActivitySchema validates activity_date format', () => {
    const result = createLeadActivitySchema.parse({ activity_date: '2026-03-15' })
    expect(result.activity_date).toBe('2026-03-15')
  })

  test('createLeadActivitySchema rejects invalid activity_date format', () => {
    expect(() => createLeadActivitySchema.parse({ activity_date: '03/15/2026' })).toThrow()
  })

  test('createLeadActivitySchema rejects duration_minutes > 1440', () => {
    expect(() => createLeadActivitySchema.parse({ duration_minutes: 1441 })).toThrow()
  })

  test('updateLeadActivitySchema accepts partial updates', () => {
    const result = updateLeadActivitySchema.parse({ subject: 'Updated subject' })
    expect(result.subject).toBe('Updated subject')
    expect(result.activity_type).toBeUndefined()
  })
})

// ============================================================================
// Lead Source Schemas
// ============================================================================

describe('Module 36 — Lead Source Schemas', () => {
  test('listLeadSourcesSchema accepts valid params', () => {
    const result = listLeadSourcesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listLeadSourcesSchema accepts filters', () => {
    const result = listLeadSourcesSchema.parse({
      source_type: 'referral',
      is_active: 'true',
      q: 'Google',
    })
    expect(result.source_type).toBe('referral')
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('Google')
  })

  test('createLeadSourceSchema accepts valid source', () => {
    const result = createLeadSourceSchema.parse({
      name: 'Google Ads',
      source_type: 'advertising',
    })
    expect(result.name).toBe('Google Ads')
    expect(result.source_type).toBe('advertising')
    expect(result.is_active).toBe(true)
  })

  test('createLeadSourceSchema requires name', () => {
    expect(() => createLeadSourceSchema.parse({})).toThrow()
  })

  test('createLeadSourceSchema rejects name > 200 chars', () => {
    expect(() => createLeadSourceSchema.parse({
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createLeadSourceSchema has correct defaults', () => {
    const result = createLeadSourceSchema.parse({ name: 'Test Source' })
    expect(result.source_type).toBe('other')
    expect(result.is_active).toBe(true)
  })

  test('updateLeadSourceSchema accepts partial updates', () => {
    const result = updateLeadSourceSchema.parse({ name: 'Updated Name', is_active: false })
    expect(result.name).toBe('Updated Name')
    expect(result.is_active).toBe(false)
    expect(result.source_type).toBeUndefined()
  })
})

// ============================================================================
// Pipeline Schemas
// ============================================================================

describe('Module 36 — Pipeline Schemas', () => {
  test('listPipelinesSchema accepts valid params', () => {
    const result = listPipelinesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPipelinesSchema rejects limit > 100', () => {
    expect(() => listPipelinesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listPipelinesSchema accepts filters', () => {
    const result = listPipelinesSchema.parse({
      is_active: 'true',
      q: 'Default',
    })
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('Default')
  })

  test('createPipelineSchema accepts valid pipeline', () => {
    const result = createPipelineSchema.parse({
      name: 'Sales Pipeline',
    })
    expect(result.name).toBe('Sales Pipeline')
    expect(result.is_default).toBe(false)
    expect(result.is_active).toBe(true)
  })

  test('createPipelineSchema requires name', () => {
    expect(() => createPipelineSchema.parse({})).toThrow()
  })

  test('createPipelineSchema rejects name > 200 chars', () => {
    expect(() => createPipelineSchema.parse({
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createPipelineSchema accepts is_default flag', () => {
    const result = createPipelineSchema.parse({
      name: 'Primary Pipeline',
      is_default: true,
    })
    expect(result.is_default).toBe(true)
  })

  test('updatePipelineSchema accepts partial updates', () => {
    const result = updatePipelineSchema.parse({ name: 'Renamed Pipeline', is_active: false })
    expect(result.name).toBe('Renamed Pipeline')
    expect(result.is_active).toBe(false)
    expect(result.is_default).toBeUndefined()
  })
})

// ============================================================================
// Pipeline Stage Schemas
// ============================================================================

describe('Module 36 — Pipeline Stage Schemas', () => {
  test('listPipelineStagesSchema accepts valid params with defaults', () => {
    const result = listPipelineStagesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listPipelineStagesSchema accepts stage_type filter', () => {
    const result = listPipelineStagesSchema.parse({ stage_type: 'lead' })
    expect(result.stage_type).toBe('lead')
  })

  test('listPipelineStagesSchema accepts is_active filter', () => {
    const result = listPipelineStagesSchema.parse({ is_active: 'true' })
    expect(result.is_active).toBe(true)
  })

  test('createPipelineStageSchema accepts valid stage', () => {
    const result = createPipelineStageSchema.parse({
      name: 'New Lead',
    })
    expect(result.name).toBe('New Lead')
    expect(result.stage_type).toBe('lead')
    expect(result.sequence_order).toBe(0)
    expect(result.probability_default).toBe(0)
    expect(result.is_active).toBe(true)
  })

  test('createPipelineStageSchema requires name', () => {
    expect(() => createPipelineStageSchema.parse({})).toThrow()
  })

  test('createPipelineStageSchema rejects name > 200 chars', () => {
    expect(() => createPipelineStageSchema.parse({
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createPipelineStageSchema accepts all optional fields', () => {
    const result = createPipelineStageSchema.parse({
      name: 'Proposal Stage',
      stage_type: 'proposal',
      sequence_order: 3,
      probability_default: 50,
      color: '#10B981',
      is_active: true,
    })
    expect(result.stage_type).toBe('proposal')
    expect(result.sequence_order).toBe(3)
    expect(result.probability_default).toBe(50)
    expect(result.color).toBe('#10B981')
  })

  test('createPipelineStageSchema rejects probability_default > 100', () => {
    expect(() => createPipelineStageSchema.parse({
      name: 'Test',
      probability_default: 101,
    })).toThrow()
  })

  test('updatePipelineStageSchema accepts partial updates', () => {
    const result = updatePipelineStageSchema.parse({ name: 'Renamed Stage', sequence_order: 5 })
    expect(result.name).toBe('Renamed Stage')
    expect(result.sequence_order).toBe(5)
    expect(result.stage_type).toBeUndefined()
  })

  test('updatePipelineStageSchema rejects invalid stage_type', () => {
    expect(() => updatePipelineStageSchema.parse({ stage_type: 'invalid' })).toThrow()
  })
})
