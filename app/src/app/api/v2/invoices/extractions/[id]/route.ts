/**
 * Invoice Extraction by ID — Get & Update
 *
 * GET   /api/v2/invoices/extractions/:id — Get extraction details
 *   - When status is 'processing', includes a `polling` hint so the client
 *     knows to keep polling (recommended interval: 2s).
 *   - When status is 'extracted'/'failed', returns the full data.
 * PATCH /api/v2/invoices/extractions/:id — Update extraction
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createServiceClient } from '@/lib/supabase/service'

/** Transform a raw DB record into the frontend ExtractionRecord shape */
function transformExtraction(row: Record<string, unknown>) {
  const extractedData = (row.extracted_data ?? {}) as Record<string, unknown>
  const meta = (extractedData._meta ?? {}) as Record<string, unknown>
  const confidenceScores = (meta.confidence_scores ?? {}) as Record<string, number>
  const vendorMatchMeta = (meta.vendor_match ?? null) as Record<string, unknown> | null
  const costCodeMatchMeta = (meta.cost_code_match ?? null) as Record<string, unknown> | null
  const duplicateCheckMeta = (meta.duplicate_check ?? null) as Record<string, unknown> | null
  const anomalyCheckMeta = (meta.anomaly_check ?? null) as Record<string, unknown> | null

  let status = row.status as string
  if (status === 'completed' && row.reviewed_by) status = 'confirmed'
  else if (status === 'completed') status = 'extracted'
  if (status === 'needs_review') status = 'review'

  // Derive cost_code_id and cost_code_label from cost code match metadata
  const costCodeInvoiceLevel = (costCodeMatchMeta?.invoice_level ?? null) as Record<string, unknown> | null
  const costCodeId = (costCodeInvoiceLevel?.matched_cost_code_id as string) ?? null
  const costCodeLabel = costCodeInvoiceLevel?.matched_cost_code && costCodeInvoiceLevel?.matched_cost_code_name
    ? `${costCodeInvoiceLevel.matched_cost_code} - ${costCodeInvoiceLevel.matched_cost_code_name}`
    : (extractedData.cost_code_reference as string) ?? null

  return {
    id: row.id,
    filename: (meta.original_filename as string) ?? null,
    status,
    confidence: typeof row.confidence_score === 'number'
      ? (row.confidence_score as number) / 100
      : null,
    vendor_name: (extractedData.vendor_name as string) ?? null,
    vendor_id: (row.vendor_match_id as string) ?? null,
    vendor_match: vendorMatchMeta ? {
      auto_assigned: vendorMatchMeta.auto_assigned ?? false,
      confidence: vendorMatchMeta.confidence ?? null,
      matched_vendor_id: vendorMatchMeta.matched_vendor_id ?? null,
      matched_vendor_name: vendorMatchMeta.matched_vendor_name ?? null,
      suggestions: Array.isArray(vendorMatchMeta.suggestions) ? vendorMatchMeta.suggestions : [],
    } : null,
    job_name: (extractedData.job_reference as string) ?? null,
    job_id: (row.job_match_id as string) ?? null,
    cost_code_id: costCodeId,
    cost_code_label: costCodeLabel,
    cost_code_match: costCodeMatchMeta ? {
      invoice_level: costCodeInvoiceLevel ? {
        auto_assigned: costCodeInvoiceLevel.auto_assigned ?? false,
        confidence: costCodeInvoiceLevel.confidence ?? null,
        matched_cost_code_id: costCodeInvoiceLevel.matched_cost_code_id ?? null,
        matched_cost_code: costCodeInvoiceLevel.matched_cost_code ?? null,
        matched_cost_code_name: costCodeInvoiceLevel.matched_cost_code_name ?? null,
        suggestions: Array.isArray(costCodeInvoiceLevel.suggestions) ? costCodeInvoiceLevel.suggestions : [],
      } : null,
      line_item_matches: Array.isArray(costCodeMatchMeta.line_item_matches) ? costCodeMatchMeta.line_item_matches : [],
    } : null,
    invoice_number: (extractedData.invoice_number as string) ?? null,
    invoice_date: (extractedData.invoice_date as string) ?? null,
    due_date: (extractedData.due_date as string) ?? null,
    amount: typeof extractedData.amount === 'number' ? extractedData.amount : null,
    description: (extractedData.description as string) ?? null,
    line_items: Array.isArray(extractedData.line_items) ? extractedData.line_items : [],
    field_confidences: confidenceScores,
    file_url: (meta.file_url as string) ?? null,
    duplicate_check: duplicateCheckMeta ? {
      has_duplicate: duplicateCheckMeta.has_duplicate ?? false,
      match_type: duplicateCheckMeta.match_type ?? null,
      confidence: duplicateCheckMeta.confidence ?? null,
      duplicate_invoice_id: duplicateCheckMeta.duplicate_invoice_id ?? null,
      duplicate_invoice_number: duplicateCheckMeta.duplicate_invoice_number ?? null,
      duplicate_amount: duplicateCheckMeta.duplicate_amount ?? null,
      reason: duplicateCheckMeta.reason ?? null,
    } : null,
    anomaly_check: anomalyCheckMeta ? {
      has_anomalies: anomalyCheckMeta.has_anomalies ?? false,
      risk_level: (anomalyCheckMeta.risk_level as string) ?? 'low',
      flags: Array.isArray(anomalyCheckMeta.flags) ? anomalyCheckMeta.flags : [],
    } : null,
    error_message: (row.error_message as string) ?? null,
    created_at: row.created_at,
    // Include raw DB fields too for advanced use
    extracted_data: extractedData,
    confidence_score: row.confidence_score,
  }
}

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('invoice_extractions' as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const transformed = transformExtraction(data)

    // When still processing, include a polling hint for the client
    if (transformed.status === 'processing') {
      return NextResponse.json({
        data: transformed,
        polling: {
          should_poll: true,
          interval_ms: 2000,
          message: 'Extraction is still processing. Poll again shortly.',
        },
        requestId: ctx.requestId,
      })
    }

    return NextResponse.json({ data: transformed, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('invoice_extractions' as any)
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: transformExtraction(data), requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.update' }
)
