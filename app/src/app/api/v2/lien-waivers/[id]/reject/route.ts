/**
 * Reject Lien Waiver — received/pending/sent -> rejected
 *
 * POST /api/v2/lien-waivers/:id/reject
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/lien-waivers/:id/reject
// ============================================================================

const REJECTABLE_STATUSES = ['received', 'pending', 'sent']

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /lien-waivers/:id/reject
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing lien waiver ID', requestId: ctx.requestId }, { status: 400 })
    }

    // Parse optional body
    let reason: string | undefined
    try {
      const body = await req.json()
      reason = body?.reason
    } catch {
      // No body or invalid JSON — that's fine, reason is optional
    }

    const supabase = await createClient()

    // Verify waiver exists and belongs to the company
    const { data: existing, error: existError } = await supabase
      .from('lien_waivers')
      .select('id, status, notes')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lien waiver not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (!REJECTABLE_STATUSES.includes(existing.status)) {
      return NextResponse.json(
        { error: 'Forbidden', message: `Only waivers with status ${REJECTABLE_STATUSES.join(', ')} can be rejected`, requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build updated notes — append rejection reason without overwriting
    const now = new Date().toISOString()
    let updatedNotes = existing.notes || ''
    if (reason) {
      const separator = updatedNotes ? '\n' : ''
      updatedNotes = `${updatedNotes}${separator}[Rejected ${now}] ${reason}`
    }

    const { data, error } = await supabase
      .from('lien_waivers')
      .update({
        status: 'rejected',
        notes: updatedNotes,
        updated_at: now,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('id, company_id, job_id, vendor_id, waiver_type, status, amount, through_date, document_id, payment_id, check_number, claimant_name, notes, requested_by, requested_at, received_at, approved_by, approved_at, created_at, updated_at')
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'lien_waiver.reject' }
)
