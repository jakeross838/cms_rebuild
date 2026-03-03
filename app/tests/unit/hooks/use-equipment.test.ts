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

// ── Equipment List ──────────────────────────────────────────────────────────

describe('useEquipmentList', () => {
  it('fetches a list of equipment', async () => {
    const mockEquipment = [
      { id: 'eq-1', name: 'Excavator CAT 320', equipment_type: 'heavy', status: 'available' },
      { id: 'eq-2', name: 'Concrete Mixer', equipment_type: 'medium', status: 'in_use' },
    ]

    server.use(
      http.get('/api/v2/equipment', () => {
        return HttpResponse.json({ data: mockEquipment, total: 2 })
      }),
    )

    const { useEquipmentList } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentList(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockEquipment, total: 2 })
  })

  it('handles server error on equipment list', async () => {
    server.use(
      http.get('/api/v2/equipment', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useEquipmentList } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentList(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Equipment Detail ────────────────────────────────────────────────────────

describe('useEquipmentDetail', () => {
  it('fetches a single equipment item by id', async () => {
    const mockItem = { id: 'eq-1', name: 'Excavator CAT 320', equipment_type: 'heavy', status: 'available' }

    server.use(
      http.get('/api/v2/equipment/eq-1', () => {
        return HttpResponse.json({ data: mockItem })
      }),
    )

    const { useEquipmentDetail } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentDetail('eq-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockItem })
  })

  it('does not fetch when id is null', async () => {
    const { useEquipmentDetail } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentDetail(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Equipment ────────────────────────────────────────────────────────

describe('useCreateEquipment', () => {
  it('creates new equipment via POST', async () => {
    const newEquipment = {
      name: 'Skid Steer Loader',
      equipment_type: 'medium',
      ownership_type: 'owned',
      make: 'Bobcat',
      model: 'S650',
      daily_rate: 350,
    }

    server.use(
      http.post('/api/v2/equipment', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'eq-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateEquipment } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useCreateEquipment(), { wrapper: createWrapper() })

    result.current.mutate(newEquipment)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'eq-new', ...newEquipment } })
  })
})

// ── Equipment Assignments (nested) ──────────────────────────────────────────

describe('useEquipmentAssignments', () => {
  it('fetches assignments for equipment', async () => {
    const mockAssignments = [
      { id: 'asgn-1', equipment_id: 'eq-1', job_id: 'job-1', status: 'active' },
    ]

    server.use(
      http.get('/api/v2/equipment/eq-1/assignments', () => {
        return HttpResponse.json({ data: mockAssignments, total: 1 })
      }),
    )

    const { useEquipmentAssignments } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentAssignments('eq-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockAssignments, total: 1 })
  })

  it('does not fetch assignments when equipmentId is null', async () => {
    const { useEquipmentAssignments } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentAssignments(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Equipment Maintenance (nested) ──────────────────────────────────────────

describe('useEquipmentMaintenance', () => {
  it('fetches maintenance records for equipment', async () => {
    const mockMaintenance = [
      { id: 'maint-1', equipment_id: 'eq-1', maintenance_type: 'preventive', status: 'scheduled' },
    ]

    server.use(
      http.get('/api/v2/equipment/eq-1/maintenance', () => {
        return HttpResponse.json({ data: mockMaintenance, total: 1 })
      }),
    )

    const { useEquipmentMaintenance } = await import('@/hooks/use-equipment')
    const { result } = renderHook(() => useEquipmentMaintenance('eq-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockMaintenance, total: 1 })
  })
})
