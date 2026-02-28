'use client'

/**
 * Module 46: Customer Support React Query Hooks
 *
 * Covers support tickets, ticket messages, knowledge base articles, feature requests, and votes.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  SupportTicket,
  TicketMessage,
  KbArticle,
  FeatureRequest,
  FeatureRequestVote,
} from '@/types/customer-support'

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

// ── Support Tickets ──────────────────────────────────────────────────────────

type TicketListParams = {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  channel?: string
  assigned_agent_id?: string
  q?: string
}

type TicketCreateInput = {
  subject: string
  category?: string | null
  channel?: string
  description?: string | null
  status?: string
  priority?: string
  assigned_agent_id?: string | null
  tags?: string[]
}

const ticketHooks = createApiHooks<TicketListParams, TicketCreateInput>(
  'support-tickets',
  '/api/v2/support/tickets'
)

export const useSupportTickets = ticketHooks.useList
export const useSupportTicket = ticketHooks.useDetail
export const useCreateSupportTicket = ticketHooks.useCreate
export const useUpdateSupportTicket = ticketHooks.useUpdate
export const useDeleteSupportTicket = ticketHooks.useDelete

// ── Ticket Messages ──────────────────────────────────────────────────────────

export function useTicketMessages(ticketId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: TicketMessage[]; total: number }>({
    queryKey: ['ticket-messages', ticketId, params],
    queryFn: () =>
      fetchJson(`/api/v2/support/tickets/${ticketId}/messages${buildQs(params)}`),
    enabled: !!ticketId,
  })
}

export function useCreateTicketMessage(ticketId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
      qc.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export function useUpdateTicketMessage(ticketId: string, messageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/support/tickets/${ticketId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
      qc.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

// ── Knowledge Base Articles ──────────────────────────────────────────────────

type ArticleListParams = {
  page?: number
  limit?: number
  status?: string
  category?: string
  q?: string
}

type ArticleCreateInput = {
  title: string
  slug: string
  category?: string | null
  content?: string | null
  tags?: string[]
  status?: string
}

const articleHooks = createApiHooks<ArticleListParams, ArticleCreateInput>(
  'kb-articles',
  '/api/v2/support/kb-articles'
)

export const useKbArticles = articleHooks.useList
export const useKbArticle = articleHooks.useDetail
export const useCreateKbArticle = articleHooks.useCreate
export const useUpdateKbArticle = articleHooks.useUpdate
export const useDeleteKbArticle = articleHooks.useDelete

// ── Feature Requests ─────────────────────────────────────────────────────────

type FeatureRequestListParams = {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  q?: string
}

type FeatureRequestCreateInput = {
  title: string
  description?: string | null
  status?: string
  priority?: string
  category?: string
}

const featureRequestHooks = createApiHooks<FeatureRequestListParams, FeatureRequestCreateInput>(
  'feature-requests',
  '/api/v2/support/feature-requests'
)

export const useFeatureRequests = featureRequestHooks.useList
export const useFeatureRequest = featureRequestHooks.useDetail
export const useCreateFeatureRequest = featureRequestHooks.useCreate
export const useUpdateFeatureRequest = featureRequestHooks.useUpdate
export const useDeleteFeatureRequest = featureRequestHooks.useDelete

// ── Feature Request Votes ────────────────────────────────────────────────────

export function useCreateFeatureRequestVote(featureRequestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/support/feature-requests/${featureRequestId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feature-requests'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { SupportTicket, TicketMessage, KbArticle, FeatureRequest, FeatureRequestVote }
