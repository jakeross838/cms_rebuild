import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import { createApiHooks } from '@/hooks/use-api'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// Create test hooks using the factory
type TestParams = { page?: number; status?: string; q?: string }
type TestCreateInput = { name: string; description?: string }

const {
  useList: useTestList,
  useDetail: useTestDetail,
  useCreate: useTestCreate,
  useUpdate: useTestUpdate,
  useDelete: useTestDelete,
} = createApiHooks<TestParams, TestCreateInput>('test-items', '/api/v2/test-items')

const mockItems = [
  { id: '1', name: 'Item One', description: 'First item' },
  { id: '2', name: 'Item Two', description: 'Second item' },
]

describe('createApiHooks factory', () => {
  describe('useList', () => {
    it('fetches list data successfully', async () => {
      server.use(
        http.get('/api/v2/test-items', () =>
          HttpResponse.json({ data: mockItems, total: 2 })
        )
      )

      const { result } = renderHook(() => useTestList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockItems, total: 2 })
    })

    it('passes query params in the URL', async () => {
      server.use(
        http.get('/api/v2/test-items', ({ request }) => {
          const url = new URL(request.url)
          const status = url.searchParams.get('status')
          if (status === 'active') {
            return HttpResponse.json({ data: [mockItems[0]], total: 1 })
          }
          return HttpResponse.json({ data: mockItems, total: 2 })
        })
      )

      const { result } = renderHook(() => useTestList({ status: 'active' }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: [mockItems[0]], total: 1 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/test-items', () =>
          HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useTestList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error).toBeDefined()
    })
  })

  describe('useDetail', () => {
    it('fetches a single item by id', async () => {
      server.use(
        http.get('/api/v2/test-items/1', () =>
          HttpResponse.json({ data: mockItems[0] })
        )
      )

      const { result } = renderHook(() => useTestDetail('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockItems[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useTestDetail(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreate', () => {
    it('creates a new item via POST', async () => {
      server.use(
        http.post('/api/v2/test-items', async ({ request }) => {
          const body = (await request.json()) as TestCreateInput
          return HttpResponse.json({
            data: { id: '3', ...body },
          })
        })
      )

      const { result } = renderHook(() => useTestCreate(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'Item Three', description: 'Third item' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({
        data: { id: '3', name: 'Item Three', description: 'Third item' },
      })
    })
  })

  describe('useUpdate', () => {
    it('updates an item via PATCH', async () => {
      server.use(
        http.patch('/api/v2/test-items/1', async ({ request }) => {
          const body = (await request.json()) as Partial<TestCreateInput>
          return HttpResponse.json({
            data: { id: '1', name: body.name ?? 'Item One', description: 'Updated' },
          })
        })
      )

      const { result } = renderHook(() => useTestUpdate('1'), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ description: 'Updated' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useDelete', () => {
    it('deletes an item via DELETE', async () => {
      server.use(
        http.delete('/api/v2/test-items/1', () =>
          HttpResponse.json({ success: true })
        )
      )

      const { result } = renderHook(() => useTestDelete(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
