/**
 * Equipment Cost by ID — Get, Update, Delete
 *
 * GET    /api/v2/equipment/costs/:costId — Get cost record
 * PUT    /api/v2/equipment/costs/:costId — Update cost record
 * DELETE /api/v2/equipment/costs/:costId — Delete cost record
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateCostSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/costs/:costId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const costId = req.nextUrl.pathname.split('/').pop()
    if (!costId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing cost ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('equipment_costs')
      .select('*')
      .eq('id', costId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Cost record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/equipment/costs/:costId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const costId = req.nextUrl.pathname.split('/').pop()
    if (!costId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing cost ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateCostSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.cost_type !== undefined) updates.cost_type = input.cost_type
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.cost_date !== undefined) updates.cost_date = input.cost_date
    if (input.description !== undefined) updates.description = input.description
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.receipt_url !== undefined) updates.receipt_url = input.receipt_url
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase as any)
      .from('equipment_costs')
      .update(updates)
      .eq('id', costId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Cost record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/equipment/costs/:costId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const costId = req.nextUrl.pathname.split('/').pop()
    if (!costId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing cost ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('equipment_costs')
      .delete()
      .eq('id', costId)
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
