import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useSelections,
  useSelection,
  useCreateSelection,
  useSelectionHistory,
  useSelectionCategories,
  useSelectionCategory,
  useCreateSelectionCategory,
  useSelectionOptions,
  useSelectionOption,
  useCreateSelectionOption,
} from '@/hooks/use-selections'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockSelection = {
  id: 'sel-1',
  category_id: 'cat-1',
  option_id: 'opt-1',
  job_id: 'job-1',
  room: 'Master Bath',
  status: 'confirmed',
  selected_at: '2026-01-18T10:00:00.000Z',
  confirmed_at: '2026-01-20T14:00:00.000Z',
  change_reason: null,
  created_at: '2026-01-18T10:00:00.000Z',
}

const mockCategory = {
  id: 'cat-1',
  job_id: 'job-1',
  name: 'Countertops',
  room: 'Kitchen',
  sort_order: 1,
  pricing_model: 'allowance',
  allowance_amount: 5000,
  status: 'open',
  created_at: '2026-01-10T08:00:00.000Z',
}

const mockOption = {
  id: 'opt-1',
  category_id: 'cat-1',
  name: 'Quartz - Calacatta',
  description: 'Premium quartz countertop',
  unit_price: 85.0,
  quantity: 40,
  source: 'vendor',
  is_recommended: true,
  sort_order: 1,
}

const mockHistory = {
  id: 'hist-1',
  selection_id: 'sel-1',
  action: 'confirmed',
  changed_by: 'user-1',
  created_at: '2026-01-20T14:00:00.000Z',
}

describe('use-selections', () => {
  // ── Selections ─────────────────────────────────────────────────────────

  describe('useSelections (useList)', () => {
    it('fetches a list of selections', async () => {
      server.use(
        http.get('/api/v2/selections', () => {
          return HttpResponse.json({
            data: [mockSelection],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useSelections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockSelection],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/selections', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useSelections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useSelection (useDetail)', () => {
    it('fetches a single selection by id', async () => {
      server.use(
        http.get('/api/v2/selections/sel-1', () => {
          return HttpResponse.json({ data: mockSelection })
        })
      )

      const { result } = renderHook(() => useSelection('sel-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockSelection })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSelection(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateSelection (useCreate)', () => {
    it('creates a selection via POST', async () => {
      server.use(
        http.post('/api/v2/selections', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'sel-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateSelection(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        category_id: 'cat-1',
        option_id: 'opt-2',
        job_id: 'job-1',
        room: 'Kitchen',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'sel-new',
          option_id: 'opt-2',
        },
      })
    })
  })

  // ── Selection History ──────────────────────────────────────────────────

  describe('useSelectionHistory', () => {
    it('fetches history for a selection', async () => {
      server.use(
        http.get('/api/v2/selections/sel-1/history', () => {
          return HttpResponse.json({
            data: [mockHistory],
            total: 1,
          })
        })
      )

      const { result } = renderHook(
        () => useSelectionHistory('sel-1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockHistory],
        total: 1,
      })
    })

    it('does not fetch when selectionId is null', () => {
      const { result } = renderHook(
        () => useSelectionHistory(null),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Selection Categories ───────────────────────────────────────────────

  describe('useSelectionCategories (useList)', () => {
    it('fetches a list of categories', async () => {
      server.use(
        http.get('/api/v2/selections/categories', () => {
          return HttpResponse.json({
            data: [mockCategory],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useSelectionCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockCategory],
        total: 1,
      })
    })
  })

  describe('useSelectionCategory (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSelectionCategory(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateSelectionCategory (useCreate)', () => {
    it('creates a category via POST', async () => {
      server.use(
        http.post('/api/v2/selections/categories', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'cat-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateSelectionCategory(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        name: 'Flooring',
        room: 'Living Room',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'cat-new',
          name: 'Flooring',
        },
      })
    })
  })

  // ── Selection Options ──────────────────────────────────────────────────

  describe('useSelectionOptions (useList)', () => {
    it('fetches a list of options', async () => {
      server.use(
        http.get('/api/v2/selections/options', () => {
          return HttpResponse.json({
            data: [mockOption],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useSelectionOptions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockOption],
        total: 1,
      })
    })
  })

  describe('useSelectionOption (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSelectionOption(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateSelectionOption (useCreate)', () => {
    it('creates an option via POST', async () => {
      server.use(
        http.post('/api/v2/selections/options', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'opt-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateSelectionOption(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        category_id: 'cat-1',
        name: 'Hardwood Oak',
        unit_price: 12.5,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'opt-new',
          name: 'Hardwood Oak',
        },
      })
    })
  })
})
