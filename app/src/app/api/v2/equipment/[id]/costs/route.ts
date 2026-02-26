/**
 * Equipment Costs — List & Create per equipment
 *
 * GET  /api/v2/equipment/:id/costs — List costs for equipment
 * POST /api/v2/equipment/:id/costs — Create cost for equipment
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
import { listCostsSchema, createCostSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/:id/costs
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const equipmentId = segments[segments.indexOf('equipment') + 1]

    const url = req.nextUrl
    const parseResult = listCostsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      cost_type: url.searchParams.get('cost_type') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
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
      .from('equipment_costs')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('equipment_id', equipmentId)
      .is('deleted_at', null)

    if (filters.cost_type) {
      query = query.eq('cost_type', filters.cost_type)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }

    query = query.order('cost_date', { ascending: false })

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
// POST /api/v2/equipment/:id/costs
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const equipmentId = segments[segments.indexOf('equipment') + 1]

    const body = await req.json()
    const parseResult = createCostSchema.safeParse({ ...body, equipment_id: equipmentId })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid cost data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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
      .from('equipment_costs')
      .insert({
        company_id: ctx.companyId!,
        equipment_id: input.equipment_id,
        job_id: input.job_id ?? null,
        cost_type: input.cost_type,
        amount: input.amount,
        cost_date: input.cost_date ?? new Date().toISOString().split('T')[0],
        description: input.description ?? null,
        vendor_id: input.vendor_id ?? null,
        receipt_url: input.receipt_url ?? null,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
