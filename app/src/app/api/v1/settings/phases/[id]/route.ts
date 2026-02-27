/**
 * Project Phase Detail API
 *
 * GET /api/v1/settings/phases/:id - Get a single phase
 * PATCH /api/v1/settings/phases/:id - Update a phase
 * DELETE /api/v1/settings/phases/:id - Soft delete a phase
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import type { ProjectPhase } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET - Get Single Phase
// ============================================================================

async function handleGet(_req: NextRequest, ctx: ApiContext, { params }: RouteParams) {
  const { id } = await params
  const companyId = ctx.companyId!
  const supabase = await createClient()

  const { data: phaseData, error } = await supabase
    .from('project_phases')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .single()

  if (error || !phaseData) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Phase not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  const phase = phaseData as ProjectPhase

  return NextResponse.json({
    data: {
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
    requestId: ctx.requestId,
  })
}

export function GET(req: NextRequest, routeParams: RouteParams) {
  return createApiHandler(
    (r, c) => handleGet(r, c, routeParams),
    { requireAuth: true, rateLimit: 'api' }
  )(req)
}

// ============================================================================
// PATCH - Update Phase
// ============================================================================

const updatePhaseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  defaultDurationDays: z.number().min(1).max(365).optional().nullable(),
  sortOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  milestoneType: z.enum(['start', 'completion', 'payment']).optional().nullable(),
})

type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>

async function handlePatch(req: NextRequest, ctx: ApiContext, { params }: RouteParams) {
  const { id } = await params
  const companyId = ctx.companyId!
  const supabase = await createClient()

  // Get existing phase
  const { data: existingData, error: fetchError } = await supabase
    .from('project_phases')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !existingData) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Phase not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  const existing = existingData as ProjectPhase

  // Parse and validate body
  let body: UpdatePhaseInput
  try {
    const rawBody = await req.json()
    const result = updatePhaseSchema.safeParse(rawBody)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid request body', errors: result.error.format(), requestId: ctx.requestId },
        { status: 400 }
      )
    }
    body = result.data
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid JSON body', requestId: ctx.requestId },
      { status: 400 }
    )
  }

  // Check if trying to modify system phase name
  if (existing.is_system && body.name && body.name !== existing.name) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Cannot rename system phases', requestId: ctx.requestId },
      { status: 403 }
    )
  }

  // Check for duplicate name if changing
  if (body.name && body.name !== existing.name) {
    const { data: duplicate } = await supabase
      .from('project_phases')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', body.name)
      .neq('id', id)
      .is('deleted_at', null)
      .single()

    if (duplicate) {
      return NextResponse.json(
        { error: 'Conflict', message: 'A phase with this name already exists', requestId: ctx.requestId },
        { status: 409 }
      )
    }
  }

  // Build update object
  const update: Partial<ProjectPhase> = {}
  if (body.name !== undefined) update.name = body.name
  if (body.description !== undefined) update.description = body.description
  if (body.color !== undefined) update.color = body.color
  if (body.defaultDurationDays !== undefined) update.default_duration_days = body.defaultDurationDays
  if (body.sortOrder !== undefined) update.sort_order = body.sortOrder
  if (body.isActive !== undefined) update.is_active = body.isActive
  if (body.milestoneType !== undefined) update.milestone_type = body.milestoneType

  const { data: phaseData, error } = await supabase
    .from('project_phases')
    .update(update)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error || !phaseData) {
    const mapped = mapDbError(error ?? { code: 'PGRST116' })
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  const phase = phaseData as ProjectPhase

  return NextResponse.json({
    data: {
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
    requestId: ctx.requestId,
  })
}

export function PATCH(req: NextRequest, routeParams: RouteParams) {
  return createApiHandler(
    (r, c) => handlePatch(r, c, routeParams),
    { requireAuth: true, rateLimit: 'api',
      requiredRoles: ['owner', 'admin'],
      auditAction: 'settings.phases.update',
    }
  )(req)
}

// ============================================================================
// DELETE - Soft Delete Phase
// ============================================================================

async function handleDelete(_req: NextRequest, ctx: ApiContext, { params }: RouteParams) {
  const { id } = await params
  const companyId = ctx.companyId!
  const supabase = await createClient()

  // Get existing phase
  const { data: existingData, error: fetchError } = await supabase
    .from('project_phases')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !existingData) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Phase not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  const existing = existingData as ProjectPhase

  // Cannot delete system phases
  if (existing.is_system) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Cannot delete system phases', requestId: ctx.requestId },
      { status: 403 }
    )
  }

  // Soft delete
  const { error } = await supabase
    .from('project_phases')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    const mapped = mapDbError(error)
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
}

export function DELETE(req: NextRequest, routeParams: RouteParams) {
  return createApiHandler(
    (r, c) => handleDelete(r, c, routeParams),
    { requireAuth: true, rateLimit: 'api',
      requiredRoles: ['owner', 'admin'],
      auditAction: 'settings.phases.delete',
    }
  )(req)
}
