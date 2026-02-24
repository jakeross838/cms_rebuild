/**
 * Terminology Engine
 *
 * Manages customizable display terms that propagate throughout:
 * - Internal UI
 * - Client Portal
 * - Vendor Portal
 * - Generated Documents
 *
 * Companies can override ~50 standard terms to match their business language.
 */

import { createClient } from '@/lib/supabase/server'
import type { TerminologyOverride as TerminologyOverrideDB } from '@/types/database'
import type { TerminologyKey } from './types'

// ============================================================================
// DEFAULT TERMINOLOGY
// ============================================================================

interface TermDefinition {
  singular: string
  plural: string
  description?: string
}

const DEFAULT_TERMINOLOGY: Record<TerminologyKey, TermDefinition> = {
  job: { singular: 'Job', plural: 'Jobs', description: 'A construction project' },
  project: { singular: 'Project', plural: 'Projects', description: 'Alternative name for job' },
  vendor: { singular: 'Vendor', plural: 'Vendors', description: 'Subcontractor or supplier' },
  subcontractor: { singular: 'Subcontractor', plural: 'Subcontractors', description: 'Trade partner' },
  trade_partner: { singular: 'Trade Partner', plural: 'Trade Partners', description: 'Alternative for vendor' },
  client: { singular: 'Client', plural: 'Clients', description: 'Customer/homeowner' },
  homeowner: { singular: 'Homeowner', plural: 'Homeowners', description: 'Alternative for client' },
  customer: { singular: 'Customer', plural: 'Customers', description: 'Alternative for client' },
  invoice: { singular: 'Invoice', plural: 'Invoices', description: 'Bill from vendor' },
  bill: { singular: 'Bill', plural: 'Bills', description: 'Alternative for invoice' },
  draw: { singular: 'Draw', plural: 'Draws', description: 'Draw request' },
  draw_request: { singular: 'Draw Request', plural: 'Draw Requests', description: 'Payment request to lender' },
  change_order: { singular: 'Change Order', plural: 'Change Orders', description: 'Scope change' },
  co: { singular: 'CO', plural: 'COs', description: 'Short for change order' },
  purchase_order: { singular: 'Purchase Order', plural: 'Purchase Orders', description: 'PO' },
  po: { singular: 'PO', plural: 'POs', description: 'Short for purchase order' },
  estimate: { singular: 'Estimate', plural: 'Estimates', description: 'Project estimate' },
  quote: { singular: 'Quote', plural: 'Quotes', description: 'Alternative for estimate' },
  proposal: { singular: 'Proposal', plural: 'Proposals', description: 'Client proposal' },
  bid: { singular: 'Bid', plural: 'Bids', description: 'Vendor bid' },
  rfi: { singular: 'RFI', plural: 'RFIs', description: 'Request for information' },
  submittal: { singular: 'Submittal', plural: 'Submittals', description: 'Document submittal' },
  daily_log: { singular: 'Daily Log', plural: 'Daily Logs', description: 'Daily field report' },
  field_report: { singular: 'Field Report', plural: 'Field Reports', description: 'Alternative for daily log' },
  punch_list: { singular: 'Punch List', plural: 'Punch Lists', description: 'Completion list' },
  selection: { singular: 'Selection', plural: 'Selections', description: 'Product selection' },
  allowance: { singular: 'Allowance', plural: 'Allowances', description: 'Budget allowance' },
  cost_code: { singular: 'Cost Code', plural: 'Cost Codes', description: 'Budget category' },
  phase: { singular: 'Phase', plural: 'Phases', description: 'Project phase' },
  milestone: { singular: 'Milestone', plural: 'Milestones', description: 'Project milestone' },
  task: { singular: 'Task', plural: 'Tasks', description: 'Work item' },
  budget: { singular: 'Budget', plural: 'Budgets', description: 'Project budget' },
  contract: { singular: 'Contract', plural: 'Contracts', description: 'Agreement' },
  lien_waiver: { singular: 'Lien Waiver', plural: 'Lien Waivers', description: 'Lien release' },
  warranty: { singular: 'Warranty', plural: 'Warranties', description: 'Product/work warranty' },
  inspection: { singular: 'Inspection', plural: 'Inspections', description: 'Building inspection' },
  permit: { singular: 'Permit', plural: 'Permits', description: 'Building permit' },
  document: { singular: 'Document', plural: 'Documents', description: 'File/document' },
  photo: { singular: 'Photo', plural: 'Photos', description: 'Project photo' },
  note: { singular: 'Note', plural: 'Notes', description: 'Comment/note' },
  team_member: { singular: 'Team Member', plural: 'Team Members', description: 'Company employee' },
  employee: { singular: 'Employee', plural: 'Employees', description: 'Alternative for team member' },
  superintendent: { singular: 'Superintendent', plural: 'Superintendents', description: 'Field supervisor' },
  project_manager: { singular: 'Project Manager', plural: 'Project Managers', description: 'PM' },
}

