/**
 * Confirm Extraction — Create Invoice from AI Extraction
 *
 * POST /api/v2/invoices/extractions/:id/confirm — Confirm & create invoice
 *
 * Checks for duplicate invoices before creating. If a duplicate is found,
 * returns a 409 Conflict with duplicate details. The caller can override
 * by sending `force: true` in the request body.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { checkForDuplicates, buildDuplicateWarningMeta } from '@/lib/invoice/duplicate-detector'
import { createServiceClient } from '@/lib/supabase/service'

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/invoices/extractions/:id/confirm
    // segments: ['', 'api', 'v2', 'invoices', 'extractions', id, 'confirm']
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { corrections, vendor_id, job_id, cost_code_id, force } = body

    const supabase = createServiceClient()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id

    // Get extraction
    const { data: extraction, error: fetchError } = await supabase
      .from('invoice_extractions' as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (fetchError || !extraction) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Read data from extracted_data (with _meta)
    const extractedRaw = extraction.extracted_data || {}
    const meta = extractedRaw._meta || {}
    // Remove _meta from the merge so it doesn't leak into invoice fields
    const { _meta, ...extractedFields } = extractedRaw

    // Merge extracted data with corrections and track what changed
    const finalData = { ...extractedFields, ...corrections }

    // Track corrections for AI learning — compare original vs corrected fields
    const trackedCorrections: Array<{ field: string; original: unknown; corrected: unknown }> = []
    if (corrections && typeof corrections === 'object') {
      for (const [field, correctedValue] of Object.entries(corrections)) {
        const originalValue = extractedFields[field]
        if (correctedValue !== undefined && correctedValue !== '' && correctedValue !== originalValue) {
          trackedCorrections.push({ field, original: originalValue ?? null, corrected: correctedValue })
        }
      }
    }
    // Track vendor/job/cost_code overrides
    if (vendor_id && vendor_id !== (meta.vendor_match as Record<string, unknown>)?.matched_vendor_id) {
      trackedCorrections.push({ field: 'vendor_id', original: (meta.vendor_match as Record<string, unknown>)?.matched_vendor_id ?? null, corrected: vendor_id })
    }
    if (cost_code_id) {
      const invoiceLevel = (meta.cost_code_match as Record<string, unknown>)?.invoice_level as Record<string, unknown> | undefined
      if (cost_code_id !== invoiceLevel?.matched_cost_code_id) {
        trackedCorrections.push({ field: 'cost_code_id', original: invoiceLevel?.matched_cost_code_id ?? null, corrected: cost_code_id })
      }
    }

    // -----------------------------------------------------------------------
    // Duplicate detection — check before creating the invoice
    // -----------------------------------------------------------------------
    const duplicateResult = await checkForDuplicates(
      supabase,
      companyId,
      {
        vendor_name: finalData.vendor_name,
        vendor_id: vendor_id || null,
        invoice_number: finalData.invoice_number,
        amount: finalData.amount,
        invoice_date: finalData.invoice_date,
      }
    )

    if (duplicateResult.has_duplicate && !force) {
      const warning = buildDuplicateWarningMeta(duplicateResult)
      return NextResponse.json(
        {
          error: 'Duplicate Detected',
          message: `Potential duplicate invoice found: ${warning.reason}`,
          duplicate: warning,
          hint: 'To create the invoice anyway, resend the request with "force": true in the body.',
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    // Read confidence from _meta or from confidence_score column
    const overallConfidence = meta.confidence_scores?.overall
      ?? (typeof extraction.confidence_score === 'number' ? extraction.confidence_score / 100 : null)

    // Create invoice from extraction
    const invoiceData = {
      company_id: companyId,
      invoice_number: finalData.invoice_number,
      amount: finalData.amount || 0,
      tax_amount: finalData.tax_amount || 0,
      invoice_date: finalData.invoice_date,
      due_date: finalData.due_date,
      description: finalData.description,
      vendor_id: vendor_id || null,
      job_id: job_id || null,
      cost_code_id: cost_code_id || null,
      status: 'draft',
      invoice_type: 'standard',
      payment_terms: finalData.payment_terms || 'Net 30',
      retainage_percent: finalData.retainage_percent || 0,
      ai_confidence: overallConfidence,
      ai_notes: `AI extracted from ${meta.original_filename || 'uploaded document'}`,
      is_auto_coded: !!cost_code_id,
      extraction_id: extraction.id,
      pdf_url: meta.file_url || null,
      created_by: userId,
      billing_period_start: null,
      billing_period_end: null,
      percent_complete: finalData.percent_complete || null,
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices' as any)
      .insert(invoiceData)
      .select()
      .single()

    if (invoiceError) {
      const mapped = mapDbError(invoiceError)
      return NextResponse.json(
        { error: mapped.error, message: `Failed to create invoice: ${mapped.message}`, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Create line items if extracted
    if (finalData.line_items?.length) {
      const lineItems = finalData.line_items.map((li: Record<string, unknown>, i: number) => ({
        invoice_id: invoice.id,
        description: li.description || 'Line item',
        quantity: li.quantity || 1,
        unit: li.unit || 'each',
        unit_price: li.unit_price || li.amount || 0,
        amount: li.amount || 0,
        sort_order: i,
      }))

      await supabase
        .from('invoice_line_items' as any)
        .insert(lineItems)
    }

    // Update extraction record — store corrections in _meta for AI learning
    const updatedMeta = {
      ...meta,
      corrections: trackedCorrections.length > 0 ? trackedCorrections : undefined,
      corrected_at: trackedCorrections.length > 0 ? new Date().toISOString() : undefined,
      corrected_by: trackedCorrections.length > 0 ? userId : undefined,
    }
    const { error: updateExtractionError } = await supabase
      .from('invoice_extractions' as any)
      .update({
        status: 'completed',
        vendor_match_id: vendor_id || null,
        job_match_id: job_id || null,
        matched_bill_id: invoice.id,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        extracted_data: { ...finalData, _meta: updatedMeta },
      })
      .eq('id', id)

    // Build response — include duplicate warning if we proceeded with force
    const response: Record<string, unknown> = {
      invoice,
      extraction_id: id,
      corrections_tracked: trackedCorrections.length,
    }

    if (updateExtractionError) {
      response.extraction_update_warning = updateExtractionError.message
    }

    if (duplicateResult.has_duplicate && force) {
      response.duplicate_override = true
      response.duplicate_warning = buildDuplicateWarningMeta(duplicateResult)
    }

    return NextResponse.json({ data: response, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.confirm' }
)
