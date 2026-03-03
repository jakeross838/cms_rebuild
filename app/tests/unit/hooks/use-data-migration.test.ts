import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useMigrationJobs,
  useMigrationJob,
  useCreateMigrationJob,
  useMigrationMappings,
  useMigrationTemplates,
  useMigrationTemplate,
} from '@/hooks/use-data-migration'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockJobs = [
  { id: '1', name: 'Buildertrend Import', source_platform: 'buildertrend', status: 'completed' },
  { id: '2', name: 'QB Import', source_platform: 'quickbooks', status: 'in_progress' },
]

describe('use-data-migration hooks', () => {
  describe('useMigrationJobs', () => {
    it('fetches migration jobs list successfully', async () => {
      server.use(
        http.get('/api/v2/data-migration/jobs', () =>
          HttpResponse.json({ data: mockJobs, total: 2 })
        )
      )

      const { result } = renderHook(() => useMigrationJobs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockJobs, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/data-migration/jobs', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useMigrationJobs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useMigrationJob', () => {
    it('fetches a single migration job by id', async () => {
      server.use(
        http.get('/api/v2/data-migration/jobs/1', () =>
          HttpResponse.json({ data: mockJobs[0] })
        )
      )

      const { result } = renderHook(() => useMigrationJob('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockJobs[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useMigrationJob(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateMigrationJob', () => {
    it('creates a migration job via POST', async () => {
      server.use(
        http.post('/api/v2/data-migration/jobs', () =>
          HttpResponse.json({ data: { id: '3', name: 'Excel Import', source_platform: 'excel' } })
        )
      )

      const { result } = renderHook(() => useCreateMigrationJob(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'Excel Import', source_platform: 'excel' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useMigrationMappings', () => {
    it('fetches field mappings for a job', async () => {
      server.use(
        http.get('/api/v2/data-migration/jobs/1/mappings', () =>
          HttpResponse.json({ data: [{ id: 'm1', source_field: 'name' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useMigrationMappings('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('does not fetch when job id is null', () => {
      const { result } = renderHook(() => useMigrationMappings(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useMigrationTemplate', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useMigrationTemplate(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
