/**
 * Duplicate Invoice Detector
 *
 * Provides duplicate detection for the invoice extraction flow.
 * Two detection strategies:
 *
 * 1. **Exact hash match** — SHA-256 of (vendor_name_normalized | invoice_number_normalized | amount_cents).
 *    Works before we have a vendor_id (i.e., during extraction, before confirm).
 *
 * 2. **Fuzzy match** — Same vendor + similar amount (within 1%) + invoice_date within 30 days.
 *    Catches duplicates even when invoice numbers differ slightly or are missing.
 *
 * The detector queries the `invoices` table directly (no dependency on `invoice_hashes`).
 */

import crypto from 'crypto'

import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DuplicateCheckInput {
  /** Vendor name as extracted from the invoice (used for hash + fuzzy vendor matching) */
  vendor_name?: string | null
  /** Resolved vendor_id if already known */
  vendor_id?: string | null
  /** Invoice number as extracted */
  invoice_number?: string | null
  /** Total amount */
  amount?: number | null
  /** Invoice date (ISO string, e.g. "2026-01-15") */
  invoice_date?: string | null
}

export interface DuplicateMatch {
  /** ID of the existing invoice that is a potential duplicate */
  invoice_id: string
  /** Invoice number of the existing invoice */
  invoice_number: string | null
  /** Amount of the existing invoice */
  amount: number
  /** Invoice date of the existing invoice */
  invoice_date: string | null
  /** Vendor ID of the existing invoice */
  vendor_id: string | null
  /** How confident we are this is a duplicate (0-1) */
  confidence: number
  /** Human-readable reason */
  reason: string
  /** Match type: 'exact_hash' or 'fuzzy' */
  match_type: 'exact_hash' | 'fuzzy'
}

export interface DuplicateCheckResult {
  /** Whether any potential duplicate was found */
  has_duplicate: boolean
  /** Details of the best match, if any */
  match: DuplicateMatch | null
  /** All matches found (may include lower-confidence fuzzy matches) */
  all_matches: DuplicateMatch[]
  /** The hash generated for this invoice (can be stored for future checks) */
  hash: string | null
}

// ---------------------------------------------------------------------------
// Hash generation
// ---------------------------------------------------------------------------

/**
 * Normalize a vendor name for hashing — lowercase, strip punctuation/suffixes,
 * collapse whitespace.
 */
function normalizeVendorName(name: string): string {
  let n = name.toLowerCase().trim()
  n = n.replace(/\b(llc|inc|corp|corporation|co|company|ltd|limited|lp|llp|pllc|pc|dba)\b\.?/g, '')
  n = n.replace(/[^a-z0-9]/g, '')
  return n
}

/**
 * Normalize an invoice number for hashing — lowercase, strip non-alphanumeric.
 */
