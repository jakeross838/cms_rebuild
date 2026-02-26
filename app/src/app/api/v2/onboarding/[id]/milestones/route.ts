/**
 * Onboarding Milestones API — List & Create
 *
 * GET  /api/v2/onboarding/:id/milestones — List milestones for session
 * POST /api/v2/onboarding/:id/milestones — Create milestone
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listMilestonesSchema,
  createMilestoneSchema,
} from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id/milestones
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 2]

    const url = req.nextUrl
    const parseResult = listMilestonesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      session_id: sessionId,
      status: url.searchParams.get('status') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('onboarding_milestones')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('session_id', sessionId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('sort_order', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/onboarding/:id/milestones
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 2]

    const body = await req.json()
    const parseResult = createMilestoneSchema.safeParse({
      ...body,
      session_id: sessionId,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid milestone data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify session exists and belongs to company
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Onboarding session not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('onboarding_milestones')
      .insert({
        company_id: ctx.companyId!,
        session_id: sessionId,
        milestone_key: input.milestone_key,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        sort_order: input.sort_order,
        data: input.data,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'onboarding_milestone.create' }
)
