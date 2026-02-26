/**
 * Job Performance Rating by ID — Get, Update, Delete
 *
 * GET    /api/v2/vendor-performance/job-ratings/:id — Get rating
 * PUT    /api/v2/vendor-performance/job-ratings/:id — Update rating
 * DELETE /api/v2/vendor-performance/job-ratings/:id — Soft delete rating
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateJobRatingSchema } from '@/lib/validation/schemas/vendor-performance'

// ============================================================================
// GET /api/v2/vendor-performance/job-ratings/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing rating ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('vendor_job_performance')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job performance rating not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/vendor-performance/job-ratings/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing rating ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateJobRatingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify it exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('vendor_job_performance')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job performance rating not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build partial update
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.trade !== undefined) updates.trade = input.trade
    if (input.quality_rating !== undefined) updates.quality_rating = input.quality_rating
    if (input.timeliness_rating !== undefined) updates.timeliness_rating = input.timeliness_rating
    if (input.communication_rating !== undefined) updates.communication_rating = input.communication_rating
    if (input.budget_adherence_rating !== undefined) updates.budget_adherence_rating = input.budget_adherence_rating
    if (input.safety_rating !== undefined) updates.safety_rating = input.safety_rating
    if (input.overall_rating !== undefined) updates.overall_rating = input.overall_rating
    if (input.tasks_on_time !== undefined) updates.tasks_on_time = input.tasks_on_time
    if (input.tasks_total !== undefined) updates.tasks_total = input.tasks_total
    if (input.punch_items_count !== undefined) updates.punch_items_count = input.punch_items_count
    if (input.punch_resolution_avg_days !== undefined) updates.punch_resolution_avg_days = input.punch_resolution_avg_days
    if (input.inspection_pass_rate !== undefined) updates.inspection_pass_rate = input.inspection_pass_rate
    if (input.bid_amount !== undefined) updates.bid_amount = input.bid_amount
    if (input.final_amount !== undefined) updates.final_amount = input.final_amount
    if (input.change_order_count !== undefined) updates.change_order_count = input.change_order_count
    if (input.rating_notes !== undefined) updates.rating_notes = input.rating_notes

    const { data, error } = await (supabase as any)
      .from('vendor_job_performance')
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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/vendor-performance/job-ratings/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing rating ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase as any)
      .from('vendor_job_performance')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job performance rating not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any)
      .from('vendor_job_performance')
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
  { requireAuth: true, rateLimit: 'api' }
)
