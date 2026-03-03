import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useJobs', () => {
  it('fetches job list successfully', async () => {
    const { useJobs } = await import('@/hooks/use-jobs')
    server.use(
      http.get('/api/v1/jobs', () => {
        return HttpResponse.json({
          data: [
            { id: 'j1', name: 'Kitchen Remodel', status: 'active' },
            { id: 'j2', name: 'Bathroom Renovation', status: 'active' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].name).toBe('Kitchen Remodel')
  })

  it('handles fetch error', async () => {
    const { useJobs } = await import('@/hooks/use-jobs')
    server.use(
      http.get('/api/v1/jobs', () => {
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      })
    )
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useJob', () => {
  it('fetches a single job by id', async () => {
    const { useJob } = await import('@/hooks/use-jobs')
    server.use(
      http.get('/api/v1/jobs/j1', () => {
        return HttpResponse.json({ data: { id: 'j1', name: 'Kitchen Remodel', status: 'active' } })
      })
    )
    const { result } = renderHook(() => useJob('j1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('Kitchen Remodel')
  })

  it('does not fetch when id is null', async () => {
    const { useJob } = await import('@/hooks/use-jobs')
    const { result } = renderHook(() => useJob(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateJob', () => {
  it('creates a job successfully', async () => {
    const { useCreateJob } = await import('@/hooks/use-jobs')
    server.use(
      http.post('/api/v1/jobs', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: { id: 'new-j1', name: body.name } }, { status: 201 })
      })
    )
    const { result } = renderHook(() => useCreateJob(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ name: 'New Build', status: 'draft' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('New Build')
  })
})

describe('useDeleteJob', () => {
  it('deletes a job successfully', async () => {
    const { useDeleteJob } = await import('@/hooks/use-jobs')
    server.use(
      http.delete('/api/v1/jobs/j-del', () => {
        return HttpResponse.json({ data: { id: 'j-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteJob(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('j-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
