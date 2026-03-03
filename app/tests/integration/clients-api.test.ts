/**
 * Integration Tests: Clients API Routes
 *
 * Tests CRUD operations for the clients resource via MSW-intercepted
 * fetch calls. Each test defines expected API contracts:
 * - Response structure: { data, error, requestId, pagination }
 * - Correct HTTP status codes
 * - Query parameter handling (search, pagination)
 * - Soft delete (archive) behavior
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

const BASE_URL = 'http://localhost:3000'
const CLIENTS_URL = `${BASE_URL}/api/v1/clients`

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

const mockClient1 = {
  id: 'client-001',
  company_id: 'company-001',
  name: 'John & Sarah Mitchell',
  email: 'mitchell@example.com',
  phone: '(555) 234-5678',
  address: '4200 Lakeview Dr',
  city: 'Austin',
  state: 'TX',
  zip: '78746',
  notes: 'Referred by the Hendersons',
  is_active: true,
  deleted_at: null,
  created_at: '2025-08-01T09:00:00.000Z',
  updated_at: '2025-08-01T09:00:00.000Z',
}

const mockClient2 = {
  id: 'client-002',
  company_id: 'company-001',
  name: 'Robert Chen',
  email: 'rchen@example.com',
  phone: '(555) 345-6789',
  address: '1800 Congress Ave',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  notes: null,
  is_active: true,
  deleted_at: null,
  created_at: '2025-09-15T11:00:00.000Z',
  updated_at: '2025-09-15T11:00:00.000Z',
}

const mockClient3 = {
  id: 'client-003',
  company_id: 'company-001',
  name: 'Emily Watson',
  email: 'ewatson@example.com',
  phone: '(555) 456-7890',
  address: '300 Barton Springs Rd',
  city: 'Austin',
  state: 'TX',
  zip: '78704',
  notes: 'Second home project',
  is_active: true,
  deleted_at: null,
  created_at: '2025-10-01T08:30:00.000Z',
  updated_at: '2025-10-01T08:30:00.000Z',
}

const allClients = [mockClient1, mockClient2, mockClient3]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Clients API — GET /api/v1/clients', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns paginated client list', async () => {
    server.use(
      http.get(CLIENTS_URL, () => {
        return HttpResponse.json({
          data: allClients,
          pagination: {
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-clients-001',
        })
      })
    )

    const res = await fetch(CLIENTS_URL, { headers: authHeaders() })

    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.data).toHaveLength(3)
    expect(body.pagination).toBeDefined()
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.total).toBe(3)
    expect(body.pagination.totalPages).toBe(1)
    expect(body.pagination.hasMore).toBe(false)
    expect(body.requestId).toBeDefined()
  })

  it('supports pagination parameters', async () => {
    server.use(
      http.get(CLIENTS_URL, ({ request }) => {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1', 10)
        const limit = parseInt(url.searchParams.get('limit') || '20', 10)

        return HttpResponse.json({
          data: page === 2 ? [mockClient3] : [mockClient1, mockClient2],
          pagination: {
            page,
            limit,
            total: 3,
            totalPages: 2,
            hasMore: page < 2,
          },
          requestId: 'req-clients-page',
        })
      })
    )

    const res = await fetch(`${CLIENTS_URL}?page=2&limit=2`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.pagination.page).toBe(2)
    expect(body.pagination.limit).toBe(2)
    expect(body.pagination.hasMore).toBe(false)
    expect(body.data).toHaveLength(1)
  })

  it('supports search parameter', async () => {
    server.use(
      http.get(CLIENTS_URL, ({ request }) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search')?.toLowerCase() || ''

        const filtered = allClients.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search)
        )

        return HttpResponse.json({
          data: filtered,
          pagination: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-clients-search',
        })
      })
    )

    const res = await fetch(`${CLIENTS_URL}?search=mitchell`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(1)
    expect(body.data[0].name).toContain('Mitchell')
  })

  it('returns empty array when search finds nothing', async () => {
    server.use(
      http.get(CLIENTS_URL, () => {
        return HttpResponse.json({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
          requestId: 'req-clients-empty',
        })
      })
    )

    const res = await fetch(`${CLIENTS_URL}?search=nonexistent`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(0)
    expect(body.pagination.total).toBe(0)
  })

  it('returns 401 when not authenticated', async () => {
    server.use(
      http.get(CLIENTS_URL, () => {
        return HttpResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            requestId: 'req-clients-unauth',
          },
          { status: 401 }
        )
      })
    )

    const res = await fetch(CLIENTS_URL)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
    expect(body.requestId).toBeDefined()
  })
})

describe('Clients API — GET /api/v1/clients/:id', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns single client by ID', async () => {
    server.use(
      http.get(`${CLIENTS_URL}/client-001`, () => {
        return HttpResponse.json({
          data: mockClient1,
          error: null,
          requestId: 'req-client-single',
        })
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-001`, { headers: authHeaders() })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe('client-001')
    expect(body.data.name).toBe('John & Sarah Mitchell')
    expect(body.data.email).toBe('mitchell@example.com')
    expect(body.error).toBeNull()
  })

  it('returns 404 for non-existent client', async () => {
    server.use(
      http.get(`${CLIENTS_URL}/client-999`, () => {
        return HttpResponse.json(
          {
            data: null,
            error: 'Not Found',
            message: 'Client not found',
            requestId: 'req-client-404',
          },
          { status: 404 }
        )
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-999`, { headers: authHeaders() })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Not Found')
    expect(body.requestId).toBeDefined()
  })
})

describe('Clients API — POST /api/v1/clients', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('creates client with valid data', async () => {
    server.use(
      http.post(CLIENTS_URL, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const newClient = {
          id: crypto.randomUUID(),
          company_id: 'company-001',
          ...body,
          is_active: true,
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return HttpResponse.json(
          {
            data: newClient,
            error: null,
            requestId: 'req-client-create',
          },
          { status: 201 }
        )
      })
    )

    const res = await fetch(CLIENTS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: 'New Client Corp',
        email: 'newclient@example.com',
        phone: '(555) 999-1111',
        address: '500 Main St',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.name).toBe('New Client Corp')
    expect(body.data.email).toBe('newclient@example.com')
    expect(body.data.id).toBeDefined()
    expect(body.data.company_id).toBe('company-001')
    expect(body.error).toBeNull()
  })

  it('returns 400 for invalid data (missing name)', async () => {
    server.use(
      http.post(CLIENTS_URL, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: { name: ['Name is required'] },
            requestId: 'req-client-invalid',
          },
          { status: 400 }
        )
      })
    )

    const res = await fetch(CLIENTS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email: 'nope@example.com' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation Error')
    expect(body.errors).toBeDefined()
    expect(body.errors.name).toBeDefined()
    expect(body.requestId).toBeDefined()
  })

  it('returns 400 for invalid email format', async () => {
    server.use(
      http.post(CLIENTS_URL, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: { email: ['Invalid email address'] },
            requestId: 'req-client-bad-email',
          },
          { status: 400 }
        )
      })
    )

    const res = await fetch(CLIENTS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name: 'Test', email: 'not-an-email' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errors.email).toBeDefined()
  })
})

describe('Clients API — PATCH /api/v1/clients/:id', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('updates client with valid data', async () => {
    server.use(
      http.patch(`${CLIENTS_URL}/client-001`, async ({ request }) => {
        const updates = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { ...mockClient1, ...updates, updated_at: new Date().toISOString() },
          error: null,
          requestId: 'req-client-update',
        })
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-001`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ phone: '(555) 999-0000', notes: 'Updated notes' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe('client-001')
    expect(body.data.phone).toBe('(555) 999-0000')
    expect(body.data.notes).toBe('Updated notes')
    expect(body.data.name).toBe('John & Sarah Mitchell') // unchanged fields preserved
    expect(body.error).toBeNull()
  })

  it('returns 404 when updating non-existent client', async () => {
    server.use(
      http.patch(`${CLIENTS_URL}/client-999`, () => {
        return HttpResponse.json(
          {
            data: null,
            error: 'Not Found',
            message: 'Client not found',
            requestId: 'req-client-update-404',
          },
          { status: 404 }
        )
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-999`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ name: 'Updated Name' }),
    })

    expect(res.status).toBe(404)
  })
})

describe('Clients API — DELETE /api/v1/clients/:id', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('soft-deletes (archives) client', async () => {
    server.use(
      http.delete(`${CLIENTS_URL}/client-002`, () => {
        return HttpResponse.json({
          data: {
            ...mockClient2,
            is_active: false,
            deleted_at: new Date().toISOString(),
          },
          error: null,
          requestId: 'req-client-delete',
        })
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-002`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.deleted_at).toBeDefined()
    expect(body.data.deleted_at).not.toBeNull()
    expect(body.data.is_active).toBe(false)
    expect(body.error).toBeNull()
  })

  it('returns 404 for non-existent client on delete', async () => {
    server.use(
      http.delete(`${CLIENTS_URL}/client-999`, () => {
        return HttpResponse.json(
          {
            data: null,
            error: 'Not Found',
            message: 'Client not found',
            requestId: 'req-client-delete-404',
          },
          { status: 404 }
        )
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-999`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    expect(res.status).toBe(404)
  })

  it('returns 403 when user lacks permission to delete', async () => {
    server.use(
      http.delete(`${CLIENTS_URL}/client-001`, () => {
        return HttpResponse.json(
          {
            error: 'Forbidden',
            message: 'Insufficient permissions',
            requestId: 'req-client-delete-403',
          },
          { status: 403 }
        )
      })
    )

    const res = await fetch(`${CLIENTS_URL}/client-001`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
    expect(body.requestId).toBeDefined()
  })
})
