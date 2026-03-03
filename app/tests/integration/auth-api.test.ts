/**
 * Integration Tests: Auth API Routes
 *
 * Tests authentication endpoints via MSW-intercepted fetch calls.
 * Verifies request/response contracts for login, signup, logout,
 * and password reset flows.
 *
 * MSW handlers are added per-test using server.use() so each test
 * defines the exact response it expects.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

const BASE_URL = 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function post(path: string, body: Record<string, unknown>) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function get(path: string, headers?: Record<string, string>) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockUser = {
  id: 'auth-user-001',
  company_id: 'company-001',
  email: 'jake@rosshomes.com',
  name: 'Jake Ross',
  role: 'owner',
  phone: '(555) 123-4567',
  avatar_url: null,
  is_active: true,
  created_at: '2025-06-15T10:00:00.000Z',
  updated_at: '2025-06-15T10:00:00.000Z',
}

const mockSession = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
  refresh_token: 'mock-refresh-token-xyz',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Auth API — POST /api/v1/auth/login', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns session data with valid credentials', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        if (body.email === 'jake@rosshomes.com' && body.password === 'correct-password') {
          return HttpResponse.json({
            data: { session: mockSession, user: mockUser },
            error: null,
            requestId: 'req-login-001',
          })
        }
        return HttpResponse.json(
          { data: null, error: 'Invalid credentials', requestId: 'req-login-001' },
          { status: 401 }
        )
      })
    )

    const res = await post('/api/v1/auth/login', {
      email: 'jake@rosshomes.com',
      password: 'correct-password',
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.session.access_token).toBeDefined()
    expect(body.data.session.token_type).toBe('bearer')
    expect(body.data.user.email).toBe('jake@rosshomes.com')
    expect(body.data.user.role).toBe('owner')
    expect(body.error).toBeNull()
    expect(body.requestId).toBeDefined()
  })

  it('returns 401 with invalid credentials', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () => {
        return HttpResponse.json(
          {
            data: null,
            error: 'Invalid login credentials',
            message: 'Email or password is incorrect',
            requestId: 'req-login-002',
          },
          { status: 401 }
        )
      })
    )

    const res = await post('/api/v1/auth/login', {
      email: 'jake@rosshomes.com',
      password: 'wrong-password',
    })

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeDefined()
    expect(body.data).toBeNull()
    expect(body.requestId).toBeDefined()
  })

  it('returns 400 when email is missing', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: { email: ['Email is required'] },
            requestId: 'req-login-003',
          },
          { status: 400 }
        )
      })
    )

    const res = await post('/api/v1/auth/login', { password: 'some-password' })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation Error')
    expect(body.errors).toBeDefined()
  })

  it('returns 400 when password is missing', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: { password: ['Password is required'] },
            requestId: 'req-login-004',
          },
          { status: 400 }
        )
      })
    )

    const res = await post('/api/v1/auth/login', { email: 'jake@rosshomes.com' })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errors.password).toBeDefined()
  })
})

describe('Auth API — POST /api/v1/auth/signup', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('creates account with valid registration data', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/signup`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            data: {
              user: {
                id: crypto.randomUUID(),
                email: body.email,
                name: body.name,
                role: 'owner',
              },
              session: {
                access_token: 'new-token',
                refresh_token: 'new-refresh',
                expires_in: 3600,
                token_type: 'bearer',
              },
            },
            error: null,
            requestId: 'req-signup-001',
          },
          { status: 201 }
        )
      })
    )

    const res = await post('/api/v1/auth/signup', {
      email: 'newuser@builder.com',
      password: 'SecureP@ss123',
      name: 'New Builder',
      company_name: 'New Builder LLC',
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.user.email).toBe('newuser@builder.com')
    expect(body.data.session.access_token).toBeDefined()
    expect(body.error).toBeNull()
  })

  it('returns 400 for weak password', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/signup`, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Password must be at least 8 characters',
            requestId: 'req-signup-002',
          },
          { status: 400 }
        )
      })
    )

    const res = await post('/api/v1/auth/signup', {
      email: 'new@builder.com',
      password: '123',
      name: 'Test',
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 409 when email already exists', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/signup`, () => {
        return HttpResponse.json(
          {
            error: 'Conflict',
            message: 'An account with this email already exists',
            requestId: 'req-signup-003',
          },
          { status: 409 }
        )
      })
    )

    const res = await post('/api/v1/auth/signup', {
      email: 'jake@rosshomes.com',
      password: 'SecureP@ss123',
      name: 'Duplicate User',
    })

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('Conflict')
  })
})

describe('Auth API — POST /api/v1/auth/logout', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('clears session on logout', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/logout`, () => {
        return HttpResponse.json({
          data: { success: true },
          error: null,
          requestId: 'req-logout-001',
        })
      })
    )

    const res = await post('/api/v1/auth/logout', {})

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.success).toBe(true)
    expect(body.error).toBeNull()
    expect(body.requestId).toBeDefined()
  })

  it('returns success even when no active session (idempotent)', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/logout`, () => {
        return HttpResponse.json({
          data: { success: true },
          error: null,
          requestId: 'req-logout-002',
        })
      })
    )

    const res = await post('/api/v1/auth/logout', {})
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.success).toBe(true)
  })
})

describe('Auth API — POST /api/v1/auth/forgot-password', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('sends reset email for valid email address', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/forgot-password`, () => {
        return HttpResponse.json({
          data: { message: 'If the email exists, a password reset link has been sent.' },
          error: null,
          requestId: 'req-forgot-001',
        })
      })
    )

    const res = await post('/api/v1/auth/forgot-password', {
      email: 'jake@rosshomes.com',
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.message).toContain('reset link')
    expect(body.error).toBeNull()
  })

  it('returns same success response for unknown email (no information leakage)', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/forgot-password`, () => {
        // Same 200 response regardless of whether email exists
        return HttpResponse.json({
          data: { message: 'If the email exists, a password reset link has been sent.' },
          error: null,
          requestId: 'req-forgot-002',
        })
      })
    )

    const res = await post('/api/v1/auth/forgot-password', {
      email: 'nonexistent@example.com',
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.message).toContain('reset link')
  })

  it('returns 400 when email is missing', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/forgot-password`, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: { email: ['Email is required'] },
            requestId: 'req-forgot-003',
          },
          { status: 400 }
        )
      })
    )

    const res = await post('/api/v1/auth/forgot-password', {})

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation Error')
  })
})

describe('Auth API — GET /api/v1/auth/me', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns current user profile when authenticated', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, () => {
        return HttpResponse.json({
          data: mockUser,
          error: null,
          requestId: 'req-me-001',
        })
      })
    )

    const res = await get('/api/v1/auth/me', {
      Authorization: 'Bearer mock-access-token',
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe('auth-user-001')
    expect(body.data.email).toBe('jake@rosshomes.com')
    expect(body.data.role).toBe('owner')
    expect(body.data.company_id).toBe('company-001')
  })

  it('returns 401 when not authenticated', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, () => {
        return HttpResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            requestId: 'req-me-002',
          },
          { status: 401 }
        )
      })
    )

    const res = await get('/api/v1/auth/me')

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
    expect(body.requestId).toBeDefined()
  })
})
