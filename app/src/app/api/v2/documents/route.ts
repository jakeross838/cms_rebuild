/**
 * Documents API — List & Upload
 *
 * GET  /api/v2/documents — List/search documents
 * POST /api/v2/documents — Create document metadata (after file upload to storage)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { listDocumentsSchema, uploadDocumentSchema } from '@/lib/validation/schemas/documents'
import { buildStoragePath, validateFile } from '@/lib/documents/storage'

interface DocumentRow {
  id: string
  company_id: string
  job_id: string | null
  folder_id: string | null
  filename: string
  storage_path: string
  mime_type: string
  file_size: number
  document_type: string | null
  status: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

// ============================================================================
// GET /api/v2/documents
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listDocumentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      folder_id: url.searchParams.get('folder_id') ?? undefined,
      document_type: url.searchParams.get('document_type') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      tag: url.searchParams.get('tag') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .neq('status', 'deleted')

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.folder_id) {
      query = query.eq('folder_id', filters.folder_id)
    }
    if (filters.document_type) {
      query = query.eq('document_type', filters.document_type)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.ilike('filename', `%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/documents — Create document record
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = uploadDocumentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid document data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Validate file
    const fileError = validateFile(input.filename, input.file_size)
    if (fileError) {
      return NextResponse.json(
        { error: 'Validation Error', message: fileError, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const documentId = crypto.randomUUID()
    const storagePath = buildStoragePath(ctx.companyId!, input.job_id ?? null, input.filename, documentId)

    // Create document record
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        company_id: ctx.companyId!,
        job_id: input.job_id ?? null,
        folder_id: input.folder_id ?? null,
        filename: input.filename,
        storage_path: storagePath,
        mime_type: input.mime_type,
        file_size: input.file_size,
        document_type: input.document_type ?? null,
        uploaded_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (docError) {
      return NextResponse.json(
        { error: 'Database Error', message: docError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Create initial version record
    await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: 1,
        storage_path: storagePath,
        file_size: input.file_size,
        mime_type: input.mime_type,
        uploaded_by: ctx.user!.id,
      })

    // Add tags if provided
    if (input.tags && input.tags.length > 0) {
      const tagRecords = input.tags.map((tag) => ({
        document_id: documentId,
        tag,
      }))
      await supabase.from('document_tags').insert(tagRecords)
    }

    return NextResponse.json({ data: doc, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'heavy' }
)
