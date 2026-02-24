/**
 * Selection Options API — List & Create
 *
 * GET  /api/v2/selections/options — List selection options
 * POST /api/v2/selections/options — Create a new selection option
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listSelectionOptionsSchema, createSelectionOptionSchema } from '@/lib/validation/schemas/selections'

// ============================================================================
// GET /api/v2/selections/options
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listSelectionOptionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category_id: url.searchParams.get('category_id') ?? undefined,
      source: url.searchParams.get('source') ?? undefined,
      is_recommended: url.searchParams.get('is_recommended') ?? undefined,
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

    let query = (supabase
      .from('selection_options') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.source) {
      query = query.eq('source', filters.source)
    }
    if (filters.is_recommended !== undefined) {
      query = query.eq('is_recommended', filters.is_recommended)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%,sku.ilike.%${filters.q}%`)
    }

    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/selections/options — Create option
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createSelectionOptionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid option data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify category exists and belongs to company
    const { data: category, error: catError } = await (supabase
      .from('selection_categories') as any)
      .select('id')
      .eq('id', input.category_id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (catError || !category) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection category not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('selection_options') as any)
      .insert({
        company_id: ctx.companyId!,
        category_id: input.category_id,
        name: input.name,
        description: input.description ?? null,
        vendor_id: input.vendor_id ?? null,
        sku: input.sku ?? null,
        model_number: input.model_number ?? null,
        unit_price: input.unit_price,
        quantity: input.quantity,
        total_price: input.total_price,
        lead_time_days: input.lead_time_days,
        availability_status: input.availability_status ?? null,
        source: input.source,
        is_recommended: input.is_recommended,
        sort_order: input.sort_order,
        created_by: ctx.user!.id,
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
