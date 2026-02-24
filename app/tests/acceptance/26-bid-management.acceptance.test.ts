/**
 * Module 26 — Bid Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 26 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  BidPackageStatus,
  InvitationStatus,
  AwardStatus,
  BidPackage,
  BidInvitation,
  BidResponse,
  BidComparison,
  BidAward,
} from '@/types/bid-management'

import {
  BID_PACKAGE_STATUSES,
  INVITATION_STATUSES,
  AWARD_STATUSES,
} from '@/types/bid-management'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  bidPackageStatusEnum,
  invitationStatusEnum,
  awardStatusEnum,
  listBidPackagesSchema,
  createBidPackageSchema,
  updateBidPackageSchema,
  publishBidPackageSchema,
  closeBidPackageSchema,
  listBidInvitationsSchema,
  createBidInvitationSchema,
  updateBidInvitationSchema,
  listBidResponsesSchema,
  createBidResponseSchema,
  updateBidResponseSchema,
  listBidComparisonsSchema,
  createBidComparisonSchema,
  updateBidComparisonSchema,
  createBidAwardSchema,
  updateBidAwardSchema,
} from '@/lib/validation/schemas/bid-management'

// ============================================================================
// Type System
// ============================================================================

describe('Module 26 — Bid Management Types', () => {
  test('BidPackageStatus has 5 values', () => {
    const statuses: BidPackageStatus[] = [
      'draft', 'published', 'closed', 'awarded', 'cancelled',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('InvitationStatus has 4 values', () => {
    const statuses: InvitationStatus[] = [
      'invited', 'viewed', 'declined', 'submitted',
    ]
    expect(statuses).toHaveLength(4)
  })

  test('AwardStatus has 4 values', () => {
    const statuses: AwardStatus[] = [
      'pending', 'accepted', 'rejected', 'withdrawn',
    ]
    expect(statuses).toHaveLength(4)
  })

  test('BidPackage interface has all required fields', () => {
    const bp: BidPackage = {
      id: '1', company_id: '1', job_id: '1',
      title: 'Framing Package', description: 'Full framing scope',
      trade: 'Framing', scope_of_work: 'All framing per plans',
      bid_due_date: '2026-03-15', status: 'draft',
      documents: [], created_by: '1',
      created_at: '2026-02-20', updated_at: '2026-02-20', deleted_at: null,
    }
    expect(bp.title).toBe('Framing Package')
    expect(bp.status).toBe('draft')
    expect(bp.trade).toBe('Framing')
  })

  test('BidInvitation interface has all required fields', () => {
    const inv: BidInvitation = {
      id: '1', company_id: '1', bid_package_id: '1', vendor_id: '1',
      status: 'invited', invited_at: '2026-02-20',
      viewed_at: null, responded_at: null, decline_reason: null,
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(inv.status).toBe('invited')
    expect(inv.bid_package_id).toBe('1')
  })

  test('BidResponse interface has all required fields', () => {
    const resp: BidResponse = {
      id: '1', company_id: '1', bid_package_id: '1',
      vendor_id: '1', invitation_id: '1',
      total_amount: 125000.00, breakdown: { labor: 75000, materials: 50000 },
      notes: 'Includes cleanup', attachments: [],
      submitted_at: '2026-02-25', is_qualified: true,
      created_at: '2026-02-25', updated_at: '2026-02-25',
    }
    expect(resp.total_amount).toBe(125000.00)
    expect(resp.is_qualified).toBe(true)
  })

  test('BidComparison interface has all required fields', () => {
    const comp: BidComparison = {
      id: '1', company_id: '1', bid_package_id: '1',
      name: 'Initial Comparison',
      comparison_data: { vendors: [] }, notes: null,
      created_by: '1',
      created_at: '2026-02-26', updated_at: '2026-02-26',
    }
    expect(comp.name).toBe('Initial Comparison')
    expect(comp.comparison_data).toHaveProperty('vendors')
  })

  test('BidAward interface has all required fields', () => {
    const award: BidAward = {
      id: '1', company_id: '1', bid_package_id: '1',
      vendor_id: '1', bid_response_id: '1',
      award_amount: 125000.00, notes: 'Best value bid',
      awarded_by: '1', awarded_at: '2026-03-01',
      status: 'pending',
      created_at: '2026-03-01', updated_at: '2026-03-01',
    }
    expect(award.award_amount).toBe(125000.00)
    expect(award.status).toBe('pending')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 26 — Constants', () => {
  test('BID_PACKAGE_STATUSES has 5 entries with value and label', () => {
    expect(BID_PACKAGE_STATUSES).toHaveLength(5)
    for (const s of BID_PACKAGE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('BID_PACKAGE_STATUSES includes all expected values', () => {
    const values = BID_PACKAGE_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('published')
    expect(values).toContain('closed')
    expect(values).toContain('awarded')
    expect(values).toContain('cancelled')
  })

  test('INVITATION_STATUSES has 4 entries with value and label', () => {
    expect(INVITATION_STATUSES).toHaveLength(4)
    for (const s of INVITATION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('AWARD_STATUSES has 4 entries with value and label', () => {
    expect(AWARD_STATUSES).toHaveLength(4)
    for (const s of AWARD_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 26 — Enum Schemas', () => {
  test('bidPackageStatusEnum accepts all 5 statuses', () => {
    for (const s of ['draft', 'published', 'closed', 'awarded', 'cancelled']) {
      expect(bidPackageStatusEnum.parse(s)).toBe(s)
    }
  })

  test('bidPackageStatusEnum rejects invalid status', () => {
    expect(() => bidPackageStatusEnum.parse('active')).toThrow()
  })

  test('invitationStatusEnum accepts all 4 statuses', () => {
    for (const s of ['invited', 'viewed', 'declined', 'submitted']) {
      expect(invitationStatusEnum.parse(s)).toBe(s)
    }
  })

  test('invitationStatusEnum rejects invalid status', () => {
    expect(() => invitationStatusEnum.parse('accepted')).toThrow()
  })

  test('awardStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'accepted', 'rejected', 'withdrawn']) {
      expect(awardStatusEnum.parse(s)).toBe(s)
    }
  })

  test('awardStatusEnum rejects invalid status', () => {
    expect(() => awardStatusEnum.parse('cancelled')).toThrow()
  })
})

// ============================================================================
// Bid Package Schemas
// ============================================================================

describe('Module 26 — Bid Package Schemas', () => {
  test('listBidPackagesSchema accepts valid params', () => {
    const result = listBidPackagesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listBidPackagesSchema rejects limit > 100', () => {
    expect(() => listBidPackagesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listBidPackagesSchema accepts filters', () => {
    const result = listBidPackagesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'published',
      trade: 'Framing',
      q: 'kitchen',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('published')
    expect(result.trade).toBe('Framing')
    expect(result.q).toBe('kitchen')
  })

  test('createBidPackageSchema accepts valid bid package', () => {
    const result = createBidPackageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Framing Bid Package',
    })
    expect(result.title).toBe('Framing Bid Package')
    expect(result.status).toBe('draft')
    expect(result.documents).toEqual([])
  })

  test('createBidPackageSchema requires job_id and title', () => {
    expect(() => createBidPackageSchema.parse({})).toThrow()
    expect(() => createBidPackageSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createBidPackageSchema rejects title > 200 chars', () => {
    expect(() => createBidPackageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(201),
    })).toThrow()
  })

  test('createBidPackageSchema validates bid_due_date format', () => {
    const result = createBidPackageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      bid_due_date: '2026-03-15',
    })
    expect(result.bid_due_date).toBe('2026-03-15')
  })

  test('createBidPackageSchema rejects invalid bid_due_date format', () => {
    expect(() => createBidPackageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      bid_due_date: 'March 15, 2026',
    })).toThrow()
  })

  test('updateBidPackageSchema accepts partial updates', () => {
    const result = updateBidPackageSchema.parse({ title: 'Updated title' })
    expect(result.title).toBe('Updated title')
    expect(result.trade).toBeUndefined()
  })

  test('publishBidPackageSchema accepts empty object', () => {
    const result = publishBidPackageSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('publishBidPackageSchema accepts notes', () => {
    const result = publishBidPackageSchema.parse({ notes: 'Ready to publish' })
    expect(result.notes).toBe('Ready to publish')
  })

  test('closeBidPackageSchema accepts empty object', () => {
    const result = closeBidPackageSchema.parse({})
    expect(result.notes).toBeUndefined()
  })
})

// ============================================================================
// Invitation Schemas
// ============================================================================

describe('Module 26 — Invitation Schemas', () => {
  test('listBidInvitationsSchema accepts valid params', () => {
    const result = listBidInvitationsSchema.parse({ page: '1', limit: '10' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  test('createBidInvitationSchema requires vendor_id', () => {
    expect(() => createBidInvitationSchema.parse({})).toThrow()
  })

  test('createBidInvitationSchema accepts valid invitation', () => {
    const result = createBidInvitationSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('updateBidInvitationSchema accepts partial updates', () => {
    const result = updateBidInvitationSchema.parse({ status: 'viewed' })
    expect(result.status).toBe('viewed')
    expect(result.decline_reason).toBeUndefined()
  })
})

// ============================================================================
// Response Schemas
// ============================================================================

describe('Module 26 — Response Schemas', () => {
  test('listBidResponsesSchema accepts valid params with defaults', () => {
    const result = listBidResponsesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('createBidResponseSchema accepts valid response', () => {
    const result = createBidResponseSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      total_amount: 125000.00,
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.total_amount).toBe(125000.00)
    expect(result.is_qualified).toBe(true)
    expect(result.breakdown).toEqual({})
    expect(result.attachments).toEqual([])
  })

  test('createBidResponseSchema requires vendor_id and total_amount', () => {
    expect(() => createBidResponseSchema.parse({})).toThrow()
    expect(() => createBidResponseSchema.parse({ vendor_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createBidResponseSchema rejects negative total_amount', () => {
    expect(() => createBidResponseSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      total_amount: -100,
    })).toThrow()
  })

  test('updateBidResponseSchema accepts partial updates', () => {
    const result = updateBidResponseSchema.parse({ total_amount: 130000.00, is_qualified: false })
    expect(result.total_amount).toBe(130000.00)
    expect(result.is_qualified).toBe(false)
    expect(result.notes).toBeUndefined()
  })
})

// ============================================================================
// Comparison Schemas
// ============================================================================

describe('Module 26 — Comparison Schemas', () => {
  test('listBidComparisonsSchema accepts valid params', () => {
    const result = listBidComparisonsSchema.parse({ page: '2', limit: '10' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
  })

  test('createBidComparisonSchema requires name', () => {
    expect(() => createBidComparisonSchema.parse({})).toThrow()
  })

  test('createBidComparisonSchema accepts valid comparison', () => {
    const result = createBidComparisonSchema.parse({
      name: 'Framing Bid Comparison',
      comparison_data: { scores: [1, 2, 3] },
      notes: 'Initial leveling',
    })
    expect(result.name).toBe('Framing Bid Comparison')
    expect(result.comparison_data).toEqual({ scores: [1, 2, 3] })
    expect(result.notes).toBe('Initial leveling')
  })

  test('createBidComparisonSchema rejects name > 200 chars', () => {
    expect(() => createBidComparisonSchema.parse({
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('updateBidComparisonSchema accepts partial updates', () => {
    const result = updateBidComparisonSchema.parse({ notes: 'Updated notes' })
    expect(result.notes).toBe('Updated notes')
    expect(result.name).toBeUndefined()
  })
})

// ============================================================================
// Award Schemas
// ============================================================================

describe('Module 26 — Award Schemas', () => {
  test('createBidAwardSchema accepts valid award', () => {
    const result = createBidAwardSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      bid_response_id: '660e8400-e29b-41d4-a716-446655440000',
      award_amount: 125000.00,
      notes: 'Best value',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.award_amount).toBe(125000.00)
    expect(result.status).toBe('pending')
  })

  test('createBidAwardSchema requires vendor_id and award_amount', () => {
    expect(() => createBidAwardSchema.parse({})).toThrow()
    expect(() => createBidAwardSchema.parse({ vendor_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createBidAwardSchema rejects negative award_amount', () => {
    expect(() => createBidAwardSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      award_amount: -500,
    })).toThrow()
  })

  test('updateBidAwardSchema accepts partial updates', () => {
    const result = updateBidAwardSchema.parse({ status: 'accepted', award_amount: 130000 })
    expect(result.status).toBe('accepted')
    expect(result.award_amount).toBe(130000)
    expect(result.notes).toBeUndefined()
  })

  test('updateBidAwardSchema rejects invalid status', () => {
    expect(() => updateBidAwardSchema.parse({ status: 'completed' })).toThrow()
  })
})
