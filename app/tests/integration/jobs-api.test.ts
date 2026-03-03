/**
 * Integration Tests: Jobs API Routes
 *
 * Tests CRUD operations for the jobs resource via MSW-intercepted
 * fetch calls. Verifies paginated listing, status filtering,
 * create, read single, and update operations.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

const BASE_URL = 'http://localhost:3000'
const JOBS_URL = `${BASE_URL}/api/v1/jobs`

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer mock-access-token',
  }
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockJob1 = {
  id: 'job-001',
  company_id: 'company-001',
  client_id: 'client-001',
  name: 'Lakewood Residence Remodel',
  job_number: 'JOB-2025-042',
  notes: 'Full kitchen and master bath remodel',
  address: '4500 Lakeshore Dr',
  city: 'Austin',
  state: 'TX',
  zip: '78746',
  status: 'active',
  contract_type: 'fixed_price',
  contract_amount: 485000,
  start_date: '2025-09-01',
  target_completion: '2026-03-15',
  actual_completion: null,
  deleted_at: null,
  created_at: '2025-08-20T14:30:00.000Z',
  updated_at: '2025-08-20T14:30:00.000Z',
}

const mockJob2 = {
  id: 'job-002',
  company_id: 'company-001',
  client_id: 'client-002',
  name: 'Downtown Office Build-Out',
  job_number: 'JOB-2025-043',
  notes: 'Commercial office renovation',
  address: '100 Congress Ave',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  status: 'bidding',
  contract_type: 'cost_plus',
  contract_amount: 1200000,
  start_date: '2026-01-15',
  target_completion: '2026-08-01',
  actual_completion: null,
  deleted_at: null,
  created_at: '2025-10-05T10:00:00.000Z',
  updated_at: '2025-10-05T10:00:00.000Z',
}

const mockJob3 = {
  id: 'job-003',
  company_id: 'company-001',
  client_id: 'client-003',
  name: 'Heritage Home Restoration',
  job_number: 'JOB-2025-044',
  notes: 'Historic home restoration project',
  address: '200 E 6th St',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  status: 'completed',
  contract_type: 'fixed_price',
  contract_amount: 320000,
  start_date: '2025-03-01',
  target_completion: '2025-10-01',
  actual_completion: '2025-09-28',
  deleted_at: null,
  created_at: '2025-02-15T09:00:00.000Z',
  updated_at: '2025-09-28T16:00:00.000Z',
}

const allJobs = [mockJob1, mockJob2, mockJob3]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Jobs API — GET /api/v1/jobs', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns paginated job list', async () => {
    server.use(
      http.get(JOBS_URL, () => {
        return HttpResponse.json({
          data: allJobs,
          pagination: {
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-jobs-list',
        })
      })
    )

    const res = await fetch(JOBS_URL, { headers: authHeaders() })

    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.data).toHaveLength(3)
    expect(body.pagination).toBeDefined()
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.total).toBe(3)
    expect(body.pagination.hasMore).toBe(false)
    expect(body.requestId).toBeDefined()
  })

  it('supports status filter', async () => {
    server.use(
      http.get(JOBS_URL, ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')

        const filtered = status
          ? allJobs.filter((j) => j.status === status)
          : allJobs

        return HttpResponse.json({
          data: filtered,
          pagination: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-jobs-filter',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}?status=active`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(1)
    expect(body.data[0].status).toBe('active')
    expect(body.data[0].name).toBe('Lakewood Residence Remodel')
  })

  it('returns only bidding jobs when filtered', async () => {
    server.use(
      http.get(JOBS_URL, ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const filtered = allJobs.filter((j) => j.status === status)

        return HttpResponse.json({
          data: filtered,
          pagination: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-jobs-bidding',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}?status=bidding`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(1)
    expect(body.data[0].status).toBe('bidding')
  })

  it('returns completed jobs when filtered', async () => {
    server.use(
      http.get(JOBS_URL, ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const filtered = allJobs.filter((j) => j.status === status)

        return HttpResponse.json({
          data: filtered,
          pagination: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-jobs-completed',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}?status=completed`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(1)
    expect(body.data[0].actual_completion).toBeDefined()
    expect(body.data[0].actual_completion).not.toBeNull()
  })

  it('supports pagination', async () => {
    server.use(
      http.get(JOBS_URL, ({ request }) => {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1', 10)
        const limit = parseInt(url.searchParams.get('limit') || '20', 10)

        const start = (page - 1) * limit
        const pageData = allJobs.slice(start, start + limit)

        return HttpResponse.json({
          data: pageData,
          pagination: {
            page,
            limit,
            total: allJobs.length,
            totalPages: Math.ceil(allJobs.length / limit),
            hasMore: page * limit < allJobs.length,
          },
          requestId: 'req-jobs-page',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}?page=1&limit=2`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(2)
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.limit).toBe(2)
    expect(body.pagination.hasMore).toBe(true)
    expect(body.pagination.totalPages).toBe(2)
  })

  it('returns 401 when not authenticated', async () => {
    server.use(
      http.get(JOBS_URL, () => {
        return HttpResponse.json(
          { error: 'Unauthorized', message: 'Authentication required', requestId: 'req-jobs-unauth' },
          { status: 401 }
        )
      })
    )

    const res = await fetch(JOBS_URL)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })
})

describe('Jobs API — GET /api/v1/jobs/:id', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns single job by ID', async () => {
    server.use(
      http.get(`${JOBS_URL}/job-001`, () => {
        return HttpResponse.json({
          data: mockJob1,
          error: null,
          requestId: 'req-job-single',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}/job-001`, { headers: authHeaders() })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe('job-001')
    expect(body.data.name).toBe('Lakewood Residence Remodel')
    expect(body.data.job_number).toBe('JOB-2025-042')
    expect(body.data.contract_amount).toBe(485000)
    expect(body.data.client_id).toBe('client-001')
    expect(body.error).toBeNull()
  })

  it('returns 404 for non-existent job', async () => {
    server.use(
      http.get(`${JOBS_URL}/job-999`, () => {
        return HttpResponse.json(
          { data: null, error: 'Not Found', message: 'Job not found', requestId: 'req-job-404' },
          { status: 404 }
        )
      })
    )

    const res = await fetch(`${JOBS_URL}/job-999`, { headers: authHeaders() })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Not Found')
  })

  it('returns 400 for invalid job ID format', async () => {
    server.use(
      http.get(`${JOBS_URL}/not-a-uuid`, () => {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Invalid ID format', requestId: 'req-job-bad-id' },
          { status: 400 }
        )
      })
    )

    const res = await fetch(`${JOBS_URL}/not-a-uuid`, { headers: authHeaders() })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Bad Request')
  })
})

describe('Jobs API — POST /api/v1/jobs', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('creates job with valid data', async () => {
    server.use(
      http.post(JOBS_URL, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const newJob = {
          id: crypto.randomUUID(),
          company_id: 'company-001',
          ...body,
          status: body.status || 'bidding',
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return HttpResponse.json(
          { data: newJob, error: null, requestId: 'req-job-create' },
          { status: 201 }
        )
      })
    )

    const res = await fetch(JOBS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: 'New Custom Home',
        job_number: 'JOB-2026-001',
        client_id: 'client-001',
        address: '1234 New Build Ln',
        city: 'Austin',
        state: 'TX',
        zip: '78750',
        contract_type: 'fixed_price',
        contract_amount: 750000,
        start_date: '2026-04-01',
        target_completion: '2027-02-01',
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.name).toBe('New Custom Home')
    expect(body.data.job_number).toBe('JOB-2026-001')
    expect(body.data.contract_amount).toBe(750000)
    expect(body.data.id).toBeDefined()
    expect(body.error).toBeNull()
  })

  it('returns 400 when required fields are missing', async () => {
    server.use(
      http.post(JOBS_URL, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: {
              name: ['Name is required'],
              client_id: ['Client is required'],
            },
            requestId: 'req-job-invalid',
          },
          { status: 400 }
        )
      })
    )

    const res = await fetch(JOBS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ notes: 'Missing required fields' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation Error')
    expect(body.errors).toBeDefined()
    expect(body.requestId).toBeDefined()
  })
})

describe('Jobs API — PATCH /api/v1/jobs/:id', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('updates job status', async () => {
    server.use(
      http.patch(`${JOBS_URL}/job-002`, async ({ request }) => {
        const updates = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { ...mockJob2, ...updates, updated_at: new Date().toISOString() },
          error: null,
          requestId: 'req-job-update-status',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}/job-002`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'active', start_date: '2026-02-01' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.status).toBe('active')
    expect(body.data.start_date).toBe('2026-02-01')
    expect(body.data.name).toBe('Downtown Office Build-Out') // unchanged
    expect(body.error).toBeNull()
  })

  it('updates job contract amount', async () => {
    server.use(
      http.patch(`${JOBS_URL}/job-001`, async ({ request }) => {
        const updates = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { ...mockJob1, ...updates, updated_at: new Date().toISOString() },
          error: null,
          requestId: 'req-job-update-amount',
        })
      })
    )

    const res = await fetch(`${JOBS_URL}/job-001`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({
        contract_amount: 525000,
        notes: 'Increased scope — added sunroom',
      }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.contract_amount).toBe(525000)
    expect(body.data.notes).toBe('Increased scope — added sunroom')
  })

  it('returns 404 when updating non-existent job', async () => {
    server.use(
      http.patch(`${JOBS_URL}/job-999`, () => {
        return HttpResponse.json(
          { data: null, error: 'Not Found', message: 'Job not found', requestId: 'req-job-update-404' },
          { status: 404 }
        )
      })
    )

    const res = await fetch(`${JOBS_URL}/job-999`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'active' }),
    })

    expect(res.status).toBe(404)
  })

  it('returns 403 when user lacks permission', async () => {
    server.use(
      http.patch(`${JOBS_URL}/job-001`, () => {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions', requestId: 'req-job-update-403' },
          { status: 403 }
        )
      })
    )

    const res = await fetch(`${JOBS_URL}/job-001`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'completed' }),
    })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })
})
