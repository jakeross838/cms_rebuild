import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useInventoryItems,
  useInventoryItem,
  useCreateInventoryItem,
  useInventoryLocations,
  useInventoryLocation,
  useCreateInventoryLocation,
  useInventoryStock,
  useInventoryTransactions,
  useCreateInventoryTransaction,
  useMaterialRequests,
  useMaterialRequest,
  useCreateMaterialRequest,
} from '@/hooks/use-inventory'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockItem = {
  id: 'item-1',
  name: '2x4 Lumber',
  sku: 'LUM-2X4-8',
  category: 'Lumber',
  unit_of_measure: 'each',
  unit_cost: 8.5,
  quantity_on_hand: 250,
  reorder_point: 50,
  is_active: true,
  created_at: '2026-01-10T08:00:00.000Z',
}

const mockLocation = {
  id: 'loc-1',
  name: 'Main Warehouse',
  location_type: 'warehouse',
  address: '123 Industrial Blvd',
  is_active: true,
}

const mockStock = {
  id: 'stock-1',
  item_id: 'item-1',
  location_id: 'loc-1',
  quantity: 250,
}

const mockTransaction = {
  id: 'txn-1',
  item_id: 'item-1',
  to_location_id: 'loc-1',
  transaction_type: 'receive',
  quantity: 100,
  unit_cost: 8.5,
}

const mockMaterialRequest = {
  id: 'mreq-1',
  job_id: 'job-1',
  status: 'pending',
  priority: 'normal',
  needed_by: '2026-02-01',
  notes: null,
}

describe('use-inventory', () => {
  // ── Inventory Items ────────────────────────────────────────────────────

  describe('useInventoryItems (useList)', () => {
    it('fetches a list of inventory items', async () => {
      server.use(
        http.get('/api/v2/inventory/items', () => {
          return HttpResponse.json({
            data: [mockItem],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useInventoryItems(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockItem],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/inventory/items', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useInventoryItems(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useInventoryItem (useDetail)', () => {
    it('fetches a single item by id', async () => {
      server.use(
        http.get('/api/v2/inventory/items/item-1', () => {
          return HttpResponse.json({ data: mockItem })
        })
      )

      const { result } = renderHook(() => useInventoryItem('item-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockItem })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useInventoryItem(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateInventoryItem (useCreate)', () => {
    it('creates an inventory item via POST', async () => {
      server.use(
        http.post('/api/v2/inventory/items', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'item-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateInventoryItem(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        name: 'Drywall Sheet',
        unit_of_measure: 'sheet',
        unit_cost: 12.0,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'item-new',
          name: 'Drywall Sheet',
        },
      })
    })
  })

  // ── Inventory Locations ────────────────────────────────────────────────

  describe('useInventoryLocations (useList)', () => {
    it('fetches a list of locations', async () => {
      server.use(
        http.get('/api/v2/inventory/locations', () => {
          return HttpResponse.json({
            data: [mockLocation],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useInventoryLocations(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockLocation],
        total: 1,
      })
    })
  })

  describe('useInventoryLocation (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useInventoryLocation(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Inventory Stock ────────────────────────────────────────────────────

  describe('useInventoryStock', () => {
    it('fetches stock levels', async () => {
      server.use(
        http.get('/api/v2/inventory/stock', () => {
          return HttpResponse.json({
            data: [mockStock],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useInventoryStock(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockStock],
        total: 1,
      })
    })
  })

  // ── Inventory Transactions ─────────────────────────────────────────────

  describe('useInventoryTransactions', () => {
    it('fetches a list of transactions', async () => {
      server.use(
        http.get('/api/v2/inventory/transactions', () => {
          return HttpResponse.json({
            data: [mockTransaction],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useInventoryTransactions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockTransaction],
        total: 1,
      })
    })
  })

  describe('useCreateInventoryTransaction', () => {
    it('creates a transaction via POST', async () => {
      server.use(
        http.post('/api/v2/inventory/transactions', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'txn-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateInventoryTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        item_id: 'item-1',
        to_location_id: 'loc-1',
        transaction_type: 'receive',
        quantity: 50,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'txn-new',
          transaction_type: 'receive',
        },
      })
    })
  })

  // ── Material Requests ──────────────────────────────────────────────────

  describe('useMaterialRequests (useList)', () => {
    it('fetches a list of material requests', async () => {
      server.use(
        http.get('/api/v2/material-requests', () => {
          return HttpResponse.json({
            data: [mockMaterialRequest],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useMaterialRequests(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockMaterialRequest],
        total: 1,
      })
    })
  })

  describe('useMaterialRequest (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useMaterialRequest(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
