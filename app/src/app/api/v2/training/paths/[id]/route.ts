/**
 * Training Path by ID — Get, Update, Delete
 *
 * GET    /api/v2/training/paths/:id — Get path with items_count
 * PUT    /api/v2/training/paths/:id — Update path
 * DELETE /api/v2/training/paths/:id — Deactivate path
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePathSchema } from '@/lib/validation/schemas/training'

// ============================================================================
// GET /api/v2/training/paths/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const idx = segments.indexOf('paths')
    const id = idx !== -1 && idx + 1 < segments.length ? segments[idx + 1] : null
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('training_paths')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Training path not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Verify access: platform path or belongs to company
    if (data.company_id !== null && data.company_id !== ctx.companyId) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Training path not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch items count
    const { data: items } = await supabase
      .from('training_path_items')
      .select('id')
      .eq('path_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: {
        ...data,
        items_count: (items ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/training/paths/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const idx = segments.indexOf('paths')
    const id = idx !== -1 && idx + 1 < segments.length ? segments[idx + 1] : null
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePathSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.role_key !== undefined) updates.role_key = input.role_key
    if (input.estimated_hours !== undefined) updates.estimated_hours = input.estimated_hours
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.is_active !== undefined) updates.is_active = input.is_active

    const { data, error } = await supabase
      .from('training_paths')
      .update(updates)
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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/training/paths/:id — Deactivate
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const idx = segments.indexOf('paths')
    const id = idx !== -1 && idx + 1 < segments.length ? segments[idx + 1] : null
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('training_paths')
      .update({ is_active: false, updated_at: new Date().toISOString() })
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

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
