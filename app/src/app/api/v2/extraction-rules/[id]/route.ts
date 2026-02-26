/**
 * Extraction Rule Detail API — Update & Delete
 *
 * PUT    /api/v2/extraction-rules/:id — Update rule
 * DELETE /api/v2/extraction-rules/:id — Soft delete rule (deactivate)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateExtractionRuleSchema } from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// PUT /api/v2/extraction-rules/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing rule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateExtractionRuleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const updates = parseResult.data
    const supabase = await createClient()

    // Verify rule exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('extraction_rules')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction rule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: updated, error: updateError } = await supabase
      .from('extraction_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (updateError) {
      const mapped = mapDbError(updateError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'extraction_rule.update' }
)

// ============================================================================
// DELETE /api/v2/extraction-rules/:id — Deactivate (soft delete)
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing rule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify rule exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('extraction_rules')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction rule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Soft delete: deactivate the rule
    const { data: deactivated, error: updateError } = await supabase
      .from('extraction_rules')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (updateError) {
      const mapped = mapDbError(updateError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: deactivated, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'extraction_rule.archive' }
)
