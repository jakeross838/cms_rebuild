/**
 * Extraction Rules API — List & Create
 *
 * GET  /api/v2/extraction-rules — List extraction rules
 * POST /api/v2/extraction-rules — Create extraction rule
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listExtractionRulesSchema,
  createExtractionRuleSchema,
} from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// GET /api/v2/extraction-rules
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listExtractionRulesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      rule_type: url.searchParams.get('rule_type') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = (supabase as any)
      .from('extraction_rules')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.rule_type) {
      query = query.eq('rule_type', filters.rule_type)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/extraction-rules — Create rule
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createExtractionRuleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid rule data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data: rule, error: ruleError } = await (supabase as any)
      .from('extraction_rules')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id ?? null,
        rule_type: input.rule_type,
        conditions: input.conditions,
        actions: input.actions,
        is_active: input.is_active,
        priority: input.priority,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (ruleError) {
      return NextResponse.json(
        { error: 'Database Error', message: ruleError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: rule, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
