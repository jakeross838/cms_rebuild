import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useTrainingCourses,
  useTrainingCourse,
  useCreateTrainingCourse,
  useUpdateTrainingCourse,
  useDeleteTrainingCourse,
  useTrainingPaths,
  useTrainingPath,
  useCreateTrainingPath,
  useTrainingPathItems,
  useCreateTrainingPathItem,
  useUpdateTrainingPathItem,
  useDeleteTrainingPathItem,
  useTrainingProgress,
  useTrainingProgressItem,
  useCreateTrainingProgress,
  useTrainingCertifications,
  useTrainingCertification,
  useCreateTrainingCertification,
  useDeleteTrainingCertification,
} from '@/hooks/use-training'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Training Courses (factory-based)
// ---------------------------------------------------------------------------

describe('useTrainingCourses', () => {
  it('fetches from /api/v2/training/courses', async () => {
    server.use(
      http.get('/api/v2/training/courses', () =>
        HttpResponse.json({ data: [{ id: 'c-1', title: 'Safety 101' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTrainingCourses(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'c-1', title: 'Safety 101' }], total: 1 })
  })
})

describe('useTrainingCourse', () => {
  it('fetches a single course by id', async () => {
    server.use(
      http.get('/api/v2/training/courses/c-1', () =>
        HttpResponse.json({ id: 'c-1', title: 'Safety 101' }),
      ),
    )

    const { result } = renderHook(() => useTrainingCourse('c-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'c-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useTrainingCourse(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateTrainingCourse', () => {
  it('posts to /api/v2/training/courses', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/training/courses', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'c-new' })
      }),
    )

    const { result } = renderHook(() => useCreateTrainingCourse(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      title: 'New Course',
      course_type: 'video',
      difficulty: 'beginner',
    })
    expect(capturedBody).toMatchObject({ title: 'New Course', course_type: 'video' })
  })
})

describe('useUpdateTrainingCourse', () => {
  it('patches to /api/v2/training/courses/:id', async () => {
    server.use(
      http.patch('/api/v2/training/courses/c-1', () =>
        HttpResponse.json({ id: 'c-1', is_published: true }),
      ),
    )

    const { result } = renderHook(() => useUpdateTrainingCourse('c-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ is_published: true } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteTrainingCourse', () => {
  it('sends DELETE to /api/v2/training/courses/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/training/courses/c-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteTrainingCourse(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('c-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Training Paths (factory-based)
// ---------------------------------------------------------------------------

describe('useTrainingPaths', () => {
  it('fetches from /api/v2/training/paths', async () => {
    server.use(
      http.get('/api/v2/training/paths', () =>
        HttpResponse.json({ data: [{ id: 'p-1', name: 'Field Worker' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTrainingPaths(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'p-1', name: 'Field Worker' }], total: 1 })
  })
})

describe('useTrainingPath', () => {
  it('fetches a single path by id', async () => {
    server.use(
      http.get('/api/v2/training/paths/p-1', () =>
        HttpResponse.json({ id: 'p-1', name: 'Field Worker' }),
      ),
    )

    const { result } = renderHook(() => useTrainingPath('p-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'p-1' })
  })
})

describe('useCreateTrainingPath', () => {
  it('posts to /api/v2/training/paths', async () => {
    server.use(
      http.post('/api/v2/training/paths', () =>
        HttpResponse.json({ id: 'p-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateTrainingPath(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'PM Path' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Training Path Items (custom hooks)
// ---------------------------------------------------------------------------

describe('useTrainingPathItems', () => {
  it('fetches items for a training path', async () => {
    server.use(
      http.get('/api/v2/training/paths/p-1/items', () =>
        HttpResponse.json({ data: [{ id: 'item-1', course_id: 'c-1' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTrainingPathItems('p-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when pathId is null', () => {
    const { result } = renderHook(() => useTrainingPathItems(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateTrainingPathItem', () => {
  it('posts to /api/v2/training/paths/:id/items', async () => {
    server.use(
      http.post('/api/v2/training/paths/p-1/items', () =>
        HttpResponse.json({ id: 'item-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateTrainingPathItem('p-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ course_id: 'c-1', sort_order: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateTrainingPathItem', () => {
  it('patches to /api/v2/training/paths/:pathId/items/:itemId', async () => {
    server.use(
      http.patch('/api/v2/training/paths/p-1/items/item-1', () =>
        HttpResponse.json({ id: 'item-1', sort_order: 2 }),
      ),
    )

    const { result } = renderHook(() => useUpdateTrainingPathItem('p-1', 'item-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ sort_order: 2 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteTrainingPathItem', () => {
  it('sends DELETE to /api/v2/training/paths/:pathId/items/:itemId', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/training/paths/p-1/items/item-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteTrainingPathItem('p-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('item-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Training Progress (factory-based)
// ---------------------------------------------------------------------------

describe('useTrainingProgress', () => {
  it('fetches from /api/v2/training/progress', async () => {
    server.use(
      http.get('/api/v2/training/progress', () =>
        HttpResponse.json({ data: [{ id: 'prog-1', status: 'in_progress' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTrainingProgress(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'prog-1', status: 'in_progress' }], total: 1 })
  })
})

describe('useTrainingProgressItem', () => {
  it('fetches a single progress item by id', async () => {
    server.use(
      http.get('/api/v2/training/progress/prog-1', () =>
        HttpResponse.json({ id: 'prog-1', status: 'in_progress' }),
      ),
    )

    const { result } = renderHook(() => useTrainingProgressItem('prog-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'prog-1' })
  })
})

describe('useCreateTrainingProgress', () => {
  it('posts to /api/v2/training/progress', async () => {
    server.use(
      http.post('/api/v2/training/progress', () =>
        HttpResponse.json({ id: 'prog-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateTrainingProgress(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ item_type: 'course', item_id: 'c-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Training Certifications (factory-based)
// ---------------------------------------------------------------------------

describe('useTrainingCertifications', () => {
  it('fetches from /api/v2/training/certifications', async () => {
    server.use(
      http.get('/api/v2/training/certifications', () =>
        HttpResponse.json({ data: [{ id: 'cert-1', certification_name: 'OSHA 10' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useTrainingCertifications(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: [{ id: 'cert-1', certification_name: 'OSHA 10' }],
      total: 1,
    })
  })
})

describe('useTrainingCertification', () => {
  it('fetches a single certification by id', async () => {
    server.use(
      http.get('/api/v2/training/certifications/cert-1', () =>
        HttpResponse.json({ id: 'cert-1', certification_name: 'OSHA 10' }),
      ),
    )

    const { result } = renderHook(() => useTrainingCertification('cert-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'cert-1' })
  })
})

describe('useCreateTrainingCertification', () => {
  it('posts to /api/v2/training/certifications', async () => {
    server.use(
      http.post('/api/v2/training/certifications', () =>
        HttpResponse.json({ id: 'cert-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateTrainingCertification(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ certification_name: 'First Aid', certification_level: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteTrainingCertification', () => {
  it('sends DELETE to /api/v2/training/certifications/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/training/certifications/cert-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteTrainingCertification(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('cert-1')
    expect(deleteCalled).toBe(true)
  })
})
