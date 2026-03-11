/**
 * Invoice Activity API
 *
 * GET  /api/v2/invoices/:id/activity — List activity for an invoice
 * POST /api/v2/invoices/:id/activity — Record a new activity entry
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// ============================================================================
// GET /api/v2/invoices/:id/activity
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Verify invoice belongs to this company
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 },
      )
    }

    // Fetch activities
    const { data: rawActivities, error } = await (supabase as any)
      .from('invoice_activity')
      .select('id, action, performed_by, details, created_at')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status },
      )
    }

    const activities = rawActivities ?? []

    // Resolve user names
    const userIds = new Set<string>()
    for (const a of activities) {
      if (a.performed_by) userIds.add(a.performed_by)
    }

    let userMap: Record<string, string> = {}
    if (userIds.size > 0) {
      const serviceClient = createServiceClient()
      const { data: users } = await serviceClient
        .from('users')
        .select('id, full_name')
        .in('id', [...userIds])

      if (users) {
        for (const u of users) {
          userMap[u.id] = u.full_name ?? 'Unknown'
        }
      }
    }

    const data = activities.map((a: any) => ({
      ...a,
      performed_by: a.performed_by ? (userMap[a.performed_by] ?? null) : null,
    }))

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' },
)

// ============================================================================
// POST /api/v2/invoices/:id/activity
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 },
      )
    }

    const body = await req.json()
    const { action, details } = body as { action?: string; details?: Record<string, unknown> }

    if (!action) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'action is required', requestId: ctx.requestId },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any).from('invoice_activity').insert({
      invoice_id: invoiceId,
      company_id: ctx.companyId!,
      action,
      performed_by: ctx.user!.id,
      details: details ?? {},
    }).select('id, action, performed_by, details, created_at').single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status },
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' },
)
