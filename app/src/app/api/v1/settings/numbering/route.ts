/**
 * Numbering Patterns API
 *
 * GET /api/v1/settings/numbering - Get all numbering patterns
 * PATCH /api/v1/settings/numbering - Update numbering patterns
 * POST /api/v1/settings/numbering/preview - Preview a pattern
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import {
  getNumberingPatterns,
  setNumberingPattern,
  validatePattern,
  previewNextNumber,
  getDefaultPatterns,
} from '@/lib/config'
import type { NumberingEntityType, NumberingScope } from '@/lib/config/types'

// ============================================================================
// GET - Get All Numbering Patterns
// ============================================================================

async function handleGet(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!

  const { patterns } = await getNumberingPatterns(companyId)
  const defaults = getDefaultPatterns()

  return NextResponse.json({
    patterns,
    defaults,
    patternTokens: [
      { token: '{YYYY}', description: 'Full year (e.g., 2026)' },
      { token: '{YY}', description: 'Two-digit year (e.g., 26)' },
      { token: '{MM}', description: 'Two-digit month (01-12)' },
      { token: '{###}', description: 'Sequence with 3-digit padding' },
      { token: '{##}', description: 'Sequence with 2-digit padding' },
      { token: '{#}', description: 'Sequence without padding' },
      { token: '{####}', description: 'Sequence with 4-digit padding' },
      { token: '{JOB}', description: 'Job number (for per-job sequences)' },
    ],
    scopes: [
      { value: 'global', description: 'Single sequence across all entities' },
      { value: 'per_job', description: 'Separate sequence per job/project' },
      { value: 'per_year', description: 'Sequence resets each year' },
    ],
  })
}

export const GET = createApiHandler(handleGet, {
  requireAuth: true,
})

// ============================================================================
// PATCH - Update Numbering Pattern
// ============================================================================

const validEntityTypes: [string, ...string[]] = ['job', 'invoice', 'purchase_order', 'change_order', 'draw', 'estimate', 'contract', 'rfi']

const updateNumberingSchema = z.object({
  entityType: z.enum(validEntityTypes),
  pattern: z.string().min(1).max(100),
  scope: z.enum(['global', 'per_job', 'per_year']).optional(),
  padding: z.number().min(1).max(10).optional(),
  prefix: z.string().max(20).optional(),
  suffix: z.string().max(20).optional(),
  resetYearly: z.boolean().optional(),
})

type UpdateNumberingInput = z.infer<typeof updateNumberingSchema>

async function handlePatch(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as UpdateNumberingInput

  // Validate the pattern
  const validation = validatePattern(body.pattern)
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: validation.error,
        requestId: ctx.requestId,
      },
      { status: 400 }
    )
  }

  // Check for {JOB} token in non-per_job scope
  if (body.pattern.includes('{JOB}') && body.scope && body.scope !== 'per_job') {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Pattern contains {JOB} token but scope is not "per_job"',
        requestId: ctx.requestId,
      },
      { status: 400 }
    )
  }

  await setNumberingPattern(companyId, {
    entityType: body.entityType as NumberingEntityType,
    pattern: body.pattern,
    scope: body.scope as NumberingScope | undefined,
    padding: body.padding,
    prefix: body.prefix,
    suffix: body.suffix,
    resetYearly: body.resetYearly,
  })

  // Return updated patterns
  const { patterns } = await getNumberingPatterns(companyId)

  return NextResponse.json({
    patterns,
    updated: body.entityType,
  })
}

export const PATCH = createApiHandler(handlePatch, {
  requireAuth: true,
  requiredRoles: ['owner', 'admin'],
  schema: updateNumberingSchema,
  auditAction: 'settings.numbering.update',
})

// ============================================================================
// POST - Preview Pattern
// ============================================================================

const previewSchema = z.object({
  entityType: z.enum(validEntityTypes),
  jobId: z.string().uuid().optional(),
})

type PreviewInput = z.infer<typeof previewSchema>

async function handlePost(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as PreviewInput

  const preview = await previewNextNumber(
    companyId,
    body.entityType as NumberingEntityType,
    body.jobId
  )

  return NextResponse.json({
    preview,
    entityType: body.entityType,
    jobId: body.jobId,
  })
}

export const POST = createApiHandler(handlePost, {
  requireAuth: true,
  schema: previewSchema,
})
