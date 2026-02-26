/**
 * Maintenance Schedules API — List & Create
 *
 * GET  /api/v2/maintenance-schedules — List maintenance schedules
 * POST /api/v2/maintenance-schedules — Create a new schedule
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMaintenanceSchedulesSchema, createMaintenanceScheduleSchema } from '@/lib/validation/schemas/warranty'

// ============================================================================
// GET /api/v2/maintenance-schedules
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listMaintenanceSchedulesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      frequency: url.searchParams.get('frequency') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
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

    let query = (supabase as any)
      .from('maintenance_schedules')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.frequency) {
      query = query.eq('frequency', filters.frequency)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,category.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('next_due_date', { ascending: true, nullsFirst: false })

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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/maintenance-schedules — Create schedule
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createMaintenanceScheduleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid schedule data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('maintenance_schedules')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        title: input.title,
        description: input.description ?? null,
        frequency: input.frequency,
        category: input.category ?? null,
        assigned_to: input.assigned_to ?? null,
        assigned_vendor_id: input.assigned_vendor_id ?? null,
        start_date: input.start_date,
        end_date: input.end_date ?? null,
        next_due_date: input.next_due_date ?? null,
        estimated_cost: input.estimated_cost,
        is_active: input.is_active,
        notes: input.notes ?? null,
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
  { requireAuth: true, rateLimit: 'api' }
)
