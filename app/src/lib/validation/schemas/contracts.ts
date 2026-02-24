/**
 * Module 38: Contracts & E-Signature Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const contractStatusEnum = z.enum([
  'draft', 'pending_review', 'sent_for_signature', 'partially_signed',
  'fully_signed', 'active', 'expired', 'terminated', 'voided',
])

export const contractTypeEnum = z.enum([
  'prime', 'subcontract', 'purchase_order', 'service_agreement',
  'change_order', 'amendment', 'nda', 'other',
])

export const signerStatusEnum = z.enum([
  'pending', 'viewed', 'signed', 'declined', 'expired',
])

export const signerRoleEnum = z.enum([
  'owner', 'client', 'subcontractor', 'architect', 'engineer', 'other',
])

// ── Contracts ─────────────────────────────────────────────────────────────

export const listContractsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: contractStatusEnum.optional(),
  contract_type: contractTypeEnum.optional(),
  vendor_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createContractSchema = z.object({
  contract_number: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  contract_type: contractTypeEnum.optional().default('prime'),
  status: contractStatusEnum.optional().default('draft'),
  template_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  client_id: z.string().uuid().nullable().optional(),
  contract_value: z.number().min(0).max(9999999999999.99).optional().default(0),
  retention_pct: z.number().min(0).max(99.99).optional().default(0),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  content: z.string().max(500000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateContractSchema = z.object({
  contract_number: z.string().trim().min(1).max(50).optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  contract_type: contractTypeEnum.optional(),
  status: contractStatusEnum.optional(),
  template_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  client_id: z.string().uuid().nullable().optional(),
  contract_value: z.number().min(0).max(9999999999999.99).optional(),
  retention_pct: z.number().min(0).max(99.99).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  content: z.string().max(500000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const sendForSignatureSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Contract Versions ─────────────────────────────────────────────────────

export const listContractVersionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createContractVersionSchema = z.object({
  version_number: z.number().int().positive(),
  change_summary: z.string().trim().max(5000).nullable().optional(),
  content: z.string().max(500000).nullable().optional(),
  snapshot_json: z.record(z.string(), z.unknown()).optional().default({}),
})

// ── Contract Signers ──────────────────────────────────────────────────────

export const listContractSignersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createContractSignerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(255),
  role: signerRoleEnum.optional().default('other'),
  sign_order: z.number().int().min(0).optional().default(0),
})

export const updateContractSignerSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().email().max(255).optional(),
  role: signerRoleEnum.optional(),
  sign_order: z.number().int().min(0).optional(),
})

export const signContractSchema = z.object({
  ip_address: z.string().max(45).nullable().optional(),
  user_agent: z.string().max(500).nullable().optional(),
})

export const declineContractSchema = z.object({
  decline_reason: z.string().trim().max(2000).nullable().optional(),
})

// ── Contract Templates ────────────────────────────────────────────────────

export const listContractTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  contract_type: contractTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createContractTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  contract_type: contractTypeEnum.optional().default('prime'),
  content: z.string().max(500000).nullable().optional(),
  clauses: z.array(z.unknown()).optional().default([]),
  variables: z.array(z.unknown()).optional().default([]),
  is_active: z.boolean().optional().default(true),
})

export const updateContractTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  contract_type: contractTypeEnum.optional(),
  content: z.string().max(500000).nullable().optional(),
  clauses: z.array(z.unknown()).optional(),
  variables: z.array(z.unknown()).optional(),
  is_active: z.boolean().optional(),
})

// ── Contract Clauses ──────────────────────────────────────────────────────

export const listContractClausesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  category: z.string().trim().max(100).optional(),
  is_required: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createContractClauseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  content: z.string().trim().min(1).max(500000),
  is_required: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateContractClauseSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  content: z.string().trim().min(1).max(500000).optional(),
  is_required: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})
