/**
 * Invoice AI Extraction — Upload & Extract
 *
 * POST /api/v2/invoices/extract — Upload a file and extract invoice data using AI
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { extractInvoiceData, extractTextFromPdf } from '@/lib/invoice/ai-extractor'
import { createClient } from '@/lib/supabase/server'

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No file uploaded', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'File type not supported. Use PDF, PNG, JPEG, or TIFF.', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer())
    const filename = file.name
    const timestamp = Date.now()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id
    const storagePath = `extractions/${companyId}/${timestamp}-${filename}`

    const supabase = await createClient()

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(storagePath, fileBytes, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Upload Error', message: `Upload failed: ${uploadError.message}`, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(storagePath)
    const fileUrl = urlData.publicUrl

    // Create extraction record
    const { data: extraction, error: insertError } = await (supabase as any)
      .from('invoice_extractions')
      .insert({
        company_id: companyId,
        status: 'processing',
        source_type: 'upload',
        original_filename: filename,
        file_url: fileUrl,
        file_type: file.type,
        processing_started_at: new Date().toISOString(),
        created_by: userId,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Database Error', message: `Failed to create extraction record: ${insertError.message}`, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Extract text from PDF
    let rawText = ''
    try {
      if (file.type === 'application/pdf') {
        rawText = await extractTextFromPdf(fileBytes)
      } else {
        rawText = `[Image file: ${filename} - OCR service needed for text extraction]`
      }
    } catch {
      rawText = `[Text extraction failed for ${filename}]`
    }

    // Fetch company context for better extraction
    let companyContext: { vendorNames?: string[]; costCodes?: string[]; jobNames?: string[] } = {}
    try {
      const [vendors, costCodes, jobs] = await Promise.all([
        supabase.from('vendors').select('name').eq('company_id', companyId).limit(100),
        supabase.from('cost_codes').select('code, name').eq('company_id', companyId).limit(200),
        supabase.from('jobs').select('name, job_number').eq('company_id', companyId).is('deleted_at', null).limit(100),
      ])
      companyContext = {
        vendorNames: vendors.data?.map((v: { name: string }) => v.name) || [],
        costCodes: costCodes.data?.map((c: { code: string; name: string }) => `${c.code} - ${c.name}`) || [],
        jobNames: jobs.data?.map((j: { name: string; job_number: string | null }) => `${j.job_number ?? ''} - ${j.name}`) || [],
      }
    } catch {
      // Continue without context
    }

    // Run AI extraction
    try {
      const result = await extractInvoiceData({ text: rawText, filename, companyContext })
      const processingEnd = new Date().toISOString()
      const durationMs = Date.now() - timestamp

      await (supabase as any)
        .from('invoice_extractions')
        .update({
          status: 'extracted',
          extracted_data: result.data,
          confidence_scores: result.confidence,
          raw_text: rawText.slice(0, 50000),
          processing_completed_at: processingEnd,
          processing_duration_ms: durationMs,
          updated_at: processingEnd,
        })
        .eq('id', extraction.id)

      return NextResponse.json({
        data: {
          extraction_id: extraction.id,
          status: 'extracted',
          extracted_data: result.data,
          confidence: result.confidence,
          file_url: fileUrl,
        },
        requestId: ctx.requestId,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown extraction error'

      await (supabase as any)
        .from('invoice_extractions')
        .update({
          status: 'failed',
          error_message: errorMessage,
          raw_text: rawText.slice(0, 50000),
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', extraction.id)

      return NextResponse.json({
        data: {
          extraction_id: extraction.id,
          status: 'failed',
          error: errorMessage,
          file_url: fileUrl,
        },
        requestId: ctx.requestId,
      }, { status: 422 })
    }
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.create' }
)
