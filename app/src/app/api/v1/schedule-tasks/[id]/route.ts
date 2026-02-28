/**
 * Schedule Tasks API — Get, Update & Delete
 *
 * GET    /api/v1/schedule-tasks/[id] — Get a single task
 * PATCH  /api/v1/schedule-tasks/[id] — Update a task
 * DELETE /api/v1/schedule-tasks/[id] — Soft-delete a task
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateScheduleTaskSchema } from '@/lib/validation/schemas/scheduling'
import type { ScheduleTask } from '@/types/scheduling'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/schedule-tasks/[id] ─────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-tasks')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: task, error } = await supabase
      .from('schedule_tasks')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: ScheduleTask | null; error: { message: string } | null }

    if (error || !task) {
      logger.warn('Schedule task not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Schedule task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: task, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── PATCH /api/v1/schedule-tasks/[id] ───────────────────────────────────

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-tasks')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: fetchError } = await supabase
      .from('schedule_tasks')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Schedule task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('schedule_tasks')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: ScheduleTask | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update schedule task', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Schedule task updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: updateScheduleTaskSchema,
    permission: 'jobs:update:all',
    auditAction: 'schedule_task.update',
  }
)

// ── DELETE /api/v1/schedule-tasks/[id] ──────────────────────────────────

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-tasks')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('schedule_tasks')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('Schedule task not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Schedule task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('Schedule task soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    permission: 'jobs:delete:all',
    auditAction: 'schedule_task.delete',
  }
)
