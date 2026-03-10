/**
 * Async Invoice Extraction Processor
 *
 * Contains the heavy processing logic extracted from the extract route:
 * - Claude API call (~15s)
 * - Vendor matching
 * - Cost code matching
 * - Duplicate detection
 * - DB update with results
 *
 * Designed to run as a fire-and-forget background task so the API
 * can return immediately after uploading the file and creating the
 * extraction record.
 *
 * All errors are caught internally and written to the extraction record
 * as status='failed' — this function never throws.
 */

import { getCompanySettings } from '@/lib/config'
import { extractInvoiceData } from '@/lib/invoice/ai-extractor'
import { matchCostCodes, type KnownCostCode } from '@/lib/invoice/cost-code-matcher'
import { checkForDuplicates, buildDuplicateWarningMeta } from '@/lib/invoice/duplicate-detector'
import { matchVendor, type KnownVendor } from '@/lib/invoice/vendor-matcher'
import { createLogger } from '@/lib/monitoring'
import { createServiceClient } from '@/lib/supabase/service'

const logger = createLogger({ service: 'extraction-processor' })

export interface ExtractionProcessorInput {
  /** ID of the existing invoice_extractions row */
  extractionId: string
  /** Raw file bytes */
  fileBuffer: Buffer
  /** MIME type (application/pdf, image/png, etc.) */
  fileType: string
  /** Original filename */
  filename: string
  /** Company ID for tenant isolation */
  companyId: string
  /** User who initiated the upload */
  userId: string
  /** Public URL of the uploaded file */
  fileUrl: string
  /** Timestamp (ms) when processing started — used for duration calc */
  startTimestamp: number
}

/**
 * Process an invoice extraction in the background.
 *
 * This function is designed to be called with `void processExtraction(...)`.
 * It handles its own errors — it never throws.
 */
