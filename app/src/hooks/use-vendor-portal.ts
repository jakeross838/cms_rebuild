'use client'

/**
 * Module 30: Vendor Portal React Query Hooks
 *
 * Covers: vendor portal settings, invitations, access,
 * submissions, messages, and workflow actions
 * (revoke, submit, review, mark read).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  VendorPortalSettings,
  VendorPortalInvitation,
  VendorPortalAccess,
  VendorSubmission,
  VendorMessage,
} from '@/types/vendor-portal'

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

// ── Vendor Portal Settings ──────────────────────────────────────────────────

export function useVendorPortalSettings() {
  return useQuery<{ data: VendorPortalSettings }>({
    queryKey: ['vendor-portal-settings'],
    queryFn: () => fetchJson('/api/v2/vendor-portal/settings'),
  })
}

export function useUpdateVendorPortalSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/vendor-portal/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-portal-settings'] })
    },
  })
}

// ── Vendor Portal Invitations ───────────────────────────────────────────────

type InvitationListParams = {
  page?: number
  limit?: number
  status?: string
  vendor_id?: string
  email?: string
  q?: string
}

type InvitationCreateInput = {
  vendor_id?: string | null
  vendor_name: string
  contact_name?: string | null
  email: string
  phone?: string | null
  message?: string | null
  expires_at?: string
}

const invitationHooks = createApiHooks<InvitationListParams, InvitationCreateInput>(
  'vendor-portal-invitations',
  '/api/v2/vendor-portal/invitations'
)

export const useVendorPortalInvitations = invitationHooks.useList
export const useVendorPortalInvitation = invitationHooks.useDetail
export const useCreateVendorPortalInvitation = invitationHooks.useCreate
export const useUpdateVendorPortalInvitation = invitationHooks.useUpdate
export const useDeleteVendorPortalInvitation = invitationHooks.useDelete

export function useRevokeVendorPortalInvitation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/vendor-portal/invitations/${id}/revoke`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-portal-invitations'] })
    },
  })
}

// ── Vendor Portal Access ────────────────────────────────────────────────────

type AccessListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  access_level?: string
  q?: string
}

type AccessCreateInput = {
  vendor_id: string
  access_level?: string
  can_submit_invoices?: boolean
  can_submit_lien_waivers?: boolean
  can_submit_daily_reports?: boolean
  can_view_schedule?: boolean
  can_view_purchase_orders?: boolean
  can_upload_documents?: boolean
  can_send_messages?: boolean
  allowed_job_ids?: string[]
}

const accessHooks = createApiHooks<AccessListParams, AccessCreateInput>(
  'vendor-portal-access',
  '/api/v2/vendor-portal/access'
)

export const useVendorPortalAccessList = accessHooks.useList
export const useVendorPortalAccess = accessHooks.useDetail
export const useCreateVendorPortalAccess = accessHooks.useCreate
export const useUpdateVendorPortalAccess = accessHooks.useUpdate
export const useDeleteVendorPortalAccess = accessHooks.useDelete

// ── Vendor Submissions ──────────────────────────────────────────────────────

type SubmissionListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  job_id?: string
  submission_type?: string
  status?: string
  q?: string
}

type SubmissionCreateInput = {
  vendor_id: string
  job_id?: string | null
  submission_type: string
  title: string
  description?: string | null
  amount?: number | null
  reference_number?: string | null
  file_urls?: string[]
  metadata?: Record<string, unknown>
}

const submissionHooks = createApiHooks<SubmissionListParams, SubmissionCreateInput>(
  'vendor-submissions',
  '/api/v2/vendor-portal/submissions'
)

export const useVendorSubmissions = submissionHooks.useList
export const useVendorSubmission = submissionHooks.useDetail
export const useCreateVendorSubmission = submissionHooks.useCreate
export const useUpdateVendorSubmission = submissionHooks.useUpdate
export const useDeleteVendorSubmission = submissionHooks.useDelete

export function useSubmitVendorSubmission(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/vendor-portal/submissions/${id}/submit`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-submissions'] })
    },
  })
}

export function useReviewVendorSubmission(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/vendor-portal/submissions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-submissions'] })
    },
  })
}

// ── Vendor Messages ─────────────────────────────────────────────────────────

type MessageListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  job_id?: string
  direction?: string
  is_read?: boolean
  q?: string
}

type MessageCreateInput = {
  vendor_id: string
  job_id?: string | null
  subject: string
  body: string
  direction: string
  parent_message_id?: string | null
}

const messageHooks = createApiHooks<MessageListParams, MessageCreateInput>(
  'vendor-messages',
  '/api/v2/vendor-portal/messages'
)

export const useVendorMessages = messageHooks.useList
export const useVendorMessage = messageHooks.useDetail
export const useCreateVendorMessage = messageHooks.useCreate
export const useUpdateVendorMessage = messageHooks.useUpdate
export const useDeleteVendorMessage = messageHooks.useDelete

export function useMarkVendorMessageRead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/vendor-portal/messages/${id}/read`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-messages'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  VendorPortalSettings,
  VendorPortalInvitation,
  VendorPortalAccess,
  VendorSubmission,
  VendorMessage,
}
