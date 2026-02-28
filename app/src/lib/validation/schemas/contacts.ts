/**
 * Vendor Contacts (flat route) Validation Schemas
 */

import { z } from 'zod'

// ── Vendor Contacts ─────────────────────────────────────────────────────────

export const listContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createContactSchema = z.object({
  vendor_id: z.string().uuid(),
  name: z.string().trim().min(1).max(255),
  title: z.string().trim().max(255).nullable().optional(),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  is_primary: z.boolean().nullable().optional(),
})

export const updateContactSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  title: z.string().trim().max(255).nullable().optional(),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  is_primary: z.boolean().nullable().optional(),
})
