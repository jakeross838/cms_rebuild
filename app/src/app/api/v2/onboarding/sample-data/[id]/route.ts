/**
 * Sample Data Set API — GET, PUT single
 *
 * GET /api/v2/onboarding/sample-data/:id — Get sample data set
 * PUT /api/v2/onboarding/sample-data/:id — Update sample data set
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateSampleDataSetSchema } from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/sample-data/:id
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const dataSetId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sample_data_sets')
      .select('*')
      .eq('id', dataSetId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sample data set not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/onboarding/sample-data/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const dataSetId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateSampleDataSetSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid sample data set', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updateFields: Record<string, unknown> = {}
    if (input.name !== undefined) updateFields.name = input.name
    if (input.description !== undefined) updateFields.description = input.description
    if (input.data_type !== undefined) updateFields.data_type = input.data_type
    if (input.status !== undefined) updateFields.status = input.status
    if (input.content !== undefined) updateFields.content = input.content

    // Auto-set timestamps based on status transitions
    if (input.status === 'generating') {
      updateFields.generated_at = null
      updateFields.applied_at = null
    }
    if (input.status === 'ready') {
      updateFields.generated_at = new Date().toISOString()
    }
    if (input.status === 'applied') {
      updateFields.applied_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('sample_data_sets')
      .update(updateFields)
      .eq('id', dataSetId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'onboarding_sample_data.update' }
)
