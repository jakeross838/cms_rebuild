/**
 * Close Bid Package — published -> closed
 *
 * POST /api/v2/bid-packages/:id/close
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { closeBidPackageSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID from /api/v2/bid-packages/:id/close
 */
function extractBidPackageId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('bid-packages')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const bidPackageId = extractBidPackageId(req.nextUrl.pathname)
    if (!bidPackageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parseResult = closeBidPackageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid close data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify bid package exists and is in published status
    const { data: existing, error: existError } = await (supabase as any)
      .from('bid_packages')
      .select('id, status')
      .eq('id', bidPackageId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid package not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'published') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only published bid packages can be closed', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('bid_packages')
      .update({ status: 'closed' })
      .eq('id', bidPackageId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
