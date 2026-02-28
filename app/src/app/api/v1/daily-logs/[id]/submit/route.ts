/**
 * Daily Log Submit API
 *
 * POST /api/v1/daily-logs/[id]/submit — Submit a daily log for approval
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { submitDailyLogSchema } from '@/lib/validation/schemas/daily-logs'
import type { DailyLog } from '@/types/daily-logs'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'daily-logs')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid daily log ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify log exists and is in draft status
    const { data: existing, error: fetchError } = await supabase
      .from('daily_logs')
      .select('id, status')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; status: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft logs can be submitted', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    const { data: updated, error: updateError } = await (supabase
      .from('daily_logs')
      .update({
        status: 'submitted',
        submitted_by: ctx.user!.id,
        submitted_at: now,
        updated_at: now,
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: DailyLog | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to submit daily log', { error: updateError?.message, targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to submit daily log', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('Daily log submitted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: submitDailyLogSchema,
    permission: 'jobs:update:all',
    auditAction: 'daily_log.submit',
  }
)
