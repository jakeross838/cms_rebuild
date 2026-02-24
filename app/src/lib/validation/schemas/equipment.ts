/**
 * Module 35: Equipment & Asset Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const equipmentStatusEnum = z.enum([
  'available', 'assigned', 'maintenance', 'out_of_service', 'retired',
])

export const equipmentTypeEnum = z.enum([
  'heavy_machinery', 'vehicle', 'power_tool', 'hand_tool', 'scaffolding', 'safety_equipment', 'measuring', 'other',
])

export const ownershipTypeEnum = z.enum(['owned', 'leased', 'rented'])

export const maintenanceTypeEnum = z.enum([
  'preventive', 'corrective', 'inspection', 'calibration',
])

export const maintenanceStatusEnum = z.enum([
  'scheduled', 'in_progress', 'completed', 'overdue', 'cancelled',
])

export const assignmentStatusEnum = z.enum(['active', 'completed', 'cancelled'])

export const inspectionTypeEnum = z.enum(['pre_use', 'post_use', 'periodic', 'safety'])

export const inspectionResultEnum = z.enum(['pass', 'fail', 'conditional'])

export const costTypeEnum = z.enum([
  'daily_rate', 'fuel', 'repair', 'insurance', 'transport', 'other',
])

// ── Equipment ─────────────────────────────────────────────────────────────

export const listEquipmentSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: equipmentStatusEnum.optional(),
  equipment_type: equipmentTypeEnum.optional(),
  ownership_type: ownershipTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  equipment_type: equipmentTypeEnum.optional().default('other'),
  status: equipmentStatusEnum.optional().default('available'),
  ownership_type: ownershipTypeEnum.optional().default('owned'),
  make: z.string().trim().max(100).nullable().optional(),
  model: z.string().trim().max(100).nullable().optional(),
  serial_number: z.string().trim().max(100).nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  purchase_price: z.number().min(0).max(99999999999999.99).optional().default(0),
  current_value: z.number().min(0).max(99999999999999.99).optional().default(0),
  daily_rate: z.number().min(0).max(9999999.99).optional().default(0),
  location: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  photo_urls: z.array(z.string().url()).optional().default([]),
})

export const updateEquipmentSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  equipment_type: equipmentTypeEnum.optional(),
  status: equipmentStatusEnum.optional(),
  ownership_type: ownershipTypeEnum.optional(),
  make: z.string().trim().max(100).nullable().optional(),
  model: z.string().trim().max(100).nullable().optional(),
  serial_number: z.string().trim().max(100).nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  purchase_price: z.number().min(0).max(99999999999999.99).optional(),
  current_value: z.number().min(0).max(99999999999999.99).optional(),
  daily_rate: z.number().min(0).max(9999999.99).optional(),
  location: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  photo_urls: z.array(z.string().url()).optional(),
})

// ── Equipment Assignments ────────────────────────────────────────────────

export const listAssignmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  equipment_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  status: assignmentStatusEnum.optional(),
})

export const createAssignmentSchema = z.object({
  equipment_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  status: assignmentStatusEnum.optional().default('active'),
  hours_used: z.number().min(0).max(9999999.99).optional().default(0),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateAssignmentSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  status: assignmentStatusEnum.optional(),
  hours_used: z.number().min(0).max(9999999.99).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Equipment Maintenance ────────────────────────────────────────────────

export const listMaintenanceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  equipment_id: z.string().uuid().optional(),
  maintenance_type: maintenanceTypeEnum.optional(),
  status: maintenanceStatusEnum.optional(),
})

export const createMaintenanceSchema = z.object({
  equipment_id: z.string().uuid(),
  maintenance_type: maintenanceTypeEnum.optional().default('preventive'),
  status: maintenanceStatusEnum.optional().default('scheduled'),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  completed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  performed_by: z.string().uuid().nullable().optional(),
  service_provider: z.string().trim().max(200).nullable().optional(),
  parts_cost: z.number().min(0).max(9999999.99).optional().default(0),
  labor_cost: z.number().min(0).max(9999999.99).optional().default(0),
  total_cost: z.number().min(0).max(9999999.99).optional().default(0),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateMaintenanceSchema = z.object({
  maintenance_type: maintenanceTypeEnum.optional(),
  status: maintenanceStatusEnum.optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  completed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  performed_by: z.string().uuid().nullable().optional(),
  service_provider: z.string().trim().max(200).nullable().optional(),
  parts_cost: z.number().min(0).max(9999999.99).optional(),
  labor_cost: z.number().min(0).max(9999999.99).optional(),
  total_cost: z.number().min(0).max(9999999.99).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Equipment Inspections ────────────────────────────────────────────────

export const listInspectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  equipment_id: z.string().uuid().optional(),
  inspection_type: inspectionTypeEnum.optional(),
  result: inspectionResultEnum.optional(),
})

export const createInspectionSchema = z.object({
  equipment_id: z.string().uuid(),
  inspection_type: inspectionTypeEnum.optional().default('pre_use'),
  result: inspectionResultEnum.optional().default('pass'),
  inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  inspector_id: z.string().uuid().nullable().optional(),
  checklist: z.array(z.unknown()).optional().default([]),
  deficiencies: z.string().trim().max(10000).nullable().optional(),
  corrective_action: z.string().trim().max(10000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateInspectionSchema = z.object({
  inspection_type: inspectionTypeEnum.optional(),
  result: inspectionResultEnum.optional(),
  inspection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  inspector_id: z.string().uuid().nullable().optional(),
  checklist: z.array(z.unknown()).optional(),
  deficiencies: z.string().trim().max(10000).nullable().optional(),
  corrective_action: z.string().trim().max(10000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Equipment Costs ──────────────────────────────────────────────────────

export const listCostsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  equipment_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  cost_type: costTypeEnum.optional(),
})

export const createCostSchema = z.object({
  equipment_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  cost_type: costTypeEnum.optional().default('daily_rate'),
  amount: z.number().min(0).max(9999999999.99),
  cost_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  receipt_url: z.string().url().nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateCostSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  cost_type: costTypeEnum.optional(),
  amount: z.number().min(0).max(9999999999.99).optional(),
  cost_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  receipt_url: z.string().url().nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})
