/**
 * Document by ID — Get, Update, Delete
 *
 * GET    /api/v2/documents/:id — Get document metadata
 * PUT    /api/v2/documents/:id — Update document metadata
 * DELETE /api/v2/documents/:id — Soft delete (archive) document
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateDocumentSchema } from '@/lib/validation/schemas/documents'

// ============================================================================
// GET /api/v2/documents/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing document ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .neq('status', 'deleted')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch tags
    const { data: tags } = await supabase
      .from('document_tags')
      .select('tag')
      .eq('document_id', id)

    // Fetch versions
    const { data: versions } = await supabase
      .from('document_versions')
      .select('id, version_number, file_size, mime_type, change_notes, uploaded_by, created_at')
      .eq('document_id', id)
      .order('version_number', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        tags: (tags ?? []).map((t: { tag: string }) => t.tag),
        versions: versions ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/documents/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing document ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateDocumentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.filename !== undefined) updates.filename = input.filename
    if (input.folder_id !== undefined) updates.folder_id = input.folder_id
    if (input.document_type !== undefined) updates.document_type = input.document_type

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Update tags if provided
    if (input.tags !== undefined) {
      // Remove existing tags
      const { error: deleteTagError } = await supabase.from('document_tags')
        .delete()
        .eq('document_id', id)

      if (deleteTagError) {
        const mapped = mapDbError(deleteTagError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }

      // Insert new tags
      if (input.tags.length > 0) {
        const tagRecords = input.tags.map((tag) => ({
          document_id: id,
          tag,
        }))
        const { error: insertTagError } = await supabase.from('document_tags').insert(tagRecords)
        if (insertTagError) {
          const mapped = mapDbError(insertTagError)
          return NextResponse.json(
            { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
            { status: mapped.status }
          )
        }
      }
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// DELETE /api/v2/documents/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing document ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('documents')
      .update({ status: 'archived', deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)
