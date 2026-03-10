/**
 * Cost Code Auto-Suggestion Utility
 *
 * Fuzzy-matches extracted line item descriptions against a list of known cost codes
 * using the same Levenshtein/Jaccard approach as vendor-matcher.ts.
 *
 * - For each line item, suggests the best matching cost code with confidence
 * - Also suggests an overall invoice-level cost code based on the most common/highest-value match
 * - Returns suggestions with confidence scores
 */

import {
  stringSimilarity,
  jaccardSimilarity,
} from '@/lib/invoice/vendor-matcher'

export interface KnownCostCode {
  id: string
  code: string
  name: string
}

export interface CostCodeSuggestion {
  cost_code_id: string
  cost_code: string
  cost_code_name: string
  confidence: number
}

export interface LineItemCostCodeMatch {
  /** Index of the line item in the extracted line_items array */
  line_item_index: number
  /** The description that was matched against */
  description: string
  /** Best match, if any candidate scored above the minimum threshold */
  best_match: CostCodeSuggestion | null
  /** Whether confidence exceeds the auto-assign threshold */
  auto_assigned: boolean
  /** Top 3 suggestions sorted by confidence (descending) */
  suggestions: CostCodeSuggestion[]
}

export interface CostCodeMatchResult {
  /** Per-line-item cost code suggestions */
  line_item_matches: LineItemCostCodeMatch[]
  /** Invoice-level cost code suggestion (most common/highest-value across line items) */
  invoice_level: {
    best_match: CostCodeSuggestion | null
    auto_assigned: boolean
    suggestions: CostCodeSuggestion[]
  }
}

/** Threshold above which a cost code match is automatically assigned */
const AUTO_ASSIGN_THRESHOLD = 0.75

/** Minimum score to include in suggestions */
const MIN_SUGGESTION_THRESHOLD = 0.25

/**
 * Normalize a cost code name or line item description for comparison:
 * - lowercase
 * - strip common construction abbreviations and noise words
 * - strip punctuation except alphanumeric and spaces
 * - collapse whitespace
 */
function normalizeCostText(text: string): string {
  let n = text.toLowerCase().trim()
  // Strip common noise words that don't help matching
  n = n.replace(/\b(and|the|of|for|per|a|an|in|on|to|with|&)\b/g, ' ')
  // Strip punctuation except alphanumeric and spaces
  n = n.replace(/[^a-z0-9\s]/g, ' ')
  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim()
  return n
}

/**
 * Extract the meaningful part of a cost code string.
 * Cost codes are typically formatted as "01-100" or "01-100 Framing".
 * We want just the name portion for text matching.
 */
function extractCostCodeLabel(code: string, name: string): string {
  // Combine code and name for matching — the code itself may contain
  // meaningful info like "01-100 Framing"
  return `${code} ${name}`
}

/**
 * Compute a composite match score between a line item description and a cost code.
 * Uses multiple strategies and returns the best score:
 *
 * 1. Exact normalized match -> 1.0
 * 2. Containment — one string contains the other
 * 3. Levenshtein similarity on normalized strings
 * 4. Jaccard token overlap (especially useful for multi-word descriptions)
 * 5. Token-to-token fuzzy matching (handles partial word matches)
 */
