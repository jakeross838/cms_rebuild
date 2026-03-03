import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useSafetyIncidents,
  useSafetyIncident,
  useCreateSafetyIncident,
  useSafetyInspections,
  useSafetyInspection,
  useCreateSafetyInspection,
  useSafetyInspectionItems,
  useCreateSafetyInspectionItem,
  useToolboxTalks,
  useToolboxTalk,
  useCreateToolboxTalk,
  useToolboxTalkAttendees,
  useCreateToolboxTalkAttendee,
} from '@/hooks/use-safety'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockIncident = {
  id: 'inc-1',
  job_id: 'job-1',
  title: 'Slip and Fall',
  incident_date: '2026-01-20',
  severity: 'minor',
  incident_type: 'injury',
  status: 'reported',
  description: 'Worker slipped on wet concrete.',
  osha_recordable: false,
  created_at: '2026-01-20T15:30:00.000Z',
}

const mockSafetyInspection = {
  id: 'si-1',
  job_id: 'job-1',
  title: 'Weekly Safety Walkthrough',
  inspection_date: '2026-01-22',
  inspection_type: 'routine',
  status: 'completed',
  created_at: '2026-01-22T08:00:00.000Z',
}

const mockInspectionItem = {
  id: 'sii-1',
  inspection_id: 'si-1',
  description: 'Hard hats worn by all crew',
  status: 'pass',
}

const mockToolboxTalk = {
  id: 'tt-1',
  job_id: 'job-1',
  title: 'Fall Protection Refresher',
  talk_date: '2026-01-25',
  topic: 'fall_protection',
  status: 'completed',
  duration_minutes: 30,
  created_at: '2026-01-25T07:00:00.000Z',
}

const mockAttendee = {
  id: 'tta-1',
  talk_id: 'tt-1',
  employee_name: 'John Smith',
  signed: true,
}

describe('use-safety', () => {
  // ── Safety Incidents ───────────────────────────────────────────────────

  describe('useSafetyIncidents (useList)', () => {
    it('fetches a list of incidents', async () => {
      server.use(
        http.get('/api/v2/safety/incidents', () => {
          return HttpResponse.json({
            data: [mockIncident],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useSafetyIncidents(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockIncident],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/safety/incidents', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useSafetyIncidents(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useSafetyIncident (useDetail)', () => {
    it('fetches a single incident by id', async () => {
      server.use(
        http.get('/api/v2/safety/incidents/inc-1', () => {
          return HttpResponse.json({ data: mockIncident })
        })
      )

      const { result } = renderHook(() => useSafetyIncident('inc-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockIncident })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSafetyIncident(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateSafetyIncident (useCreate)', () => {
    it('creates an incident via POST', async () => {
      server.use(
        http.post('/api/v2/safety/incidents', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'inc-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateSafetyIncident(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        title: 'Near Miss - Falling Object',
        incident_date: '2026-02-01',
        severity: 'minor',
        incident_type: 'near_miss',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'inc-new',
          title: 'Near Miss - Falling Object',
        },
      })
    })
  })

  // ── Safety Inspections ─────────────────────────────────────────────────

  describe('useSafetyInspections (useList)', () => {
    it('fetches a list of safety inspections', async () => {
      server.use(
        http.get('/api/v2/safety/inspections', () => {
          return HttpResponse.json({
            data: [mockSafetyInspection],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useSafetyInspections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockSafetyInspection],
        total: 1,
      })
    })
  })

  describe('useSafetyInspection (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSafetyInspection(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Safety Inspection Items ────────────────────────────────────────────

  describe('useSafetyInspectionItems', () => {
    it('fetches items for an inspection', async () => {
      server.use(
        http.get('/api/v2/safety/inspections/si-1/items', () => {
          return HttpResponse.json({
            data: [mockInspectionItem],
            total: 1,
          })
        })
      )

      const { result } = renderHook(
        () => useSafetyInspectionItems('si-1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockInspectionItem],
        total: 1,
      })
    })

    it('does not fetch when inspectionId is null', () => {
      const { result } = renderHook(
        () => useSafetyInspectionItems(null),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Toolbox Talks ──────────────────────────────────────────────────────

  describe('useToolboxTalks (useList)', () => {
    it('fetches a list of toolbox talks', async () => {
      server.use(
        http.get('/api/v2/safety/toolbox-talks', () => {
          return HttpResponse.json({
            data: [mockToolboxTalk],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useToolboxTalks(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockToolboxTalk],
        total: 1,
      })
    })
  })

  describe('useToolboxTalk (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useToolboxTalk(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateToolboxTalk (useCreate)', () => {
    it('creates a toolbox talk via POST', async () => {
      server.use(
        http.post('/api/v2/safety/toolbox-talks', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'tt-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateToolboxTalk(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        title: 'Scaffolding Safety',
        talk_date: '2026-02-10',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'tt-new',
          title: 'Scaffolding Safety',
        },
      })
    })
  })

  // ── Toolbox Talk Attendees ─────────────────────────────────────────────

  describe('useToolboxTalkAttendees', () => {
    it('fetches attendees for a talk', async () => {
      server.use(
        http.get('/api/v2/safety/toolbox-talks/tt-1/attendees', () => {
          return HttpResponse.json({
            data: [mockAttendee],
            total: 1,
          })
        })
      )

      const { result } = renderHook(
        () => useToolboxTalkAttendees('tt-1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockAttendee],
        total: 1,
      })
    })

    it('does not fetch when talkId is null', () => {
      const { result } = renderHook(
        () => useToolboxTalkAttendees(null),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
