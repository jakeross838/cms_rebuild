/**
 * Testimonial by ID — Get, Update
 *
 * GET /api/v2/marketing-site/testimonials/:id — Get testimonial details
 * PUT /api/v2/marketing-site/testimonials/:id — Update testimonial
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTestimonialSchema } from '@/lib/validation/schemas/marketing-website'

function extractId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const testimonialsIdx = segments.indexOf('testimonials')
  return testimonialsIdx >= 0 && segments.length > testimonialsIdx + 1 ? segments[testimonialsIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing-site/testimonials/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing testimonial ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Testimonial not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/marketing-site/testimonials/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing testimonial ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateTestimonialSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    // Auto-set approved_by/approved_at when approving
    if (input.is_approved === true) {
      updates.approved_by = ctx.user!.id
      updates.approved_at = new Date().toISOString()
    }

    const { data, error } = await (supabase as any)
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Testimonial not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
