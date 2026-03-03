import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useLeads,
  useLead,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useLeadActivities,
  useCreateLeadActivity,
  useLeadSources,
  useLeadSource,
  useCreateLeadSource,
  usePipelines,
  usePipeline,
  useCreatePipeline,
  usePipelineStages,
  useCreatePipelineStage,
} from '@/hooks/use-crm'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Leads (factory-based)
// ---------------------------------------------------------------------------

describe('useLeads', () => {
  it('fetches the lead list from /api/v2/crm/leads', async () => {
    server.use(
      http.get('/api/v2/crm/leads', () =>
        HttpResponse.json({ data: [{ id: 'lead-1', first_name: 'John' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useLeads(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'lead-1', first_name: 'John' }], total: 1 })
  })

  it('passes query params as search params', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/v2/crm/leads', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ data: [], total: 0 })
      }),
    )

    const { result } = renderHook(() => useLeads({ status: 'active', page: 1 } as any), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedUrl).toContain('status=active')
    expect(capturedUrl).toContain('page=1')
  })
})

describe('useLead', () => {
  it('fetches a single lead by id', async () => {
    server.use(
      http.get('/api/v2/crm/leads/lead-1', () =>
        HttpResponse.json({ id: 'lead-1', first_name: 'John' }),
      ),
    )

    const { result } = renderHook(() => useLead('lead-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ id: 'lead-1', first_name: 'John' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useLead(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateLead', () => {
  it('posts to /api/v2/crm/leads', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/crm/leads', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'lead-new', first_name: 'Jane' })
      }),
    )

    const { result } = renderHook(() => useCreateLead(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      first_name: 'Jane',
      last_name: 'Doe',
      source: 'website',
    })

    expect(capturedBody).toMatchObject({ first_name: 'Jane', last_name: 'Doe', source: 'website' })
  })
})

describe('useUpdateLead', () => {
  it('patches to /api/v2/crm/leads/:id', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.patch('/api/v2/crm/leads/lead-1', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'lead-1', status: 'qualified' })
      }),
    )

    const { result } = renderHook(() => useUpdateLead('lead-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'qualified' } as any)
    expect(capturedBody).toMatchObject({ status: 'qualified' })
  })
})

describe('useDeleteLead', () => {
  it('sends DELETE to /api/v2/crm/leads/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/crm/leads/lead-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteLead(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('lead-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Lead Activities (custom hooks)
// ---------------------------------------------------------------------------

describe('useLeadActivities', () => {
  it('fetches activities for a lead', async () => {
    server.use(
      http.get('/api/v2/crm/leads/lead-1/activities', () =>
        HttpResponse.json({ data: [{ id: 'act-1', activity_type: 'call' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useLeadActivities('lead-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when leadId is null', () => {
    const { result } = renderHook(() => useLeadActivities(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateLeadActivity', () => {
  it('posts to /api/v2/crm/leads/:id/activities', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/crm/leads/lead-1/activities', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'act-new' })
      }),
    )

    const { result } = renderHook(() => useCreateLeadActivity('lead-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ activity_type: 'email', notes: 'Followed up' })
    expect(capturedBody).toMatchObject({ activity_type: 'email', notes: 'Followed up' })
  })
})

// ---------------------------------------------------------------------------
// Lead Sources (factory-based)
// ---------------------------------------------------------------------------

describe('useLeadSources', () => {
  it('fetches from /api/v2/crm/sources', async () => {
    server.use(
      http.get('/api/v2/crm/sources', () =>
        HttpResponse.json({ data: [{ id: 'src-1', name: 'Website' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useLeadSources(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'src-1', name: 'Website' }], total: 1 })
  })
})

describe('useLeadSource', () => {
  it('fetches a single source by id', async () => {
    server.use(
      http.get('/api/v2/crm/sources/src-1', () =>
        HttpResponse.json({ id: 'src-1', name: 'Website' }),
      ),
    )

    const { result } = renderHook(() => useLeadSource('src-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'src-1' })
  })
})

describe('useCreateLeadSource', () => {
  it('posts to /api/v2/crm/sources', async () => {
    server.use(
      http.post('/api/v2/crm/sources', () =>
        HttpResponse.json({ id: 'src-new', name: 'Referral' }),
      ),
    )

    const { result } = renderHook(() => useCreateLeadSource(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Referral', source_type: 'organic' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Pipelines (factory-based)
// ---------------------------------------------------------------------------

describe('usePipelines', () => {
  it('fetches from /api/v2/crm/pipelines', async () => {
    server.use(
      http.get('/api/v2/crm/pipelines', () =>
        HttpResponse.json({ data: [{ id: 'pipe-1', name: 'Sales' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => usePipelines(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'pipe-1', name: 'Sales' }], total: 1 })
  })
})

describe('usePipeline', () => {
  it('fetches a single pipeline by id', async () => {
    server.use(
      http.get('/api/v2/crm/pipelines/pipe-1', () =>
        HttpResponse.json({ id: 'pipe-1', name: 'Sales' }),
      ),
    )

    const { result } = renderHook(() => usePipeline('pipe-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'pipe-1' })
  })
})

describe('useCreatePipeline', () => {
  it('posts to /api/v2/crm/pipelines', async () => {
    server.use(
      http.post('/api/v2/crm/pipelines', () =>
        HttpResponse.json({ id: 'pipe-new', name: 'New Pipe' }),
      ),
    )

    const { result } = renderHook(() => useCreatePipeline(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'New Pipe' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Pipeline Stages (custom hooks)
// ---------------------------------------------------------------------------

describe('usePipelineStages', () => {
  it('fetches stages for a pipeline', async () => {
    server.use(
      http.get('/api/v2/crm/pipelines/pipe-1/stages', () =>
        HttpResponse.json({ data: [{ id: 'stage-1', name: 'Prospect' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => usePipelineStages('pipe-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when pipelineId is null', () => {
    const { result } = renderHook(() => usePipelineStages(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreatePipelineStage', () => {
  it('posts to /api/v2/crm/pipelines/:id/stages', async () => {
    server.use(
      http.post('/api/v2/crm/pipelines/pipe-1/stages', () =>
        HttpResponse.json({ id: 'stage-new', name: 'Negotiation' }),
      ),
    )

    const { result } = renderHook(() => useCreatePipelineStage('pipe-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Negotiation', sort_order: 3 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
