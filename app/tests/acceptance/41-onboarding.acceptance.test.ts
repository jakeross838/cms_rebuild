/**
 * Module 41: Onboarding Wizard — Acceptance Tests
 *
 * Pure function tests validating type unions, interfaces, constants,
 * enum schemas, and CRUD schemas for onboarding sessions, milestones,
 * reminders, sample data sets, and checklists.
 */

import { describe, it, expect } from 'vitest'

import type {
  OnboardingStatus,
  MilestoneStatus,
  ReminderType,
  ReminderStatus,
  SampleDataType,
  SampleDataStatus,
  CompanyType,
  CompanySize,
  ChecklistCategory,
  OnboardingSession,
  OnboardingMilestone,
  OnboardingReminder,
  SampleDataSet,
  OnboardingChecklist,
} from '@/types/onboarding'

import {
  ONBOARDING_STATUSES,
  MILESTONE_STATUSES,
  REMINDER_TYPES,
  REMINDER_STATUSES,
  SAMPLE_DATA_TYPES,
  SAMPLE_DATA_STATUSES,
  COMPANY_TYPES,
  COMPANY_SIZES,
  CHECKLIST_CATEGORIES,
} from '@/types/onboarding'

import {
  onboardingStatusEnum,
  milestoneStatusEnum,
  reminderTypeEnum,
  reminderStatusEnum,
  sampleDataTypeEnum,
  sampleDataStatusEnum,
  companyTypeEnum,
  companySizeEnum,
  checklistCategoryEnum,
  listOnboardingSessionsSchema,
  createOnboardingSessionSchema,
  updateOnboardingSessionSchema,
  listMilestonesSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  listRemindersSchema,
  createReminderSchema,
  updateReminderSchema,
  listSampleDataSetsSchema,
  createSampleDataSetSchema,
  updateSampleDataSetSchema,
  listChecklistsSchema,
  createChecklistSchema,
  updateChecklistSchema,
} from '@/lib/validation/schemas/onboarding'

// ============================================================================
// Type Union Tests
// ============================================================================

