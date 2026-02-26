/**
 * Send Contract for Signature — draft/pending_review -> sent_for_signature
 *
 * POST /api/v2/contracts/:id/send
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { sendForSignatureSchema } from '@/lib/validation/schemas/contracts'

// ============================================================================
// POST /api/v2/contracts/:id/send
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /contracts/:id/send
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = sendForSignatureSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify contract exists and is in draft or pending_review status
    const { data: existing, error: existError } = await supabase
      .from('contracts')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contract not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft' && existing.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft or pending review contracts can be sent for signature', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'sent_for_signature',
        updated_at: now,
      })
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

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
