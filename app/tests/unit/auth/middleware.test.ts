/**
 * Enhanced API Middleware Tests
 * Tests schema validation and permission checking additions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { z } from 'zod'

// Mock dependencies before importing middleware
vi.mock('@/lib/monitoring', () => ({
  recordMetric: vi.fn(),
  createLogger: () => ({ error: vi.fn(), info: vi.fn(), warn: vi.fn() }),
  recordAudit: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkCombinedRateLimit: vi.fn().mockResolvedValue({ success: true }),
  applyRateLimitHeaders: vi.fn((res) => res),
  isTrustedRequest: vi.fn().mockReturnValue(true),
  RATE_LIMITS: { api: {}, auth: {} },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com' },
        },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'user-1',
              company_id: 'company-1',
              role: 'admin',
              email: 'test@test.com',
              settings: { permissions_mode: 'open' },
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

import { createApiHandler } from '@/lib/api/middleware'

function createMockRequest(method: string, url: string, body?: Record<string, unknown>) {
  const init: { method: string; body?: string; headers?: Record<string, string> } = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as ConstructorParameters<typeof NextRequest>[1])
}

describe('createApiHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls handler without schema or permission', async () => {
    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    const wrapped = createApiHandler(handler)
    const req = createMockRequest('GET', '/api/test')

    const res = await wrapped(req)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalled()
  })

  it('validates body with schema on POST', async () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })

    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )

    const wrapped = createApiHandler(handler, { schema })
    const req = createMockRequest('POST', '/api/test', { name: 'Test', email: 'test@test.com' })

    const res = await wrapped(req)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalled()

    // Check validatedBody was set
    const ctx = handler.mock.calls[0][1]
    expect(ctx.validatedBody).toEqual({ name: 'Test', email: 'test@test.com' })
  })

  it('returns 400 for invalid body', async () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })

    const handler = vi.fn()
    const wrapped = createApiHandler(handler, { schema })
    const req = createMockRequest('POST', '/api/test', { name: '', email: 'invalid' })

    const res = await wrapped(req)
    expect(res.status).toBe(400)
    expect(handler).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.error).toBe('Validation Error')
    expect(body.errors).toBeDefined()
  })

  it('returns 400 for invalid JSON', async () => {
    const schema = z.object({ name: z.string() })
    const handler = vi.fn()
    const wrapped = createApiHandler(handler, { schema })

    // Create request with invalid JSON body
    const req = new NextRequest(new URL('/api/test', 'http://localhost:3000'), {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await wrapped(req)
    expect(res.status).toBe(400)
    expect(handler).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.message).toBe('Invalid JSON body')
  })

  it('skips schema validation for GET requests', async () => {
    const schema = z.object({ name: z.string() })
    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )

    const wrapped = createApiHandler(handler, { schema })
    const req = createMockRequest('GET', '/api/test')

    const res = await wrapped(req)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalled()
  })

  it('returns 401 when requireAuth and no user', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'No user' } }),
      },
      from: vi.fn(),
    } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

    const handler = vi.fn()
    const wrapped = createApiHandler(handler, { requireAuth: true })
    const req = createMockRequest('GET', '/api/test')

    const res = await wrapped(req)
    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })

  it('returns 403 when requiredRoles not met', async () => {
    // Default mock user has role 'admin'
    const handler = vi.fn()
    const wrapped = createApiHandler(handler, { requiredRoles: ['owner'] })
    const req = createMockRequest('GET', '/api/test')

    const res = await wrapped(req)
    expect(res.status).toBe(403)
    expect(handler).not.toHaveBeenCalled()
  })

  it('passes when requiredRoles are met', async () => {
    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    const wrapped = createApiHandler(handler, { requiredRoles: ['admin', 'owner'] })
    const req = createMockRequest('GET', '/api/test')

    const res = await wrapped(req)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalled()
  })

  it('skips auth when requireAuth is false', async () => {
    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    const wrapped = createApiHandler(handler, { requireAuth: false })
    const req = createMockRequest('GET', '/api/test')

    const res = await wrapped(req)
    expect(res.status).toBe(200)

    // User should be null in context
    const ctx = handler.mock.calls[0][1]
    expect(ctx.user).toBeNull()
  })
})
