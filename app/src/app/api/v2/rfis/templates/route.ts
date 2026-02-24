/**
 * RFI Templates API — List & Create
 *
 * GET  /api/v2/rfis/templates — List RFI templates
 * POST /api/v2/rfis/templates — Create a new RFI template
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listRfiTemplatesSchema, createRfiTemplateSchema } from '@/lib/validation/schemas/rfi-management'

// ============================================================================
// GET /api/v2/rfis/templates
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listRfiTemplatesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
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
      .from('rfi_templates') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('is_active', true)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${filters.q}%,subject_template.ilike.%${filters.q}%`)
    }

    query = query.order('name', { ascending: true })

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
// POST /api/v2/rfis/templates — Create template
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createRfiTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid template data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('rfi_templates') as any)
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        category: input.category,
        subject_template: input.subject_template ?? null,
        question_template: input.question_template ?? null,
        default_priority: input.default_priority,
        is_active: input.is_active,
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
