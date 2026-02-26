/**
 * Notifications API — List & Emit
 *
 * GET  /api/v2/notifications — List notifications for current user
 * POST /api/v2/notifications — Emit a notification (internal/admin use)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { emitNotification } from '@/lib/notifications/service'
import { listNotificationsSchema, emitNotificationSchema } from '@/lib/validation/schemas/notifications'

interface NotificationRow {
  id: string
  company_id: string
  user_id: string
  event_type: string
  category: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  url_path: string | null
  urgency: string
  read: boolean
  read_at: string | null
  archived: boolean
  snoozed_until: string | null
  triggered_by: string | null
  job_id: string | null
  created_at: string
}

// ============================================================================
// GET /api/v2/notifications — List notifications for current user
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listNotificationsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      urgency: url.searchParams.get('urgency') ?? undefined,
      read: url.searchParams.get('read') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .eq('archived', false) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: NotificationRow[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.category) {
      query = query.eq('category', filters.category) as typeof query
    }
    if (filters.urgency) {
      query = query.eq('urgency', filters.urgency) as typeof query
    }
    if (filters.read !== undefined) {
      query = query.eq('read', filters.read) as typeof query
    }

    query = query.order('created_at', { ascending: false }) as typeof query

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/notifications — Emit a notification
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = emitNotificationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid notification data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data

    const result = await emitNotification({
      companyId: ctx.companyId!,
      eventType: input.event_type,
      category: input.category,
      title: input.title,
      body: input.body,
      urgency: input.urgency,
      entityType: input.entity_type,
      entityId: input.entity_id,
      urlPath: input.url_path,
      jobId: input.job_id,
      triggeredBy: ctx.user!.id,
      recipientUserIds: input.recipient_user_ids,
    })

    return NextResponse.json({ data: result, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
