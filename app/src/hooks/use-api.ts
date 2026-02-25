'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'

/**
 * Generic hook factory for v2 API endpoints.
 * Creates useList and useCreate hooks for any endpoint.
 *
 * Usage:
 *   const { useList: useEstimates, useCreate: useCreateEstimate } = createApiHooks('estimates', '/api/v2/estimates')
 */
export function createApiHooks<
  TParams extends Record<string, string | number | boolean | undefined>,
  TCreateInput extends Record<string, unknown>,
>(queryKey: string, basePath: string) {
  function useList(params: TParams = {} as TParams) {
    const searchParams = new URLSearchParams()
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.set(key, String(val))
      }
    }
    const qs = searchParams.toString()
    const url = `${basePath}${qs ? `?${qs}` : ''}`

    return useQuery({
      queryKey: [queryKey, params],
      queryFn: () => fetchJson(url),
    })
  }

  function useDetail(id: string | null) {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => fetchJson(`${basePath}/${id}`),
      enabled: !!id,
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (data: TCreateInput) =>
        fetchJson(basePath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
      },
    })
  }

  function useUpdate(id: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (data: Partial<TCreateInput>) =>
        fetchJson(`${basePath}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
      },
    })
  }

  function useDelete() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (deleteId: string) =>
        fetchJson(`${basePath}/${deleteId}`, { method: 'DELETE' }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
      },
    })
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete }
}
