/**
 * Project Phases API
 *
 * GET /api/v1/settings/phases - Get all project phases
 * POST /api/v1/settings/phases - Create a new phase
 * PATCH /api/v1/settings/phases/:id - Update a phase
 * DELETE /api/v1/settings/phases/:id - Delete a phase
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import type { ProjectPhase } from '@/types/database'

// ============================================================================
// GET - Get All Project Phases
// ============================================================================

async function handleGet(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const supabase = await createClient()

  const { data: phasesData, error } = await supabase
    .from('project_phases')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Database Error', message: 'An unexpected database error occurred', requestId: ctx.requestId },
      { status: 500 }
    )
  }

  const phases = (phasesData || []) as ProjectPhase[]

  return NextResponse.json({
    phases: phases.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      defaultDurationDays: p.default_duration_days,
      sortOrder: p.sort_order,
      isActive: p.is_active,
      isSystem: p.is_system,
      milestoneType: p.milestone_type,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })),
    total: phases.length,
  })
}

export const GET = createApiHandler(handleGet, {
  requireAuth: true,
})

// ============================================================================
// POST - Create Project Phase
// ============================================================================

const createPhaseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
  defaultDurationDays: z.number().min(1).max(365).optional(),
  milestoneType: z.enum(['start', 'completion', 'payment']).optional().nullable(),
})

type CreatePhaseInput = z.infer<typeof createPhaseSchema>

async function handlePost(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as CreatePhaseInput
  const supabase = await createClient()

  // Get max sort order
  const { data: maxSortData } = await supabase
    .from('project_phases')
    .select('sort_order')
    .eq('company_id', companyId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const maxSort = maxSortData as { sort_order: number } | null
  const sortOrder = (maxSort?.sort_order ?? -1) + 1

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('project_phases')
    .select('id')
    .eq('company_id', companyId)
    .eq('name', body.name)
    .is('deleted_at', null)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Conflict', message: 'A phase with this name already exists', requestId: ctx.requestId },
      { status: 409 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: phaseData, error } = await supabase
    .from('project_phases')
    .insert({
      company_id: companyId,
      name: body.name,
      description: body.description,
      color: body.color,
      default_duration_days: body.defaultDurationDays,
      sort_order: sortOrder,
      milestone_type: body.milestoneType,
      is_active: true,
      is_system: false,
    })
    .select()
    .single()

  if (error || !phaseData) {
    return NextResponse.json(
      { error: 'Database Error', message: error?.message || 'Failed to create phase', requestId: ctx.requestId },
      { status: 500 }
    )
  }

  const phase = phaseData as ProjectPhase

  return NextResponse.json({
    phase: {
      id: phase.id,
      name: phase.name,
      description: phase.description,
      color: phase.color,
      defaultDurationDays: phase.default_duration_days,
      sortOrder: phase.sort_order,
      isActive: phase.is_active,
      isSystem: phase.is_system,
      milestoneType: phase.milestone_type,
      createdAt: phase.created_at,
      updatedAt: phase.updated_at,
    },
  }, { status: 201 })
}

export const POST = createApiHandler(handlePost, {
  requireAuth: true,
  requiredRoles: ['owner', 'admin'],
  schema: createPhaseSchema,
  auditAction: 'settings.phases.create',
})
