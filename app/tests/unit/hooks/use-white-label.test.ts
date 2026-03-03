import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useBranding,
  useUpdateBranding,
  useCustomDomains,
  useCustomDomain,
  useCreateCustomDomain,
  useEmailConfig,
  useTerminology,
  useTerminologyItem,
  useContentPages,
  useContentPage,
} from '@/hooks/use-white-label'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockDomains = [
  { id: '1', domain: 'app.rosshomes.com', status: 'verified', is_primary: true },
  { id: '2', domain: 'portal.rosshomes.com', status: 'pending', is_primary: false },
]

describe('use-white-label hooks', () => {
  describe('useBranding', () => {
    it('fetches branding settings successfully', async () => {
      server.use(
        http.get('/api/v2/branding', () =>
          HttpResponse.json({ company_name: 'Ross Homes', primary_color: '#1a73e8' })
        )
      )

      const { result } = renderHook(() => useBranding(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ company_name: 'Ross Homes', primary_color: '#1a73e8' })
    })
  })

  describe('useCustomDomains', () => {
    it('fetches custom domains list successfully', async () => {
      server.use(
        http.get('/api/v2/branding/domains', () =>
          HttpResponse.json({ data: mockDomains, total: 2 })
        )
      )

      const { result } = renderHook(() => useCustomDomains(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockDomains, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/branding/domains', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useCustomDomains(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useCustomDomain', () => {
    it('fetches a single domain by id', async () => {
      server.use(
        http.get('/api/v2/branding/domains/1', () =>
          HttpResponse.json({ data: mockDomains[0] })
        )
      )

      const { result } = renderHook(() => useCustomDomain('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockDomains[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useCustomDomain(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateCustomDomain', () => {
    it('creates a custom domain via POST', async () => {
      server.use(
        http.post('/api/v2/branding/domains', () =>
          HttpResponse.json({ data: { id: '3', domain: 'new.rosshomes.com' } })
        )
      )

      const { result } = renderHook(() => useCreateCustomDomain(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ domain: 'new.rosshomes.com' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useContentPage', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useContentPage(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
