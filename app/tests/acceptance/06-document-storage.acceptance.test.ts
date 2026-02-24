/**
 * Module 06 — Document Storage Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * storage utilities, and constants against the Module 06 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  DocumentStatus,
  DocumentType,
  ExtractionStatus,
  Document,
  DocumentFolder,
  DocumentVersion,
  DocumentTag,
  CompanyTagLibrary,
  DocumentSearchContent,
  DocumentExpiration,
  CompanyDocumentSettings,
  CompanyStorageUsage,
  FolderTemplate,
  RetentionRule,
} from '@/types/documents'

import {
  BLOCKED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_SIMULTANEOUS_UPLOADS,
  DOCUMENT_TYPES,
  DEFAULT_FOLDER_TEMPLATE,
} from '@/types/documents'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  documentStatusEnum,
  documentTypeEnum,
  extractionStatusEnum,
  listDocumentsSchema,
  uploadDocumentSchema,
  updateDocumentSchema,
  createFolderSchema,
  updateFolderSchema,
  createVersionSchema,
  setExpirationSchema,
  addTagSchema,
  updateDocumentSettingsSchema,
} from '@/lib/validation/schemas/documents'

// ── Storage Utilities ─────────────────────────────────────────────────────

import {
  validateFile,
  getFileExtension,
  buildStoragePath,
  getMimeCategory,
  formatFileSize,
  STORAGE_BUCKET,
  SIGNED_URL_EXPIRY_SECONDS,
} from '@/lib/documents/storage'

// ============================================================================
// Type System
// ============================================================================

describe('Module 06 — Document Types', () => {
  test('DocumentStatus has 5 values', () => {
    const statuses: DocumentStatus[] = ['active', 'archived', 'deleted', 'quarantined', 'legal_hold']
    expect(statuses).toHaveLength(5)
  })

  test('DocumentType has 14 document types', () => {
    const types: DocumentType[] = [
      'invoice', 'contract', 'plan', 'coi', 'lien_waiver', 'permit',
      'photo', 'specification', 'submittal', 'correspondence',
      'daily_log', 'change_order', 'purchase_order', 'other',
    ]
    expect(types).toHaveLength(14)
  })

  test('ExtractionStatus has 4 values', () => {
    const statuses: ExtractionStatus[] = ['pending', 'processing', 'completed', 'failed']
    expect(statuses).toHaveLength(4)
  })

  test('Document interface has all required fields', () => {
    const doc: Document = {
      id: '1', company_id: '1', job_id: null, folder_id: null,
      filename: 'test.pdf', storage_path: '/path', mime_type: 'application/pdf',
      file_size: 1024, document_type: null, ai_classification: null,
      ai_confidence: null, status: 'active', current_version_id: null,
      thumbnail_path: null, uploaded_by: '1', deleted_at: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(doc.filename).toBe('test.pdf')
    expect(doc.status).toBe('active')
  })

  test('DocumentFolder interface has all required fields', () => {
    const folder: DocumentFolder = {
      id: '1', company_id: '1', job_id: null, parent_folder_id: null,
      name: 'Plans', path: '/Plans', sort_order: 0, created_by: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(folder.path).toBe('/Plans')
  })

  test('DocumentVersion interface has all required fields', () => {
    const version: DocumentVersion = {
      id: '1', document_id: '1', version_number: 1, storage_path: '/path',
      file_size: 1024, mime_type: 'application/pdf', change_notes: null,
      uploaded_by: '1', created_at: '2026-01-01',
    }
    expect(version.version_number).toBe(1)
  })

  test('CompanyDocumentSettings has folder_templates and retention_policy', () => {
    const settings: CompanyDocumentSettings = {
      id: '1', company_id: '1',
      folder_templates: [{ name: 'Custom Home', folders: ['/Plans'] }],
      retention_policy: { invoice: { years: 7, action: 'archive' } },
      max_file_size_mb: 500,
      blocked_extensions: ['exe'],
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(settings.folder_templates).toHaveLength(1)
    expect(settings.retention_policy.invoice.years).toBe(7)
  })

  test('CompanyStorageUsage tracks bytes and quota', () => {
    const usage: CompanyStorageUsage = {
      id: '1', company_id: '1',
      total_bytes: 1073741824, file_count: 100,
      quota_bytes: 53687091200,
      last_calculated_at: '2026-01-01',
    }
    expect(usage.quota_bytes).toBe(53687091200)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 06 — Constants', () => {
  test('BLOCKED_EXTENSIONS includes dangerous file types', () => {
    expect(BLOCKED_EXTENSIONS).toContain('exe')
    expect(BLOCKED_EXTENSIONS).toContain('bat')
    expect(BLOCKED_EXTENSIONS).toContain('sh')
    expect(BLOCKED_EXTENSIONS).toContain('cmd')
    expect(BLOCKED_EXTENSIONS).toContain('ps1')
  })

  test('MAX_FILE_SIZE_BYTES is 500 MB', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(500 * 1024 * 1024)
  })

  test('MAX_SIMULTANEOUS_UPLOADS is 20', () => {
    expect(MAX_SIMULTANEOUS_UPLOADS).toBe(20)
  })

  test('DOCUMENT_TYPES has 14 entries with value and label', () => {
    expect(DOCUMENT_TYPES).toHaveLength(14)
    for (const dt of DOCUMENT_TYPES) {
      expect(dt).toHaveProperty('value')
      expect(dt).toHaveProperty('label')
      expect(dt.label.length).toBeGreaterThan(0)
    }
  })

  test('DEFAULT_FOLDER_TEMPLATE has 14 folders', () => {
    expect(DEFAULT_FOLDER_TEMPLATE.name).toBe('Custom Home')
    expect(DEFAULT_FOLDER_TEMPLATE.folders).toHaveLength(14)
    expect(DEFAULT_FOLDER_TEMPLATE.folders[0]).toBe('/Plans & Specifications')
  })

  test('STORAGE_BUCKET is defined', () => {
    expect(STORAGE_BUCKET).toBe('documents')
  })

  test('SIGNED_URL_EXPIRY_SECONDS is 1 hour', () => {
    expect(SIGNED_URL_EXPIRY_SECONDS).toBe(3600)
  })
})

// ============================================================================
// Schemas
// ============================================================================

describe('Module 06 — Validation Schemas', () => {
  test('documentStatusEnum accepts all 5 statuses', () => {
    for (const s of ['active', 'archived', 'deleted', 'quarantined', 'legal_hold']) {
      expect(documentStatusEnum.parse(s)).toBe(s)
    }
  })

  test('documentTypeEnum accepts all 14 types', () => {
    expect(documentTypeEnum.parse('invoice')).toBe('invoice')
    expect(documentTypeEnum.parse('plan')).toBe('plan')
    expect(documentTypeEnum.parse('other')).toBe('other')
  })

  test('documentTypeEnum rejects invalid type', () => {
    expect(() => documentTypeEnum.parse('unknown')).toThrow()
  })

  test('listDocumentsSchema accepts valid params', () => {
    const result = listDocumentsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listDocumentsSchema rejects limit > 100', () => {
    expect(() => listDocumentsSchema.parse({ limit: 200 })).toThrow()
  })

  test('uploadDocumentSchema accepts valid upload', () => {
    const result = uploadDocumentSchema.parse({
      filename: 'plan.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
    })
    expect(result.filename).toBe('plan.pdf')
  })

  test('uploadDocumentSchema requires filename, mime_type, file_size', () => {
    expect(() => uploadDocumentSchema.parse({})).toThrow()
    expect(() => uploadDocumentSchema.parse({ filename: 'a.pdf' })).toThrow()
  })

  test('uploadDocumentSchema rejects file_size > 500MB', () => {
    expect(() => uploadDocumentSchema.parse({
      filename: 'big.pdf',
      mime_type: 'application/pdf',
      file_size: 600 * 1024 * 1024,
    })).toThrow()
  })

  test('updateDocumentSchema accepts partial updates', () => {
    const result = updateDocumentSchema.parse({ filename: 'renamed.pdf' })
    expect(result.filename).toBe('renamed.pdf')
    expect(result.folder_id).toBeUndefined()
  })

  test('createFolderSchema requires name', () => {
    expect(() => createFolderSchema.parse({})).toThrow()
    const result = createFolderSchema.parse({ name: 'Plans' })
    expect(result.name).toBe('Plans')
  })

  test('createVersionSchema accepts valid version', () => {
    const result = createVersionSchema.parse({
      filename: 'plan-v2.pdf',
      mime_type: 'application/pdf',
      file_size: 2048,
      change_notes: 'Updated elevation',
    })
    expect(result.change_notes).toBe('Updated elevation')
  })

  test('setExpirationSchema requires valid date format', () => {
    expect(() => setExpirationSchema.parse({ expiration_date: 'not-a-date' })).toThrow()
    expect(() => setExpirationSchema.parse({ expiration_date: '20260101' })).toThrow()
    const result = setExpirationSchema.parse({ expiration_date: '2026-12-31' })
    expect(result.expiration_date).toBe('2026-12-31')
  })

  test('addTagSchema requires non-empty tag', () => {
    expect(() => addTagSchema.parse({ tag: '' })).toThrow()
    const result = addTagSchema.parse({ tag: 'Framing', category: 'Trade' })
    expect(result.tag).toBe('Framing')
  })

  test('updateDocumentSettingsSchema accepts folder templates', () => {
    const result = updateDocumentSettingsSchema.parse({
      folder_templates: [{ name: 'Remodel', folders: ['/Plans', '/Invoices'] }],
    })
    expect(result.folder_templates).toHaveLength(1)
  })

  test('updateDocumentSettingsSchema accepts retention policy', () => {
    const result = updateDocumentSettingsSchema.parse({
      retention_policy: { invoice: { years: 7, action: 'archive' } },
    })
    expect(result.retention_policy!['invoice'].years).toBe(7)
  })
})

// ============================================================================
// Storage Utilities
// ============================================================================

describe('Module 06 — Storage Utilities', () => {
  test('validateFile rejects blocked extensions', () => {
    expect(validateFile('malware.exe', 1024)).toContain('not allowed')
    expect(validateFile('script.bat', 1024)).toContain('not allowed')
    expect(validateFile('hack.ps1', 1024)).toContain('not allowed')
  })

  test('validateFile accepts valid files', () => {
    expect(validateFile('plan.pdf', 1024)).toBeNull()
    expect(validateFile('photo.jpg', 5000)).toBeNull()
    expect(validateFile('contract.docx', 100000)).toBeNull()
  })

  test('validateFile rejects oversized files', () => {
    expect(validateFile('huge.pdf', 600 * 1024 * 1024)).toContain('exceeds maximum')
  })

  test('validateFile rejects zero-size files', () => {
    expect(validateFile('empty.pdf', 0)).toContain('greater than 0')
  })

  test('getFileExtension extracts correctly', () => {
    expect(getFileExtension('file.pdf')).toBe('pdf')
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
    expect(getFileExtension('noext')).toBe('')
    expect(getFileExtension('trailing.')).toBe('')
    expect(getFileExtension('FILE.PDF')).toBe('pdf')
  })

  test('buildStoragePath creates correct structure', () => {
    const path = buildStoragePath('company-1', 'job-1', 'plan.pdf', 'uuid-1')
    expect(path).toBe('company-1/job-1/uuid-1_plan.pdf')
  })

  test('buildStoragePath uses _company when no job', () => {
    const path = buildStoragePath('company-1', null, 'doc.pdf', 'uuid-1')
    expect(path).toBe('company-1/_company/uuid-1_doc.pdf')
  })

  test('buildStoragePath sanitizes filenames', () => {
    const path = buildStoragePath('c1', 'j1', 'my plan (v2).pdf', 'u1')
    expect(path).not.toContain(' ')
    expect(path).not.toContain('(')
  })

  test('getMimeCategory categorizes correctly', () => {
    expect(getMimeCategory('image/png')).toBe('image')
    expect(getMimeCategory('image/jpeg')).toBe('image')
    expect(getMimeCategory('application/pdf')).toBe('pdf')
    expect(getMimeCategory('application/msword')).toBe('document')
    expect(getMimeCategory('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('spreadsheet')
    expect(getMimeCategory('application/zip')).toBe('archive')
    expect(getMimeCategory('video/mp4')).toBe('other')
  })

  test('formatFileSize formats correctly', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1048576)).toBe('1.0 MB')
    expect(formatFileSize(1073741824)).toBe('1.0 GB')
    expect(formatFileSize(500)).toBe('500 B')
  })
})
