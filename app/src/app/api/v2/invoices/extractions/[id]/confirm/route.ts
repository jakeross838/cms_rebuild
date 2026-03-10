/**
 * Confirm Extraction — Create Invoice from AI Extraction
 *
 * POST /api/v2/invoices/extractions/:id/confirm — Confirm & create invoice
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

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
    const { corrections, vendor_id, job_id, cost_code_id } = body

    const supabase = await createClient()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id

    // Get extraction
    const { data: extraction, error: fetchError } = await (supabase as any)
      .from('invoice_extractions')
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

    // Merge extracted data with corrections
    const extracted = extraction.extracted_data || {}
    const finalData = { ...extracted, ...corrections }

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
      ai_confidence: extraction.confidence_scores?.overall || null,
      ai_notes: `AI extracted from ${extraction.original_filename}`,
      is_auto_coded: !!cost_code_id,
      extraction_id: extraction.id,
      pdf_url: extraction.file_url,
      created_by: userId,
      billing_period_start: null,
      billing_period_end: null,
      percent_complete: finalData.percent_complete || null,
    }

    const { data: invoice, error: invoiceError } = await (supabase as any)
      .from('invoices')
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

      await (supabase as any)
        .from('invoice_line_items')
        .insert(lineItems)
    }

    // Update extraction record
    await (supabase as any)
      .from('invoice_extractions')
      .update({
        status: 'confirmed',
        invoice_id: invoice.id,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        corrections: corrections || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ data: { invoice, extraction_id: id }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.confirm' }
)
