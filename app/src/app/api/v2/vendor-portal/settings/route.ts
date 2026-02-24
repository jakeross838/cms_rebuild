/**
 * Vendor Portal Settings API — Get & Create/Update
 *
 * GET  /api/v2/vendor-portal/settings — Get portal settings for company
 * POST /api/v2/vendor-portal/settings — Create portal settings
 * PUT  /api/v2/vendor-portal/settings — Update portal settings
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createSettingsSchema, updateSettingsSchema } from '@/lib/validation/schemas/vendor-portal'

// ============================================================================
// GET /api/v2/vendor-portal/settings
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('vendor_portal_settings')
      .select('*')
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { data: null, requestId: ctx.requestId }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/vendor-portal/settings — Create settings
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createSettingsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid settings data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for existing settings
    const { data: existing } = await (supabase as any)
      .from('vendor_portal_settings')
      .select('id')
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Portal settings already exist for this company', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('vendor_portal_settings')
      .insert({
        company_id: ctx.companyId!,
        portal_enabled: input.portal_enabled,
        allow_self_registration: input.allow_self_registration,
        require_approval: input.require_approval,
        allowed_submission_types: input.allowed_submission_types,
        required_compliance_docs: input.required_compliance_docs,
        auto_approve_submissions: input.auto_approve_submissions,
        portal_welcome_message: input.portal_welcome_message ?? null,
        portal_branding: input.portal_branding,
        notification_settings: input.notification_settings,
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

// ============================================================================
// PUT /api/v2/vendor-portal/settings — Update settings
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updateSettingsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid settings data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.portal_enabled !== undefined) updates.portal_enabled = input.portal_enabled
    if (input.allow_self_registration !== undefined) updates.allow_self_registration = input.allow_self_registration
    if (input.require_approval !== undefined) updates.require_approval = input.require_approval
    if (input.allowed_submission_types !== undefined) updates.allowed_submission_types = input.allowed_submission_types
    if (input.required_compliance_docs !== undefined) updates.required_compliance_docs = input.required_compliance_docs
    if (input.auto_approve_submissions !== undefined) updates.auto_approve_submissions = input.auto_approve_submissions
    if (input.portal_welcome_message !== undefined) updates.portal_welcome_message = input.portal_welcome_message
    if (input.portal_branding !== undefined) updates.portal_branding = input.portal_branding
    if (input.notification_settings !== undefined) updates.notification_settings = input.notification_settings

    const { data, error } = await (supabase as any)
      .from('vendor_portal_settings')
      .update(updates)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Portal settings not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