function normalizeInvoiceNumber(num: string): string {
  return num.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Generate a SHA-256 hash for duplicate detection from extracted fields.
 * Uses vendor_name (not vendor_id) so it works before vendor resolution.
 *
 * Hash = SHA256(vendor_name_normalized | invoice_number_normalized | amount_cents)
 */
export function generateDuplicateHash(
  vendorName: string,
  invoiceNumber: string,
  amount: number
): string {
  const normVendor = normalizeVendorName(vendorName)
  const normNumber = normalizeInvoiceNumber(invoiceNumber)
  const amountCents = Math.round(amount * 100)
  const input = `${normVendor}|${normNumber}|${amountCents}`
  return crypto.createHash('sha256').update(input).digest('hex')
}

// ---------------------------------------------------------------------------
// Fuzzy matching helpers
// ---------------------------------------------------------------------------

/** Check if two dates are within N days of each other */
function datesWithinDays(dateA: string, dateB: string, days: number): boolean {
  const a = new Date(dateA)
  const b = new Date(dateB)
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return false
  const diffMs = Math.abs(a.getTime() - b.getTime())
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

/** Check if two amounts are within a percentage threshold of each other */
function amountsWithinPercent(a: number, b: number, pct: number): boolean {
  if (a === 0 && b === 0) return true
  const max = Math.max(Math.abs(a), Math.abs(b))
  if (max === 0) return true
  return Math.abs(a - b) / max <= pct
}

// ---------------------------------------------------------------------------
// Main detector
// ---------------------------------------------------------------------------

/**
 * Check for duplicate invoices in the database.
 *
 * @param supabase - Service client (bypasses RLS)
 * @param companyId - The company to search within
 * @param input - Extracted invoice fields to check
 * @param excludeInvoiceId - Optional invoice ID to exclude (for re-checks)
 */
export async function checkForDuplicates(
  supabase: SupabaseClient,
  companyId: string,
  input: DuplicateCheckInput,
  excludeInvoiceId?: string
): Promise<DuplicateCheckResult> {
  const noResult: DuplicateCheckResult = {
    has_duplicate: false,
    match: null,
    all_matches: [],
    hash: null,
  }

  // Need at minimum a vendor identifier and either invoice_number or amount
  const hasVendor = !!(input.vendor_name || input.vendor_id)
  const hasIdentifier = !!(input.invoice_number || input.amount)
  if (!hasVendor || !hasIdentifier) {
    return noResult
  }

  // Generate hash if we have all three fields
  let hash: string | null = null
  if (input.vendor_name && input.invoice_number && input.amount != null) {
    hash = generateDuplicateHash(input.vendor_name, input.invoice_number, input.amount)
  }

  const allMatches: DuplicateMatch[] = []

  // ---------------------------------------------------------------------------
  // Strategy 1: Exact hash match against existing invoices
  // ---------------------------------------------------------------------------
  // We compute what the hash *would be* for each existing invoice and compare.
  // Since we can't query by computed hash, we query by vendor + invoice_number
  // and then verify the hash matches.
  if (input.invoice_number) {
    const normNumber = normalizeInvoiceNumber(input.invoice_number)

    // Query invoices with same invoice_number (case-insensitive via ilike)
    let exactQuery = supabase
      .from('invoices' as any)
      .select('id, vendor_id, invoice_number, amount, invoice_date')
      .eq('company_id', companyId)

    if (excludeInvoiceId) {
      exactQuery = exactQuery.neq('id', excludeInvoiceId)
    }

    // Filter by vendor if we have vendor_id
    if (input.vendor_id) {
      exactQuery = exactQuery.eq('vendor_id', input.vendor_id)
    }

    const { data: exactCandidates } = await exactQuery.limit(50)

    if (exactCandidates) {
      for (const candidate of exactCandidates as Array<{
        id: string
        vendor_id: string | null
        invoice_number: string | null
        amount: number
        invoice_date: string | null
      }>) {
        if (!candidate.invoice_number) continue

        const candidateNorm = normalizeInvoiceNumber(candidate.invoice_number)
        if (candidateNorm !== normNumber) continue

        // Same normalized invoice number found
        const amountMatch = input.amount != null
          ? amountsWithinPercent(input.amount, candidate.amount, 0.001)
          : true

        if (amountMatch) {
          allMatches.push({
            invoice_id: candidate.id,
            invoice_number: candidate.invoice_number,
            amount: candidate.amount,
            invoice_date: candidate.invoice_date,
            vendor_id: candidate.vendor_id,
            confidence: 0.99,
            reason: 'Exact match on invoice number and amount',
            match_type: 'exact_hash',
          })
        } else if (input.amount != null && amountsWithinPercent(input.amount, candidate.amount, 0.01)) {
          allMatches.push({
            invoice_id: candidate.id,
            invoice_number: candidate.invoice_number,
            amount: candidate.amount,
            invoice_date: candidate.invoice_date,
            vendor_id: candidate.vendor_id,
            confidence: 0.90,
            reason: `Same invoice number, amount differs by ${((Math.abs(input.amount - candidate.amount) / Math.max(Math.abs(input.amount), Math.abs(candidate.amount))) * 100).toFixed(2)}%`,
            match_type: 'exact_hash',
          })
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Strategy 2: Fuzzy match — same vendor + similar amount + date within 30 days
  // ---------------------------------------------------------------------------
  if (input.amount != null && input.invoice_date) {
    // Calculate date range for query (±35 days to be safe, then filter precisely)
    const invoiceDate = new Date(input.invoice_date)
    if (!isNaN(invoiceDate.getTime())) {
      const dateStart = new Date(invoiceDate.getTime() - 35 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      const dateEnd = new Date(invoiceDate.getTime() + 35 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      let fuzzyQuery = supabase
        .from('invoices' as any)
        .select('id, vendor_id, invoice_number, amount, invoice_date')
        .eq('company_id', companyId)
        .gte('invoice_date', dateStart)
        .lte('invoice_date', dateEnd)

      if (excludeInvoiceId) {
        fuzzyQuery = fuzzyQuery.neq('id', excludeInvoiceId)
      }

      if (input.vendor_id) {
        fuzzyQuery = fuzzyQuery.eq('vendor_id', input.vendor_id)
      }

      const { data: fuzzyCandidates } = await fuzzyQuery.limit(100)

      if (fuzzyCandidates) {
        for (const candidate of fuzzyCandidates as Array<{
          id: string
          vendor_id: string | null
          invoice_number: string | null
          amount: number
          invoice_date: string | null
        }>) {
          // Skip if already found as exact match
          if (allMatches.some((m) => m.invoice_id === candidate.id)) continue

          // Check amount within 1%
          if (!amountsWithinPercent(input.amount!, candidate.amount, 0.01)) continue

          // Check date within 30 days
          if (!candidate.invoice_date || !datesWithinDays(input.invoice_date, candidate.invoice_date, 30)) continue

          // If we don't have vendor_id, we need to fuzzy match vendor name
          // For now, if vendor_id was used as filter, we know vendor matches
          // If no vendor_id filter, skip fuzzy (can't verify vendor match without vendor names in invoices table)
          if (!input.vendor_id) continue

          const amountDiffPct = Math.abs(input.amount! - candidate.amount) / Math.max(Math.abs(input.amount!), Math.abs(candidate.amount)) * 100

          allMatches.push({
            invoice_id: candidate.id,
            invoice_number: candidate.invoice_number,
            amount: candidate.amount,
            invoice_date: candidate.invoice_date,
            vendor_id: candidate.vendor_id,
            confidence: 0.75,
            reason: `Same vendor, amount within ${amountDiffPct.toFixed(2)}%, date within 30 days`,
            match_type: 'fuzzy',
          })
        }
      }
    }
  }

  // Sort by confidence descending
  allMatches.sort((a, b) => b.confidence - a.confidence)

  return {
    has_duplicate: allMatches.length > 0,
    match: allMatches.length > 0 ? allMatches[0] : null,
    all_matches: allMatches,
    hash,
  }
}

// ---------------------------------------------------------------------------
// Convenience: build duplicate warning metadata for _meta
// ---------------------------------------------------------------------------

export interface DuplicateWarningMeta {
  has_duplicate: boolean
  match_type: 'exact_hash' | 'fuzzy' | null
  confidence: number | null
  duplicate_invoice_id: string | null
  duplicate_invoice_number: string | null
  duplicate_amount: number | null
  reason: string | null
}

export function buildDuplicateWarningMeta(result: DuplicateCheckResult): DuplicateWarningMeta {
  if (!result.has_duplicate || !result.match) {
    return {
      has_duplicate: false,
      match_type: null,
      confidence: null,
      duplicate_invoice_id: null,
      duplicate_invoice_number: null,
      duplicate_amount: null,
      reason: null,
    }
  }

  return {
    has_duplicate: true,
    match_type: result.match.match_type,
    confidence: result.match.confidence,
    duplicate_invoice_id: result.match.invoice_id,
    duplicate_invoice_number: result.match.invoice_number,
    duplicate_amount: result.match.amount,
    reason: result.match.reason,
  }
}
