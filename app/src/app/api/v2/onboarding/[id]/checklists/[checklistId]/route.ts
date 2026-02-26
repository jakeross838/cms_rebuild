/**
 * Onboarding Checklist API — GET, PUT single
 *
 * GET /api/v2/onboarding/:id/checklists/:checklistId — Get checklist item
 * PUT /api/v2/onboarding/:id/checklists/:checklistId — Update checklist item
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateChecklistSchema } from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id/checklists/:checklistId
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const checklistId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_checklists')
      .select('*')
      .eq('id', checklistId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/onboarding/:id/checklists/:checklistId
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const checklistId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateChecklistSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid checklist data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updateFields: Record<string, unknown> = {}
    if (input.category !== undefined) updateFields.category = input.category
    if (input.title !== undefined) updateFields.title = input.title
    if (input.description !== undefined) updateFields.description = input.description
    if (input.is_completed !== undefined) updateFields.is_completed = input.is_completed
    if (input.is_required !== undefined) updateFields.is_required = input.is_required
    if (input.sort_order !== undefined) updateFields.sort_order = input.sort_order

    // Auto-set completed_at when marking as completed
    if (input.is_completed === true) {
      updateFields.completed_at = new Date().toISOString()
    }
    if (input.is_completed === false) {
      updateFields.completed_at = null
    }

    const { data, error } = await supabase
      .from('onboarding_checklists')
      .update(updateFields)
      .eq('id', checklistId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)
