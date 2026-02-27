/**
 * Feature Flags System
 *
 * Manages per-tenant feature toggles with plan-based gating.
 * Features can be:
 * - Globally enabled/disabled per company
 * - Gated by subscription plan
 * - Configured with additional metadata
 */

import { createClient } from '@/lib/supabase/server'
import type { FeatureFlag as FeatureFlagDB } from '@/types/database'
import type { FeatureFlag, FeatureFlagKey, SubscriptionPlan } from './types'

// Query result types
type CompanyTierRow = { subscription_tier: string }

// ============================================================================
// FEATURE FLAG DEFINITIONS (Known Flags)
// ============================================================================

interface FeatureFlagDefinition {
  key: FeatureFlagKey
  name: string
  description: string
  defaultEnabled: boolean
  requiredPlan?: SubscriptionPlan
  category: 'ai' | 'integrations' | 'portals' | 'features' | 'advanced'
}

export const FEATURE_FLAG_DEFINITIONS: FeatureFlagDefinition[] = [
  // AI Features
  {
    key: 'ai_invoice_processing',
    name: 'AI Invoice Processing',
    description: 'Automatically extract data from invoices using AI',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'ai',
  },
  {
    key: 'ai_document_classification',
    name: 'AI Document Classification',
    description: 'Automatically classify and route uploaded documents',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'ai',
  },
  {
    key: 'ai_cost_code_suggestion',
    name: 'AI Cost Code Suggestions',
    description: 'Suggest cost codes for line items based on descriptions',
    defaultEnabled: true,
    requiredPlan: 'starter',
    category: 'ai',
  },
  {
    key: 'ai_risk_detection',
    name: 'AI Risk Detection',
    description: 'Detect potential risks in projects, budgets, and schedules',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'ai',
  },

  // Integrations
  {
    key: 'quickbooks_sync',
    name: 'QuickBooks Integration',
    description: 'Two-way sync with QuickBooks Online',
    defaultEnabled: false,
    requiredPlan: 'starter',
    category: 'integrations',
  },
  {
    key: 'xero_sync',
    name: 'Xero Integration',
    description: 'Two-way sync with Xero accounting',
    defaultEnabled: false,
    requiredPlan: 'starter',
    category: 'integrations',
  },
  {
    key: 'sage_sync',
    name: 'Sage Integration',
    description: 'Integration with Sage accounting software',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'integrations',
  },
  {
    key: 'docusign_integration',
    name: 'DocuSign Integration',
    description: 'E-signature workflows with DocuSign',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'integrations',
  },
  {
    key: 'stripe_payments',
    name: 'Stripe Payments',
    description: 'Accept online payments via Stripe',
    defaultEnabled: false,
    requiredPlan: 'starter',
    category: 'integrations',
  },

  // Portals
  {
    key: 'client_portal',
    name: 'Client Portal',
    description: 'Give clients access to their project information',
    defaultEnabled: false,
    requiredPlan: 'starter',
    category: 'portals',
  },
  {
    key: 'vendor_portal',
    name: 'Vendor Portal',
    description: 'Give vendors/subs access to their project information',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'portals',
  },

  // Features
  {
    key: 'time_tracking',
    name: 'Time Tracking',
    description: 'Track employee time with GPS clock in/out',
    defaultEnabled: false,
    requiredPlan: 'starter',
    category: 'features',
  },
  {
    key: 'equipment_tracking',
    name: 'Equipment Tracking',
    description: 'Track equipment usage, maintenance, and daily rates',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'features',
  },
  {
    key: 'inventory_management',
    name: 'Inventory Management',
    description: 'Track inventory across warehouses and job sites',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'features',
  },
  {
    key: 'custom_fields',
    name: 'Custom Fields',
    description: 'Add custom fields to any entity type',
    defaultEnabled: true,
    requiredPlan: 'starter',
    category: 'features',
  },

  // Advanced
  {
    key: 'advanced_reporting',
    name: 'Advanced Reporting',
    description: 'Custom report builder and executive dashboards',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'advanced',
  },
  {
    key: 'multi_currency',
    name: 'Multi-Currency Support',
    description: 'Work with multiple currencies in a single account',
    defaultEnabled: false,
    requiredPlan: 'enterprise',
    category: 'advanced',
  },
  {
    key: 'api_access',
    name: 'API Access',
    description: 'Access the RossOS API for custom integrations',
    defaultEnabled: false,
    requiredPlan: 'pro',
    category: 'advanced',
  },
  {
    key: 'white_label',
    name: 'White Label',
    description: 'Custom branding and domain for your account',
    defaultEnabled: false,
    requiredPlan: 'enterprise',
    category: 'advanced',
  },
]

