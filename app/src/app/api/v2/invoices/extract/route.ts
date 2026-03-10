/**
 * Invoice AI Extraction — Upload & Extract (Async)
 *
 * POST /api/v2/invoices/extract — Upload a file and start async AI extraction
 *
 * The route uploads the file, creates an extraction record with status 'processing',
 * fires off the AI processing in the background, and returns immediately.
 * The frontend polls the extractions list/detail endpoint to see when it's done.
 *
 * Uses service role client to bypass RLS on invoice_extractions table.
 * Metadata stored inside extracted_data._meta JSONB field.
 */

import { randomUUID } from 'crypto'

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { processExtraction } from '@/lib/invoice/extraction-processor'
import { createServiceClient } from '@/lib/supabase/service'

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

    // Check for ANTHROPIC_API_KEY early
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local to enable AI invoice extraction.', requestId: ctx.requestId },
        { status: 503 }
      )
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name
    const timestamp = Date.now()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id
    // Sanitize filename for storage path (replace spaces/special chars)
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `extractions/${companyId}/${timestamp}-${safeFilename}`

    // Service role client bypasses RLS
    const supabase = createServiceClient()

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(storagePath, fileBuffer, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Upload Error', message: `Upload failed: ${uploadError.message}`, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(storagePath)
    const fileUrl = urlData.publicUrl

    // Create extraction record with status 'processing'
    const placeholderDocId = randomUUID()
    const { data: extraction, error: insertError } = await supabase
      .from('invoice_extractions' as any)
      .insert({
        company_id: companyId,
        document_id: placeholderDocId,
        status: 'processing',
        extraction_model: 'claude-sonnet-4-20250514',
        extracted_data: {
          _meta: {
            source_type: 'upload',
            original_filename: filename,
            file_url: fileUrl,
            file_type: file.type,
            created_by: userId,
            processing_started_at: new Date().toISOString(),
          },
        },
      } as any)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Database Error', message: `Failed to create extraction record: ${insertError.message}`, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    const extractionId = (extraction as any).id as string

    // Fire off background processing — don't await it
    void processExtraction({
      extractionId,
      fileBuffer,
      fileType: file.type,
      filename,
      companyId,
      userId,
      fileUrl,
      startTimestamp: timestamp,
    })

    // Return immediately with extraction_id and 'processing' status
    return NextResponse.json({
      data: {
        extraction_id: extractionId,
        status: 'processing',
        file_url: fileUrl,
      },
      requestId: ctx.requestId,
    }, { status: 202 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.create' }
)
