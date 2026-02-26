/**
 * Onboarding Milestone API — GET, PUT single
 *
 * GET /api/v2/onboarding/:id/milestones/:milestoneId — Get milestone
 * PUT /api/v2/onboarding/:id/milestones/:milestoneId — Update milestone
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMilestoneSchema } from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id/milestones/:milestoneId
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const milestoneId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_milestones')
      .select('*')
      .eq('id', milestoneId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Milestone not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/onboarding/:id/milestones/:milestoneId
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const milestoneId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateMilestoneSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid milestone data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updateFields: Record<string, unknown> = {}
    if (input.milestone_key !== undefined) updateFields.milestone_key = input.milestone_key
    if (input.title !== undefined) updateFields.title = input.title
    if (input.description !== undefined) updateFields.description = input.description
    if (input.status !== undefined) updateFields.status = input.status
    if (input.sort_order !== undefined) updateFields.sort_order = input.sort_order
    if (input.data !== undefined) updateFields.data = input.data

    // Auto-set timestamps based on status transitions
    if (input.status === 'in_progress') {
      updateFields.started_at = new Date().toISOString()
    }
    if (input.status === 'completed') {
      updateFields.completed_at = new Date().toISOString()
    }
    if (input.status === 'skipped') {
      updateFields.skipped_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('onboarding_milestones')
      .update(updateFields)
      .eq('id', milestoneId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Milestone not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'onboarding_milestone.update' }
)
