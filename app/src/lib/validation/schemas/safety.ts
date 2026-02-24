/**
 * Module 33: Safety & Compliance Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const incidentSeverityEnum = z.enum([
  'near_miss', 'minor', 'moderate', 'serious', 'fatal',
])

export const incidentStatusEnum = z.enum([
  'reported', 'investigating', 'resolved', 'closed',
])

export const incidentTypeEnum = z.enum([
  'fall', 'struck_by', 'caught_in', 'electrical', 'chemical', 'heat', 'vehicle', 'other',
])

export const inspectionStatusEnum = z.enum([
  'scheduled', 'in_progress', 'completed', 'failed',
])

export const inspectionResultEnum = z.enum([
  'pass', 'fail', 'conditional',
])

export const inspectionItemResultEnum = z.enum([
  'pass', 'fail', 'na', 'not_inspected',
])

export const talkStatusEnum = z.enum([
  'scheduled', 'completed', 'cancelled',
])

// ── Safety Incidents ──────────────────────────────────────────────────────

export const listIncidentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: incidentStatusEnum.optional(),
  severity: incidentSeverityEnum.optional(),
  incident_type: incidentTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createIncidentSchema = z.object({
  job_id: z.string().uuid(),
  incident_number: z.string().trim().min(1).max(30),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  incident_time: z.string().trim().max(10).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  severity: incidentSeverityEnum.optional().default('near_miss'),
  status: incidentStatusEnum.optional().default('reported'),
  incident_type: incidentTypeEnum.optional().default('other'),
  reported_by: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  injured_party: z.string().trim().max(255).nullable().optional(),
  injury_description: z.string().trim().max(10000).nullable().optional(),
  witnesses: z.array(z.unknown()).optional().default([]),
  root_cause: z.string().trim().max(10000).nullable().optional(),
  corrective_actions: z.string().trim().max(10000).nullable().optional(),
  preventive_actions: z.string().trim().max(10000).nullable().optional(),
  osha_recordable: z.boolean().optional().default(false),
  osha_report_number: z.string().trim().max(50).nullable().optional(),
  lost_work_days: z.number().int().min(0).max(365).optional().default(0),
  restricted_days: z.number().int().min(0).max(365).optional().default(0),
  medical_treatment: z.boolean().optional().default(false),
  photos: z.array(z.unknown()).optional().default([]),
  documents: z.array(z.unknown()).optional().default([]),
})

export const updateIncidentSchema = z.object({
  incident_number: z.string().trim().min(1).max(30).optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  incident_time: z.string().trim().max(10).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  severity: incidentSeverityEnum.optional(),
  status: incidentStatusEnum.optional(),
  incident_type: incidentTypeEnum.optional(),
  reported_by: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  injured_party: z.string().trim().max(255).nullable().optional(),
  injury_description: z.string().trim().max(10000).nullable().optional(),
  witnesses: z.array(z.unknown()).optional(),
  root_cause: z.string().trim().max(10000).nullable().optional(),
  corrective_actions: z.string().trim().max(10000).nullable().optional(),
  preventive_actions: z.string().trim().max(10000).nullable().optional(),
  osha_recordable: z.boolean().optional(),
  osha_report_number: z.string().trim().max(50).nullable().optional(),
  lost_work_days: z.number().int().min(0).max(365).optional(),
  restricted_days: z.number().int().min(0).max(365).optional(),
  medical_treatment: z.boolean().optional(),
  photos: z.array(z.unknown()).optional(),
  documents: z.array(z.unknown()).optional(),
})

// ── Safety Inspections ────────────────────────────────────────────────────

export const listInspectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: inspectionStatusEnum.optional(),
  result: inspectionResultEnum.optional(),
  inspector_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInspectionSchema = z.object({
  job_id: z.string().uuid(),
  inspection_number: z.string().trim().min(1).max(30),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  inspection_type: z.string().trim().min(1).max(100).optional().default('general'),
  status: inspectionStatusEnum.optional().default('scheduled'),
  result: inspectionResultEnum.nullable().optional(),
  inspector_id: z.string().uuid().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  follow_up_required: z.boolean().optional().default(false),
  follow_up_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  follow_up_notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateInspectionSchema = z.object({
  inspection_number: z.string().trim().min(1).max(30).optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  inspection_type: z.string().trim().min(1).max(100).optional(),
  status: inspectionStatusEnum.optional(),
  result: inspectionResultEnum.nullable().optional(),
  inspector_id: z.string().uuid().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  total_items: z.number().int().min(0).optional(),
  passed_items: z.number().int().min(0).optional(),
  failed_items: z.number().int().min(0).optional(),
  na_items: z.number().int().min(0).optional(),
  score: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  follow_up_notes: z.string().trim().max(10000).nullable().optional(),
})

export const completeInspectionSchema = z.object({
  result: inspectionResultEnum,
  notes: z.string().trim().max(5000).nullable().optional(),
  score: z.number().min(0).max(100).nullable().optional(),
})

// ── Safety Inspection Items ───────────────────────────────────────────────

export const listInspectionItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createInspectionItemSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  category: z.string().trim().max(100).nullable().optional(),
  result: inspectionItemResultEnum.optional().default('not_inspected'),
  notes: z.string().trim().max(5000).nullable().optional(),
  photo_url: z.string().trim().max(2000).nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateInspectionItemSchema = z.object({
  description: z.string().trim().min(1).max(2000).optional(),
  category: z.string().trim().max(100).nullable().optional(),
  result: inspectionItemResultEnum.optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  photo_url: z.string().trim().max(2000).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Toolbox Talks ─────────────────────────────────────────────────────────

export const listToolboxTalksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: talkStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createToolboxTalkSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  topic: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  talk_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  talk_time: z.string().trim().max(10).nullable().optional(),
  duration_minutes: z.number().int().min(1).max(480).nullable().optional(),
  status: talkStatusEnum.optional().default('scheduled'),
  presenter_id: z.string().uuid().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  materials: z.array(z.unknown()).optional().default([]),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateToolboxTalkSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  topic: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  talk_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  talk_time: z.string().trim().max(10).nullable().optional(),
  duration_minutes: z.number().int().min(1).max(480).nullable().optional(),
  status: talkStatusEnum.optional(),
  presenter_id: z.string().uuid().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  materials: z.array(z.unknown()).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const completeToolboxTalkSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
  duration_minutes: z.number().int().min(1).max(480).nullable().optional(),
})

// ── Toolbox Talk Attendees ────────────────────────────────────────────────

export const listAttendeesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createAttendeeSchema = z.object({
  attendee_name: z.string().trim().min(1).max(200),
  attendee_id: z.string().uuid().nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  company_name: z.string().trim().max(200).nullable().optional(),
  signed: z.boolean().optional().default(false),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateAttendeeSchema = z.object({
  attendee_name: z.string().trim().min(1).max(200).optional(),
  attendee_id: z.string().uuid().nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  company_name: z.string().trim().max(200).nullable().optional(),
  signed: z.boolean().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})
