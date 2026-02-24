/**
 * Equipment Maintenance — List & Create per equipment
 *
 * GET  /api/v2/equipment/:id/maintenance — List maintenance records for equipment
 * POST /api/v2/equipment/:id/maintenance — Create maintenance record for equipment
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMaintenanceSchema, createMaintenanceSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/:id/maintenance
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const equipmentId = segments[segments.indexOf('equipment') + 1]

    const url = req.nextUrl
    const parseResult = listMaintenanceSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      maintenance_type: url.searchParams.get('maintenance_type') ?? undefined,
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

    let query = (supabase
      .from('equipment_maintenance') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('equipment_id', equipmentId)

    if (filters.maintenance_type) {
      query = query.eq('maintenance_type', filters.maintenance_type)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/equipment/:id/maintenance
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const equipmentId = segments[segments.indexOf('equipment') + 1]

    const body = await req.json()
    const parseResult = createMaintenanceSchema.safeParse({ ...body, equipment_id: equipmentId })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid maintenance data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify equipment exists
    const { data: equip, error: equipError } = await (supabase
      .from('equipment') as any)
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

    const { data, error } = await (supabase
      .from('equipment_maintenance') as any)
      .insert({
        company_id: ctx.companyId!,
        equipment_id: input.equipment_id,
        maintenance_type: input.maintenance_type,
        status: input.status,
        title: input.title,
        description: input.description ?? null,
        scheduled_date: input.scheduled_date ?? null,
        completed_date: input.completed_date ?? null,
        performed_by: input.performed_by ?? null,
        service_provider: input.service_provider ?? null,
        parts_cost: input.parts_cost,
        labor_cost: input.labor_cost,
        total_cost: input.total_cost,
        notes: input.notes ?? null,
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
