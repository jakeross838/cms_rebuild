/**
 * GET /api/v2/documents/:id/download
 * Returns a signed download URL for the document.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { STORAGE_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from '@/lib/documents/storage'

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /documents/:id/download
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing document ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Get document record
    const { data: doc, error: docError } = await (supabase
      .from('documents') as any)
      .select('storage_path, filename, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Document not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (doc.status === 'deleted' || doc.status === 'quarantined') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Document is not available for download', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Create signed URL
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(doc.storage_path, SIGNED_URL_EXPIRY_SECONDS)

    if (urlError) {
      return NextResponse.json(
        { error: 'Storage Error', message: 'Failed to generate download URL', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        url: signedUrl.signedUrl,
        filename: doc.filename,
        expires_in: SIGNED_URL_EXPIRY_SECONDS,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)
