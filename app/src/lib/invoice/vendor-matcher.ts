/**
 * Vendor Auto-Matching Utility
 *
 * Fuzzy-matches an extracted vendor name against a list of known vendors
 * using Levenshtein distance-based string similarity. No external dependencies.
 *
 * - Confidence > 0.85 → auto-assign vendor_match_id
 * - Otherwise → return top 3 suggestions for manual selection
 */

export interface KnownVendor {
  id: string
  name: string
}

export interface VendorMatchResult {
  /** Best match, if any candidate scored above 0 */
  bestMatch: {
    vendor: KnownVendor
    confidence: number
  } | null
  /** Whether the best match confidence exceeds the auto-assign threshold */
  autoAssigned: boolean
  /** Top 3 suggestions sorted by confidence (descending) */
  suggestions: Array<{
    vendor: KnownVendor
    confidence: number
  }>
}

/** Threshold above which a match is automatically assigned */
const AUTO_ASSIGN_THRESHOLD = 0.85

/**
 * Compute the Levenshtein edit distance between two strings.
 * Uses the classic dynamic-programming approach with O(min(m,n)) space.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Ensure `a` is the shorter string for O(min(m,n)) space
  if (a.length > b.length) {
    const tmp = a
    a = b
    b = tmp
  }

  const aLen = a.length
  const bLen = b.length

  // Previous and current row of distances
  let prev = new Array<number>(aLen + 1)
  let curr = new Array<number>(aLen + 1)

  for (let i = 0; i <= aLen; i++) {
    prev[i] = i
  }

  for (let j = 1; j <= bLen; j++) {
    curr[0] = j
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[i] = Math.min(
        curr[i - 1] + 1,      // insertion
        prev[i] + 1,           // deletion
        prev[i - 1] + cost     // substitution
      )
    }
    // Swap rows
    const tmp = prev
    prev = curr
    curr = tmp
  }

  return prev[aLen]
}

/**
 * Compute a similarity score (0-1) between two strings based on
 * Levenshtein distance, normalized by the length of the longer string.
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshteinDistance(a, b) / maxLen
}

/**
 * Normalize a vendor name for comparison:
 * - lowercase
 * - collapse whitespace
 * - strip common business suffixes (LLC, Inc, Co, etc.)
 * - strip punctuation
 */
function normalizeVendorName(name: string): string {
  let n = name.toLowerCase().trim()
  // Strip common business entity suffixes
  n = n.replace(/\b(llc|inc|corp|corporation|co|company|ltd|limited|lp|llp|pllc|pc|dba)\b\.?/g, '')
  // Strip punctuation except alphanumeric and spaces
  n = n.replace(/[^a-z0-9\s]/g, '')
  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim()
  return n
}

/**
 * Compute the Jaccard similarity (token overlap) between two strings.
 * Splits on whitespace and computes |intersection| / |union|.
 */
export function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.split(/\s+/).filter(Boolean))
  const tokensB = new Set(b.split(/\s+/).filter(Boolean))
  if (tokensA.size === 0 && tokensB.size === 0) return 1
  if (tokensA.size === 0 || tokensB.size === 0) return 0
  let intersection = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++
  }
  const union = new Set([...tokensA, ...tokensB]).size
  return union > 0 ? intersection / union : 0
}

/**
 * Compute a composite match score using multiple strategies:
 * 1. Exact normalized match → 1.0
 * 2. One name contains the other → high score based on length ratio
 * 3. Levenshtein similarity on normalized names
 * 4. Token-level overlap (Jaccard similarity on words)
 *
 * The final score is the maximum of all strategies.
 */
function computeMatchScore(extractedNorm: string, vendorNorm: string): number {
  // Strategy 1: Exact match after normalization
  if (extractedNorm === vendorNorm) return 1.0

  // Strategy 2: Containment — one string fully contains the other
  let containmentScore = 0
  if (extractedNorm.length > 0 && vendorNorm.length > 0) {
    if (vendorNorm.includes(extractedNorm) || extractedNorm.includes(vendorNorm)) {
      const shorter = Math.min(extractedNorm.length, vendorNorm.length)
      const longer = Math.max(extractedNorm.length, vendorNorm.length)
      containmentScore = shorter / longer
      // Boost containment matches — if the shorter string is contained, it's likely a match
      containmentScore = Math.min(1, containmentScore + 0.15)
    }
  }

  // Strategy 3: Levenshtein similarity
  const levScore = stringSimilarity(extractedNorm, vendorNorm)

  // Strategy 4: Token overlap (Jaccard similarity)
  const extractedTokens = new Set(extractedNorm.split(' ').filter(Boolean))
  const vendorTokens = new Set(vendorNorm.split(' ').filter(Boolean))
  let tokenScore = 0
  if (extractedTokens.size > 0 && vendorTokens.size > 0) {
    let intersection = 0
    for (const token of extractedTokens) {
      if (vendorTokens.has(token)) intersection++
    }
    const union = new Set([...extractedTokens, ...vendorTokens]).size
    tokenScore = union > 0 ? intersection / union : 0
    // Weight token overlap — even partial token overlap is significant for multi-word vendor names
    if (intersection > 0 && extractedTokens.size > 1) {
      tokenScore = Math.min(1, tokenScore + 0.1)
    }
  }

  return Math.max(containmentScore, levScore, tokenScore)
}

/**
 * Match an extracted vendor name against a list of known vendors.
 *
 * @param extractedName - The vendor name as extracted by AI from the invoice
 * @param knownVendors - The list of known vendors for the company (id + name)
 * @returns Match result with best match, auto-assign flag, and top 3 suggestions
 */
export function matchVendor(
  extractedName: string | null | undefined,
  knownVendors: KnownVendor[]
): VendorMatchResult {
  const noMatch: VendorMatchResult = {
    bestMatch: null,
    autoAssigned: false,
    suggestions: [],
  }

  if (!extractedName || extractedName.trim().length === 0 || knownVendors.length === 0) {
    return noMatch
  }

  const extractedNorm = normalizeVendorName(extractedName)
  if (extractedNorm.length === 0) return noMatch

  // Score each vendor
  const scored = knownVendors.map((vendor) => {
    const vendorNorm = normalizeVendorName(vendor.name)
    const confidence = computeMatchScore(extractedNorm, vendorNorm)
    return { vendor, confidence }
  })

  // Sort by confidence descending
  scored.sort((a, b) => b.confidence - a.confidence)

  // Top 3 suggestions (only include those with meaningful scores)
  const suggestions = scored
    .filter((s) => s.confidence > 0.3)
    .slice(0, 3)

  const bestMatch = scored.length > 0 && scored[0].confidence > 0.3
    ? { vendor: scored[0].vendor, confidence: scored[0].confidence }
    : null

  const autoAssigned = bestMatch !== null && bestMatch.confidence >= AUTO_ASSIGN_THRESHOLD

  return {
    bestMatch,
    autoAssigned,
    suggestions,
  }
}
