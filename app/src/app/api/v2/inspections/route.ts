/**
 * Inspections API — List & Create
 *
 * GET  /api/v2/inspections — List permit inspections (filtered by company)
 * POST /api/v2/inspections — Create a new inspection
 *
 * Note: permit_inspections table does NOT have a deleted_at column.
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
import { listInspectionsSchema, createInspectionSchema } from '@/lib/validation/schemas/inspections'

// ============================================================================
// GET /api/v2/inspections
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listInspectionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      permit_id: url.searchParams.get('permit_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      inspection_type: url.searchParams.get('inspection_type') ?? undefined,
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
      .from('permit_inspections')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.permit_id) {
      query = query.eq('permit_id', filters.permit_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.inspection_type) {
      query = query.eq('inspection_type', filters.inspection_type)
    }
    if (filters.q) {
      query = query.or(`inspection_type.ilike.${safeOrIlike(filters.q)},inspector_name.ilike.${safeOrIlike(filters.q)}`)
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
// POST /api/v2/inspections — Create inspection
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createInspectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid inspection data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('permit_inspections')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        permit_id: input.permit_id,
        inspection_type: input.inspection_type,
        status: input.status,
        scheduled_date: input.scheduled_date ?? null,
        scheduled_time: input.scheduled_time ?? null,
        inspector_name: input.inspector_name ?? null,
        inspector_phone: input.inspector_phone ?? null,
        is_reinspection: input.is_reinspection,
        original_inspection_id: input.original_inspection_id ?? null,
        completed_at: input.completed_at ?? null,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
      } as never)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'inspection.create' }
)
