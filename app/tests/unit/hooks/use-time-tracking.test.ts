import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useTimeEntries,
  useTimeEntry,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
  useClockIn,
  useClockOut,
  useApproveTimeEntry,
  useRejectTimeEntry,
  usePayrollPeriods,
  usePayrollPeriod,
  useCreatePayrollPeriod,
  useUpdatePayrollPeriod,
  useCreatePayrollExport,
  usePayrollExports,
  useLaborRates,
  useLaborRate,
  useCreateLaborRate,
  useUpdateLaborRate,
  useDeleteLaborRate,
} from '@/hooks/use-time-tracking'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Time Entries (factory-based)
// ---------------------------------------------------------------------------

describe('useTimeEntries', () => {
  it('fetches from /api/v2/time-entries', async () => {
    server.use(
      http.get('/api/v2/time-entries', () =>
        HttpResponse.json({ data: [{ id: 'te-1', entry_date: '2026-03-01' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTimeEntries(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: [{ id: 'te-1', entry_date: '2026-03-01' }],
      total: 1,
    })
  })
})

describe('useTimeEntry', () => {
  it('fetches a single time entry by id', async () => {
    server.use(
      http.get('/api/v2/time-entries/te-1', () =>
        HttpResponse.json({ id: 'te-1', entry_date: '2026-03-01' }),
      ),
    )

    const { result } = renderHook(() => useTimeEntry('te-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'te-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useTimeEntry(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateTimeEntry', () => {
  it('posts to /api/v2/time-entries', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/time-entries', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'te-new' })
      }),
    )

    const { result } = renderHook(() => useCreateTimeEntry(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      job_id: 'job-1',
      entry_date: '2026-03-01',
      status: 'pending',
    })
    expect(capturedBody).toMatchObject({ job_id: 'job-1', entry_date: '2026-03-01' })
  })
})

describe('useUpdateTimeEntry', () => {
  it('patches to /api/v2/time-entries/:id', async () => {
    server.use(
      http.patch('/api/v2/time-entries/te-1', () =>
        HttpResponse.json({ id: 'te-1', regular_hours: 8 }),
      ),
    )

    const { result } = renderHook(() => useUpdateTimeEntry('te-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ regular_hours: 8 } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteTimeEntry', () => {
  it('sends DELETE to /api/v2/time-entries/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/time-entries/te-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteTimeEntry(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('te-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Clock In / Out (custom hooks)
// ---------------------------------------------------------------------------

describe('useClockIn', () => {
  it('posts to /api/v2/time-entries/clock-in', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/time-entries/clock-in', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'te-clock' })
      }),
    )

    const { result } = renderHook(() => useClockIn(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ job_id: 'job-1' })
    expect(capturedBody).toMatchObject({ job_id: 'job-1' })
  })
})

describe('useClockOut', () => {
  it('posts to /api/v2/time-entries/clock-out', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/time-entries/clock-out', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'te-clock' })
      }),
    )

    const { result } = renderHook(() => useClockOut(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ time_entry_id: 'te-1', notes: 'Done for the day' })
    expect(capturedBody).toMatchObject({ time_entry_id: 'te-1', notes: 'Done for the day' })
  })
})

// ---------------------------------------------------------------------------
// Time Entry Approval (custom hooks)
// ---------------------------------------------------------------------------

describe('useApproveTimeEntry', () => {
  it('posts approval to /api/v2/time-entries/:id/approve', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/time-entries/te-1/approve', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useApproveTimeEntry('te-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ notes: 'Looks good' })
    expect(capturedBody).toMatchObject({ decision: 'approved', notes: 'Looks good' })
  })
})

describe('useRejectTimeEntry', () => {
  it('posts rejection to /api/v2/time-entries/:id/approve', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/time-entries/te-1/approve', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useRejectTimeEntry('te-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ rejection_reason: 'Missing cost code' })
    expect(capturedBody).toMatchObject({
      decision: 'rejected',
      rejection_reason: 'Missing cost code',
    })
  })
})

// ---------------------------------------------------------------------------
// Payroll Periods (factory-based)
// ---------------------------------------------------------------------------

