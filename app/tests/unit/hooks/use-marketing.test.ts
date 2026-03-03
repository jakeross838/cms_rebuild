import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  usePortfolioProjects,
  usePortfolioProject,
  useCreatePortfolioProject,
  useUpdatePortfolioProject,
  useDeletePortfolioProject,
  usePortfolioPhotos,
  useCreatePortfolioPhoto,
  useClientReviews,
  useClientReview,
  useCreateClientReview,
  useUpdateClientReview,
  useDeleteClientReview,
  useMarketingCampaigns,
  useMarketingCampaign,
  useCreateMarketingCampaign,
  useCampaignContacts,
  useCreateCampaignContact,
} from '@/hooks/use-marketing'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Portfolio Projects (factory-based)
// ---------------------------------------------------------------------------

describe('usePortfolioProjects', () => {
  it('fetches from /api/v2/marketing/portfolio', async () => {
    server.use(
      http.get('/api/v2/marketing/portfolio', () =>
        HttpResponse.json({ data: [{ id: 'proj-1', title: 'Modern Kitchen' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => usePortfolioProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'proj-1', title: 'Modern Kitchen' }], total: 1 })
  })
})

describe('usePortfolioProject', () => {
  it('fetches a single portfolio project by id', async () => {
    server.use(
      http.get('/api/v2/marketing/portfolio/proj-1', () =>
        HttpResponse.json({ id: 'proj-1', title: 'Modern Kitchen' }),
      ),
    )

    const { result } = renderHook(() => usePortfolioProject('proj-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'proj-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => usePortfolioProject(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreatePortfolioProject', () => {
  it('posts to /api/v2/marketing/portfolio', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/marketing/portfolio', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'proj-new', title: 'Bathroom Remodel' })
      }),
    )

    const { result } = renderHook(() => useCreatePortfolioProject(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ title: 'Bathroom Remodel' })
    expect(capturedBody).toMatchObject({ title: 'Bathroom Remodel' })
  })
})

describe('useUpdatePortfolioProject', () => {
  it('patches to /api/v2/marketing/portfolio/:id', async () => {
    server.use(
      http.patch('/api/v2/marketing/portfolio/proj-1', () =>
        HttpResponse.json({ id: 'proj-1', status: 'published' }),
      ),
    )

    const { result } = renderHook(() => useUpdatePortfolioProject('proj-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'published' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeletePortfolioProject', () => {
  it('sends DELETE to /api/v2/marketing/portfolio/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/marketing/portfolio/proj-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeletePortfolioProject(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('proj-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Portfolio Photos (custom hooks)
// ---------------------------------------------------------------------------

describe('usePortfolioPhotos', () => {
  it('fetches photos for a project', async () => {
    server.use(
      http.get('/api/v2/marketing/portfolio/proj-1/photos', () =>
        HttpResponse.json({ data: [{ id: 'photo-1', url: '/photos/1.jpg' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => usePortfolioPhotos('proj-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when projectId is null', () => {
    const { result } = renderHook(() => usePortfolioPhotos(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreatePortfolioPhoto', () => {
  it('posts to /api/v2/marketing/portfolio/:id/photos', async () => {
    server.use(
      http.post('/api/v2/marketing/portfolio/proj-1/photos', () =>
        HttpResponse.json({ id: 'photo-new' }),
      ),
    )

    const { result } = renderHook(() => useCreatePortfolioPhoto('proj-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ url: '/photos/new.jpg', caption: 'Kitchen' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Client Reviews (factory-based)
// ---------------------------------------------------------------------------

describe('useClientReviews', () => {
  it('fetches from /api/v2/marketing/reviews', async () => {
    server.use(
      http.get('/api/v2/marketing/reviews', () =>
        HttpResponse.json({ data: [{ id: 'rev-1', client_name: 'Smith' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useClientReviews(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'rev-1', client_name: 'Smith' }], total: 1 })
  })
})

describe('useClientReview', () => {
  it('fetches a single review by id', async () => {
    server.use(
      http.get('/api/v2/marketing/reviews/rev-1', () =>
        HttpResponse.json({ id: 'rev-1', client_name: 'Smith' }),
      ),
    )

    const { result } = renderHook(() => useClientReview('rev-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'rev-1' })
  })
})

describe('useCreateClientReview', () => {
  it('posts to /api/v2/marketing/reviews', async () => {
    server.use(
      http.post('/api/v2/marketing/reviews', () =>
        HttpResponse.json({ id: 'rev-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateClientReview(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ client_name: 'Doe', rating: 5, source: 'google' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateClientReview', () => {
  it('patches to /api/v2/marketing/reviews/:id', async () => {
    server.use(
      http.patch('/api/v2/marketing/reviews/rev-1', () =>
        HttpResponse.json({ id: 'rev-1', status: 'approved' }),
      ),
    )

    const { result } = renderHook(() => useUpdateClientReview('rev-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'approved' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteClientReview', () => {
  it('sends DELETE to /api/v2/marketing/reviews/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/marketing/reviews/rev-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteClientReview(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('rev-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Marketing Campaigns (factory-based)
// ---------------------------------------------------------------------------

describe('useMarketingCampaigns', () => {
  it('fetches from /api/v2/marketing/campaigns', async () => {
    server.use(
      http.get('/api/v2/marketing/campaigns', () =>
        HttpResponse.json({ data: [{ id: 'camp-1', name: 'Spring Sale' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useMarketingCampaigns(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'camp-1', name: 'Spring Sale' }], total: 1 })
  })
})

describe('useMarketingCampaign', () => {
  it('fetches a single campaign by id', async () => {
    server.use(
      http.get('/api/v2/marketing/campaigns/camp-1', () =>
        HttpResponse.json({ id: 'camp-1', name: 'Spring Sale' }),
      ),
    )

    const { result } = renderHook(() => useMarketingCampaign('camp-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'camp-1' })
  })
})

describe('useCreateMarketingCampaign', () => {
  it('posts to /api/v2/marketing/campaigns', async () => {
    server.use(
      http.post('/api/v2/marketing/campaigns', () =>
        HttpResponse.json({ id: 'camp-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateMarketingCampaign(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Fall Campaign', campaign_type: 'email' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Campaign Contacts (custom hooks)
// ---------------------------------------------------------------------------

describe('useCampaignContacts', () => {
  it('fetches contacts for a campaign', async () => {
    server.use(
      http.get('/api/v2/marketing/campaigns/camp-1/contacts', () =>
        HttpResponse.json({ data: [{ id: 'cc-1', name: 'John' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useCampaignContacts('camp-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when campaignId is null', () => {
    const { result } = renderHook(() => useCampaignContacts(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateCampaignContact', () => {
  it('posts to /api/v2/marketing/campaigns/:id/contacts', async () => {
    server.use(
      http.post('/api/v2/marketing/campaigns/camp-1/contacts', () =>
        HttpResponse.json({ id: 'cc-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateCampaignContact('camp-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Jane', email: 'jane@example.com' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
