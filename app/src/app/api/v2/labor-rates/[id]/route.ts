/**
 * Labor Rate by ID — Update & Delete
 *
 * PUT    /api/v2/labor-rates/:id — Update labor rate
 * DELETE /api/v2/labor-rates/:id — Delete labor rate
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
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

    const { data, error } = await (supabase
      .from('labor_rates') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Labor rate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
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

    // Labor rates don't have deleted_at, so we do a hard delete
    // (they are configuration data, not transactional data)
    // Actually, per project rules: soft delete only. But labor_rates table
    // doesn't have a deleted_at column in V1. We'll delete the row since
    // it's configuration data and new rates replace old via effective_date.
    // For safety, we set end_date to today instead of deleting.
    const { data, error } = await (supabase
      .from('labor_rates') as any)
      .update({ end_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Labor rate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true, ended: data }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