describe('usePayrollPeriods', () => {
  it('fetches from /api/v2/payroll/periods', async () => {
    server.use(
      http.get('/api/v2/payroll/periods', () =>
        HttpResponse.json({
          data: [{ id: 'pp-1', period_start: '2026-03-01' }],
          total: 1,
        }),
      ),
    )

    const { result } = renderHook(() => usePayrollPeriods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: [{ id: 'pp-1', period_start: '2026-03-01' }],
      total: 1,
    })
  })
})

describe('usePayrollPeriod', () => {
  it('fetches a single payroll period by id', async () => {
    server.use(
      http.get('/api/v2/payroll/periods/pp-1', () =>
        HttpResponse.json({ id: 'pp-1', period_start: '2026-03-01' }),
      ),
    )

    const { result } = renderHook(() => usePayrollPeriod('pp-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'pp-1' })
  })
})

describe('useCreatePayrollPeriod', () => {
  it('posts to /api/v2/payroll/periods', async () => {
    server.use(
      http.post('/api/v2/payroll/periods', () =>
        HttpResponse.json({ id: 'pp-new' }),
      ),
    )

    const { result } = renderHook(() => useCreatePayrollPeriod(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      period_start: '2026-03-01',
      period_end: '2026-03-15',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdatePayrollPeriod', () => {
  it('patches to /api/v2/payroll/periods/:id', async () => {
    server.use(
      http.patch('/api/v2/payroll/periods/pp-1', () =>
        HttpResponse.json({ id: 'pp-1', status: 'closed' }),
      ),
    )

    const { result } = renderHook(() => useUpdatePayrollPeriod('pp-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'closed' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Payroll Exports (custom hooks)
// ---------------------------------------------------------------------------

describe('useCreatePayrollExport', () => {
  it('posts to /api/v2/payroll/exports', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/payroll/exports', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'exp-new' })
      }),
    )

    const { result } = renderHook(() => useCreatePayrollExport(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      payroll_period_id: 'pp-1',
      export_format: 'csv',
    })
    expect(capturedBody).toMatchObject({ payroll_period_id: 'pp-1', export_format: 'csv' })
  })
})

describe('usePayrollExports', () => {
  it('fetches from /api/v2/payroll/exports', async () => {
    server.use(
      http.get('/api/v2/payroll/exports', () =>
        HttpResponse.json({ data: [{ id: 'exp-1', export_format: 'csv' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => usePayrollExports(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Labor Rates (factory-based)
// ---------------------------------------------------------------------------

describe('useLaborRates', () => {
  it('fetches from /api/v2/labor-rates', async () => {
    server.use(
      http.get('/api/v2/labor-rates', () =>
        HttpResponse.json({ data: [{ id: 'lr-1', hourly_rate: 45 }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useLaborRates(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'lr-1', hourly_rate: 45 }], total: 1 })
  })
})

describe('useLaborRate', () => {
  it('fetches a single labor rate by id', async () => {
    server.use(
      http.get('/api/v2/labor-rates/lr-1', () =>
        HttpResponse.json({ id: 'lr-1', hourly_rate: 45 }),
      ),
    )

    const { result } = renderHook(() => useLaborRate('lr-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'lr-1' })
  })
})

describe('useCreateLaborRate', () => {
  it('posts to /api/v2/labor-rates', async () => {
    server.use(
      http.post('/api/v2/labor-rates', () =>
        HttpResponse.json({ id: 'lr-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateLaborRate(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      rate_type: 'standard',
      hourly_rate: 50,
      effective_date: '2026-03-01',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateLaborRate', () => {
  it('patches to /api/v2/labor-rates/:id', async () => {
    server.use(
      http.patch('/api/v2/labor-rates/lr-1', () =>
        HttpResponse.json({ id: 'lr-1', hourly_rate: 55 }),
      ),
    )

    const { result } = renderHook(() => useUpdateLaborRate('lr-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ hourly_rate: 55 } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteLaborRate', () => {
  it('sends DELETE to /api/v2/labor-rates/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/labor-rates/lr-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteLaborRate(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('lr-1')
    expect(deleteCalled).toBe(true)
  })
})
