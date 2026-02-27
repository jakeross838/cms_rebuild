/**
 * Numbering Sequence Generator
 *
 * Generates unique sequential numbers for entities (jobs, invoices, POs, etc.)
 * based on configurable patterns.
 *
 * Pattern tokens:
 * - {YYYY} - Full year (2026)
 * - {YY} - Two-digit year (26)
 * - {MM} - Two-digit month (01-12)
 * - {###} - Sequence with 3-digit padding
 * - {##} - Sequence with 2-digit padding
 * - {#} - Sequence without padding
 * - {JOB} - Job number (for per-job sequences)
 * - {PREFIX} - Custom prefix
 * - {SUFFIX} - Custom suffix
 *
 * Examples:
 * - 'JOB-{YYYY}-{###}' → 'JOB-2026-001'
 * - 'INV-{JOB}-{###}' → 'INV-JOB-2026-001-003'
 * - '{YY}{MM}-{###}' → '2601-042'
 */

import { createClient } from '@/lib/supabase/server'
import type { NumberingPattern as NumberingPatternDB } from '@/types/database'
import type { NumberingPattern, NumberingEntityType, NumberingScope, NumberingPatternInput } from './types'

// Query result types
type SequenceRow = { current_value: number }
type JobNumberRow = { job_number: string | null }

// ============================================================================
// DEFAULT PATTERNS
// ============================================================================

const DEFAULT_PATTERNS: Record<NumberingEntityType, { pattern: string; scope: NumberingScope; padding: number }> = {
  job: { pattern: 'JOB-{YYYY}-{###}', scope: 'global', padding: 3 },
  invoice: { pattern: 'INV-{YYYY}-{####}', scope: 'global', padding: 4 },
  purchase_order: { pattern: 'PO-{YYYY}-{###}', scope: 'global', padding: 3 },
  change_order: { pattern: 'CO-{JOB}-{##}', scope: 'per_job', padding: 2 },
  draw: { pattern: 'DRW-{JOB}-{##}', scope: 'per_job', padding: 2 },
  estimate: { pattern: 'EST-{YYYY}-{###}', scope: 'global', padding: 3 },
  contract: { pattern: 'CTR-{YYYY}-{###}', scope: 'global', padding: 3 },
  rfi: { pattern: 'RFI-{JOB}-{###}', scope: 'per_job', padding: 3 },
}

// ============================================================================
// CACHE
// ============================================================================

interface PatternCacheEntry {
  patterns: Map<NumberingEntityType, NumberingPattern>
  expiresAt: number
}

const patternCache = new Map<string, PatternCacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getPatternsFromCache(companyId: string): PatternCacheEntry | undefined {
  const entry = patternCache.get(companyId)
  if (entry && entry.expiresAt > Date.now()) {
    return entry
  }
  if (entry) {
    patternCache.delete(companyId)
  }
  return undefined
}

/**
 * Clear numbering pattern cache for a company
 */
