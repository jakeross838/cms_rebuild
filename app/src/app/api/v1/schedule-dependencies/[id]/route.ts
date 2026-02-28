/**
 * Schedule Dependencies API — Get & Delete
 *
 * GET    /api/v1/schedule-dependencies/[id] — Get a single dependency
 * DELETE /api/v1/schedule-dependencies/[id] — Delete a dependency (hard delete)
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import type { ScheduleDependency } from '@/types/scheduling'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/schedule-dependencies/[id] ──────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-dependencies')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid dependency ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the dependency
    const { data: dep, error } = await supabase
      .from('schedule_dependencies')
      .select('*')
      .eq('id', targetId)
      .single() as { data: ScheduleDependency | null; error: { message: string } | null }

    if (error || !dep) {
      logger.warn('Dependency not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Dependency not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Verify the predecessor task belongs to this company
    const { data: task } = await supabase
      .from('schedule_tasks')
      .select('id')
      .eq('id', dep.predecessor_id)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: unknown }

    if (!task) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dependency not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: dep, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── DELETE /api/v1/schedule-dependencies/[id] ───────────────────────────

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'schedule-dependencies')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid dependency ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify dependency exists and belongs to company via predecessor task
    const { data: dep } = await supabase
      .from('schedule_dependencies')
      .select('id, predecessor_id')
      .eq('id', targetId)
      .single() as { data: { id: string; predecessor_id: string } | null; error: unknown }

    if (!dep) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dependency not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: task } = await supabase
      .from('schedule_tasks')
      .select('id')
      .eq('id', dep.predecessor_id)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: unknown }

    if (!task) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dependency not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Dependencies are a join table — hard delete is appropriate
    const { error } = await supabase
      .from('schedule_dependencies')
      .delete()
      .eq('id', targetId)

    if (error) {
      logger.error('Failed to delete dependency', { error: error.message, targetId })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Schedule dependency deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: { id: targetId }, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    permission: 'jobs:update:all',
    auditAction: 'schedule_dependency.delete',
  }
)
