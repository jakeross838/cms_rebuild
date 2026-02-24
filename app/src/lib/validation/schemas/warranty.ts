/**
 * Module 31: Warranty & Home Care Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const warrantyStatusEnum = z.enum(['active', 'expired', 'voided', 'transferred'])

export const warrantyTypeEnum = z.enum([
  'structural', 'mechanical', 'electrical', 'plumbing', 'hvac', 'roofing', 'appliance', 'general', 'workmanship',
])

export const claimStatusEnum = z.enum([
  'submitted', 'acknowledged', 'in_progress', 'resolved', 'denied', 'escalated',
])

export const claimPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

export const claimHistoryActionEnum = z.enum([
  'created', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'denied', 'escalated', 'reopened', 'note_added',
])

export const maintenanceFrequencyEnum = z.enum([
  'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual',
])

export const taskStatusEnum = z.enum(['pending', 'scheduled', 'completed', 'overdue', 'skipped'])

// ── Warranties ────────────────────────────────────────────────────────────

export const listWarrantiesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: warrantyStatusEnum.optional(),
  warranty_type: warrantyTypeEnum.optional(),
  vendor_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createWarrantySchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  warranty_type: warrantyTypeEnum.optional().default('general'),
  status: warrantyStatusEnum.optional().default('active'),
  vendor_id: z.string().uuid().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  coverage_details: z.string().trim().max(10000).nullable().optional(),
  exclusions: z.string().trim().max(10000).nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
  contact_name: z.string().trim().max(200).nullable().optional(),
  contact_phone: z.string().trim().max(50).nullable().optional(),
  contact_email: z.string().trim().max(200).nullable().optional(),
})

export const updateWarrantySchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  warranty_type: warrantyTypeEnum.optional(),
  status: warrantyStatusEnum.optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  coverage_details: z.string().trim().max(10000).nullable().optional(),
  exclusions: z.string().trim().max(10000).nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
  contact_name: z.string().trim().max(200).nullable().optional(),
  contact_phone: z.string().trim().max(50).nullable().optional(),
  contact_email: z.string().trim().max(200).nullable().optional(),
  transferred_to: z.string().uuid().nullable().optional(),
})

// ── Warranty Claims ───────────────────────────────────────────────────────

export const listWarrantyClaimsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  warranty_id: z.string().uuid().optional(),
  status: claimStatusEnum.optional(),
  priority: claimPriorityEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createWarrantyClaimSchema = z.object({
  warranty_id: z.string().uuid(),
  claim_number: z.string().trim().min(1).max(30),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  status: claimStatusEnum.optional().default('submitted'),
  priority: claimPriorityEnum.optional().default('normal'),
  reported_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  photos: z.array(z.unknown()).optional().default([]),
})

export const updateWarrantyClaimSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  status: claimStatusEnum.optional(),
  priority: claimPriorityEnum.optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  resolution_notes: z.string().trim().max(10000).nullable().optional(),
  resolution_cost: z.number().min(0).max(9999999999999.99).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  photos: z.array(z.unknown()).optional(),
})

export const resolveWarrantyClaimSchema = z.object({
  resolution_notes: z.string().trim().max(10000).nullable().optional(),
  resolution_cost: z.number().min(0).max(9999999999999.99).optional().default(0),
})

// ── Warranty Claim History ────────────────────────────────────────────────

export const listClaimHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// ── Maintenance Schedules ─────────────────────────────────────────────────

export const listMaintenanceSchedulesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  frequency: maintenanceFrequencyEnum.optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMaintenanceScheduleSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  frequency: maintenanceFrequencyEnum.optional().default('annual'),
  category: z.string().trim().max(100).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  next_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  estimated_cost: z.number().min(0).max(9999999999999.99).optional().default(0),
  is_active: z.boolean().optional().default(true),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateMaintenanceScheduleSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  frequency: maintenanceFrequencyEnum.optional(),
  category: z.string().trim().max(100).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  next_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  estimated_cost: z.number().min(0).max(9999999999999.99).optional(),
  is_active: z.boolean().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Maintenance Tasks ─────────────────────────────────────────────────────

export const listMaintenanceTasksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  schedule_id: z.string().uuid().optional(),
  status: taskStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMaintenanceTaskSchema = z.object({
  schedule_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  status: taskStatusEnum.optional().default('pending'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  actual_cost: z.number().min(0).max(9999999999999.99).optional().default(0),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateMaintenanceTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  status: taskStatusEnum.optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  actual_cost: z.number().min(0).max(9999999999999.99).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const completeMaintenanceTaskSchema = z.object({
  actual_cost: z.number().min(0).max(9999999999999.99).optional().default(0),
  notes: z.string().trim().max(10000).nullable().optional(),
})
