/**
 * Lien Waiver Template by ID — Update & Delete
 *
 * PUT    /api/v2/lien-waiver-templates/:id — Update template
 * DELETE /api/v2/lien-waiver-templates/:id — Delete template
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateLienWaiverTemplateSchema } from '@/lib/validation/schemas/lien-waivers'

// ============================================================================
// PUT /api/v2/lien-waiver-templates/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateLienWaiverTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.waiver_type !== undefined) updates.waiver_type = input.waiver_type
    if (input.template_name !== undefined) updates.template_name = input.template_name
    if (input.template_content !== undefined) updates.template_content = input.template_content
    if (input.state_code !== undefined) updates.state_code = input.state_code
    if (input.is_default !== undefined) updates.is_default = input.is_default

    const { data, error } = await supabase
      .from('lien_waiver_templates')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/lien-waiver-templates/:id
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('lien_waiver_templates')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
