/**
 * Configuration Resolution Engine
 *
 * Implements the 4-level configuration hierarchy:
 * 1. Platform Defaults (hardcoded fallbacks)
 * 2. Company Settings (from tenant_configs table)
 * 3. Project Overrides (from project-specific settings)
 * 4. User Preferences (from user preferences)
 *
 * Each level can override the previous level.
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConfigContext,
  ConfigLevel,
  ConfigSection,
  ResolvedConfig,
  CompanySettings,
} from './types'
import type { Json, TenantConfig } from '@/types/database'

// Query result types for Supabase responses
type UserPreferencesRow = { preferences: Json | null }
type JobSettingsRow = { settings: Json | null }
type TenantConfigRow = Pick<TenantConfig, 'key' | 'value'>

// ============================================================================
// PLATFORM DEFAULTS (Hardcoded Fallbacks)
// ============================================================================

const PLATFORM_DEFAULTS: Record<ConfigSection, Record<string, Json>> = {
  financial: {
    invoice_approval_threshold: 25000,
    po_approval_threshold: 10000,
    default_markup_percent: 18,
    default_retainage_percent: 10,
    default_payment_terms: 'Net 30',
    fiscal_year_start_month: 1,
  },
  regional: {
    timezone: 'America/Chicago',
    date_format: 'MM/DD/YYYY',
    currency: 'USD',
    measurement_system: 'imperial',
  },
  ai: {
    auto_match_confidence: 85,
    cost_code_suggestion_enabled: true,
    risk_detection_enabled: true,
    invoice_auto_route_threshold: 5000,
  },
  portal: {
    client_portal_enabled: false,
    vendor_portal_enabled: false,
    allow_client_photo_upload: true,
    show_budget_to_clients: false,
  },
  notifications: {
    email_notifications_enabled: true,
    push_notifications_enabled: true,
    digest_frequency: 'daily',
  },
  security: {
    mfa_required: false,
    session_timeout_minutes: 480,
    max_sessions_per_user: 5,
    ip_whitelist_enabled: false,
  },
  branding: {
    primary_color: '#2563eb',
    logo_url: null,
    portal_theme: 'light',
  },
}

// ============================================================================
// CONFIG CACHE (In-Memory for Performance)
// ============================================================================

interface CacheEntry {
  value: Json
  level: ConfigLevel
  expiresAt: number
}

const configCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCacheKey(companyId: string, section: string, key: string, projectId?: string, userId?: string): string {
  return `${companyId}:${section}:${key}:${projectId || ''}:${userId || ''}`
}

function getFromCache(cacheKey: string): CacheEntry | undefined {
  const entry = configCache.get(cacheKey)
  if (entry && entry.expiresAt > Date.now()) {
    return entry
  }
  if (entry) {
    configCache.delete(cacheKey)
  }
  return undefined
}

function setInCache(cacheKey: string, value: Json, level: ConfigLevel): void {
  configCache.set(cacheKey, {
    value,
    level,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

/**
 * Clear config cache for a company (call after config updates)
 */
export function clearConfigCache(companyId: string): void {
  const keysToDelete: string[] = []
  for (const key of configCache.keys()) {
    if (key.startsWith(`${companyId}:`)) {
      keysToDelete.push(key)
    }
  }
  keysToDelete.forEach((key) => configCache.delete(key))
}

// ============================================================================
// CORE RESOLUTION FUNCTIONS
// ============================================================================

/**
 * Resolve a single config value through the 4-level hierarchy
 */
