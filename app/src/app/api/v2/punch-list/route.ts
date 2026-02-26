/**
 * Punch Items API — List & Create
 *
 * GET  /api/v2/punch-list — List punch items (filtered by company)
 * POST /api/v2/punch-list — Create a new punch item
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPunchItemsSchema, createPunchItemSchema } from '@/lib/validation/schemas/punch-list'

// ============================================================================
// GET /api/v2/punch-list
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listPunchItemsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      priority: url.searchParams.get('priority') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      assigned_to: url.searchParams.get('assigned_to') ?? undefined,
      assigned_vendor_id: url.searchParams.get('assigned_vendor_id') ?? undefined,
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
      .from('punch_items')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters.assigned_vendor_id) {
      query = query.eq('assigned_vendor_id', filters.assigned_vendor_id)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%`)
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
// POST /api/v2/punch-list — Create punch item
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createPunchItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid punch item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('punch_items')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        title: input.title,
        description: input.description ?? null,
        location: input.location ?? null,
        room: input.room ?? null,
        status: input.status,
        priority: input.priority,
        category: input.category ?? null,
        assigned_to: input.assigned_to ?? null,
        assigned_vendor_id: input.assigned_vendor_id ?? null,
        due_date: input.due_date ?? null,
        cost_estimate: input.cost_estimate ?? null,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'punch_item.create' }
)
