/**
 * Onboarding Checklists API — List & Create
 *
 * GET  /api/v2/onboarding/:id/checklists — List checklists for session
 * POST /api/v2/onboarding/:id/checklists — Create checklist item
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listChecklistsSchema,
  createChecklistSchema,
} from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id/checklists
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 2]

    const url = req.nextUrl
    const parseResult = listChecklistsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      session_id: sessionId,
      category: url.searchParams.get('category') ?? undefined,
      is_completed: url.searchParams.get('is_completed') ?? undefined,
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

    let query = (supabase
      .from('onboarding_checklists') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('session_id', sessionId)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.is_completed !== undefined) {
      query = query.eq('is_completed', filters.is_completed)
    }

    query = query.order('sort_order', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/onboarding/:id/checklists
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 2]

    const body = await req.json()
    const parseResult = createChecklistSchema.safeParse({
      ...body,
      session_id: sessionId,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid checklist data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify session exists and belongs to company
    const { data: session, error: sessionError } = await (supabase
      .from('onboarding_sessions') as any)
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

    const { data, error } = await (supabase
      .from('onboarding_checklists') as any)
      .insert({
        company_id: ctx.companyId!,
        session_id: sessionId,
        category: input.category,
        title: input.title,
        description: input.description ?? null,
        is_completed: input.is_completed,
        is_required: input.is_required,
        sort_order: input.sort_order,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