export async function processExtraction(input: ExtractionProcessorInput): Promise<void> {
  const {
    extractionId,
    fileBuffer,
    fileType,
    filename,
    companyId,
    userId,
    fileUrl,
    startTimestamp,
  } = input

  const supabase = createServiceClient()

  try {
    // -----------------------------------------------------------------------
    // 1. Fetch company context + AI settings for better extraction
    // -----------------------------------------------------------------------
    let companyContext: { vendorNames?: string[]; costCodes?: string[]; jobNames?: string[] } = {}
    let knownVendors: KnownVendor[] = []
    let knownCostCodes: KnownCostCode[] = []

    // Load AI settings (confidence thresholds, duplicate detection, etc.)
    const settings = await getCompanySettings(companyId)

    try {
      const [vendors, costCodes, jobs] = await Promise.all([
        supabase.from('vendors').select('id, name').eq('company_id', companyId).limit(100),
        supabase.from('cost_codes' as any).select('id, code, name').eq('company_id', companyId).limit(200),
        supabase.from('jobs').select('name, job_number').eq('company_id', companyId).is('deleted_at', null).limit(100),
      ])
      knownVendors = (vendors.data as { id: string; name: string }[] | null)?.map((v) => ({ id: v.id, name: v.name })) || []
      knownCostCodes = (costCodes.data as { id: string; code: string; name: string }[] | null)?.map((c) => ({ id: c.id, code: c.code, name: c.name })) || []
      companyContext = {
        vendorNames: knownVendors.map((v) => v.name),
        costCodes: knownCostCodes.map((c) => `${c.code} - ${c.name}`),
        jobNames: jobs.data?.map((j: { name: string; job_number: string | null }) => `${j.job_number ?? ''} - ${j.name}`) || [],
      }
    } catch {
      // Continue without context — extraction can still proceed
      logger.warn('Failed to fetch company context for extraction', { companyId, extractionId })
    }

    // -----------------------------------------------------------------------
    // 2. Call Claude API for AI extraction
    // -----------------------------------------------------------------------
    const result = await extractInvoiceData({
      fileBytes: new Uint8Array(fileBuffer),
      fileType,
      filename,
      companyContext,
    })
    const processingEnd = new Date().toISOString()
    const durationMs = Date.now() - startTimestamp

    // -----------------------------------------------------------------------
    // 3. Run vendor matching against company vendor list
    // -----------------------------------------------------------------------
    const vendorMatch = matchVendor(result.data.vendor_name, knownVendors)

    // -----------------------------------------------------------------------
    // 4. Run cost code matching against company cost codes
    // -----------------------------------------------------------------------
    const costCodeMatch = matchCostCodes(
      result.data.line_items || [],
      result.data.cost_code_reference,
      knownCostCodes
    )

    // -----------------------------------------------------------------------
    // 5. Run duplicate detection against existing invoices (if enabled)
    // -----------------------------------------------------------------------
    let duplicateWarning = buildDuplicateWarningMeta({ has_duplicate: false, match: null, all_matches: [], hash: null })
    if (settings.aiDuplicateDetectionEnabled) {
      const duplicateResult = await checkForDuplicates(
        supabase,
        companyId,
        {
          vendor_name: result.data.vendor_name,
          vendor_id: vendorMatch.autoAssigned ? vendorMatch.bestMatch!.vendor.id : undefined,
          invoice_number: result.data.invoice_number,
          amount: result.data.amount,
          invoice_date: result.data.invoice_date,
        }
      )
      duplicateWarning = buildDuplicateWarningMeta(duplicateResult)
    }

    // -----------------------------------------------------------------------
    // 6. Build extracted_data payload and update the DB record
    // -----------------------------------------------------------------------
    const extractedData = {
      ...result.data,
      _meta: {
        source_type: 'upload',
        original_filename: filename,
        file_url: fileUrl,
        file_type: fileType,
        created_by: userId,
        processing_started_at: new Date(startTimestamp).toISOString(),
        processing_completed_at: processingEnd,
        raw_text: '[PDF sent directly to Claude for extraction]',
        confidence_scores: result.confidence,
        vendor_match: {
          auto_assigned: vendorMatch.autoAssigned,
          confidence: vendorMatch.bestMatch?.confidence ?? null,
          matched_vendor_id: vendorMatch.autoAssigned ? vendorMatch.bestMatch!.vendor.id : null,
          matched_vendor_name: vendorMatch.bestMatch?.vendor.name ?? null,
          suggestions: vendorMatch.suggestions.map((s) => ({
            vendor_id: s.vendor.id,
            vendor_name: s.vendor.name,
            confidence: s.confidence,
          })),
        },
        cost_code_match: {
          invoice_level: {
            auto_assigned: costCodeMatch.invoice_level.auto_assigned,
            confidence: costCodeMatch.invoice_level.best_match?.confidence ?? null,
            matched_cost_code_id: costCodeMatch.invoice_level.auto_assigned
              ? costCodeMatch.invoice_level.best_match!.cost_code_id
              : null,
            matched_cost_code: costCodeMatch.invoice_level.best_match?.cost_code ?? null,
            matched_cost_code_name: costCodeMatch.invoice_level.best_match?.cost_code_name ?? null,
            suggestions: costCodeMatch.invoice_level.suggestions.map((s) => ({
              cost_code_id: s.cost_code_id,
              cost_code: s.cost_code,
              cost_code_name: s.cost_code_name,
              confidence: s.confidence,
            })),
          },
          line_item_matches: costCodeMatch.line_item_matches.map((m) => ({
            line_item_index: m.line_item_index,
            description: m.description,
            auto_assigned: m.auto_assigned,
            confidence: m.best_match?.confidence ?? null,
            matched_cost_code_id: m.auto_assigned ? m.best_match!.cost_code_id : null,
            matched_cost_code: m.best_match?.cost_code ?? null,
            matched_cost_code_name: m.best_match?.cost_code_name ?? null,
            suggestions: m.suggestions.map((s) => ({
              cost_code_id: s.cost_code_id,
              cost_code: s.cost_code,
              cost_code_name: s.cost_code_name,
              confidence: s.confidence,
            })),
          })),
        },
        duplicate_check: duplicateWarning,
        ai_settings: {
          automation_level: settings.aiAutomationLevel,
          high_confidence_threshold: settings.aiHighConfidenceThreshold,
          medium_confidence_threshold: settings.aiMediumConfidenceThreshold,
          auto_match_confidence: settings.autoMatchConfidence,
        },
      },
    }

    // Determine status based on confidence vs configured thresholds
    const overallConfidencePercent = Math.round((result.confidence.overall ?? 0.5) * 100)
    const extractionStatus = overallConfidencePercent < settings.aiMediumConfidenceThreshold
      ? 'needs_review'
      : 'completed'

    const updatePayload: Record<string, unknown> = {
      status: extractionStatus,
      extracted_data: extractedData,
      confidence_score: overallConfidencePercent,
      processing_time_ms: durationMs,
      updated_at: processingEnd,
    }

    // Auto-assign vendor_match_id if confidence is high enough
    if (vendorMatch.autoAssigned && vendorMatch.bestMatch) {
      updatePayload.vendor_match_id = vendorMatch.bestMatch.vendor.id
    }

    await supabase
      .from('invoice_extractions' as any)
      .update(updatePayload as any)
      .eq('id', extractionId)

    logger.info('Extraction completed successfully', {
      extractionId,
      companyId,
      durationMs: String(durationMs),
    })
  } catch (err: unknown) {
    // -----------------------------------------------------------------------
    // Error handling — update the record to 'failed' status
    // -----------------------------------------------------------------------
    const errorMessage = err instanceof Error ? err.message : 'Unknown extraction error'

    logger.error('Extraction processing failed', {
      extractionId,
      companyId,
      error: errorMessage,
    })

    try {
      await supabase
        .from('invoice_extractions' as any)
        .update({
          status: 'failed',
          error_message: errorMessage,
          extracted_data: {
            _meta: {
              source_type: 'upload',
              original_filename: filename,
              file_url: fileUrl,
              file_type: fileType,
              created_by: userId,
              raw_text: '[PDF sent directly to Claude for extraction]',
            },
          },
          processing_time_ms: Date.now() - startTimestamp,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', extractionId)
    } catch (updateErr: unknown) {
      // Last-resort error — can't even update the record
      const updateErrMsg = updateErr instanceof Error ? updateErr.message : 'Unknown error'
      logger.error('Failed to update extraction record after processing error', {
        extractionId,
        companyId,
        error: updateErrMsg,
      })
    }
  }
}
