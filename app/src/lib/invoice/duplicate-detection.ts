import crypto from 'crypto'

/**
 * Generate a deterministic hash for duplicate detection.
 * Hash = SHA256(vendor_id|invoice_number_normalized|amount_cents)
 */
export function generateInvoiceHash(vendorId: string, invoiceNumber: string, amount: number): string {
  const normalizedNumber = invoiceNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const amountCents = Math.round(amount * 100)
  const input = `${vendorId}|${normalizedNumber}|${amountCents}`
  return crypto.createHash('sha256').update(input).digest('hex')
}

/**
 * Check for near-duplicates: same vendor + similar amount (within 1%) + similar invoice number
 */
export function isNearDuplicate(
  existing: { vendor_id: string; invoice_number: string; amount: number },
  candidate: { vendor_id: string; invoice_number: string; amount: number }
): { isDuplicate: boolean; confidence: number; reason: string } {
  if (existing.vendor_id !== candidate.vendor_id) {
    return { isDuplicate: false, confidence: 0, reason: '' }
  }

  const amountDiff = Math.abs(existing.amount - candidate.amount)
  const amountPct = existing.amount > 0 ? amountDiff / existing.amount : 0

  const normExisting = existing.invoice_number.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const normCandidate = candidate.invoice_number.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

  // Exact match
  if (normExisting === normCandidate && amountPct < 0.001) {
    return { isDuplicate: true, confidence: 0.99, reason: 'Exact match on vendor, invoice number, and amount' }
  }

  // Same number, slightly different amount
  if (normExisting === normCandidate && amountPct < 0.01) {
    return { isDuplicate: true, confidence: 0.9, reason: `Same invoice number, amount differs by ${(amountPct * 100).toFixed(2)}%` }
  }

  // Similar number (edit distance), same amount
  const editDist = levenshtein(normExisting, normCandidate)
  if (editDist <= 2 && amountPct < 0.001) {
    return { isDuplicate: true, confidence: 0.8, reason: `Similar invoice number (edit distance ${editDist}), same amount` }
  }

  return { isDuplicate: false, confidence: 0, reason: '' }
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}
