import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useMasterItems,
  useMasterItem,
  useCreateMasterItem,
  useVendorItemPrices,
  usePriceHistory,
  useLaborRates,
  useLaborRate,
  useLaborRateHistory,
} from '@/hooks/use-price-intelligence'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockItems = [
  { id: '1', name: '2x4 Lumber', category: 'lumber', unit_of_measure: 'each', default_unit_price: 5.49 },
  { id: '2', name: 'Drywall 4x8', category: 'drywall', unit_of_measure: 'sheet', default_unit_price: 12.99 },
]

describe('use-price-intelligence hooks', () => {
  describe('useMasterItems', () => {
    it('fetches master items list successfully', async () => {
      server.use(
        http.get('/api/v2/price-intelligence/items', () =>
          HttpResponse.json({ data: mockItems, total: 2 })
        )
      )

      const { result } = renderHook(() => useMasterItems(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockItems, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/price-intelligence/items', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useMasterItems(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useMasterItem', () => {
    it('fetches a single item by id', async () => {
      server.use(
        http.get('/api/v2/price-intelligence/items/1', () =>
          HttpResponse.json({ data: mockItems[0] })
        )
      )

      const { result } = renderHook(() => useMasterItem('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockItems[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useMasterItem(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateMasterItem', () => {
    it('creates a master item via POST', async () => {
      server.use(
        http.post('/api/v2/price-intelligence/items', () =>
          HttpResponse.json({ data: { id: '3', name: 'Concrete Mix' } })
        )
      )

      const { result } = renderHook(() => useCreateMasterItem(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'Concrete Mix', category: 'concrete', unit_of_measure: 'bag', default_unit_price: 8.99 })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useVendorItemPrices', () => {
    it('fetches vendor prices for an item', async () => {
      server.use(
        http.get('/api/v2/price-intelligence/items/1/prices', () =>
          HttpResponse.json({ data: [{ id: 'p1', vendor_id: 'v1', unit_price: 4.99 }], total: 1 })
        )
      )

      const { result } = renderHook(() => useVendorItemPrices('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('does not fetch when item id is null', () => {
      const { result } = renderHook(() => useVendorItemPrices(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useLaborRateHistory', () => {
    it('does not fetch when labor rate id is null', () => {
      const { result } = renderHook(() => useLaborRateHistory(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
