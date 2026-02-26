/**
 * Custom Fields API — List & Create
 *
 * GET  /api/v1/custom-fields?entityType=job — List custom field definitions
 * POST /api/v1/custom-fields — Create a custom field definition
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

const fieldTypeEnum = z.enum([
  'text', 'number', 'currency', 'percent', 'date', 'datetime',
  'boolean', 'select', 'multiselect', 'textarea', 'url', 'email', 'phone',
])

const entityTypeEnum = z.enum([
  'job', 'vendor', 'client', 'invoice', 'purchase_order',
  'change_order', 'draw', 'estimate',
])

const optionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  color: z.string().optional(),
})

const validationSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  patternMessage: z.string().optional(),
})

const conditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'empty', 'not_empty']),
  value: z.unknown(),
})

// ============================================================================
// GET — List custom field definitions
// ============================================================================

async function handleGet(req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const supabase = await createClient()

  const entityType = req.nextUrl.searchParams.get('entityType')

  let query = supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

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

// ============================================================================
// POST — Create a custom field definition
// ============================================================================

const createCustomFieldSchema = z.object({
  entityType: entityTypeEnum,
  fieldKey: z.string().min(1).max(100).regex(/^[a-z][a-z0-9_]*$/, 'Must be snake_case'),
  fieldLabel: z.string().min(1).max(200),
  fieldType: fieldTypeEnum,
  description: z.string().max(500).optional(),
  placeholder: z.string().max(200).optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(optionSchema).optional(),
  validation: validationSchema.optional(),
  showConditions: z.array(conditionSchema).optional(),
  section: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  visibleToRoles: z.array(z.string()).optional(),
  editableByRoles: z.array(z.string()).optional(),
  showInPortal: z.boolean().optional().default(false),
  showInListView: z.boolean().optional().default(false),
  isRequired: z.boolean().optional().default(false),
})

type CreateInput = z.infer<typeof createCustomFieldSchema>

async function handlePost(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as CreateInput
  const supabase = await createClient()

  // Check for duplicate field key on this entity type
  const { data: existing } = await supabase
    .from('custom_field_definitions')
    .select('id')
    .eq('company_id', companyId)
    .eq('entity_type', body.entityType)
    .eq('field_key', body.fieldKey)
    .is('deleted_at', null)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Conflict', message: `Field key '${body.fieldKey}' already exists for ${body.entityType}`, requestId: ctx.requestId },
      { status: 409 }
    )
  }

  // Get max sort order if not provided
  let sortOrder = body.sortOrder
  if (sortOrder === undefined) {
    const { data: maxData } = await supabase
      .from('custom_field_definitions')
      .select('sort_order')
      .eq('company_id', companyId)
      .eq('entity_type', body.entityType)
      .is('deleted_at', null)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    sortOrder = ((maxData as { sort_order: number } | null)?.sort_order ?? -1) + 1
  }

  const { data, error } = await supabase
    .from('custom_field_definitions')
    .insert({
      company_id: companyId,
      entity_type: body.entityType,
      field_key: body.fieldKey,
      field_label: body.fieldLabel,
      field_type: body.fieldType,
      description: body.description ?? null,
      placeholder: body.placeholder ?? null,
      default_value: body.defaultValue ?? null,
      options: body.options ? JSON.stringify(body.options) : null,
      validation: body.validation ? JSON.stringify(body.validation) : null,
      show_conditions: body.showConditions ? JSON.stringify(body.showConditions) : null,
      section: body.section ?? null,
      sort_order: sortOrder,
      visible_to_roles: body.visibleToRoles ?? null,
      editable_by_roles: body.editableByRoles ?? null,
      show_in_portal: body.showInPortal,
      show_in_list_view: body.showInListView,
      is_required: body.isRequired,
      is_active: true,
    } as never)
    .select()
    .single()

  if (error) {
    const mapped = mapDbError(error)
    return NextResponse.json(
      { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
      { status: mapped.status }
    )
  }

  return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
}

export const POST = createApiHandler(handlePost, {
  requireAuth: true,
  requiredRoles: ['owner', 'admin'],
  schema: createCustomFieldSchema,
  auditAction: 'custom_field.create',
})
