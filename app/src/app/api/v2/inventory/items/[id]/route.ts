/**
 * Inventory Item by ID — Get, Update, Delete
 *
 * GET    /api/v2/inventory/items/:id — Get item details
 * PUT    /api/v2/inventory/items/:id — Update item
 * DELETE /api/v2/inventory/items/:id — Soft delete item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateInventoryItemSchema } from '@/lib/validation/schemas/inventory'

// ============================================================================
// GET /api/v2/inventory/items/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing item ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inventory item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/inventory/items/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing item ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateInventoryItemSchema.safeParse(body)

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
    if (input.sku !== undefined) updates.sku = input.sku
    if (input.description !== undefined) updates.description = input.description
    if (input.category !== undefined) updates.category = input.category
    if (input.unit_of_measure !== undefined) updates.unit_of_measure = input.unit_of_measure
    if (input.unit_cost !== undefined) updates.unit_cost = input.unit_cost
    if (input.reorder_point !== undefined) updates.reorder_point = input.reorder_point
    if (input.reorder_quantity !== undefined) updates.reorder_quantity = input.reorder_quantity
    if (input.is_active !== undefined) updates.is_active = input.is_active

    const { data, error } = await (supabase as any)
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inventory item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/inventory/items/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing item ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('inventory_items')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inventory item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
