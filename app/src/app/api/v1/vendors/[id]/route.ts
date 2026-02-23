/**
 * Vendors API — Get, Update & Delete Single Vendor
 *
 * GET    /api/v1/vendors/[id] — Get a single vendor by ID
 * PATCH  /api/v1/vendors/[id] — Update a vendor
 * DELETE /api/v1/vendors/[id] — Soft-delete a vendor
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateVendorSchema, type UpdateVendorInput } from '@/lib/validation/schemas/vendors'
import type { Vendor } from '@/types/database'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/vendors/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'vendors')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: Vendor | null; error: { message: string } | null }

    if (error || !vendor) {
      logger.warn('Vendor not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: vendor })
  },
  {
    requireAuth: true,
    permission: 'vendors:read:all',
  }
)

// ============================================================================
// PATCH /api/v1/vendors/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'vendors')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as UpdateVendorInput
    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: fetchError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('vendors')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: Vendor | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update vendor', { error: updateError?.message, targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update vendor', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('Vendor updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated })
  },
  {
    requireAuth: true,
    schema: updateVendorSchema,
    permission: 'vendors:update:all',
    auditAction: 'vendor.update',
  }
)

// ============================================================================
// DELETE /api/v1/vendors/[id] — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'vendors')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('vendors')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('Vendor not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('Vendor soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'vendors:delete:all',
    auditAction: 'vendor.delete',
  }
)
