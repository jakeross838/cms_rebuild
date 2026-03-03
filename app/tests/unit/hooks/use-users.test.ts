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

describe('useUsers', () => {
  it('fetches user list successfully', async () => {
    const { useUsers } = await import('@/hooks/use-users')
    server.use(
      http.get('/api/v1/users', () => {
        return HttpResponse.json({
          data: [
            { id: 'u1', email: 'alice@test.com', full_name: 'Alice Smith', role: 'admin' },
            { id: 'u2', email: 'bob@test.com', full_name: 'Bob Jones', role: 'pm' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].full_name).toBe('Alice Smith')
  })

  it('handles fetch error', async () => {
    const { useUsers } = await import('@/hooks/use-users')
    server.use(
      http.get('/api/v1/users', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      })
    )
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useUser', () => {
  it('fetches a single user by id', async () => {
    const { useUser } = await import('@/hooks/use-users')
    server.use(
      http.get('/api/v1/users/u1', () => {
        return HttpResponse.json({ data: { id: 'u1', email: 'alice@test.com', full_name: 'Alice Smith' } })
      })
    )
    const { result } = renderHook(() => useUser('u1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.full_name).toBe('Alice Smith')
  })

  it('does not fetch when id is null', async () => {
    const { useUser } = await import('@/hooks/use-users')
    const { result } = renderHook(() => useUser(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateUser', () => {
  it('creates a user successfully', async () => {
    const { useCreateUser } = await import('@/hooks/use-users')
    server.use(
      http.post('/api/v1/users', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-u1', email: body.email, full_name: body.full_name } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ email: 'carol@test.com', full_name: 'Carol White' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.full_name).toBe('Carol White')
  })
})

describe('useDeactivateUser', () => {
  it('deactivates a user successfully', async () => {
    const { useDeactivateUser } = await import('@/hooks/use-users')
    server.use(
      http.post('/api/v1/users/u1/deactivate', () => {
        return HttpResponse.json({ data: { id: 'u1', is_active: false } })
      })
    )
    const { result } = renderHook(() => useDeactivateUser('u1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useReactivateUser', () => {
  it('reactivates a user successfully', async () => {
    const { useReactivateUser } = await import('@/hooks/use-users')
    server.use(
      http.post('/api/v1/users/u1/reactivate', () => {
        return HttpResponse.json({ data: { id: 'u1', is_active: true } })
      })
    )
    const { result } = renderHook(() => useReactivateUser('u1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
