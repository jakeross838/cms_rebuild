/**
 * Module 24 — AI Document Processing Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 24 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  DocumentType,
  ExtractionStatus,
  QueueStatus,
  QueuePriority,
  FeedbackType,
  DocumentClassification,
  DocumentExtraction,
  ExtractionTemplate,
  DocumentProcessingQueue,
  AiFeedback,
} from '@/types/ai-document-processing'

import {
  DOCUMENT_TYPES,
  EXTRACTION_STATUSES,
  QUEUE_STATUSES,
  QUEUE_PRIORITIES,
  FEEDBACK_TYPES,
} from '@/types/ai-document-processing'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  documentTypeEnum,
  extractionStatusEnum,
  queueStatusEnum,
  queuePriorityEnum,
  feedbackTypeEnum,
  listClassificationsSchema,
  createClassificationSchema,
  listTemplatesSchema,
  createTemplateSchema,
  updateTemplateSchema,
  listExtractionsSchema,
  createExtractionSchema,
  updateExtractionSchema,
  listQueueSchema,
  createQueueItemSchema,
  updateQueueItemSchema,
  listFeedbackSchema,
  createFeedbackSchema,
} from '@/lib/validation/schemas/ai-document-processing'

// ============================================================================
// Type System
// ============================================================================

describe('Module 24 — AI Document Processing Types', () => {
  test('DocumentType has 13 values', () => {
    const types: DocumentType[] = [
      'invoice', 'receipt', 'lien_waiver', 'change_order', 'purchase_order',
      'contract', 'permit', 'inspection_report', 'plan_sheet', 'specification',
      'submittal', 'rfi', 'other',
    ]
    expect(types).toHaveLength(13)
  })

  test('ExtractionStatus has 5 values', () => {
    const statuses: ExtractionStatus[] = [
      'pending', 'processing', 'completed', 'failed', 'review_needed',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('QueueStatus has 5 values', () => {
    const statuses: QueueStatus[] = [
      'queued', 'processing', 'completed', 'failed', 'cancelled',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('QueuePriority has 5 values', () => {
    const priorities: QueuePriority[] = [1, 2, 3, 4, 5]
    expect(priorities).toHaveLength(5)
  })

  test('FeedbackType has 3 values', () => {
    const types: FeedbackType[] = ['correction', 'confirmation', 'rejection']
    expect(types).toHaveLength(3)
  })

  test('DocumentClassification interface has all required fields', () => {
    const classification: DocumentClassification = {
      id: '1', company_id: '1', document_id: '1',
      classified_type: 'invoice', confidence_score: 0.95,
      model_version: 'v1.0', metadata: { pages: 2 },
      created_by: '1', created_at: '2026-02-01',
      updated_at: '2026-02-01', deleted_at: null,
    }
    expect(classification.classified_type).toBe('invoice')
    expect(classification.confidence_score).toBe(0.95)
    expect(classification.metadata).toEqual({ pages: 2 })
  })

  test('ExtractionTemplate interface has all required fields', () => {
    const template: ExtractionTemplate = {
      id: '1', company_id: '1', name: 'Invoice Template',
      document_type: 'invoice', field_definitions: [{ name: 'amount', type: 'currency' }],
      is_active: true, is_system: false, created_by: '1',
      created_at: '2026-02-01', updated_at: '2026-02-01', deleted_at: null,
    }
    expect(template.name).toBe('Invoice Template')
    expect(template.document_type).toBe('invoice')
    expect(template.is_active).toBe(true)
    expect(template.field_definitions).toHaveLength(1)
  })

  test('DocumentExtraction interface has all required fields', () => {
    const extraction: DocumentExtraction = {
      id: '1', company_id: '1', document_id: '1',
      classification_id: '2', extraction_template_id: '3',
      extracted_data: { vendor: 'Acme Corp', amount: 1500.00 },
      status: 'completed', reviewed_by: '1', reviewed_at: '2026-02-01',
      created_by: '1', created_at: '2026-02-01',
      updated_at: '2026-02-01', deleted_at: null,
    }
    expect(extraction.status).toBe('completed')
    expect(extraction.extracted_data).toHaveProperty('vendor')
    expect(extraction.classification_id).toBe('2')
  })

  test('DocumentProcessingQueue interface has all required fields', () => {
    const queueItem: DocumentProcessingQueue = {
      id: '1', company_id: '1', document_id: '1',
      status: 'queued', priority: 3, attempts: 0, max_attempts: 3,
      error_message: null, started_at: null, completed_at: null,
      created_by: '1', created_at: '2026-02-01', updated_at: '2026-02-01',
    }
    expect(queueItem.status).toBe('queued')
    expect(queueItem.priority).toBe(3)
    expect(queueItem.attempts).toBe(0)
    expect(queueItem.max_attempts).toBe(3)
  })

  test('AiFeedback interface has all required fields', () => {
    const feedback: AiFeedback = {
      id: '1', company_id: '1', extraction_id: '1',
      field_name: 'vendor_name', original_value: 'Acme',
      corrected_value: 'Acme Corp', feedback_type: 'correction',
      created_by: '1', created_at: '2026-02-01', updated_at: '2026-02-01',
    }
    expect(feedback.field_name).toBe('vendor_name')
    expect(feedback.original_value).toBe('Acme')
    expect(feedback.corrected_value).toBe('Acme Corp')
    expect(feedback.feedback_type).toBe('correction')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 24 — Constants', () => {
  test('DOCUMENT_TYPES has 13 entries with value and label', () => {
    expect(DOCUMENT_TYPES).toHaveLength(13)
    for (const dt of DOCUMENT_TYPES) {
      expect(dt).toHaveProperty('value')
      expect(dt).toHaveProperty('label')
      expect(dt.label.length).toBeGreaterThan(0)
    }
  })

  test('DOCUMENT_TYPES includes all expected values', () => {
    const values = DOCUMENT_TYPES.map((dt) => dt.value)
    expect(values).toContain('invoice')
    expect(values).toContain('receipt')
    expect(values).toContain('lien_waiver')
    expect(values).toContain('change_order')
    expect(values).toContain('purchase_order')
    expect(values).toContain('contract')
    expect(values).toContain('permit')
    expect(values).toContain('inspection_report')
    expect(values).toContain('plan_sheet')
    expect(values).toContain('specification')
    expect(values).toContain('submittal')
    expect(values).toContain('rfi')
    expect(values).toContain('other')
  })

  test('EXTRACTION_STATUSES has 5 entries with value and label', () => {
    expect(EXTRACTION_STATUSES).toHaveLength(5)
    for (const s of EXTRACTION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('QUEUE_STATUSES has 5 entries with value and label', () => {
    expect(QUEUE_STATUSES).toHaveLength(5)
    for (const s of QUEUE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('QUEUE_PRIORITIES has 5 entries with value and label', () => {
    expect(QUEUE_PRIORITIES).toHaveLength(5)
    const values = QUEUE_PRIORITIES.map((p) => p.value)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
    expect(values).toContain(4)
    expect(values).toContain(5)
  })

  test('FEEDBACK_TYPES has 3 entries with value and label', () => {
    expect(FEEDBACK_TYPES).toHaveLength(3)
    const values = FEEDBACK_TYPES.map((f) => f.value)
    expect(values).toContain('correction')
    expect(values).toContain('confirmation')
    expect(values).toContain('rejection')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 24 — Enum Schemas', () => {
  test('documentTypeEnum accepts all 13 document types', () => {
    for (const dt of ['invoice', 'receipt', 'lien_waiver', 'change_order', 'purchase_order', 'contract', 'permit', 'inspection_report', 'plan_sheet', 'specification', 'submittal', 'rfi', 'other']) {
      expect(documentTypeEnum.parse(dt)).toBe(dt)
    }
  })

  test('documentTypeEnum rejects invalid type', () => {
    expect(() => documentTypeEnum.parse('unknown')).toThrow()
    expect(() => documentTypeEnum.parse('photo')).toThrow()
  })

  test('extractionStatusEnum accepts all 5 statuses', () => {
    for (const s of ['pending', 'processing', 'completed', 'failed', 'review_needed']) {
      expect(extractionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('extractionStatusEnum rejects invalid status', () => {
    expect(() => extractionStatusEnum.parse('cancelled')).toThrow()
  })

  test('queueStatusEnum accepts all 5 statuses', () => {
    for (const s of ['queued', 'processing', 'completed', 'failed', 'cancelled']) {
      expect(queueStatusEnum.parse(s)).toBe(s)
    }
  })

  test('queueStatusEnum rejects invalid status', () => {
    expect(() => queueStatusEnum.parse('pending')).toThrow()
  })

  test('queuePriorityEnum accepts 1-5', () => {
    for (const p of [1, 2, 3, 4, 5]) {
      expect(queuePriorityEnum.parse(p)).toBe(p)
    }
  })

  test('queuePriorityEnum rejects invalid priority', () => {
    expect(() => queuePriorityEnum.parse(0)).toThrow()
    expect(() => queuePriorityEnum.parse(6)).toThrow()
  })

  test('feedbackTypeEnum accepts all 3 types', () => {
    for (const f of ['correction', 'confirmation', 'rejection']) {
      expect(feedbackTypeEnum.parse(f)).toBe(f)
    }
  })

  test('feedbackTypeEnum rejects invalid type', () => {
    expect(() => feedbackTypeEnum.parse('suggestion')).toThrow()
  })
})

// ============================================================================
// CRUD Schemas
// ============================================================================

describe('Module 24 — Classification Schemas', () => {
  test('listClassificationsSchema accepts valid params', () => {
    const result = listClassificationsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listClassificationsSchema rejects limit > 100', () => {
    expect(() => listClassificationsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listClassificationsSchema accepts filters', () => {
    const result = listClassificationsSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      classified_type: 'invoice',
      min_confidence: '0.9',
    })
    expect(result.document_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.classified_type).toBe('invoice')
    expect(result.min_confidence).toBe(0.9)
  })

  test('createClassificationSchema accepts valid classification', () => {
    const result = createClassificationSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      classified_type: 'invoice',
      confidence_score: 0.95,
    })
    expect(result.classified_type).toBe('invoice')
    expect(result.confidence_score).toBe(0.95)
    expect(result.metadata).toEqual({})
  })

  test('createClassificationSchema requires document_id, classified_type, confidence_score', () => {
    expect(() => createClassificationSchema.parse({})).toThrow()
    expect(() => createClassificationSchema.parse({ document_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createClassificationSchema rejects confidence_score outside 0-1', () => {
    expect(() => createClassificationSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      classified_type: 'invoice',
      confidence_score: 1.5,
    })).toThrow()
    expect(() => createClassificationSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      classified_type: 'invoice',
      confidence_score: -0.1,
    })).toThrow()
  })
})

describe('Module 24 — Template Schemas', () => {
  test('listTemplatesSchema accepts valid params', () => {
    const result = listTemplatesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listTemplatesSchema accepts filters', () => {
    const result = listTemplatesSchema.parse({
      document_type: 'invoice',
      is_active: 'true',
      q: 'template',
    })
    expect(result.document_type).toBe('invoice')
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('template')
  })

  test('createTemplateSchema accepts valid template', () => {
    const result = createTemplateSchema.parse({
      name: 'Invoice Template',
      document_type: 'invoice',
    })
    expect(result.name).toBe('Invoice Template')
    expect(result.document_type).toBe('invoice')
    expect(result.field_definitions).toEqual([])
    expect(result.is_active).toBe(true)
    expect(result.is_system).toBe(false)
  })

  test('createTemplateSchema requires name and document_type', () => {
    expect(() => createTemplateSchema.parse({})).toThrow()
    expect(() => createTemplateSchema.parse({ name: 'Test' })).toThrow()
  })

  test('createTemplateSchema rejects name > 200 chars', () => {
    expect(() => createTemplateSchema.parse({
      name: 'A'.repeat(201),
      document_type: 'invoice',
    })).toThrow()
  })

  test('updateTemplateSchema accepts partial updates', () => {
    const result = updateTemplateSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.document_type).toBeUndefined()
  })

  test('updateTemplateSchema accepts is_active toggle', () => {
    const result = updateTemplateSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
  })
})

describe('Module 24 — Extraction Schemas', () => {
  test('listExtractionsSchema accepts valid params', () => {
    const result = listExtractionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listExtractionsSchema accepts status filter', () => {
    const result = listExtractionsSchema.parse({ status: 'review_needed' })
    expect(result.status).toBe('review_needed')
  })

  test('createExtractionSchema accepts valid extraction', () => {
    const result = createExtractionSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.document_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('pending')
    expect(result.extracted_data).toEqual({})
  })

  test('createExtractionSchema requires document_id', () => {
    expect(() => createExtractionSchema.parse({})).toThrow()
  })

  test('updateExtractionSchema accepts partial updates', () => {
    const result = updateExtractionSchema.parse({ status: 'completed' })
    expect(result.status).toBe('completed')
    expect(result.extracted_data).toBeUndefined()
  })

  test('updateExtractionSchema accepts reviewed_by and reviewed_at', () => {
    const result = updateExtractionSchema.parse({
      reviewed_by: '550e8400-e29b-41d4-a716-446655440000',
      reviewed_at: '2026-02-01T00:00:00Z',
    })
    expect(result.reviewed_by).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.reviewed_at).toBe('2026-02-01T00:00:00Z')
  })
})

describe('Module 24 — Queue Schemas', () => {
  test('listQueueSchema accepts valid params', () => {
    const result = listQueueSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listQueueSchema accepts status and priority filters', () => {
    const result = listQueueSchema.parse({ status: 'queued', priority: '1' })
    expect(result.status).toBe('queued')
    expect(result.priority).toBe(1)
  })

  test('createQueueItemSchema accepts valid queue item', () => {
    const result = createQueueItemSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.document_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.priority).toBe(3)
    expect(result.max_attempts).toBe(3)
  })

  test('createQueueItemSchema requires document_id', () => {
    expect(() => createQueueItemSchema.parse({})).toThrow()
  })

  test('createQueueItemSchema rejects priority outside 1-5', () => {
    expect(() => createQueueItemSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      priority: 0,
    })).toThrow()
    expect(() => createQueueItemSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      priority: 6,
    })).toThrow()
  })

  test('createQueueItemSchema rejects max_attempts > 10', () => {
    expect(() => createQueueItemSchema.parse({
      document_id: '550e8400-e29b-41d4-a716-446655440000',
      max_attempts: 11,
    })).toThrow()
  })

  test('updateQueueItemSchema accepts partial updates', () => {
    const result = updateQueueItemSchema.parse({ status: 'processing' })
    expect(result.status).toBe('processing')
  })

  test('updateQueueItemSchema accepts error_message', () => {
    const result = updateQueueItemSchema.parse({
      status: 'failed',
      error_message: 'OCR service unavailable',
    })
    expect(result.status).toBe('failed')
    expect(result.error_message).toBe('OCR service unavailable')
  })
})

describe('Module 24 — Feedback Schemas', () => {
  test('listFeedbackSchema accepts valid params', () => {
    const result = listFeedbackSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listFeedbackSchema accepts feedback_type filter', () => {
    const result = listFeedbackSchema.parse({ feedback_type: 'correction' })
    expect(result.feedback_type).toBe('correction')
  })

  test('createFeedbackSchema accepts valid feedback', () => {
    const result = createFeedbackSchema.parse({
      field_name: 'vendor_name',
      original_value: 'Acme',
      corrected_value: 'Acme Corp',
      feedback_type: 'correction',
    })
    expect(result.field_name).toBe('vendor_name')
    expect(result.original_value).toBe('Acme')
    expect(result.corrected_value).toBe('Acme Corp')
    expect(result.feedback_type).toBe('correction')
  })

  test('createFeedbackSchema requires field_name and feedback_type', () => {
    expect(() => createFeedbackSchema.parse({})).toThrow()
    expect(() => createFeedbackSchema.parse({ field_name: 'test' })).toThrow()
  })

  test('createFeedbackSchema allows null values', () => {
    const result = createFeedbackSchema.parse({
      field_name: 'vendor_name',
      original_value: null,
      corrected_value: null,
      feedback_type: 'rejection',
    })
    expect(result.original_value).toBeNull()
    expect(result.corrected_value).toBeNull()
  })

  test('createFeedbackSchema accepts optional extraction_id', () => {
    const result = createFeedbackSchema.parse({
      extraction_id: '550e8400-e29b-41d4-a716-446655440000',
      field_name: 'amount',
      feedback_type: 'confirmation',
    })
    expect(result.extraction_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})
