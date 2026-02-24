/**
 * Equipment Inspection by ID — Get, Update, Delete
 *
 * GET    /api/v2/equipment/inspections/:inspectionId — Get inspection
 * PUT    /api/v2/equipment/inspections/:inspectionId — Update inspection
 * DELETE /api/v2/equipment/inspections/:inspectionId — Delete inspection
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateInspectionSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/inspections/:inspectionId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const inspectionId = req.nextUrl.pathname.split('/').pop()
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('equipment_inspections') as any)
      .select('*')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/equipment/inspections/:inspectionId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const inspectionId = req.nextUrl.pathname.split('/').pop()
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateInspectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.inspection_type !== undefined) updates.inspection_type = input.inspection_type
    if (input.result !== undefined) updates.result = input.result
    if (input.inspection_date !== undefined) updates.inspection_date = input.inspection_date
    if (input.inspector_id !== undefined) updates.inspector_id = input.inspector_id
    if (input.checklist !== undefined) updates.checklist = input.checklist
    if (input.deficiencies !== undefined) updates.deficiencies = input.deficiencies
    if (input.corrective_action !== undefined) updates.corrective_action = input.corrective_action
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase
      .from('equipment_inspections') as any)
      .update(updates)
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/equipment/inspections/:inspectionId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const inspectionId = req.nextUrl.pathname.split('/').pop()
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase
      .from('equipment_inspections') as any)
      .delete()
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
