/**
 * Module 34: HR & Workforce Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const employmentStatusEnum = z.enum([
  'active', 'inactive', 'terminated', 'on_leave', 'probation',
])

export const employmentTypeEnum = z.enum([
  'full_time', 'part_time', 'contract', 'seasonal', 'temp',
])

export const payTypeEnum = z.enum(['hourly', 'salary'])

export const certificationStatusEnum = z.enum([
  'active', 'expired', 'pending_renewal', 'revoked',
])

export const documentTypeEnum = z.enum([
  'resume', 'contract', 'tax_form', 'identification', 'certification',
  'performance_review', 'disciplinary', 'other',
])

// ── Employees ─────────────────────────────────────────────────────────────

export const listEmployeesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  employment_status: employmentStatusEnum.optional(),
  employment_type: employmentTypeEnum.optional(),
  department_id: z.string().uuid().optional(),
  position_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createEmployeeSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  employee_number: z.string().trim().min(1).max(50),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  termination_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  position_id: z.string().uuid().nullable().optional(),
  employment_status: employmentStatusEnum.optional().default('active'),
  employment_type: employmentTypeEnum.optional().default('full_time'),
  base_wage: z.number().min(0).max(9999999999.99).optional().default(0),
  pay_type: payTypeEnum.optional().default('hourly'),
  workers_comp_class: z.string().trim().max(50).nullable().optional(),
  emergency_contact_name: z.string().trim().max(200).nullable().optional(),
  emergency_contact_phone: z.string().trim().max(20).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateEmployeeSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  employee_number: z.string().trim().min(1).max(50).optional(),
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  termination_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  position_id: z.string().uuid().nullable().optional(),
  employment_status: employmentStatusEnum.optional(),
  employment_type: employmentTypeEnum.optional(),
  base_wage: z.number().min(0).max(9999999999.99).optional(),
  pay_type: payTypeEnum.optional(),
  workers_comp_class: z.string().trim().max(50).nullable().optional(),
  emergency_contact_name: z.string().trim().max(200).nullable().optional(),
  emergency_contact_phone: z.string().trim().max(20).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Certifications ────────────────────────────────────────────────────────

export const listCertificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  employee_id: z.string().uuid().optional(),
  status: certificationStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCertificationSchema = z.object({
  employee_id: z.string().uuid(),
  certification_name: z.string().trim().min(1).max(255),
  certification_type: z.string().trim().max(100).nullable().optional(),
  certification_number: z.string().trim().max(100).nullable().optional(),
  issuing_authority: z.string().trim().max(200).nullable().optional(),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: certificationStatusEnum.optional().default('active'),
  document_url: z.string().url().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateCertificationSchema = z.object({
  certification_name: z.string().trim().min(1).max(255).optional(),
  certification_type: z.string().trim().max(100).nullable().optional(),
  certification_number: z.string().trim().max(100).nullable().optional(),
  issuing_authority: z.string().trim().max(200).nullable().optional(),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: certificationStatusEnum.optional(),
  document_url: z.string().url().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Employee Documents ────────────────────────────────────────────────────

export const listEmployeeDocumentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  employee_id: z.string().uuid().optional(),
  document_type: documentTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createEmployeeDocumentSchema = z.object({
  employee_id: z.string().uuid(),
  document_type: documentTypeEnum.optional().default('other'),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).nullable().optional(),
  file_url: z.string().url().nullable().optional(),
  file_name: z.string().trim().max(255).nullable().optional(),
  file_size_bytes: z.number().int().min(0).nullable().optional(),
})

export const updateEmployeeDocumentSchema = z.object({
  document_type: documentTypeEnum.optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  file_url: z.string().url().nullable().optional(),
  file_name: z.string().trim().max(255).nullable().optional(),
  file_size_bytes: z.number().int().min(0).nullable().optional(),
})

// ── Departments ───────────────────────────────────────────────────────────

export const listDepartmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  is_active: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  head_user_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  head_user_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
})

// ── Positions ─────────────────────────────────────────────────────────────

export const listPositionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  department_id: z.string().uuid().optional(),
  is_active: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPositionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  pay_grade: z.string().trim().max(50).nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

export const updatePositionSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  pay_grade: z.string().trim().max(50).nullable().optional(),
  is_active: z.boolean().optional(),
})
