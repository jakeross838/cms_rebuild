/**
 * Module 29 — Full Client Portal Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 29 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ApprovalStatus,
  ApprovalType,
  MessageStatus,
  MessageSenderType,
  MessageCategory,
  ExternalChannel,
  InvitationStatus,
  PaymentStatus,
  PaymentMethod,
  ClientPortalSettings,
  ClientPortalInvitation,
  ClientApproval,
  ClientMessage,
  ClientPayment,
} from '@/types/client-portal'

import {
  APPROVAL_STATUSES,
  APPROVAL_TYPES,
  MESSAGE_STATUSES,
  MESSAGE_SENDER_TYPES,
  MESSAGE_CATEGORIES,
  EXTERNAL_CHANNELS,
  INVITATION_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from '@/types/client-portal'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  approvalStatusEnum,
  approvalTypeEnum,
  messageStatusEnum,
  messageSenderTypeEnum,
  messageCategoryEnum,
  externalChannelEnum,
  invitationStatusEnum,
  paymentStatusEnum,
  paymentMethodEnum,
  updateClientPortalSettingsSchema,
  listClientInvitationsSchema,
  createClientInvitationSchema,
  updateClientInvitationSchema,
  listClientApprovalsSchema,
  createClientApprovalSchema,
  updateClientApprovalSchema,
  listClientMessagesSchema,
  createClientMessageSchema,
  updateClientMessageSchema,
  listClientPaymentsSchema,
  createClientPaymentSchema,
} from '@/lib/validation/schemas/client-portal'

// ============================================================================
// Type System
// ============================================================================

describe('Module 29 — Full Client Portal Types', () => {
  test('ApprovalStatus has 4 values', () => {
    const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected', 'expired']
    expect(statuses).toHaveLength(4)
  })

  test('ApprovalType has 5 values', () => {
    const types: ApprovalType[] = ['selection', 'change_order', 'draw', 'invoice', 'schedule']
    expect(types).toHaveLength(5)
  })

  test('MessageStatus has 3 values', () => {
    const statuses: MessageStatus[] = ['sent', 'read', 'archived']
    expect(statuses).toHaveLength(3)
  })

  test('MessageSenderType has 2 values', () => {
    const types: MessageSenderType[] = ['client', 'builder_team']
    expect(types).toHaveLength(2)
  })

  test('MessageCategory has 7 values', () => {
    const cats: MessageCategory[] = [
      'general', 'selections', 'change_orders', 'schedule', 'budget', 'warranty', 'other',
    ]
    expect(cats).toHaveLength(7)
  })

  test('ExternalChannel has 3 values', () => {
    const channels: ExternalChannel[] = ['phone', 'text', 'email']
    expect(channels).toHaveLength(3)
  })

  test('InvitationStatus has 4 values', () => {
    const statuses: InvitationStatus[] = ['pending', 'accepted', 'expired', 'revoked']
    expect(statuses).toHaveLength(4)
  })

  test('PaymentStatus has 5 values', () => {
    const statuses: PaymentStatus[] = ['pending', 'processing', 'completed', 'failed', 'refunded']
    expect(statuses).toHaveLength(5)
  })

  test('PaymentMethod has 5 values', () => {
    const methods: PaymentMethod[] = ['credit_card', 'ach', 'check', 'wire', 'other']
    expect(methods).toHaveLength(5)
  })

  test('ClientPortalSettings interface has all required fields', () => {
    const settings: ClientPortalSettings = {
      id: '1', company_id: '1',
      branding: { logo_url: 'https://example.com/logo.png', primary_color: '#1a1a2e' },
      custom_domain: null,
      feature_flags: { show_budget: true },
      visibility_rules: {},
      notification_rules: {},
      approval_config: {},
      email_templates: {},
      footer_text: null,
      privacy_policy_url: null,
      terms_of_service_url: null,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(settings.company_id).toBe('1')
    expect(settings.branding).toHaveProperty('logo_url')
  })

  test('ClientPortalInvitation interface has all required fields', () => {
    const inv: ClientPortalInvitation = {
      id: '1', company_id: '1', job_id: '1',
      email: 'client@example.com', client_name: 'John Doe',
      role: 'client', status: 'pending',
      token: 'abc123', invited_by: '1',
      accepted_at: null, accepted_by: null,
      expires_at: '2026-02-01', message: null,
      created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(inv.email).toBe('client@example.com')
    expect(inv.status).toBe('pending')
  })

  test('ClientApproval interface has all required fields', () => {
    const approval: ClientApproval = {
      id: '1', company_id: '1', job_id: '1',
      client_user_id: '1', approval_type: 'selection',
      reference_id: '1', title: 'Countertop Selection',
      description: 'Approve countertop material', status: 'pending',
      requested_at: '2026-01-15', responded_at: null,
      expires_at: null, signature_data: null,
      signature_ip: null, signature_hash: null,
      comments: null, requested_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(approval.approval_type).toBe('selection')
    expect(approval.status).toBe('pending')
    expect(approval.title).toBe('Countertop Selection')
  })

  test('ClientMessage interface has all required fields', () => {
    const msg: ClientMessage = {
      id: '1', company_id: '1', job_id: '1',
      sender_user_id: '1', sender_type: 'client',
      subject: 'Question about flooring',
      message_text: 'When will the flooring be installed?',
      thread_id: null, topic: null,
      category: 'general', attachments: [],
      is_external_log: false, external_channel: null,
      read_at: null, status: 'sent',
      created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(msg.sender_type).toBe('client')
    expect(msg.status).toBe('sent')
    expect(msg.message_text).toContain('flooring')
  })

  test('ClientPayment interface has all required fields', () => {
    const payment: ClientPayment = {
      id: '1', company_id: '1', job_id: '1',
      client_user_id: '1', payment_number: 'PAY-001',
      amount: 50000.00, payment_method: 'check',
      status: 'completed', reference_number: 'CHK-1234',
      description: 'Draw 3 payment', draw_request_id: '1',
      invoice_id: null, payment_date: '2026-01-20',
      received_at: '2026-01-21', received_by: '1',
      notes: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(payment.amount).toBe(50000.00)
    expect(payment.payment_method).toBe('check')
    expect(payment.status).toBe('completed')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 29 — Constants', () => {
  test('APPROVAL_STATUSES has 4 entries with value and label', () => {
    expect(APPROVAL_STATUSES).toHaveLength(4)
    for (const s of APPROVAL_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('APPROVAL_STATUSES includes all expected values', () => {
    const values = APPROVAL_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('approved')
    expect(values).toContain('rejected')
    expect(values).toContain('expired')
  })

  test('APPROVAL_TYPES has 5 entries with value and label', () => {
    expect(APPROVAL_TYPES).toHaveLength(5)
    for (const t of APPROVAL_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    }
  })

  test('MESSAGE_STATUSES has 3 entries with value and label', () => {
    expect(MESSAGE_STATUSES).toHaveLength(3)
    for (const s of MESSAGE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('MESSAGE_SENDER_TYPES has 2 entries', () => {
    expect(MESSAGE_SENDER_TYPES).toHaveLength(2)
    const values = MESSAGE_SENDER_TYPES.map((t) => t.value)
    expect(values).toContain('client')
    expect(values).toContain('builder_team')
  })

  test('MESSAGE_CATEGORIES has 7 entries', () => {
    expect(MESSAGE_CATEGORIES).toHaveLength(7)
    const values = MESSAGE_CATEGORIES.map((c) => c.value)
    expect(values).toContain('general')
    expect(values).toContain('selections')
    expect(values).toContain('change_orders')
    expect(values).toContain('warranty')
  })

  test('EXTERNAL_CHANNELS has 3 entries', () => {
    expect(EXTERNAL_CHANNELS).toHaveLength(3)
    const values = EXTERNAL_CHANNELS.map((c) => c.value)
    expect(values).toContain('phone')
    expect(values).toContain('text')
    expect(values).toContain('email')
  })

  test('INVITATION_STATUSES has 4 entries with value and label', () => {
    expect(INVITATION_STATUSES).toHaveLength(4)
    for (const s of INVITATION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('PAYMENT_STATUSES has 5 entries with value and label', () => {
    expect(PAYMENT_STATUSES).toHaveLength(5)
    for (const s of PAYMENT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('PAYMENT_METHODS has 5 entries with value and label', () => {
    expect(PAYMENT_METHODS).toHaveLength(5)
    for (const m of PAYMENT_METHODS) {
      expect(m).toHaveProperty('value')
      expect(m).toHaveProperty('label')
    }
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 29 — Enum Schemas', () => {
  test('approvalStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'approved', 'rejected', 'expired']) {
      expect(approvalStatusEnum.parse(s)).toBe(s)
    }
  })

  test('approvalStatusEnum rejects invalid status', () => {
    expect(() => approvalStatusEnum.parse('cancelled')).toThrow()
  })

  test('approvalTypeEnum accepts all 5 types', () => {
    for (const t of ['selection', 'change_order', 'draw', 'invoice', 'schedule']) {
      expect(approvalTypeEnum.parse(t)).toBe(t)
    }
  })

  test('approvalTypeEnum rejects invalid type', () => {
    expect(() => approvalTypeEnum.parse('warranty')).toThrow()
  })

  test('messageStatusEnum accepts all 3 statuses', () => {
    for (const s of ['sent', 'read', 'archived']) {
      expect(messageStatusEnum.parse(s)).toBe(s)
    }
  })

  test('messageStatusEnum rejects invalid status', () => {
    expect(() => messageStatusEnum.parse('deleted')).toThrow()
  })

  test('messageSenderTypeEnum accepts all 2 types', () => {
    for (const t of ['client', 'builder_team']) {
      expect(messageSenderTypeEnum.parse(t)).toBe(t)
    }
  })

  test('messageCategoryEnum accepts all 7 categories', () => {
    for (const c of ['general', 'selections', 'change_orders', 'schedule', 'budget', 'warranty', 'other']) {
      expect(messageCategoryEnum.parse(c)).toBe(c)
    }
  })

  test('messageCategoryEnum rejects invalid category', () => {
    expect(() => messageCategoryEnum.parse('invoices')).toThrow()
  })

  test('externalChannelEnum accepts all 3 channels', () => {
    for (const c of ['phone', 'text', 'email']) {
      expect(externalChannelEnum.parse(c)).toBe(c)
    }
  })

  test('invitationStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'accepted', 'expired', 'revoked']) {
      expect(invitationStatusEnum.parse(s)).toBe(s)
    }
  })

  test('invitationStatusEnum rejects invalid status', () => {
    expect(() => invitationStatusEnum.parse('cancelled')).toThrow()
  })

  test('paymentStatusEnum accepts all 5 statuses', () => {
    for (const s of ['pending', 'processing', 'completed', 'failed', 'refunded']) {
      expect(paymentStatusEnum.parse(s)).toBe(s)
    }
  })

  test('paymentStatusEnum rejects invalid status', () => {
    expect(() => paymentStatusEnum.parse('cancelled')).toThrow()
  })

  test('paymentMethodEnum accepts all 5 methods', () => {
    for (const m of ['credit_card', 'ach', 'check', 'wire', 'other']) {
      expect(paymentMethodEnum.parse(m)).toBe(m)
    }
  })

  test('paymentMethodEnum rejects invalid method', () => {
    expect(() => paymentMethodEnum.parse('bitcoin')).toThrow()
  })
})

// ============================================================================
// Settings Schema
// ============================================================================

describe('Module 29 — Settings Schema', () => {
  test('updateClientPortalSettingsSchema accepts valid settings', () => {
    const result = updateClientPortalSettingsSchema.parse({
      branding: { logo_url: 'https://example.com/logo.png', primary_color: '#ff5500' },
      custom_domain: 'portal.builderco.com',
      feature_flags: { show_budget: true, show_schedule: true },
    })
    expect(result.branding).toHaveProperty('logo_url')
    expect(result.custom_domain).toBe('portal.builderco.com')
  })

  test('updateClientPortalSettingsSchema accepts empty object', () => {
    const result = updateClientPortalSettingsSchema.parse({})
    expect(result.branding).toBeUndefined()
  })

  test('updateClientPortalSettingsSchema accepts null custom_domain', () => {
    const result = updateClientPortalSettingsSchema.parse({ custom_domain: null })
    expect(result.custom_domain).toBeNull()
  })

  test('updateClientPortalSettingsSchema rejects custom_domain > 200 chars', () => {
    expect(() => updateClientPortalSettingsSchema.parse({
      custom_domain: 'a'.repeat(201),
    })).toThrow()
  })
})

// ============================================================================
// Invitation Schemas
// ============================================================================

describe('Module 29 — Invitation Schemas', () => {
  test('listClientInvitationsSchema accepts valid params', () => {
    const result = listClientInvitationsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listClientInvitationsSchema rejects limit > 100', () => {
    expect(() => listClientInvitationsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listClientInvitationsSchema accepts filters', () => {
    const result = listClientInvitationsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'pending',
      q: 'john',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('pending')
    expect(result.q).toBe('john')
  })

  test('createClientInvitationSchema accepts valid invitation', () => {
    const result = createClientInvitationSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'client@example.com',
      client_name: 'Jane Doe',
    })
    expect(result.email).toBe('client@example.com')
    expect(result.client_name).toBe('Jane Doe')
    expect(result.role).toBe('client')
    expect(result.expires_in_days).toBe(7)
  })

  test('createClientInvitationSchema requires job_id and email', () => {
    expect(() => createClientInvitationSchema.parse({})).toThrow()
    expect(() => createClientInvitationSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createClientInvitationSchema rejects invalid email', () => {
    expect(() => createClientInvitationSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'not-an-email',
    })).toThrow()
  })

  test('createClientInvitationSchema accepts expires_in_days 1-90', () => {
    const result = createClientInvitationSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'client@example.com',
      expires_in_days: 30,
    })
    expect(result.expires_in_days).toBe(30)
  })

  test('createClientInvitationSchema rejects expires_in_days > 90', () => {
    expect(() => createClientInvitationSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'client@example.com',
      expires_in_days: 91,
    })).toThrow()
  })

  test('updateClientInvitationSchema accepts partial updates', () => {
    const result = updateClientInvitationSchema.parse({ status: 'accepted' })
    expect(result.status).toBe('accepted')
    expect(result.client_name).toBeUndefined()
  })
})

// ============================================================================
// Approval Schemas
// ============================================================================

describe('Module 29 — Approval Schemas', () => {
  test('listClientApprovalsSchema accepts valid params', () => {
    const result = listClientApprovalsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listClientApprovalsSchema rejects limit > 100', () => {
    expect(() => listClientApprovalsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listClientApprovalsSchema accepts all filters', () => {
    const result = listClientApprovalsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'pending',
      approval_type: 'selection',
      client_user_id: '550e8400-e29b-41d4-a716-446655440000',
      q: 'countertop',
    })
    expect(result.status).toBe('pending')
    expect(result.approval_type).toBe('selection')
    expect(result.q).toBe('countertop')
  })

  test('createClientApprovalSchema accepts valid approval', () => {
    const result = createClientApprovalSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_user_id: '550e8400-e29b-41d4-a716-446655440000',
      approval_type: 'change_order',
      reference_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'CO-001: Add outlet to kitchen',
    })
    expect(result.approval_type).toBe('change_order')
    expect(result.title).toBe('CO-001: Add outlet to kitchen')
  })

  test('createClientApprovalSchema requires all mandatory fields', () => {
    expect(() => createClientApprovalSchema.parse({})).toThrow()
    expect(() => createClientApprovalSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createClientApprovalSchema rejects title > 255 chars', () => {
    expect(() => createClientApprovalSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_user_id: '550e8400-e29b-41d4-a716-446655440000',
      approval_type: 'selection',
      reference_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createClientApprovalSchema validates expires_at date format', () => {
    const result = createClientApprovalSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_user_id: '550e8400-e29b-41d4-a716-446655440000',
      approval_type: 'draw',
      reference_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Draw Request #3',
      expires_at: '2026-03-01',
    })
    expect(result.expires_at).toBe('2026-03-01')
  })

  test('createClientApprovalSchema rejects invalid expires_at format', () => {
    expect(() => createClientApprovalSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_user_id: '550e8400-e29b-41d4-a716-446655440000',
      approval_type: 'draw',
      reference_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Draw Request #3',
      expires_at: '03/01/2026',
    })).toThrow()
  })

  test('updateClientApprovalSchema accepts approve with signature', () => {
    const result = updateClientApprovalSchema.parse({
      status: 'approved',
      comments: 'Looks good',
      signature_data: 'base64-signature-data',
      signature_ip: '192.168.1.1',
      signature_hash: 'abc123def456',
    })
    expect(result.status).toBe('approved')
    expect(result.comments).toBe('Looks good')
    expect(result.signature_data).toBe('base64-signature-data')
  })

  test('updateClientApprovalSchema accepts reject with comments', () => {
    const result = updateClientApprovalSchema.parse({
      status: 'rejected',
      comments: 'Price is too high',
    })
    expect(result.status).toBe('rejected')
    expect(result.comments).toBe('Price is too high')
  })
})

// ============================================================================
// Message Schemas
// ============================================================================

describe('Module 29 — Message Schemas', () => {
  test('listClientMessagesSchema accepts valid params', () => {
    const result = listClientMessagesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listClientMessagesSchema accepts all filters', () => {
    const result = listClientMessagesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      category: 'selections',
      status: 'sent',
      sender_type: 'client',
      q: 'flooring',
    })
    expect(result.category).toBe('selections')
    expect(result.status).toBe('sent')
    expect(result.sender_type).toBe('client')
  })

  test('createClientMessageSchema accepts valid message', () => {
    const result = createClientMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'client',
      message_text: 'When will the flooring be installed?',
    })
    expect(result.message_text).toBe('When will the flooring be installed?')
    expect(result.category).toBe('general')
    expect(result.is_external_log).toBe(false)
    expect(result.attachments).toEqual([])
  })

  test('createClientMessageSchema requires job_id, sender_type, message_text', () => {
    expect(() => createClientMessageSchema.parse({})).toThrow()
    expect(() => createClientMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createClientMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'client',
    })).toThrow()
  })

  test('createClientMessageSchema accepts external log message', () => {
    const result = createClientMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'builder_team',
      message_text: 'Called client about selection deadline',
      is_external_log: true,
      external_channel: 'phone',
      category: 'selections',
    })
    expect(result.is_external_log).toBe(true)
    expect(result.external_channel).toBe('phone')
    expect(result.category).toBe('selections')
  })

  test('createClientMessageSchema rejects message_text > 10000 chars', () => {
    expect(() => createClientMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'client',
      message_text: 'A'.repeat(10001),
    })).toThrow()
  })

  test('updateClientMessageSchema accepts status update', () => {
    const result = updateClientMessageSchema.parse({ status: 'read' })
    expect(result.status).toBe('read')
  })

  test('updateClientMessageSchema accepts archived status', () => {
    const result = updateClientMessageSchema.parse({ status: 'archived' })
    expect(result.status).toBe('archived')
  })
})

// ============================================================================
// Payment Schemas
// ============================================================================

describe('Module 29 — Payment Schemas', () => {
  test('listClientPaymentsSchema accepts valid params', () => {
    const result = listClientPaymentsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listClientPaymentsSchema rejects limit > 100', () => {
    expect(() => listClientPaymentsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listClientPaymentsSchema accepts all filters', () => {
    const result = listClientPaymentsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      payment_method: 'check',
      q: 'draw',
    })
    expect(result.status).toBe('completed')
    expect(result.payment_method).toBe('check')
    expect(result.q).toBe('draw')
  })

  test('createClientPaymentSchema accepts valid payment', () => {
    const result = createClientPaymentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 25000.00,
      description: 'Draw 2 payment',
    })
    expect(result.amount).toBe(25000.00)
    expect(result.payment_method).toBe('check')
    expect(result.status).toBe('pending')
  })

  test('createClientPaymentSchema requires job_id and amount', () => {
    expect(() => createClientPaymentSchema.parse({})).toThrow()
    expect(() => createClientPaymentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createClientPaymentSchema rejects negative amount', () => {
    expect(() => createClientPaymentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: -100,
    })).toThrow()
  })

  test('createClientPaymentSchema accepts all payment methods', () => {
    for (const method of ['credit_card', 'ach', 'check', 'wire', 'other']) {
      const result = createClientPaymentSchema.parse({
        job_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1000,
        payment_method: method,
      })
      expect(result.payment_method).toBe(method)
    }
  })

  test('createClientPaymentSchema validates payment_date format', () => {
    const result = createClientPaymentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 5000,
      payment_date: '2026-02-15',
    })
    expect(result.payment_date).toBe('2026-02-15')
  })

  test('createClientPaymentSchema rejects invalid payment_date format', () => {
    expect(() => createClientPaymentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 5000,
      payment_date: '02/15/2026',
    })).toThrow()
  })

  test('createClientPaymentSchema accepts full payment with all fields', () => {
    const result = createClientPaymentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_user_id: '550e8400-e29b-41d4-a716-446655440000',
      payment_number: 'PAY-001',
      amount: 75000.50,
      payment_method: 'wire',
      status: 'completed',
      reference_number: 'WIRE-2026-001',
      description: 'Final draw payment',
      draw_request_id: '550e8400-e29b-41d4-a716-446655440000',
      payment_date: '2026-02-20',
      notes: 'Wired from escrow',
    })
    expect(result.amount).toBe(75000.50)
    expect(result.payment_method).toBe('wire')
    expect(result.status).toBe('completed')
    expect(result.reference_number).toBe('WIRE-2026-001')
  })
})
