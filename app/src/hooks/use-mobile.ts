'use client'

/**
 * Module 40: Mobile App React Query Hooks
 *
 * Covers mobile devices, push notification tokens, offline sync queue, app settings, and sessions.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import type {
  MobileDevice,
  PushNotificationToken,
  OfflineSyncQueueItem,
  MobileAppSettings,
  MobileSession,
} from '@/types/mobile-app'

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

// ── Push Notification Tokens ─────────────────────────────────────────────────

type PushTokenListParams = {
  page?: number
  limit?: number
  provider?: string
  is_active?: boolean
}

export function usePushTokens(params?: PushTokenListParams) {
  return useQuery<{ data: PushNotificationToken[]; total: number }>({
    queryKey: ['push-tokens', params],
    queryFn: () =>
      fetchJson(`/api/v2/mobile/push-tokens${buildQs(params)}`),
  })
}

export function useCreatePushToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/mobile/push-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-tokens'] })
    },
  })
}

export function useUpdatePushToken(tokenId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/mobile/push-tokens/${tokenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-tokens'] })
    },
  })
}

export function useDeletePushToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tokenId: string) =>
      fetchJson(`/api/v2/mobile/push-tokens/${tokenId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-tokens'] })
    },
  })
}

// ── Offline Sync Queue ───────────────────────────────────────────────────────

type SyncQueueListParams = {
  page?: number
  limit?: number
  status?: string
  entity_type?: string
}

export function useSyncQueue(params?: SyncQueueListParams) {
  return useQuery<{ data: OfflineSyncQueueItem[]; total: number }>({
    queryKey: ['sync-queue', params],
    queryFn: () =>
      fetchJson(`/api/v2/mobile/sync-queue${buildQs(params)}`),
  })
}

export function useCreateSyncQueueItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/mobile/sync-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-queue'] })
    },
  })
}

export function useUpdateSyncQueueItem(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/mobile/sync-queue/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-queue'] })
    },
  })
}

export function useDeleteSyncQueueItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson(`/api/v2/mobile/sync-queue/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-queue'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { MobileDevice, PushNotificationToken, OfflineSyncQueueItem, MobileAppSettings, MobileSession }
