/**
 * API Middleware
 *
 * Combines rate limiting, monitoring, and authentication
 * for scalable API endpoints.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { recordMetric, createLogger, recordAudit } from '@/lib/monitoring'
import {
  checkCombinedRateLimit,
  applyRateLimitHeaders,
  isTrustedRequest,
  type RATE_LIMITS,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

type RateLimitType = keyof typeof RATE_LIMITS

interface ApiContext {
  user: {
    id: string
    companyId: string
    role: string
    email: string
  } | null
  companyId: string | null
  requestId: string
  startTime: number
}

interface ApiHandlerOptions {
  rateLimit?: RateLimitType
  requireAuth?: boolean
  requiredRoles?: string[]
  auditAction?: string
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
  } = options

  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const requestId = crypto.randomUUID()
    const startTime = performance.now()
    const logger = createLogger({ requestId })
    const trusted = isTrustedRequest(req)

    // Initialize context
    const ctx: ApiContext = {
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

      // 2. Authentication
      if (requireAuth) {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required', requestId },
            { status: 401 }
          )
        }

        // Get user profile with company
        const { data: profile } = await supabase
          .from('users')
          .select('id, company_id, role, email')
          .eq('id', user.id)
          .single() as { data: { id: string; company_id: string; role: string; email: string } | null; error: unknown }

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

      // 5. Execute handler
      const response = await handler(req, ctx)

      // 6. Record metrics
      const responseTime = performance.now() - startTime
      recordMetric({
        companyId: ctx.companyId || undefined,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: response.status,
        responseTimeMs: Math.round(responseTime),
      })

      // 7. Audit logging (if configured)
      if (auditAction && ctx.user) {
        const body = req.method !== 'GET' ? await req.clone().json().catch(() => null) : null

        recordAudit({
          companyId: ctx.companyId!,
          userId: ctx.user.id,
          action: auditAction,
          ipAddress: req.headers.get('x-forwarded-for') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
          newData: body,
        })
      }

      // Add request ID to response headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Request-ID', requestId)
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
  limit: number
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
  }
}
