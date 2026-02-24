/**
 * Marketplace Installs API — List & Create
 *
 * GET  /api/v2/marketplace/installs — List my installs
 * POST /api/v2/marketplace/installs — Install a template
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listInstallsSchema, createInstallSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/installs
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listInstallsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      template_id: url.searchParams.get('template_id') ?? undefined,
      template_type: url.searchParams.get('template_type') ?? undefined,
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
      .from('marketplace_installs') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.template_id) {
      query = query.eq('template_id', filters.template_id)
    }

    query = query.order('installed_at', { ascending: false })

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
// POST /api/v2/marketplace/installs — Install a template
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createInstallSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid install data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify template exists and is active + approved
    const { data: template } = await (supabase
      .from('marketplace_templates') as any)
      .select('id, is_active, review_status')
      .eq('id', input.template_id)
      .is('deleted_at', null)
      .single()

    if (!template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (!template.is_active || template.review_status !== 'approved') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Template is not available for installation', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await (supabase
      .from('marketplace_installs') as any)
      .insert({
        company_id: ctx.companyId!,
        template_id: input.template_id,
        template_version: input.template_version,
        installed_by: ctx.user!.id,
        payment_id: input.payment_id ?? null,
        payment_amount: input.payment_amount ?? null,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Increment install count on template
    await (supabase.rpc as any)('increment_install_count', { template_id_input: input.template_id }).catch(() => {
      // Non-critical: best-effort increment
    })

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
