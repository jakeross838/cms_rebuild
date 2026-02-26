/**
 * Quality Checklist Template Items — List & Create
 *
 * GET  /api/v2/quality-checklists/templates/:id/items — List template items
 * POST /api/v2/quality-checklists/templates/:id/items — Add a template item
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listTemplateItemsSchema, createTemplateItemSchema } from '@/lib/validation/schemas/punch-list'

/**
 * Extract template ID from path like /api/v2/quality-checklists/templates/:id/items
 */
function extractTemplateId(pathname: string): string | null {
  const segments = pathname.split('/')
  const templatesIdx = segments.indexOf('templates')
  return templatesIdx !== -1 && templatesIdx + 1 < segments.length ? segments[templatesIdx + 1] : null
}

// ============================================================================
// GET /api/v2/quality-checklists/templates/:id/items
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const templateId = extractTemplateId(req.nextUrl.pathname)
    if (!templateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const parseResult = listTemplateItemsSchema.safeParse({
      page: req.nextUrl.searchParams.get('page') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify template belongs to company
    const { data: template, error: tError } = await supabase
      .from('quality_checklist_templates')
      .select('id')
      .eq('id', templateId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (tError || !template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('quality_checklist_template_items')
      .select('*', { count: 'exact' })
      .eq('template_id', templateId)
      .order('sort_order', { ascending: true })
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
// POST /api/v2/quality-checklists/templates/:id/items — Add template item
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const templateId = extractTemplateId(req.nextUrl.pathname)
    if (!templateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createTemplateItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid template item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify template belongs to company
    const { data: template, error: tError } = await supabase
      .from('quality_checklist_templates')
      .select('id')
      .eq('id', templateId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (tError || !template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('quality_checklist_template_items')
      .insert({
        company_id: ctx.companyId!,
        template_id: templateId,
        description: input.description,
        category: input.category ?? null,
        sort_order: input.sort_order,
        is_required: input.is_required,
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
