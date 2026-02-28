/**
 * Daily Log Entries API — List & Create
 *
 * GET  /api/v1/daily-logs/[id]/entries — List entries for a daily log
 * POST /api/v1/daily-logs/[id]/entries — Create a new entry
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { createLogEntrySchema } from '@/lib/validation/schemas/daily-logs'
import type { DailyLogEntry } from '@/types/daily-logs'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/daily-logs/[id]/entries ─────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const logId = extractEntityId(req, 'daily-logs')
    if (!logId || !uuidSchema.safeParse(logId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid daily log ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify log belongs to company
    const { data: logCheck } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('id', logId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: unknown }

    if (!logCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: entries, error } = await supabase
      .from('daily_log_entries')
      .select('*')
      .eq('daily_log_id', logId)
      .order('sort_order', { ascending: true }) as { data: DailyLogEntry[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Failed to list log entries', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: entries ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/daily-logs/[id]/entries ────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const logId = extractEntityId(req, 'daily-logs')
    if (!logId || !uuidSchema.safeParse(logId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid daily log ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify log belongs to company and is still editable
    const { data: logCheck } = await supabase
      .from('daily_logs')
      .select('id, status')
      .eq('id', logId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; status: string } | null; error: unknown }

    if (!logCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (logCheck.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot add entries to a non-draft log', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: entry, error } = await (supabase
      .from('daily_log_entries')
      .insert({
        ...body,
        daily_log_id: logId,
        created_by: ctx.user!.id,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: DailyLogEntry | null; error: { message: string } | null }>)

    if (error || !entry) {
      logger.error('Failed to create log entry', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Daily log entry created', { entryId: entry.id, logId })

    return NextResponse.json({ data: entry, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: createLogEntrySchema,
    permission: 'jobs:update:all',
    auditAction: 'daily_log_entry.create',
  }
)
