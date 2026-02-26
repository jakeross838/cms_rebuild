/**
 * Onboarding Session API — GET, PUT, DELETE single
 *
 * GET    /api/v2/onboarding/:id — Get session
 * PUT    /api/v2/onboarding/:id — Update session
 * DELETE /api/v2/onboarding/:id — Soft delete session
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateOnboardingSessionSchema } from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Onboarding session not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Get milestone and checklist counts
    const [milestonesResult, checklistsResult] = await Promise.all([
      supabase.from('onboarding_milestones')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('company_id', ctx.companyId!),
      supabase.from('onboarding_checklists')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('company_id', ctx.companyId!),
    ])

    return NextResponse.json({
      data: {
        ...data,
        milestones_count: milestonesResult.count ?? 0,
        checklists_count: checklistsResult.count ?? 0,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/onboarding/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateOnboardingSessionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid session data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updateFields: Record<string, unknown> = {}
    if (input.status !== undefined) updateFields.status = input.status
    if (input.current_step !== undefined) updateFields.current_step = input.current_step
    if (input.total_steps !== undefined) updateFields.total_steps = input.total_steps
    if (input.company_type !== undefined) updateFields.company_type = input.company_type
    if (input.company_size !== undefined) updateFields.company_size = input.company_size
    if (input.metadata !== undefined) updateFields.metadata = input.metadata

    // Auto-set timestamps based on status transitions
    if (input.status === 'in_progress' && !updateFields.started_at) {
      updateFields.started_at = new Date().toISOString()
    }
    if (input.status === 'completed') {
      updateFields.completed_at = new Date().toISOString()
    }
    if (input.status === 'skipped') {
      updateFields.skipped_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('onboarding_sessions')
      .update(updateFields)
      .eq('id', sessionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'onboarding.update' }
)

// ============================================================================
// DELETE /api/v2/onboarding/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_sessions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'onboarding.archive' }
)