function computeCostCodeScore(descriptionNorm: string, costCodeNorm: string): number {
  // Strategy 1: Exact match after normalization
  if (descriptionNorm === costCodeNorm) return 1.0

  // If either is empty after normalization, no match
  if (descriptionNorm.length === 0 || costCodeNorm.length === 0) return 0

  // Strategy 2: Containment — one string fully contains the other
  let containmentScore = 0
  if (costCodeNorm.includes(descriptionNorm) || descriptionNorm.includes(costCodeNorm)) {
    const shorter = Math.min(descriptionNorm.length, costCodeNorm.length)
    const longer = Math.max(descriptionNorm.length, costCodeNorm.length)
    containmentScore = shorter / longer
    // Boost containment matches
    containmentScore = Math.min(1, containmentScore + 0.15)
  }

  // Strategy 3: Levenshtein similarity
  const levScore = stringSimilarity(descriptionNorm, costCodeNorm)

  // Strategy 4: Jaccard token overlap
  let tokenScore = jaccardSimilarity(descriptionNorm, costCodeNorm)
  // Boost multi-token overlap — even partial overlap is significant for cost codes
  const descTokens = descriptionNorm.split(/\s+/).filter(Boolean)
  const codeTokens = costCodeNorm.split(/\s+/).filter(Boolean)
  if (descTokens.length > 1 || codeTokens.length > 1) {
    let matchCount = 0
    for (const dt of descTokens) {
      for (const ct of codeTokens) {
        if (dt === ct || (dt.length >= 3 && ct.length >= 3 && (dt.includes(ct) || ct.includes(dt)))) {
          matchCount++
          break
        }
      }
    }
    const fuzzyTokenScore = matchCount / Math.max(descTokens.length, codeTokens.length)
    tokenScore = Math.max(tokenScore, fuzzyTokenScore)
  }

  // Strategy 5: Individual token fuzzy matching
  // For each cost code token, find the best-matching description token via Levenshtein
  let tokenFuzzyScore = 0
  if (codeTokens.length > 0 && descTokens.length > 0) {
    let totalBestScore = 0
    for (const ct of codeTokens) {
      if (ct.length < 3) continue // Skip very short tokens (noise)
      let bestTokenScore = 0
      for (const dt of descTokens) {
        if (dt.length < 3) continue
        const sim = stringSimilarity(dt, ct)
        bestTokenScore = Math.max(bestTokenScore, sim)
      }
      totalBestScore += bestTokenScore
    }
    const meaningfulTokens = codeTokens.filter((t) => t.length >= 3).length
    if (meaningfulTokens > 0) {
      tokenFuzzyScore = totalBestScore / meaningfulTokens
      // Scale down slightly — token-level matching is less reliable than whole-string
      tokenFuzzyScore *= 0.85
    }
  }

  return Math.max(containmentScore, levScore, tokenScore, tokenFuzzyScore)
}

/**
 * Match a single line item description against all known cost codes.
 */
function matchLineItem(
  description: string,
  knownCostCodes: KnownCostCode[]
): { bestMatch: CostCodeSuggestion | null; autoAssigned: boolean; suggestions: CostCodeSuggestion[] } {
  const noMatch = { bestMatch: null, autoAssigned: false, suggestions: [] as CostCodeSuggestion[] }

  if (!description || description.trim().length === 0 || knownCostCodes.length === 0) {
    return noMatch
  }

  const descNorm = normalizeCostText(description)
  if (descNorm.length === 0) return noMatch

  // Score each cost code
  const scored = knownCostCodes.map((cc) => {
    const label = extractCostCodeLabel(cc.code, cc.name)
    const ccNorm = normalizeCostText(label)
    // Also try matching against just the name (without the code number)
    const nameNorm = normalizeCostText(cc.name)

    const labelScore = computeCostCodeScore(descNorm, ccNorm)
    const nameScore = computeCostCodeScore(descNorm, nameNorm)
    const confidence = Math.max(labelScore, nameScore)

    return {
      cost_code_id: cc.id,
      cost_code: cc.code,
      cost_code_name: cc.name,
      confidence,
    }
  })

  // Sort by confidence descending
  scored.sort((a, b) => b.confidence - a.confidence)

  // Filter to meaningful suggestions
  const suggestions = scored
    .filter((s) => s.confidence > MIN_SUGGESTION_THRESHOLD)
    .slice(0, 3)

  const bestMatch =
    scored.length > 0 && scored[0].confidence > MIN_SUGGESTION_THRESHOLD
      ? scored[0]
      : null

  const autoAssigned = bestMatch !== null && bestMatch.confidence >= AUTO_ASSIGN_THRESHOLD

  return { bestMatch, autoAssigned, suggestions }
}

/**
 * Determine the invoice-level cost code based on line item matches.
 * Strategy: weighted by line item amount, falling back to most-frequent match.
 */