export async function resolveConfig<T = Json>(
  context: ConfigContext,
  section: ConfigSection,
  key: string
): Promise<ResolvedConfig<T>> {
  const { companyId, projectId, userId } = context
  const cacheKey = getCacheKey(companyId, section, key, projectId, userId)

  // Check cache first
  const cached = getFromCache(cacheKey)
  if (cached) {
    return {
      value: cached.value as T,
      level: cached.level,
      key,
      section,
    }
  }

  const supabase = await createClient()

  // Level 4: User Preferences (if userId provided)
  if (userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single()

    const user = userData as UserPreferencesRow | null
    if (user?.preferences) {
      const prefs = user.preferences as Record<string, Record<string, Json>>
      if (prefs[section]?.[key] !== undefined) {
        const value = prefs[section][key]
        setInCache(cacheKey, value, 'user')
        return { value: value as T, level: 'user', key, section }
      }
    }
  }

  // Level 3: Project Overrides (if projectId provided)
  if (projectId) {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('settings')
      .eq('id', projectId)
      .single()

    const job = jobData as JobSettingsRow | null
    if (job?.settings) {
      const settings = job.settings as Record<string, Record<string, Json>>
      if (settings[section]?.[key] !== undefined) {
        const value = settings[section][key]
        setInCache(cacheKey, value, 'project')
        return { value: value as T, level: 'project', key, section }
      }
    }
  }

  // Level 2: Company Settings
  const { data: configData } = await (supabase as any)
    .from('tenant_configs')
    .select('value')
    .eq('company_id', companyId)
    .eq('section', section)
    .eq('key', key)
    .single()

  const tenantConfig = configData as { value: Json } | null
  if (tenantConfig?.value !== undefined) {
    const value = tenantConfig.value
    setInCache(cacheKey, value, 'company')
    return { value: value as T, level: 'company', key, section }
  }

  // Level 1: Platform Defaults
  const platformValue = PLATFORM_DEFAULTS[section]?.[key]
  if (platformValue !== undefined) {
    setInCache(cacheKey, platformValue, 'platform')
    return { value: platformValue as T, level: 'platform', key, section }
  }

  // No value found at any level
  return { value: null as T, level: 'platform', key, section }
}

/**
 * Resolve all config values for a section
 */
export async function resolveSectionConfig(
  context: ConfigContext,
  section: ConfigSection
): Promise<Record<string, ResolvedConfig>> {
  const { companyId, projectId, userId } = context
  const result: Record<string, ResolvedConfig> = {}

  // Start with platform defaults
  const platformDefaults = PLATFORM_DEFAULTS[section] || {}
  for (const [key, value] of Object.entries(platformDefaults)) {
    result[key] = { value, level: 'platform', key, section }
  }

  const supabase = await createClient()

  // Override with company settings
  const { data: configsData } = await (supabase as any)
    .from('tenant_configs')
    .select('key, value')
    .eq('company_id', companyId)
    .eq('section', section)

  const tenantConfigs = (configsData || []) as TenantConfigRow[]
  for (const config of tenantConfigs) {
    result[config.key] = { value: config.value, level: 'company', key: config.key, section }
  }

  // Override with project settings
  if (projectId) {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('settings')
      .eq('id', projectId)
      .single()

    const job = jobData as JobSettingsRow | null
    if (job?.settings) {
      const settings = job.settings as Record<string, Record<string, Json>>
      if (settings[section]) {
        for (const [key, value] of Object.entries(settings[section])) {
          result[key] = { value, level: 'project', key, section }
        }
      }
    }
  }

  // Override with user preferences
  if (userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single()

    const user = userData as UserPreferencesRow | null
    if (user?.preferences) {
      const prefs = user.preferences as Record<string, Record<string, Json>>
      if (prefs[section]) {
        for (const [key, value] of Object.entries(prefs[section])) {
          result[key] = { value, level: 'user', key, section }
        }
      }
    }
  }

  return result
}

/**
 * Get all company settings as a typed object
 */
