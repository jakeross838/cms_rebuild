import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import { useSearch } from '@/hooks/use-search'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockSearchData = {
  query: 'plumbing',
  groups: [
    {
      entity_type: 'jobs',
      label: 'Jobs',
      results: [
        {
          id: 'job-1',
          entity_type: 'jobs',
          title: 'Plumbing Renovation',
          subtitle: '123 Main St',
          status: 'active',
          url: '/jobs/job-1',
        },
      ],
      total: 1,
    },
  ],
  total: 1,
}

describe('useSearch', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not fetch when query is shorter than 2 characters', () => {
    const { result } = renderHook(() => useSearch({ query: 'a' }), {
      wrapper: createWrapper(),
    })

    expect(result.current.results).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useSearch({ query: 'plumbing', enabled: false }),
      { wrapper: createWrapper() },
    )

    expect(result.current.results).toBeNull()
  })

  it('initializes debouncedQuery with the provided query', () => {
    const { result } = renderHook(() => useSearch({ query: 'plumbing' }), {
      wrapper: createWrapper(),
    })

    // The initial debouncedQuery should match the initial query
    expect(result.current.debouncedQuery).toBe('plumbing')
  })

  it('debounces query changes via useEffect', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useSearch({ query }),
      {
        wrapper: createWrapper(),
        initialProps: { query: 'pl' },
      },
    )

    expect(result.current.debouncedQuery).toBe('pl')

    // Update the query - debounce should delay the update
    rerender({ query: 'plum' })

    // Before 250ms, debouncedQuery should still be the old value
    expect(result.current.debouncedQuery).toBe('pl')

    // Advance past the debounce delay and flush React updates
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(result.current.debouncedQuery).toBe('plum')
  })

  it('returns search results when query is long enough', async () => {
    server.use(
      http.get('/api/v2/search', () => {
        return HttpResponse.json({ data: mockSearchData })
      }),
    )

    const { result } = renderHook(() => useSearch({ query: 'plumbing' }), {
      wrapper: createWrapper(),
    })

    await waitFor(
      () => {
        expect(result.current.results).not.toBeNull()
      },
      { timeout: 3000 },
    )

    expect(result.current.results!.total).toBe(1)
    expect(result.current.results!.groups).toHaveLength(1)
    expect(result.current.results!.groups[0].entity_type).toBe('jobs')
  })

  it('reports isLoading only when query length >= 2', () => {
    const { result } = renderHook(() => useSearch({ query: 'x' }), {
      wrapper: createWrapper(),
    })

    // Short query: isLoading should always be false
    expect(result.current.isLoading).toBe(false)
  })
})
