/**
 * Schedule Baselines API — Get & Delete
 *
 * GET    /api/v1/schedule-baselines/[id] — Get a single baseline
 * DELETE /api/v1/schedule-baselines/[id] — Delete a baseline
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import type { ScheduleBaseline } from '@/types/scheduling'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/schedule-baselines/[id] ─────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-baselines')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid baseline ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: baseline, error } = await supabase
      .from('schedule_baselines')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: ScheduleBaseline | null; error: { message: string } | null }

    if (error || !baseline) {
      logger.warn('Baseline not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Baseline not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: baseline, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── DELETE /api/v1/schedule-baselines/[id] ──────────────────────────────

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-baselines')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid baseline ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify exists and belongs to company
    const { data: existing } = await supabase
      .from('schedule_baselines')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: unknown }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Baseline not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Baselines are immutable snapshots — hard delete is fine
    const { error } = await supabase
      .from('schedule_baselines')
      .delete()
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      logger.error('Failed to delete baseline', { error: error.message, targetId })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Schedule baseline deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: { id: targetId }, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    permission: 'jobs:delete:all',
    auditAction: 'schedule_baseline.delete',
  }
)
