'use client'

/**
 * Module 29: Full Client Portal React Query Hooks
 *
 * Covers: client portal settings, invitations, approvals,
 * messages, payments.
 *
 * Note: Basic portal hooks (Module 12) remain in portal routes.
 * These hooks cover the enhanced full portal features.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  ClientPortalSettings,
  ClientPortalInvitation,
  ClientApproval,
  ClientMessage,
  ClientPayment,
} from '@/types/client-portal'

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Client Portal Settings ──────────────────────────────────────────────────

export function useClientPortalSettings() {
  return useQuery<{ data: ClientPortalSettings }>({
    queryKey: ['client-portal-settings'],
    queryFn: () => fetchJson('/api/v2/client-portal/settings'),
  })
}

export function useUpdateClientPortalSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/client-portal/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-portal-settings'] })
    },
  })
}

// ── Client Portal Invitations ───────────────────────────────────────────────

type InvitationListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  email?: string
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

export const useClientPortalInvitations = invitationHooks.useList
export const useClientPortalInvitation = invitationHooks.useDetail
export const useCreateClientPortalInvitation = invitationHooks.useCreate
export const useUpdateClientPortalInvitation = invitationHooks.useUpdate
export const useDeleteClientPortalInvitation = invitationHooks.useDelete

// ── Client Approvals ────────────────────────────────────────────────────────

type ApprovalListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  approval_type?: string
  client_user_id?: string
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
  'client-approvals',
  '/api/v2/client-portal/approvals'
)

export const useClientApprovals = approvalHooks.useList
export const useClientApproval = approvalHooks.useDetail
export const useCreateClientApproval = approvalHooks.useCreate
export const useUpdateClientApproval = approvalHooks.useUpdate
export const useDeleteClientApproval = approvalHooks.useDelete

// ── Client Messages ─────────────────────────────────────────────────────────

type MessageListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  category?: string
  sender_type?: string
  thread_id?: string
  q?: string
}

type MessageCreateInput = {
  job_id: string
  sender_type: string
  subject?: string | null
  message_text: string
  thread_id?: string | null
  topic?: string | null
  category?: string
  is_external_log?: boolean
  external_channel?: string | null
}

const messageHooks = createApiHooks<MessageListParams, MessageCreateInput>(
  'client-messages',
  '/api/v2/client-portal/messages'
)

export const useClientMessages = messageHooks.useList
export const useClientMessage = messageHooks.useDetail
export const useCreateClientMessage = messageHooks.useCreate
export const useUpdateClientMessage = messageHooks.useUpdate
export const useDeleteClientMessage = messageHooks.useDelete

// ── Client Payments ─────────────────────────────────────────────────────────

type PaymentListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  payment_method?: string
  client_user_id?: string
  date_from?: string
  date_to?: string
  q?: string
}

type PaymentCreateInput = {
  job_id: string
  client_user_id?: string | null
  payment_number?: string | null
  amount: number
  payment_method: string
  status?: string
  reference_number?: string | null
  description?: string | null
  draw_request_id?: string | null
  invoice_id?: string | null
  payment_date?: string | null
  notes?: string | null
}

const paymentHooks = createApiHooks<PaymentListParams, PaymentCreateInput>(
  'client-payments',
  '/api/v2/client-portal/payments'
)

export const useClientPayments = paymentHooks.useList
export const useClientPayment = paymentHooks.useDetail
export const useCreateClientPayment = paymentHooks.useCreate
export const useUpdateClientPayment = paymentHooks.useUpdate
export const useDeleteClientPayment = paymentHooks.useDelete

// ── Basic Portal (Module 12 endpoints) ──────────────────────────────────────

export function usePortalDocuments(params?: { page?: number; limit?: number; job_id?: string }) {
  return useQuery({
    queryKey: ['portal-documents', params],
    queryFn: () => fetchJson(`/api/v2/portal/documents${buildQs(params)}`),
  })
}

export function usePortalPhotos(params?: { page?: number; limit?: number; job_id?: string; album_name?: string }) {
  return useQuery({
    queryKey: ['portal-photos', params],
    queryFn: () => fetchJson(`/api/v2/portal/photos${buildQs(params)}`),
  })
}

export function usePortalSettings() {
  return useQuery({
    queryKey: ['portal-settings'],
    queryFn: () => fetchJson('/api/v2/portal/settings'),
  })
}

export function useUpdatePortalSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/portal/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-settings'] })
    },
  })
}

export function usePortalUpdates(params?: { page?: number; limit?: number; job_id?: string; is_published?: boolean }) {
  return useQuery({
    queryKey: ['portal-updates', params],
    queryFn: () => fetchJson(`/api/v2/portal/updates${buildQs(params)}`),
  })
}

export function usePortalUpdate(id: string | null) {
  return useQuery({
    queryKey: ['portal-updates', id],
    queryFn: () => fetchJson(`/api/v2/portal/updates/${id}`),
    enabled: !!id,
  })
}

export function useCreatePortalUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/portal/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-updates'] })
    },
  })
}

export function useUpdatePortalUpdate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/portal/updates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-updates'] })
    },
  })
}

export function usePublishPortalUpdate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/portal/updates/${id}/publish`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-updates'] })
    },
  })
}

export function usePortalMessages(params?: { page?: number; limit?: number; job_id?: string }) {
  return useQuery({
    queryKey: ['portal-messages', params],
    queryFn: () => fetchJson(`/api/v2/portal/messages${buildQs(params)}`),
  })
}

export function useCreatePortalMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-messages'] })
    },
  })
}

export function useUpdatePortalMessage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/portal/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-messages'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  ClientPortalSettings,
  ClientPortalInvitation,
  ClientApproval,
  ClientMessage,
  ClientPayment,
}
