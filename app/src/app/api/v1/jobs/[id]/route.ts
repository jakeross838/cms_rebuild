/**
 * Jobs API — Get, Update & Delete Single Job
 *
 * GET    /api/v1/jobs/[id] — Get a single job by ID
 * PATCH  /api/v1/jobs/[id] — Update a job
 * DELETE /api/v1/jobs/[id] — Soft-delete a job
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateJobSchema, type UpdateJobInput } from '@/lib/validation/schemas/jobs'
import type { Job } from '@/types/database'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/jobs/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'jobs')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, clients!left(id, name)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: Job | null; error: { message: string } | null }

    if (error || !job) {
      logger.warn('Job not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: job })
  },
  {
    requireAuth: true,
    permission: 'jobs:read:all',
  }
)

// ============================================================================
// PATCH /api/v1/jobs/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'jobs')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as UpdateJobInput
    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('jobs')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: Job | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update job', { error: updateError?.message, targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update job', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('Job updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: updateJobSchema,
    permission: 'jobs:update:all',
    auditAction: 'job.update',
  }
)

// ============================================================================
// DELETE /api/v1/jobs/[id] — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'jobs')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('jobs')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('Job not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('Job soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'jobs:delete:all',
    auditAction: 'job.delete',
  }
)