// ============================================================================
// PLAN HIERARCHY
// ============================================================================

const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
}

function planMeetsRequirement(currentPlan: SubscriptionPlan, requiredPlan: SubscriptionPlan): boolean {
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan]
}

// ============================================================================
// CACHE
// ============================================================================

interface FlagCacheEntry {
  flags: Map<string, FeatureFlag>
  companyPlan: SubscriptionPlan
  expiresAt: number
}

const flagCache = new Map<string, FlagCacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getFlagsFromCache(companyId: string): FlagCacheEntry | undefined {
  const entry = flagCache.get(companyId)
  if (entry && entry.expiresAt > Date.now()) {
    return entry
  }
  if (entry) {
    flagCache.delete(companyId)
  }
  return undefined
}

/**
 * Clear feature flag cache for a company
 */
export function clearFeatureFlagCache(companyId: string): void {
  flagCache.delete(companyId)
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Check if a feature is enabled for a company
 */
export async function isFeatureEnabled(
  companyId: string,
  flagKey: FeatureFlagKey
): Promise<boolean> {
  const cached = getFlagsFromCache(companyId)

  if (cached) {
    const flag = cached.flags.get(flagKey)
    if (flag) {
      // Check plan requirement
      if (flag.planRequired && !planMeetsRequirement(cached.companyPlan, flag.planRequired as SubscriptionPlan)) {
        return false
      }
      return flag.enabled
    }
    // Flag not in DB - check definition default
    const definition = FEATURE_FLAG_DEFINITIONS.find((d) => d.key === flagKey)
    if (definition) {
      if (definition.requiredPlan && !planMeetsRequirement(cached.companyPlan, definition.requiredPlan)) {
        return false
      }
      return definition.defaultEnabled
    }
    return false
  }

  // Fetch from DB
  const supabase = await createClient()

  // Get company plan
  const { data: companyData } = await supabase
    .from('companies')
    .select('subscription_tier')
    .eq('id', companyId)
    .single()

  const company = companyData as CompanyTierRow | null
  const companyPlan = (company?.subscription_tier as SubscriptionPlan) || 'free'

  // Get all flags for this company
  const { data: flagsData } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('company_id', companyId)

  const flags = (flagsData || []) as FeatureFlagDB[]

  // Build cache
  const flagMap = new Map<string, FeatureFlag>()
  for (const flag of flags) {
    flagMap.set(flag.flag_key, {
      id: flag.id,
      companyId: flag.company_id,
      flagKey: flag.flag_key,
      enabled: flag.enabled ?? false,
      planRequired: flag.plan_required as SubscriptionPlan | undefined,
      metadata: (flag.metadata as Record<string, unknown>) || {},
      enabledAt: flag.enabled_at ?? undefined,
      enabledBy: flag.enabled_by ?? undefined,
      createdAt: flag.created_at ?? new Date().toISOString(),
      updatedAt: flag.updated_at ?? new Date().toISOString(),
    })
  }

  flagCache.set(companyId, {
    flags: flagMap,
    companyPlan,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  // Now check the flag
  const flag = flagMap.get(flagKey)
  if (flag) {
    if (flag.planRequired && !planMeetsRequirement(companyPlan, flag.planRequired)) {
      return false
    }
    return flag.enabled
  }

  // Use definition default
  const definition = FEATURE_FLAG_DEFINITIONS.find((d) => d.key === flagKey)
  if (definition) {
    if (definition.requiredPlan && !planMeetsRequirement(companyPlan, definition.requiredPlan)) {
      return false
    }
    return definition.defaultEnabled
  }

  return false
}

/**
 * Get all feature flags for a company
 */
export async function getFeatureFlags(companyId: string): Promise<{
  flags: Array<{
    key: FeatureFlagKey
    name: string
    description: string
    category: string
    enabled: boolean
    requiredPlan?: SubscriptionPlan
    available: boolean // Whether the company's plan allows this feature
  }>
  companyPlan: SubscriptionPlan
}> {
  const supabase = await createClient()

  // Get company plan
  const { data: companyData } = await supabase
    .from('companies')
    .select('subscription_tier')
    .eq('id', companyId)
    .single()

  const company = companyData as CompanyTierRow | null
  const companyPlan = (company?.subscription_tier as SubscriptionPlan) || 'free'

  // Get saved flags
  const { data: savedFlagsData } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('company_id', companyId)

  const savedFlags = (savedFlagsData || []) as FeatureFlagDB[]
  const savedFlagMap = new Map<string, boolean>()
  for (const flag of savedFlags) {
    savedFlagMap.set(flag.flag_key, flag.enabled ?? false)
  }

  // Build combined list
  const flags = FEATURE_FLAG_DEFINITIONS.map((definition) => {
    const savedEnabled = savedFlagMap.get(definition.key)
    const enabled = savedEnabled ?? definition.defaultEnabled
    const available = definition.requiredPlan
      ? planMeetsRequirement(companyPlan, definition.requiredPlan)
      : true

    return {
      key: definition.key,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      enabled: available && enabled,
      requiredPlan: definition.requiredPlan,
      available,
    }
  })

  return { flags, companyPlan }
}

/**
 * Enable or disable a feature flag
 */
export async function setFeatureFlag(
  companyId: string,
  flagKey: FeatureFlagKey,
  enabled: boolean,
  userId?: string
): Promise<void> {
  const supabase = await createClient()

  const definition = FEATURE_FLAG_DEFINITIONS.find((d) => d.key === flagKey)


  const { error } = await supabase
    .from('feature_flags')
    .upsert({
      company_id: companyId,
      flag_key: flagKey,
      enabled,
      plan_required: definition?.requiredPlan || null,
      enabled_at: enabled ? new Date().toISOString() : null,
      enabled_by: enabled ? userId : null,
    }, {
      onConflict: 'company_id,flag_key',
    })

  if (error) {
    throw new Error(`Failed to set feature flag: ${error.message}`)
  }

  clearFeatureFlagCache(companyId)
}

/**
 * Bulk update feature flags
 */
export async function setFeatureFlags(
  companyId: string,
  flags: Array<{ key: FeatureFlagKey; enabled: boolean }>,
  userId?: string
): Promise<void> {
  const supabase = await createClient()

  const now = new Date().toISOString()


  const { error } = await supabase
    .from('feature_flags')
    .upsert(
      flags.map((flag) => {
        const definition = FEATURE_FLAG_DEFINITIONS.find((d) => d.key === flag.key)
        return {
          company_id: companyId,
          flag_key: flag.key,
          enabled: flag.enabled,
          plan_required: definition?.requiredPlan || null,
          enabled_at: flag.enabled ? now : null,
          enabled_by: flag.enabled ? userId : null,
        }
      }),
      { onConflict: 'company_id,flag_key' }
    )

  if (error) {
    throw new Error(`Failed to set feature flags: ${error.message}`)
  }

  clearFeatureFlagCache(companyId)
}

/**
 * Get feature flag definitions grouped by category
 */
export function getFeatureFlagDefinitions(): Record<string, FeatureFlagDefinition[]> {
  const grouped: Record<string, FeatureFlagDefinition[]> = {}

  for (const definition of FEATURE_FLAG_DEFINITIONS) {
    if (!grouped[definition.category]) {
      grouped[definition.category] = []
    }
    grouped[definition.category].push(definition)
  }

  return grouped
}

/**
 * Check multiple features at once (batch check)
 */
export async function areFeaturesEnabled(
  companyId: string,
  flagKeys: FeatureFlagKey[]
): Promise<Record<FeatureFlagKey, boolean>> {
  const results: Record<string, boolean> = {}

  // Use Promise.all for parallel checks (they'll share cache after first fetch)
  const checks = await Promise.all(
    flagKeys.map(async (key) => ({
      key,
      enabled: await isFeatureEnabled(companyId, key),
    }))
  )

  for (const check of checks) {
    results[check.key] = check.enabled
  }

  return results as Record<FeatureFlagKey, boolean>
}
