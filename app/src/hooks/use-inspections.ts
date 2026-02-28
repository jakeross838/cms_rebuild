'use client'

/**
 * Permit Inspections React Query Hooks
 *
 * Covers: inspections CRUD (flat route for permit_inspections table).
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Inspections ─────────────────────────────────────────────────────────────

type InspectionListParams = {
  page?: number
  limit?: number
  job_id?: string
  permit_id?: string
  status?: string
  inspection_type?: string
  q?: string
}

type InspectionCreateInput = {
  job_id: string
  permit_id: string
  inspection_type: string
  status?: string
  scheduled_date?: string | null
  scheduled_time?: string | null
  inspector_name?: string | null
  inspector_phone?: string | null
  is_reinspection?: boolean
  original_inspection_id?: string | null
  completed_at?: string | null
  notes?: string | null
}

const inspectionHooks = createApiHooks<InspectionListParams, InspectionCreateInput>(
  'inspections',
  '/api/v2/inspections'
)

export const useInspections = inspectionHooks.useList
export const useInspection = inspectionHooks.useDetail
export const useCreateInspection = inspectionHooks.useCreate
export const useUpdateInspection = inspectionHooks.useUpdate
export const useDeleteInspection = inspectionHooks.useDelete
