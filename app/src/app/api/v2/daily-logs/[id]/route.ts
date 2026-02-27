/**
 * Daily Log by ID — Get, Update, Delete
 *
 * GET    /api/v2/daily-logs/:id — Get daily log with entries, labor, photos
 * PUT    /api/v2/daily-logs/:id — Update draft daily log
 * DELETE /api/v2/daily-logs/:id — Soft delete daily log
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateDailyLogSchema } from '@/lib/validation/schemas/daily-logs'

// ============================================================================
// GET /api/v2/daily-logs/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*, daily_log_entries(*), daily_log_labor(*), daily_log_photos(*)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { daily_log_entries, daily_log_labor, daily_log_photos, ...log } = data

    return NextResponse.json({
      data: {
        ...log,
        entries: daily_log_entries ?? [],
        labor: daily_log_labor ?? [],
        photos: daily_log_photos ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/daily-logs/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateDailyLogSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify log exists and is in draft status
    const { data: existing, error: existError } = await supabase
      .from('daily_logs')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft logs can be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.weather_summary !== undefined) updates.weather_summary = input.weather_summary
    if (input.high_temp !== undefined) updates.high_temp = input.high_temp
    if (input.low_temp !== undefined) updates.low_temp = input.low_temp
    if (input.conditions !== undefined) updates.conditions = input.conditions
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('daily_logs')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'daily_log.update' }
)

// ============================================================================
// DELETE /api/v2/daily-logs/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify daily log exists
    const { data: existing, error: existError } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('daily_logs')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'daily_log.archive' }
)
