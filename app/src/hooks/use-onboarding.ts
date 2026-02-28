'use client'

/**
 * Module 41: Onboarding Wizard React Query Hooks
 *
 * Covers onboarding sessions, milestones, reminders, checklists, and sample data sets.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  OnboardingSession,
  OnboardingMilestone,
  OnboardingReminder,
  SampleDataSet,
  OnboardingChecklist,
} from '@/types/onboarding'

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

// ── Onboarding Sessions ──────────────────────────────────────────────────────

type SessionListParams = {
  page?: number
  limit?: number
  status?: string
  q?: string
}

type SessionCreateInput = {
  status?: string
  company_type?: string | null
  company_size?: string | null
  total_steps?: number
}

const sessionHooks = createApiHooks<SessionListParams, SessionCreateInput>(
  'onboarding-sessions',
  '/api/v2/onboarding'
)

export const useOnboardingSessions = sessionHooks.useList
export const useOnboardingSession = sessionHooks.useDetail
export const useCreateOnboardingSession = sessionHooks.useCreate
export const useUpdateOnboardingSession = sessionHooks.useUpdate
export const useDeleteOnboardingSession = sessionHooks.useDelete

// ── Onboarding Milestones ────────────────────────────────────────────────────

export function useOnboardingMilestones(sessionId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: OnboardingMilestone[]; total: number }>({
    queryKey: ['onboarding-milestones', sessionId, params],
    queryFn: () =>
      fetchJson(`/api/v2/onboarding/${sessionId}/milestones${buildQs(params)}`),
    enabled: !!sessionId,
  })
}

export function useCreateOnboardingMilestone(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/onboarding/${sessionId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-milestones', sessionId] })
      qc.invalidateQueries({ queryKey: ['onboarding-sessions'] })
    },
  })
}

// ── Onboarding Reminders ─────────────────────────────────────────────────────

export function useOnboardingReminders(sessionId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: OnboardingReminder[]; total: number }>({
    queryKey: ['onboarding-reminders', sessionId, params],
    queryFn: () =>
      fetchJson(`/api/v2/onboarding/${sessionId}/reminders${buildQs(params)}`),
    enabled: !!sessionId,
  })
}

export function useCreateOnboardingReminder(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/onboarding/${sessionId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-reminders', sessionId] })
      qc.invalidateQueries({ queryKey: ['onboarding-sessions'] })
    },
  })
}

// ── Onboarding Checklists ────────────────────────────────────────────────────

export function useOnboardingChecklists(sessionId: string | null, params?: { page?: number; limit?: number; category?: string }) {
  return useQuery<{ data: OnboardingChecklist[]; total: number }>({
    queryKey: ['onboarding-checklists', sessionId, params],
    queryFn: () =>
      fetchJson(`/api/v2/onboarding/${sessionId}/checklists${buildQs(params)}`),
    enabled: !!sessionId,
  })
}

export function useCreateOnboardingChecklist(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/onboarding/${sessionId}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-checklists', sessionId] })
      qc.invalidateQueries({ queryKey: ['onboarding-sessions'] })
    },
  })
}

// ── Sample Data Sets ─────────────────────────────────────────────────────────

type SampleDataListParams = {
  page?: number
  limit?: number
  data_type?: string
  status?: string
}

type SampleDataCreateInput = {
  name: string
  data_type: string
  description?: string | null
  content?: Record<string, unknown>
}

const sampleDataHooks = createApiHooks<SampleDataListParams, SampleDataCreateInput>(
  'sample-data',
  '/api/v2/onboarding/sample-data'
)

export const useSampleDataSets = sampleDataHooks.useList
export const useSampleDataSet = sampleDataHooks.useDetail
export const useCreateSampleDataSet = sampleDataHooks.useCreate
export const useUpdateSampleDataSet = sampleDataHooks.useUpdate
export const useDeleteSampleDataSet = sampleDataHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { OnboardingSession, OnboardingMilestone, OnboardingReminder, SampleDataSet, OnboardingChecklist }
