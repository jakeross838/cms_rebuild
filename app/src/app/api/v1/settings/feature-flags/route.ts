/**
 * Feature Flags API
 *
 * GET /api/v1/settings/feature-flags - Get all feature flags for company
 * PATCH /api/v1/settings/feature-flags - Update feature flags
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { getFeatureFlags, setFeatureFlags, FEATURE_FLAG_DEFINITIONS } from '@/lib/config'
import type { FeatureFlagKey } from '@/lib/config/types'

// ============================================================================
// GET - Get All Feature Flags
// ============================================================================

async function handleGet(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!

  const { flags, companyPlan } = await getFeatureFlags(companyId)

  // Group by category
  const grouped: Record<string, typeof flags> = {}
  for (const flag of flags) {
    if (!grouped[flag.category]) {
      grouped[flag.category] = []
    }
    grouped[flag.category].push(flag)
  }

  return NextResponse.json({
    data: {
      flags,
      grouped,
      companyPlan,
      definitions: FEATURE_FLAG_DEFINITIONS,
    },
    requestId: ctx.requestId,
  })
}

export const GET = createApiHandler(handleGet, { requireAuth: true, rateLimit: 'api',
})

// ============================================================================
// PATCH - Update Feature Flags
// ============================================================================

const validFlagKeys = FEATURE_FLAG_DEFINITIONS.map((d) => d.key) as [string, ...string[]]

const updateFlagsSchema = z.object({
  flags: z.array(z.object({
    key: z.enum(validFlagKeys),
    enabled: z.boolean(),
  })),
})

type UpdateFlagsInput = z.infer<typeof updateFlagsSchema>

async function handlePatch(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const userId = ctx.user!.id
  const body = ctx.validatedBody as UpdateFlagsInput

  await setFeatureFlags(
    companyId,
    body.flags.map((f) => ({
      key: f.key as FeatureFlagKey,
      enabled: f.enabled,
    })),
    userId
  )

  // Return updated flags
  const { flags, companyPlan } = await getFeatureFlags(companyId)

  return NextResponse.json({
    data: {
      flags,
      companyPlan,
    },
    requestId: ctx.requestId,
  })
}

export const PATCH = createApiHandler(handlePatch, { requireAuth: true, rateLimit: 'api',
  requiredRoles: ['owner'],
  schema: updateFlagsSchema,
  auditAction: 'settings.feature_flags.update',
})
