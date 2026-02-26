/**
 * Labor Rate by ID — Update & Delete
 *
 * PUT    /api/v2/labor-rates/:id — Update labor rate
 * DELETE /api/v2/labor-rates/:id — Delete labor rate
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateLaborRateSchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// PUT /api/v2/labor-rates/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing labor rate ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateLaborRateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.user_id !== undefined) updates.user_id = input.user_id
    if (input.trade !== undefined) updates.trade = input.trade
    if (input.rate_type !== undefined) updates.rate_type = input.rate_type
    if (input.hourly_rate !== undefined) updates.hourly_rate = input.hourly_rate
    if (input.effective_date !== undefined) updates.effective_date = input.effective_date
    if (input.end_date !== undefined) updates.end_date = input.end_date

    const { data, error } = await supabase
      .from('labor_rates')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// DELETE /api/v2/labor-rates/:id
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing labor rate ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Soft-delete: set end_date to today and mark deleted_at
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('labor_rates')
      .update({ end_date: now.split('T')[0], deleted_at: now, updated_at: now } as never)
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

    return NextResponse.json({ data: { success: true, ended: data }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)
