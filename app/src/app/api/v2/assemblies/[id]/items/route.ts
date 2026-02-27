/**
 * Assembly Items API — List & Create
 *
 * GET  /api/v2/assemblies/:id/items — List items for an assembly
 * POST /api/v2/assemblies/:id/items — Add an item to an assembly
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listAssemblyItemsSchema, createAssemblyItemSchema } from '@/lib/validation/schemas/estimating'

/**
 * Extract assembly ID from a path like /api/v2/assemblies/:id/items
 */
function extractAssemblyId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('assemblies')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/assemblies/:id/items
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const assemblyId = extractAssemblyId(req.nextUrl.pathname)
    if (!assemblyId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing assembly ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listAssemblyItemsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify the assembly belongs to this company
    const { data: assembly, error: asmError } = await supabase
      .from('assemblies')
      .select('id')
      .eq('id', assemblyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (asmError || !assembly) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Assembly not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('assembly_items')
      .select('*', { count: 'exact' })
      .eq('assembly_id', assemblyId)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/assemblies/:id/items — Add item
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const assemblyId = extractAssemblyId(req.nextUrl.pathname)
    if (!assemblyId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing assembly ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createAssemblyItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify assembly exists and belongs to company
    const { data: assembly, error: asmError } = await supabase
      .from('assemblies')
      .select('id')
      .eq('id', assemblyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (asmError || !assembly) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Assembly not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('assembly_items')
      .insert({
        assembly_id: assemblyId,
        company_id: ctx.companyId!,
        cost_code_id: input.cost_code_id ?? null,
        description: input.description,
        qty_per_unit: input.qty_per_unit,
        unit: input.unit,
        unit_cost: input.unit_cost,
        sort_order: input.sort_order,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'assembly_item.create' }
)
