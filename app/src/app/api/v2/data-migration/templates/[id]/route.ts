/**
 * Migration Mapping Template by ID — Get, Update, Delete
 *
 * GET    /api/v2/data-migration/templates/:id — Get template
 * PUT    /api/v2/data-migration/templates/:id — Update template
 * DELETE /api/v2/data-migration/templates/:id — Deactivate template (is_active=false)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMappingTemplateSchema } from '@/lib/validation/schemas/data-migration'

// ============================================================================
// GET /api/v2/data-migration/templates/:id
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

    const { data, error } = await (supabase as any)
      .from('migration_mapping_templates')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Mapping template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/data-migration/templates/:id
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
    const parseResult = updateMappingTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.source_platform !== undefined) updates.source_platform = input.source_platform
    if (input.mappings !== undefined) updates.mappings = input.mappings
    if (input.is_active !== undefined) updates.is_active = input.is_active

    const { data, error } = await (supabase as any)
      .from('migration_mapping_templates')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Mapping template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/data-migration/templates/:id — Deactivate (is_active=false)
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

    const { data: existing } = await (supabase as any)
      .from('migration_mapping_templates')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Mapping template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any)
      .from('migration_mapping_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
