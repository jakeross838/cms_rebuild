'use client'

/**
 * Module 10: Vendor Management React Query Hooks
 *
 * Covers sub-resources: contacts, insurance, compliance, ratings.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import type { VendorContact, VendorInsurance, VendorCompliance, VendorRating } from '@/types/vendor-management'

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

// ── Vendor Contacts ──────────────────────────────────────────────────────────

type ContactListParams = {
  page?: number
  limit?: number
}

export function useVendorContacts(vendorId: string | null, params?: ContactListParams) {
  return useQuery<{ data: VendorContact[]; total: number }>({
    queryKey: ['vendor-contacts', vendorId, params],
    queryFn: () =>
      fetchJson(`/api/v1/vendors/${vendorId}/contacts${buildQs(params)}`),
    enabled: !!vendorId,
  })
}

export function useVendorContact(vendorId: string | null, contactId: string | null) {
  return useQuery({
    queryKey: ['vendor-contacts', vendorId, contactId],
    queryFn: () => fetchJson(`/api/v1/vendors/${vendorId}/contacts/${contactId}`),
    enabled: !!vendorId && !!contactId,
  })
}

export function useCreateVendorContact(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/vendors/${vendorId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

export function useUpdateVendorContact(vendorId: string, contactId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/vendors/${vendorId}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

export function useDeleteVendorContact(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (contactId: string) =>
      fetchJson(`/api/v1/vendors/${vendorId}/contacts/${contactId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

// ── Vendor Insurance ─────────────────────────────────────────────────────────

type InsuranceListParams = {
  page?: number
  limit?: number
  status?: string
  insurance_type?: string
}

export function useVendorInsurance(vendorId: string | null, params?: InsuranceListParams) {
  return useQuery<{ data: VendorInsurance[]; total: number }>({
    queryKey: ['vendor-insurance', vendorId, params],
    queryFn: () =>
      fetchJson(`/api/v1/vendors/${vendorId}/insurance${buildQs(params)}`),
    enabled: !!vendorId,
  })
}

export function useVendorInsuranceDetail(vendorId: string | null, insuranceId: string | null) {
  return useQuery({
    queryKey: ['vendor-insurance', vendorId, insuranceId],
    queryFn: () => fetchJson(`/api/v1/vendors/${vendorId}/insurance/${insuranceId}`),
    enabled: !!vendorId && !!insuranceId,
  })
}

export function useCreateVendorInsurance(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/vendors/${vendorId}/insurance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-insurance', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

export function useUpdateVendorInsurance(vendorId: string, insuranceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/vendors/${vendorId}/insurance/${insuranceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-insurance', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

export function useDeleteVendorInsurance(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (insuranceId: string) =>
      fetchJson(`/api/v1/vendors/${vendorId}/insurance/${insuranceId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-insurance', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

// ── Vendor Compliance ────────────────────────────────────────────────────────

type ComplianceListParams = {
  page?: number
  limit?: number
  status?: string
  requirement_type?: string
}

export function useVendorCompliance(vendorId: string | null, params?: ComplianceListParams) {
  return useQuery<{ data: VendorCompliance[]; total: number }>({
    queryKey: ['vendor-compliance', vendorId, params],
    queryFn: () =>
      fetchJson(`/api/v1/vendors/${vendorId}/compliance${buildQs(params)}`),
    enabled: !!vendorId,
  })
}

export function useCreateVendorCompliance(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/vendors/${vendorId}/compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-compliance', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

// ── Vendor Ratings ───────────────────────────────────────────────────────────

type RatingsListParams = {
  page?: number
  limit?: number
  category?: string
  job_id?: string
}

export function useVendorRatings(vendorId: string | null, params?: RatingsListParams) {
  return useQuery<{ data: VendorRating[]; total: number }>({
    queryKey: ['vendor-ratings', vendorId, params],
    queryFn: () =>
      fetchJson(`/api/v1/vendors/${vendorId}/ratings${buildQs(params)}`),
    enabled: !!vendorId,
  })
}

export function useCreateVendorRating(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/vendors/${vendorId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-ratings', vendorId] })
      qc.invalidateQueries({ queryKey: ['vendors', vendorId] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { VendorContact, VendorInsurance, VendorCompliance, VendorRating }
