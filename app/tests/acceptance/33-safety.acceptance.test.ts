/**
 * Module 33 — Safety & Compliance Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 33 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  InspectionStatus,
  InspectionResult,
  InspectionItemResult,
  TalkStatus,
  SafetyIncident,
  SafetyInspection,
  SafetyInspectionItem,
  ToolboxTalk,
  ToolboxTalkAttendee,
} from '@/types/safety'

import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
  INSPECTION_STATUSES,
  INSPECTION_RESULTS,
  INSPECTION_ITEM_RESULTS,
  TALK_STATUSES,
} from '@/types/safety'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  incidentSeverityEnum,
  incidentStatusEnum,
  incidentTypeEnum,
  inspectionStatusEnum,
  inspectionResultEnum,
  inspectionItemResultEnum,
  talkStatusEnum,
  listIncidentsSchema,
  createIncidentSchema,
  updateIncidentSchema,
  listInspectionsSchema,
  createInspectionSchema,
  updateInspectionSchema,
  completeInspectionSchema,
  listInspectionItemsSchema,
  createInspectionItemSchema,
  updateInspectionItemSchema,
  listToolboxTalksSchema,
  createToolboxTalkSchema,
  updateToolboxTalkSchema,
  completeToolboxTalkSchema,
  listAttendeesSchema,
  createAttendeeSchema,
  updateAttendeeSchema,
} from '@/lib/validation/schemas/safety'

// ============================================================================
// Type System
// ============================================================================

describe('Module 33 — Safety & Compliance Types', () => {
  test('IncidentSeverity has 5 values', () => {
    const values: IncidentSeverity[] = ['near_miss', 'minor', 'moderate', 'serious', 'fatal']
    expect(values).toHaveLength(5)
  })

  test('IncidentStatus has 4 values', () => {
    const values: IncidentStatus[] = ['reported', 'investigating', 'resolved', 'closed']
    expect(values).toHaveLength(4)
  })

  test('IncidentType has 8 values', () => {
    const values: IncidentType[] = [
      'fall', 'struck_by', 'caught_in', 'electrical', 'chemical', 'heat', 'vehicle', 'other',
    ]
    expect(values).toHaveLength(8)
  })

  test('InspectionStatus has 4 values', () => {
    const values: InspectionStatus[] = ['scheduled', 'in_progress', 'completed', 'failed']
    expect(values).toHaveLength(4)
  })

  test('InspectionResult has 3 values', () => {
    const values: InspectionResult[] = ['pass', 'fail', 'conditional']
    expect(values).toHaveLength(3)
  })

  test('InspectionItemResult has 4 values', () => {
    const values: InspectionItemResult[] = ['pass', 'fail', 'na', 'not_inspected']
    expect(values).toHaveLength(4)
  })

  test('TalkStatus has 3 values', () => {
    const values: TalkStatus[] = ['scheduled', 'completed', 'cancelled']
    expect(values).toHaveLength(3)
  })

  test('SafetyIncident interface has all required fields', () => {
    const incident: SafetyIncident = {
      id: '1', company_id: '1', job_id: '1',
      incident_number: 'INC-001', title: 'Worker fall from scaffold',
      description: 'Worker fell 6ft from scaffold', incident_date: '2026-02-20',
      incident_time: '14:30', location: 'Building A - Floor 3',
      severity: 'moderate', status: 'reported', incident_type: 'fall',
      reported_by: '1', assigned_to: '2',
      injured_party: 'John Smith', injury_description: 'Sprained ankle',
      witnesses: [{ name: 'Jane Doe' }], root_cause: null,
      corrective_actions: null, preventive_actions: null,
      osha_recordable: true, osha_report_number: null,
      lost_work_days: 3, restricted_days: 5, medical_treatment: true,
      photos: [], documents: [],
      resolved_at: null, resolved_by: null, closed_at: null, closed_by: null,
      created_by: '1', created_at: '2026-02-20', updated_at: '2026-02-20',
      deleted_at: null,
    }
    expect(incident.incident_number).toBe('INC-001')
    expect(incident.severity).toBe('moderate')
    expect(incident.osha_recordable).toBe(true)
    expect(incident.lost_work_days).toBe(3)
  })

  test('SafetyInspection interface has all required fields', () => {
    const inspection: SafetyInspection = {
      id: '1', company_id: '1', job_id: '1',
      inspection_number: 'INS-001', title: 'Weekly Site Safety Inspection',
      description: null, inspection_date: '2026-02-20',
      inspection_type: 'general', status: 'scheduled',
      result: null, inspector_id: '1', location: 'Job Site A',
      total_items: 20, passed_items: 18, failed_items: 1, na_items: 1,
      score: 90.00, notes: null,
      follow_up_required: false, follow_up_date: null, follow_up_notes: null,
      completed_at: null, completed_by: null, created_by: '1',
      created_at: '2026-02-20', updated_at: '2026-02-20', deleted_at: null,
    }
    expect(inspection.inspection_number).toBe('INS-001')
    expect(inspection.total_items).toBe(20)
    expect(inspection.score).toBe(90.00)
  })

  test('SafetyInspectionItem interface has all required fields', () => {
    const item: SafetyInspectionItem = {
      id: '1', inspection_id: '1', company_id: '1',
      description: 'Fall protection in place', category: 'fall_protection',
      result: 'pass', notes: null, photo_url: null, sort_order: 0,
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(item.description).toBe('Fall protection in place')
    expect(item.result).toBe('pass')
  })

  test('ToolboxTalk interface has all required fields', () => {
    const talk: ToolboxTalk = {
      id: '1', company_id: '1', job_id: '1',
      title: 'Heat Stress Awareness', topic: 'Heat Safety',
      description: 'Review heat stress prevention', talk_date: '2026-02-20',
      talk_time: '07:00', duration_minutes: 15,
      status: 'scheduled', presenter_id: '1', location: 'Job Trailer',
      materials: [], notes: null, completed_at: null, created_by: '1',
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(talk.title).toBe('Heat Stress Awareness')
    expect(talk.duration_minutes).toBe(15)
    expect(talk.status).toBe('scheduled')
  })

  test('ToolboxTalkAttendee interface has all required fields', () => {
    const attendee: ToolboxTalkAttendee = {
      id: '1', talk_id: '1', company_id: '1',
      attendee_name: 'Mike Johnson', attendee_id: '3',
      trade: 'Electrician', company_name: 'ABC Electric',
      signed: true, signed_at: '2026-02-20T07:15:00Z',
      notes: null, created_at: '2026-02-20',
    }
    expect(attendee.attendee_name).toBe('Mike Johnson')
    expect(attendee.signed).toBe(true)
    expect(attendee.trade).toBe('Electrician')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 33 — Constants', () => {
  test('INCIDENT_SEVERITIES has 5 entries with value and label', () => {
    expect(INCIDENT_SEVERITIES).toHaveLength(5)
    for (const s of INCIDENT_SEVERITIES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('INCIDENT_SEVERITIES includes all expected values', () => {
    const values = INCIDENT_SEVERITIES.map((s) => s.value)
    expect(values).toContain('near_miss')
    expect(values).toContain('minor')
    expect(values).toContain('serious')
    expect(values).toContain('fatal')
  })

  test('INCIDENT_STATUSES has 4 entries with value and label', () => {
    expect(INCIDENT_STATUSES).toHaveLength(4)
    for (const s of INCIDENT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('INCIDENT_TYPES has 8 entries with value and label', () => {
    expect(INCIDENT_TYPES).toHaveLength(8)
    for (const t of INCIDENT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    }
    const values = INCIDENT_TYPES.map((t) => t.value)
    expect(values).toContain('fall')
    expect(values).toContain('struck_by')
    expect(values).toContain('electrical')
    expect(values).toContain('vehicle')
  })

  test('INSPECTION_STATUSES has 4 entries with value and label', () => {
    expect(INSPECTION_STATUSES).toHaveLength(4)
    for (const s of INSPECTION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('INSPECTION_RESULTS has 3 entries with value and label', () => {
    expect(INSPECTION_RESULTS).toHaveLength(3)
    for (const r of INSPECTION_RESULTS) {
      expect(r).toHaveProperty('value')
      expect(r).toHaveProperty('label')
    }
  })

  test('INSPECTION_ITEM_RESULTS has 4 entries with value and label', () => {
    expect(INSPECTION_ITEM_RESULTS).toHaveLength(4)
    for (const r of INSPECTION_ITEM_RESULTS) {
      expect(r).toHaveProperty('value')
      expect(r).toHaveProperty('label')
    }
  })

  test('TALK_STATUSES has 3 entries with value and label', () => {
    expect(TALK_STATUSES).toHaveLength(3)
    for (const s of TALK_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
    const values = TALK_STATUSES.map((s) => s.value)
    expect(values).toContain('scheduled')
    expect(values).toContain('completed')
    expect(values).toContain('cancelled')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 33 — Enum Schemas', () => {
  test('incidentSeverityEnum accepts all 5 severities', () => {
    for (const s of ['near_miss', 'minor', 'moderate', 'serious', 'fatal']) {
      expect(incidentSeverityEnum.parse(s)).toBe(s)
    }
  })

  test('incidentSeverityEnum rejects invalid severity', () => {
    expect(() => incidentSeverityEnum.parse('critical')).toThrow()
  })

  test('incidentStatusEnum accepts all 4 statuses', () => {
    for (const s of ['reported', 'investigating', 'resolved', 'closed']) {
      expect(incidentStatusEnum.parse(s)).toBe(s)
    }
  })

  test('incidentStatusEnum rejects invalid status', () => {
    expect(() => incidentStatusEnum.parse('pending')).toThrow()
  })

  test('incidentTypeEnum accepts all 8 types', () => {
    for (const t of ['fall', 'struck_by', 'caught_in', 'electrical', 'chemical', 'heat', 'vehicle', 'other']) {
      expect(incidentTypeEnum.parse(t)).toBe(t)
    }
  })

  test('incidentTypeEnum rejects invalid type', () => {
    expect(() => incidentTypeEnum.parse('explosion')).toThrow()
  })

  test('inspectionStatusEnum accepts all 4 statuses', () => {
    for (const s of ['scheduled', 'in_progress', 'completed', 'failed']) {
      expect(inspectionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('inspectionStatusEnum rejects invalid status', () => {
    expect(() => inspectionStatusEnum.parse('cancelled')).toThrow()
  })

  test('inspectionResultEnum accepts all 3 results', () => {
    for (const r of ['pass', 'fail', 'conditional']) {
      expect(inspectionResultEnum.parse(r)).toBe(r)
    }
  })

  test('inspectionResultEnum rejects invalid result', () => {
    expect(() => inspectionResultEnum.parse('partial')).toThrow()
  })

  test('inspectionItemResultEnum accepts all 4 results', () => {
    for (const r of ['pass', 'fail', 'na', 'not_inspected']) {
      expect(inspectionItemResultEnum.parse(r)).toBe(r)
    }
  })

  test('inspectionItemResultEnum rejects invalid result', () => {
    expect(() => inspectionItemResultEnum.parse('skipped')).toThrow()
  })

  test('talkStatusEnum accepts all 3 statuses', () => {
    for (const s of ['scheduled', 'completed', 'cancelled']) {
      expect(talkStatusEnum.parse(s)).toBe(s)
    }
  })

  test('talkStatusEnum rejects invalid status', () => {
    expect(() => talkStatusEnum.parse('draft')).toThrow()
  })
})

// ============================================================================
// Incident Schemas
// ============================================================================

describe('Module 33 — Incident Schemas', () => {
  test('listIncidentsSchema accepts valid params', () => {
    const result = listIncidentsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listIncidentsSchema rejects limit > 100', () => {
    expect(() => listIncidentsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listIncidentsSchema accepts all filters', () => {
    const result = listIncidentsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'reported',
      severity: 'moderate',
      incident_type: 'fall',
      q: 'scaffold',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('reported')
    expect(result.severity).toBe('moderate')
    expect(result.incident_type).toBe('fall')
    expect(result.q).toBe('scaffold')
  })

  test('createIncidentSchema accepts valid incident', () => {
    const result = createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'INC-001',
      title: 'Worker fall from scaffold',
      incident_date: '2026-02-20',
    })
    expect(result.incident_number).toBe('INC-001')
    expect(result.title).toBe('Worker fall from scaffold')
    expect(result.severity).toBe('near_miss')
    expect(result.status).toBe('reported')
    expect(result.incident_type).toBe('other')
    expect(result.osha_recordable).toBe(false)
    expect(result.lost_work_days).toBe(0)
    expect(result.restricted_days).toBe(0)
    expect(result.medical_treatment).toBe(false)
  })

  test('createIncidentSchema requires job_id, incident_number, title, incident_date', () => {
    expect(() => createIncidentSchema.parse({})).toThrow()
    expect(() => createIncidentSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
    expect(() => createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'INC-001',
    })).toThrow()
    expect(() => createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'INC-001',
      title: 'Test',
    })).toThrow()
  })

  test('createIncidentSchema rejects incident_number > 30 chars', () => {
    expect(() => createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'A'.repeat(31),
      title: 'Test',
      incident_date: '2026-02-20',
    })).toThrow()
  })

  test('createIncidentSchema rejects title > 255 chars', () => {
    expect(() => createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'INC-001',
      title: 'A'.repeat(256),
      incident_date: '2026-02-20',
    })).toThrow()
  })

  test('createIncidentSchema validates incident_date format', () => {
    expect(() => createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'INC-001',
      title: 'Test',
      incident_date: '02/20/2026',
    })).toThrow()
  })

  test('createIncidentSchema rejects lost_work_days > 365', () => {
    expect(() => createIncidentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      incident_number: 'INC-001',
      title: 'Test',
      incident_date: '2026-02-20',
      lost_work_days: 400,
    })).toThrow()
  })

  test('updateIncidentSchema accepts partial updates', () => {
    const result = updateIncidentSchema.parse({ title: 'Updated title', severity: 'serious' })
    expect(result.title).toBe('Updated title')
    expect(result.severity).toBe('serious')
    expect(result.incident_number).toBeUndefined()
  })
})

// ============================================================================
// Inspection Schemas
// ============================================================================

describe('Module 33 — Inspection Schemas', () => {
  test('listInspectionsSchema accepts valid params', () => {
    const result = listInspectionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listInspectionsSchema rejects limit > 100', () => {
    expect(() => listInspectionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listInspectionsSchema accepts all filters', () => {
    const result = listInspectionsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      result: 'pass',
      inspector_id: '550e8400-e29b-41d4-a716-446655440001',
      q: 'safety',
    })
    expect(result.status).toBe('completed')
    expect(result.result).toBe('pass')
    expect(result.inspector_id).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('createInspectionSchema accepts valid inspection', () => {
    const result = createInspectionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      inspection_number: 'INS-001',
      title: 'Weekly Safety Inspection',
      inspection_date: '2026-02-20',
    })
    expect(result.inspection_number).toBe('INS-001')
    expect(result.status).toBe('scheduled')
    expect(result.inspection_type).toBe('general')
    expect(result.follow_up_required).toBe(false)
  })

  test('createInspectionSchema requires job_id, inspection_number, title, inspection_date', () => {
    expect(() => createInspectionSchema.parse({})).toThrow()
    expect(() => createInspectionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      inspection_number: 'INS-001',
      title: 'Test',
    })).toThrow()
  })

  test('createInspectionSchema rejects invalid inspection_date format', () => {
    expect(() => createInspectionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      inspection_number: 'INS-001',
      title: 'Test',
      inspection_date: 'Feb 20, 2026',
    })).toThrow()
  })

  test('updateInspectionSchema accepts partial updates', () => {
    const result = updateInspectionSchema.parse({
      title: 'Updated Inspection',
      score: 85.5,
      follow_up_required: true,
    })
    expect(result.title).toBe('Updated Inspection')
    expect(result.score).toBe(85.5)
    expect(result.follow_up_required).toBe(true)
  })

  test('completeInspectionSchema requires result', () => {
    expect(() => completeInspectionSchema.parse({})).toThrow()
  })

  test('completeInspectionSchema accepts valid completion', () => {
    const result = completeInspectionSchema.parse({
      result: 'pass',
      notes: 'All items passed',
      score: 95,
    })
    expect(result.result).toBe('pass')
    expect(result.notes).toBe('All items passed')
    expect(result.score).toBe(95)
  })

  test('completeInspectionSchema rejects invalid result', () => {
    expect(() => completeInspectionSchema.parse({ result: 'partial' })).toThrow()
  })
})

// ============================================================================
// Inspection Item Schemas
// ============================================================================

describe('Module 33 — Inspection Item Schemas', () => {
  test('listInspectionItemsSchema accepts valid params with defaults', () => {
    const result = listInspectionItemsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createInspectionItemSchema accepts valid item', () => {
    const result = createInspectionItemSchema.parse({
      description: 'Guard rails properly installed',
      category: 'fall_protection',
      result: 'pass',
    })
    expect(result.description).toBe('Guard rails properly installed')
    expect(result.category).toBe('fall_protection')
    expect(result.result).toBe('pass')
  })

  test('createInspectionItemSchema requires description', () => {
    expect(() => createInspectionItemSchema.parse({})).toThrow()
  })

  test('createInspectionItemSchema has correct defaults', () => {
    const result = createInspectionItemSchema.parse({ description: 'Test item' })
    expect(result.result).toBe('not_inspected')
    expect(result.sort_order).toBe(0)
  })

  test('updateInspectionItemSchema accepts partial updates', () => {
    const result = updateInspectionItemSchema.parse({ result: 'fail', notes: 'Missing guard rail' })
    expect(result.result).toBe('fail')
    expect(result.notes).toBe('Missing guard rail')
    expect(result.description).toBeUndefined()
  })
})

// ============================================================================
// Toolbox Talk Schemas
// ============================================================================

describe('Module 33 — Toolbox Talk Schemas', () => {
  test('listToolboxTalksSchema accepts valid params', () => {
    const result = listToolboxTalksSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listToolboxTalksSchema rejects limit > 100', () => {
    expect(() => listToolboxTalksSchema.parse({ limit: 200 })).toThrow()
  })

  test('listToolboxTalksSchema accepts all filters', () => {
    const result = listToolboxTalksSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      q: 'heat',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('completed')
    expect(result.q).toBe('heat')
  })

  test('createToolboxTalkSchema accepts valid talk', () => {
    const result = createToolboxTalkSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Heat Stress Awareness',
      talk_date: '2026-02-20',
    })
    expect(result.title).toBe('Heat Stress Awareness')
    expect(result.status).toBe('scheduled')
    expect(result.materials).toEqual([])
  })

  test('createToolboxTalkSchema requires job_id, title, talk_date', () => {
    expect(() => createToolboxTalkSchema.parse({})).toThrow()
    expect(() => createToolboxTalkSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
    })).toThrow()
  })

  test('createToolboxTalkSchema rejects title > 255 chars', () => {
    expect(() => createToolboxTalkSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
      talk_date: '2026-02-20',
    })).toThrow()
  })

  test('createToolboxTalkSchema validates talk_date format', () => {
    expect(() => createToolboxTalkSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      talk_date: '02-20-2026',
    })).toThrow()
  })

  test('createToolboxTalkSchema rejects duration_minutes > 480', () => {
    expect(() => createToolboxTalkSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      talk_date: '2026-02-20',
      duration_minutes: 500,
    })).toThrow()
  })

  test('updateToolboxTalkSchema accepts partial updates', () => {
    const result = updateToolboxTalkSchema.parse({
      title: 'Updated Talk',
      status: 'cancelled',
    })
    expect(result.title).toBe('Updated Talk')
    expect(result.status).toBe('cancelled')
    expect(result.topic).toBeUndefined()
  })

  test('completeToolboxTalkSchema accepts empty object', () => {
    const result = completeToolboxTalkSchema.parse({})
    expect(result.notes).toBeUndefined()
    expect(result.duration_minutes).toBeUndefined()
  })

  test('completeToolboxTalkSchema accepts notes and duration', () => {
    const result = completeToolboxTalkSchema.parse({
      notes: 'Good discussion',
      duration_minutes: 20,
    })
    expect(result.notes).toBe('Good discussion')
    expect(result.duration_minutes).toBe(20)
  })
})

// ============================================================================
// Attendee Schemas
// ============================================================================

describe('Module 33 — Attendee Schemas', () => {
  test('listAttendeesSchema accepts valid params with defaults', () => {
    const result = listAttendeesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createAttendeeSchema accepts valid attendee', () => {
    const result = createAttendeeSchema.parse({
      attendee_name: 'Mike Johnson',
      trade: 'Electrician',
      company_name: 'ABC Electric',
      signed: true,
    })
    expect(result.attendee_name).toBe('Mike Johnson')
    expect(result.trade).toBe('Electrician')
    expect(result.signed).toBe(true)
  })

  test('createAttendeeSchema requires attendee_name', () => {
    expect(() => createAttendeeSchema.parse({})).toThrow()
  })

  test('createAttendeeSchema rejects attendee_name > 200 chars', () => {
    expect(() => createAttendeeSchema.parse({
      attendee_name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createAttendeeSchema has correct defaults', () => {
    const result = createAttendeeSchema.parse({ attendee_name: 'Test Worker' })
    expect(result.signed).toBe(false)
  })

  test('updateAttendeeSchema accepts partial updates', () => {
    const result = updateAttendeeSchema.parse({ signed: true, trade: 'Plumber' })
    expect(result.signed).toBe(true)
    expect(result.trade).toBe('Plumber')
    expect(result.attendee_name).toBeUndefined()
  })
})
