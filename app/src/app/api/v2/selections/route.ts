/**
 * Selections API — List & Create
 *
 * GET  /api/v2/selections — List selections (actual selection records)
 * POST /api/v2/selections — Create a new selection
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import { logger } from '@/lib/monitoring'
import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listSelectionsSchema, createSelectionSchema } from '@/lib/validation/schemas/selections'

// ============================================================================
// GET /api/v2/selections
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listSelectionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      category_id: url.searchParams.get('category_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      room: url.searchParams.get('room') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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
      .from('selections')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.room) {
      query = query.eq('room', filters.room)
    }
    if (filters.q) {
      query = query.or(`room.ilike.%${escapeLike(filters.q)}%,change_reason.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/selections — Create selection
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createSelectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid selection data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify category exists and belongs to company
    const { data: category, error: catError } = await supabase
      .from('selection_categories')
      .select('id')
      .eq('id', input.category_id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (catError || !category) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection category not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Verify option exists and belongs to company
    const { data: option, error: optError } = await supabase
      .from('selection_options')
      .select('id')
      .eq('id', input.option_id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (optError || !option) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection option not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('selections')
      .insert({
        company_id: ctx.companyId!,
        category_id: input.category_id,
        option_id: input.option_id,
        job_id: input.job_id,
        room: input.room ?? null,
        selected_by: ctx.user!.id,
        selected_at: new Date().toISOString(),
        status: input.status,
        change_reason: input.change_reason ?? null,
        created_by: ctx.user!.id,
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

    // Record history entry (non-blocking)
    const { error: historyErr } = await supabase
      .from('selection_history')
      .insert({
        company_id: ctx.companyId!,
        category_id: input.category_id,
        option_id: input.option_id,
        action: 'selected',
        actor_id: ctx.user!.id,
        actor_role: ctx.user!.role,
        notes: null,
      })
    if (historyErr) logger.error('Failed to record selection history', { error: historyErr.message })

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'selection.create' }
)
