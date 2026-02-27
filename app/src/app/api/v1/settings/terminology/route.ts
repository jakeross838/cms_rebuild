/**
 * Terminology API
 *
 * GET /api/v1/settings/terminology - Get all terminology overrides
 * PATCH /api/v1/settings/terminology - Update terminology overrides
 * POST /api/v1/settings/terminology/reset - Reset terminology to defaults
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import {
  getAllTerminology,
  setTerminologyBulk,
  resetTerminology,
  getDefaultTerminology,
} from '@/lib/config'
import type { TerminologyKey } from '@/lib/config/types'

// ============================================================================
// GET - Get All Terminology
// ============================================================================

async function handleGet(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!

  const { terms } = await getAllTerminology(companyId)
  const defaults = getDefaultTerminology()

  return NextResponse.json({
    data: {
      terms,
      defaults,
      totalTerms: Object.keys(defaults).length,
      overrideCount: terms.filter((t) => t.overrideSingular || t.overridePlural).length,
    },
    requestId: ctx.requestId,
  })
}

export const GET = createApiHandler(handleGet, { requireAuth: true, rateLimit: 'api',
})

// ============================================================================
// PATCH - Update Terminology
// ============================================================================

const defaults = getDefaultTerminology()
const validTermKeys = Object.keys(defaults) as [string, ...string[]]

const updateTerminologySchema = z.object({
  terms: z.array(z.object({
    termKey: z.enum(validTermKeys),
    singular: z.string().min(1).max(100),
    plural: z.string().min(1).max(100).optional(),
    context: z.enum(['portal', 'internal', 'documents']).optional(),
  })),
})

type UpdateTerminologyInput = z.infer<typeof updateTerminologySchema>

async function handlePatch(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as UpdateTerminologyInput

  await setTerminologyBulk(
    companyId,
    body.terms.map((t) => ({
      termKey: t.termKey as TerminologyKey,
      singular: t.singular,
      plural: t.plural,
      context: t.context,
    }))
  )

  // Return updated terminology
  const { terms } = await getAllTerminology(companyId)

  return NextResponse.json({
    data: {
      terms,
      overrideCount: terms.filter((t) => t.overrideSingular || t.overridePlural).length,
    },
    requestId: ctx.requestId,
  })
}

export const PATCH = createApiHandler(handlePatch, { requireAuth: true, rateLimit: 'api',
  requiredRoles: ['owner', 'admin'],
  schema: updateTerminologySchema,
  auditAction: 'settings.terminology.update',
})

// ============================================================================
// POST - Reset Terminology (to defaults)
// ============================================================================

const resetTerminologySchema = z.object({
  termKey: z.enum(validTermKeys).optional(), // If not provided, reset all
})

type ResetTerminologyInput = z.infer<typeof resetTerminologySchema>

async function handlePost(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as ResetTerminologyInput

  await resetTerminology(companyId, body.termKey as TerminologyKey | undefined)

  // Return updated terminology
  const { terms } = await getAllTerminology(companyId)

  return NextResponse.json({
    data: {
      terms,
      overrideCount: terms.filter((t) => t.overrideSingular || t.overridePlural).length,
      message: body.termKey
        ? `Terminology for "${body.termKey}" reset to default`
        : 'All terminology reset to defaults',
    },
    requestId: ctx.requestId,
  })
}

export const POST = createApiHandler(handlePost, { requireAuth: true, rateLimit: 'api',
  requiredRoles: ['owner', 'admin'],
  schema: resetTerminologySchema,
  auditAction: 'settings.terminology.reset',
})
