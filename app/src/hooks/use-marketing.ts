'use client'

/**
 * Module 37: Marketing & Portfolio React Query Hooks
 *
 * Covers portfolio projects, portfolio photos, client reviews, campaigns, and campaign contacts.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  PortfolioProject,
  PortfolioPhoto,
  ClientReview,
  MarketingCampaign,
  CampaignContact,
} from '@/types/marketing'

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

// ── Portfolio Projects ───────────────────────────────────────────────────────

type PortfolioListParams = {
  page?: number
  limit?: number
  status?: string
  category?: string
  is_featured?: boolean
  q?: string
}

type PortfolioCreateInput = {
  title: string
  status?: string
  job_id?: string | null
  description?: string | null
  category?: string | null
  style?: string | null
  is_featured?: boolean
  cover_photo_url?: string | null
  square_footage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  build_duration_days?: number | null
  completion_date?: string | null
  location?: string | null
}

const portfolioHooks = createApiHooks<PortfolioListParams, PortfolioCreateInput>(
  'portfolio-projects',
  '/api/v2/marketing/portfolio'
)

export const usePortfolioProjects = portfolioHooks.useList
export const usePortfolioProject = portfolioHooks.useDetail
export const useCreatePortfolioProject = portfolioHooks.useCreate
export const useUpdatePortfolioProject = portfolioHooks.useUpdate
export const useDeletePortfolioProject = portfolioHooks.useDelete

// ── Portfolio Photos ─────────────────────────────────────────────────────────

export function usePortfolioPhotos(projectId: string | null, params?: { page?: number; limit?: number; photo_type?: string }) {
  return useQuery<{ data: PortfolioPhoto[]; total: number }>({
    queryKey: ['portfolio-photos', projectId, params],
    queryFn: () =>
      fetchJson(`/api/v2/marketing/portfolio/${projectId}/photos${buildQs(params)}`),
    enabled: !!projectId,
  })
}

export function useCreatePortfolioPhoto(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketing/portfolio/${projectId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-photos', projectId] })
      qc.invalidateQueries({ queryKey: ['portfolio-projects'] })
    },
  })
}

// ── Client Reviews ───────────────────────────────────────────────────────────

type ReviewListParams = {
  page?: number
  limit?: number
  status?: string
  source?: string
  is_featured?: boolean
  q?: string
}

type ReviewCreateInput = {
  client_name: string
  rating: number
  source: string
  job_id?: string | null
  client_email?: string | null
  review_text?: string | null
  status?: string
  display_name?: string | null
  is_featured?: boolean
}

const reviewHooks = createApiHooks<ReviewListParams, ReviewCreateInput>(
  'client-reviews',
  '/api/v2/marketing/reviews'
)

export const useClientReviews = reviewHooks.useList
export const useClientReview = reviewHooks.useDetail
export const useCreateClientReview = reviewHooks.useCreate
export const useUpdateClientReview = reviewHooks.useUpdate
export const useDeleteClientReview = reviewHooks.useDelete

// ── Marketing Campaigns ──────────────────────────────────────────────────────

type CampaignListParams = {
  page?: number
  limit?: number
  status?: string
  campaign_type?: string
  q?: string
}

type CampaignCreateInput = {
  name: string
  campaign_type: string
  status?: string
  description?: string | null
  channel?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number
  target_audience?: string | null
  notes?: string | null
}

const campaignHooks = createApiHooks<CampaignListParams, CampaignCreateInput>(
  'marketing-campaigns',
  '/api/v2/marketing/campaigns'
)

export const useMarketingCampaigns = campaignHooks.useList
export const useMarketingCampaign = campaignHooks.useDetail
export const useCreateMarketingCampaign = campaignHooks.useCreate
export const useUpdateMarketingCampaign = campaignHooks.useUpdate
export const useDeleteMarketingCampaign = campaignHooks.useDelete

// ── Campaign Contacts ────────────────────────────────────────────────────────

export function useCampaignContacts(campaignId: string | null, params?: { page?: number; limit?: number; status?: string }) {
  return useQuery<{ data: CampaignContact[]; total: number }>({
    queryKey: ['campaign-contacts', campaignId, params],
    queryFn: () =>
      fetchJson(`/api/v2/marketing/campaigns/${campaignId}/contacts${buildQs(params)}`),
    enabled: !!campaignId,
  })
}

export function useCreateCampaignContact(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketing/campaigns/${campaignId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-contacts', campaignId] })
      qc.invalidateQueries({ queryKey: ['marketing-campaigns'] })
    },
  })
}

export function useUpdateCampaignContact(campaignId: string, contactId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/marketing/campaigns/${campaignId}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-contacts', campaignId] })
      qc.invalidateQueries({ queryKey: ['marketing-campaigns'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { PortfolioProject, PortfolioPhoto, ClientReview, MarketingCampaign, CampaignContact }
