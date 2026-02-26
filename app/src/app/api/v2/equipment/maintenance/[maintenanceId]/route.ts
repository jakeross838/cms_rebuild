/**
 * Equipment Maintenance by ID — Get, Update, Delete
 *
 * GET    /api/v2/equipment/maintenance/:maintenanceId — Get maintenance record
 * PUT    /api/v2/equipment/maintenance/:maintenanceId — Update maintenance record
 * DELETE /api/v2/equipment/maintenance/:maintenanceId — Delete maintenance record
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMaintenanceSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/maintenance/:maintenanceId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const maintenanceId = req.nextUrl.pathname.split('/').pop()
    if (!maintenanceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing maintenance ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('equipment_maintenance')
      .select('*')
      .eq('id', maintenanceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/equipment/maintenance/:maintenanceId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const maintenanceId = req.nextUrl.pathname.split('/').pop()
    if (!maintenanceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing maintenance ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMaintenanceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.maintenance_type !== undefined) updates.maintenance_type = input.maintenance_type
    if (input.status !== undefined) updates.status = input.status
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.scheduled_date !== undefined) updates.scheduled_date = input.scheduled_date
    if (input.completed_date !== undefined) updates.completed_date = input.completed_date
    if (input.performed_by !== undefined) updates.performed_by = input.performed_by
    if (input.service_provider !== undefined) updates.service_provider = input.service_provider
    if (input.parts_cost !== undefined) updates.parts_cost = input.parts_cost
    if (input.labor_cost !== undefined) updates.labor_cost = input.labor_cost
    if (input.total_cost !== undefined) updates.total_cost = input.total_cost
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('equipment_maintenance')
      .update(updates)
      .eq('id', maintenanceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/equipment/maintenance/:maintenanceId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const maintenanceId = req.nextUrl.pathname.split('/').pop()
    if (!maintenanceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing maintenance ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('equipment_maintenance')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', maintenanceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
