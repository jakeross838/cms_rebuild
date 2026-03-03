import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useProjectUserRoles,
  useProjectUserRole,
  useCreateProjectUserRole,
  useUpdateProjectUserRole,
  useDeleteProjectUserRole,
} from '@/hooks/use-project-user-roles'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockRoles = [
  { id: '1', job_id: 'j1', user_id: 'u1', role_override: 'pm' },
  { id: '2', job_id: 'j1', user_id: 'u2', role_override: 'superintendent' },
]

describe('use-project-user-roles hooks', () => {
  describe('useProjectUserRoles', () => {
    it('fetches project user roles list successfully', async () => {
      server.use(
        http.get('/api/v2/project-user-roles', () =>
          HttpResponse.json({ data: mockRoles, total: 2 })
        )
      )

      const { result } = renderHook(() => useProjectUserRoles(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockRoles, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/project-user-roles', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useProjectUserRoles(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useProjectUserRole', () => {
    it('fetches a single project user role by id', async () => {
      server.use(
        http.get('/api/v2/project-user-roles/1', () =>
          HttpResponse.json({ data: mockRoles[0] })
        )
      )

      const { result } = renderHook(() => useProjectUserRole('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockRoles[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useProjectUserRole(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateProjectUserRole', () => {
    it('creates a project user role via POST', async () => {
      server.use(
        http.post('/api/v2/project-user-roles', () =>
          HttpResponse.json({ data: { id: '3', job_id: 'j1', user_id: 'u3', role_override: 'field' } })
        )
      )

      const { result } = renderHook(() => useCreateProjectUserRole(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ job_id: 'j1', user_id: 'u3', role_override: 'field' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useUpdateProjectUserRole', () => {
    it('updates a project user role via PATCH', async () => {
      server.use(
        http.patch('/api/v2/project-user-roles/1', () =>
          HttpResponse.json({ data: { id: '1', role_override: 'admin' } })
        )
      )

      const { result } = renderHook(() => useUpdateProjectUserRole('1'), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ role_override: 'admin' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useDeleteProjectUserRole', () => {
    it('deletes a project user role via DELETE', async () => {
      server.use(
        http.delete('/api/v2/project-user-roles/1', () =>
          HttpResponse.json({ success: true })
        )
      )

      const { result } = renderHook(() => useDeleteProjectUserRole(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
