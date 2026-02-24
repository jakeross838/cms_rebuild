/**
 * Invoice Extraction Detail API — Get & Update
 *
 * GET /api/v2/invoice-extractions/:id — Get extraction with line items
 * PUT /api/v2/invoice-extractions/:id — Update/correct extraction
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
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

    // Get the extraction
    const { data: extraction, error: extractionError } = await (supabase
      .from('invoice_extractions') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (extractionError || !extraction) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Get line items
    const { data: lineItems } = await (supabase
      .from('invoice_line_extractions') as any)
      .select('*')
      .eq('extraction_id', id)
      .order('line_number', { ascending: true })

    // Get audit log
    const { data: auditLog } = await (supabase
      .from('extraction_audit_log') as any)
      .select('*')
      .eq('extraction_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: {
        ...extraction,
        line_items: lineItems ?? [],
        audit_log: auditLog ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
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
    const { data: existing, error: fetchError } = await (supabase
      .from('invoice_extractions') as any)
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Update extraction
    const { data: updated, error: updateError } = await (supabase
      .from('invoice_extractions') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Database Error', message: updateError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
