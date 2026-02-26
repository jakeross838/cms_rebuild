/**
 * Trigger Sync for a Connection
 *
 * POST /api/v2/integrations/connections/:id/sync — Trigger manual sync
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { triggerSyncSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// POST /api/v2/integrations/connections/:id/sync
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    // Extract connection ID from path: /api/v2/integrations/connections/:id/sync
    const segments = req.nextUrl.pathname.split('/')
    const syncIdx = segments.indexOf('sync')
    const id = syncIdx > 0 ? segments[syncIdx - 1] : null

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing connection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = triggerSyncSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid sync parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify connection exists and is connected
    const { data: connection } = await supabase
      .from('accounting_connections')
      .select('id, status, provider')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Connection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (connection.status === 'disconnected') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot sync a disconnected connection. Please reconnect first.', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    if (connection.status === 'syncing') {
      return NextResponse.json(
        { error: 'Conflict', message: 'A sync is already in progress for this connection', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Create sync log entry
    const { data: syncLog, error: logError } = await supabase
      .from('sync_logs')
      .insert({
        company_id: ctx.companyId!,
        connection_id: id,
        sync_type: input.sync_type,
        direction: input.direction,
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (logError) {
      return NextResponse.json(
        { error: 'Database Error', message: logError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Update connection status to syncing
    await supabase
      .from('accounting_connections')
      .update({
        status: 'syncing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    // Note: Actual sync work would be dispatched to a background job queue.
    // For V1, we return the sync log ID so the client can poll for status.

    return NextResponse.json({
      data: {
        sync_log_id: syncLog.id,
        connection_id: id,
        provider: connection.provider,
        sync_type: input.sync_type,
        direction: input.direction,
        status: 'started',
        message: 'Sync initiated. Check sync logs for progress.',
      },
      requestId: ctx.requestId,
    }, { status: 202 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
