/**
 * Module 12 — Basic Client Portal Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 12 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  SenderType,
  PostType,
  PortalAction,
  PortalSettings,
  PortalMessage,
  PortalUpdatePost,
  PortalSharedDocument,
  PortalSharedPhoto,
  PortalActivityLog,
} from '@/types/client-portal'

import {
  SENDER_TYPES,
  POST_TYPES,
  PORTAL_ACTIONS,
  DEFAULT_PRIMARY_COLOR,
  MAX_WELCOME_MESSAGE_LENGTH,
  MAX_MESSAGE_BODY_LENGTH,
  MAX_POST_BODY_LENGTH,
  MAX_ALBUM_NAME_LENGTH,
  MAX_CAPTION_LENGTH,
} from '@/types/client-portal'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  senderTypeEnum,
  postTypeEnum,
  portalActionEnum,
  getPortalSettingsSchema,
  updatePortalSettingsSchema,
  listMessagesSchema,
  createMessageSchema,
  updateMessageSchema,
  listUpdatePostsSchema,
  createUpdatePostSchema,
  updateUpdatePostSchema,
  listSharedDocumentsSchema,
  shareDocumentSchema,
  listSharedPhotosSchema,
  sharePhotoSchema,
  logActivitySchema,
} from '@/lib/validation/schemas/client-portal'

// ============================================================================
// Type System
// ============================================================================

describe('Module 12 — Client Portal Types', () => {
  test('SenderType has 2 values', () => {
    const types: SenderType[] = ['builder', 'client']
    expect(types).toHaveLength(2)
  })

  test('PostType has 5 values', () => {
    const types: PostType[] = [
      'general_update', 'milestone', 'photo_update', 'schedule_update', 'budget_update',
    ]
    expect(types).toHaveLength(5)
  })

  test('PortalAction has 5 values', () => {
    const actions: PortalAction[] = [
      'viewed_update', 'viewed_document', 'sent_message', 'viewed_photo', 'logged_in',
    ]
    expect(actions).toHaveLength(5)
  })

  test('PortalSettings interface has all required fields', () => {
    const settings: PortalSettings = {
      id: '1', company_id: '1', job_id: '1',
      is_enabled: true,
      branding_logo_url: null,
      branding_primary_color: '#1a1a2e',
      welcome_message: 'Welcome to your project portal',
      show_budget: false,
      show_schedule: true,
      show_documents: true,
      show_photos: true,
      show_daily_logs: false,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(settings.is_enabled).toBe(true)
    expect(settings.branding_primary_color).toBe('#1a1a2e')
    expect(settings.show_budget).toBe(false)
    expect(settings.show_schedule).toBe(true)
  })

  test('PortalMessage interface has all required fields', () => {
    const msg: PortalMessage = {
      id: '1', company_id: '1', job_id: '1',
      sender_id: 'user-1', sender_type: 'builder',
      subject: 'Update on framing', body: 'Framing is complete.',
      parent_message_id: null, is_read: false,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(msg.sender_type).toBe('builder')
    expect(msg.is_read).toBe(false)
  })

  test('PortalUpdatePost interface has all required fields including soft delete', () => {
    const post: PortalUpdatePost = {
      id: '1', company_id: '1', job_id: '1',
      title: 'Week 4 Update', body: 'Great progress this week.',
      post_type: 'general_update', is_published: true,
      published_at: '2026-01-20', created_by: 'user-1',
      created_at: '2026-01-20', updated_at: '2026-01-20',
      deleted_at: null,
    }
    expect(post.post_type).toBe('general_update')
    expect(post.is_published).toBe(true)
    expect(post.deleted_at).toBeNull()
  })

  test('PortalSharedDocument interface has all required fields', () => {
    const doc: PortalSharedDocument = {
      id: '1', company_id: '1', job_id: '1',
      document_id: 'doc-1', shared_by: 'user-1',
      shared_at: '2026-01-10', notes: 'Signed contract',
      created_at: '2026-01-10',
    }
    expect(doc.document_id).toBe('doc-1')
    expect(doc.notes).toBe('Signed contract')
  })

  test('PortalSharedPhoto interface has all required fields', () => {
    const photo: PortalSharedPhoto = {
      id: '1', company_id: '1', job_id: '1',
      storage_path: '/photos/framing-01.jpg',
      caption: 'Kitchen framing complete',
      album_name: 'Framing', sort_order: 1,
      shared_by: 'user-1', created_at: '2026-01-12',
    }
    expect(photo.album_name).toBe('Framing')
    expect(photo.sort_order).toBe(1)
  })

  test('PortalActivityLog interface has all required fields', () => {
    const log: PortalActivityLog = {
      id: '1', company_id: '1', job_id: '1',
      client_id: 'client-1', action: 'viewed_update',
      metadata: { update_id: 'post-1' },
      created_at: '2026-01-15',
    }
    expect(log.action).toBe('viewed_update')
    expect(log.metadata).toHaveProperty('update_id')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 12 — Constants', () => {
  test('SENDER_TYPES has 2 entries with value and label', () => {
    expect(SENDER_TYPES).toHaveLength(2)
    for (const st of SENDER_TYPES) {
      expect(st).toHaveProperty('value')
      expect(st).toHaveProperty('label')
      expect(st.label.length).toBeGreaterThan(0)
    }
  })

  test('POST_TYPES has 5 entries with value and label', () => {
    expect(POST_TYPES).toHaveLength(5)
    for (const pt of POST_TYPES) {
      expect(pt).toHaveProperty('value')
      expect(pt).toHaveProperty('label')
      expect(pt.label.length).toBeGreaterThan(0)
    }
    const values = POST_TYPES.map((pt) => pt.value)
    expect(values).toContain('general_update')
    expect(values).toContain('milestone')
    expect(values).toContain('photo_update')
    expect(values).toContain('schedule_update')
    expect(values).toContain('budget_update')
  })

  test('PORTAL_ACTIONS has 5 entries with value and label', () => {
    expect(PORTAL_ACTIONS).toHaveLength(5)
    for (const pa of PORTAL_ACTIONS) {
      expect(pa).toHaveProperty('value')
      expect(pa).toHaveProperty('label')
      expect(pa.label.length).toBeGreaterThan(0)
    }
    const values = PORTAL_ACTIONS.map((pa) => pa.value)
    expect(values).toContain('viewed_update')
    expect(values).toContain('viewed_document')
    expect(values).toContain('sent_message')
    expect(values).toContain('viewed_photo')
    expect(values).toContain('logged_in')
  })

  test('DEFAULT_PRIMARY_COLOR is #1a1a2e', () => {
    expect(DEFAULT_PRIMARY_COLOR).toBe('#1a1a2e')
  })

  test('MAX_WELCOME_MESSAGE_LENGTH is 2000', () => {
    expect(MAX_WELCOME_MESSAGE_LENGTH).toBe(2000)
  })

  test('MAX_MESSAGE_BODY_LENGTH is 5000', () => {
    expect(MAX_MESSAGE_BODY_LENGTH).toBe(5000)
  })

  test('MAX_POST_BODY_LENGTH is 10000', () => {
    expect(MAX_POST_BODY_LENGTH).toBe(10000)
  })

  test('MAX_ALBUM_NAME_LENGTH is 100', () => {
    expect(MAX_ALBUM_NAME_LENGTH).toBe(100)
  })

  test('MAX_CAPTION_LENGTH is 500', () => {
    expect(MAX_CAPTION_LENGTH).toBe(500)
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 12 — Enum Schemas', () => {
  test('senderTypeEnum accepts builder and client', () => {
    expect(senderTypeEnum.parse('builder')).toBe('builder')
    expect(senderTypeEnum.parse('client')).toBe('client')
  })

  test('senderTypeEnum rejects invalid values', () => {
    expect(() => senderTypeEnum.parse('admin')).toThrow()
    expect(() => senderTypeEnum.parse('')).toThrow()
  })

  test('postTypeEnum accepts all 5 post types', () => {
    for (const pt of ['general_update', 'milestone', 'photo_update', 'schedule_update', 'budget_update']) {
      expect(postTypeEnum.parse(pt)).toBe(pt)
    }
  })

  test('postTypeEnum rejects invalid type', () => {
    expect(() => postTypeEnum.parse('unknown')).toThrow()
  })

  test('portalActionEnum accepts all 5 actions', () => {
    for (const a of ['viewed_update', 'viewed_document', 'sent_message', 'viewed_photo', 'logged_in']) {
      expect(portalActionEnum.parse(a)).toBe(a)
    }
  })

  test('portalActionEnum rejects invalid action', () => {
    expect(() => portalActionEnum.parse('clicked_link')).toThrow()
  })
})

// ============================================================================
// Schemas — Settings
// ============================================================================

describe('Module 12 — Settings Schemas', () => {
  test('getPortalSettingsSchema requires job_id UUID', () => {
    const result = getPortalSettingsSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('getPortalSettingsSchema rejects missing job_id', () => {
    expect(() => getPortalSettingsSchema.parse({})).toThrow()
  })

  test('getPortalSettingsSchema rejects invalid UUID', () => {
    expect(() => getPortalSettingsSchema.parse({ job_id: 'not-a-uuid' })).toThrow()
  })

  test('updatePortalSettingsSchema accepts valid settings', () => {
    const result = updatePortalSettingsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      is_enabled: true,
      show_budget: true,
      branding_primary_color: '#ff6600',
    })
    expect(result.is_enabled).toBe(true)
    expect(result.show_budget).toBe(true)
    expect(result.branding_primary_color).toBe('#ff6600')
  })

  test('updatePortalSettingsSchema rejects invalid hex color', () => {
    expect(() => updatePortalSettingsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      branding_primary_color: 'red',
    })).toThrow()
    expect(() => updatePortalSettingsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      branding_primary_color: '#gg0000',
    })).toThrow()
  })
})

// ============================================================================
// Schemas — Messages
// ============================================================================

describe('Module 12 — Message Schemas', () => {
  test('listMessagesSchema accepts valid params', () => {
    const result = listMessagesSchema.parse({
      page: '1', limit: '20',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMessagesSchema rejects limit > 100', () => {
    expect(() => listMessagesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      limit: 200,
    })).toThrow()
  })

  test('createMessageSchema accepts valid message', () => {
    const result = createMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'builder',
      body: 'Hello from the builder!',
    })
    expect(result.sender_type).toBe('builder')
    expect(result.body).toBe('Hello from the builder!')
  })

  test('createMessageSchema requires body', () => {
    expect(() => createMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'client',
    })).toThrow()
  })

  test('createMessageSchema rejects empty body', () => {
    expect(() => createMessageSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      sender_type: 'client',
      body: '',
    })).toThrow()
  })

  test('updateMessageSchema accepts is_read boolean', () => {
    const result = updateMessageSchema.parse({ is_read: true })
    expect(result.is_read).toBe(true)
  })

  test('updateMessageSchema requires is_read', () => {
    expect(() => updateMessageSchema.parse({})).toThrow()
  })
})

// ============================================================================
// Schemas — Update Posts
// ============================================================================

describe('Module 12 — Update Post Schemas', () => {
  test('listUpdatePostsSchema accepts valid params with filters', () => {
    const result = listUpdatePostsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      post_type: 'milestone',
    })
    expect(result.post_type).toBe('milestone')
  })

  test('createUpdatePostSchema accepts valid post', () => {
    const result = createUpdatePostSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Week 5 Progress',
      body: 'Framing is 90% complete. Rough electrical started today.',
      post_type: 'general_update',
    })
    expect(result.title).toBe('Week 5 Progress')
    expect(result.post_type).toBe('general_update')
  })

  test('createUpdatePostSchema requires title, body, and post_type', () => {
    expect(() => createUpdatePostSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('updateUpdatePostSchema accepts partial updates', () => {
    const result = updateUpdatePostSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
    expect(result.body).toBeUndefined()
  })
})

// ============================================================================
// Schemas — Documents & Photos
// ============================================================================

describe('Module 12 — Document & Photo Schemas', () => {
  test('shareDocumentSchema accepts valid share', () => {
    const result = shareDocumentSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      document_id: '660e8400-e29b-41d4-a716-446655440000',
      notes: 'Signed contract for review',
    })
    expect(result.document_id).toBe('660e8400-e29b-41d4-a716-446655440000')
    expect(result.notes).toBe('Signed contract for review')
  })

  test('shareDocumentSchema requires job_id and document_id', () => {
    expect(() => shareDocumentSchema.parse({})).toThrow()
    expect(() => shareDocumentSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('sharePhotoSchema accepts valid photo', () => {
    const result = sharePhotoSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      storage_path: '/photos/kitchen-01.jpg',
      caption: 'Kitchen island installed',
      album_name: 'Kitchen',
      sort_order: 3,
    })
    expect(result.storage_path).toBe('/photos/kitchen-01.jpg')
    expect(result.album_name).toBe('Kitchen')
    expect(result.sort_order).toBe(3)
  })

  test('sharePhotoSchema requires storage_path', () => {
    expect(() => sharePhotoSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('sharePhotoSchema defaults sort_order to 0', () => {
    const result = sharePhotoSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      storage_path: '/photos/exterior.jpg',
    })
    expect(result.sort_order).toBe(0)
  })

  test('listSharedPhotosSchema accepts album_name filter', () => {
    const result = listSharedPhotosSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      album_name: 'Framing',
    })
    expect(result.album_name).toBe('Framing')
  })
})

// ============================================================================
// Schemas — Activity Log
// ============================================================================

describe('Module 12 — Activity Log Schema', () => {
  test('logActivitySchema accepts valid activity', () => {
    const result = logActivitySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_id: '770e8400-e29b-41d4-a716-446655440000',
      action: 'viewed_update',
      metadata: { update_id: 'post-1' },
    })
    expect(result.action).toBe('viewed_update')
    expect(result.metadata).toEqual({ update_id: 'post-1' })
  })

  test('logActivitySchema requires job_id, client_id, and action', () => {
    expect(() => logActivitySchema.parse({})).toThrow()
    expect(() => logActivitySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_id: '770e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('logActivitySchema makes metadata optional', () => {
    const result = logActivitySchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      client_id: '770e8400-e29b-41d4-a716-446655440000',
      action: 'logged_in',
    })
    expect(result.metadata).toBeUndefined()
  })
})
