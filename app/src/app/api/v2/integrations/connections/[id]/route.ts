/**
 * Accounting Connection by ID — Get, Update, Delete (disconnect)
 *
 * GET    /api/v2/integrations/connections/:id — Get connection details
 * PUT    /api/v2/integrations/connections/:id — Update connection settings
 * DELETE /api/v2/integrations/connections/:id — Disconnect (soft delete)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateConnectionSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// GET /api/v2/integrations/connections/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing connection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: connection, error } = await supabase
      .from('accounting_connections')
      .select('id, company_id, provider, status, external_company_id, external_company_name, last_sync_at, sync_direction, settings, created_at, updated_at, deleted_at')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !connection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Connection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch mapping counts by entity type
    const { data: mappings } = await supabase
      .from('sync_mappings')
      .select('entity_type, sync_status')
      .eq('connection_id', id)

    // Fetch recent sync logs
    const { data: recentLogs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('connection_id', id)
      .order('started_at', { ascending: false })
      .limit(5)

    // Count pending conflicts
    const { count: pendingConflicts } = await supabase
      .from('sync_conflicts')
      .select('id', { count: 'exact', head: true })
      .eq('connection_id', id)
      .eq('resolution', 'pending')

    return NextResponse.json({
      data: {
        ...connection,
        mappings: mappings ?? [],
        recent_sync_logs: recentLogs ?? [],
        pending_conflicts_count: pendingConflicts ?? 0,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/integrations/connections/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing connection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateConnectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify connection exists
    const { data: existing } = await supabase
      .from('accounting_connections')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Connection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.status !== undefined) updates.status = input.status
    if (input.external_company_id !== undefined) updates.external_company_id = input.external_company_id
    if (input.external_company_name !== undefined) updates.external_company_name = input.external_company_name
    if (input.sync_direction !== undefined) updates.sync_direction = input.sync_direction
    if (input.settings !== undefined) updates.settings = input.settings

    const { data: connection, error: connError } = await supabase
      .from('accounting_connections')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('id, company_id, provider, status, external_company_id, external_company_name, last_sync_at, sync_direction, settings, created_at, updated_at, deleted_at')
      .single()

    if (connError) {
      const mapped = mapDbError(connError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: connection, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/integrations/connections/:id — Disconnect (soft delete)
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing connection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify connection exists
    const { data: existing } = await supabase
      .from('accounting_connections')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Connection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Soft delete: set status to disconnected and mark deleted
    const { error } = await supabase
      .from('accounting_connections')
      .update({
        status: 'disconnected',
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        token_expires_at: null,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
