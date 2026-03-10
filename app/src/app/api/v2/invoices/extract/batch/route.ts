/**
 * Invoice AI Extraction — Batch Upload & Extract (Async)
 *
 * POST /api/v2/invoices/extract/batch — Upload multiple files and start async AI extraction
 *
 * Accepts FormData with multiple `files`, validates each, uploads to storage,
 * creates extraction records, and fires off background processing for each.
 * Returns a list of extraction_ids with initial status.
 *
 * Max 10 files per batch request.
 * Uses service role client to bypass RLS on invoice_extractions table.
 */

import { randomUUID } from 'crypto'

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { processExtraction } from '@/lib/invoice/extraction-processor'
import { createServiceClient } from '@/lib/supabase/service'

const MAX_BATCH_SIZE = 10
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff']

interface BatchResultItem {
  filename: string
  extraction_id: string | null
  status: 'processing' | 'error'
  file_url: string | null
  error?: string
}

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No files uploaded. Use the "files" field.', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    if (files.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: 'Bad Request', message: `Too many files. Maximum ${MAX_BATCH_SIZE} files per batch.`, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Validate all files are actual File objects with valid types
    const invalidFiles: string[] = []
    for (const file of files) {
      if (!(file instanceof File) || !file.name) {
        invalidFiles.push('(unknown)')
        continue
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(file.name)
      }
    }

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: `Unsupported file type(s): ${invalidFiles.join(', ')}. Use PDF, PNG, JPEG, or TIFF.`,
          requestId: ctx.requestId,
        },
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

    const companyId = ctx.companyId!
    const userId = ctx.user!.id
    const supabase = createServiceClient()
    const timestamp = Date.now()

    // Process each file: upload, create record, fire background processing
    const results: BatchResultItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filename = file.name
      const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `extractions/${companyId}/${timestamp}-${i}-${safeFilename}`

      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer())

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(storagePath, fileBuffer, { contentType: file.type })

        if (uploadError) {
          results.push({
            filename,
            extraction_id: null,
            status: 'error',
            file_url: null,
            error: `Upload failed: ${uploadError.message}`,
          })
          continue
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
          results.push({
            filename,
            extraction_id: null,
            status: 'error',
            file_url: null,
            error: `Database error: ${insertError.message}`,
          })
          continue
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

        results.push({
          filename,
          extraction_id: extractionId,
          status: 'processing',
          file_url: fileUrl,
        })
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results.push({
          filename,
          extraction_id: null,
          status: 'error',
          file_url: null,
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      data: {
        total: files.length,
        successful: results.filter(r => r.status === 'processing').length,
        failed: results.filter(r => r.status === 'error').length,
        items: results,
      },
      requestId: ctx.requestId,
    }, { status: 202 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.batch_create' }
)