function computeInvoiceLevelMatch(
  lineItemMatches: LineItemCostCodeMatch[],
  lineItems: Array<{ amount?: number | null }>
): CostCodeMatchResult['invoice_level'] {
  const noMatch = { best_match: null, auto_assigned: false, suggestions: [] as CostCodeSuggestion[] }

  // Collect all auto-assigned or high-confidence matches
  const matchedItems = lineItemMatches.filter((m) => m.best_match !== null)
  if (matchedItems.length === 0) return noMatch

  // Accumulate scores per cost code, weighted by line item amount
  const codeScores = new Map<string, { suggestion: CostCodeSuggestion; totalWeight: number; count: number }>()

  for (const match of matchedItems) {
    if (!match.best_match) continue
    const key = match.best_match.cost_code_id
    const lineItem = lineItems[match.line_item_index]
    const amount = typeof lineItem?.amount === 'number' && lineItem.amount > 0 ? lineItem.amount : 1
    const weight = amount * match.best_match.confidence

    const existing = codeScores.get(key)
    if (existing) {
      existing.totalWeight += weight
      existing.count += 1
      // Keep the highest confidence suggestion
      if (match.best_match.confidence > existing.suggestion.confidence) {
        existing.suggestion = match.best_match
      }
    } else {
      codeScores.set(key, {
        suggestion: match.best_match,
        totalWeight: weight,
        count: 1,
      })
    }
  }

  // Sort by total weight (amount * confidence) descending
  const ranked = Array.from(codeScores.values())
    .sort((a, b) => b.totalWeight - a.totalWeight)

  if (ranked.length === 0) return noMatch

  const bestMatch = ranked[0].suggestion
  const isAutoAssigned = bestMatch.confidence >= AUTO_ASSIGN_THRESHOLD

  const suggestions = ranked
    .slice(0, 3)
    .map((r) => r.suggestion)

  return { best_match: bestMatch, auto_assigned: isAutoAssigned, suggestions }
}

/**
 * Also try matching the overall invoice cost_code_reference (extracted by AI)
 * against known cost codes for the invoice-level suggestion.
 */
function matchCostCodeReference(
  costCodeReference: string | null | undefined,
  knownCostCodes: KnownCostCode[]
): { bestMatch: CostCodeSuggestion | null; autoAssigned: boolean; suggestions: CostCodeSuggestion[] } {
  if (!costCodeReference || costCodeReference.trim().length === 0) {
    return { bestMatch: null, autoAssigned: false, suggestions: [] }
  }
  return matchLineItem(costCodeReference, knownCostCodes)
}

/**
 * Match extracted line items and invoice-level cost code reference against known cost codes.
 *
 * @param lineItems - Extracted line items with descriptions and amounts
 * @param costCodeReference - Invoice-level cost code reference extracted by AI
 * @param knownCostCodes - The list of known cost codes for the company (id, code, name)
 * @returns Match results with per-line-item and invoice-level suggestions
 */
export function matchCostCodes(
  lineItems: Array<{ description: string; amount?: number | null }>,
  costCodeReference: string | null | undefined,
  knownCostCodes: KnownCostCode[]
): CostCodeMatchResult {
  const emptyResult: CostCodeMatchResult = {
    line_item_matches: [],
    invoice_level: { best_match: null, auto_assigned: false, suggestions: [] },
  }

  if (knownCostCodes.length === 0) return emptyResult

  // Match each line item
  const lineItemMatches: LineItemCostCodeMatch[] = lineItems.map((item, index) => {
    const result = matchLineItem(item.description, knownCostCodes)
    return {
      line_item_index: index,
      description: item.description,
      best_match: result.bestMatch,
      auto_assigned: result.autoAssigned,
      suggestions: result.suggestions,
    }
  })

  // Compute invoice-level match from line items
  const invoiceLevelFromItems = computeInvoiceLevelMatch(lineItemMatches, lineItems)

  // Also try matching the explicit cost_code_reference
  const refMatch = matchCostCodeReference(costCodeReference, knownCostCodes)

  // Use the better of the two for invoice-level suggestion
  let invoiceLevel = invoiceLevelFromItems
  if (
    refMatch.bestMatch &&
    (!invoiceLevel.best_match || refMatch.bestMatch.confidence > invoiceLevel.best_match.confidence)
  ) {
    invoiceLevel = {
      best_match: refMatch.bestMatch,
      auto_assigned: refMatch.autoAssigned,
      suggestions: refMatch.suggestions,
    }
  }

  return {
    line_item_matches: lineItemMatches,
    invoice_level: invoiceLevel,
  }
}
