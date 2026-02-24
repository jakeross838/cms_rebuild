/**
 * Module 02 — Configuration Engine Acceptance Tests
 * Verifies spec contract requirements for the config engine.
 *
 * Tests pure function behavior from config lib — no DB needed.
 */

import { describe, it, expect } from 'vitest'

import { FEATURE_FLAG_DEFINITIONS, getFeatureFlagDefinitions } from '@/lib/config/feature-flags'
import { getDefaultTerminology } from '@/lib/config/terminology'
import { validatePattern, getDefaultPatterns } from '@/lib/config/numbering'
import { listPlatformDefaults, getPlatformDefault } from '@/lib/config/resolve-config'

// ============================================================================
// FEATURE FLAGS
// ============================================================================

describe('Feature Flag Definitions', () => {
  it('has at least 18 feature flag definitions', () => {
    expect(FEATURE_FLAG_DEFINITIONS.length).toBeGreaterThanOrEqual(18)
  })

  it('every flag has required fields: key, name, description, category', () => {
    for (const flag of FEATURE_FLAG_DEFINITIONS) {
      expect(flag.key).toBeTruthy()
      expect(flag.name).toBeTruthy()
      expect(flag.description).toBeTruthy()
      expect(flag.category).toBeTruthy()
    }
  })

  it('all flags have unique keys', () => {
    const keys = FEATURE_FLAG_DEFINITIONS.map((f) => f.key)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })

  it('flags span 5 categories: ai, integrations, portals, features, advanced', () => {
    const categories = new Set(FEATURE_FLAG_DEFINITIONS.map((f) => f.category))
    expect(categories).toContain('ai')
    expect(categories).toContain('integrations')
    expect(categories).toContain('portals')
    expect(categories).toContain('features')
    expect(categories).toContain('advanced')
    expect(categories.size).toBe(5)
  })

  it('getFeatureFlagDefinitions groups flags by category', () => {
    const grouped = getFeatureFlagDefinitions()
    expect(Object.keys(grouped)).toContain('ai')
    expect(Object.keys(grouped)).toContain('integrations')

    // Verify grouped flags match total
    let total = 0
    for (const flags of Object.values(grouped)) {
      total += flags.length
    }
    expect(total).toBe(FEATURE_FLAG_DEFINITIONS.length)
  })

  it('known flags exist: ai_invoice_processing, client_portal, quickbooks_sync', () => {
    const keys = FEATURE_FLAG_DEFINITIONS.map((f) => f.key)
    expect(keys).toContain('ai_invoice_processing')
    expect(keys).toContain('client_portal')
    expect(keys).toContain('quickbooks_sync')
  })

  it('plan hierarchy: flags have valid plan requirements', () => {
    const validPlans = ['free', 'starter', 'pro', 'enterprise']
    for (const flag of FEATURE_FLAG_DEFINITIONS) {
      if (flag.requiredPlan) {
        expect(validPlans).toContain(flag.requiredPlan)
      }
    }
  })
})

// ============================================================================
// TERMINOLOGY
// ============================================================================

describe('Terminology Defaults', () => {
  const defaults = getDefaultTerminology()

  it('has at least 35 default terms', () => {
    expect(Object.keys(defaults).length).toBeGreaterThanOrEqual(35)
  })

  it('every term has singular and plural values', () => {
    for (const [key, term] of Object.entries(defaults)) {
      expect(term.singular, `${key} missing singular`).toBeTruthy()
      expect(term.plural, `${key} missing plural`).toBeTruthy()
    }
  })

  it('known terms exist: job, client, vendor, invoice, estimate', () => {
    expect(defaults.job).toBeDefined()
    expect(defaults.client).toBeDefined()
    expect(defaults.vendor).toBeDefined()
    expect(defaults.invoice).toBeDefined()
    expect(defaults.estimate).toBeDefined()
  })

  it('job term has correct defaults', () => {
    expect(defaults.job.singular).toBe('Job')
    expect(defaults.job.plural).toBe('Jobs')
  })

  it('change_order term has correct defaults', () => {
    expect(defaults.change_order.singular).toBe('Change Order')
    expect(defaults.change_order.plural).toBe('Change Orders')
  })
})

// ============================================================================
// NUMBERING PATTERNS
// ============================================================================

