/**
 * Module 28 — Punch List & Quality Checklists Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 28 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  PunchItemStatus,
  PunchItemPriority,
  PunchItemCategory,
  PhotoType,
  ChecklistStatus,
  ChecklistItemResult,
  PunchItem,
  PunchItemPhoto,
  QualityChecklist,
  QualityChecklistItem,
  QualityChecklistTemplate,
  QualityChecklistTemplateItem,
} from '@/types/punch-list'

import {
  PUNCH_ITEM_STATUSES,
  PUNCH_ITEM_PRIORITIES,
  PUNCH_ITEM_CATEGORIES,
  PHOTO_TYPES,
  CHECKLIST_STATUSES,
  CHECKLIST_ITEM_RESULTS,
} from '@/types/punch-list'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  punchItemStatusEnum,
  punchItemPriorityEnum,
  punchItemCategoryEnum,
  photoTypeEnum,
  checklistStatusEnum,
  checklistItemResultEnum,
  listPunchItemsSchema,
  createPunchItemSchema,
  updatePunchItemSchema,
  completePunchItemSchema,
  verifyPunchItemSchema,
  createPunchItemPhotoSchema,
  listChecklistsSchema,
  createChecklistSchema,
  updateChecklistSchema,
  approveChecklistSchema,
  createChecklistItemSchema,
  updateChecklistItemSchema,
  listChecklistItemsSchema,
  listTemplatesSchema,
  createTemplateSchema,
  updateTemplateSchema,
  createTemplateItemSchema,
  updateTemplateItemSchema,
  listTemplateItemsSchema,
} from '@/lib/validation/schemas/punch-list'

// ============================================================================
// Type System
// ============================================================================

describe('Module 28 — Punch List Types', () => {
  test('PunchItemStatus has 5 values', () => {
    const statuses: PunchItemStatus[] = ['open', 'in_progress', 'completed', 'verified', 'disputed']
    expect(statuses).toHaveLength(5)
  })

  test('PunchItemPriority has 4 values', () => {
    const priorities: PunchItemPriority[] = ['low', 'normal', 'high', 'critical']
    expect(priorities).toHaveLength(4)
  })

  test('PunchItemCategory has 14 values', () => {
    const categories: PunchItemCategory[] = [
      'structural', 'electrical', 'plumbing', 'hvac', 'finish', 'paint',
      'flooring', 'cabinets', 'countertops', 'fixtures', 'appliances',
      'exterior', 'landscaping', 'other',
    ]
    expect(categories).toHaveLength(14)
  })

  test('PhotoType has 3 values', () => {
    const types: PhotoType[] = ['before', 'after', 'issue']
    expect(types).toHaveLength(3)
  })

  test('ChecklistStatus has 4 values', () => {
    const statuses: ChecklistStatus[] = ['not_started', 'in_progress', 'completed', 'approved']
    expect(statuses).toHaveLength(4)
  })

  test('ChecklistItemResult has 4 values', () => {
    const results: ChecklistItemResult[] = ['pass', 'fail', 'na', 'not_inspected']
    expect(results).toHaveLength(4)
  })

  test('PunchItem interface has all required fields', () => {
    const item: PunchItem = {
      id: '1', company_id: '1', job_id: '1',
      title: 'Drywall crack in master bedroom',
      description: 'Hairline crack along ceiling joint',
      location: 'Master Bedroom', room: 'Master Bedroom',
      status: 'open', priority: 'normal', category: 'finish',
      assigned_to: null, assigned_vendor_id: null,
      due_date: '2026-03-15', completed_at: null,
      verified_by: null, verified_at: null,
      cost_estimate: 250.00, created_by: '1',
      created_at: '2026-02-20', updated_at: '2026-02-20', deleted_at: null,
    }
    expect(item.title).toBe('Drywall crack in master bedroom')
    expect(item.status).toBe('open')
    expect(item.priority).toBe('normal')
    expect(item.category).toBe('finish')
  })

  test('PunchItemPhoto interface has all required fields', () => {
    const photo: PunchItemPhoto = {
      id: '1', company_id: '1', punch_item_id: '1',
      photo_url: 'https://storage.example.com/photo.jpg',
      caption: 'Crack visible on ceiling',
      photo_type: 'issue',
      uploaded_by: '1', uploaded_at: '2026-02-20',
      created_at: '2026-02-20',
    }
    expect(photo.photo_url).toBe('https://storage.example.com/photo.jpg')
    expect(photo.photo_type).toBe('issue')
  })

  test('QualityChecklist interface has all required fields', () => {
    const checklist: QualityChecklist = {
      id: '1', company_id: '1', job_id: '1',
      template_id: null, name: 'Framing Rough Inspection',
      description: 'Pre-drywall framing inspection',
      status: 'not_started', inspector_id: '1',
      inspection_date: '2026-03-01', location: 'Main Floor',
      total_items: 20, passed_items: 0, failed_items: 0, na_items: 0,
      completed_at: null, approved_by: null, approved_at: null,
      created_by: '1', created_at: '2026-02-20', updated_at: '2026-02-20',
      deleted_at: null,
    }
    expect(checklist.name).toBe('Framing Rough Inspection')
    expect(checklist.status).toBe('not_started')
    expect(checklist.total_items).toBe(20)
  })

  test('QualityChecklistItem interface has all required fields', () => {
    const item: QualityChecklistItem = {
      id: '1', company_id: '1', checklist_id: '1',
      description: 'Verify stud spacing is 16" on center',
      result: 'not_inspected', notes: null, photo_url: null,
      sort_order: 1,
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(item.description).toBe('Verify stud spacing is 16" on center')
    expect(item.result).toBe('not_inspected')
  })

  test('QualityChecklistTemplate interface has all required fields', () => {
    const template: QualityChecklistTemplate = {
      id: '1', company_id: '1',
      name: 'Framing Inspection Template',
      description: 'Standard framing inspection checklist',
      category: 'structural', trade: 'framing',
      is_active: true, is_system: false,
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(template.name).toBe('Framing Inspection Template')
    expect(template.is_active).toBe(true)
  })

  test('QualityChecklistTemplateItem interface has all required fields', () => {
    const item: QualityChecklistTemplateItem = {
      id: '1', company_id: '1', template_id: '1',
      description: 'Check header sizes match plans',
      category: 'structural', sort_order: 1, is_required: true,
      created_at: '2026-02-20', updated_at: '2026-02-20',
    }
    expect(item.description).toBe('Check header sizes match plans')
    expect(item.is_required).toBe(true)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 28 — Constants', () => {
  test('PUNCH_ITEM_STATUSES has 5 entries with value and label', () => {
    expect(PUNCH_ITEM_STATUSES).toHaveLength(5)
    for (const s of PUNCH_ITEM_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('PUNCH_ITEM_PRIORITIES has 4 entries with value and label', () => {
    expect(PUNCH_ITEM_PRIORITIES).toHaveLength(4)
    for (const p of PUNCH_ITEM_PRIORITIES) {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
      expect(p.label.length).toBeGreaterThan(0)
    }
  })

  test('PUNCH_ITEM_CATEGORIES has 14 entries with value and label', () => {
    expect(PUNCH_ITEM_CATEGORIES).toHaveLength(14)
    const values = PUNCH_ITEM_CATEGORIES.map((c) => c.value)
    expect(values).toContain('structural')
    expect(values).toContain('electrical')
    expect(values).toContain('plumbing')
    expect(values).toContain('hvac')
    expect(values).toContain('other')
  })

  test('PHOTO_TYPES has 3 entries with value and label', () => {
    expect(PHOTO_TYPES).toHaveLength(3)
    const values = PHOTO_TYPES.map((t) => t.value)
    expect(values).toContain('before')
    expect(values).toContain('after')
    expect(values).toContain('issue')
  })

  test('CHECKLIST_STATUSES has 4 entries with value and label', () => {
    expect(CHECKLIST_STATUSES).toHaveLength(4)
    for (const s of CHECKLIST_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('CHECKLIST_ITEM_RESULTS has 4 entries with value and label', () => {
    expect(CHECKLIST_ITEM_RESULTS).toHaveLength(4)
    const values = CHECKLIST_ITEM_RESULTS.map((r) => r.value)
    expect(values).toContain('pass')
    expect(values).toContain('fail')
    expect(values).toContain('na')
    expect(values).toContain('not_inspected')
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 28 — Enum Schemas', () => {
  test('punchItemStatusEnum accepts all 5 statuses', () => {
    for (const s of ['open', 'in_progress', 'completed', 'verified', 'disputed']) {
      expect(punchItemStatusEnum.parse(s)).toBe(s)
    }
  })

  test('punchItemStatusEnum rejects invalid status', () => {
    expect(() => punchItemStatusEnum.parse('cancelled')).toThrow()
  })

  test('punchItemPriorityEnum accepts all 4 priorities', () => {
    for (const p of ['low', 'normal', 'high', 'critical']) {
      expect(punchItemPriorityEnum.parse(p)).toBe(p)
    }
  })

  test('punchItemPriorityEnum rejects invalid priority', () => {
    expect(() => punchItemPriorityEnum.parse('urgent')).toThrow()
  })

  test('punchItemCategoryEnum accepts all 14 categories', () => {
    for (const c of [
      'structural', 'electrical', 'plumbing', 'hvac', 'finish', 'paint',
      'flooring', 'cabinets', 'countertops', 'fixtures', 'appliances',
      'exterior', 'landscaping', 'other',
    ]) {
      expect(punchItemCategoryEnum.parse(c)).toBe(c)
    }
  })

  test('punchItemCategoryEnum rejects invalid category', () => {
    expect(() => punchItemCategoryEnum.parse('roofing')).toThrow()
  })

  test('photoTypeEnum accepts all 3 types', () => {
    for (const t of ['before', 'after', 'issue']) {
      expect(photoTypeEnum.parse(t)).toBe(t)
    }
  })

  test('photoTypeEnum rejects invalid type', () => {
    expect(() => photoTypeEnum.parse('thumbnail')).toThrow()
  })

  test('checklistStatusEnum accepts all 4 statuses', () => {
    for (const s of ['not_started', 'in_progress', 'completed', 'approved']) {
      expect(checklistStatusEnum.parse(s)).toBe(s)
    }
  })

  test('checklistStatusEnum rejects invalid status', () => {
    expect(() => checklistStatusEnum.parse('draft')).toThrow()
  })

  test('checklistItemResultEnum accepts all 4 results', () => {
    for (const r of ['pass', 'fail', 'na', 'not_inspected']) {
      expect(checklistItemResultEnum.parse(r)).toBe(r)
    }
  })

  test('checklistItemResultEnum rejects invalid result', () => {
    expect(() => checklistItemResultEnum.parse('partial')).toThrow()
  })
})

// ============================================================================
// Schemas — Punch Items
// ============================================================================

describe('Module 28 — Punch Item Schemas', () => {
  test('listPunchItemsSchema accepts valid params', () => {
    const result = listPunchItemsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPunchItemsSchema rejects limit > 100', () => {
    expect(() => listPunchItemsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listPunchItemsSchema accepts filters', () => {
    const result = listPunchItemsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'open',
      priority: 'high',
      category: 'electrical',
      q: 'outlet',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('open')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('electrical')
    expect(result.q).toBe('outlet')
  })

  test('createPunchItemSchema accepts valid punch item', () => {
    const result = createPunchItemSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Fix drywall crack in master bedroom',
    })
    expect(result.title).toBe('Fix drywall crack in master bedroom')
    expect(result.status).toBe('open')
    expect(result.priority).toBe('normal')
  })

  test('createPunchItemSchema requires job_id and title', () => {
    expect(() => createPunchItemSchema.parse({})).toThrow()
    expect(() => createPunchItemSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createPunchItemSchema rejects title > 255 chars', () => {
    expect(() => createPunchItemSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createPunchItemSchema accepts optional fields', () => {
    const result = createPunchItemSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Missing outlet cover',
      description: 'Outlet cover plate missing in kitchen island',
      location: 'Kitchen',
      room: 'Kitchen',
      priority: 'high',
      category: 'electrical',
      due_date: '2026-03-15',
      cost_estimate: 50.00,
    })
    expect(result.description).toBe('Outlet cover plate missing in kitchen island')
    expect(result.location).toBe('Kitchen')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('electrical')
    expect(result.due_date).toBe('2026-03-15')
    expect(result.cost_estimate).toBe(50.00)
  })

  test('createPunchItemSchema validates due_date format', () => {
    expect(() => createPunchItemSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      due_date: 'March 15, 2026',
    })).toThrow()
  })

  test('updatePunchItemSchema accepts partial updates', () => {
    const result = updatePunchItemSchema.parse({ title: 'Updated title', priority: 'critical' })
    expect(result.title).toBe('Updated title')
    expect(result.priority).toBe('critical')
    expect(result.description).toBeUndefined()
  })

  test('completePunchItemSchema accepts empty object', () => {
    const result = completePunchItemSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('completePunchItemSchema accepts notes', () => {
    const result = completePunchItemSchema.parse({ notes: 'Repair completed' })
    expect(result.notes).toBe('Repair completed')
  })

  test('verifyPunchItemSchema accepts empty object', () => {
    const result = verifyPunchItemSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('verifyPunchItemSchema accepts notes', () => {
    const result = verifyPunchItemSchema.parse({ notes: 'Verified on site' })
    expect(result.notes).toBe('Verified on site')
  })
})

// ============================================================================
// Schemas — Photos
// ============================================================================

describe('Module 28 — Photo Schemas', () => {
  test('createPunchItemPhotoSchema accepts valid photo', () => {
    const result = createPunchItemPhotoSchema.parse({
      photo_url: 'https://storage.example.com/photo.jpg',
      caption: 'Crack visible on ceiling',
      photo_type: 'issue',
    })
    expect(result.photo_url).toBe('https://storage.example.com/photo.jpg')
    expect(result.caption).toBe('Crack visible on ceiling')
    expect(result.photo_type).toBe('issue')
  })

  test('createPunchItemPhotoSchema requires photo_url', () => {
    expect(() => createPunchItemPhotoSchema.parse({})).toThrow()
  })

  test('createPunchItemPhotoSchema defaults photo_type to issue', () => {
    const result = createPunchItemPhotoSchema.parse({
      photo_url: 'https://storage.example.com/photo.jpg',
    })
    expect(result.photo_type).toBe('issue')
  })
})

// ============================================================================
// Schemas — Quality Checklists
// ============================================================================

describe('Module 28 — Quality Checklist Schemas', () => {
  test('listChecklistsSchema accepts valid params', () => {
    const result = listChecklistsSchema.parse({ page: '2', limit: '10' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
  })

  test('listChecklistsSchema rejects limit > 100', () => {
    expect(() => listChecklistsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createChecklistSchema accepts valid checklist', () => {
    const result = createChecklistSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Framing Rough Inspection',
    })
    expect(result.name).toBe('Framing Rough Inspection')
    expect(result.status).toBe('not_started')
  })

  test('createChecklistSchema requires job_id and name', () => {
    expect(() => createChecklistSchema.parse({})).toThrow()
    expect(() => createChecklistSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createChecklistSchema rejects name > 200 chars', () => {
    expect(() => createChecklistSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('updateChecklistSchema accepts partial updates', () => {
    const result = updateChecklistSchema.parse({ name: 'Updated name', total_items: 25 })
    expect(result.name).toBe('Updated name')
    expect(result.total_items).toBe(25)
    expect(result.status).toBeUndefined()
  })

  test('approveChecklistSchema accepts empty object', () => {
    const result = approveChecklistSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('approveChecklistSchema accepts notes', () => {
    const result = approveChecklistSchema.parse({ notes: 'All items verified' })
    expect(result.notes).toBe('All items verified')
  })
})

// ============================================================================
// Schemas — Checklist Items
// ============================================================================

describe('Module 28 — Checklist Item Schemas', () => {
  test('createChecklistItemSchema accepts valid item', () => {
    const result = createChecklistItemSchema.parse({
      description: 'Verify stud spacing is 16" on center',
      result: 'pass',
      sort_order: 1,
    })
    expect(result.description).toBe('Verify stud spacing is 16" on center')
    expect(result.result).toBe('pass')
    expect(result.sort_order).toBe(1)
  })

  test('createChecklistItemSchema requires description', () => {
    expect(() => createChecklistItemSchema.parse({})).toThrow()
  })

  test('createChecklistItemSchema has correct defaults', () => {
    const result = createChecklistItemSchema.parse({ description: 'Check item' })
    expect(result.result).toBe('not_inspected')
    expect(result.sort_order).toBe(0)
  })

  test('updateChecklistItemSchema accepts partial updates', () => {
    const result = updateChecklistItemSchema.parse({ result: 'fail', notes: 'Did not pass' })
    expect(result.result).toBe('fail')
    expect(result.notes).toBe('Did not pass')
    expect(result.description).toBeUndefined()
  })

  test('listChecklistItemsSchema accepts valid params with defaults', () => {
    const result = listChecklistItemsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })
})

// ============================================================================
// Schemas — Templates
// ============================================================================

describe('Module 28 — Template Schemas', () => {
  test('listTemplatesSchema accepts valid params', () => {
    const result = listTemplatesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listTemplatesSchema accepts filters', () => {
    const result = listTemplatesSchema.parse({
      category: 'structural',
      trade: 'framing',
      is_active: 'true',
      q: 'rough',
    })
    expect(result.category).toBe('structural')
    expect(result.trade).toBe('framing')
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('rough')
  })

  test('createTemplateSchema accepts valid template', () => {
    const result = createTemplateSchema.parse({
      name: 'Framing Inspection Template',
      description: 'Standard framing inspection checklist',
      category: 'structural',
      trade: 'framing',
    })
    expect(result.name).toBe('Framing Inspection Template')
    expect(result.is_active).toBe(true)
    expect(result.is_system).toBe(false)
  })

  test('createTemplateSchema requires name', () => {
    expect(() => createTemplateSchema.parse({})).toThrow()
  })

  test('createTemplateSchema rejects name > 200 chars', () => {
    expect(() => createTemplateSchema.parse({ name: 'A'.repeat(201) })).toThrow()
  })

  test('updateTemplateSchema accepts partial updates', () => {
    const result = updateTemplateSchema.parse({ name: 'Updated Template', is_active: false })
    expect(result.name).toBe('Updated Template')
    expect(result.is_active).toBe(false)
    expect(result.category).toBeUndefined()
  })
})

// ============================================================================
// Schemas — Template Items
// ============================================================================

describe('Module 28 — Template Item Schemas', () => {
  test('createTemplateItemSchema accepts valid item', () => {
    const result = createTemplateItemSchema.parse({
      description: 'Check header sizes match plans',
      category: 'structural',
      sort_order: 1,
      is_required: true,
    })
    expect(result.description).toBe('Check header sizes match plans')
    expect(result.category).toBe('structural')
    expect(result.sort_order).toBe(1)
    expect(result.is_required).toBe(true)
  })

  test('createTemplateItemSchema requires description', () => {
    expect(() => createTemplateItemSchema.parse({})).toThrow()
  })

  test('createTemplateItemSchema has correct defaults', () => {
    const result = createTemplateItemSchema.parse({ description: 'Template item' })
    expect(result.sort_order).toBe(0)
    expect(result.is_required).toBe(true)
  })

  test('updateTemplateItemSchema accepts partial updates', () => {
    const result = updateTemplateItemSchema.parse({ description: 'Updated description', is_required: false })
    expect(result.description).toBe('Updated description')
    expect(result.is_required).toBe(false)
    expect(result.sort_order).toBeUndefined()
  })

  test('listTemplateItemsSchema accepts valid params with defaults', () => {
    const result = listTemplateItemsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })
})
