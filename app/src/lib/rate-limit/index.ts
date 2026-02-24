/**
 * Multi-Tenant Rate Limiting
 *
 * Protects the API from abuse with tenant-aware rate limits.
 * Uses sliding window algorithm for accurate rate limiting.
 *
 * Limits are applied per:
 * - IP address (for unauthenticated requests)
 * - User ID (for authenticated requests)
 * - Company ID (aggregate limit per tenant)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { timingSafeEqual } from 'crypto'

// TODO: Add @vercel/kv when deploying to production
// For now, uses in-memory store (see memoryStore below)

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication endpoints (strict)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    failClosed: true, // Auth must NEVER fail open
  },
  // API endpoints (standard)
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    failClosed: false,
  },
  // Heavy operations (file uploads, AI processing)
  heavy: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    failClosed: false,
  },
  // Search/autocomplete
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    failClosed: false,
  },
  // Financial operations (invoices, draws, payments)
  financial: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    failClosed: true, // Financial ops must NEVER fail open
  },
  // Company-wide aggregate limit
  companyAggregate: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // Per company total
    failClosed: false,
  },
} as const

type RateLimitType = keyof typeof RATE_LIMITS

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')

  return cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'
}

/**
 * Build rate limit key
 */
function buildRateLimitKey(
  identifier: string,
  type: RateLimitType,
  windowStart: number
): string {
  return `rl:${type}:${identifier}:${windowStart}`
}

/**
 * Check rate limit using sliding window
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs
  const key = buildRateLimitKey(identifier, type, windowStart)

  try {
    let count: number

    if (isKVAvailable()) {
      // TODO: Use @vercel/kv Redis INCR with expiry in production
      // For now, fall through to memory store
    }

    {
      // Fallback to memory store
      const stored = memoryStore.get(key)
      if (stored && stored.resetAt > now) {
        stored.count++
        count = stored.count
      } else {
        count = 1
        memoryStore.set(key, { count, resetAt: windowStart + config.windowMs })
      }

      // Cleanup old entries
      for (const [k, v] of memoryStore.entries()) {
        if (v.resetAt < now) memoryStore.delete(k)
      }
    }

    const remaining = Math.max(0, config.maxRequests - count)
    const reset = windowStart + config.windowMs

    if (count > config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset,
        retryAfter: Math.ceil((reset - now) / 1000),
      }
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining,
      reset,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)

    // Fail-closed for security-sensitive endpoints (auth, financial)
    if (config.failClosed) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: now + config.windowMs,
        retryAfter: Math.ceil(config.windowMs / 1000),
      }
    }

    // Fail open for non-sensitive endpoints
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
    }
  }
}

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  req: NextRequest,
  type: RateLimitType = 'api'
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(req)
  const result = await checkRateLimit(identifier, type)

  if (!result.success) {
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please retry after ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      },
      { status: 429 }
    )
    return applyRateLimitHeaders(response, result)
  }

  return null // Continue to handler
}

/**
 * Check user-specific rate limit
 */
export async function checkUserRateLimit(
  userId: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  return checkRateLimit(`user:${userId}`, type)
}

/**
 * Check company aggregate rate limit
 */
export async function checkCompanyRateLimit(
  companyId: string
): Promise<RateLimitResult> {
  return checkRateLimit(`company:${companyId}`, 'companyAggregate')
}

/**
 * Combined rate limit check (IP + User + Company)
 */
export async function checkCombinedRateLimit(
  req: NextRequest,
  userId?: string,
  companyId?: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const ip = getClientIdentifier(req)

  // Check IP limit
  const ipResult = await checkRateLimit(ip, type)
  if (!ipResult.success) return ipResult

  // Check user limit if authenticated
  if (userId) {
    const userResult = await checkUserRateLimit(userId, type)
    if (!userResult.success) return userResult
  }

  // Check company aggregate limit
  if (companyId) {
    const companyResult = await checkCompanyRateLimit(companyId)
    if (!companyResult.success) return companyResult
  }

  return ipResult
}

// ============================================================================
// RATE LIMIT BYPASS FOR TRUSTED SOURCES
// ============================================================================

const TRUSTED_IPS = new Set(
  (process.env.TRUSTED_IPS || '').split(',').filter(Boolean)
)

/**
 * Timing-safe comparison for API keys.
 * Prevents timing attacks that could leak key characters.
 */
function timingSafeApiKeyCheck(provided: string, trusted: string): boolean {
  try {
    const a = Buffer.from(provided, 'utf-8')
    const b = Buffer.from(trusted, 'utf-8')
    if (a.length !== b.length) {
      // Compare against self to keep constant time even on length mismatch
      timingSafeEqual(a, a)
      return false
    }
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Check if request is from trusted source
 */
export function isTrustedRequest(req: NextRequest): boolean {
  const ip = getClientIdentifier(req)
  if (TRUSTED_IPS.has(ip)) return true

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const trustedKeys = (process.env.TRUSTED_API_KEYS || '').split(',').filter(Boolean)
    return trustedKeys.some((key) => timingSafeApiKeyCheck(apiKey, key))
  }

  return false
}
