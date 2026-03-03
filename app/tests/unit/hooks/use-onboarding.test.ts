import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useOnboardingSessions,
  useOnboardingSession,
  useCreateOnboardingSession,
  useUpdateOnboardingSession,
  useDeleteOnboardingSession,
  useOnboardingMilestones,
  useCreateOnboardingMilestone,
  useOnboardingReminders,
  useCreateOnboardingReminder,
  useOnboardingChecklists,
  useCreateOnboardingChecklist,
  useSampleDataSets,
  useSampleDataSet,
  useCreateSampleDataSet,
  useUpdateSampleDataSet,
  useDeleteSampleDataSet,
} from '@/hooks/use-onboarding'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Onboarding Sessions (factory-based)
// ---------------------------------------------------------------------------

describe('useOnboardingSessions', () => {
  it('fetches from /api/v2/onboarding', async () => {
    server.use(
      http.get('/api/v2/onboarding', () =>
        HttpResponse.json({ data: [{ id: 'sess-1', status: 'in_progress' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useOnboardingSessions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'sess-1', status: 'in_progress' }], total: 1 })
  })
})

describe('useOnboardingSession', () => {
  it('fetches a single session by id', async () => {
    server.use(
      http.get('/api/v2/onboarding/sess-1', () =>
        HttpResponse.json({ id: 'sess-1', status: 'in_progress' }),
      ),
    )

    const { result } = renderHook(() => useOnboardingSession('sess-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'sess-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useOnboardingSession(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateOnboardingSession', () => {
  it('posts to /api/v2/onboarding', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/onboarding', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'sess-new' })
      }),
    )

    const { result } = renderHook(() => useCreateOnboardingSession(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ total_steps: 5, company_type: 'residential' })
    expect(capturedBody).toMatchObject({ total_steps: 5, company_type: 'residential' })
  })
})

describe('useUpdateOnboardingSession', () => {
  it('patches to /api/v2/onboarding/:id', async () => {
    server.use(
      http.patch('/api/v2/onboarding/sess-1', () =>
        HttpResponse.json({ id: 'sess-1', status: 'completed' }),
      ),
    )

    const { result } = renderHook(() => useUpdateOnboardingSession('sess-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'completed' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteOnboardingSession', () => {
  it('sends DELETE to /api/v2/onboarding/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/onboarding/sess-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteOnboardingSession(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('sess-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Onboarding Milestones (custom hooks)
// ---------------------------------------------------------------------------

describe('useOnboardingMilestones', () => {
  it('fetches milestones for a session', async () => {
    server.use(
      http.get('/api/v2/onboarding/sess-1/milestones', () =>
        HttpResponse.json({ data: [{ id: 'ms-1', name: 'Setup Users' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useOnboardingMilestones('sess-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when sessionId is null', () => {
    const { result } = renderHook(() => useOnboardingMilestones(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateOnboardingMilestone', () => {
  it('posts to /api/v2/onboarding/:id/milestones', async () => {
    server.use(
      http.post('/api/v2/onboarding/sess-1/milestones', () =>
        HttpResponse.json({ id: 'ms-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateOnboardingMilestone('sess-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Import Data', step_number: 3 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Onboarding Reminders (custom hooks)
// ---------------------------------------------------------------------------

describe('useOnboardingReminders', () => {
  it('fetches reminders for a session', async () => {
    server.use(
      http.get('/api/v2/onboarding/sess-1/reminders', () =>
        HttpResponse.json({ data: [{ id: 'rem-1', message: 'Complete setup' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useOnboardingReminders('sess-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when sessionId is null', () => {
    const { result } = renderHook(() => useOnboardingReminders(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateOnboardingReminder', () => {
  it('posts to /api/v2/onboarding/:id/reminders', async () => {
    server.use(
      http.post('/api/v2/onboarding/sess-1/reminders', () =>
        HttpResponse.json({ id: 'rem-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateOnboardingReminder('sess-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ message: 'Add vendors', send_at: '2026-03-10' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Onboarding Checklists (custom hooks)
// ---------------------------------------------------------------------------

describe('useOnboardingChecklists', () => {
  it('fetches checklists for a session', async () => {
    server.use(
      http.get('/api/v2/onboarding/sess-1/checklists', () =>
        HttpResponse.json({ data: [{ id: 'cl-1', title: 'Initial Setup' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useOnboardingChecklists('sess-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when sessionId is null', () => {
    const { result } = renderHook(() => useOnboardingChecklists(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateOnboardingChecklist', () => {
  it('posts to /api/v2/onboarding/:id/checklists', async () => {
    server.use(
      http.post('/api/v2/onboarding/sess-1/checklists', () =>
        HttpResponse.json({ id: 'cl-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateOnboardingChecklist('sess-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ title: 'Team Setup', category: 'users' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Sample Data Sets (factory-based)
// ---------------------------------------------------------------------------

describe('useSampleDataSets', () => {
  it('fetches from /api/v2/onboarding/sample-data', async () => {
    server.use(
      http.get('/api/v2/onboarding/sample-data', () =>
        HttpResponse.json({ data: [{ id: 'sd-1', name: 'Demo Jobs' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useSampleDataSets(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'sd-1', name: 'Demo Jobs' }], total: 1 })
  })
})

describe('useSampleDataSet', () => {
  it('fetches a single sample data set by id', async () => {
    server.use(
      http.get('/api/v2/onboarding/sample-data/sd-1', () =>
        HttpResponse.json({ id: 'sd-1', name: 'Demo Jobs' }),
      ),
    )

    const { result } = renderHook(() => useSampleDataSet('sd-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'sd-1' })
  })
})

describe('useCreateSampleDataSet', () => {
  it('posts to /api/v2/onboarding/sample-data', async () => {
    server.use(
      http.post('/api/v2/onboarding/sample-data', () =>
        HttpResponse.json({ id: 'sd-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateSampleDataSet(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Demo Clients', data_type: 'clients' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateSampleDataSet', () => {
  it('patches to /api/v2/onboarding/sample-data/:id', async () => {
    server.use(
      http.patch('/api/v2/onboarding/sample-data/sd-1', () =>
        HttpResponse.json({ id: 'sd-1', status: 'loaded' }),
      ),
    )

    const { result } = renderHook(() => useUpdateSampleDataSet('sd-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'loaded' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteSampleDataSet', () => {
  it('sends DELETE to /api/v2/onboarding/sample-data/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/onboarding/sample-data/sd-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteSampleDataSet(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('sd-1')
    expect(deleteCalled).toBe(true)
  })
})
