/**
 * Marketplace Template Versions API — List & Create
 *
 * GET  /api/v2/marketplace/templates/:id/versions — List versions
 * POST /api/v2/marketplace/templates/:id/versions — Create new version
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listTemplateVersionsSchema, createTemplateVersionSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/templates/:id/versions
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const templateId = segments[segments.length - 2]
    if (!templateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listTemplateVersionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify template exists
    const { data: template } = await (supabase
      .from('marketplace_templates') as any)
      .select('id')
      .eq('id', templateId)
      .is('deleted_at', null)
      .single()

    if (!template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase
      .from('marketplace_template_versions') as any)
      .select('*', { count: 'exact' })
      .eq('template_id', templateId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/marketplace/templates/:id/versions
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const templateId = segments[segments.length - 2]
    if (!templateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createTemplateVersionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid version data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify template exists
    const { data: template } = await (supabase
      .from('marketplace_templates') as any)
      .select('id')
      .eq('id', templateId)
      .is('deleted_at', null)
      .single()

    if (!template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('marketplace_template_versions') as any)
      .insert({
        template_id: templateId,
        version: input.version,
        changelog: input.changelog ?? null,
        template_data: input.template_data,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'This version already exists for this template', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Update the template's version field
    await (supabase
      .from('marketplace_templates') as any)
      .update({ version: input.version })
      .eq('id', templateId)

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
