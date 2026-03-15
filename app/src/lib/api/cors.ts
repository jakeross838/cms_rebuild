import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * CORS configuration for API routes
 *
 * Used by public API endpoints (Module 45 — API & Marketplace).
 * Internal routes use same-origin by default and don't need CORS.
 */

const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean)
)

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
const ALLOWED_HEADERS = 'Content-Type, Authorization, X-Request-ID'
const MAX_AGE = '86400' // 24 hours

/**
 * Check if an origin is allowed for CORS
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.has(origin)
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const origin = request.headers.get('origin')

  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS)
    response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS)
    response.headers.set('Access-Control-Max-Age', MAX_AGE)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Vary', 'Origin')
  }

  return response
}

/**
 * Handle CORS preflight (OPTIONS) requests
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') return null

  const origin = request.headers.get('origin')
  if (!origin || !isAllowedOrigin(origin)) {
    return new NextResponse(null, { status: 403 })
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': ALLOWED_METHODS,
      'Access-Control-Allow-Headers': ALLOWED_HEADERS,
      'Access-Control-Max-Age': MAX_AGE,
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    },
  })
}
