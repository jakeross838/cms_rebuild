/**
 * API Middleware
 *
 * Combines rate limiting, monitoring, and authentication
 * for scalable API endpoints.
 */

import { type NextRequest, NextResponse } from 'next/server'

import type { SupabaseClient } from '@supabase/supabase-js'

import { canPerform, resolvePermissions } from '@/lib/auth/permissions'
import { recordMetric, createLogger, recordAudit } from '@/lib/monitoring'
import {
  checkCombinedRateLimit,
  applyRateLimitHeaders,
  isTrustedRequest,
  type RATE_LIMITS,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import type { PermissionsMode } from '@/types/auth'
import type { Database, UserRole } from '@/types/database'

import type { z } from 'zod'

type RateLimitType = keyof typeof RATE_LIMITS

export interface ApiContext {
  /** Authenticated Supabase client (available when requireAuth is true) */
  supabase: SupabaseClient<Database> | null
  user: {
    id: string
    companyId: string
    role: string
    email: string
  } | null
  companyId: string | null
  requestId: string
  startTime: number
  validatedBody?: unknown
}

export interface ApiHandlerOptions {
  rateLimit?: RateLimitType
  requireAuth?: boolean
  requiredRoles?: string[]
  auditAction?: string
  /** Zod schema to validate request body (POST/PATCH/PUT only) */
  schema?: z.ZodType
  /** Permission string to check (e.g., 'jobs:create:all') */
  permission?: string
}

type ApiHandler = (
  req: NextRequest,
  ctx: ApiContext
) => Promise<NextResponse | Response>

/**
 * Create API handler with middleware
 */
export function createApiHandler(handler: ApiHandler, options: ApiHandlerOptions = {}) {
  const {
    rateLimit = 'api',
    requireAuth = true,
    requiredRoles,
    auditAction,
    schema,
    permission,
  } = options

  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const requestId = crypto.randomUUID()
    const startTime = performance.now()
    const logger = createLogger({ requestId })
    const trusted = isTrustedRequest(req)

    // Initialize context
    const ctx: ApiContext = {
      supabase: null,
      user: null,
      companyId: null,
      requestId,
      startTime,
    }

    try {
      // 1. Pre-auth IP rate limiting (skip for trusted sources)
      if (!trusted) {
        const ipResult = await checkCombinedRateLimit(req, undefined, undefined, rateLimit)

        if (!ipResult.success) {
          const response = NextResponse.json(
            {
              error: 'Too Many Requests',
              message: `Rate limit exceeded. Retry after ${ipResult.retryAfter} seconds.`,
              requestId,
            },
            { status: 429 }
          )
          return applyRateLimitHeaders(response, ipResult)
        }
      }

      // 2. Authentication (single Supabase client reused for auth + permission checks)
      const supabase = await createClient()
      ctx.supabase = supabase

      if (requireAuth) {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required', requestId },
            { status: 401 }
          )
        }

        // Get user profile with company
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, company_id, role, email')
          .eq('id', user.id)
          .single() as { data: { id: string; company_id: string; role: string; email: string } | null; error: { message: string } | null }

        if (profileError) {
          logger.error('Failed to fetch user profile', { error: profileError.message, userId: user.id })
          return NextResponse.json(
            { error: 'Internal Server Error', requestId },
            { status: 500 }
          )
        }

        if (!profile) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'User profile not found', requestId },
            { status: 403 }
          )
        }

        ctx.user = {
          id: profile.id,
          companyId: profile.company_id,
          role: profile.role,
          email: profile.email,
        }
        ctx.companyId = profile.company_id

        // 3. Post-auth rate limiting (user + company scoped)
        if (!trusted) {
          const userResult = await checkCombinedRateLimit(
            req,
            ctx.user.id,
            ctx.companyId,
            rateLimit
          )

          if (!userResult.success) {
            const response = NextResponse.json(
              {
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Retry after ${userResult.retryAfter} seconds.`,
                requestId,
              },
              { status: 429 }
            )
            return applyRateLimitHeaders(response, userResult)
          }
        }

        // 4. Role-based access control
        if (requiredRoles && !requiredRoles.includes(profile.role)) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Insufficient permissions',
              requestId,
            },
            { status: 403 }
          )
        }
      }

      // 5. Schema validation (POST/PATCH/PUT only)
      if (schema && ['POST', 'PATCH', 'PUT'].includes(req.method)) {
        const contentType = req.headers.get('content-type')?.split(';')[0]?.trim()
        if (contentType && contentType !== 'application/json') {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Content-Type must be application/json', requestId },
            { status: 400 }
          )
        }

        let body: unknown
        try {
          body = await req.clone().json()
        } catch {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Invalid JSON body', requestId },
            { status: 400 }
          )
        }

        const result = schema.safeParse(body)
        if (!result.success) {
          const errors: Record<string, string[]> = {}
          for (const issue of result.error.issues) {
            const path = issue.path.join('.') || '_root'
            if (!errors[path]) errors[path] = []
            errors[path].push(issue.message)
          }
          return NextResponse.json(
            { error: 'Validation Error', message: 'Request body validation failed', errors, requestId },
            { status: 400 }
          )
        }
        ctx.validatedBody = result.data
      }

      // 6. Permission check (reuses the same supabase client from step 2)
      if (permission && ctx.user) {
        // Get company permissions_mode from settings
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('settings')
          .eq('id', ctx.companyId!)
          .single() as { data: { settings: Record<string, unknown> | null } | null; error: { message: string } | null }

        if (companyError) {
          logger.error('Failed to fetch company settings', { error: companyError.message, companyId: ctx.companyId ?? undefined })
        }

        const permissionsMode = (company?.settings?.permissions_mode as PermissionsMode) || 'open'
        const userPermissions = resolvePermissions(ctx.user.role as UserRole)

        if (!canPerform(ctx.user.role as UserRole, userPermissions, permission, permissionsMode)) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient permissions', requestId },
            { status: 403 }
          )
        }
      }

      // 7. Execute handler
      const response = await handler(req, ctx)

      // 8. Record metrics
      const responseTime = performance.now() - startTime
      recordMetric({
        companyId: ctx.companyId || undefined,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: response.status,
        responseTimeMs: Math.round(responseTime),
      })

      // 9. Audit logging (if configured)
      if (auditAction && ctx.user) {
        const body = req.method !== 'GET' ? (ctx.validatedBody ?? await req.clone().json().catch(() => null)) : null

        recordAudit({
          companyId: ctx.companyId!,
          userId: ctx.user.id,
          action: auditAction,
          ipAddress: req.headers.get('x-forwarded-for') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
          newData: body,
        })
      }

      // Add standard headers to response
      if (response instanceof NextResponse) {
        response.headers.set('X-Request-ID', requestId)

        // Cache-Control: never cache mutating requests or errors
        const status = response.status
        const method = req.method
        if (method !== 'GET' || status >= 400) {
          response.headers.set('Cache-Control', 'no-store')
        } else if (!response.headers.has('Cache-Control')) {
          // GET success — private, short TTL (API data is user-specific)
          response.headers.set('Cache-Control', 'private, no-cache, max-age=0, must-revalidate')
        }
      }

      return response
    } catch (error) {
      // Log error
      logger.error('API handler error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        companyId: ctx.companyId || undefined,
        userId: ctx.user?.id,
      })

      // Record error metric
      const responseTime = performance.now() - startTime
      recordMetric({
        companyId: ctx.companyId || undefined,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: 500,
        responseTimeMs: Math.round(responseTime),
      })

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : 'Unknown error')
            : 'An unexpected error occurred',
          requestId,
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to extract pagination params
 */
export function getPaginationParams(req: NextRequest) {
  const url = req.nextUrl
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Helper to create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  requestId?: string
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
    ...(requestId ? { requestId } : {}),
  }
}

/**
 * Maps a Supabase/Postgres error to an appropriate HTTP status and message.
 * Use in API routes to return consistent, accurate error responses.
 */
export function mapDbError(error: { code?: string; message?: string; details?: string }): {
  status: number
  error: string
  message: string
} {
  const code = error.code ?? ''

  // PostgREST: expected single row but got zero
  if (code === 'PGRST116') {
    return { status: 404, error: 'Not Found', message: 'Resource not found' }
  }

  // Unique constraint violation
  if (code === '23505') {
    return { status: 409, error: 'Conflict', message: error.details ?? 'A record with that value already exists' }
  }

  // Foreign key violation
  if (code === '23503') {
    return { status: 400, error: 'Bad Request', message: 'Referenced record does not exist' }
  }

  // Not-null violation
  if (code === '23502') {
    return { status: 400, error: 'Bad Request', message: error.message ?? 'A required field is missing' }
  }

  // Check constraint violation
  if (code === '23514') {
    return { status: 400, error: 'Bad Request', message: error.message ?? 'Value violates a constraint' }
  }

  // Invalid text representation (e.g., non-UUID string passed to UUID column)
  if (code === '22P02') {
    return { status: 400, error: 'Bad Request', message: 'Invalid ID format' }
  }

  // RLS policy violation (insufficient privilege)
  if (code === '42501') {
    return { status: 403, error: 'Forbidden', message: 'Insufficient permissions' }
  }

  // Default: server error
  return { status: 500, error: 'Database Error', message: error.message ?? 'An unexpected database error occurred' }
}
