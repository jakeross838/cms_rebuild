/**
 * Permit Document by ID — Get, Delete
 *
 * GET    /api/v2/permits/:id/documents/:docId — Get document
 * DELETE /api/v2/permits/:id/documents/:docId — Delete document
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

function extractIds(pathname: string) {
  const segments = pathname.split('/')
  const permitsIdx = segments.indexOf('permits')
  const documentsIdx = segments.indexOf('documents')
  return {
    permitId: permitsIdx >= 0 && segments.length > permitsIdx + 1 ? segments[permitsIdx + 1] : null,
    docId: documentsIdx >= 0 && segments.length > documentsIdx + 1 ? segments[documentsIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/permits/:id/documents/:docId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { permitId, docId } = extractIds(req.nextUrl.pathname)

    if (!permitId || !docId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing permit or document ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('permit_documents')
      .select('*')
      .eq('id', docId)
      .eq('permit_id', permitId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// DELETE /api/v2/permits/:id/documents/:docId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { permitId, docId } = extractIds(req.nextUrl.pathname)

    if (!permitId || !docId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing permit or document ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: existing, error: existError } = await supabase
      .from('permit_documents')
      .select('id')
      .eq('id', docId)
      .eq('permit_id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('permit_documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', docId)
      .eq('permit_id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'permits_document.archive' }
)
