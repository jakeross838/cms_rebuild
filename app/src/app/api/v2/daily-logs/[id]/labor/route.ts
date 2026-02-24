/**
 * Daily Log Labor API — List & Create
 *
 * GET  /api/v2/daily-logs/:id/labor — List labor records for a daily log
 * POST /api/v2/daily-logs/:id/labor — Create a new labor record
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createLogLaborSchema } from '@/lib/validation/schemas/daily-logs'

// ============================================================================
// GET /api/v2/daily-logs/:id/labor
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /daily-logs/:id/labor
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify daily log belongs to company
    const { error: logError } = await (supabase
      .from('daily_logs') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (logError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('daily_log_labor') as any)
      .select('*')
      .eq('daily_log_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/daily-logs/:id/labor — Create labor record
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = createLogLaborSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid labor data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify daily log belongs to company and is in draft status
    const { data: log, error: logError } = await (supabase
      .from('daily_logs') as any)
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (logError || !log) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Daily log not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (log.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Labor records can only be added to draft logs', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await (supabase
      .from('daily_log_labor') as any)
      .insert({
        daily_log_id: id,
        company_id: ctx.companyId!,
        worker_name: input.worker_name,
        trade: input.trade ?? null,
        hours_worked: input.hours_worked,
        overtime_hours: input.overtime_hours ?? 0,
        headcount: input.headcount ?? 1,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
