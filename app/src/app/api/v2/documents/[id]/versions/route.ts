/**
 * Document Versions API
 *
 * GET  /api/v2/documents/:id/versions — List version history
 * POST /api/v2/documents/:id/versions — Upload new version
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, getPaginationParams, mapDbError, paginatedResponse, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createVersionSchema } from '@/lib/validation/schemas/documents'
import { buildStoragePath, validateFile } from '@/lib/documents/storage'

// ============================================================================
// GET /api/v2/documents/:id/versions
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /documents/:id/versions
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing document ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify document belongs to company
    const { error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (docError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)

    const { data: versions, count, error } = await supabase
      .from('document_versions')
      .select('id, version_number, file_size, mime_type, change_notes, uploaded_by, created_at', { count: 'exact' })
      .eq('document_id', id)
      .order('version_number', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(versions ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// POST /api/v2/documents/:id/versions — Create new version
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing document ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = createVersionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid version data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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

    // Get current document and latest version number
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, job_id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: latestVersion } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (latestVersion?.version_number ?? 0) + 1
    const versionId = crypto.randomUUID()
    const storagePath = buildStoragePath(ctx.companyId!, doc.job_id, input.filename, versionId)

    // Create version record
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        id: versionId,
        document_id: id,
        version_number: nextVersion,
        storage_path: storagePath,
        file_size: input.file_size,
        mime_type: input.mime_type,
        change_notes: input.change_notes ?? null,
        uploaded_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (versionError) {
      const mapped = mapDbError(versionError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Update document's current version and metadata
    const { error: docErr } = await supabase
      .from('documents')
      .update({
        current_version_id: versionId,
        storage_path: storagePath,
        file_size: input.file_size,
        mime_type: input.mime_type,
        filename: input.filename,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (docErr) {
      const mapped = mapDbError(docErr)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: version, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'documents_version.create' }
)
