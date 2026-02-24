/**
 * Module 22 — Vendor Performance Scoring Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 22 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ScoreDimension,
  CallbackStatus,
  CallbackSeverity,
  VendorScore,
  VendorScoreHistory,
  VendorJobPerformance,
  VendorWarrantyCallback,
  VendorNote,
} from '@/types/vendor-performance'

import {
  SCORE_DIMENSIONS,
  CALLBACK_STATUSES,
  CALLBACK_SEVERITIES,
  SCORE_WEIGHTS,
  SCORE_WEIGHT_PRESETS,
} from '@/types/vendor-performance'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  scoreDimensionEnum,
  callbackStatusEnum,
  callbackSeverityEnum,
  listVendorScoresSchema,
  createVendorScoreSchema,
  updateVendorScoreSchema,
  listScoreHistorySchema,
  listJobRatingsSchema,
  createJobRatingSchema,
  updateJobRatingSchema,
  listCallbacksSchema,
  createCallbackSchema,
  updateCallbackSchema,
  resolveCallbackSchema,
  listVendorNotesSchema,
  createVendorNoteSchema,
  updateVendorNoteSchema,
} from '@/lib/validation/schemas/vendor-performance'

// ============================================================================
// Type System
// ============================================================================

describe('Module 22 — Vendor Performance Types', () => {
  test('ScoreDimension has 5 values', () => {
    const dims: ScoreDimension[] = [
      'quality', 'timeliness', 'communication', 'budget_adherence', 'safety',
    ]
    expect(dims).toHaveLength(5)
  })

  test('CallbackStatus has 5 values', () => {
    const statuses: CallbackStatus[] = [
      'reported', 'acknowledged', 'in_progress', 'resolved', 'disputed',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('CallbackSeverity has 4 values', () => {
    const severities: CallbackSeverity[] = [
      'minor', 'moderate', 'major', 'critical',
    ]
    expect(severities).toHaveLength(4)
  })

  test('VendorScore interface has all required fields', () => {
    const score: VendorScore = {
      id: '1', company_id: '1', vendor_id: '1',
      quality_score: 85, timeliness_score: 90, communication_score: 75,
      budget_adherence_score: 88, safety_score: 95, overall_score: 87,
      data_point_count: 12, calculation_window_months: 12,
      manual_adjustment: 0, manual_adjustment_reason: null,
      calculated_at: '2026-01-15T00:00:00Z', created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(score.quality_score).toBe(85)
    expect(score.overall_score).toBe(87)
    expect(score.manual_adjustment).toBe(0)
  })

  test('VendorScoreHistory interface has all required fields', () => {
    const history: VendorScoreHistory = {
      id: '1', company_id: '1', vendor_score_id: '1', vendor_id: '1',
      quality_score: 85, timeliness_score: 90, communication_score: 75,
      budget_adherence_score: 88, safety_score: 95, overall_score: 87,
      snapshot_date: '2026-01-15', notes: null, created_at: '2026-01-15',
    }
    expect(history.snapshot_date).toBe('2026-01-15')
    expect(history.overall_score).toBe(87)
  })

  test('VendorJobPerformance interface has all required fields', () => {
    const perf: VendorJobPerformance = {
      id: '1', company_id: '1', vendor_id: '1', job_id: '1',
      trade: 'Electrical', quality_rating: 90, timeliness_rating: 85,
      communication_rating: 80, budget_adherence_rating: 88, safety_rating: 95,
      overall_rating: 88, tasks_on_time: 8, tasks_total: 10,
      punch_items_count: 3, punch_resolution_avg_days: 2.5,
      inspection_pass_rate: 85, bid_amount: 50000, final_amount: 52000,
      change_order_count: 1, rating_notes: 'Good work overall',
      rated_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(perf.trade).toBe('Electrical')
    expect(perf.tasks_on_time).toBe(8)
    expect(perf.bid_amount).toBe(50000)
  })

  test('VendorWarrantyCallback interface has all required fields', () => {
    const callback: VendorWarrantyCallback = {
      id: '1', company_id: '1', vendor_id: '1', job_id: '1',
      title: 'Leaking faucet', description: 'Kitchen faucet leaking',
      severity: 'moderate', status: 'reported',
      reported_date: '2026-01-15', resolved_date: null,
      resolution_notes: null, resolution_cost: null, resolution_days: null,
      reported_by: '1', resolved_by: null,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(callback.title).toBe('Leaking faucet')
    expect(callback.severity).toBe('moderate')
    expect(callback.status).toBe('reported')
  })

  test('VendorNote interface has all required fields', () => {
    const note: VendorNote = {
      id: '1', company_id: '1', vendor_id: '1', author_id: '1',
      title: 'Quality concern', body: 'Need to monitor closely',
      tags: ['quality', 'watch'], is_internal: true,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(note.body).toBe('Need to monitor closely')
    expect(note.tags).toHaveLength(2)
    expect(note.is_internal).toBe(true)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 22 — Constants', () => {
  test('SCORE_DIMENSIONS has 5 entries with value and label', () => {
    expect(SCORE_DIMENSIONS).toHaveLength(5)
    for (const dim of SCORE_DIMENSIONS) {
      expect(dim).toHaveProperty('value')
      expect(dim).toHaveProperty('label')
      expect(dim.label.length).toBeGreaterThan(0)
    }
  })

  test('SCORE_DIMENSIONS includes all 5 dimensions', () => {
    const values = SCORE_DIMENSIONS.map((d) => d.value)
    expect(values).toContain('quality')
    expect(values).toContain('timeliness')
    expect(values).toContain('communication')
    expect(values).toContain('budget_adherence')
    expect(values).toContain('safety')
  })

  test('CALLBACK_STATUSES has 5 entries with value and label', () => {
    expect(CALLBACK_STATUSES).toHaveLength(5)
    for (const s of CALLBACK_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('CALLBACK_SEVERITIES has 4 entries with value and label', () => {
    expect(CALLBACK_SEVERITIES).toHaveLength(4)
    for (const s of CALLBACK_SEVERITIES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('SCORE_WEIGHTS sums to 100', () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((sum, w) => sum + w, 0)
    expect(total).toBe(100)
  })

  test('SCORE_WEIGHTS has correct default values', () => {
    expect(SCORE_WEIGHTS.quality).toBe(30)
    expect(SCORE_WEIGHTS.timeliness).toBe(25)
    expect(SCORE_WEIGHTS.communication).toBe(15)
    expect(SCORE_WEIGHTS.budget_adherence).toBe(20)
    expect(SCORE_WEIGHTS.safety).toBe(10)
  })

  test('SCORE_WEIGHT_PRESETS has 4 presets', () => {
    expect(SCORE_WEIGHT_PRESETS).toHaveLength(4)
  })

  test('All SCORE_WEIGHT_PRESETS sum to 100', () => {
    for (const preset of SCORE_WEIGHT_PRESETS) {
      const total = Object.values(preset.weights).reduce((sum, w) => sum + w, 0)
      expect(total).toBe(100)
    }
  })

  test('SCORE_WEIGHT_PRESETS includes expected names', () => {
    const names = SCORE_WEIGHT_PRESETS.map((p) => p.name)
    expect(names).toContain('Balanced')
    expect(names).toContain('Quality-Focused')
    expect(names).toContain('Budget-Focused')
    expect(names).toContain('Safety-First')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 22 — Enum Schemas', () => {
  test('scoreDimensionEnum accepts all 5 dimensions', () => {
    for (const d of ['quality', 'timeliness', 'communication', 'budget_adherence', 'safety']) {
      expect(scoreDimensionEnum.parse(d)).toBe(d)
    }
  })

  test('scoreDimensionEnum rejects invalid dimension', () => {
    expect(() => scoreDimensionEnum.parse('unknown')).toThrow()
  })

  test('callbackStatusEnum accepts all 5 statuses', () => {
    for (const s of ['reported', 'acknowledged', 'in_progress', 'resolved', 'disputed']) {
      expect(callbackStatusEnum.parse(s)).toBe(s)
    }
  })

  test('callbackStatusEnum rejects invalid status', () => {
    expect(() => callbackStatusEnum.parse('cancelled')).toThrow()
  })

  test('callbackSeverityEnum accepts all 4 severities', () => {
    for (const s of ['minor', 'moderate', 'major', 'critical']) {
      expect(callbackSeverityEnum.parse(s)).toBe(s)
    }
  })

  test('callbackSeverityEnum rejects invalid severity', () => {
    expect(() => callbackSeverityEnum.parse('trivial')).toThrow()
  })
})

// ============================================================================
// Vendor Score Schemas
// ============================================================================

describe('Module 22 — Vendor Score Schemas', () => {
  test('listVendorScoresSchema accepts valid params', () => {
    const result = listVendorScoresSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listVendorScoresSchema rejects limit > 100', () => {
    expect(() => listVendorScoresSchema.parse({ limit: 200 })).toThrow()
  })

  test('listVendorScoresSchema accepts vendor_id filter', () => {
    const result = listVendorScoresSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('createVendorScoreSchema accepts valid score', () => {
    const result = createVendorScoreSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      quality_score: 85,
      timeliness_score: 90,
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.quality_score).toBe(85)
    expect(result.timeliness_score).toBe(90)
    expect(result.overall_score).toBe(0)
  })

  test('createVendorScoreSchema requires vendor_id', () => {
    expect(() => createVendorScoreSchema.parse({})).toThrow()
  })

  test('createVendorScoreSchema rejects score > 100', () => {
    expect(() => createVendorScoreSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      quality_score: 101,
    })).toThrow()
  })

  test('createVendorScoreSchema rejects score < 0', () => {
    expect(() => createVendorScoreSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      quality_score: -1,
    })).toThrow()
  })

  test('createVendorScoreSchema rejects manual_adjustment > 10', () => {
    expect(() => createVendorScoreSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      manual_adjustment: 11,
    })).toThrow()
  })

  test('createVendorScoreSchema rejects manual_adjustment < -10', () => {
    expect(() => createVendorScoreSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      manual_adjustment: -11,
    })).toThrow()
  })

  test('updateVendorScoreSchema accepts partial updates', () => {
    const result = updateVendorScoreSchema.parse({ quality_score: 92 })
    expect(result.quality_score).toBe(92)
    expect(result.timeliness_score).toBeUndefined()
  })
})

// ============================================================================
// Score History Schemas
// ============================================================================

describe('Module 22 — Score History Schemas', () => {
  test('listScoreHistorySchema accepts valid params', () => {
    const result = listScoreHistorySchema.parse({ page: '1', limit: '10' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  test('listScoreHistorySchema defaults sort_order to desc', () => {
    const result = listScoreHistorySchema.parse({})
    expect(result.sort_order).toBe('desc')
  })
})

// ============================================================================
// Job Rating Schemas
// ============================================================================

describe('Module 22 — Job Rating Schemas', () => {
  test('listJobRatingsSchema accepts valid params with filters', () => {
    const result = listJobRatingsSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      trade: 'Electrical',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440001')
    expect(result.trade).toBe('Electrical')
  })

  test('createJobRatingSchema accepts valid rating', () => {
    const result = createJobRatingSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      quality_rating: 85,
      timeliness_rating: 90,
      trade: 'Plumbing',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.quality_rating).toBe(85)
    expect(result.trade).toBe('Plumbing')
    expect(result.tasks_on_time).toBe(0)
  })

  test('createJobRatingSchema requires vendor_id and job_id', () => {
    expect(() => createJobRatingSchema.parse({})).toThrow()
    expect(() => createJobRatingSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createJobRatingSchema rejects rating > 100', () => {
    expect(() => createJobRatingSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      quality_rating: 101,
    })).toThrow()
  })

  test('updateJobRatingSchema accepts partial updates', () => {
    const result = updateJobRatingSchema.parse({
      quality_rating: 92,
      rating_notes: 'Improved quality',
    })
    expect(result.quality_rating).toBe(92)
    expect(result.rating_notes).toBe('Improved quality')
    expect(result.timeliness_rating).toBeUndefined()
  })
})

// ============================================================================
// Callback Schemas
// ============================================================================

describe('Module 22 — Warranty Callback Schemas', () => {
  test('listCallbacksSchema accepts valid params with filters', () => {
    const result = listCallbacksSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'reported',
      severity: 'major',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('reported')
    expect(result.severity).toBe('major')
  })

  test('listCallbacksSchema rejects invalid status', () => {
    expect(() => listCallbacksSchema.parse({ status: 'invalid' })).toThrow()
  })

  test('createCallbackSchema accepts valid callback', () => {
    const result = createCallbackSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Leaking faucet in master bath',
    })
    expect(result.title).toBe('Leaking faucet in master bath')
    expect(result.severity).toBe('minor')
    expect(result.status).toBe('reported')
  })

  test('createCallbackSchema requires vendor_id, job_id, title', () => {
    expect(() => createCallbackSchema.parse({})).toThrow()
    expect(() => createCallbackSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createCallbackSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
    })).toThrow()
  })

  test('createCallbackSchema rejects title > 255 chars', () => {
    expect(() => createCallbackSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createCallbackSchema validates reported_date format', () => {
    const result = createCallbackSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Test callback',
      reported_date: '2026-01-15',
    })
    expect(result.reported_date).toBe('2026-01-15')
  })

  test('createCallbackSchema rejects invalid date format', () => {
    expect(() => createCallbackSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Test',
      reported_date: 'Jan 15, 2026',
    })).toThrow()
  })

  test('updateCallbackSchema accepts partial updates', () => {
    const result = updateCallbackSchema.parse({
      severity: 'critical',
      resolution_notes: 'Fixed the issue',
    })
    expect(result.severity).toBe('critical')
    expect(result.resolution_notes).toBe('Fixed the issue')
    expect(result.title).toBeUndefined()
  })

  test('resolveCallbackSchema accepts empty object', () => {
    const result = resolveCallbackSchema.parse({})
    expect(result.resolution_notes).toBeUndefined()
  })

  test('resolveCallbackSchema accepts resolution details', () => {
    const result = resolveCallbackSchema.parse({
      resolution_notes: 'Replaced faucet cartridge',
      resolution_cost: 150.00,
      resolved_date: '2026-02-01',
    })
    expect(result.resolution_notes).toBe('Replaced faucet cartridge')
    expect(result.resolution_cost).toBe(150.00)
    expect(result.resolved_date).toBe('2026-02-01')
  })
})

// ============================================================================
// Vendor Note Schemas
// ============================================================================

describe('Module 22 — Vendor Note Schemas', () => {
  test('listVendorNotesSchema accepts valid params', () => {
    const result = listVendorNotesSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('createVendorNoteSchema accepts valid note', () => {
    const result = createVendorNoteSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      body: 'This vendor has been responsive and professional.',
      tags: ['responsive', 'professional'],
    })
    expect(result.body).toBe('This vendor has been responsive and professional.')
    expect(result.tags).toHaveLength(2)
    expect(result.is_internal).toBe(true)
  })

  test('createVendorNoteSchema requires vendor_id and body', () => {
    expect(() => createVendorNoteSchema.parse({})).toThrow()
    expect(() => createVendorNoteSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createVendorNoteSchema defaults tags to empty array', () => {
    const result = createVendorNoteSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      body: 'Test note',
    })
    expect(result.tags).toEqual([])
  })

  test('createVendorNoteSchema rejects body > 10000 chars', () => {
    expect(() => createVendorNoteSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      body: 'A'.repeat(10001),
    })).toThrow()
  })

  test('updateVendorNoteSchema accepts partial updates', () => {
    const result = updateVendorNoteSchema.parse({
      body: 'Updated note content',
      is_internal: false,
    })
    expect(result.body).toBe('Updated note content')
    expect(result.is_internal).toBe(false)
    expect(result.tags).toBeUndefined()
  })
})
