/**
 * Invoice Anomaly Detector
 *
 * Provides anomaly detection for the invoice extraction flow.
 * Checks for suspicious patterns in extracted invoice data:
 *
 * 1. **Amount outlier** — Amount > 2x vendor average, or > $50,000
 * 2. **Unusual frequency** — More than 3 invoices from same vendor in 7 days
 * 3. **Weekend/holiday date** — Invoice dated on Saturday/Sunday
 * 4. **Round number** — Suspiciously round amount (e.g., $10,000, $25,000)
 * 5. **Missing vendor** — No vendor name extracted
 *
 * The detector queries the `invoices` table for historical context and
 * returns a risk assessment with individual flags.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnomalyFlag {
  /** Machine-readable anomaly type */
  type: string
  /** Severity level */
  severity: 'warning' | 'error'
  /** Human-readable explanation */
  message: string
}

export interface AnomalyCheckResult {
  /** Whether any anomalies were detected */
  has_anomalies: boolean
  /** Overall risk level based on flags */
  risk_level: 'low' | 'medium' | 'high'
  /** Individual anomaly flags */
  flags: AnomalyFlag[]
}

export interface AnomalyCheckInput {
  /** Vendor name as extracted (used for historical query) */
  vendorName: string | null
  /** Invoice total amount */
  amount: number
  /** Invoice date (ISO string, e.g. "2026-01-15") */
  invoiceDate: string | null
  /** Company ID for tenant isolation */
  companyId: string
  /** Supabase client (service role, bypasses RLS) */
  supabase: SupabaseClient
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Amount above which any invoice is flagged regardless of vendor history */
const ABSOLUTE_AMOUNT_THRESHOLD = 50_000

/** Multiplier against vendor average that triggers an outlier flag */
const AVERAGE_MULTIPLIER_THRESHOLD = 2

/** Maximum invoices from same vendor in a 7-day window before flagging */
const FREQUENCY_THRESHOLD = 3

/** Number of days to look back for frequency checks */
const FREQUENCY_WINDOW_DAYS = 7

/** Number of days to look back for historical average */
const HISTORY_WINDOW_DAYS = 90

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a vendor name for comparison — lowercase, strip
 * punctuation/suffixes, collapse whitespace.
 */
function normalizeVendorName(name: string): string {
  let n = name.toLowerCase().trim()
  n = n.replace(
    /\b(llc|inc|corp|corporation|co|company|ltd|limited|lp|llp|pllc|pc|dba)\b\.?/g,
    ''
  )
  n = n.replace(/[^a-z0-9\s]/g, '')
  n = n.replace(/\s+/g, ' ').trim()
  return n
}

/**
 * Check if an amount is a suspiciously round number.
 * A number is "round" if it is a clean multiple of $1,000 at or above $1,000.
 */
function isRoundAmount(amount: number): boolean {
  return amount >= 1000 && amount % 1000 === 0
}

/**
 * Check if a date falls on a weekend (Saturday or Sunday).
 */
function isWeekendDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  const day = date.getUTCDay()
  return day === 0 || day === 6
}

/**
 * Calculate overall risk level from flags.
 */
function calculateRiskLevel(flags: AnomalyFlag[]): 'low' | 'medium' | 'high' {
  const errorCount = flags.filter((f) => f.severity === 'error').length
  const warningCount = flags.filter((f) => f.severity === 'warning').length

  if (errorCount >= 2) return 'high'
  if (errorCount >= 1) return 'medium'
  if (warningCount >= 3) return 'high'
  if (warningCount >= 2) return 'medium'
  return 'low'
}

// ---------------------------------------------------------------------------
// Main detector
// ---------------------------------------------------------------------------

/**
 * Detect anomalies in an extracted invoice.
 *
 * Designed to be lightweight — only queries historical data when the
 * vendor name is available. The caller is responsible for checking the
 * `aiAnomalyDetectionEnabled` setting before calling this function.
 *
 * Gracefully handles missing data (no vendor name, no historical invoices,
 * no invoice date).
 */
