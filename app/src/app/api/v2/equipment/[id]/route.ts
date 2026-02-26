/**
 * Equipment by ID — Get, Update, Delete
 *
 * GET    /api/v2/equipment/:id — Get equipment details
 * PUT    /api/v2/equipment/:id — Update equipment
 * DELETE /api/v2/equipment/:id — Soft delete (archive) equipment
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateEquipmentSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing equipment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Equipment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch assignment count
    const { data: assignments } = await supabase
      .from('equipment_assignments')
      .select('id')
      .eq('equipment_id', id)
      .eq('company_id', ctx.companyId!)

    // Fetch maintenance count
    const { data: maintenance } = await supabase
      .from('equipment_maintenance')
      .select('id')
      .eq('equipment_id', id)
      .eq('company_id', ctx.companyId!)

    // Fetch cost count
    const { data: costs } = await supabase
      .from('equipment_costs')
      .select('id')
      .eq('equipment_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: {
        ...data,
        assignments_count: (assignments ?? []).length,
        maintenance_count: (maintenance ?? []).length,
        costs_count: (costs ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/equipment/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing equipment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateEquipmentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.equipment_type !== undefined) updates.equipment_type = input.equipment_type
    if (input.status !== undefined) updates.status = input.status
    if (input.ownership_type !== undefined) updates.ownership_type = input.ownership_type
    if (input.make !== undefined) updates.make = input.make
    if (input.model !== undefined) updates.model = input.model
    if (input.serial_number !== undefined) updates.serial_number = input.serial_number
    if (input.year !== undefined) updates.year = input.year
    if (input.purchase_date !== undefined) updates.purchase_date = input.purchase_date
    if (input.purchase_price !== undefined) updates.purchase_price = input.purchase_price
    if (input.current_value !== undefined) updates.current_value = input.current_value
    if (input.daily_rate !== undefined) updates.daily_rate = input.daily_rate
    if (input.location !== undefined) updates.location = input.location
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.photo_urls !== undefined) updates.photo_urls = input.photo_urls

    const { data, error } = await supabase
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// DELETE /api/v2/equipment/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing equipment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: existError } = await supabase
      .from('equipment')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Equipment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('equipment')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
