/**
 * Vendor Insurance (flat route) Validation Schemas
 */

import { z } from 'zod'

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Vendor Insurance ────────────────────────────────────────────────────────

export const listVendorInsuranceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  status: z.string().trim().max(50).optional(),
  insurance_type: z.string().trim().max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createVendorInsuranceSchema = z.object({
  vendor_id: z.string().uuid(),
  insurance_type: z.string().trim().min(1).max(100),
  carrier_name: z.string().trim().min(1).max(255),
  policy_number: z.string().trim().min(1).max(100),
  expiration_date: dateString,
  coverage_amount: z.number().min(0).nullable().optional(),
  status: z.string().trim().max(50).optional().default('active'),
  certificate_document_id: z.string().uuid().nullable().optional(),
})

export const updateVendorInsuranceSchema = z.object({
  insurance_type: z.string().trim().min(1).max(100).optional(),
  carrier_name: z.string().trim().min(1).max(255).optional(),
  policy_number: z.string().trim().min(1).max(100).optional(),
  expiration_date: dateString.optional(),
  coverage_amount: z.number().min(0).nullable().optional(),
  status: z.string().trim().max(50).optional(),
  certificate_document_id: z.string().uuid().nullable().optional(),
})