describe('Module 41 — Onboarding Wizard Types', () => {
  it('OnboardingStatus has 4 values', () => {
    const statuses: OnboardingStatus[] = ['not_started', 'in_progress', 'completed', 'skipped']
    expect(statuses).toHaveLength(4)
  })

  it('MilestoneStatus has 4 values', () => {
    const statuses: MilestoneStatus[] = ['pending', 'in_progress', 'completed', 'skipped']
    expect(statuses).toHaveLength(4)
  })

  it('ReminderType has 3 values', () => {
    const types: ReminderType[] = ['email', 'in_app', 'push']
    expect(types).toHaveLength(3)
  })

  it('ReminderStatus has 4 values', () => {
    const statuses: ReminderStatus[] = ['scheduled', 'sent', 'cancelled', 'failed']
    expect(statuses).toHaveLength(4)
  })

  it('SampleDataType has 6 values', () => {
    const types: SampleDataType[] = ['full_demo', 'minimal', 'custom_home', 'production', 'remodel', 'commercial']
    expect(types).toHaveLength(6)
  })

  it('SampleDataStatus has 5 values', () => {
    const statuses: SampleDataStatus[] = ['pending', 'generating', 'ready', 'applied', 'failed']
    expect(statuses).toHaveLength(5)
  })

  it('CompanyType has 5 values', () => {
    const types: CompanyType[] = ['custom_home', 'production', 'remodel', 'commercial', 'specialty']
    expect(types).toHaveLength(5)
  })

  it('CompanySize has 5 values', () => {
    const sizes: CompanySize[] = ['1-5', '6-20', '21-50', '51-100', '100+']
    expect(sizes).toHaveLength(5)
  })

  it('ChecklistCategory has 5 values', () => {
    const categories: ChecklistCategory[] = ['setup', 'data', 'team', 'workflow', 'integration']
    expect(categories).toHaveLength(5)
  })

  it('OnboardingSession interface has all required fields', () => {
    const session: OnboardingSession = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      company_id: '00000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000003',
      status: 'not_started',
      current_step: 1,
      total_steps: 8,
      company_type: null,
      company_size: null,
      started_at: null,
      completed_at: null,
      skipped_at: null,
      metadata: {},
      created_by: null,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
      deleted_at: null,
    }
    expect(session).toBeDefined()
    expect(session.id).toBeDefined()
    expect(session.company_id).toBeDefined()
    expect(session.user_id).toBeDefined()
    expect(session.status).toBe('not_started')
    expect(session.current_step).toBe(1)
    expect(session.total_steps).toBe(8)
  })

  it('OnboardingMilestone interface has all required fields', () => {
    const milestone: OnboardingMilestone = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      company_id: '00000000-0000-0000-0000-000000000002',
      session_id: '00000000-0000-0000-0000-000000000003',
      milestone_key: 'company_setup',
      title: 'Company Setup',
      description: null,
      status: 'pending',
      sort_order: 0,
      started_at: null,
      completed_at: null,
      skipped_at: null,
      data: {},
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(milestone).toBeDefined()
    expect(milestone.milestone_key).toBe('company_setup')
    expect(milestone.session_id).toBeDefined()
  })

  it('OnboardingReminder interface has all required fields', () => {
    const reminder: OnboardingReminder = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      company_id: '00000000-0000-0000-0000-000000000002',
      session_id: '00000000-0000-0000-0000-000000000003',
      reminder_type: 'email',
      subject: null,
      message: null,
      scheduled_at: '2026-01-15T09:00:00Z',
      sent_at: null,
      status: 'scheduled',
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(reminder).toBeDefined()
    expect(reminder.reminder_type).toBe('email')
    expect(reminder.status).toBe('scheduled')
  })

  it('SampleDataSet interface has all required fields', () => {
    const dataSet: SampleDataSet = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      company_id: '00000000-0000-0000-0000-000000000002',
      name: 'Demo Data',
      description: null,
      data_type: 'full_demo',
      status: 'pending',
      content: {},
      applied_at: null,
      applied_by: null,
      created_by: null,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(dataSet).toBeDefined()
    expect(dataSet.name).toBe('Demo Data')
    expect(dataSet.data_type).toBe('full_demo')
  })

  it('OnboardingChecklist interface has all required fields', () => {
    const checklist: OnboardingChecklist = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      company_id: '00000000-0000-0000-0000-000000000002',
      session_id: '00000000-0000-0000-0000-000000000003',
      category: 'setup',
      title: 'Configure company settings',
      description: null,
      is_completed: false,
      is_required: true,
      completed_at: null,
      completed_by: null,
      sort_order: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(checklist).toBeDefined()
    expect(checklist.category).toBe('setup')
    expect(checklist.is_required).toBe(true)
  })
})

// ============================================================================
// Constants Tests
// ============================================================================

