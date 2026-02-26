/**
 * Workflows API — Get & Update workflow by entity type
 *
 * GET /api/v1/workflows/:entityType — Get workflow for entity type
 * PUT /api/v1/workflows/:entityType — Update/create workflow for entity type
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

const entityTypes = ['invoice', 'purchase_order', 'change_order', 'draw', 'selection', 'estimate', 'contract'] as const

function extractEntityType(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf('workflows')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET — Get workflow for entity type
// ============================================================================

async function handleGet(req: NextRequest, ctx: ApiContext) {
  const entityType = extractEntityType(req)
  if (!entityType || !entityTypes.includes(entityType as (typeof entityTypes)[number])) {
    return NextResponse.json(
      { error: 'Bad Request', message: `Invalid entity type. Must be one of: ${entityTypes.join(', ')}`, requestId: ctx.requestId },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workflow_definitions')
    .select('*')
    .eq('company_id', ctx.companyId!)
    .eq('entity_type', entityType)
    .is('deleted_at', null)
    .order('is_default', { ascending: false })

  if (error) {
    const mapped = mapDbError(error)
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  return NextResponse.json({ data: data ?? [], total: (data ?? []).length, requestId: ctx.requestId })
}

export const GET = createApiHandler(handleGet, { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] })

// ============================================================================
// PUT — Create or update workflow for entity type
// ============================================================================

const stateSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isInitial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
  description: z.string().optional(),
})

const transitionSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().min(1),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
    value: z.unknown(),
  })).optional(),
  requiredRole: z.array(z.string()).optional(),
  notifyRoles: z.array(z.string()).optional(),
})

const thresholdSchema = z.object({
  amountThresholds: z.array(z.object({
    min: z.number(),
    max: z.number().nullable(),
    autoApprove: z.boolean(),
    requiredApprovers: z.array(z.string()),
  })).optional(),
})

const notificationsSchema = z.object({
  onEnterState: z.record(z.string(), z.array(z.string())).optional(),
  onTransition: z.record(z.string(), z.array(z.string())).optional(),
})

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
  states: z.array(stateSchema).min(1),
  transitions: z.array(transitionSchema),
  thresholds: thresholdSchema.optional(),
  notifications: notificationsSchema.optional(),
})

type UpdateInput = z.infer<typeof updateWorkflowSchema>

async function handlePut(req: NextRequest, ctx: ApiContext) {
  const entityType = extractEntityType(req)
  if (!entityType || !entityTypes.includes(entityType as (typeof entityTypes)[number])) {
    return NextResponse.json(
      { error: 'Bad Request', message: `Invalid entity type. Must be one of: ${entityTypes.join(', ')}`, requestId: ctx.requestId },
      { status: 400 }
    )
  }

  const body = ctx.validatedBody as UpdateInput
  const supabase = await createClient()

  // Validate: must have exactly one initial state
  const initialStates = body.states.filter((s) => s.isInitial)
  if (initialStates.length !== 1) {
    return NextResponse.json(
      { error: 'Validation Error', message: 'Workflow must have exactly one initial state', requestId: ctx.requestId },
      { status: 400 }
    )
  }

  // Validate: must have at least one final state
  const finalStates = body.states.filter((s) => s.isFinal)
  if (finalStates.length === 0) {
    return NextResponse.json(
      { error: 'Validation Error', message: 'Workflow must have at least one final state', requestId: ctx.requestId },
      { status: 400 }
    )
  }

  // Validate: all transition from/to must reference valid state names
  const stateNames = new Set(body.states.map((s) => s.name))
  for (const t of body.transitions) {
    if (!stateNames.has(t.from) || !stateNames.has(t.to)) {
      return NextResponse.json(
        { error: 'Validation Error', message: `Transition references unknown state: ${t.from} -> ${t.to}`, requestId: ctx.requestId },
        { status: 400 }
      )
    }
  }

  // If isDefault, unset other defaults for this entity type
  if (body.isDefault) {
    await supabase
      .from('workflow_definitions')
      .update({ is_default: false, updated_at: new Date().toISOString() } as never)
      .eq('company_id', ctx.companyId!)
      .eq('entity_type', entityType)
      .eq('is_default', true)
      .is('deleted_at', null)
  }

  // Check for existing default workflow to upsert
  const { data: existing } = await supabase
    .from('workflow_definitions')
    .select('id')
    .eq('company_id', ctx.companyId!)
    .eq('entity_type', entityType)
    .eq('name', body.name)
    .is('deleted_at', null)
    .single()

  const now = new Date().toISOString()
  const record = {
    company_id: ctx.companyId!,
    entity_type: entityType,
    name: body.name,
    description: body.description ?? null,
    is_active: body.isActive,
    is_default: body.isDefault,
    states: JSON.stringify(body.states),
    transitions: JSON.stringify(body.transitions),
    thresholds: body.thresholds ? JSON.stringify(body.thresholds) : null,
    notifications: body.notifications ? JSON.stringify(body.notifications) : null,
    updated_at: now,
  }

  let data, error
  if (existing) {
    const result = await supabase
      .from('workflow_definitions')
      .update(record as never)
      .eq('id', existing.id)
      .select()
      .single()
    data = result.data
    error = result.error
  } else {
    const result = await supabase
      .from('workflow_definitions')
      .insert(record as never)
      .select()
      .single()
    data = result.data
    error = result.error
  }

  if (error) {
    const mapped = mapDbError(error)
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  return NextResponse.json({ data, requestId: ctx.requestId }, { status: existing ? 200 : 201 })
}

export const PUT = createApiHandler(handlePut, {
  requireAuth: true,
  requiredRoles: ['owner', 'admin'],
  schema: updateWorkflowSchema,
  auditAction: 'workflow.update',
})
