/**
 * Custom Fields API — Get, Update & Delete
 *
 * GET    /api/v1/custom-fields/:id — Get a custom field definition
 * PATCH  /api/v1/custom-fields/:id — Update a custom field definition
 * DELETE /api/v1/custom-fields/:id — Soft-delete a custom field definition
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

function extractId(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf('custom-fields')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET — Get a custom field definition
// ============================================================================

async function handleGet(req: NextRequest, ctx: ApiContext) {
  const id = extractId(req)
  if (!id) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing field ID', requestId: ctx.requestId },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('id', id)
    .eq('company_id', ctx.companyId!)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Custom field not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  return NextResponse.json({ data, requestId: ctx.requestId })
}

export const GET = createApiHandler(handleGet, { requireAuth: true, rateLimit: 'api' })

// ============================================================================
// PATCH — Update a custom field definition
// ============================================================================

const updateCustomFieldSchema = z.object({
  fieldLabel: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  defaultValue: z.unknown().optional(),
  options: z.array(z.object({
    value: z.string().min(1),
    label: z.string().min(1),
    color: z.string().optional(),
  })).optional(),
  validation: z.object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    patternMessage: z.string().optional(),
  }).optional(),
  showConditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'empty', 'not_empty']),
    value: z.unknown(),
  })).optional(),
  section: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  visibleToRoles: z.array(z.string()).optional().nullable(),
  editableByRoles: z.array(z.string()).optional().nullable(),
  showInPortal: z.boolean().optional(),
  showInListView: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

type UpdateInput = z.infer<typeof updateCustomFieldSchema>

async function handlePatch(req: NextRequest, ctx: ApiContext) {
  const id = extractId(req)
  if (!id) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing field ID', requestId: ctx.requestId },
      { status: 400 }
    )
  }

  const body = ctx.validatedBody as UpdateInput
  const supabase = await createClient()

  // Verify exists
  const { data: existing, error: fetchError } = await supabase
    .from('custom_field_definitions')
    .select('id')
    .eq('id', id)
    .eq('company_id', ctx.companyId!)
    .is('deleted_at', null)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Custom field not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.fieldLabel !== undefined) updates.field_label = body.fieldLabel
  if (body.description !== undefined) updates.description = body.description
  if (body.placeholder !== undefined) updates.placeholder = body.placeholder
  if (body.defaultValue !== undefined) updates.default_value = body.defaultValue
  if (body.options !== undefined) updates.options = JSON.stringify(body.options)
  if (body.validation !== undefined) updates.validation = JSON.stringify(body.validation)
  if (body.showConditions !== undefined) updates.show_conditions = JSON.stringify(body.showConditions)
  if (body.section !== undefined) updates.section = body.section
  if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder
  if (body.visibleToRoles !== undefined) updates.visible_to_roles = body.visibleToRoles
  if (body.editableByRoles !== undefined) updates.editable_by_roles = body.editableByRoles
  if (body.showInPortal !== undefined) updates.show_in_portal = body.showInPortal
  if (body.showInListView !== undefined) updates.show_in_list_view = body.showInListView
  if (body.isRequired !== undefined) updates.is_required = body.isRequired
  if (body.isActive !== undefined) updates.is_active = body.isActive

  const { data, error } = await supabase
    .from('custom_field_definitions')
    .update(updates as never)
    .eq('id', id)
    .eq('company_id', ctx.companyId!)
    .select()
    .single()

  if (error) {
    const mapped = mapDbError(error)
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  return NextResponse.json({ data, requestId: ctx.requestId })
}

export const PATCH = createApiHandler(handlePatch, { requireAuth: true, rateLimit: 'api',
  requiredRoles: ['owner', 'admin'],
  schema: updateCustomFieldSchema,
  auditAction: 'custom_field.update',
})

// ============================================================================
// DELETE — Soft-delete a custom field definition
// ============================================================================

async function handleDelete(req: NextRequest, ctx: ApiContext) {
  const id = extractId(req)
  if (!id) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing field ID', requestId: ctx.requestId },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('custom_field_definitions')
    .update({ deleted_at: now, updated_at: now } as never)
    .eq('id', id)
    .eq('company_id', ctx.companyId!)
    .is('deleted_at', null)
    .select('id, deleted_at')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Custom field not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  return NextResponse.json({ data, requestId: ctx.requestId })
}

export const DELETE = createApiHandler(handleDelete, { requireAuth: true, rateLimit: 'api',
  requiredRoles: ['owner', 'admin'],
  auditAction: 'custom_field.delete',
})