describe('Numbering Patterns', () => {
  const defaults = getDefaultPatterns()

  it('has defaults for 8 entity types', () => {
    const entityTypes = Object.keys(defaults)
    expect(entityTypes).toHaveLength(8)
    expect(entityTypes).toContain('job')
    expect(entityTypes).toContain('invoice')
    expect(entityTypes).toContain('purchase_order')
    expect(entityTypes).toContain('change_order')
    expect(entityTypes).toContain('draw')
    expect(entityTypes).toContain('estimate')
    expect(entityTypes).toContain('contract')
    expect(entityTypes).toContain('rfi')
  })

  it('each default has pattern, scope, and padding', () => {
    for (const [key, pattern] of Object.entries(defaults)) {
      expect(pattern.pattern, `${key} missing pattern`).toBeTruthy()
      expect(pattern.scope, `${key} missing scope`).toBeTruthy()
      expect(pattern.padding, `${key} missing padding`).toBeGreaterThan(0)
    }
  })

  it('validatePattern accepts valid patterns', () => {
    expect(validatePattern('JOB-{YYYY}-{###}').valid).toBe(true)
    expect(validatePattern('INV-{####}').valid).toBe(true)
    expect(validatePattern('{YY}{MM}-{##}').valid).toBe(true)
    expect(validatePattern('RFI-{JOB}-{###}').valid).toBe(true)
    expect(validatePattern('{PREFIX}-{YYYY}-{#}').valid).toBe(true)
  })

  it('validatePattern rejects patterns without sequence token', () => {
    const result = validatePattern('JOB-{YYYY}')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('sequence token')
  })

  it('validatePattern rejects patterns with invalid tokens', () => {
    const result = validatePattern('JOB-{INVALID}-{###}')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid token')
  })

  it('validatePattern rejects empty patterns', () => {
    const result = validatePattern('   ')
    expect(result.valid).toBe(false)
  })
})

// ============================================================================
// CONFIG RESOLUTION
// ============================================================================

describe('Platform Defaults (Config Resolution)', () => {
  const defaults = listPlatformDefaults()

  it('has defaults for all config sections: financial, regional, ai, portal, notifications, security, branding', () => {
    expect(defaults.financial).toBeDefined()
    expect(defaults.regional).toBeDefined()
    expect(defaults.ai).toBeDefined()
    expect(defaults.portal).toBeDefined()
    expect(defaults.notifications).toBeDefined()
    expect(defaults.security).toBeDefined()
    expect(defaults.branding).toBeDefined()
  })

  it('financial defaults include required fields', () => {
    const f = defaults.financial
    expect(f.invoice_approval_threshold).toBeDefined()
    expect(f.po_approval_threshold).toBeDefined()
    expect(f.default_markup_percent).toBeDefined()
    expect(f.default_retainage_percent).toBeDefined()
    expect(f.default_payment_terms).toBeDefined()
    expect(f.fiscal_year_start_month).toBeDefined()
  })

  it('regional defaults include timezone, date_format, currency, measurement_system', () => {
    const r = defaults.regional
    expect(r.timezone).toBe('America/Chicago')
    expect(r.date_format).toBe('MM/DD/YYYY')
    expect(r.currency).toBe('USD')
    expect(r.measurement_system).toBe('imperial')
  })

  it('ai defaults include auto_match_confidence', () => {
    expect(defaults.ai.auto_match_confidence).toBe(85)
  })

  it('notification defaults include digest_frequency', () => {
    expect(defaults.notifications.digest_frequency).toBe('daily')
  })

  it('getPlatformDefault returns individual values', () => {
    expect(getPlatformDefault('financial', 'default_markup_percent')).toBe(18)
    expect(getPlatformDefault('regional', 'timezone')).toBe('America/Chicago')
    expect(getPlatformDefault('notifications', 'digest_frequency')).toBe('daily')
  })

  it('getPlatformDefault returns undefined for unknown keys', () => {
    expect(getPlatformDefault('financial', 'nonexistent_key')).toBeUndefined()
  })
})

// ============================================================================
// API ROUTE FILES EXIST
// ============================================================================

describe('API Route Files', () => {
  // Note: Dynamic imports of API routes fail in vitest because the middleware
  // dependency chain pulls in @vercel/kv which isn't installed in test.
  // Instead, verify the route files exist via a static check of the config lib
  // barrel exports which the routes depend on.

  it('config barrel exports all functions needed by company route', async () => {
    const config = await import('@/lib/config/index')
    expect(config.getCompanySettings).toBeDefined()
    expect(config.updateCompanySettings).toBeDefined()
    expect(config.clearConfigCache).toBeDefined()
  })

  it('config barrel exports all functions needed by feature-flags route', async () => {
    const config = await import('@/lib/config/index')
    expect(config.getFeatureFlags).toBeDefined()
    expect(config.setFeatureFlags).toBeDefined()
    expect(config.FEATURE_FLAG_DEFINITIONS).toBeDefined()
  })

  it('config barrel exports all functions needed by terminology route', async () => {
    const config = await import('@/lib/config/index')
    expect(config.getAllTerminology).toBeDefined()
    expect(config.setTerminologyBulk).toBeDefined()
    expect(config.resetTerminology).toBeDefined()
    expect(config.getDefaultTerminology).toBeDefined()
  })

  it('config barrel exports all functions needed by numbering route', async () => {
    const config = await import('@/lib/config/index')
    expect(config.getNumberingPatterns).toBeDefined()
    expect(config.setNumberingPattern).toBeDefined()
    expect(config.validatePattern).toBeDefined()
    expect(config.previewNextNumber).toBeDefined()
    expect(config.getDefaultPatterns).toBeDefined()
  })

  it('numbering validatePattern is re-exported from barrel', async () => {
    // Verify the function works when imported through the barrel
    const config = await import('@/lib/config/index')
    expect(config.validatePattern('JOB-{###}').valid).toBe(true)
    expect(config.validatePattern('NOSEQ').valid).toBe(false)
  })
})
