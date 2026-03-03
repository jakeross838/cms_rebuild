import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
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

// ── Daily Logs (standard CRUD from createApiHooks) ───────────────────────────

describe('useDailyLogs', () => {
  it('fetches daily log list successfully', async () => {
    const { useDailyLogs } = await import('@/hooks/use-daily-logs')
    server.use(
      http.get('/api/v1/daily-logs', () => {
        return HttpResponse.json({
          data: [
            { id: 'dl1', job_id: 'j1', log_date: '2026-01-15', status: 'draft' },
            { id: 'dl2', job_id: 'j1', log_date: '2026-01-16', status: 'submitted' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useDailyLogs(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].log_date).toBe('2026-01-15')
  })

  it('handles fetch error', async () => {
    const { useDailyLogs } = await import('@/hooks/use-daily-logs')
    server.use(
      http.get('/api/v1/daily-logs', () => {
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      })
    )
    const { result } = renderHook(() => useDailyLogs(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useDailyLog', () => {
  it('fetches a single daily log by id', async () => {
    const { useDailyLog } = await import('@/hooks/use-daily-logs')
    server.use(
      http.get('/api/v1/daily-logs/dl1', () => {
        return HttpResponse.json({
          data: { id: 'dl1', job_id: 'j1', log_date: '2026-01-15', status: 'draft' },
        })
      })
    )
    const { result } = renderHook(() => useDailyLog('dl1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.log_date).toBe('2026-01-15')
  })

  it('does not fetch when id is null', async () => {
    const { useDailyLog } = await import('@/hooks/use-daily-logs')
    const { result } = renderHook(() => useDailyLog(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateDailyLog', () => {
  it('creates a daily log successfully', async () => {
    const { useCreateDailyLog } = await import('@/hooks/use-daily-logs')
    server.use(
      http.post('/api/v1/daily-logs', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-dl1', job_id: body.job_id, log_date: body.log_date } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateDailyLog(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ job_id: 'j1', log_date: '2026-02-01' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.log_date).toBe('2026-02-01')
  })
})

describe('useDeleteDailyLog', () => {
  it('deletes a daily log successfully', async () => {
    const { useDeleteDailyLog } = await import('@/hooks/use-daily-logs')
    server.use(
      http.delete('/api/v1/daily-logs/dl-del', () => {
        return HttpResponse.json({ data: { id: 'dl-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteDailyLog(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('dl-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Submit Daily Log ─────────────────────────────────────────────────────────

describe('useSubmitDailyLog', () => {
  it('submits a daily log successfully', async () => {
    const { useSubmitDailyLog } = await import('@/hooks/use-daily-logs')
    server.use(
      http.post('/api/v1/daily-logs/dl1/submit', () => {
        return HttpResponse.json({ data: { id: 'dl1', status: 'submitted' } })
      })
    )
    const { result } = renderHook(() => useSubmitDailyLog('dl1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ notes: 'End of day' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Daily Log Entries ────────────────────────────────────────────────────────

describe('useDailyLogEntries', () => {
  it('fetches entries for a daily log', async () => {
    const { useDailyLogEntries } = await import('@/hooks/use-daily-logs')
    server.use(
      http.get('/api/v1/daily-logs/dl1/entries', () => {
        return HttpResponse.json({
          data: [
            { id: 'e1', entry_type: 'note', description: 'Framing started' },
          ],
        })
      })
    )
    const { result } = renderHook(() => useDailyLogEntries('dl1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })

  it('does not fetch when logId is null', async () => {
    const { useDailyLogEntries } = await import('@/hooks/use-daily-logs')
    const { result } = renderHook(() => useDailyLogEntries(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateDailyLogEntry', () => {
  it('creates a log entry successfully', async () => {
    const { useCreateDailyLogEntry } = await import('@/hooks/use-daily-logs')
    server.use(
      http.post('/api/v1/daily-logs/dl1/entries', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-e1', entry_type: body.entry_type, description: body.description } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateDailyLogEntry('dl1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ entry_type: 'note', description: 'Drywall delivered' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Daily Log Labor ──────────────────────────────────────────────────────────

describe('useDailyLogLabor', () => {
  it('fetches labor records for a daily log', async () => {
    const { useDailyLogLabor } = await import('@/hooks/use-daily-logs')
    server.use(
      http.get('/api/v1/daily-logs/dl1/labor', () => {
        return HttpResponse.json({
          data: [
            { id: 'l1', worker_name: 'John Doe', hours_worked: 8 },
          ],
        })
      })
    )
    const { result } = renderHook(() => useDailyLogLabor('dl1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })

  it('does not fetch when logId is null', async () => {
    const { useDailyLogLabor } = await import('@/hooks/use-daily-logs')
    const { result } = renderHook(() => useDailyLogLabor(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateDailyLogLabor', () => {
  it('creates a labor record successfully', async () => {
    const { useCreateDailyLogLabor } = await import('@/hooks/use-daily-logs')
    server.use(
      http.post('/api/v1/daily-logs/dl1/labor', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-l1', worker_name: body.worker_name, hours_worked: body.hours_worked } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateDailyLogLabor('dl1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ worker_name: 'Jane Doe', hours_worked: 8 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
