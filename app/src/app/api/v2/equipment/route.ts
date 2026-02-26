/**
 * Equipment API — List & Create
 *
 * GET  /api/v2/equipment — List equipment (filtered by company)
 * POST /api/v2/equipment — Create new equipment
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
import { listEquipmentSchema, createEquipmentSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listEquipmentSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      equipment_type: url.searchParams.get('equipment_type') ?? undefined,
      ownership_type: url.searchParams.get('ownership_type') ?? undefined,
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
      .from('equipment')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.equipment_type) {
      query = query.eq('equipment_type', filters.equipment_type)
    }
    if (filters.ownership_type) {
      query = query.eq('ownership_type', filters.ownership_type)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,serial_number.ilike.%${escapeLike(filters.q)}%`)
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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/equipment — Create equipment
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createEquipmentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid equipment data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('equipment')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        description: input.description ?? null,
        equipment_type: input.equipment_type,
        status: input.status,
        ownership_type: input.ownership_type,
        make: input.make ?? null,
        model: input.model ?? null,
        serial_number: input.serial_number ?? null,
        year: input.year ?? null,
        purchase_date: input.purchase_date ?? null,
        purchase_price: input.purchase_price,
        current_value: input.current_value,
        daily_rate: input.daily_rate,
        location: input.location ?? null,
        notes: input.notes ?? null,
        photo_urls: input.photo_urls,
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
