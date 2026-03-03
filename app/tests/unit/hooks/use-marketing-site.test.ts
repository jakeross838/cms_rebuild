import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useMarketingLeads,
  useMarketingLead,
  useCreateMarketingLead,
  useReferrals,
  useTestimonials,
  useTestimonial,
  useCaseStudies,
  useBlogPosts,
  useBlogPost,
} from '@/hooks/use-marketing-site'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockLeads = [
  { id: '1', name: 'John Smith', email: 'john@example.com', source: 'website' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', source: 'referral' },
]

describe('use-marketing-site hooks', () => {
  describe('useMarketingLeads', () => {
    it('fetches leads list successfully', async () => {
      server.use(
        http.get('/api/v2/marketing-site/leads', () =>
          HttpResponse.json({ data: mockLeads, total: 2 })
        )
      )

      const { result } = renderHook(() => useMarketingLeads(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockLeads, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/marketing-site/leads', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useMarketingLeads(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useMarketingLead', () => {
    it('fetches a single lead by id', async () => {
      server.use(
        http.get('/api/v2/marketing-site/leads/1', () =>
          HttpResponse.json({ data: mockLeads[0] })
        )
      )

      const { result } = renderHook(() => useMarketingLead('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockLeads[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useMarketingLead(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateMarketingLead', () => {
    it('creates a lead via POST', async () => {
      server.use(
        http.post('/api/v2/marketing-site/leads', () =>
          HttpResponse.json({ data: { id: '3', name: 'New Lead', email: 'new@example.com' } })
        )
      )

      const { result } = renderHook(() => useCreateMarketingLead(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'New Lead', email: 'new@example.com', source: 'website' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useTestimonial', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useTestimonial(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useBlogPost', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useBlogPost(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
