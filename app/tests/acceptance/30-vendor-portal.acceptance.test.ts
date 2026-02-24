/**
 * Module 30 — Vendor Portal Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 30 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  PortalAccessLevel,
  SubmissionType,
  SubmissionStatus,
  InvitationStatus,
  MessageDirection,
  VendorPortalSettings,
  VendorPortalInvitation,
  VendorPortalAccess,
  VendorSubmission,
  VendorMessage,
} from '@/types/vendor-portal'

import {
  PORTAL_ACCESS_LEVELS,
  SUBMISSION_TYPES,
  SUBMISSION_STATUSES,
  INVITATION_STATUSES,
  MESSAGE_DIRECTIONS,
} from '@/types/vendor-portal'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  portalAccessLevelEnum,
  submissionTypeEnum,
  submissionStatusEnum,
  invitationStatusEnum,
  messageDirectionEnum,
  createSettingsSchema,
  updateSettingsSchema,
  listInvitationsSchema,
  createInvitationSchema,
  updateInvitationSchema,
  revokeInvitationSchema,
  listAccessSchema,
  createAccessSchema,
  updateAccessSchema,
  listSubmissionsSchema,
  createSubmissionSchema,
  updateSubmissionSchema,
  submitSubmissionSchema,
  reviewSubmissionSchema,
  listMessagesSchema,
  createMessageSchema,
  updateMessageSchema,
  markReadSchema,
} from '@/lib/validation/schemas/vendor-portal'

// ============================================================================
// Type System
// ============================================================================

describe('Module 30 — Vendor Portal Types', () => {
  test('PortalAccessLevel has 3 values', () => {
    const levels: PortalAccessLevel[] = ['full', 'limited', 'readonly']
    expect(levels).toHaveLength(3)
  })

  test('SubmissionType has 6 values', () => {
    const types: SubmissionType[] = [
      'invoice', 'lien_waiver', 'insurance_cert', 'w9', 'schedule_update', 'daily_report',
    ]
    expect(types).toHaveLength(6)
  })

  test('SubmissionStatus has 5 values', () => {
    const statuses: SubmissionStatus[] = [
      'draft', 'submitted', 'under_review', 'approved', 'rejected',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('InvitationStatus has 4 values', () => {
    const statuses: InvitationStatus[] = ['pending', 'accepted', 'expired', 'revoked']
    expect(statuses).toHaveLength(4)
  })

  test('MessageDirection has 2 values', () => {
    const directions: MessageDirection[] = ['to_vendor', 'from_vendor']
    expect(directions).toHaveLength(2)
  })

  test('VendorPortalSettings interface has all required fields', () => {
    const settings: VendorPortalSettings = {
      id: '1', company_id: '1', portal_enabled: true,
      allow_self_registration: false, require_approval: true,
      allowed_submission_types: ['invoice', 'lien_waiver'],
      required_compliance_docs: ['insurance_cert', 'w9'],
      auto_approve_submissions: false, portal_welcome_message: null,
      portal_branding: {}, notification_settings: {},
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(settings.portal_enabled).toBe(true)
    expect(settings.require_approval).toBe(true)
  })

  test('VendorPortalInvitation interface has all required fields', () => {
    const inv: VendorPortalInvitation = {
      id: '1', company_id: '1', vendor_id: null,
      vendor_name: 'Acme Electric', contact_name: 'John',
      email: 'john@acme.com', phone: null, message: null,
      status: 'pending', token: 'abc123',
      expires_at: '2026-02-15', accepted_at: null, invited_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(inv.vendor_name).toBe('Acme Electric')
    expect(inv.status).toBe('pending')
  })

  test('VendorPortalAccess interface has all required fields', () => {
    const access: VendorPortalAccess = {
      id: '1', company_id: '1', vendor_id: '1',
      access_level: 'limited',
      can_submit_invoices: true, can_submit_lien_waivers: true,
      can_submit_daily_reports: false, can_view_schedule: true,
      can_view_purchase_orders: true, can_upload_documents: true,
      can_send_messages: true, allowed_job_ids: [],
      granted_by: '1', granted_at: '2026-01-15',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(access.access_level).toBe('limited')
    expect(access.can_submit_invoices).toBe(true)
  })

  test('VendorSubmission interface has all required fields', () => {
    const sub: VendorSubmission = {
      id: '1', company_id: '1', vendor_id: '1', job_id: null,
      submission_type: 'invoice', status: 'draft',
      title: 'Invoice #001', description: null,
      amount: 5000.00, reference_number: 'INV-001',
      file_urls: [], metadata: {},
      rejection_reason: null, submitted_at: null,
      reviewed_at: null, reviewed_by: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(sub.submission_type).toBe('invoice')
    expect(sub.amount).toBe(5000.00)
  })

  test('VendorMessage interface has all required fields', () => {
    const msg: VendorMessage = {
      id: '1', company_id: '1', vendor_id: '1', job_id: null,
      subject: 'Schedule Update', body: 'Running behind by 2 days',
      direction: 'from_vendor', sender_id: '1',
      is_read: false, read_at: null, attachments: [],
      parent_message_id: null,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(msg.direction).toBe('from_vendor')
    expect(msg.is_read).toBe(false)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 30 — Constants', () => {
  test('PORTAL_ACCESS_LEVELS has 3 entries with value and label', () => {
    expect(PORTAL_ACCESS_LEVELS).toHaveLength(3)
    for (const item of PORTAL_ACCESS_LEVELS) {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
      expect(item.label.length).toBeGreaterThan(0)
    }
  })

  test('PORTAL_ACCESS_LEVELS includes all expected values', () => {
    const values = PORTAL_ACCESS_LEVELS.map((p) => p.value)
    expect(values).toContain('full')
    expect(values).toContain('limited')
    expect(values).toContain('readonly')
  })

  test('SUBMISSION_TYPES has 6 entries with value and label', () => {
    expect(SUBMISSION_TYPES).toHaveLength(6)
    for (const item of SUBMISSION_TYPES) {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
      expect(item.label.length).toBeGreaterThan(0)
    }
  })

  test('SUBMISSION_TYPES includes all expected values', () => {
    const values = SUBMISSION_TYPES.map((s) => s.value)
    expect(values).toContain('invoice')
    expect(values).toContain('lien_waiver')
    expect(values).toContain('insurance_cert')
    expect(values).toContain('w9')
    expect(values).toContain('schedule_update')
    expect(values).toContain('daily_report')
  })

  test('SUBMISSION_STATUSES has 5 entries with value and label', () => {
    expect(SUBMISSION_STATUSES).toHaveLength(5)
    for (const item of SUBMISSION_STATUSES) {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
      expect(item.label.length).toBeGreaterThan(0)
    }
  })

  test('INVITATION_STATUSES has 4 entries with value and label', () => {
    expect(INVITATION_STATUSES).toHaveLength(4)
    for (const item of INVITATION_STATUSES) {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
      expect(item.label.length).toBeGreaterThan(0)
    }
  })

  test('INVITATION_STATUSES includes all expected values', () => {
    const values = INVITATION_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('accepted')
    expect(values).toContain('expired')
    expect(values).toContain('revoked')
  })

  test('MESSAGE_DIRECTIONS has 2 entries with value and label', () => {
    expect(MESSAGE_DIRECTIONS).toHaveLength(2)
    for (const item of MESSAGE_DIRECTIONS) {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
      expect(item.label.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 30 — Enum Schemas', () => {
  test('portalAccessLevelEnum accepts all 3 levels', () => {
    for (const level of ['full', 'limited', 'readonly']) {
      expect(portalAccessLevelEnum.parse(level)).toBe(level)
    }
  })

  test('portalAccessLevelEnum rejects invalid level', () => {
    expect(() => portalAccessLevelEnum.parse('admin')).toThrow()
  })

  test('submissionTypeEnum accepts all 6 types', () => {
    for (const t of ['invoice', 'lien_waiver', 'insurance_cert', 'w9', 'schedule_update', 'daily_report']) {
      expect(submissionTypeEnum.parse(t)).toBe(t)
    }
  })

  test('submissionTypeEnum rejects invalid type', () => {
    expect(() => submissionTypeEnum.parse('contract')).toThrow()
  })

  test('submissionStatusEnum accepts all 5 statuses', () => {
    for (const s of ['draft', 'submitted', 'under_review', 'approved', 'rejected']) {
      expect(submissionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('submissionStatusEnum rejects invalid status', () => {
    expect(() => submissionStatusEnum.parse('cancelled')).toThrow()
  })

  test('invitationStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'accepted', 'expired', 'revoked']) {
      expect(invitationStatusEnum.parse(s)).toBe(s)
    }
  })

  test('invitationStatusEnum rejects invalid status', () => {
    expect(() => invitationStatusEnum.parse('cancelled')).toThrow()
  })

  test('messageDirectionEnum accepts both directions', () => {
    for (const d of ['to_vendor', 'from_vendor']) {
      expect(messageDirectionEnum.parse(d)).toBe(d)
    }
  })

  test('messageDirectionEnum rejects invalid direction', () => {
    expect(() => messageDirectionEnum.parse('internal')).toThrow()
  })
})

// ============================================================================
// Settings Schemas
// ============================================================================

describe('Module 30 — Settings Schemas', () => {
  test('createSettingsSchema accepts empty object with defaults', () => {
    const result = createSettingsSchema.parse({})
    expect(result.portal_enabled).toBe(false)
    expect(result.allow_self_registration).toBe(false)
    expect(result.require_approval).toBe(true)
    expect(result.auto_approve_submissions).toBe(false)
    expect(result.allowed_submission_types).toHaveLength(5)
    expect(result.required_compliance_docs).toHaveLength(2)
  })

  test('createSettingsSchema accepts all fields', () => {
    const result = createSettingsSchema.parse({
      portal_enabled: true,
      allow_self_registration: true,
      require_approval: false,
      allowed_submission_types: ['invoice', 'w9'],
      required_compliance_docs: ['insurance_cert'],
      auto_approve_submissions: true,
      portal_welcome_message: 'Welcome!',
    })
    expect(result.portal_enabled).toBe(true)
    expect(result.allow_self_registration).toBe(true)
    expect(result.allowed_submission_types).toHaveLength(2)
  })

  test('updateSettingsSchema accepts partial updates', () => {
    const result = updateSettingsSchema.parse({ portal_enabled: true })
    expect(result.portal_enabled).toBe(true)
    expect(result.require_approval).toBeUndefined()
  })
})

// ============================================================================
// Invitation Schemas
// ============================================================================

describe('Module 30 — Invitation Schemas', () => {
  test('listInvitationsSchema accepts valid params', () => {
    const result = listInvitationsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listInvitationsSchema rejects limit > 100', () => {
    expect(() => listInvitationsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listInvitationsSchema accepts status filter', () => {
    const result = listInvitationsSchema.parse({ status: 'pending' })
    expect(result.status).toBe('pending')
  })

  test('createInvitationSchema accepts valid invitation', () => {
    const result = createInvitationSchema.parse({
      vendor_name: 'Acme Electric',
      email: 'john@acme.com',
    })
    expect(result.vendor_name).toBe('Acme Electric')
    expect(result.email).toBe('john@acme.com')
    expect(result.expires_in_days).toBe(30)
  })

  test('createInvitationSchema requires vendor_name and email', () => {
    expect(() => createInvitationSchema.parse({})).toThrow()
    expect(() => createInvitationSchema.parse({ vendor_name: 'Test' })).toThrow()
    expect(() => createInvitationSchema.parse({ email: 'test@test.com' })).toThrow()
  })

  test('createInvitationSchema rejects vendor_name > 200 chars', () => {
    expect(() => createInvitationSchema.parse({
      vendor_name: 'A'.repeat(201),
      email: 'test@test.com',
    })).toThrow()
  })

  test('createInvitationSchema rejects invalid email', () => {
    expect(() => createInvitationSchema.parse({
      vendor_name: 'Test',
      email: 'not-an-email',
    })).toThrow()
  })

  test('createInvitationSchema accepts expires_in_days', () => {
    const result = createInvitationSchema.parse({
      vendor_name: 'Test',
      email: 'test@test.com',
      expires_in_days: 7,
    })
    expect(result.expires_in_days).toBe(7)
  })

  test('createInvitationSchema rejects expires_in_days > 90', () => {
    expect(() => createInvitationSchema.parse({
      vendor_name: 'Test',
      email: 'test@test.com',
      expires_in_days: 91,
    })).toThrow()
  })

  test('updateInvitationSchema accepts partial updates', () => {
    const result = updateInvitationSchema.parse({ vendor_name: 'Updated Name' })
    expect(result.vendor_name).toBe('Updated Name')
    expect(result.email).toBeUndefined()
  })

  test('revokeInvitationSchema accepts empty object', () => {
    const result = revokeInvitationSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('revokeInvitationSchema accepts notes', () => {
    const result = revokeInvitationSchema.parse({ notes: 'No longer needed' })
    expect(result.notes).toBe('No longer needed')
  })
})

// ============================================================================
// Access Schemas
// ============================================================================

describe('Module 30 — Access Schemas', () => {
  test('listAccessSchema accepts valid params', () => {
    const result = listAccessSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listAccessSchema accepts vendor_id and access_level filters', () => {
    const result = listAccessSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      access_level: 'full',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.access_level).toBe('full')
  })

  test('createAccessSchema requires vendor_id', () => {
    expect(() => createAccessSchema.parse({})).toThrow()
  })

  test('createAccessSchema accepts valid access with defaults', () => {
    const result = createAccessSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.access_level).toBe('limited')
    expect(result.can_submit_invoices).toBe(true)
    expect(result.can_submit_lien_waivers).toBe(true)
    expect(result.can_submit_daily_reports).toBe(false)
    expect(result.can_view_schedule).toBe(true)
    expect(result.can_view_purchase_orders).toBe(true)
    expect(result.can_upload_documents).toBe(true)
    expect(result.can_send_messages).toBe(true)
    expect(result.allowed_job_ids).toEqual([])
  })

  test('createAccessSchema accepts full access configuration', () => {
    const result = createAccessSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      access_level: 'full',
      can_submit_invoices: true,
      can_submit_daily_reports: true,
      allowed_job_ids: ['550e8400-e29b-41d4-a716-446655440001'],
    })
    expect(result.access_level).toBe('full')
    expect(result.can_submit_daily_reports).toBe(true)
    expect(result.allowed_job_ids).toHaveLength(1)
  })

  test('updateAccessSchema accepts partial updates', () => {
    const result = updateAccessSchema.parse({
      access_level: 'readonly',
      can_submit_invoices: false,
    })
    expect(result.access_level).toBe('readonly')
    expect(result.can_submit_invoices).toBe(false)
    expect(result.can_view_schedule).toBeUndefined()
  })
})

// ============================================================================
// Submission Schemas
// ============================================================================

describe('Module 30 — Submission Schemas', () => {
  test('listSubmissionsSchema accepts valid params', () => {
    const result = listSubmissionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listSubmissionsSchema rejects limit > 100', () => {
    expect(() => listSubmissionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listSubmissionsSchema accepts all filters', () => {
    const result = listSubmissionsSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      submission_type: 'invoice',
      status: 'submitted',
      q: 'test',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.submission_type).toBe('invoice')
    expect(result.status).toBe('submitted')
  })

  test('createSubmissionSchema accepts valid submission', () => {
    const result = createSubmissionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      submission_type: 'invoice',
      title: 'January Invoice',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.submission_type).toBe('invoice')
    expect(result.title).toBe('January Invoice')
    expect(result.status).toBe('draft')
    expect(result.file_urls).toEqual([])
    expect(result.metadata).toEqual({})
  })

  test('createSubmissionSchema requires vendor_id, submission_type, and title', () => {
    expect(() => createSubmissionSchema.parse({})).toThrow()
    expect(() => createSubmissionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createSubmissionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      submission_type: 'invoice',
    })).toThrow()
  })

  test('createSubmissionSchema rejects title > 255 chars', () => {
    expect(() => createSubmissionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      submission_type: 'invoice',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createSubmissionSchema rejects negative amount', () => {
    expect(() => createSubmissionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      submission_type: 'invoice',
      title: 'Test',
      amount: -100,
    })).toThrow()
  })

  test('createSubmissionSchema accepts all optional fields', () => {
    const result = createSubmissionSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      submission_type: 'lien_waiver',
      title: 'Progress Lien Waiver',
      description: 'For January work',
      amount: 15000.00,
      reference_number: 'LW-001',
      file_urls: ['https://example.com/doc.pdf'],
      metadata: { period: 'january' },
    })
    expect(result.amount).toBe(15000.00)
    expect(result.reference_number).toBe('LW-001')
    expect(result.file_urls).toHaveLength(1)
  })

  test('updateSubmissionSchema accepts partial updates', () => {
    const result = updateSubmissionSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
    expect(result.amount).toBeUndefined()
  })

  test('submitSubmissionSchema accepts empty object', () => {
    const result = submitSubmissionSchema.parse({})
    expect(result.notes).toBeUndefined()
  })

  test('submitSubmissionSchema accepts notes', () => {
    const result = submitSubmissionSchema.parse({ notes: 'Ready for review' })
    expect(result.notes).toBe('Ready for review')
  })

  test('reviewSubmissionSchema requires status', () => {
    expect(() => reviewSubmissionSchema.parse({})).toThrow()
  })

  test('reviewSubmissionSchema accepts approved', () => {
    const result = reviewSubmissionSchema.parse({ status: 'approved' })
    expect(result.status).toBe('approved')
  })

  test('reviewSubmissionSchema accepts rejected with reason', () => {
    const result = reviewSubmissionSchema.parse({
      status: 'rejected',
      rejection_reason: 'Incorrect amount',
    })
    expect(result.status).toBe('rejected')
    expect(result.rejection_reason).toBe('Incorrect amount')
  })

  test('reviewSubmissionSchema rejects invalid status', () => {
    expect(() => reviewSubmissionSchema.parse({ status: 'draft' })).toThrow()
    expect(() => reviewSubmissionSchema.parse({ status: 'submitted' })).toThrow()
  })
})

// ============================================================================
// Message Schemas
// ============================================================================

describe('Module 30 — Message Schemas', () => {
  test('listMessagesSchema accepts valid params', () => {
    const result = listMessagesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMessagesSchema rejects limit > 100', () => {
    expect(() => listMessagesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listMessagesSchema accepts all filters', () => {
    const result = listMessagesSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      direction: 'to_vendor',
      is_read: 'false',
      q: 'schedule',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.direction).toBe('to_vendor')
    expect(result.is_read).toBe(false)
    expect(result.q).toBe('schedule')
  })

  test('createMessageSchema accepts valid message', () => {
    const result = createMessageSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      subject: 'Schedule Update',
      body: 'Please update your schedule for next week.',
    })
    expect(result.vendor_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.subject).toBe('Schedule Update')
    expect(result.direction).toBe('to_vendor')
    expect(result.attachments).toEqual([])
  })

  test('createMessageSchema requires vendor_id, subject, and body', () => {
    expect(() => createMessageSchema.parse({})).toThrow()
    expect(() => createMessageSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createMessageSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      subject: 'Test',
    })).toThrow()
  })

  test('createMessageSchema rejects subject > 255 chars', () => {
    expect(() => createMessageSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      subject: 'A'.repeat(256),
      body: 'Test body',
    })).toThrow()
  })

  test('createMessageSchema accepts parent_message_id for threading', () => {
    const result = createMessageSchema.parse({
      vendor_id: '550e8400-e29b-41d4-a716-446655440000',
      subject: 'Re: Schedule Update',
      body: 'Updated schedule attached.',
      parent_message_id: '550e8400-e29b-41d4-a716-446655440099',
      direction: 'from_vendor',
    })
    expect(result.parent_message_id).toBe('550e8400-e29b-41d4-a716-446655440099')
    expect(result.direction).toBe('from_vendor')
  })

  test('updateMessageSchema accepts partial updates', () => {
    const result = updateMessageSchema.parse({ is_read: true })
    expect(result.is_read).toBe(true)
    expect(result.subject).toBeUndefined()
  })

  test('markReadSchema accepts empty object', () => {
    const result = markReadSchema.parse({})
    expect(result.notes).toBeUndefined()
  })
})
