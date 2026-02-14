/**
 * Health Check Endpoint
 *
 * Used by load balancers and monitoring systems to check service health.
 * Returns 200 if healthy, 503 if unhealthy.
 */

import { NextResponse } from 'next/server'

import { checkHealth } from '@/lib/monitoring'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const health = await checkHealth()

  const statusCode = health.status === 'unhealthy' ? 503 : 200

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
