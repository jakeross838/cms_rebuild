/**
 * Module 16: QuickBooks & Accounting Integration Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const accountingProviderEnum = z.enum(['quickbooks_online', 'xero', 'sage'])

export const connectionStatusEnum = z.enum(['disconnected', 'connected', 'syncing', 'error'])

export const syncDirectionEnum = z.enum(['push', 'pull', 'bidirectional'])

export const syncEntityTypeEnum = z.enum(['vendor', 'client', 'account', 'bill', 'invoice', 'payment'])

export const syncStatusEnum = z.enum(['synced', 'pending', 'error', 'conflict'])

export const syncLogStatusEnum = z.enum(['started', 'completed', 'partial', 'failed'])

export const syncLogTypeEnum = z.enum(['full', 'incremental', 'manual'])

export const syncLogDirectionEnum = z.enum(['push', 'pull'])

export const conflictResolutionEnum = z.enum(['pending', 'use_internal', 'use_external', 'manual', 'skipped'])

// ── Accounting Connections ───────────────────────────────────────────────

export const listConnectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  provider: accountingProviderEnum.optional(),
  status: connectionStatusEnum.optional(),
})

export const createConnectionSchema = z.object({
  provider: accountingProviderEnum,
  external_company_id: z.string().trim().min(1).max(100).optional(),
  external_company_name: z.string().trim().min(1).max(200).optional(),
  sync_direction: syncDirectionEnum.optional().default('bidirectional'),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export const updateConnectionSchema = z.object({
  status: connectionStatusEnum.optional(),
  external_company_id: z.string().trim().min(1).max(100).optional(),
  external_company_name: z.string().trim().min(1).max(200).optional(),
  sync_direction: syncDirectionEnum.optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

// ── Sync Mappings ────────────────────────────────────────────────────────

export const listMappingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  connection_id: z.string().uuid().optional(),
  entity_type: syncEntityTypeEnum.optional(),
  sync_status: syncStatusEnum.optional(),
})

export const createMappingSchema = z.object({
  connection_id: z.string().uuid(),
  entity_type: syncEntityTypeEnum,
  internal_id: z.string().uuid(),
  external_id: z.string().trim().min(1).max(200),
  external_name: z.string().trim().min(1).max(500).optional(),
})

export const updateMappingSchema = z.object({
  external_id: z.string().trim().min(1).max(200).optional(),
  external_name: z.string().trim().min(1).max(500).optional(),
  sync_status: syncStatusEnum.optional(),
  error_message: z.string().trim().max(2000).nullable().optional(),
})

// ── Sync Logs ────────────────────────────────────────────────────────────

export const listSyncLogsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  connection_id: z.string().uuid().optional(),
  sync_type: syncLogTypeEnum.optional(),
  direction: syncLogDirectionEnum.optional(),
  status: syncLogStatusEnum.optional(),
})

// ── Trigger Sync ─────────────────────────────────────────────────────────

export const triggerSyncSchema = z.object({
  sync_type: syncLogTypeEnum.optional().default('manual'),
  direction: syncLogDirectionEnum.optional().default('push'),
  entity_types: z.array(syncEntityTypeEnum).optional(),
})

// ── Sync Conflicts ───────────────────────────────────────────────────────

export const listConflictsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  connection_id: z.string().uuid().optional(),
  entity_type: z.string().trim().min(1).max(50).optional(),
  resolution: conflictResolutionEnum.optional(),
})

export const resolveConflictSchema = z.object({
  resolution: z.enum(['use_internal', 'use_external', 'manual', 'skipped']),
})
