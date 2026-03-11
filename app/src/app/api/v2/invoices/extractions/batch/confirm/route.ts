/**
 * Batch Confirm Extractions — Create invoices from multiple AI extractions
 *
 * POST /api/v2/invoices/extractions/batch/confirm
 *
 * Accepts up to 50 extraction IDs. For each actionable extraction, creates an
 * invoice from extracted data (same logic as single confirm). Skips duplicates
 * unless force=true.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { checkForDuplicates } from '@/lib/invoice/duplicate-detector'
import { createServiceClient } from '@/lib/supabase/service'

const BatchConfirmSchema = z.object({
  extraction_ids: z.array(z.string().uuid()).min(1).max(50),
  force: z.boolean().optional().default(false),
})

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.validatedBody as z.infer<typeof BatchConfirmSchema>
    const { extraction_ids, force } = body

    const supabase = createServiceClient()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id

    const results: Array<{
      extraction_id: string
      status: 'confirmed' | 'skipped' | 'error'
      invoice_id?: string
      error?: string
    }> = []

    let confirmed = 0
    let skipped = 0
    let errors = 0

    for (const extractionId of extraction_ids) {
      try {
        // Fetch extraction — verify it belongs to company
        const { data: extraction, error: fetchError } = await (supabase as any)
          .from('invoice_extractions')
          .select('*')
          .eq('id', extractionId)
          .eq('company_id', companyId)
          .single()

        if (fetchError || !extraction) {
          results.push({ extraction_id: extractionId, status: 'error', error: 'Extraction not found' })
          errors++
          continue
        }

        // Only actionable statuses: completed (not yet reviewed) or needs_review
        const isActionable =
          (extraction.status === 'completed' && !extraction.reviewed_by) ||
          extraction.status === 'needs_review'

        if (!isActionable) {
          results.push({ extraction_id: extractionId, status: 'skipped', error: `Not actionable (status: ${extraction.status})` })
          skipped++
          continue
        }

        // Parse extracted data
        const extractedRaw = extraction.extracted_data || {}
        const meta = extractedRaw._meta || {}
        const { _meta, ...extractedFields } = extractedRaw

        // Duplicate detection
        const duplicateResult = await checkForDuplicates(
          supabase,
          companyId,
          {
            vendor_name: extractedFields.vendor_name,
            vendor_id: (meta.vendor_match as Record<string, unknown>)?.matched_vendor_id as string || null,
            invoice_number: extractedFields.invoice_number,
            amount: extractedFields.amount,
            invoice_date: extractedFields.invoice_date,
          }
        )

        if (duplicateResult.has_duplicate && !force) {
          results.push({ extraction_id: extractionId, status: 'skipped', error: 'Duplicate detected' })
          skipped++
          continue
        }

        // Read confidence from _meta or confidence_score column
        const overallConfidence = meta.confidence_scores?.overall
          ?? (typeof extraction.confidence_score === 'number' ? extraction.confidence_score / 100 : null)

        // Resolve vendor/job/cost_code from _meta matches
        const vendorId = (meta.vendor_match as Record<string, unknown>)?.matched_vendor_id as string || null
        const costCodeMatch = (meta.cost_code_match as Record<string, unknown>)?.invoice_level as Record<string, unknown> | undefined
        const costCodeId = costCodeMatch?.matched_cost_code_id as string || null

        // Create invoice
        const invoiceData = {
          company_id: companyId,
          invoice_number: extractedFields.invoice_number,
          amount: extractedFields.amount || 0,
          tax_amount: extractedFields.tax_amount || 0,
          invoice_date: extractedFields.invoice_date,
          due_date: extractedFields.due_date,
          description: extractedFields.description,
          vendor_id: vendorId,
          job_id: null,
          cost_code_id: costCodeId,
          status: 'draft',
          invoice_type: 'standard',
          payment_terms: extractedFields.payment_terms || 'Net 30',
          retainage_percent: extractedFields.retainage_percent || 0,
          ai_confidence: overallConfidence,
          ai_notes: `AI extracted from ${meta.original_filename || 'uploaded document'}`,
          is_auto_coded: !!costCodeId,
          extraction_id: extraction.id,
          pdf_url: meta.file_url || null,
          created_by: userId,
          billing_period_start: null,
          billing_period_end: null,
          percent_complete: extractedFields.percent_complete || null,
        }

        const { data: invoice, error: invoiceError } = await (supabase as any)
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single()

        if (invoiceError) {
          const mapped = mapDbError(invoiceError)
          results.push({ extraction_id: extractionId, status: 'error', error: mapped.message })
          errors++
          continue
        }

        // Create line items if extracted
        if (extractedFields.line_items?.length) {
          const lineItems = extractedFields.line_items.map((li: Record<string, unknown>, i: number) => ({
            invoice_id: invoice.id,
            description: li.description || 'Line item',
            quantity: li.quantity || 1,
            unit: li.unit || 'each',
            unit_price: li.unit_price || li.amount || 0,
            amount: li.amount || 0,
            sort_order: i,
          }))

          const { error: liError } = await (supabase as any)
            .from('invoice_line_items')
            .insert(lineItems)
          if (liError) {
            results.push({ extraction_id: extractionId, status: 'error', error: `Line items failed: ${liError.message}` })
            errors++
            continue
          }
        }

        // Update extraction record
        await (supabase as any)
          .from('invoice_extractions')
          .update({
            status: 'completed',
            matched_bill_id: invoice.id,
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', extractionId)

        results.push({ extraction_id: extractionId, status: 'confirmed', invoice_id: invoice.id })
        confirmed++
      } catch (err) {
        results.push({
          extraction_id: extractionId,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        })
        errors++
      }
    }

    return NextResponse.json({
      data: { confirmed, skipped, errors, results },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: BatchConfirmSchema,
    auditAction: 'invoice_extraction.batch_confirm',
  }
)
