/**
 * Daily Log Photos API — List & Create
 *
 * GET  /api/v2/daily-logs/:id/photos — List photos for a daily log
 * POST /api/v2/daily-logs/:id/photos — Create a new photo record
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, getPaginationParams, mapDbError, paginatedResponse, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createLogPhotoSchema } from '@/lib/validation/schemas/daily-logs'

// ============================================================================
// GET /api/v2/daily-logs/:id/photos
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /daily-logs/:id/photos
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify daily log belongs to company
    const { error: logError } = await supabase
      .from('daily_logs')
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

    const { page, limit, offset } = getPaginationParams(req)

    const { data, count, error } = await supabase
      .from('daily_log_photos')
      .select('*', { count: 'exact' })
      .eq('daily_log_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/daily-logs/:id/photos — Create photo record
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing daily log ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = createLogPhotoSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid photo data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify daily log belongs to company and is in draft status
    const { data: log, error: logError } = await supabase
      .from('daily_logs')
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
        { error: 'Forbidden', message: 'Photos can only be added to draft logs', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('daily_log_photos')
      .insert({
        daily_log_id: id,
        storage_path: input.storage_path,
        caption: input.caption ?? null,
        taken_at: input.taken_at ?? null,
        location_description: input.location_description ?? null,
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
