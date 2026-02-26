/**
 * Lien Waiver Templates API — List & Create
 *
 * GET  /api/v2/lien-waiver-templates — List templates with filters
 * POST /api/v2/lien-waiver-templates — Create a new template
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listLienWaiverTemplatesSchema, createLienWaiverTemplateSchema } from '@/lib/validation/schemas/lien-waivers'

// ============================================================================
// GET /api/v2/lien-waiver-templates
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listLienWaiverTemplatesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      waiver_type: url.searchParams.get('waiver_type') ?? undefined,
      state_code: url.searchParams.get('state_code') ?? undefined,
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
      .from('lien_waiver_templates')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.waiver_type) {
      query = query.eq('waiver_type', filters.waiver_type)
    }
    if (filters.state_code) {
      query = query.eq('state_code', filters.state_code)
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
// POST /api/v2/lien-waiver-templates
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createLienWaiverTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid template data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lien_waiver_templates')
      .insert({
        company_id: ctx.companyId!,
        waiver_type: input.waiver_type,
        template_name: input.template_name,
        template_content: input.template_content ?? null,
        state_code: input.state_code ?? null,
        is_default: input.is_default ?? false,
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
