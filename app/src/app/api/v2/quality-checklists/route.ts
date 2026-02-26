/**
 * Quality Checklists API — List & Create
 *
 * GET  /api/v2/quality-checklists — List quality checklists
 * POST /api/v2/quality-checklists — Create a new quality checklist
 */

import { NextResponse } from 'next/server'
import { safeOrIlike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listChecklistsSchema, createChecklistSchema } from '@/lib/validation/schemas/punch-list'

// ============================================================================
// GET /api/v2/quality-checklists
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listChecklistsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      template_id: url.searchParams.get('template_id') ?? undefined,
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
      .from('quality_checklists')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.template_id) {
      query = query.eq('template_id', filters.template_id)
    }
    if (filters.q) {
      query = query.or(`name.ilike.${safeOrIlike(filters.q)},description.ilike.${safeOrIlike(filters.q)}`)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// POST /api/v2/quality-checklists — Create checklist
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createChecklistSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid checklist data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('quality_checklists')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        template_id: input.template_id ?? null,
        name: input.name,
        description: input.description ?? null,
        status: input.status,
        inspector_id: input.inspector_id ?? null,
        inspection_date: input.inspection_date ?? null,
        location: input.location ?? null,
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

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'quality_checklist.create' }
)
