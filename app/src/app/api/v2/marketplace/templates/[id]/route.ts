/**
 * Marketplace Template by ID — Get, Update, Delete
 *
 * GET    /api/v2/marketplace/templates/:id — Get template
 * PUT    /api/v2/marketplace/templates/:id — Update template
 * DELETE /api/v2/marketplace/templates/:id — Soft delete template
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTemplateSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/templates/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('marketplace_templates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch counts
    const { count: versionsCount } = await supabase
      .from('marketplace_template_versions')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id)

    const { count: installsCount } = await supabase
      .from('marketplace_installs')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id)

    const { count: reviewsCount } = await supabase
      .from('marketplace_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id)
      .is('deleted_at', null)

    return NextResponse.json({
      data: {
        ...data,
        versions_count: versionsCount ?? 0,
        installs_count: installsCount ?? 0,
        reviews_count: reviewsCount ?? 0,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/marketplace/templates/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify existence
    const { data: existing, error: existError } = await supabase
      .from('marketplace_templates')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.template_type !== undefined) updates.template_type = input.template_type
    if (input.name !== undefined) updates.name = input.name
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.description !== undefined) updates.description = input.description
    if (input.long_description !== undefined) updates.long_description = input.long_description
    if (input.screenshots !== undefined) updates.screenshots = input.screenshots
    if (input.tags !== undefined) updates.tags = input.tags
    if (input.region_tags !== undefined) updates.region_tags = input.region_tags
    if (input.construction_tags !== undefined) updates.construction_tags = input.construction_tags
    if (input.price !== undefined) updates.price = input.price
    if (input.currency !== undefined) updates.currency = input.currency
    if (input.template_data !== undefined) updates.template_data = input.template_data
    if (input.required_modules !== undefined) updates.required_modules = input.required_modules
    if (input.version !== undefined) updates.version = input.version
    if (input.review_status !== undefined) updates.review_status = input.review_status
    if (input.is_featured !== undefined) updates.is_featured = input.is_featured
    if (input.is_active !== undefined) updates.is_active = input.is_active

    const { data, error } = await supabase
      .from('marketplace_templates')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }
    if (!data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'marketplace_template.update' }
)

// ============================================================================
// DELETE /api/v2/marketplace/templates/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existingError } = await supabase
      .from('marketplace_templates')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('marketplace_templates')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'marketplace_template.archive' }
)
