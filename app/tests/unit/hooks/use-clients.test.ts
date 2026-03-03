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

describe('useClients', () => {
  it('fetches client list successfully', async () => {
    const { useClients } = await import('@/hooks/use-clients')
    server.use(
      http.get('/api/v1/clients', () => {
        return HttpResponse.json({
          data: [
            { id: '1', name: 'Acme Corp', email: 'acme@example.com' },
            { id: '2', name: 'Beta LLC', email: 'beta@example.com' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].name).toBe('Acme Corp')
  })

  it('handles fetch error', async () => {
    const { useClients } = await import('@/hooks/use-clients')
    server.use(
      http.get('/api/v1/clients', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      })
    )
    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useClient', () => {
  it('fetches a single client by id', async () => {
    const { useClient } = await import('@/hooks/use-clients')
    server.use(
      http.get('/api/v1/clients/c1', () => {
        return HttpResponse.json({ data: { id: 'c1', name: 'Detail Client' } })
      })
    )
    const { result } = renderHook(() => useClient('c1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('Detail Client')
  })

  it('does not fetch when id is null', async () => {
    const { useClient } = await import('@/hooks/use-clients')
    const { result } = renderHook(() => useClient(null), { wrapper: createWrapper() })
    // Query should remain idle / not fetching when disabled
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateClient', () => {
  it('creates a client successfully', async () => {
    const { useCreateClient } = await import('@/hooks/use-clients')
    server.use(
      http.post('/api/v1/clients', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: { id: 'new-1', name: body.name } }, { status: 201 })
      })
    )
    const { result } = renderHook(() => useCreateClient(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ name: 'New Client', email: 'new@test.com' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('New Client')
  })
})

describe('useDeleteClient', () => {
  it('deletes a client successfully', async () => {
    const { useDeleteClient } = await import('@/hooks/use-clients')
    server.use(
      http.delete('/api/v1/clients/del-1', () => {
        return HttpResponse.json({ data: { id: 'del-1', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteClient(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('del-1')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
