/**
 * Punch Item Photos — List & Add
 *
 * GET  /api/v2/punch-list/:id/photos — List photos for a punch item
 * POST /api/v2/punch-list/:id/photos — Add a photo to a punch item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createPunchItemPhotoSchema } from '@/lib/validation/schemas/punch-list'

/**
 * Extract punch item ID from path like /api/v2/punch-list/:id/photos
 */
function extractPunchItemId(pathname: string): string | null {
  const segments = pathname.split('/')
  const punchIdx = segments.indexOf('punch-list')
  return punchIdx !== -1 && punchIdx + 1 < segments.length ? segments[punchIdx + 1] : null
}

// ============================================================================
// GET /api/v2/punch-list/:id/photos
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const punchItemId = extractPunchItemId(req.nextUrl.pathname)
    if (!punchItemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing punch item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify punch item exists and belongs to company
    const { data: existing, error: existError } = await (supabase as any)
      .from('punch_items')
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

    const { data, error } = await (supabase as any)
      .from('punch_item_photos')
      .select('*')
      .eq('punch_item_id', punchItemId)
      .order('uploaded_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/punch-list/:id/photos — Add photo
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const punchItemId = extractPunchItemId(req.nextUrl.pathname)
    if (!punchItemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing punch item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createPunchItemPhotoSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid photo data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify punch item exists and belongs to company
    const { data: existing, error: existError } = await (supabase as any)
      .from('punch_items')
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

    const { data, error } = await (supabase as any)
      .from('punch_item_photos')
      .insert({
        company_id: ctx.companyId!,
        punch_item_id: punchItemId,
        photo_url: input.photo_url,
        caption: input.caption ?? null,
        photo_type: input.photo_type,
        uploaded_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
