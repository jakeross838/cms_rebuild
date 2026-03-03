import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
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

// ── Bid Packages List ───────────────────────────────────────────────────────

describe('useBidPackages', () => {
  it('fetches a list of bid packages', async () => {
    const mockPackages = [
      { id: 'bp-1', title: 'Plumbing Package', job_id: 'job-1', status: 'open', trade: 'plumbing' },
      { id: 'bp-2', title: 'Electrical Package', job_id: 'job-1', status: 'closed', trade: 'electrical' },
    ]

    server.use(
      http.get('/api/v2/bid-packages', () => {
        return HttpResponse.json({ data: mockPackages, total: 2 })
      }),
    )

    const { useBidPackages } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidPackages(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockPackages, total: 2 })
  })

  it('handles server error on bid packages list', async () => {
    server.use(
      http.get('/api/v2/bid-packages', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useBidPackages } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidPackages(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Bid Package Detail ──────────────────────────────────────────────────────

describe('useBidPackage', () => {
  it('fetches a single bid package by id', async () => {
    const mockPackage = { id: 'bp-1', title: 'Plumbing Package', job_id: 'job-1', status: 'open' }

    server.use(
      http.get('/api/v2/bid-packages/bp-1', () => {
        return HttpResponse.json({ data: mockPackage })
      }),
    )

    const { useBidPackage } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidPackage('bp-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockPackage })
  })

  it('does not fetch when id is null', async () => {
    const { useBidPackage } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidPackage(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Bid Package ──────────────────────────────────────────────────────

describe('useCreateBidPackage', () => {
  it('creates a new bid package via POST', async () => {
    const newPackage = {
      job_id: 'job-1',
      title: 'HVAC Package',
      trade: 'mechanical',
      bid_due_date: '2026-04-15',
      status: 'draft',
    }

    server.use(
      http.post('/api/v2/bid-packages', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'bp-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateBidPackage } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useCreateBidPackage(), { wrapper: createWrapper() })

    result.current.mutate(newPackage)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'bp-new', ...newPackage } })
  })
})

// ── Bid Invitations (nested) ────────────────────────────────────────────────

describe('useBidInvitations', () => {
  it('fetches invitations for a bid package', async () => {
    const mockInvitations = [
      { id: 'inv-1', bid_package_id: 'bp-1', vendor_id: 'v-1', status: 'sent' },
      { id: 'inv-2', bid_package_id: 'bp-1', vendor_id: 'v-2', status: 'viewed' },
    ]

    server.use(
      http.get('/api/v2/bid-packages/bp-1/invitations', () => {
        return HttpResponse.json({ data: mockInvitations, total: 2 })
      }),
    )

    const { useBidInvitations } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidInvitations('bp-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockInvitations, total: 2 })
  })

  it('does not fetch invitations when bidPackageId is null', async () => {
    const { useBidInvitations } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidInvitations(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Bid Responses (nested) ──────────────────────────────────────────────────

describe('useBidResponses', () => {
  it('fetches responses for a bid package', async () => {
    const mockResponses = [
      { id: 'resp-1', bid_package_id: 'bp-1', vendor_id: 'v-1', total_amount: 42000 },
    ]

    server.use(
      http.get('/api/v2/bid-packages/bp-1/responses', () => {
        return HttpResponse.json({ data: mockResponses, total: 1 })
      }),
    )

    const { useBidResponses } = await import('@/hooks/use-bids')
    const { result } = renderHook(() => useBidResponses('bp-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockResponses, total: 1 })
  })
})
