/**
 * Mark Vendor Message as Read
 *
 * POST /api/v2/vendor-portal/messages/:id/read — Mark a message as read
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/vendor-portal/messages/:id/read
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing message ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify message exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('vendor_messages')
      .select('id, is_read')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Message not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.is_read) {
      // Already read, return current state
      const { data } = await (supabase as any)
        .from('vendor_messages')
        .select('*')
        .eq('id', id)
        .single()

      return NextResponse.json({ data, requestId: ctx.requestId })
    }

    const { data, error } = await (supabase as any)
      .from('vendor_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
