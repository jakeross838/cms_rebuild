import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useEmployees,
  useEmployee,
  useCreateEmployee,
  useHrCertifications,
  useHrCertification,
  useCreateHrCertification,
  useHrDocuments,
  useHrDocument,
  useCreateHrDocument,
  useDepartments,
  useDepartment,
  useCreateDepartment,
  usePositions,
  usePosition,
  useCreatePosition,
} from '@/hooks/use-hr'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockEmployee = {
  id: 'emp-1',
  first_name: 'John',
  last_name: 'Smith',
  employee_number: 'EMP-001',
  hire_date: '2025-03-01',
  employment_status: 'active',
  employment_type: 'full_time',
  email: 'john.smith@rosshomes.com',
  phone: '(555) 111-2222',
  department_id: 'dept-1',
  position_id: 'pos-1',
  created_at: '2025-03-01T08:00:00.000Z',
}

const mockCertification = {
  id: 'cert-1',
  employee_id: 'emp-1',
  certification_name: 'OSHA 30',
  certification_type: 'safety',
  status: 'active',
  issued_date: '2025-06-01',
  expiration_date: '2027-06-01',
}

const mockDepartment = {
  id: 'dept-1',
  name: 'Field Operations',
  description: 'On-site construction teams',
  is_active: true,
}

const mockPosition = {
  id: 'pos-1',
  title: 'Site Superintendent',
  department_id: 'dept-1',
  is_active: true,
}

describe('use-hr', () => {
  // ── Employees ──────────────────────────────────────────────────────────

  describe('useEmployees (useList)', () => {
    it('fetches a list of employees', async () => {
      server.use(
        http.get('/api/v2/hr/employees', () => {
          return HttpResponse.json({
            data: [mockEmployee],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockEmployee],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/hr/employees', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useEmployee (useDetail)', () => {
    it('fetches a single employee by id', async () => {
      server.use(
        http.get('/api/v2/hr/employees/emp-1', () => {
          return HttpResponse.json({ data: mockEmployee })
        })
      )

      const { result } = renderHook(() => useEmployee('emp-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockEmployee })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useEmployee(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateEmployee (useCreate)', () => {
    it('creates an employee via POST', async () => {
      server.use(
        http.post('/api/v2/hr/employees', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'emp-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        first_name: 'Jane',
        last_name: 'Doe',
        employee_number: 'EMP-002',
        hire_date: '2026-01-15',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'emp-new',
          first_name: 'Jane',
        },
      })
    })
  })

  // ── Certifications ─────────────────────────────────────────────────────

  describe('useHrCertifications (useList)', () => {
    it('fetches a list of certifications', async () => {
      server.use(
        http.get('/api/v2/hr/certifications', () => {
          return HttpResponse.json({
            data: [mockCertification],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useHrCertifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockCertification],
        total: 1,
      })
    })
  })

  describe('useHrCertification (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useHrCertification(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateHrCertification (useCreate)', () => {
    it('creates a certification via POST', async () => {
      server.use(
        http.post('/api/v2/hr/certifications', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'cert-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateHrCertification(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        employee_id: 'emp-1',
        certification_name: 'First Aid',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'cert-new',
          certification_name: 'First Aid',
        },
      })
    })
  })

  // ── Departments ────────────────────────────────────────────────────────

  describe('useDepartments (useList)', () => {
    it('fetches a list of departments', async () => {
      server.use(
        http.get('/api/v2/hr/departments', () => {
          return HttpResponse.json({
            data: [mockDepartment],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockDepartment],
        total: 1,
      })
    })
  })

  describe('useDepartment (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useDepartment(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Positions ──────────────────────────────────────────────────────────

  describe('usePositions (useList)', () => {
    it('fetches a list of positions', async () => {
      server.use(
        http.get('/api/v2/hr/positions', () => {
          return HttpResponse.json({
            data: [mockPosition],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => usePositions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockPosition],
        total: 1,
      })
    })
  })

  describe('usePosition (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => usePosition(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreatePosition (useCreate)', () => {
    it('creates a position via POST', async () => {
      server.use(
        http.post('/api/v2/hr/positions', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'pos-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreatePosition(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        title: 'Project Manager',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'pos-new',
          title: 'Project Manager',
        },
      })
    })
  })
})
