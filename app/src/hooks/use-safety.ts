'use client'

/**
 * Module 33: Safety & Compliance React Query Hooks
 *
 * Covers safety incidents, safety inspections, inspection items, toolbox talks, and attendees.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  SafetyIncident,
  SafetyInspection,
  SafetyInspectionItem,
  ToolboxTalk,
  ToolboxTalkAttendee,
} from '@/types/safety'

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

// ── Safety Incidents ─────────────────────────────────────────────────────────

type IncidentListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  severity?: string
  incident_type?: string
  q?: string
}

type IncidentCreateInput = {
  job_id: string
  title: string
  incident_date: string
  severity: string
  incident_type: string
  incident_number?: string | null
  description?: string | null
  location?: string | null
  incident_time?: string | null
  status?: string
  osha_recordable?: boolean
  medical_treatment?: boolean
  injured_party?: string | null
  injury_description?: string | null
  corrective_actions?: string | null
  notes?: string | null
}

const incidentHooks = createApiHooks<IncidentListParams, IncidentCreateInput>(
  'safety-incidents',
  '/api/v2/safety/incidents'
)

export const useSafetyIncidents = incidentHooks.useList
export const useSafetyIncident = incidentHooks.useDetail
export const useCreateSafetyIncident = incidentHooks.useCreate
export const useUpdateSafetyIncident = incidentHooks.useUpdate
export const useDeleteSafetyIncident = incidentHooks.useDelete

// ── Safety Inspections ───────────────────────────────────────────────────────

type SafetyInspectionListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  inspection_type?: string
  q?: string
}

type SafetyInspectionCreateInput = {
  job_id: string
  title: string
  inspection_date: string
  inspection_type: string
  description?: string | null
  status?: string
  inspector_id?: string | null
  location?: string | null
  notes?: string | null
}

const inspectionHooks = createApiHooks<SafetyInspectionListParams, SafetyInspectionCreateInput>(
  'safety-inspections',
  '/api/v2/safety/inspections'
)

export const useSafetyInspections = inspectionHooks.useList
export const useSafetyInspection = inspectionHooks.useDetail
export const useCreateSafetyInspection = inspectionHooks.useCreate
export const useUpdateSafetyInspection = inspectionHooks.useUpdate
export const useDeleteSafetyInspection = inspectionHooks.useDelete

// ── Safety Inspection Items ──────────────────────────────────────────────────

export function useSafetyInspectionItems(inspectionId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: SafetyInspectionItem[]; total: number }>({
    queryKey: ['safety-inspection-items', inspectionId, params],
    queryFn: () =>
      fetchJson(`/api/v2/safety/inspections/${inspectionId}/items${buildQs(params)}`),
    enabled: !!inspectionId,
  })
}

export function useCreateSafetyInspectionItem(inspectionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/safety/inspections/${inspectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['safety-inspection-items', inspectionId] })
      qc.invalidateQueries({ queryKey: ['safety-inspections'] })
    },
  })
}

export function useUpdateSafetyInspectionItem(inspectionId: string, itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/safety/inspections/${inspectionId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['safety-inspection-items', inspectionId] })
      qc.invalidateQueries({ queryKey: ['safety-inspections'] })
    },
  })
}

export function useCompleteSafetyInspection(inspectionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/safety/inspections/${inspectionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['safety-inspections'] })
    },
  })
}

// ── Toolbox Talks ────────────────────────────────────────────────────────────

type TalkListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  q?: string
}

type TalkCreateInput = {
  job_id: string
  title: string
  talk_date: string
  topic?: string | null
  description?: string | null
  status?: string
  talk_time?: string | null
  duration_minutes?: number | null
  presenter_id?: string | null
  location?: string | null
  notes?: string | null
}

const talkHooks = createApiHooks<TalkListParams, TalkCreateInput>(
  'toolbox-talks',
  '/api/v2/safety/toolbox-talks'
)

export const useToolboxTalks = talkHooks.useList
export const useToolboxTalk = talkHooks.useDetail
export const useCreateToolboxTalk = talkHooks.useCreate
export const useUpdateToolboxTalk = talkHooks.useUpdate
export const useDeleteToolboxTalk = talkHooks.useDelete

// ── Toolbox Talk Attendees ───────────────────────────────────────────────────

export function useToolboxTalkAttendees(talkId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: ToolboxTalkAttendee[]; total: number }>({
    queryKey: ['toolbox-talk-attendees', talkId, params],
    queryFn: () =>
      fetchJson(`/api/v2/safety/toolbox-talks/${talkId}/attendees${buildQs(params)}`),
    enabled: !!talkId,
  })
}

export function useCreateToolboxTalkAttendee(talkId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/safety/toolbox-talks/${talkId}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['toolbox-talk-attendees', talkId] })
      qc.invalidateQueries({ queryKey: ['toolbox-talks'] })
    },
  })
}

export function useDeleteToolboxTalkAttendee(talkId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attendeeId: string) =>
      fetchJson(`/api/v2/safety/toolbox-talks/${talkId}/attendees/${attendeeId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['toolbox-talk-attendees', talkId] })
      qc.invalidateQueries({ queryKey: ['toolbox-talks'] })
    },
  })
}

export function useCompleteToolboxTalk(talkId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/safety/toolbox-talks/${talkId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['toolbox-talks'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { SafetyIncident, SafetyInspection, SafetyInspectionItem, ToolboxTalk, ToolboxTalkAttendee }
