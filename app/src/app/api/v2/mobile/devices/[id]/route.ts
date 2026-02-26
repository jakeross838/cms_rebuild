/**
 * Mobile Device by ID — Get, Update, Delete
 *
 * GET    /api/v2/mobile/devices/:id — Get device details
 * PUT    /api/v2/mobile/devices/:id — Update device
 * DELETE /api/v2/mobile/devices/:id — Soft delete (revoke) device
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMobileDeviceSchema } from '@/lib/validation/schemas/mobile-app'

// ============================================================================
// GET /api/v2/mobile/devices/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing device ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('mobile_devices')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Device not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch push token count
    const { data: tokens } = await supabase
      .from('push_notification_tokens')
      .select('id')
      .eq('device_id', id)
      .is('deleted_at', null)

    // Fetch active sessions count
    const { data: sessions } = await supabase
      .from('mobile_sessions')
      .select('id')
      .eq('device_id', id)
      .eq('status', 'active')

    return NextResponse.json({
      data: {
        ...data,
        push_tokens_count: (tokens ?? []).length,
        active_sessions_count: (sessions ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/mobile/devices/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing device ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMobileDeviceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.device_name !== undefined) updates.device_name = input.device_name
    if (input.platform !== undefined) updates.platform = input.platform
    if (input.status !== undefined) updates.status = input.status
    if (input.device_model !== undefined) updates.device_model = input.device_model
    if (input.os_version !== undefined) updates.os_version = input.os_version
    if (input.app_version !== undefined) updates.app_version = input.app_version
    if (input.device_token !== undefined) updates.device_token = input.device_token
    if (input.last_ip_address !== undefined) updates.last_ip_address = input.last_ip_address
    if (input.metadata !== undefined) updates.metadata = input.metadata

    const { data, error } = await supabase
      .from('mobile_devices')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'mobile_device.update' }
)

// ============================================================================
// DELETE /api/v2/mobile/devices/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing device ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify device exists
    const { data: existing, error: existError } = await supabase
      .from('mobile_devices')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Device not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('mobile_devices')
      .update({ deleted_at: new Date().toISOString(), status: 'revoked' })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'mobile_device.archive' }
)
