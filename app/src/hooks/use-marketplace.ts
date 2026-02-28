'use client'

/**
 * Module 45: API & Marketplace React Query Hooks
 *
 * Covers API keys, webhook subscriptions, integration listings, installs, and webhook deliveries.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  ApiKey,
  WebhookSubscription,
  WebhookDelivery,
  IntegrationListing,
  IntegrationInstall,
} from '@/types/api-marketplace'

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

// ── API Keys ─────────────────────────────────────────────────────────────────

type ApiKeyListParams = {
  page?: number
  limit?: number
  status?: string
  q?: string
}

type ApiKeyCreateInput = {
  name: string
  permissions?: string[]
  rate_limit_per_minute?: number
  expires_at?: string | null
}

const apiKeyHooks = createApiHooks<ApiKeyListParams, ApiKeyCreateInput>(
  'api-keys',
  '/api/v2/api-keys'
)

export const useApiKeys = apiKeyHooks.useList
export const useApiKey = apiKeyHooks.useDetail
export const useCreateApiKey = apiKeyHooks.useCreate
export const useUpdateApiKey = apiKeyHooks.useUpdate
export const useDeleteApiKey = apiKeyHooks.useDelete

// ── Webhook Subscriptions ────────────────────────────────────────────────────

type WebhookListParams = {
  page?: number
  limit?: number
  status?: string
  q?: string
}

type WebhookCreateInput = {
  url: string
  events: string[]
  description?: string | null
  status?: string
  max_retries?: number
}

const webhookHooks = createApiHooks<WebhookListParams, WebhookCreateInput>(
  'webhooks',
  '/api/v2/webhooks'
)

export const useWebhooks = webhookHooks.useList
export const useWebhook = webhookHooks.useDetail
export const useCreateWebhook = webhookHooks.useCreate
export const useUpdateWebhook = webhookHooks.useUpdate
export const useDeleteWebhook = webhookHooks.useDelete

// ── Marketplace Templates (integration listings) ─────────────────────────────

type ListingListParams = {
  page?: number
  limit?: number
  category?: string
  pricing_type?: string
  status?: string
  is_featured?: boolean
  q?: string
}

type ListingCreateInput = {
  name: string
  slug: string
  category: string
  description?: string | null
  long_description?: string | null
  logo_url?: string | null
  developer_name?: string | null
  developer_url?: string | null
  documentation_url?: string | null
  support_url?: string | null
  pricing_type?: string
  price_monthly?: number
  required_plan_tier?: string | null
}

const listingHooks = createApiHooks<ListingListParams, ListingCreateInput>(
  'marketplace-templates',
  '/api/v2/marketplace/templates'
)

export const useMarketplaceTemplates = listingHooks.useList
export const useMarketplaceTemplate = listingHooks.useDetail
export const useCreateMarketplaceTemplate = listingHooks.useCreate
export const useUpdateMarketplaceTemplate = listingHooks.useUpdate
export const useDeleteMarketplaceTemplate = listingHooks.useDelete

// ── Marketplace Installs ─────────────────────────────────────────────────────

type InstallListParams = {
  page?: number
  limit?: number
  status?: string
  listing_id?: string
}

export function useMarketplaceInstalls(params?: InstallListParams) {
  return useQuery<{ data: IntegrationInstall[]; total: number }>({
    queryKey: ['marketplace-installs', params],
    queryFn: () =>
      fetchJson(`/api/v2/marketplace/installs${buildQs(params)}`),
  })
}

export function useCreateMarketplaceInstall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/marketplace/installs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace-installs'] })
    },
  })
}

export function useUpdateMarketplaceInstall(installId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketplace/installs/${installId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace-installs'] })
    },
  })
}

// ── Marketplace Reviews ──────────────────────────────────────────────────────

export function useMarketplaceReviews(params?: { page?: number; limit?: number; template_id?: string }) {
  return useQuery<{ data: unknown[]; total: number }>({
    queryKey: ['marketplace-reviews', params],
    queryFn: () =>
      fetchJson(`/api/v2/marketplace/reviews${buildQs(params)}`),
  })
}

export function useCreateMarketplaceReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/marketplace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace-reviews'] })
    },
  })
}

// ── Marketplace Publishers ───────────────────────────────────────────────────

export function useMarketplacePublishers(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery<{ data: unknown[]; total: number }>({
    queryKey: ['marketplace-publishers', params],
    queryFn: () =>
      fetchJson(`/api/v2/marketplace/publishers${buildQs(params)}`),
  })
}

export function useCreateMarketplacePublisher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/marketplace/publishers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace-publishers'] })
    },
  })
}

export function useUpdateMarketplacePublisher(publisherId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketplace/publishers/${publisherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace-publishers'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { ApiKey, WebhookSubscription, WebhookDelivery, IntegrationListing, IntegrationInstall }
