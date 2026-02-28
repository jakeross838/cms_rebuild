'use client'

/**
 * Module 48: Template Marketplace React Query Hooks
 *
 * Covers marketplace publishers, templates, template versions, installs, and reviews.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  MarketplacePublisher,
  MarketplaceTemplate,
  MarketplaceTemplateVersion,
  MarketplaceInstall,
  MarketplaceReview,
} from '@/types/template-marketplace'

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

// ── Template Marketplace Publishers ──────────────────────────────────────────

type PublisherListParams = {
  page?: number
  limit?: number
  publisher_type?: string
  is_verified?: boolean
  q?: string
}

type PublisherCreateInput = {
  display_name: string
  publisher_type: string
  bio?: string | null
  credentials?: string | null
  website_url?: string | null
  profile_image?: string | null
}

const publisherHooks = createApiHooks<PublisherListParams, PublisherCreateInput>(
  'template-publishers',
  '/api/v2/marketplace/publishers'
)

export const useTemplatePublishers = publisherHooks.useList
export const useTemplatePublisher = publisherHooks.useDetail
export const useCreateTemplatePublisher = publisherHooks.useCreate
export const useUpdateTemplatePublisher = publisherHooks.useUpdate
export const useDeleteTemplatePublisher = publisherHooks.useDelete

// ── Marketplace Templates ────────────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  template_type?: string
  publisher_id?: string
  review_status?: string
  is_featured?: boolean
  q?: string
}

type TemplateCreateInput = {
  name: string
  slug: string
  template_type: string
  publisher_id: string
  description?: string | null
  long_description?: string | null
  tags?: string[]
  region_tags?: string[]
  construction_tags?: string[]
  price?: number | null
  currency?: string
  template_data?: Record<string, unknown>
  required_modules?: string[]
  version?: string
  is_system?: boolean
  is_featured?: boolean
  is_active?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'shared-templates',
  '/api/v2/marketplace/templates'
)

export const useSharedTemplates = templateHooks.useList
export const useSharedTemplate = templateHooks.useDetail
export const useCreateSharedTemplate = templateHooks.useCreate
export const useUpdateSharedTemplate = templateHooks.useUpdate
export const useDeleteSharedTemplate = templateHooks.useDelete

// ── Template Versions ────────────────────────────────────────────────────────

export function useTemplateVersions(templateId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: MarketplaceTemplateVersion[]; total: number }>({
    queryKey: ['template-versions', templateId, params],
    queryFn: () =>
      fetchJson(`/api/v2/marketplace/templates/${templateId}/versions${buildQs(params)}`),
    enabled: !!templateId,
  })
}

export function useCreateTemplateVersion(templateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketplace/templates/${templateId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['template-versions', templateId] })
      qc.invalidateQueries({ queryKey: ['shared-templates'] })
    },
  })
}

// ── Template Installs ────────────────────────────────────────────────────────

type InstallListParams = {
  page?: number
  limit?: number
  template_id?: string
}

export function useTemplateInstalls(params?: InstallListParams) {
  return useQuery<{ data: MarketplaceInstall[]; total: number }>({
    queryKey: ['template-installs', params],
    queryFn: () =>
      fetchJson(`/api/v2/marketplace/installs${buildQs(params)}`),
  })
}

export function useCreateTemplateInstall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/marketplace/installs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['template-installs'] })
      qc.invalidateQueries({ queryKey: ['shared-templates'] })
    },
  })
}

export function useUpdateTemplateInstall(installId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketplace/installs/${installId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['template-installs'] })
    },
  })
}

// ── Template Reviews ─────────────────────────────────────────────────────────

type ReviewListParams = {
  page?: number
  limit?: number
  template_id?: string
  rating?: number
}

export function useTemplateReviews(params?: ReviewListParams) {
  return useQuery<{ data: MarketplaceReview[]; total: number }>({
    queryKey: ['template-reviews', params],
    queryFn: () =>
      fetchJson(`/api/v2/marketplace/reviews${buildQs(params)}`),
  })
}

export function useCreateTemplateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/marketplace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['template-reviews'] })
      qc.invalidateQueries({ queryKey: ['shared-templates'] })
    },
  })
}

export function useUpdateTemplateReview(reviewId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketplace/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['template-reviews'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { MarketplacePublisher, MarketplaceTemplate, MarketplaceTemplateVersion, MarketplaceInstall, MarketplaceReview }
