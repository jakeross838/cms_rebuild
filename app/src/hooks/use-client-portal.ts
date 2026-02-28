'use client'

/**
 * Module 12 / 29: Client Portal React Query Hooks
 *
 * Covers: messages, approvals, invitations, payments, settings,
 *         plus basic portal sub-resources (updates, documents, photos).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  ClientMessage,
  ClientApproval,
  ClientPortalInvitation,
  ClientPayment,
  ClientPortalSettings,
  PortalMessage,
  PortalUpdatePost,
  PortalSharedDocument,
  PortalSharedPhoto,
  PortalSettings,
} from '@/types/client-portal'

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

// ── Client Messages (Module 29) ─────────────────────────────────────────────

type MessageListParams = {
  page?: number
  limit?: number
  job_id?: string
  category?: string
  status?: string
  q?: string
}

type MessageCreateInput = {
  job_id: string
  subject?: string | null
  message_text: string
  sender_type?: string
  category?: string
  thread_id?: string | null
  topic?: string | null
  attachments?: unknown[]
  is_external_log?: boolean
  external_channel?: string | null
}

const messageHooks = createApiHooks<MessageListParams, MessageCreateInput>(
  'client-portal-messages',
  '/api/v2/client-portal/messages'
)

export const useClientMessages = messageHooks.useList
export const useClientMessage = messageHooks.useDetail
export const useCreateClientMessage = messageHooks.useCreate
export const useUpdateClientMessage = messageHooks.useUpdate
export const useDeleteClientMessage = messageHooks.useDelete

// ── Client Approvals (Module 29) ────────────────────────────────────────────

type ApprovalListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  approval_type?: string
  q?: string
}

type ApprovalCreateInput = {
  job_id: string
  client_user_id: string
  approval_type: string
  reference_id: string
  title: string
  description?: string | null
  expires_at?: string | null
}

const approvalHooks = createApiHooks<ApprovalListParams, ApprovalCreateInput>(
  'client-portal-approvals',
  '/api/v2/client-portal/approvals'
)

export const useClientApprovals = approvalHooks.useList
export const useClientApproval = approvalHooks.useDetail
export const useCreateClientApproval = approvalHooks.useCreate
export const useUpdateClientApproval = approvalHooks.useUpdate
export const useDeleteClientApproval = approvalHooks.useDelete

// ── Client Invitations (Module 29) ──────────────────────────────────────────

type InvitationListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  q?: string
}

type InvitationCreateInput = {
  job_id: string
  email: string
  client_name?: string | null
  role?: string
  message?: string | null
  expires_at?: string
}

const invitationHooks = createApiHooks<InvitationListParams, InvitationCreateInput>(
  'client-portal-invitations',
  '/api/v2/client-portal/invitations'
)

export const useClientInvitations = invitationHooks.useList
export const useClientInvitation = invitationHooks.useDetail
export const useCreateClientInvitation = invitationHooks.useCreate
export const useUpdateClientInvitation = invitationHooks.useUpdate
export const useDeleteClientInvitation = invitationHooks.useDelete

// ── Client Payments (Module 29) ─────────────────────────────────────────────

type PaymentListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  payment_method?: string
  q?: string
}

type PaymentCreateInput = {
  job_id: string
  amount: number
  payment_method: string
  description?: string | null
  draw_request_id?: string | null
  invoice_id?: string | null
  payment_date?: string | null
  notes?: string | null
}

const paymentHooks = createApiHooks<PaymentListParams, PaymentCreateInput>(
  'client-portal-payments',
  '/api/v2/client-portal/payments'
)

export const useClientPayments = paymentHooks.useList
export const useClientPayment = paymentHooks.useDetail
export const useCreateClientPayment = paymentHooks.useCreate
export const useUpdateClientPayment = paymentHooks.useUpdate
export const useDeleteClientPayment = paymentHooks.useDelete

// ── Portal Settings (Module 29) ─────────────────────────────────────────────

/** Fetch company-level portal settings */
export function usePortalSettings() {
  return useQuery<{ data: ClientPortalSettings }>({
    queryKey: ['client-portal-settings'],
    queryFn: () => fetchJson('/api/v2/client-portal/settings'),
  })
}

/** Update company-level portal settings */
export function useUpdatePortalSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/client-portal/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-portal-settings'] })
    },
  })
}

// ── Basic Portal Messages (Module 12) ───────────────────────────────────────

type PortalMessageListParams = {
  page?: number
  limit?: number
  job_id?: string
  q?: string
}

type PortalMessageCreateInput = {
  job_id: string
  body: string
  subject?: string | null
  sender_type?: string
  parent_message_id?: string | null
}

const portalMessageHooks = createApiHooks<PortalMessageListParams, PortalMessageCreateInput>(
  'portal-messages',
  '/api/v2/portal/messages'
)

export const usePortalMessages = portalMessageHooks.useList
export const usePortalMessage = portalMessageHooks.useDetail
export const useCreatePortalMessage = portalMessageHooks.useCreate
export const useUpdatePortalMessage = portalMessageHooks.useUpdate

// ── Portal Update Posts (Module 12) ─────────────────────────────────────────

/** Fetch portal update posts for a job */
export function usePortalUpdates(params?: { page?: number; limit?: number; job_id?: string; post_type?: string }) {
  return useQuery<{ data: PortalUpdatePost[]; total: number }>({
    queryKey: ['portal-updates', params],
    queryFn: () => fetchJson(`/api/v2/portal/updates${buildQs(params)}`),
  })
}

// ── Portal Shared Documents (Module 12) ─────────────────────────────────────

/** Fetch portal shared documents for a job */
export function usePortalDocuments(params?: { page?: number; limit?: number; job_id?: string }) {
  return useQuery<{ data: PortalSharedDocument[]; total: number }>({
    queryKey: ['portal-documents', params],
    queryFn: () => fetchJson(`/api/v2/portal/documents${buildQs(params)}`),
  })
}

// ── Portal Shared Photos (Module 12) ────────────────────────────────────────

/** Fetch portal shared photos for a job */
export function usePortalPhotos(params?: { page?: number; limit?: number; job_id?: string; album_name?: string }) {
  return useQuery<{ data: PortalSharedPhoto[]; total: number }>({
    queryKey: ['portal-photos', params],
    queryFn: () => fetchJson(`/api/v2/portal/photos${buildQs(params)}`),
  })
}

// ── Basic Portal Settings (Module 12) ───────────────────────────────────────

/** Fetch basic portal settings for a specific job */
export function useBasicPortalSettings(jobId: string | null) {
  return useQuery<{ data: PortalSettings }>({
    queryKey: ['portal-settings', jobId],
    queryFn: () => fetchJson(`/api/v2/portal/settings?job_id=${jobId}`),
    enabled: !!jobId,
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  ClientMessage,
  ClientApproval,
  ClientPortalInvitation,
  ClientPayment,
  ClientPortalSettings,
  PortalMessage,
  PortalUpdatePost,
  PortalSharedDocument,
  PortalSharedPhoto,
  PortalSettings,
}
