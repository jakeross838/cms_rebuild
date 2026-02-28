'use client'

/**
 * Module 44: White-Label & Branding React Query Hooks
 *
 * Covers builder branding, custom domains, email config, terminology, and content pages.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  BuilderBranding,
  BuilderCustomDomain,
  BuilderEmailConfig,
  BuilderTerminology,
  BuilderContentPage,
} from '@/types/white-label'

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

// ── Builder Branding (singleton per company) ─────────────────────────────────

export function useBranding() {
  return useQuery<BuilderBranding>({
    queryKey: ['branding'],
    queryFn: () => fetchJson('/api/v2/branding'),
  })
}

export function useUpdateBranding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branding'] })
    },
  })
}

// ── Custom Domains ───────────────────────────────────────────────────────────

type DomainListParams = {
  page?: number
  limit?: number
  status?: string
  q?: string
}

type DomainCreateInput = {
  domain: string
  subdomain?: string | null
  is_primary?: boolean
}

const domainHooks = createApiHooks<DomainListParams, DomainCreateInput>(
  'custom-domains',
  '/api/v2/branding/domains'
)

export const useCustomDomains = domainHooks.useList
export const useCustomDomain = domainHooks.useDetail
export const useCreateCustomDomain = domainHooks.useCreate
export const useUpdateCustomDomain = domainHooks.useUpdate
export const useDeleteCustomDomain = domainHooks.useDelete

// ── Email Config (singleton per company) ─────────────────────────────────────

export function useEmailConfig() {
  return useQuery<BuilderEmailConfig>({
    queryKey: ['email-config'],
    queryFn: () => fetchJson('/api/v2/branding/email'),
  })
}

export function useUpdateEmailConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/branding/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-config'] })
    },
  })
}

// ── Terminology ──────────────────────────────────────────────────────────────

type TermListParams = {
  page?: number
  limit?: number
  context?: string
  is_active?: boolean
  q?: string
}

type TermCreateInput = {
  default_term: string
  custom_term: string
  context: string
  is_active?: boolean
}

const termHooks = createApiHooks<TermListParams, TermCreateInput>(
  'terminology',
  '/api/v2/branding/terminology'
)

export const useTerminology = termHooks.useList
export const useTerminologyItem = termHooks.useDetail
export const useCreateTerminology = termHooks.useCreate
export const useUpdateTerminology = termHooks.useUpdate
export const useDeleteTerminology = termHooks.useDelete

// ── Content Pages ────────────────────────────────────────────────────────────

type PageListParams = {
  page?: number
  limit?: number
  page_type?: string
  is_published?: boolean
  q?: string
}

type PageCreateInput = {
  title: string
  page_type: string
  slug: string
  content_html?: string | null
  is_published?: boolean
  sort_order?: number
}

const pageHooks = createApiHooks<PageListParams, PageCreateInput>(
  'content-pages',
  '/api/v2/branding/pages'
)

export const useContentPages = pageHooks.useList
export const useContentPage = pageHooks.useDetail
export const useCreateContentPage = pageHooks.useCreate
export const useUpdateContentPage = pageHooks.useUpdate
export const useDeleteContentPage = pageHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { BuilderBranding, BuilderCustomDomain, BuilderEmailConfig, BuilderTerminology, BuilderContentPage }
