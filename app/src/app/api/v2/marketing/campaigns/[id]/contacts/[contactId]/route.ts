/**
 * Campaign Contact by ID — Get, Update, Delete
 *
 * GET    /api/v2/marketing/campaigns/:id/contacts/:contactId — Get contact
 * PUT    /api/v2/marketing/campaigns/:id/contacts/:contactId — Update contact
 * DELETE /api/v2/marketing/campaigns/:id/contacts/:contactId — Delete contact
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateCampaignContactSchema } from '@/lib/validation/schemas/marketing'

function extractIds(req: NextRequest): { campaignId: string | null; contactId: string | null } {
  const segments = req.nextUrl.pathname.split('/')
  const campaignsIdx = segments.indexOf('campaigns')
  const contactsIdx = segments.indexOf('contacts')
  return {
    campaignId: campaignsIdx >= 0 && segments.length > campaignsIdx + 1 ? segments[campaignsIdx + 1] : null,
    contactId: contactsIdx >= 0 && segments.length > contactsIdx + 1 ? segments[contactsIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/marketing/campaigns/:id/contacts/:contactId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { campaignId, contactId } = extractIds(req)
    if (!campaignId || !contactId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign or contact ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('campaign_contacts')
      .select('*')
      .eq('id', contactId)
      .eq('campaign_id', campaignId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contact not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/marketing/campaigns/:id/contacts/:contactId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { campaignId, contactId } = extractIds(req)
    if (!campaignId || !contactId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign or contact ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateCampaignContactSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    // Auto-set timestamps based on status transitions
    if (input.status === 'sent') {
      updates.sent_at = new Date().toISOString()
    }
    if (input.status === 'opened') {
      updates.opened_at = new Date().toISOString()
    }
    if (input.status === 'clicked') {
      updates.clicked_at = new Date().toISOString()
    }
    if (input.status === 'converted') {
      updates.converted_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('campaign_contacts')
      .update(updates)
      .eq('id', contactId)
      .eq('campaign_id', campaignId)
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
    if (!data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contact not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'marketing_campaigns_contact.update' }
)

// ============================================================================
// DELETE /api/v2/marketing/campaigns/:id/contacts/:contactId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { campaignId, contactId } = extractIds(req)
    if (!campaignId || !contactId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign or contact ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('campaign_contacts')
      .delete()
      .eq('id', contactId)
      .eq('campaign_id', campaignId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'marketing_campaigns_contact.archive' }
)
