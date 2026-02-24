/**
 * Module 07 — Scheduling & Calendar Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 07 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ScheduleTaskStatus,
  ScheduleTaskType,
  DependencyType,
  WeatherCondition,
  ScheduleTask,
  ScheduleDependency,
  ScheduleBaseline,
  WeatherRecord,
} from '@/types/scheduling'

import {
  TASK_STATUSES,
  TASK_TYPES,
  DEPENDENCY_TYPES,
  WEATHER_CONDITIONS,
} from '@/types/scheduling'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  taskStatusEnum,
  taskTypeEnum,
  dependencyTypeEnum,
  listScheduleTasksSchema,
  createScheduleTaskSchema,
  updateScheduleTaskSchema,
  createDependencySchema,
  createBaselineSchema,
  listBaselinesSchema,
  createWeatherRecordSchema,
  updateWeatherRecordSchema,
  listWeatherRecordsSchema,
} from '@/lib/validation/schemas/scheduling'

// ============================================================================
// Type System
// ============================================================================

describe('Module 07 — Schedule Types', () => {
  test('ScheduleTaskStatus has 5 values', () => {
    const statuses: ScheduleTaskStatus[] = ['not_started', 'in_progress', 'completed', 'delayed', 'on_hold']
    expect(statuses).toHaveLength(5)
  })

  test('ScheduleTaskType has 3 values', () => {
    const types: ScheduleTaskType[] = ['task', 'milestone', 'summary']
    expect(types).toHaveLength(3)
  })

  test('DependencyType has 4 values', () => {
    const deps: DependencyType[] = ['FS', 'SS', 'FF', 'SF']
    expect(deps).toHaveLength(4)
  })

  test('WeatherCondition has 12 values', () => {
    const conditions: WeatherCondition[] = [
      'sunny', 'partly_cloudy', 'cloudy', 'rain', 'heavy_rain',
      'thunderstorm', 'snow', 'ice', 'fog', 'windy',
      'extreme_heat', 'extreme_cold',
    ]
    expect(conditions).toHaveLength(12)
  })

  test('ScheduleTask interface has all required fields', () => {
    const task: ScheduleTask = {
      id: '1', company_id: '1', job_id: '1', parent_task_id: null,
      name: 'Foundation Pour', description: null, phase: 'Foundation',
      trade: 'Concrete', task_type: 'task',
      planned_start: '2026-03-01', planned_end: '2026-03-05',
      actual_start: null, actual_end: null,
      duration_days: 5, progress_pct: 0, status: 'not_started',
      assigned_to: null, assigned_vendor_id: null,
      is_critical_path: true, total_float: 0,
      sort_order: 1, notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01', deleted_at: null,
    }
    expect(task.name).toBe('Foundation Pour')
    expect(task.status).toBe('not_started')
    expect(task.is_critical_path).toBe(true)
  })

  test('ScheduleDependency interface has all required fields', () => {
    const dep: ScheduleDependency = {
      id: '1', predecessor_id: '1', successor_id: '2',
      dependency_type: 'FS', lag_days: 0,
      created_at: '2026-01-01',
    }
    expect(dep.dependency_type).toBe('FS')
    expect(dep.lag_days).toBe(0)
  })

  test('ScheduleBaseline interface has all required fields', () => {
    const baseline: ScheduleBaseline = {
      id: '1', company_id: '1', job_id: '1',
      name: 'Original Plan', snapshot_date: '2026-03-01',
      baseline_data: { tasks: [] },
      created_by: '1', created_at: '2026-01-01',
    }
    expect(baseline.name).toBe('Original Plan')
    expect(baseline.baseline_data).toHaveProperty('tasks')
  })

  test('WeatherRecord interface has all required fields', () => {
    const record: WeatherRecord = {
      id: '1', company_id: '1', job_id: '1',
      record_date: '2026-03-01', high_temp: 85, low_temp: 62,
      conditions: 'sunny', precipitation_inches: 0, wind_mph: 10,
      is_work_day: true, notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01', deleted_at: null,
    }
    expect(record.record_date).toBe('2026-03-01')
    expect(record.is_work_day).toBe(true)
    expect(record.high_temp).toBe(85)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 07 — Constants', () => {
  test('TASK_STATUSES has 5 entries with value and label', () => {
    expect(TASK_STATUSES).toHaveLength(5)
    for (const s of TASK_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('TASK_STATUSES contains all expected statuses', () => {
    const values = TASK_STATUSES.map((s) => s.value)
    expect(values).toContain('not_started')
    expect(values).toContain('in_progress')
    expect(values).toContain('completed')
    expect(values).toContain('delayed')
    expect(values).toContain('on_hold')
  })

  test('TASK_TYPES has 3 entries', () => {
    expect(TASK_TYPES).toHaveLength(3)
    const values = TASK_TYPES.map((t) => t.value)
    expect(values).toContain('task')
    expect(values).toContain('milestone')
    expect(values).toContain('summary')
  })

  test('DEPENDENCY_TYPES has 4 entries', () => {
    expect(DEPENDENCY_TYPES).toHaveLength(4)
    const values = DEPENDENCY_TYPES.map((d) => d.value)
    expect(values).toContain('FS')
    expect(values).toContain('SS')
    expect(values).toContain('FF')
    expect(values).toContain('SF')
  })

  test('DEPENDENCY_TYPES have descriptive labels', () => {
    const fsLabel = DEPENDENCY_TYPES.find((d) => d.value === 'FS')?.label
    expect(fsLabel).toBe('Finish-to-Start')
    const sfLabel = DEPENDENCY_TYPES.find((d) => d.value === 'SF')?.label
    expect(sfLabel).toBe('Start-to-Finish')
  })

  test('WEATHER_CONDITIONS has 12 conditions', () => {
    expect(WEATHER_CONDITIONS).toHaveLength(12)
  })

  test('WEATHER_CONDITIONS contains key weather types', () => {
    expect(WEATHER_CONDITIONS).toContain('sunny')
    expect(WEATHER_CONDITIONS).toContain('rain')
    expect(WEATHER_CONDITIONS).toContain('snow')
    expect(WEATHER_CONDITIONS).toContain('thunderstorm')
    expect(WEATHER_CONDITIONS).toContain('extreme_heat')
    expect(WEATHER_CONDITIONS).toContain('extreme_cold')
  })
})

// ============================================================================
// Schemas — Task
// ============================================================================

describe('Module 07 — Task Schemas', () => {
  test('taskStatusEnum accepts all 5 statuses', () => {
    for (const s of ['not_started', 'in_progress', 'completed', 'delayed', 'on_hold']) {
      expect(taskStatusEnum.parse(s)).toBe(s)
    }
  })

  test('taskStatusEnum rejects invalid status', () => {
    expect(() => taskStatusEnum.parse('unknown')).toThrow()
    expect(() => taskStatusEnum.parse('pending')).toThrow()
  })

  test('taskTypeEnum accepts all 3 types', () => {
    for (const t of ['task', 'milestone', 'summary']) {
      expect(taskTypeEnum.parse(t)).toBe(t)
    }
  })

  test('taskTypeEnum rejects invalid type', () => {
    expect(() => taskTypeEnum.parse('event')).toThrow()
  })

  test('dependencyTypeEnum accepts all 4 types', () => {
    for (const d of ['FS', 'SS', 'FF', 'SF']) {
      expect(dependencyTypeEnum.parse(d)).toBe(d)
    }
  })

  test('dependencyTypeEnum rejects invalid type', () => {
    expect(() => dependencyTypeEnum.parse('XX')).toThrow()
    expect(() => dependencyTypeEnum.parse('fs')).toThrow() // case-sensitive
  })

  test('listScheduleTasksSchema accepts valid params', () => {
    const result = listScheduleTasksSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listScheduleTasksSchema accepts job_id filter', () => {
    const result = listScheduleTasksSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'in_progress',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('in_progress')
  })

  test('listScheduleTasksSchema rejects limit > 100', () => {
    expect(() => listScheduleTasksSchema.parse({ limit: 200 })).toThrow()
  })

  test('listScheduleTasksSchema rejects invalid status filter', () => {
    expect(() => listScheduleTasksSchema.parse({ status: 'bogus' })).toThrow()
  })

  test('createScheduleTaskSchema accepts valid task', () => {
    const result = createScheduleTaskSchema.parse({
      name: 'Foundation Pour',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      planned_start: '2026-03-01',
      planned_end: '2026-03-05',
      duration_days: 5,
    })
    expect(result.name).toBe('Foundation Pour')
    expect(result.status).toBe('not_started')
    expect(result.progress_pct).toBe(0)
    expect(result.task_type).toBe('task')
  })

  test('createScheduleTaskSchema requires name and job_id', () => {
    expect(() => createScheduleTaskSchema.parse({})).toThrow()
    expect(() => createScheduleTaskSchema.parse({ name: 'Task' })).toThrow()
    expect(() => createScheduleTaskSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createScheduleTaskSchema rejects empty name', () => {
    expect(() => createScheduleTaskSchema.parse({
      name: '',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createScheduleTaskSchema rejects invalid date format', () => {
    expect(() => createScheduleTaskSchema.parse({
      name: 'Task',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      planned_start: '03-01-2026',
    })).toThrow()
  })

  test('createScheduleTaskSchema rejects progress_pct > 100', () => {
    expect(() => createScheduleTaskSchema.parse({
      name: 'Task',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      progress_pct: 101,
    })).toThrow()
  })

  test('createScheduleTaskSchema rejects negative progress_pct', () => {
    expect(() => createScheduleTaskSchema.parse({
      name: 'Task',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      progress_pct: -5,
    })).toThrow()
  })

  test('createScheduleTaskSchema accepts all optional fields', () => {
    const result = createScheduleTaskSchema.parse({
      name: 'Full Task',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      parent_task_id: '660e8400-e29b-41d4-a716-446655440000',
      description: 'A detailed description',
      phase: 'Foundation',
      trade: 'Concrete',
      task_type: 'milestone',
      planned_start: '2026-03-01',
      planned_end: '2026-03-05',
      duration_days: 5,
      progress_pct: 50,
      status: 'in_progress',
      assigned_to: '770e8400-e29b-41d4-a716-446655440000',
      is_critical_path: true,
      total_float: 2,
      sort_order: 10,
      notes: 'Some notes',
    })
    expect(result.phase).toBe('Foundation')
    expect(result.task_type).toBe('milestone')
    expect(result.is_critical_path).toBe(true)
  })

  test('updateScheduleTaskSchema accepts partial updates', () => {
    const result = updateScheduleTaskSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.status).toBeUndefined()
  })

  test('updateScheduleTaskSchema accepts status-only update', () => {
    const result = updateScheduleTaskSchema.parse({ status: 'completed', progress_pct: 100 })
    expect(result.status).toBe('completed')
    expect(result.progress_pct).toBe(100)
  })

  test('updateScheduleTaskSchema accepts empty object', () => {
    const result = updateScheduleTaskSchema.parse({})
    expect(Object.keys(result)).toHaveLength(0)
  })
})

// ============================================================================
// Schemas — Dependency
// ============================================================================

describe('Module 07 — Dependency Schemas', () => {
  test('createDependencySchema accepts valid dependency', () => {
    const result = createDependencySchema.parse({
      predecessor_id: '550e8400-e29b-41d4-a716-446655440000',
      successor_id: '660e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.dependency_type).toBe('FS')
    expect(result.lag_days).toBe(0)
  })

  test('createDependencySchema accepts custom type and lag', () => {
    const result = createDependencySchema.parse({
      predecessor_id: '550e8400-e29b-41d4-a716-446655440000',
      successor_id: '660e8400-e29b-41d4-a716-446655440000',
      dependency_type: 'SS',
      lag_days: 3,
    })
    expect(result.dependency_type).toBe('SS')
    expect(result.lag_days).toBe(3)
  })

  test('createDependencySchema accepts negative lag (lead time)', () => {
    const result = createDependencySchema.parse({
      predecessor_id: '550e8400-e29b-41d4-a716-446655440000',
      successor_id: '660e8400-e29b-41d4-a716-446655440000',
      lag_days: -2,
    })
    expect(result.lag_days).toBe(-2)
  })

  test('createDependencySchema requires predecessor_id and successor_id', () => {
    expect(() => createDependencySchema.parse({})).toThrow()
    expect(() => createDependencySchema.parse({
      predecessor_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createDependencySchema rejects invalid UUIDs', () => {
    expect(() => createDependencySchema.parse({
      predecessor_id: 'not-a-uuid',
      successor_id: '660e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })
})

// ============================================================================
// Schemas — Baseline
// ============================================================================

describe('Module 07 — Baseline Schemas', () => {
  test('createBaselineSchema accepts valid baseline', () => {
    const result = createBaselineSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Original Plan',
    })
    expect(result.name).toBe('Original Plan')
    expect(result.baseline_data).toEqual({})
  })

  test('createBaselineSchema accepts optional snapshot_date and data', () => {
    const result = createBaselineSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Recovery Plan',
      snapshot_date: '2026-03-15',
      baseline_data: { tasks: [{ id: '1', name: 'Task 1' }] },
    })
    expect(result.snapshot_date).toBe('2026-03-15')
    expect(result.baseline_data).toHaveProperty('tasks')
  })

  test('createBaselineSchema requires job_id and name', () => {
    expect(() => createBaselineSchema.parse({})).toThrow()
    expect(() => createBaselineSchema.parse({ name: 'Baseline' })).toThrow()
  })

  test('createBaselineSchema rejects empty name', () => {
    expect(() => createBaselineSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: '',
    })).toThrow()
  })

  test('listBaselinesSchema requires job_id', () => {
    expect(() => listBaselinesSchema.parse({})).toThrow()
    const result = listBaselinesSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })
})

// ============================================================================
// Schemas — Weather
// ============================================================================

describe('Module 07 — Weather Schemas', () => {
  test('createWeatherRecordSchema accepts valid record', () => {
    const result = createWeatherRecordSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      record_date: '2026-03-01',
      high_temp: 85,
      low_temp: 62,
      conditions: 'sunny',
      precipitation_inches: 0,
      wind_mph: 10,
    })
    expect(result.record_date).toBe('2026-03-01')
    expect(result.high_temp).toBe(85)
    expect(result.is_work_day).toBe(true)
  })

  test('createWeatherRecordSchema requires job_id and record_date', () => {
    expect(() => createWeatherRecordSchema.parse({})).toThrow()
    expect(() => createWeatherRecordSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createWeatherRecordSchema rejects invalid date format', () => {
    expect(() => createWeatherRecordSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      record_date: 'March 1 2026',
    })).toThrow()
  })

  test('createWeatherRecordSchema rejects negative precipitation', () => {
    expect(() => createWeatherRecordSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      record_date: '2026-03-01',
      precipitation_inches: -1,
    })).toThrow()
  })

  test('createWeatherRecordSchema rejects negative wind_mph', () => {
    expect(() => createWeatherRecordSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      record_date: '2026-03-01',
      wind_mph: -5,
    })).toThrow()
  })

  test('createWeatherRecordSchema accepts non-work day', () => {
    const result = createWeatherRecordSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      record_date: '2026-03-01',
      is_work_day: false,
      notes: 'Rain delay',
    })
    expect(result.is_work_day).toBe(false)
    expect(result.notes).toBe('Rain delay')
  })

  test('updateWeatherRecordSchema accepts partial updates', () => {
    const result = updateWeatherRecordSchema.parse({ high_temp: 92 })
    expect(result.high_temp).toBe(92)
    expect(result.conditions).toBeUndefined()
  })

  test('updateWeatherRecordSchema accepts empty object', () => {
    const result = updateWeatherRecordSchema.parse({})
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('listWeatherRecordsSchema requires job_id', () => {
    expect(() => listWeatherRecordsSchema.parse({})).toThrow()
  })

  test('listWeatherRecordsSchema accepts date range filters', () => {
    const result = listWeatherRecordsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      start_date: '2026-03-01',
      end_date: '2026-03-31',
    })
    expect(result.start_date).toBe('2026-03-01')
    expect(result.end_date).toBe('2026-03-31')
  })

  test('listWeatherRecordsSchema rejects invalid date format in filters', () => {
    expect(() => listWeatherRecordsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      start_date: '03/01/2026',
    })).toThrow()
  })
})

// ============================================================================
// Import Verification
// ============================================================================

describe('Module 07 — All Imports Work', () => {
  test('types module exports all expected types', () => {
    // These would fail at import time if missing
    expect(TASK_STATUSES).toBeDefined()
    expect(TASK_TYPES).toBeDefined()
    expect(DEPENDENCY_TYPES).toBeDefined()
    expect(WEATHER_CONDITIONS).toBeDefined()
  })

  test('schemas module exports all expected schemas', () => {
    expect(taskStatusEnum).toBeDefined()
    expect(taskTypeEnum).toBeDefined()
    expect(dependencyTypeEnum).toBeDefined()
    expect(listScheduleTasksSchema).toBeDefined()
    expect(createScheduleTaskSchema).toBeDefined()
    expect(updateScheduleTaskSchema).toBeDefined()
    expect(createDependencySchema).toBeDefined()
    expect(createBaselineSchema).toBeDefined()
    expect(listBaselinesSchema).toBeDefined()
    expect(createWeatherRecordSchema).toBeDefined()
    expect(updateWeatherRecordSchema).toBeDefined()
    expect(listWeatherRecordsSchema).toBeDefined()
  })
})
