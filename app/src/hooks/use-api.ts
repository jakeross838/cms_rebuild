'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'

/**
 * Generic hook factory for v2 API endpoints.
 * Creates useList, useDetail, useCreate, useUpdate, useDelete hooks for any endpoint.
 * Includes optimistic updates for delete operations.
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
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await qc.cancelQueries({ queryKey: [queryKey, id] })
        // Snapshot previous value
        const previousData = qc.getQueryData([queryKey, id])
        // Optimistically update detail cache
        if (previousData) {
          qc.setQueryData([queryKey, id], (old: unknown) => {
            if (old && typeof old === 'object') {
              return { ...old, ...newData }
            }
            return old
          })
        }
        return { previousData }
      },
      onError: (_err, _vars, context) => {
        // Roll back on error
        if (context?.previousData) {
          qc.setQueryData([queryKey, id], context.previousData)
        }
      },
      onSettled: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
      },
    })
  }

  function useDelete() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (deleteId: string) =>
        fetchJson(`${basePath}/${deleteId}`, { method: 'DELETE' }),
      onMutate: async (deleteId) => {
        // Cancel outgoing refetches for list queries
        await qc.cancelQueries({ queryKey: [queryKey] })
        // Snapshot all list queries
        const previousQueries = qc.getQueriesData({ queryKey: [queryKey] })
        // Optimistically remove item from all list caches
        qc.setQueriesData({ queryKey: [queryKey] }, (old: unknown) => {
          if (Array.isArray(old)) {
            return old.filter((item: { id?: string }) => item.id !== deleteId)
          }
          // Handle paginated response shape { data: [...], meta: {...} }
          if (old && typeof old === 'object' && 'data' in old && Array.isArray((old as { data: unknown[] }).data)) {
            const typed = old as { data: { id?: string }[] }
            return { ...typed, data: typed.data.filter(item => item.id !== deleteId) }
          }
          return old
        })
        return { previousQueries }
      },
      onError: (_err, _vars, context) => {
        // Roll back all list caches on error
        if (context?.previousQueries) {
          for (const [key, data] of context.previousQueries) {
            qc.setQueryData(key, data)
          }
        }
      },
      onSettled: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
      },
    })
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete }
}
