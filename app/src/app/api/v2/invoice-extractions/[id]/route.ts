/**
 * Invoice Extraction Detail API — Get & Update
 *
 * GET /api/v2/invoice-extractions/:id — Get extraction with line items
 * PUT /api/v2/invoice-extractions/:id — Update/correct extraction
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateExtractionSchema } from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// GET /api/v2/invoice-extractions/:id
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the extraction with line items and audit log in a single query
    const { data, error } = await supabase
      .from('invoice_extractions')
      .select('*, invoice_line_extractions(*), extraction_audit_log(*)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .order('line_number', { referencedTable: 'invoice_line_extractions', ascending: true })
      .order('created_at', { referencedTable: 'extraction_audit_log', ascending: true })
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { invoice_line_extractions, extraction_audit_log, ...extraction } = data

    return NextResponse.json({
      data: {
        ...extraction,
        line_items: invoice_line_extractions ?? [],
        audit_log: extraction_audit_log ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// PUT /api/v2/invoice-extractions/:id — Update extraction
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateExtractionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const updates = parseResult.data
    const supabase = await createClient()

    // Verify extraction exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('invoice_extractions')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Update extraction
    const { data: updated, error: updateError } = await supabase
      .from('invoice_extractions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'extraction.update' }
)
