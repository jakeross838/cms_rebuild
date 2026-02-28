'use client'

/**
 * Module 16: QuickBooks & Accounting Integration React Query Hooks
 *
 * Covers: connections, sync, mappings, sync logs, conflicts, listings, installs.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  AccountingConnection,
  SyncMapping,
  SyncLog,
  SyncConflict,
} from '@/types/integrations'

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Connections ─────────────────────────────────────────────────────────────

type ConnectionListParams = {
  page?: number
  limit?: number
  provider?: string
  status?: string
  q?: string
}

type ConnectionCreateInput = {
  provider: string
  sync_direction?: string
  settings?: Record<string, unknown>
}

const connectionHooks = createApiHooks<ConnectionListParams, ConnectionCreateInput>(
  'integration-connections',
  '/api/v2/integrations/connections'
)

export const useIntegrationConnections = connectionHooks.useList
export const useIntegrationConnection = connectionHooks.useDetail
export const useCreateIntegrationConnection = connectionHooks.useCreate
export const useUpdateIntegrationConnection = connectionHooks.useUpdate
export const useDeleteIntegrationConnection = connectionHooks.useDelete

// ── Trigger Sync ────────────────────────────────────────────────────────────

/** Trigger a sync for a connection */
export function useTriggerSync(connectionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { sync_type?: string; direction?: string }) =>
      fetchJson(`/api/v2/integrations/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-connections'] })
      qc.invalidateQueries({ queryKey: ['integration-connections', connectionId] })
      qc.invalidateQueries({ queryKey: ['sync-logs'] })
    },
  })
}

// ── Sync Mappings ───────────────────────────────────────────────────────────

type MappingListParams = {
  page?: number
  limit?: number
  connection_id?: string
  entity_type?: string
  sync_status?: string
  q?: string
}

type MappingCreateInput = {
  connection_id: string
  entity_type: string
  internal_id: string
  external_id: string
  external_name?: string | null
}

const mappingHooks = createApiHooks<MappingListParams, MappingCreateInput>(
  'sync-mappings',
  '/api/v2/integrations/mappings'
)

export const useSyncMappings = mappingHooks.useList
export const useSyncMapping = mappingHooks.useDetail
export const useCreateSyncMapping = mappingHooks.useCreate
export const useUpdateSyncMapping = mappingHooks.useUpdate
export const useDeleteSyncMapping = mappingHooks.useDelete

// ── Sync Logs ───────────────────────────────────────────────────────────────

type SyncLogListParams = {
  page?: number
  limit?: number
  connection_id?: string
  status?: string
  sync_type?: string
  direction?: string
}

/** List sync log entries */
export function useSyncLogs(params?: SyncLogListParams) {
  return useQuery<{ data: SyncLog[]; total: number }>({
    queryKey: ['sync-logs', params],
    queryFn: () => fetchJson(`/api/v2/integrations/sync-logs${buildQs(params)}`),
  })
}

// ── Sync Conflicts ──────────────────────────────────────────────────────────

type ConflictListParams = {
  page?: number
  limit?: number
  connection_id?: string
  entity_type?: string
  resolution?: string
}

/** List sync conflicts */
export function useSyncConflicts(params?: ConflictListParams) {
  return useQuery<{ data: SyncConflict[]; total: number }>({
    queryKey: ['sync-conflicts', params],
    queryFn: () => fetchJson(`/api/v2/integrations/conflicts${buildQs(params)}`),
  })
}

/** Resolve a sync conflict */
export function useResolveSyncConflict(conflictId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { resolution: string; notes?: string }) =>
      fetchJson(`/api/v2/integrations/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-conflicts'] })
    },
  })
}

// ── Integration Listings (Marketplace) ──────────────────────────────────────

type ListingListParams = {
  page?: number
  limit?: number
  category?: string
  q?: string
}

/** List available integration listings from the marketplace */
export function useIntegrationListings(params?: ListingListParams) {
  return useQuery({
    queryKey: ['integration-listings', params],
    queryFn: () => fetchJson(`/api/v2/integrations/listings${buildQs(params)}`),
  })
}

/** Get a single integration listing by slug */
export function useIntegrationListing(slug: string | null) {
  return useQuery({
    queryKey: ['integration-listings', slug],
    queryFn: () => fetchJson(`/api/v2/integrations/listings/${slug}`),
    enabled: !!slug,
  })
}

// ── Integration Installs ────────────────────────────────────────────────────

type InstallListParams = {
  page?: number
  limit?: number
  status?: string
}

/** List installed integrations */
export function useIntegrationInstalls(params?: InstallListParams) {
  return useQuery({
    queryKey: ['integration-installs', params],
    queryFn: () => fetchJson(`/api/v2/integrations/installs${buildQs(params)}`),
  })
}

/** Install an integration */
export function useInstallIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { integration_slug: string; config?: Record<string, unknown> }) =>
      fetchJson('/api/v2/integrations/installs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-installs'] })
    },
  })
}

/** Uninstall an integration */
export function useUninstallIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (installId: string) =>
      fetchJson(`/api/v2/integrations/installs/${installId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-installs'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  AccountingConnection,
  SyncMapping,
  SyncLog,
  SyncConflict,
}
