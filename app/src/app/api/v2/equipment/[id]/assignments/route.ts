/**
 * Equipment Assignments — List & Create per equipment
 *
 * GET  /api/v2/equipment/:id/assignments — List assignments for equipment
 * POST /api/v2/equipment/:id/assignments — Create assignment for equipment
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listAssignmentsSchema, createAssignmentSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/:id/assignments
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const equipmentId = segments[segments.indexOf('equipment') + 1]

    const url = req.nextUrl
    const parseResult = listAssignmentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
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
      .from('equipment_assignments')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('equipment_id', equipmentId)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('start_date', { ascending: false })

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
// POST /api/v2/equipment/:id/assignments
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const equipmentId = segments[segments.indexOf('equipment') + 1]

    const body = await req.json()
    const parseResult = createAssignmentSchema.safeParse({ ...body, equipment_id: equipmentId })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid assignment data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify equipment exists
    const { data: equip, error: equipError } = await supabase
      .from('equipment')
      .select('id')
      .eq('id', equipmentId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (equipError || !equip) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Equipment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('equipment_assignments')
      .insert({
        company_id: ctx.companyId!,
        equipment_id: input.equipment_id,
        job_id: input.job_id ?? null,
        assigned_to: input.assigned_to ?? null,
        assigned_by: ctx.user!.id,
        start_date: input.start_date,
        end_date: input.end_date ?? null,
        status: input.status,
        hours_used: input.hours_used,
        notes: input.notes ?? null,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'equipment_assignment.create' }
)
