import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useJobPhotos,
  useJobPhoto,
  useCreateJobPhoto,
  useUpdateJobPhoto,
  useDeleteJobPhoto,
} from '@/hooks/use-job-photos'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Job Photos (factory-based)
// ---------------------------------------------------------------------------

describe('useJobPhotos', () => {
  it('fetches from /api/v2/job-photos', async () => {
    server.use(
      http.get('/api/v2/job-photos', () =>
        HttpResponse.json({
          data: [{ id: 'jp-1', title: 'Foundation Pour', photo_url: '/photos/foundation.jpg' }],
          total: 1,
        }),
      ),
    )

    const { result } = renderHook(() => useJobPhotos(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: [{ id: 'jp-1', title: 'Foundation Pour', photo_url: '/photos/foundation.jpg' }],
      total: 1,
    })
  })

  it('passes query params as search params', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/v2/job-photos', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ data: [], total: 0 })
      }),
    )

    const { result } = renderHook(
      () => useJobPhotos({ job_id: 'job-1', category: 'exterior' } as any),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedUrl).toContain('job_id=job-1')
    expect(capturedUrl).toContain('category=exterior')
  })
})

describe('useJobPhoto', () => {
  it('fetches a single photo by id', async () => {
    server.use(
      http.get('/api/v2/job-photos/jp-1', () =>
        HttpResponse.json({ id: 'jp-1', title: 'Foundation Pour' }),
      ),
    )

    const { result } = renderHook(() => useJobPhoto('jp-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'jp-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useJobPhoto(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateJobPhoto', () => {
  it('posts to /api/v2/job-photos', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/job-photos', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'jp-new' })
      }),
    )

    const { result } = renderHook(() => useCreateJobPhoto(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      job_id: 'job-1',
      title: 'Framing Complete',
      photo_url: '/photos/framing.jpg',
    })
    expect(capturedBody).toMatchObject({
      job_id: 'job-1',
      title: 'Framing Complete',
      photo_url: '/photos/framing.jpg',
    })
  })
})

describe('useUpdateJobPhoto', () => {
  it('patches to /api/v2/job-photos/:id', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.patch('/api/v2/job-photos/jp-1', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'jp-1', category: 'interior' })
      }),
    )

    const { result } = renderHook(() => useUpdateJobPhoto('jp-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ category: 'interior' } as any)
    expect(capturedBody).toMatchObject({ category: 'interior' })
  })
})

describe('useDeleteJobPhoto', () => {
  it('sends DELETE to /api/v2/job-photos/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/job-photos/jp-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteJobPhoto(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('jp-1')
    expect(deleteCalled).toBe(true)
  })
})