export async function detectAnomalies(
  input: AnomalyCheckInput
): Promise<AnomalyCheckResult> {
  const { vendorName, amount, invoiceDate, companyId, supabase } = input
  const flags: AnomalyFlag[] = []

  // -------------------------------------------------------------------------
  // Check 1: Missing vendor
  // -------------------------------------------------------------------------
  if (!vendorName || vendorName.trim() === '') {
    flags.push({
      type: 'missing_vendor',
      severity: 'warning',
      message: 'No vendor name was extracted from this invoice',
    })
  }

  // -------------------------------------------------------------------------
  // Check 2: Weekend date
  // -------------------------------------------------------------------------
  if (invoiceDate && isWeekendDate(invoiceDate)) {
    const date = new Date(invoiceDate)
    const dayName = date.getUTCDay() === 0 ? 'Sunday' : 'Saturday'
    flags.push({
      type: 'weekend_date',
      severity: 'warning',
      message: `Invoice is dated on a ${dayName} (${invoiceDate})`,
    })
  }

  // -------------------------------------------------------------------------
  // Check 3: Round number
  // -------------------------------------------------------------------------
  if (amount > 0 && isRoundAmount(amount)) {
    flags.push({
      type: 'round_amount',
      severity: 'warning',
      message: `Invoice amount ($${amount.toLocaleString()}) is a suspiciously round number`,
    })
  }

  // -------------------------------------------------------------------------
  // Check 4: Absolute amount threshold
  // -------------------------------------------------------------------------
  if (amount > ABSOLUTE_AMOUNT_THRESHOLD) {
    flags.push({
      type: 'amount_outlier',
      severity: 'error',
      message: `Invoice amount ($${amount.toLocaleString()}) exceeds $${ABSOLUTE_AMOUNT_THRESHOLD.toLocaleString()} threshold`,
    })
  }

  // -------------------------------------------------------------------------
  // Check 5 & 6: Historical checks (require vendor name)
  // -------------------------------------------------------------------------
  if (vendorName && vendorName.trim() !== '') {
    try {
      const historicalFlags = await runHistoricalChecks(
        supabase,
        companyId,
        vendorName,
        amount,
        invoiceDate
      )
      flags.push(...historicalFlags)
    } catch {
      // Silently skip historical checks if the query fails —
      // the non-historical checks above still provide value.
    }
  }

  return {
    has_anomalies: flags.length > 0,
    risk_level: calculateRiskLevel(flags),
    flags,
  }
}

// ---------------------------------------------------------------------------
// Historical checks (vendor-specific)
// ---------------------------------------------------------------------------

async function runHistoricalChecks(
  supabase: SupabaseClient,
  companyId: string,
  vendorName: string,
  amount: number,
  invoiceDate: string | null
): Promise<AnomalyFlag[]> {
  const flags: AnomalyFlag[] = []
  const normalizedVendor = normalizeVendorName(vendorName)

  // Find vendor_id(s) that match this vendor name
  const { data: vendorRows } = await (supabase as any)
    .from('vendors')
    .select('id, name')
    .eq('company_id', companyId)
    .limit(200)

  const matchingVendorIds: string[] = []
  if (vendorRows && Array.isArray(vendorRows)) {
    for (const v of vendorRows as Array<{ id: string; name: string }>) {
      if (normalizeVendorName(v.name) === normalizedVendor) {
        matchingVendorIds.push(v.id)
      }
    }
  }

  // If we can't find the vendor in the DB, skip historical checks
  if (matchingVendorIds.length === 0) {
    return flags
  }

  // Query recent invoices for this vendor (last 90 days)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_WINDOW_DAYS)
  const cutoffIso = cutoffDate.toISOString().split('T')[0]

  let query = (supabase as any)
    .from('invoices')
    .select('id, amount, invoice_date, created_at')
    .eq('company_id', companyId)
    .gte('invoice_date', cutoffIso)

  if (matchingVendorIds.length === 1) {
    query = query.eq('vendor_id', matchingVendorIds[0])
  } else {
    query = query.in('vendor_id', matchingVendorIds)
  }

  const { data: recentInvoices } = await query.limit(200)

  if (
    !recentInvoices ||
    !Array.isArray(recentInvoices) ||
    recentInvoices.length === 0
  ) {
    return flags
  }

  const invoices = recentInvoices as Array<{
    id: string
    amount: number
    invoice_date: string | null
    created_at: string
  }>

  // -------------------------------------------------------------------------
  // Amount outlier check (vs vendor average)
  // -------------------------------------------------------------------------
  const amounts = invoices
    .filter((inv) => typeof inv.amount === 'number' && inv.amount > 0)
    .map((inv) => inv.amount)

  if (amounts.length >= 2 && amount > 0) {
    const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length

    // Only flag if we haven't already flagged for absolute threshold
    if (
      amount > avg * AVERAGE_MULTIPLIER_THRESHOLD &&
      amount <= ABSOLUTE_AMOUNT_THRESHOLD
    ) {
      flags.push({
        type: 'amount_outlier',
        severity: 'warning',
        message: `Invoice amount ($${amount.toLocaleString()}) is ${(amount / avg).toFixed(1)}x the vendor average ($${Math.round(avg).toLocaleString()})`,
      })
    }
  }

  // -------------------------------------------------------------------------
  // Unusual frequency check
  // -------------------------------------------------------------------------
  if (invoiceDate) {
    const invoiceDateObj = new Date(invoiceDate)
    if (!isNaN(invoiceDateObj.getTime())) {
      const windowStart = new Date(invoiceDateObj)
      windowStart.setDate(windowStart.getDate() - FREQUENCY_WINDOW_DAYS)

      const recentCount = invoices.filter((inv) => {
        if (!inv.invoice_date) return false
        const d = new Date(inv.invoice_date)
        return d >= windowStart && d <= invoiceDateObj
      }).length

      if (recentCount >= FREQUENCY_THRESHOLD) {
        flags.push({
          type: 'unusual_frequency',
          severity: 'warning',
          message: `${recentCount} invoices from this vendor in the past ${FREQUENCY_WINDOW_DAYS} days (threshold: ${FREQUENCY_THRESHOLD})`,
        })
      }
    }
  }

  return flags
}
