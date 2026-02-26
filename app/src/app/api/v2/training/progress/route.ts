/**
 * Training Progress API — List & Create/Upsert
 *
 * GET  /api/v2/training/progress — List progress records
 * POST /api/v2/training/progress — Create or upsert progress
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listProgressSchema, createProgressSchema } from '@/lib/validation/schemas/training'

// ============================================================================
// GET /api/v2/training/progress
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listProgressSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      user_id: url.searchParams.get('user_id') ?? undefined,
      item_type: url.searchParams.get('item_type') ?? undefined,
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

    let query = (supabase as any)
      .from('user_training_progress')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.item_type) {
      query = query.eq('item_type', filters.item_type)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('updated_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/training/progress — Create progress record
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createProgressSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid progress data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('user_training_progress')
      .insert({
        company_id: ctx.companyId!,
        user_id: input.user_id,
        item_type: input.item_type,
        item_id: input.item_id,
        status: input.status,
        progress_pct: input.progress_pct,
        started_at: input.started_at ?? null,
        completed_at: input.completed_at ?? null,
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
