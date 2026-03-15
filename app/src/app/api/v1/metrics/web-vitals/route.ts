import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createLogger } from '@/lib/monitoring'

const logger = createLogger({ module: 'web-vitals' })

/**
 * POST /api/v1/metrics/web-vitals
 * Receives Web Vitals metrics from the client (via sendBeacon)
 * No auth required — lightweight telemetry endpoint
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      name: string
      value: number
      id: string
      rating: string
    }

    const { name, value, id, rating } = body

    // Validate metric name
    const validMetrics = ['LCP', 'FID', 'CLS', 'TTFB', 'INP', 'FCP']
    if (!validMetrics.includes(name)) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 })
    }

    // Log the metric
    logger.info(`${name}: ${value.toFixed(1)} (${rating})`, {
      metricName: name,
      metricValue: String(value),
      metricId: id,
      metricRating: rating,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
