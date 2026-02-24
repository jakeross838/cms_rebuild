/**
 * Portfolio Project by ID — Get, Update, Delete
 *
 * GET    /api/v2/marketing/portfolio/:id — Get portfolio project details
 * PUT    /api/v2/marketing/portfolio/:id — Update portfolio project
 * DELETE /api/v2/marketing/portfolio/:id — Soft delete portfolio project
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePortfolioProjectSchema } from '@/lib/validation/schemas/marketing'

function extractId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  // /api/v2/marketing/portfolio/[id] — id is after "portfolio"
  const porfolioIdx = segments.indexOf('portfolio')
  return porfolioIdx >= 0 && segments.length > porfolioIdx + 1 ? segments[porfolioIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing/portfolio/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing portfolio project ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('portfolio_projects') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Portfolio project not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch photos count
    const { data: photos } = await (supabase
      .from('portfolio_photos') as any)
      .select('id')
      .eq('portfolio_project_id', id)

    return NextResponse.json({
      data: {
        ...data,
        photos_count: (photos ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/marketing/portfolio/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing portfolio project ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePortfolioProjectSchema.safeParse(body)

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

    // Set published_at when transitioning to published or featured
    if (input.status === 'published' || input.status === 'featured') {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await (supabase
      .from('portfolio_projects') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Portfolio project not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/marketing/portfolio/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing portfolio project ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase
      .from('portfolio_projects') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Portfolio project not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('portfolio_projects') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