describe('Module 41 — Onboarding Wizard Constants', () => {
  it('ONBOARDING_STATUSES has 4 entries with value and label', () => {
    expect(ONBOARDING_STATUSES).toHaveLength(4)
    ONBOARDING_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('ONBOARDING_STATUSES includes all expected values', () => {
    const values = ONBOARDING_STATUSES.map((s) => s.value)
    expect(values).toContain('not_started')
    expect(values).toContain('in_progress')
    expect(values).toContain('completed')
    expect(values).toContain('skipped')
  })

  it('MILESTONE_STATUSES has 4 entries with value and label', () => {
    expect(MILESTONE_STATUSES).toHaveLength(4)
    MILESTONE_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('REMINDER_TYPES has 3 entries with value and label', () => {
    expect(REMINDER_TYPES).toHaveLength(3)
    REMINDER_TYPES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('REMINDER_STATUSES has 4 entries with value and label', () => {
    expect(REMINDER_STATUSES).toHaveLength(4)
    REMINDER_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('SAMPLE_DATA_TYPES has 6 entries with value and label', () => {
    expect(SAMPLE_DATA_TYPES).toHaveLength(6)
    SAMPLE_DATA_TYPES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('SAMPLE_DATA_STATUSES has 5 entries with value and label', () => {
    expect(SAMPLE_DATA_STATUSES).toHaveLength(5)
    SAMPLE_DATA_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('COMPANY_TYPES has 5 entries with value and label', () => {
    expect(COMPANY_TYPES).toHaveLength(5)
    COMPANY_TYPES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('COMPANY_SIZES has 5 entries with value and label', () => {
    expect(COMPANY_SIZES).toHaveLength(5)
    COMPANY_SIZES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  it('CHECKLIST_CATEGORIES has 5 entries with value and label', () => {
    expect(CHECKLIST_CATEGORIES).toHaveLength(5)
    CHECKLIST_CATEGORIES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })
})

// ============================================================================
// Enum Schema Tests
// ============================================================================

describe('Module 41 — Onboarding Wizard Enum Schemas', () => {
  it('onboardingStatusEnum accepts all 4 statuses', () => {
    expect(onboardingStatusEnum.safeParse('not_started').success).toBe(true)
    expect(onboardingStatusEnum.safeParse('in_progress').success).toBe(true)
    expect(onboardingStatusEnum.safeParse('completed').success).toBe(true)
    expect(onboardingStatusEnum.safeParse('skipped').success).toBe(true)
  })

  it('onboardingStatusEnum rejects invalid status', () => {
    expect(onboardingStatusEnum.safeParse('invalid').success).toBe(false)
  })

  it('milestoneStatusEnum accepts all 4 statuses', () => {
    expect(milestoneStatusEnum.safeParse('pending').success).toBe(true)
    expect(milestoneStatusEnum.safeParse('in_progress').success).toBe(true)
    expect(milestoneStatusEnum.safeParse('completed').success).toBe(true)
    expect(milestoneStatusEnum.safeParse('skipped').success).toBe(true)
  })

  it('milestoneStatusEnum rejects invalid status', () => {
    expect(milestoneStatusEnum.safeParse('invalid').success).toBe(false)
  })

  it('reminderTypeEnum accepts all 3 types', () => {
    expect(reminderTypeEnum.safeParse('email').success).toBe(true)
    expect(reminderTypeEnum.safeParse('in_app').success).toBe(true)
    expect(reminderTypeEnum.safeParse('push').success).toBe(true)
  })

  it('reminderTypeEnum rejects invalid type', () => {
    expect(reminderTypeEnum.safeParse('sms').success).toBe(false)
  })

  it('reminderStatusEnum accepts all 4 statuses', () => {
    expect(reminderStatusEnum.safeParse('scheduled').success).toBe(true)
    expect(reminderStatusEnum.safeParse('sent').success).toBe(true)
    expect(reminderStatusEnum.safeParse('cancelled').success).toBe(true)
    expect(reminderStatusEnum.safeParse('failed').success).toBe(true)
  })

  it('reminderStatusEnum rejects invalid status', () => {
    expect(reminderStatusEnum.safeParse('pending').success).toBe(false)
  })

  it('sampleDataTypeEnum accepts all 6 types', () => {
    expect(sampleDataTypeEnum.safeParse('full_demo').success).toBe(true)
    expect(sampleDataTypeEnum.safeParse('minimal').success).toBe(true)
    expect(sampleDataTypeEnum.safeParse('custom_home').success).toBe(true)
    expect(sampleDataTypeEnum.safeParse('production').success).toBe(true)
    expect(sampleDataTypeEnum.safeParse('remodel').success).toBe(true)
    expect(sampleDataTypeEnum.safeParse('commercial').success).toBe(true)
  })

  it('sampleDataTypeEnum rejects invalid type', () => {
    expect(sampleDataTypeEnum.safeParse('invalid').success).toBe(false)
  })

  it('sampleDataStatusEnum accepts all 5 statuses', () => {
    expect(sampleDataStatusEnum.safeParse('pending').success).toBe(true)
    expect(sampleDataStatusEnum.safeParse('generating').success).toBe(true)
    expect(sampleDataStatusEnum.safeParse('ready').success).toBe(true)
    expect(sampleDataStatusEnum.safeParse('applied').success).toBe(true)
    expect(sampleDataStatusEnum.safeParse('failed').success).toBe(true)
  })

  it('sampleDataStatusEnum rejects invalid status', () => {
    expect(sampleDataStatusEnum.safeParse('invalid').success).toBe(false)
  })

  it('companyTypeEnum accepts all 5 types', () => {
    expect(companyTypeEnum.safeParse('custom_home').success).toBe(true)
    expect(companyTypeEnum.safeParse('production').success).toBe(true)
    expect(companyTypeEnum.safeParse('remodel').success).toBe(true)
    expect(companyTypeEnum.safeParse('commercial').success).toBe(true)
    expect(companyTypeEnum.safeParse('specialty').success).toBe(true)
  })

  it('companyTypeEnum rejects invalid type', () => {
    expect(companyTypeEnum.safeParse('invalid').success).toBe(false)
  })

  it('companySizeEnum accepts all 5 sizes', () => {
    expect(companySizeEnum.safeParse('1-5').success).toBe(true)
    expect(companySizeEnum.safeParse('6-20').success).toBe(true)
    expect(companySizeEnum.safeParse('21-50').success).toBe(true)
    expect(companySizeEnum.safeParse('51-100').success).toBe(true)
    expect(companySizeEnum.safeParse('100+').success).toBe(true)
  })

  it('companySizeEnum rejects invalid size', () => {
    expect(companySizeEnum.safeParse('200+').success).toBe(false)
  })

  it('checklistCategoryEnum accepts all 5 categories', () => {
    expect(checklistCategoryEnum.safeParse('setup').success).toBe(true)
    expect(checklistCategoryEnum.safeParse('data').success).toBe(true)
    expect(checklistCategoryEnum.safeParse('team').success).toBe(true)
    expect(checklistCategoryEnum.safeParse('workflow').success).toBe(true)
    expect(checklistCategoryEnum.safeParse('integration').success).toBe(true)
  })

  it('checklistCategoryEnum rejects invalid category', () => {
    expect(checklistCategoryEnum.safeParse('invalid').success).toBe(false)
  })
})

// ============================================================================
// Session Schema Tests
// ============================================================================

describe('Module 41 — Onboarding Session Schemas', () => {
  it('listOnboardingSessionsSchema accepts valid params', () => {
    const result = listOnboardingSessionsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('listOnboardingSessionsSchema rejects limit > 100', () => {
    const result = listOnboardingSessionsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it('listOnboardingSessionsSchema accepts all filters', () => {
    const result = listOnboardingSessionsSchema.safeParse({
      page: 2,
      limit: 50,
      status: 'in_progress',
      q: 'test',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('in_progress')
      expect(result.data.q).toBe('test')
    }
  })

  it('createOnboardingSessionSchema accepts valid session', () => {
    const result = createOnboardingSessionSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('not_started')
      expect(result.data.current_step).toBe(1)
      expect(result.data.total_steps).toBe(8)
      expect(result.data.metadata).toEqual({})
    }
  })

  it('createOnboardingSessionSchema requires user_id', () => {
    const result = createOnboardingSessionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('createOnboardingSessionSchema rejects invalid user_id', () => {
    const result = createOnboardingSessionSchema.safeParse({
      user_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('createOnboardingSessionSchema accepts all optional fields', () => {
    const result = createOnboardingSessionSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'in_progress',
      current_step: 3,
      total_steps: 10,
      company_type: 'custom_home',
      company_size: '6-20',
      metadata: { source: 'wizard' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('in_progress')
      expect(result.data.current_step).toBe(3)
      expect(result.data.total_steps).toBe(10)
      expect(result.data.company_type).toBe('custom_home')
      expect(result.data.company_size).toBe('6-20')
    }
  })

  it('createOnboardingSessionSchema rejects current_step > 50', () => {
    const result = createOnboardingSessionSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      current_step: 51,
    })
    expect(result.success).toBe(false)
  })

  it('updateOnboardingSessionSchema accepts partial updates', () => {
    const result = updateOnboardingSessionSchema.safeParse({
      status: 'completed',
      current_step: 8,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('completed')
      expect(result.data.current_step).toBe(8)
    }
  })

  it('updateOnboardingSessionSchema accepts empty object', () => {
    const result = updateOnboardingSessionSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Milestone Schema Tests
// ============================================================================

describe('Module 41 — Onboarding Milestone Schemas', () => {
  it('listMilestonesSchema accepts valid params with defaults', () => {
    const result = listMilestonesSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  it('listMilestonesSchema accepts status filter', () => {
    const result = listMilestonesSchema.safeParse({
      status: 'completed',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('completed')
    }
  })

  it('createMilestoneSchema accepts valid milestone', () => {
    const result = createMilestoneSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      milestone_key: 'company_setup',
      title: 'Company Setup',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('pending')
      expect(result.data.sort_order).toBe(0)
      expect(result.data.data).toEqual({})
    }
  })

  it('createMilestoneSchema requires session_id, milestone_key, and title', () => {
    const result = createMilestoneSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      expect(errors.session_id).toBeDefined()
      expect(errors.milestone_key).toBeDefined()
      expect(errors.title).toBeDefined()
    }
  })

  it('createMilestoneSchema rejects milestone_key > 100 chars', () => {
    const result = createMilestoneSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      milestone_key: 'a'.repeat(101),
      title: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('createMilestoneSchema rejects title > 255 chars', () => {
    const result = createMilestoneSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      milestone_key: 'test',
      title: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it('createMilestoneSchema accepts all optional fields', () => {
    const result = createMilestoneSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      milestone_key: 'team_setup',
      title: 'Team Setup',
      description: 'Set up your team members',
      status: 'in_progress',
      sort_order: 3,
      data: { step: 'team' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('Set up your team members')
      expect(result.data.status).toBe('in_progress')
      expect(result.data.sort_order).toBe(3)
    }
  })

  it('updateMilestoneSchema accepts partial updates', () => {
    const result = updateMilestoneSchema.safeParse({
      status: 'completed',
      title: 'Updated Title',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('completed')
      expect(result.data.title).toBe('Updated Title')
    }
  })

  it('updateMilestoneSchema accepts empty object', () => {
    const result = updateMilestoneSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Reminder Schema Tests
// ============================================================================

describe('Module 41 — Onboarding Reminder Schemas', () => {
  it('listRemindersSchema accepts valid params with defaults', () => {
    const result = listRemindersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('listRemindersSchema accepts all filters', () => {
    const result = listRemindersSchema.safeParse({
      status: 'scheduled',
      reminder_type: 'email',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('scheduled')
      expect(result.data.reminder_type).toBe('email')
    }
  })

  it('createReminderSchema accepts valid reminder', () => {
    const result = createReminderSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      scheduled_at: '2026-02-01T09:00:00Z',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reminder_type).toBe('email')
      expect(result.data.status).toBe('scheduled')
    }
  })

  it('createReminderSchema requires session_id and scheduled_at', () => {
    const result = createReminderSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      expect(errors.session_id).toBeDefined()
      expect(errors.scheduled_at).toBeDefined()
    }
  })

  it('createReminderSchema accepts all optional fields', () => {
    const result = createReminderSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      reminder_type: 'push',
      subject: 'Continue your setup',
      message: 'You are 60% complete with onboarding',
      scheduled_at: '2026-02-01T09:00:00Z',
      status: 'sent',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reminder_type).toBe('push')
      expect(result.data.subject).toBe('Continue your setup')
    }
  })

  it('createReminderSchema rejects subject > 255 chars', () => {
    const result = createReminderSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      scheduled_at: '2026-02-01T09:00:00Z',
      subject: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it('updateReminderSchema accepts partial updates', () => {
    const result = updateReminderSchema.safeParse({
      status: 'cancelled',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('cancelled')
    }
  })

  it('updateReminderSchema accepts empty object', () => {
    const result = updateReminderSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('updateReminderSchema rejects invalid reminder_type', () => {
    const result = updateReminderSchema.safeParse({
      reminder_type: 'sms',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Sample Data Set Schema Tests
// ============================================================================

describe('Module 41 — Sample Data Set Schemas', () => {
  it('listSampleDataSetsSchema accepts valid params with defaults', () => {
    const result = listSampleDataSetsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('listSampleDataSetsSchema accepts all filters', () => {
    const result = listSampleDataSetsSchema.safeParse({
      data_type: 'full_demo',
      status: 'ready',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data_type).toBe('full_demo')
      expect(result.data.status).toBe('ready')
    }
  })

  it('listSampleDataSetsSchema rejects limit > 100', () => {
    const result = listSampleDataSetsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it('createSampleDataSetSchema accepts valid data set', () => {
    const result = createSampleDataSetSchema.safeParse({
      name: 'Demo Data',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data_type).toBe('full_demo')
      expect(result.data.status).toBe('pending')
      expect(result.data.content).toEqual({})
    }
  })

  it('createSampleDataSetSchema requires name', () => {
    const result = createSampleDataSetSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('createSampleDataSetSchema rejects name > 200 chars', () => {
    const result = createSampleDataSetSchema.safeParse({
      name: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('createSampleDataSetSchema rejects empty name', () => {
    const result = createSampleDataSetSchema.safeParse({
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('createSampleDataSetSchema accepts all optional fields', () => {
    const result = createSampleDataSetSchema.safeParse({
      name: 'Custom Home Demo',
      description: 'Demo data for custom home builders',
      data_type: 'custom_home',
      status: 'generating',
      content: { jobs: 5, vendors: 10 },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data_type).toBe('custom_home')
      expect(result.data.status).toBe('generating')
      expect(result.data.content).toEqual({ jobs: 5, vendors: 10 })
    }
  })

  it('updateSampleDataSetSchema accepts partial updates', () => {
    const result = updateSampleDataSetSchema.safeParse({
      status: 'applied',
      name: 'Updated Name',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('applied')
      expect(result.data.name).toBe('Updated Name')
    }
  })

  it('updateSampleDataSetSchema accepts empty object', () => {
    const result = updateSampleDataSetSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('updateSampleDataSetSchema rejects invalid data_type', () => {
    const result = updateSampleDataSetSchema.safeParse({
      data_type: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Checklist Schema Tests
// ============================================================================

describe('Module 41 — Onboarding Checklist Schemas', () => {
  it('listChecklistsSchema accepts valid params with defaults', () => {
    const result = listChecklistsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  it('listChecklistsSchema accepts category filter', () => {
    const result = listChecklistsSchema.safeParse({
      category: 'team',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('team')
    }
  })

  it('listChecklistsSchema handles boolean preprocess for is_completed', () => {
    const result = listChecklistsSchema.safeParse({
      is_completed: 'true',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_completed).toBe(true)
    }

    const result2 = listChecklistsSchema.safeParse({
      is_completed: 'false',
    })
    expect(result2.success).toBe(true)
    if (result2.success) {
      expect(result2.data.is_completed).toBe(false)
    }
  })

  it('listChecklistsSchema rejects limit > 100', () => {
    const result = listChecklistsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it('createChecklistSchema accepts valid checklist', () => {
    const result = createChecklistSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Configure company settings',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('setup')
      expect(result.data.is_completed).toBe(false)
      expect(result.data.is_required).toBe(true)
      expect(result.data.sort_order).toBe(0)
    }
  })

  it('createChecklistSchema requires session_id and title', () => {
    const result = createChecklistSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      expect(errors.session_id).toBeDefined()
      expect(errors.title).toBeDefined()
    }
  })

  it('createChecklistSchema rejects title > 255 chars', () => {
    const result = createChecklistSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it('createChecklistSchema accepts all optional fields', () => {
    const result = createChecklistSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      category: 'integration',
      title: 'Connect QuickBooks',
      description: 'Link your QuickBooks Online account',
      is_completed: true,
      is_required: false,
      sort_order: 5,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('integration')
      expect(result.data.is_completed).toBe(true)
      expect(result.data.is_required).toBe(false)
      expect(result.data.sort_order).toBe(5)
    }
  })

  it('updateChecklistSchema accepts partial updates', () => {
    const result = updateChecklistSchema.safeParse({
      is_completed: true,
      category: 'data',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_completed).toBe(true)
      expect(result.data.category).toBe('data')
    }
  })

  it('updateChecklistSchema accepts empty object', () => {
    const result = updateChecklistSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('updateChecklistSchema rejects invalid category', () => {
    const result = updateChecklistSchema.safeParse({
      category: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})
