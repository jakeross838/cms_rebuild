/**
 * Punch Item Photo by ID — Delete
 *
 * DELETE /api/v2/punch-list/:id/photos/:photoId — Delete a photo
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

/**
 * Extract punch item ID and photo ID from path like
 * /api/v2/punch-list/:id/photos/:photoId
 */
function extractIds(pathname: string): { punchItemId: string | null; photoId: string | null } {
  const segments = pathname.split('/')
  const punchIdx = segments.indexOf('punch-list')
  const photosIdx = segments.indexOf('photos')
  return {
    punchItemId: punchIdx !== -1 && punchIdx + 1 < segments.length ? segments[punchIdx + 1] : null,
    photoId: photosIdx !== -1 && photosIdx + 1 < segments.length ? segments[photosIdx + 1] : null,
  }
}

// ============================================================================
// DELETE /api/v2/punch-list/:id/photos/:photoId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { punchItemId, photoId } = extractIds(req.nextUrl.pathname)
    if (!punchItemId || !photoId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing punch item ID or photo ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify punch item belongs to company
    const { data: existing, error: existError } = await (supabase
      .from('punch_items') as any)
      .select('id')
      .eq('id', punchItemId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Punch item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('punch_item_photos') as any)
      .delete()
      .eq('id', photoId)
      .eq('punch_item_id', punchItemId)

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
