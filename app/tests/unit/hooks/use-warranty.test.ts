import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useWarranties,
  useWarranty,
  useCreateWarranty,
  useUpdateWarranty,
  useDeleteWarranty,
  useWarrantyClaims,
  useWarrantyClaim,
  useCreateWarrantyClaim,
  useUpdateWarrantyClaim,
  useResolveWarrantyClaim,
  useWarrantyClaimHistory,
  useMaintenanceSchedules,
  useMaintenanceSchedule,
  useCreateMaintenanceSchedule,
  useUpdateMaintenanceSchedule,
  useDeleteMaintenanceSchedule,
  useCompleteMaintenanceTask,
  useWarrantyClaimFlat,
  useUpdateWarrantyClaimFlat,
  useCreateWarrantyClaimFlat,
} from '@/hooks/use-warranty'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Warranties (factory-based)
// ---------------------------------------------------------------------------

describe('useWarranties', () => {
  it('fetches from /api/v2/warranties', async () => {
    server.use(
      http.get('/api/v2/warranties', () =>
        HttpResponse.json({ data: [{ id: 'w-1', title: 'Roof Warranty' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useWarranties(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: [{ id: 'w-1', title: 'Roof Warranty' }],
      total: 1,
    })
  })
})

describe('useWarranty', () => {
  it('fetches a single warranty by id', async () => {
    server.use(
      http.get('/api/v2/warranties/w-1', () =>
        HttpResponse.json({ id: 'w-1', title: 'Roof Warranty' }),
      ),
    )

    const { result } = renderHook(() => useWarranty('w-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'w-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useWarranty(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateWarranty', () => {
  it('posts to /api/v2/warranties', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/warranties', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'w-new' })
      }),
    )

    const { result } = renderHook(() => useCreateWarranty(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      job_id: 'job-1',
      title: 'HVAC Warranty',
      warranty_type: 'manufacturer',
      start_date: '2026-01-01',
      end_date: '2027-01-01',
    })
    expect(capturedBody).toMatchObject({
      job_id: 'job-1',
      title: 'HVAC Warranty',
      warranty_type: 'manufacturer',
    })
  })
})

describe('useUpdateWarranty', () => {
  it('patches to /api/v2/warranties/:id', async () => {
    server.use(
      http.patch('/api/v2/warranties/w-1', () =>
        HttpResponse.json({ id: 'w-1', status: 'expired' }),
      ),
    )

    const { result } = renderHook(() => useUpdateWarranty('w-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'expired' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteWarranty', () => {
  it('sends DELETE to /api/v2/warranties/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/warranties/w-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteWarranty(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('w-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Warranty Claims (custom hooks)
// ---------------------------------------------------------------------------

describe('useWarrantyClaims', () => {
  it('fetches claims for a warranty', async () => {
    server.use(
      http.get('/api/v2/warranties/w-1/claims', () =>
        HttpResponse.json({ data: [{ id: 'cl-1', status: 'open' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useWarrantyClaims('w-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when warrantyId is null', () => {
    const { result } = renderHook(() => useWarrantyClaims(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useWarrantyClaim', () => {
  it('fetches a single claim by warrantyId and claimId', async () => {
    server.use(
      http.get('/api/v2/warranties/w-1/claims/cl-1', () =>
        HttpResponse.json({ id: 'cl-1', status: 'open' }),
      ),
    )

    const { result } = renderHook(() => useWarrantyClaim('w-1', 'cl-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'cl-1' })
  })

  it('does not fetch when warrantyId is null', () => {
    const { result } = renderHook(() => useWarrantyClaim(null, 'cl-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('does not fetch when claimId is null', () => {
    const { result } = renderHook(() => useWarrantyClaim('w-1', null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateWarrantyClaim', () => {
  it('posts to /api/v2/warranties/:id/claims', async () => {
    server.use(
      http.post('/api/v2/warranties/w-1/claims', () =>
        HttpResponse.json({ id: 'cl-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateWarrantyClaim('w-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ description: 'Leak in roof', priority: 'high' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateWarrantyClaim', () => {
  it('patches to /api/v2/warranties/:warrantyId/claims/:claimId', async () => {
    server.use(
      http.patch('/api/v2/warranties/w-1/claims/cl-1', () =>
        HttpResponse.json({ id: 'cl-1', status: 'in_progress' }),
      ),
    )

    const { result } = renderHook(() => useUpdateWarrantyClaim('w-1', 'cl-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'in_progress' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useResolveWarrantyClaim', () => {
  it('posts to /api/v2/warranties/:warrantyId/claims/:claimId/resolve', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/warranties/w-1/claims/cl-1/resolve', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useResolveWarrantyClaim('w-1', 'cl-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ resolution_notes: 'Repaired by contractor' })
    expect(capturedBody).toMatchObject({ resolution_notes: 'Repaired by contractor' })
  })
})

// ---------------------------------------------------------------------------
// Warranty Claim History (custom hook)
// ---------------------------------------------------------------------------

describe('useWarrantyClaimHistory', () => {
  it('fetches claim history', async () => {
    server.use(
      http.get('/api/v2/warranties/w-1/claims/cl-1/history', () =>
        HttpResponse.json({
          data: [{ id: 'hist-1', action: 'status_changed' }],
          total: 1,
        }),
      ),
    )

    const { result } = renderHook(() => useWarrantyClaimHistory('w-1', 'cl-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when warrantyId is null', () => {
    const { result } = renderHook(() => useWarrantyClaimHistory(null, 'cl-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('does not fetch when claimId is null', () => {
    const { result } = renderHook(() => useWarrantyClaimHistory('w-1', null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ---------------------------------------------------------------------------
// Maintenance Schedules (factory-based)
// ---------------------------------------------------------------------------

describe('useMaintenanceSchedules', () => {
  it('fetches from /api/v2/maintenance-schedules', async () => {
    server.use(
      http.get('/api/v2/maintenance-schedules', () =>
        HttpResponse.json({
          data: [{ id: 'ms-1', title: 'HVAC Filter Change' }],
          total: 1,
        }),
      ),
    )

    const { result } = renderHook(() => useMaintenanceSchedules(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: [{ id: 'ms-1', title: 'HVAC Filter Change' }],
      total: 1,
    })
  })
})

describe('useMaintenanceSchedule', () => {
  it('fetches a single schedule by id', async () => {
    server.use(
      http.get('/api/v2/maintenance-schedules/ms-1', () =>
        HttpResponse.json({ id: 'ms-1', title: 'HVAC Filter Change' }),
      ),
    )

    const { result } = renderHook(() => useMaintenanceSchedule('ms-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'ms-1' })
  })
})

describe('useCreateMaintenanceSchedule', () => {
  it('posts to /api/v2/maintenance-schedules', async () => {
    server.use(
      http.post('/api/v2/maintenance-schedules', () =>
        HttpResponse.json({ id: 'ms-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateMaintenanceSchedule(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      job_id: 'job-1',
      title: 'Gutter Cleaning',
      frequency: 'quarterly',
      start_date: '2026-04-01',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateMaintenanceSchedule', () => {
  it('patches to /api/v2/maintenance-schedules/:id', async () => {
    server.use(
      http.patch('/api/v2/maintenance-schedules/ms-1', () =>
        HttpResponse.json({ id: 'ms-1', is_active: false }),
      ),
    )

    const { result } = renderHook(() => useUpdateMaintenanceSchedule('ms-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ is_active: false } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteMaintenanceSchedule', () => {
  it('sends DELETE to /api/v2/maintenance-schedules/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/maintenance-schedules/ms-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteMaintenanceSchedule(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('ms-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Complete Maintenance Task (custom hook)
// ---------------------------------------------------------------------------

describe('useCompleteMaintenanceTask', () => {
  it('posts to /api/v2/maintenance-schedules/:scheduleId/tasks/:taskId/complete', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post(
        '/api/v2/maintenance-schedules/ms-1/tasks/task-1/complete',
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ success: true })
        },
      ),
    )

    const { result } = renderHook(() => useCompleteMaintenanceTask('ms-1', 'task-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ completed_by: 'user-1', notes: 'Filter replaced' })
    expect(capturedBody).toMatchObject({ completed_by: 'user-1', notes: 'Filter replaced' })
  })
})

// ---------------------------------------------------------------------------
// Flat Warranty Claims (custom hooks)
// ---------------------------------------------------------------------------

describe('useWarrantyClaimFlat', () => {
  it('fetches from /api/v2/warranty-claims/:id', async () => {
    server.use(
      http.get('/api/v2/warranty-claims/cl-1', () =>
        HttpResponse.json({ id: 'cl-1', status: 'open' }),
      ),
    )

    const { result } = renderHook(() => useWarrantyClaimFlat('cl-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'cl-1' })
  })

  it('does not fetch when claimId is null', () => {
    const { result } = renderHook(() => useWarrantyClaimFlat(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useUpdateWarrantyClaimFlat', () => {
  it('patches to /api/v2/warranty-claims/:id', async () => {
    server.use(
      http.patch('/api/v2/warranty-claims/cl-1', () =>
        HttpResponse.json({ id: 'cl-1', status: 'resolved' }),
      ),
    )

    const { result } = renderHook(() => useUpdateWarrantyClaimFlat('cl-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'resolved' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useCreateWarrantyClaimFlat', () => {
  it('posts to /api/v2/warranty-claims', async () => {
    server.use(
      http.post('/api/v2/warranty-claims', () =>
        HttpResponse.json({ id: 'cl-flat-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateWarrantyClaimFlat(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ warranty_id: 'w-1', description: 'Leak' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
