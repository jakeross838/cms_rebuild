import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useSupportTickets,
  useSupportTicket,
  useCreateSupportTicket,
  useUpdateSupportTicket,
  useDeleteSupportTicket,
  useTicketMessages,
  useCreateTicketMessage,
  useUpdateTicketMessage,
  useKbArticles,
  useKbArticle,
  useCreateKbArticle,
  useUpdateKbArticle,
  useDeleteKbArticle,
  useFeatureRequests,
  useFeatureRequest,
  useCreateFeatureRequest,
  useDeleteFeatureRequest,
  useCreateFeatureRequestVote,
} from '@/hooks/use-support'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Support Tickets (factory-based)
// ---------------------------------------------------------------------------

describe('useSupportTickets', () => {
  it('fetches from /api/v2/support/tickets', async () => {
    server.use(
      http.get('/api/v2/support/tickets', () =>
        HttpResponse.json({ data: [{ id: 't-1', subject: 'Login Issue' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useSupportTickets(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 't-1', subject: 'Login Issue' }], total: 1 })
  })
})

describe('useSupportTicket', () => {
  it('fetches a single ticket by id', async () => {
    server.use(
      http.get('/api/v2/support/tickets/t-1', () =>
        HttpResponse.json({ id: 't-1', subject: 'Login Issue' }),
      ),
    )

    const { result } = renderHook(() => useSupportTicket('t-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 't-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useSupportTicket(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateSupportTicket', () => {
  it('posts to /api/v2/support/tickets', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/support/tickets', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 't-new' })
      }),
    )

    const { result } = renderHook(() => useCreateSupportTicket(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ subject: 'New Issue' })
    expect(capturedBody).toMatchObject({ subject: 'New Issue' })
  })
})

describe('useUpdateSupportTicket', () => {
  it('patches to /api/v2/support/tickets/:id', async () => {
    server.use(
      http.patch('/api/v2/support/tickets/t-1', () =>
        HttpResponse.json({ id: 't-1', status: 'resolved' }),
      ),
    )

    const { result } = renderHook(() => useUpdateSupportTicket('t-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'resolved' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteSupportTicket', () => {
  it('sends DELETE to /api/v2/support/tickets/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/support/tickets/t-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteSupportTicket(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('t-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Ticket Messages (custom hooks)
// ---------------------------------------------------------------------------

describe('useTicketMessages', () => {
  it('fetches messages for a ticket', async () => {
    server.use(
      http.get('/api/v2/support/tickets/t-1/messages', () =>
        HttpResponse.json({ data: [{ id: 'msg-1', body: 'Help needed' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTicketMessages('t-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when ticketId is null', () => {
    const { result } = renderHook(() => useTicketMessages(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateTicketMessage', () => {
  it('posts to /api/v2/support/tickets/:id/messages', async () => {
    server.use(
      http.post('/api/v2/support/tickets/t-1/messages', () =>
        HttpResponse.json({ id: 'msg-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateTicketMessage('t-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ body: 'Follow up message' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateTicketMessage', () => {
  it('patches to /api/v2/support/tickets/:ticketId/messages/:messageId', async () => {
    server.use(
      http.patch('/api/v2/support/tickets/t-1/messages/msg-1', () =>
        HttpResponse.json({ id: 'msg-1', body: 'Updated' }),
      ),
    )

    const { result } = renderHook(() => useUpdateTicketMessage('t-1', 'msg-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ body: 'Updated' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Knowledge Base Articles (factory-based)
// ---------------------------------------------------------------------------

describe('useKbArticles', () => {
  it('fetches from /api/v2/support/kb-articles', async () => {
    server.use(
      http.get('/api/v2/support/kb-articles', () =>
        HttpResponse.json({ data: [{ id: 'kb-1', title: 'Getting Started' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useKbArticles(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'kb-1', title: 'Getting Started' }], total: 1 })
  })
})

describe('useKbArticle', () => {
  it('fetches a single article by id', async () => {
    server.use(
      http.get('/api/v2/support/kb-articles/kb-1', () =>
        HttpResponse.json({ id: 'kb-1', title: 'Getting Started' }),
      ),
    )

    const { result } = renderHook(() => useKbArticle('kb-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'kb-1' })
  })
})

describe('useCreateKbArticle', () => {
  it('posts to /api/v2/support/kb-articles', async () => {
    server.use(
      http.post('/api/v2/support/kb-articles', () =>
        HttpResponse.json({ id: 'kb-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateKbArticle(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ title: 'FAQ', slug: 'faq' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateKbArticle', () => {
  it('patches to /api/v2/support/kb-articles/:id', async () => {
    server.use(
      http.patch('/api/v2/support/kb-articles/kb-1', () =>
        HttpResponse.json({ id: 'kb-1', status: 'published' }),
      ),
    )

    const { result } = renderHook(() => useUpdateKbArticle('kb-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'published' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteKbArticle', () => {
  it('sends DELETE to /api/v2/support/kb-articles/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/support/kb-articles/kb-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteKbArticle(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('kb-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Feature Requests (factory-based)
// ---------------------------------------------------------------------------

describe('useFeatureRequests', () => {
  it('fetches from /api/v2/support/feature-requests', async () => {
    server.use(
      http.get('/api/v2/support/feature-requests', () =>
        HttpResponse.json({ data: [{ id: 'fr-1', title: 'Dark Mode' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useFeatureRequests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'fr-1', title: 'Dark Mode' }], total: 1 })
  })
})

describe('useFeatureRequest', () => {
  it('fetches a single feature request by id', async () => {
    server.use(
      http.get('/api/v2/support/feature-requests/fr-1', () =>
        HttpResponse.json({ id: 'fr-1', title: 'Dark Mode' }),
      ),
    )

    const { result } = renderHook(() => useFeatureRequest('fr-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'fr-1' })
  })
})

describe('useCreateFeatureRequest', () => {
  it('posts to /api/v2/support/feature-requests', async () => {
    server.use(
      http.post('/api/v2/support/feature-requests', () =>
        HttpResponse.json({ id: 'fr-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateFeatureRequest(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ title: 'Mobile App' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteFeatureRequest', () => {
  it('sends DELETE to /api/v2/support/feature-requests/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/support/feature-requests/fr-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteFeatureRequest(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('fr-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Feature Request Votes (custom hook)
// ---------------------------------------------------------------------------

describe('useCreateFeatureRequestVote', () => {
  it('posts to /api/v2/support/feature-requests/:id/votes', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/support/feature-requests/fr-1/votes', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'vote-new' })
      }),
    )

    const { result } = renderHook(() => useCreateFeatureRequestVote('fr-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ vote_type: 'upvote' })
    expect(capturedBody).toMatchObject({ vote_type: 'upvote' })
  })
})
