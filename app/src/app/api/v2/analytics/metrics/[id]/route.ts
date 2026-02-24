/**
 * Platform Metrics Snapshot by ID — Get, Update
 *
 * GET /api/v2/analytics/metrics/:id — Get metric snapshot
 * PUT /api/v2/analytics/metrics/:id — Update metric snapshot
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMetricsSnapshotSchema } from '@/lib/validation/schemas/platform-analytics'

// ============================================================================
// GET /api/v2/analytics/metrics/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing snapshot ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('platform_metrics_snapshots') as any)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Metrics snapshot not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/analytics/metrics/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing snapshot ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMetricsSnapshotSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.snapshot_date !== undefined) updates.snapshot_date = input.snapshot_date
    if (input.metric_type !== undefined) updates.metric_type = input.metric_type
    if (input.metric_value !== undefined) updates.metric_value = input.metric_value
    if (input.breakdown !== undefined) updates.breakdown = input.breakdown
    if (input.period !== undefined) updates.period = input.period

    const { data, error } = await (supabase
      .from('platform_metrics_snapshots') as any)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Metrics snapshot not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