export function clearNumberingCache(companyId: string): void {
  patternCache.delete(companyId)
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get the next number for an entity type
 */
export async function getNextNumber(
  companyId: string,
  entityType: NumberingEntityType,
  jobId?: string
): Promise<string> {
  const supabase = await createClient()

  // Try to use the database function first (atomic operation)
  const { data, error } = await supabase.rpc('get_next_sequence_number', {
    p_company_id: companyId,
    p_entity_type: entityType,
    p_job_id: jobId || undefined,
  })

  if (!error && data) {
    return data as string
  }

  // Fallback: manual generation if RPC fails
  return generateNumberManually(companyId, entityType, jobId)
}

/**
 * Preview what the next number would look like (without incrementing)
 */
export async function previewNextNumber(
  companyId: string,
  entityType: NumberingEntityType,
  jobId?: string
): Promise<string> {
  const pattern = await getPattern(companyId, entityType)
  const nextSeq = pattern.currentSequence + 1

  return formatNumber(pattern, nextSeq, jobId)
}

/**
 * Get all numbering patterns for a company
 */
export async function getNumberingPatterns(companyId: string): Promise<{
  patterns: Array<{
    entityType: NumberingEntityType
    pattern: string
    scope: NumberingScope
    padding: number
    currentSequence: number
    sampleOutput: string
    resetYearly: boolean
    isCustom: boolean
  }>
}> {
  await loadPatternsToCache(companyId)
  const cached = getPatternsFromCache(companyId)

  const patterns: Array<{
    entityType: NumberingEntityType
    pattern: string
    scope: NumberingScope
    padding: number
    currentSequence: number
    sampleOutput: string
    resetYearly: boolean
    isCustom: boolean
  }> = []

  for (const [entityType, defaultPattern] of Object.entries(DEFAULT_PATTERNS)) {
    const customPattern = cached?.patterns.get(entityType as NumberingEntityType)

    if (customPattern) {
      patterns.push({
        entityType: entityType as NumberingEntityType,
        pattern: customPattern.pattern,
        scope: customPattern.scope,
        padding: customPattern.padding,
        currentSequence: customPattern.currentSequence,
        sampleOutput: customPattern.sampleOutput || formatNumber(customPattern, customPattern.currentSequence + 1),
        resetYearly: customPattern.resetYearly,
        isCustom: true,
      })
    } else {
      patterns.push({
        entityType: entityType as NumberingEntityType,
        pattern: defaultPattern.pattern,
        scope: defaultPattern.scope,
        padding: defaultPattern.padding,
        currentSequence: 0,
        sampleOutput: formatNumber({
          pattern: defaultPattern.pattern,
          padding: defaultPattern.padding,
        } as NumberingPattern, 1),
        resetYearly: false,
        isCustom: false,
      })
    }
  }

  return { patterns }
}

/**
 * Set a numbering pattern for an entity type
 */
export async function setNumberingPattern(
  companyId: string,
  input: NumberingPatternInput
): Promise<void> {
  const supabase = await createClient()

  const defaultPattern = DEFAULT_PATTERNS[input.entityType]
  const sampleOutput = formatNumber({
    pattern: input.pattern,
    padding: input.padding || defaultPattern.padding,
  } as NumberingPattern, 1)


  const { error } = await supabase
    .from('numbering_patterns')
    .upsert({
      company_id: companyId,
      entity_type: input.entityType,
      pattern: input.pattern,
      scope: input.scope || defaultPattern.scope,
      padding: input.padding || defaultPattern.padding,
      prefix: input.prefix,
      suffix: input.suffix,
      reset_yearly: input.resetYearly ?? false,
      sample_output: sampleOutput,
    }, {
      onConflict: 'company_id,entity_type',
    })

  if (error) {
    throw new Error(`Failed to set numbering pattern: ${error.message}`)
  }

  clearNumberingCache(companyId)
}

/**
 * Reset sequence counter for an entity type
 */
export async function resetSequence(
  companyId: string,
  entityType: NumberingEntityType,
  newValue: number = 0
): Promise<void> {
  const supabase = await createClient()


  const { error } = await supabase
    .from('numbering_patterns')
    .update({ current_sequence: newValue })
    .eq('company_id', companyId)
    .eq('entity_type', entityType)

  if (error) {
    throw new Error(`Failed to reset sequence: ${error.message}`)
  }

  clearNumberingCache(companyId)
}

/**
 * Validate a numbering pattern
 */
export function validatePattern(pattern: string): { valid: boolean; error?: string } {
  // Must contain at least one sequence token
  if (!pattern.includes('{#') && !pattern.includes('{###}') && !pattern.includes('{##}') && !pattern.includes('{####}')) {
    return { valid: false, error: 'Pattern must contain a sequence token ({#}, {##}, {###}, or {####})' }
  }

  // Check for valid tokens
  const validTokens = ['{YYYY}', '{YY}', '{MM}', '{#}', '{##}', '{###}', '{####}', '{JOB}', '{PREFIX}', '{SUFFIX}']
  const tokenPattern = /\{[^}]+\}/g
  const tokens = pattern.match(tokenPattern) || []

  for (const token of tokens) {
    if (!validTokens.includes(token)) {
      return { valid: false, error: `Invalid token: ${token}` }
    }
  }

  // Pattern should not be empty
  if (pattern.trim().length === 0) {
    return { valid: false, error: 'Pattern cannot be empty' }
  }

  return { valid: true }
}

// ============================================================================
// HELPERS
// ============================================================================

async function getPattern(companyId: string, entityType: NumberingEntityType): Promise<NumberingPattern> {
  await loadPatternsToCache(companyId)
  const cached = getPatternsFromCache(companyId)
  const customPattern = cached?.patterns.get(entityType)

  if (customPattern) {
    return customPattern
  }

  // Return virtual default pattern
  const defaultPattern = DEFAULT_PATTERNS[entityType]
  return {
    id: '',
    companyId,
    entityType,
    pattern: defaultPattern.pattern,
    scope: defaultPattern.scope,
    currentSequence: 0,
    padding: defaultPattern.padding,
    resetYearly: false,
    createdAt: '',
    updatedAt: '',
  }
}

