/**
 * Module 10: Vendor Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const insuranceTypeEnum = z.enum([
  'general_liability', 'workers_comp', 'auto', 'umbrella', 'professional',
])

export const insuranceStatusEnum = z.enum([
  'active', 'expiring_soon', 'expired', 'not_on_file',
])

export const complianceRequirementTypeEnum = z.enum([
  'license', 'bond', 'w9', 'insurance', 'safety_cert', 'prequalification',
])

export const complianceStatusEnum = z.enum([
  'compliant', 'non_compliant', 'pending', 'waived', 'expired',
])

export const ratingCategoryEnum = z.enum([
  'quality', 'schedule', 'communication', 'safety', 'value',
])

// ── Vendor Contacts ──────────────────────────────────────────────────────

export const createVendorContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().trim().max(30).optional(),
  is_primary: z.boolean().default(false),
})

export const updateVendorContactSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().max(200).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  is_primary: z.boolean().optional(),
})

export const listVendorContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ── Vendor Insurance ─────────────────────────────────────────────────────

export const createVendorInsuranceSchema = z.object({
  insurance_type: insuranceTypeEnum,
  carrier_name: z.string().trim().min(1).max(255),
  policy_number: z.string().trim().min(1).max(100),
  coverage_amount: z.number().positive().max(999999999999999).optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  certificate_document_id: z.string().uuid().optional(),
  status: insuranceStatusEnum.default('active'),
})

export const updateVendorInsuranceSchema = z.object({
  insurance_type: insuranceTypeEnum.optional(),
  carrier_name: z.string().trim().min(1).max(255).optional(),
  policy_number: z.string().trim().min(1).max(100).optional(),
  coverage_amount: z.number().positive().max(999999999999999).nullable().optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  certificate_document_id: z.string().uuid().nullable().optional(),
  status: insuranceStatusEnum.optional(),
  verified_at: z.string().datetime().nullable().optional(),
  verified_by: z.string().uuid().nullable().optional(),
})

export const listVendorInsuranceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: insuranceStatusEnum.optional(),
  insurance_type: insuranceTypeEnum.optional(),
})

// ── Vendor Compliance ────────────────────────────────────────────────────

export const createVendorComplianceSchema = z.object({
  requirement_type: complianceRequirementTypeEnum,
  requirement_name: z.string().trim().min(1).max(255),
  status: complianceStatusEnum.default('pending'),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  document_id: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const updateVendorComplianceSchema = z.object({
  requirement_type: complianceRequirementTypeEnum.optional(),
  requirement_name: z.string().trim().min(1).max(255).optional(),
  status: complianceStatusEnum.optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})

export const listVendorComplianceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: complianceStatusEnum.optional(),
  requirement_type: complianceRequirementTypeEnum.optional(),
})

// ── Vendor Ratings ───────────────────────────────────────────────────────

export const createVendorRatingSchema = z.object({
  job_id: z.string().uuid().optional(),
  category: ratingCategoryEnum,
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().max(2000).optional(),
})

export const listVendorRatingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: ratingCategoryEnum.optional(),
  job_id: z.string().uuid().optional(),
})
