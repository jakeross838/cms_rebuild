/**
 * Invoice PDF Stamping API
 *
 * POST /api/v2/invoices/:id/stamp — Stamp an invoice PDF with approval info
 *
 * Fetches the invoice, downloads its PDF, stamps it, uploads the stamped
 * version to Supabase Storage, and records the stamp in the database.
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { stampInvoicePdf, generateStampData } from '@/lib/invoice/pdf-stamper'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/invoices/:id/stamp
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ── 1. Fetch invoice with joined fields ──────────────────────────────────
    const { data: invoice, error: invoiceError } = await (supabase as any)
      .from('invoices')
      .select(`
        id, company_id, invoice_number, amount, status,
        vendor_id, cost_code_id, po_id, draw_number,
        approved_by, approved_at, pdf_url,
        vendors ( name ),
        cost_codes ( code, name ),
        purchase_orders ( po_number )
      `)
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (!invoice.pdf_url) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invoice has no PDF to stamp', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // ── 2. Download the original PDF ─────────────────────────────────────────
    let pdfBytes: Uint8Array
    try {
      const pdfResponse = await fetch(invoice.pdf_url)
      if (!pdfResponse.ok) {
        return NextResponse.json(
          { error: 'Bad Gateway', message: 'Failed to download invoice PDF', requestId: ctx.requestId },
          { status: 502 }
        )
      }
      const buffer = await pdfResponse.arrayBuffer()
      pdfBytes = new Uint8Array(buffer)
    } catch {
      return NextResponse.json(
        { error: 'Bad Gateway', message: 'Failed to download invoice PDF', requestId: ctx.requestId },
        { status: 502 }
      )
    }

    // ── 3. Stamp the PDF ─────────────────────────────────────────────────────
    const stampData = generateStampData(invoice as unknown as Record<string, unknown>)
    const stampedPdfBytes = await stampInvoicePdf(pdfBytes, stampData)

    // ── 4. Upload stamped PDF to Supabase Storage ────────────────────────────
    const timestamp = Date.now()
    const storagePath = `stamped/${invoiceId}-${timestamp}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(storagePath, stampedPdfBytes, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to upload stamped PDF', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Get public URL for the stamped PDF
    const { data: publicUrlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(storagePath)

    const stampedPdfUrl = publicUrlData.publicUrl

    // ── 5. Update the invoice record ─────────────────────────────────────────
    const stampedAt = new Date().toISOString()

    const { error: updateError } = await (supabase as any)
      .from('invoices')
      .update({
        stamped_pdf_url: stampedPdfUrl,
        stamped_at: stampedAt,
      })
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)

    if (updateError) {
      const mapped = mapDbError(updateError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // ── 6. Record in invoice_stamps table ────────────────────────────────────
    const { error: stampRecordError } = await (supabase as any).from('invoice_stamps').insert({
      invoice_id: invoiceId,
      company_id: ctx.companyId!,
      stamp_type: stampData.stampType,
      stamped_by: ctx.user!.id,
      stamped_at: stampedAt,
      stamped_pdf_url: stampedPdfUrl,
      stamp_data: stampData,
    })

    if (stampRecordError) {
      // Log but don't fail — the stamp itself succeeded
      console.error('Failed to record stamp in invoice_stamps:', stampRecordError)
    }

    // ── 7. Return result ─────────────────────────────────────────────────────
    return NextResponse.json({
      data: {
        invoice_id: invoiceId,
        stamped_pdf_url: stampedPdfUrl,
        stamped_at: stampedAt,
        stamp_type: stampData.stampType,
      },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office'],
    rateLimit: 'api',
    auditAction: 'invoice.stamp',
  }
)