export async function getCompanySettings(companyId: string): Promise<CompanySettings> {
  const context: ConfigContext = { companyId }

  // Resolve all sections in parallel
  const [financial, regional, ai, portal, notifications] = await Promise.all([
    resolveSectionConfig(context, 'financial'),
    resolveSectionConfig(context, 'regional'),
    resolveSectionConfig(context, 'ai'),
    resolveSectionConfig(context, 'portal'),
    resolveSectionConfig(context, 'notifications'),
  ])

  return {
    // Financial
    invoiceApprovalThreshold: financial.invoice_approval_threshold?.value as number ?? 25000,
    poApprovalThreshold: financial.po_approval_threshold?.value as number ?? 10000,
    defaultMarkupPercent: financial.default_markup_percent?.value as number ?? 18,
    defaultRetainagePercent: financial.default_retainage_percent?.value as number ?? 10,
    defaultPaymentTerms: financial.default_payment_terms?.value as string ?? 'Net 30',
    fiscalYearStartMonth: financial.fiscal_year_start_month?.value as number ?? 1,

    // Regional
    timezone: regional.timezone?.value as string ?? 'America/Chicago',
    dateFormat: regional.date_format?.value as string ?? 'MM/DD/YYYY',
    currency: regional.currency?.value as string ?? 'USD',
    measurementSystem: regional.measurement_system?.value as 'imperial' | 'metric' ?? 'imperial',

    // AI
    autoMatchConfidence: ai.auto_match_confidence?.value as number ?? 85,
    costCodeSuggestionEnabled: ai.cost_code_suggestion_enabled?.value as boolean ?? true,
    riskDetectionEnabled: ai.risk_detection_enabled?.value as boolean ?? true,
    invoiceAutoRouteThreshold: ai.invoice_auto_route_threshold?.value as number ?? 5000,

    // Portal
    clientPortalEnabled: portal.client_portal_enabled?.value as boolean ?? false,
    vendorPortalEnabled: portal.vendor_portal_enabled?.value as boolean ?? false,
    allowClientPhotoUpload: portal.allow_client_photo_upload?.value as boolean ?? true,
    showBudgetToClients: portal.show_budget_to_clients?.value as boolean ?? false,

    // Notifications
    emailNotificationsEnabled: notifications.email_notifications_enabled?.value as boolean ?? true,
    pushNotificationsEnabled: notifications.push_notifications_enabled?.value as boolean ?? true,
    digestFrequency: notifications.digest_frequency?.value as 'realtime' | 'hourly' | 'daily' | 'weekly' ?? 'daily',
  }
}

/**
 * Update a company setting
 */
export async function updateCompanySetting(
  companyId: string,
  section: ConfigSection,
  key: string,
  value: Json
): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('tenant_configs')
    .upsert({
      company_id: companyId,
      section,
      key,
      value,
    }, {
      onConflict: 'company_id,section,key',
    })

  if (error) {
    throw new Error(`Failed to update config: ${error.message}`)
  }

  // Clear cache for this company
  clearConfigCache(companyId)
}

/**
 * Update multiple company settings at once
 */
export async function updateCompanySettings(
  companyId: string,
  settings: Array<{ section: ConfigSection; key: string; value: Json }>
): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('tenant_configs')
    .upsert(
      settings.map((s) => ({
        company_id: companyId,
        section: s.section,
        key: s.key,
        value: s.value,
      })),
      { onConflict: 'company_id,section,key' }
    )

  if (error) {
    throw new Error(`Failed to update configs: ${error.message}`)
  }

  // Clear cache for this company
  clearConfigCache(companyId)
}

// ============================================================================
// CONVENIENCE HELPERS
// ============================================================================

/**
 * Get a single config value (shorthand)
 */
export async function getConfig<T = Json>(
  companyId: string,
  section: ConfigSection,
  key: string,
  defaultValue?: T
): Promise<T> {
  const result = await resolveConfig<T>({ companyId }, section, key)
  return result.value ?? (defaultValue as T)
}

/**
 * Check if a config value equals a specific value
 */
export async function configEquals(
  companyId: string,
  section: ConfigSection,
  key: string,
  expectedValue: Json
): Promise<boolean> {
  const result = await resolveConfig({ companyId }, section, key)
  return result.value === expectedValue
}

/**
 * Get platform default for a key
 */
export function getPlatformDefault<T = Json>(section: ConfigSection, key: string): T | undefined {
  return PLATFORM_DEFAULTS[section]?.[key] as T | undefined
}

/**
 * List all platform defaults
 */
export function listPlatformDefaults(): Record<ConfigSection, Record<string, Json>> {
  return PLATFORM_DEFAULTS
}