// ============================================================================
// CACHE
// ============================================================================

interface TermCacheEntry {
  terms: Map<string, { singular: string; plural: string; context?: string }>
  expiresAt: number
}

const termCache = new Map<string, TermCacheEntry>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function getTermsFromCache(companyId: string): TermCacheEntry | undefined {
  const entry = termCache.get(companyId)
  if (entry && entry.expiresAt > Date.now()) {
    return entry
  }
  if (entry) {
    termCache.delete(companyId)
  }
  return undefined
}

/**
 * Clear terminology cache for a company
 */
export function clearTerminologyCache(companyId: string): void {
  termCache.delete(companyId)
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get a term for display (singular form)
 */
export async function getTerm(
  companyId: string,
  termKey: TerminologyKey,
  context?: 'portal' | 'internal' | 'documents'
): Promise<string> {
  const cached = getTermsFromCache(companyId)

  if (cached) {
    // Check for context-specific override first
    if (context) {
      const contextKey = `${termKey}:${context}`
      const contextTerm = cached.terms.get(contextKey)
      if (contextTerm) {
        return contextTerm.singular
      }
    }

    // Check for general override
    const term = cached.terms.get(termKey)
    if (term) {
      return term.singular
    }

    // Fall back to default
    return DEFAULT_TERMINOLOGY[termKey]?.singular || termKey
  }

  // Load from database
  await loadTermsToCache(companyId)

  // Recurse with cached data
  return getTerm(companyId, termKey, context)
}

/**
 * Get a term in plural form
 */
export async function getTermPlural(
  companyId: string,
  termKey: TerminologyKey,
  context?: 'portal' | 'internal' | 'documents'
): Promise<string> {
  const cached = getTermsFromCache(companyId)

  if (cached) {
    // Check for context-specific override first
    if (context) {
      const contextKey = `${termKey}:${context}`
      const contextTerm = cached.terms.get(contextKey)
      if (contextTerm?.plural) {
        return contextTerm.plural
      }
    }

    // Check for general override
    const term = cached.terms.get(termKey)
    if (term?.plural) {
      return term.plural
    }

    // Fall back to default
    return DEFAULT_TERMINOLOGY[termKey]?.plural || `${termKey}s`
  }

  // Load from database
  await loadTermsToCache(companyId)

  // Recurse with cached data
  return getTermPlural(companyId, termKey, context)
}

/**
 * Get multiple terms at once
 */
export async function getTerms(
  companyId: string,
  termKeys: TerminologyKey[],
  context?: 'portal' | 'internal' | 'documents'
): Promise<Record<TerminologyKey, { singular: string; plural: string }>> {
  const results: Record<string, { singular: string; plural: string }> = {}

  for (const key of termKeys) {
    results[key] = {
      singular: await getTerm(companyId, key, context),
      plural: await getTermPlural(companyId, key, context),
    }
  }

  return results as Record<TerminologyKey, { singular: string; plural: string }>
}

/**
 * Get all terminology for a company (for settings UI)
 */
export async function getAllTerminology(companyId: string): Promise<{
  terms: Array<{
    key: TerminologyKey
    defaultSingular: string
    defaultPlural: string
    description: string
    overrideSingular?: string
    overridePlural?: string
    context?: string
  }>
}> {
  await loadTermsToCache(companyId)
  const cached = getTermsFromCache(companyId)

  const terms = Object.entries(DEFAULT_TERMINOLOGY).map(([key, def]) => {
    const override = cached?.terms.get(key)
    return {
      key: key as TerminologyKey,
      defaultSingular: def.singular,
      defaultPlural: def.plural,
      description: def.description || '',
      overrideSingular: override?.singular !== def.singular ? override?.singular : undefined,
      overridePlural: override?.plural !== def.plural ? override?.plural : undefined,
      context: override?.context,
    }
  })

  return { terms }
}

/**
 * Set a terminology override
 */
export async function setTerminology(
  companyId: string,
  termKey: TerminologyKey,
  singular: string,
  plural?: string,
  context?: 'portal' | 'internal' | 'documents'
): Promise<void> {
  const supabase = await createClient()

  // If setting back to default, delete the override
  const defaultTerm = DEFAULT_TERMINOLOGY[termKey]
  if (defaultTerm && singular === defaultTerm.singular && (!plural || plural === defaultTerm.plural) && !context) {
    await supabase
      .from('terminology_overrides')
      .delete()
      .eq('company_id', companyId)
      .eq('term_key', termKey)
      .is('context', null)

    clearTerminologyCache(companyId)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('terminology_overrides')
    .upsert({
      company_id: companyId,
      term_key: termKey,
      display_value: singular,
      plural_value: plural || `${singular}s`,
      context: context || null,
    }, {
      onConflict: 'company_id,term_key,context',
    })

  if (error) {
    throw new Error(`Failed to set terminology: ${error.message}`)
  }

  clearTerminologyCache(companyId)
}

/**
 * Bulk update terminology
 */
export async function setTerminologyBulk(
  companyId: string,
  terms: Array<{
    termKey: TerminologyKey
    singular: string
    plural?: string
    context?: 'portal' | 'internal' | 'documents'
  }>
): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('terminology_overrides')
    .upsert(
      terms.map((t) => ({
        company_id: companyId,
        term_key: t.termKey,
        display_value: t.singular,
        plural_value: t.plural || `${t.singular}s`,
        context: t.context || null,
      })),
      { onConflict: 'company_id,term_key,context' }
    )

  if (error) {
    throw new Error(`Failed to set terminology: ${error.message}`)
  }

  clearTerminologyCache(companyId)
}

/**
 * Reset terminology to defaults
 */
export async function resetTerminology(
  companyId: string,
  termKey?: TerminologyKey
): Promise<void> {
  const supabase = await createClient()

  if (termKey) {
    await supabase
      .from('terminology_overrides')
      .delete()
      .eq('company_id', companyId)
      .eq('term_key', termKey)
  } else {
    // Reset all
    await supabase
      .from('terminology_overrides')
      .delete()
      .eq('company_id', companyId)
  }

  clearTerminologyCache(companyId)
}

// ============================================================================
// HELPERS
// ============================================================================

async function loadTermsToCache(companyId: string): Promise<void> {
  const supabase = await createClient()

  const { data: overridesData } = await supabase
    .from('terminology_overrides')
    .select('*')
    .eq('company_id', companyId)

  const overrides = (overridesData || []) as TerminologyOverrideDB[]
  const terms = new Map<string, { singular: string; plural: string; context?: string }>()

  // First, add all defaults
  for (const [key, def] of Object.entries(DEFAULT_TERMINOLOGY)) {
    terms.set(key, { singular: def.singular, plural: def.plural })
  }

  // Then overlay overrides
  for (const override of overrides) {
    const key = override.context
      ? `${override.term_key}:${override.context}`
      : override.term_key

    terms.set(key, {
      singular: override.display_value,
      plural: override.plural_value || `${override.display_value}s`,
      context: override.context || undefined,
    })

    // Also update the base key if no context
    if (!override.context) {
      terms.set(override.term_key, {
        singular: override.display_value,
        plural: override.plural_value || `${override.display_value}s`,
      })
    }
  }

  termCache.set(companyId, {
    terms,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

/**
 * Get default terminology (no company-specific overrides)
 */
export function getDefaultTerminology(): Record<TerminologyKey, TermDefinition> {
  return DEFAULT_TERMINOLOGY
}

/**
 * Create a terminology helper for use in components
 */
export function createTerminologyHelper(companyId: string) {
  return {
    term: (key: TerminologyKey, context?: 'portal' | 'internal' | 'documents') =>
      getTerm(companyId, key, context),
    plural: (key: TerminologyKey, context?: 'portal' | 'internal' | 'documents') =>
      getTermPlural(companyId, key, context),
    terms: (keys: TerminologyKey[], context?: 'portal' | 'internal' | 'documents') =>
      getTerms(companyId, keys, context),
  }
}