async function loadPatternsToCache(companyId: string): Promise<void> {
  const supabase = await createClient()

  const { data: patternsData } = await supabase
    .from('numbering_patterns')
    .select('*')
    .eq('company_id', companyId)

  const patterns = (patternsData || []) as NumberingPatternDB[]
  const patternMap = new Map<NumberingEntityType, NumberingPattern>()

  for (const p of patterns) {
    patternMap.set(p.entity_type as NumberingEntityType, {
      id: p.id,
      companyId: p.company_id,
      entityType: p.entity_type as NumberingEntityType,
      pattern: p.pattern ?? '{###}',
      scope: (p.scope as NumberingScope) ?? 'global',
      currentSequence: p.current_sequence ?? 0,
      prefix: p.prefix || undefined,
      suffix: p.suffix || undefined,
      padding: p.padding ?? 3,
      resetYearly: p.reset_yearly ?? false,
      lastResetYear: p.last_reset_year || undefined,
      sampleOutput: p.sample_output || undefined,
      createdAt: p.created_at ?? new Date().toISOString(),
      updatedAt: p.updated_at ?? new Date().toISOString(),
    })
  }

  patternCache.set(companyId, {
    patterns: patternMap,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

function formatNumber(
  pattern: Pick<NumberingPattern, 'pattern' | 'padding' | 'prefix' | 'suffix'>,
  sequence: number,
  jobNumber?: string
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  let result = pattern.pattern

  // Replace tokens
  result = result.replace('{YYYY}', String(year))
  result = result.replace('{YY}', String(year).slice(-2))
  result = result.replace('{MM}', month)
  result = result.replace('{JOB}', jobNumber || 'JOB')
  result = result.replace('{PREFIX}', pattern.prefix || '')
  result = result.replace('{SUFFIX}', pattern.suffix || '')

  // Replace sequence tokens
  result = result.replace('{####}', String(sequence).padStart(4, '0'))
  result = result.replace('{###}', String(sequence).padStart(3, '0'))
  result = result.replace('{##}', String(sequence).padStart(2, '0'))
  result = result.replace('{#}', String(sequence))

  return result
}

async function generateNumberManually(
  companyId: string,
  entityType: NumberingEntityType,
  jobId?: string
): Promise<string> {
  const supabase = await createClient()
  const pattern = await getPattern(companyId, entityType)

  let sequence: number

  if (pattern.scope === 'per_job' && jobId) {
    // Get or create job-specific sequence
    const year = new Date().getFullYear()

    const { data: seqDataRaw } = await supabase
      .from('numbering_sequences')
      .select('current_value')
      .eq('pattern_id', pattern.id)
      .eq('job_id', jobId)
      .eq('year', year)
      .single()

    const seqData = seqDataRaw as SequenceRow | null
    if (seqData) {
      sequence = seqData.current_value + 1
    
      await supabase
        .from('numbering_sequences')
        .update({ current_value: sequence })
        .eq('pattern_id', pattern.id)
        .eq('job_id', jobId)
        .eq('year', year)
    } else {
      sequence = 1
    
      await supabase
        .from('numbering_sequences')
        .insert({
          company_id: companyId,
          pattern_id: pattern.id,
          job_id: jobId,
          year,
          current_value: 1,
        })
    }
  } else {
    // Global sequence
    sequence = pattern.currentSequence + 1

    if (pattern.id) {
    
      await supabase
        .from('numbering_patterns')
        .update({ current_sequence: sequence })
        .eq('id', pattern.id)
    } else {
      // Create the pattern if it doesn't exist
      const defaultPattern = DEFAULT_PATTERNS[entityType]
    
      await supabase
        .from('numbering_patterns')
        .insert({
          company_id: companyId,
          entity_type: entityType,
          pattern: defaultPattern.pattern,
          scope: defaultPattern.scope,
          padding: defaultPattern.padding,
          current_sequence: 1,
          reset_yearly: false,
        })
    }
  }

  // Get job number if needed
  let jobNumber: string | undefined
  if (pattern.pattern.includes('{JOB}') && jobId) {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('job_number')
      .eq('id', jobId)
      .single()
    const job = jobData as JobNumberRow | null
    jobNumber = job?.job_number || undefined
  }

  return formatNumber(pattern, sequence, jobNumber)
}

/**
 * Get default patterns (for reference)
 */
export function getDefaultPatterns(): Record<NumberingEntityType, { pattern: string; scope: NumberingScope; padding: number }> {
  return DEFAULT_PATTERNS
}
