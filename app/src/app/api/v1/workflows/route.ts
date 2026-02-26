/**
 * Workflows API — List workflow definitions
 *
 * GET /api/v1/workflows — List all workflow definitions
 * GET /api/v1/workflows?entityType=invoice — Filter by entity type
 */

import { NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// GET — List workflow definitions
// ============================================================================

async function handleGet(req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const supabase = await createClient()

  const entityType = req.nextUrl.searchParams.get('entityType')

  let query = supabase
    .from('workflow_definitions')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('entity_type', { ascending: true })

  if (entityType) {
    query = query.eq('entity_type', entityType)
  }

  const { data, error } = await query

  if (error) {
    const mapped = mapDbError(error)
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  return NextResponse.json({ data: data ?? [], total: (data ?? []).length, requestId: ctx.requestId })
}

export const GET = createApiHandler(handleGet, { requireAuth: true })
