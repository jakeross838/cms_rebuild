/**
 * Permit Inspections API — List & Create
 *
 * GET  /api/v2/permits/:id/inspections — List inspections for a permit
 * POST /api/v2/permits/:id/inspections — Schedule a new inspection
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listInspectionsSchema, createInspectionSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/inspections
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const permitId = segments[segments.indexOf('permits') + 1]

    const url = req.nextUrl
    const parseResult = listInspectionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      permit_id: permitId,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      inspection_type: url.searchParams.get('inspection_type') ?? undefined,
      scheduled_date_from: url.searchParams.get('scheduled_date_from') ?? undefined,
      scheduled_date_to: url.searchParams.get('scheduled_date_to') ?? undefined,
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

    // Verify permit ownership
    const { error: permitError } = await (supabase as any)
      .from('permits')
      .select('id')
      .eq('id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (permitError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase as any)
      .from('permit_inspections')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('permit_id', permitId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.inspection_type) {
      query = query.eq('inspection_type', filters.inspection_type)
    }
    if (filters.scheduled_date_from) {
      query = query.gte('scheduled_date', filters.scheduled_date_from)
    }
    if (filters.scheduled_date_to) {
      query = query.lte('scheduled_date', filters.scheduled_date_to)
    }

    query = query.order('scheduled_date', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/permits/:id/inspections — Schedule inspection
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const permitId = segments[segments.indexOf('permits') + 1]

    const body = await req.json()
    const parseResult = createInspectionSchema.safeParse({
      ...body,
      permit_id: permitId,
      job_id: body.job_id,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid inspection data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify permit ownership
    const { data: permit, error: permitError } = await (supabase as any)
      .from('permits')
      .select('id, job_id')
      .eq('id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (permitError || !permit) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('permit_inspections')
      .insert({
        company_id: ctx.companyId!,
        permit_id: permitId,
        job_id: input.job_id,
        inspection_type: input.inspection_type,
        status: input.status,
        scheduled_date: input.scheduled_date ?? null,
        scheduled_time: input.scheduled_time ?? null,
        inspector_name: input.inspector_name ?? null,
        inspector_phone: input.inspector_phone ?? null,
        notes: input.notes ?? null,
        is_reinspection: input.is_reinspection,
        original_inspection_id: input.original_inspection_id ?? null,
        created_by: ctx.user!.id,
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
