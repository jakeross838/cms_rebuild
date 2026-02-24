/**
 * Permit Document by ID — Get, Delete
 *
 * GET    /api/v2/permits/:id/documents/:docId — Get document
 * DELETE /api/v2/permits/:id/documents/:docId — Delete document
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// GET /api/v2/permits/:id/documents/:docId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const docId = segments[segments.length - 1]

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('permit_documents') as any)
      .select('*')
      .eq('id', docId)
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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/permits/:id/documents/:docId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const docId = segments[segments.length - 1]

    const supabase = await createClient()

    // Verify ownership
    const { data: existing, error: existError } = await (supabase
      .from('permit_documents') as any)
      .select('id')
      .eq('id', docId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('permit_documents') as any)
      .delete()
      .eq('id', docId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
