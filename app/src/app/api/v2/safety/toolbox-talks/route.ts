/**
 * Toolbox Talks API — List & Create
 *
 * GET  /api/v2/safety/toolbox-talks — List toolbox talks (filtered by company)
 * POST /api/v2/safety/toolbox-talks — Create a new toolbox talk
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listToolboxTalksSchema, createToolboxTalkSchema } from '@/lib/validation/schemas/safety'

// ============================================================================
// GET /api/v2/safety/toolbox-talks
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listToolboxTalksSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('toolbox_talks')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,topic.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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
// POST /api/v2/safety/toolbox-talks — Create toolbox talk
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createToolboxTalkSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid toolbox talk data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('toolbox_talks')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        title: input.title,
        topic: input.topic ?? null,
        description: input.description ?? null,
        talk_date: input.talk_date,
        talk_time: input.talk_time ?? null,
        duration_minutes: input.duration_minutes ?? null,
        status: input.status,
        presenter_id: input.presenter_id ?? null,
        location: input.location ?? null,
        materials: input.materials,
        notes: input.notes ?? null,
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
