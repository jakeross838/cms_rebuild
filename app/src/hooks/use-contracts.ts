'use client'

/**
 * Module 38: Contracts & E-Signature React Query Hooks
 *
 * Covers contracts, contract versions, signers, templates, and clauses.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Contract,
  ContractVersion,
  ContractSigner,
  ContractTemplate,
  ContractClause,
} from '@/types/contracts'

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

// ── Contracts ────────────────────────────────────────────────────────────────

type ContractListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  contract_type?: string
  vendor_id?: string
  client_id?: string
  q?: string
}

type ContractCreateInput = {
  title: string
  contract_type: string
  contract_number: string
  job_id?: string | null
  description?: string | null
  status?: string
  template_id?: string | null
  vendor_id?: string | null
  client_id?: string | null
  contract_value?: number | null
  retention_pct?: number | null
  start_date?: string | null
  end_date?: string | null
  content?: string | null
}

const contractHooks = createApiHooks<ContractListParams, ContractCreateInput>(
  'contracts',
  '/api/v2/contracts'
)

export const useContracts = contractHooks.useList
export const useContract = contractHooks.useDetail
export const useCreateContract = contractHooks.useCreate
export const useUpdateContract = contractHooks.useUpdate
export const useDeleteContract = contractHooks.useDelete

// ── Contract Versions ────────────────────────────────────────────────────────

export function useContractVersions(contractId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: ContractVersion[]; total: number }>({
    queryKey: ['contract-versions', contractId, params],
    queryFn: () =>
      fetchJson(`/api/v2/contracts/${contractId}/versions${buildQs(params)}`),
    enabled: !!contractId,
  })
}

export function useCreateContractVersion(contractId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/contracts/${contractId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-versions', contractId] })
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

// ── Contract Signers ─────────────────────────────────────────────────────────

export function useContractSigners(contractId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: ContractSigner[]; total: number }>({
    queryKey: ['contract-signers', contractId, params],
    queryFn: () =>
      fetchJson(`/api/v2/contracts/${contractId}/signers${buildQs(params)}`),
    enabled: !!contractId,
  })
}

export function useCreateContractSigner(contractId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/contracts/${contractId}/signers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-signers', contractId] })
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useUpdateContractSigner(contractId: string, signerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/contracts/${contractId}/signers/${signerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-signers', contractId] })
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useSignContract(contractId: string, signerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/contracts/${contractId}/signers/${signerId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-signers', contractId] })
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useDeclineContract(contractId: string, signerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/contracts/${contractId}/signers/${signerId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-signers', contractId] })
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useSendContract(contractId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/contracts/${contractId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

// ── Contract Templates ───────────────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  contract_type?: string
  is_active?: boolean
  q?: string
}

type TemplateCreateInput = {
  name: string
  contract_type: string
  description?: string | null
  content?: string | null
  is_system?: boolean
  is_active?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'contract-templates',
  '/api/v2/contracts/templates'
)

export const useContractTemplates = templateHooks.useList
export const useContractTemplate = templateHooks.useDetail
export const useCreateContractTemplate = templateHooks.useCreate
export const useUpdateContractTemplate = templateHooks.useUpdate
export const useDeleteContractTemplate = templateHooks.useDelete

// ── Contract Clauses ─────────────────────────────────────────────────────────

type ClauseListParams = {
  page?: number
  limit?: number
  category?: string
  is_active?: boolean
  q?: string
}

type ClauseCreateInput = {
  name: string
  content: string
  description?: string | null
  category?: string | null
  is_required?: boolean
  is_active?: boolean
  sort_order?: number
}

const clauseHooks = createApiHooks<ClauseListParams, ClauseCreateInput>(
  'contract-clauses',
  '/api/v2/contracts/clauses'
)

export const useContractClauses = clauseHooks.useList
export const useContractClause = clauseHooks.useDetail
export const useCreateContractClause = clauseHooks.useCreate
export const useUpdateContractClause = clauseHooks.useUpdate
export const useDeleteContractClause = clauseHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { Contract, ContractVersion, ContractSigner, ContractTemplate, ContractClause }
