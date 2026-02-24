/**
 * Module 35 — Equipment & Asset Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 35 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  EquipmentStatus,
  EquipmentType,
  OwnershipType,
  MaintenanceType,
  MaintenanceStatus,
  AssignmentStatus,
  InspectionType,
  InspectionResult,
  CostType,
  Equipment,
  EquipmentAssignment,
  EquipmentMaintenance,
  EquipmentInspection,
  EquipmentCost,
} from '@/types/equipment'

import {
  EQUIPMENT_STATUSES,
  EQUIPMENT_TYPES,
  OWNERSHIP_TYPES,
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  ASSIGNMENT_STATUSES,
  INSPECTION_TYPES,
  INSPECTION_RESULTS,
  COST_TYPES,
} from '@/types/equipment'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  equipmentStatusEnum,
  equipmentTypeEnum,
  ownershipTypeEnum,
  maintenanceTypeEnum,
  maintenanceStatusEnum,
  assignmentStatusEnum,
  inspectionTypeEnum,
  inspectionResultEnum,
  costTypeEnum,
  listEquipmentSchema,
  createEquipmentSchema,
  updateEquipmentSchema,
  listAssignmentsSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  listMaintenanceSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  listInspectionsSchema,
  createInspectionSchema,
  updateInspectionSchema,
  listCostsSchema,
  createCostSchema,
  updateCostSchema,
} from '@/lib/validation/schemas/equipment'

// ============================================================================
// Type System
// ============================================================================

describe('Module 35 — Equipment Types', () => {
  test('EquipmentStatus has 5 values', () => {
    const statuses: EquipmentStatus[] = [
      'available', 'assigned', 'maintenance', 'out_of_service', 'retired',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('EquipmentType has 8 values', () => {
    const types: EquipmentType[] = [
      'heavy_machinery', 'vehicle', 'power_tool', 'hand_tool', 'scaffolding', 'safety_equipment', 'measuring', 'other',
    ]
    expect(types).toHaveLength(8)
  })

  test('OwnershipType has 3 values', () => {
    const types: OwnershipType[] = ['owned', 'leased', 'rented']
    expect(types).toHaveLength(3)
  })

  test('MaintenanceType has 4 values', () => {
    const types: MaintenanceType[] = ['preventive', 'corrective', 'inspection', 'calibration']
    expect(types).toHaveLength(4)
  })

  test('MaintenanceStatus has 5 values', () => {
    const statuses: MaintenanceStatus[] = ['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled']
    expect(statuses).toHaveLength(5)
  })

  test('AssignmentStatus has 3 values', () => {
    const statuses: AssignmentStatus[] = ['active', 'completed', 'cancelled']
    expect(statuses).toHaveLength(3)
  })

  test('InspectionType has 4 values', () => {
    const types: InspectionType[] = ['pre_use', 'post_use', 'periodic', 'safety']
    expect(types).toHaveLength(4)
  })

  test('InspectionResult has 3 values', () => {
    const results: InspectionResult[] = ['pass', 'fail', 'conditional']
    expect(results).toHaveLength(3)
  })

  test('CostType has 6 values', () => {
    const types: CostType[] = ['daily_rate', 'fuel', 'repair', 'insurance', 'transport', 'other']
    expect(types).toHaveLength(6)
  })

  test('Equipment interface has all required fields', () => {
    const e: Equipment = {
      id: '1', company_id: '1', name: 'CAT 320 Excavator',
      description: 'Hydraulic excavator', equipment_type: 'heavy_machinery',
      status: 'available', ownership_type: 'owned',
      make: 'Caterpillar', model: '320', serial_number: 'CAT320-001',
      year: 2022, purchase_date: '2022-03-15', purchase_price: 250000,
      current_value: 200000, daily_rate: 500, location: 'Main yard',
      notes: null, photo_urls: [], created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(e.name).toBe('CAT 320 Excavator')
    expect(e.equipment_type).toBe('heavy_machinery')
    expect(e.purchase_price).toBe(250000)
  })

  test('EquipmentAssignment interface has all required fields', () => {
    const a: EquipmentAssignment = {
      id: '1', company_id: '1', equipment_id: '1', job_id: '1',
      assigned_to: '1', assigned_by: '1', start_date: '2026-01-15',
      end_date: null, status: 'active', hours_used: 40,
      notes: null, created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(a.status).toBe('active')
    expect(a.hours_used).toBe(40)
  })

  test('EquipmentMaintenance interface has all required fields', () => {
    const m: EquipmentMaintenance = {
      id: '1', company_id: '1', equipment_id: '1',
      maintenance_type: 'preventive', status: 'scheduled',
      title: 'Oil Change', description: null,
      scheduled_date: '2026-02-01', completed_date: null,
      performed_by: null, service_provider: 'CAT Dealer',
      parts_cost: 150, labor_cost: 200, total_cost: 350,
      notes: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(m.title).toBe('Oil Change')
    expect(m.total_cost).toBe(350)
  })

  test('EquipmentInspection interface has all required fields', () => {
    const i: EquipmentInspection = {
      id: '1', company_id: '1', equipment_id: '1',
      inspection_type: 'pre_use', result: 'pass',
      inspection_date: '2026-01-15', inspector_id: '1',
      checklist: [], deficiencies: null, corrective_action: null,
      notes: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(i.inspection_type).toBe('pre_use')
    expect(i.result).toBe('pass')
  })

  test('EquipmentCost interface has all required fields', () => {
    const c: EquipmentCost = {
      id: '1', company_id: '1', equipment_id: '1', job_id: '1',
      cost_type: 'fuel', amount: 250.50, cost_date: '2026-01-15',
      description: 'Fuel fill', vendor_id: null, receipt_url: null,
      notes: null, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(c.cost_type).toBe('fuel')
    expect(c.amount).toBe(250.50)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 35 — Constants', () => {
  test('EQUIPMENT_STATUSES has 5 entries with value and label', () => {
    expect(EQUIPMENT_STATUSES).toHaveLength(5)
    for (const s of EQUIPMENT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('EQUIPMENT_STATUSES includes all expected values', () => {
    const values = EQUIPMENT_STATUSES.map((s) => s.value)
    expect(values).toContain('available')
    expect(values).toContain('assigned')
    expect(values).toContain('maintenance')
    expect(values).toContain('out_of_service')
    expect(values).toContain('retired')
  })

  test('EQUIPMENT_TYPES has 8 entries with value and label', () => {
    expect(EQUIPMENT_TYPES).toHaveLength(8)
    for (const t of EQUIPMENT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('OWNERSHIP_TYPES has 3 entries with value and label', () => {
    expect(OWNERSHIP_TYPES).toHaveLength(3)
    const values = OWNERSHIP_TYPES.map((o) => o.value)
    expect(values).toContain('owned')
    expect(values).toContain('leased')
    expect(values).toContain('rented')
  })

  test('MAINTENANCE_TYPES has 4 entries with value and label', () => {
    expect(MAINTENANCE_TYPES).toHaveLength(4)
    for (const m of MAINTENANCE_TYPES) {
      expect(m).toHaveProperty('value')
      expect(m).toHaveProperty('label')
    }
  })

  test('MAINTENANCE_STATUSES has 5 entries with value and label', () => {
    expect(MAINTENANCE_STATUSES).toHaveLength(5)
    for (const s of MAINTENANCE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('ASSIGNMENT_STATUSES has 3 entries with value and label', () => {
    expect(ASSIGNMENT_STATUSES).toHaveLength(3)
    const values = ASSIGNMENT_STATUSES.map((a) => a.value)
    expect(values).toContain('active')
    expect(values).toContain('completed')
    expect(values).toContain('cancelled')
  })

  test('INSPECTION_TYPES has 4 entries with value and label', () => {
    expect(INSPECTION_TYPES).toHaveLength(4)
    for (const t of INSPECTION_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    }
  })

  test('INSPECTION_RESULTS has 3 entries with value and label', () => {
    expect(INSPECTION_RESULTS).toHaveLength(3)
    const values = INSPECTION_RESULTS.map((r) => r.value)
    expect(values).toContain('pass')
    expect(values).toContain('fail')
    expect(values).toContain('conditional')
  })

  test('COST_TYPES has 6 entries with value and label', () => {
    expect(COST_TYPES).toHaveLength(6)
    const values = COST_TYPES.map((c) => c.value)
    expect(values).toContain('daily_rate')
    expect(values).toContain('fuel')
    expect(values).toContain('repair')
    expect(values).toContain('insurance')
    expect(values).toContain('transport')
    expect(values).toContain('other')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 35 — Enum Schemas', () => {
  test('equipmentStatusEnum accepts all 5 statuses', () => {
    for (const s of ['available', 'assigned', 'maintenance', 'out_of_service', 'retired']) {
      expect(equipmentStatusEnum.parse(s)).toBe(s)
    }
  })

  test('equipmentStatusEnum rejects invalid status', () => {
    expect(() => equipmentStatusEnum.parse('broken')).toThrow()
  })

  test('equipmentTypeEnum accepts all 8 types', () => {
    for (const t of ['heavy_machinery', 'vehicle', 'power_tool', 'hand_tool', 'scaffolding', 'safety_equipment', 'measuring', 'other']) {
      expect(equipmentTypeEnum.parse(t)).toBe(t)
    }
  })

  test('equipmentTypeEnum rejects invalid type', () => {
    expect(() => equipmentTypeEnum.parse('crane')).toThrow()
  })

  test('ownershipTypeEnum accepts all 3 types', () => {
    for (const t of ['owned', 'leased', 'rented']) {
      expect(ownershipTypeEnum.parse(t)).toBe(t)
    }
  })

  test('ownershipTypeEnum rejects invalid type', () => {
    expect(() => ownershipTypeEnum.parse('borrowed')).toThrow()
  })

  test('maintenanceTypeEnum accepts all 4 types', () => {
    for (const t of ['preventive', 'corrective', 'inspection', 'calibration']) {
      expect(maintenanceTypeEnum.parse(t)).toBe(t)
    }
  })

  test('maintenanceTypeEnum rejects invalid type', () => {
    expect(() => maintenanceTypeEnum.parse('emergency')).toThrow()
  })

  test('maintenanceStatusEnum accepts all 5 statuses', () => {
    for (const s of ['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled']) {
      expect(maintenanceStatusEnum.parse(s)).toBe(s)
    }
  })

  test('maintenanceStatusEnum rejects invalid status', () => {
    expect(() => maintenanceStatusEnum.parse('pending')).toThrow()
  })

  test('assignmentStatusEnum accepts all 3 statuses', () => {
    for (const s of ['active', 'completed', 'cancelled']) {
      expect(assignmentStatusEnum.parse(s)).toBe(s)
    }
  })

  test('assignmentStatusEnum rejects invalid status', () => {
    expect(() => assignmentStatusEnum.parse('draft')).toThrow()
  })

  test('inspectionTypeEnum accepts all 4 types', () => {
    for (const t of ['pre_use', 'post_use', 'periodic', 'safety']) {
      expect(inspectionTypeEnum.parse(t)).toBe(t)
    }
  })

  test('inspectionTypeEnum rejects invalid type', () => {
    expect(() => inspectionTypeEnum.parse('annual')).toThrow()
  })

  test('inspectionResultEnum accepts all 3 results', () => {
    for (const r of ['pass', 'fail', 'conditional']) {
      expect(inspectionResultEnum.parse(r)).toBe(r)
    }
  })

  test('inspectionResultEnum rejects invalid result', () => {
    expect(() => inspectionResultEnum.parse('partial')).toThrow()
  })

  test('costTypeEnum accepts all 6 types', () => {
    for (const t of ['daily_rate', 'fuel', 'repair', 'insurance', 'transport', 'other']) {
      expect(costTypeEnum.parse(t)).toBe(t)
    }
  })

  test('costTypeEnum rejects invalid type', () => {
    expect(() => costTypeEnum.parse('depreciation')).toThrow()
  })
})

// ============================================================================
// Equipment Schemas
// ============================================================================

describe('Module 35 — Equipment Schemas', () => {
  test('listEquipmentSchema accepts valid params', () => {
    const result = listEquipmentSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listEquipmentSchema rejects limit > 100', () => {
    expect(() => listEquipmentSchema.parse({ limit: 200 })).toThrow()
  })

  test('listEquipmentSchema accepts all filters', () => {
    const result = listEquipmentSchema.parse({
      status: 'available',
      equipment_type: 'heavy_machinery',
      ownership_type: 'owned',
      q: 'excavator',
    })
    expect(result.status).toBe('available')
    expect(result.equipment_type).toBe('heavy_machinery')
    expect(result.ownership_type).toBe('owned')
    expect(result.q).toBe('excavator')
  })

  test('createEquipmentSchema accepts valid equipment', () => {
    const result = createEquipmentSchema.parse({
      name: 'CAT 320 Excavator',
    })
    expect(result.name).toBe('CAT 320 Excavator')
    expect(result.equipment_type).toBe('other')
    expect(result.status).toBe('available')
    expect(result.ownership_type).toBe('owned')
    expect(result.purchase_price).toBe(0)
    expect(result.current_value).toBe(0)
    expect(result.daily_rate).toBe(0)
    expect(result.photo_urls).toEqual([])
  })

  test('createEquipmentSchema requires name', () => {
    expect(() => createEquipmentSchema.parse({})).toThrow()
  })

  test('createEquipmentSchema rejects name > 255 chars', () => {
    expect(() => createEquipmentSchema.parse({ name: 'A'.repeat(256) })).toThrow()
  })

  test('createEquipmentSchema validates purchase_date format', () => {
    const result = createEquipmentSchema.parse({
      name: 'Test',
      purchase_date: '2026-01-15',
    })
    expect(result.purchase_date).toBe('2026-01-15')
  })

  test('createEquipmentSchema rejects invalid purchase_date format', () => {
    expect(() => createEquipmentSchema.parse({
      name: 'Test',
      purchase_date: '01/15/2026',
    })).toThrow()
  })

  test('createEquipmentSchema rejects negative purchase_price', () => {
    expect(() => createEquipmentSchema.parse({
      name: 'Test',
      purchase_price: -100,
    })).toThrow()
  })

  test('createEquipmentSchema accepts full equipment with all fields', () => {
    const result = createEquipmentSchema.parse({
      name: 'CAT 320 Excavator',
      description: 'Hydraulic excavator',
      equipment_type: 'heavy_machinery',
      status: 'available',
      ownership_type: 'owned',
      make: 'Caterpillar',
      model: '320',
      serial_number: 'CAT320-001',
      year: 2022,
      purchase_date: '2022-03-15',
      purchase_price: 250000,
      current_value: 200000,
      daily_rate: 500,
      location: 'Main yard',
      notes: 'Primary excavator',
    })
    expect(result.make).toBe('Caterpillar')
    expect(result.year).toBe(2022)
    expect(result.purchase_price).toBe(250000)
  })

  test('updateEquipmentSchema accepts partial updates', () => {
    const result = updateEquipmentSchema.parse({ status: 'maintenance', location: 'Shop' })
    expect(result.status).toBe('maintenance')
    expect(result.location).toBe('Shop')
    expect(result.name).toBeUndefined()
  })
})

// ============================================================================
// Assignment Schemas
// ============================================================================

describe('Module 35 — Assignment Schemas', () => {
  test('listAssignmentsSchema accepts valid params', () => {
    const result = listAssignmentsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listAssignmentsSchema accepts filters', () => {
    const result = listAssignmentsSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      status: 'active',
    })
    expect(result.equipment_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('active')
  })

  test('createAssignmentSchema accepts valid assignment', () => {
    const result = createAssignmentSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      start_date: '2026-01-15',
    })
    expect(result.equipment_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.start_date).toBe('2026-01-15')
    expect(result.status).toBe('active')
    expect(result.hours_used).toBe(0)
  })

  test('createAssignmentSchema requires equipment_id and start_date', () => {
    expect(() => createAssignmentSchema.parse({})).toThrow()
    expect(() => createAssignmentSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createAssignmentSchema validates date format', () => {
    expect(() => createAssignmentSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      start_date: 'Jan 15',
    })).toThrow()
  })

  test('updateAssignmentSchema accepts partial updates', () => {
    const result = updateAssignmentSchema.parse({ status: 'completed', hours_used: 80 })
    expect(result.status).toBe('completed')
    expect(result.hours_used).toBe(80)
    expect(result.job_id).toBeUndefined()
  })
})

// ============================================================================
// Maintenance Schemas
// ============================================================================

describe('Module 35 — Maintenance Schemas', () => {
  test('listMaintenanceSchema accepts valid params', () => {
    const result = listMaintenanceSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMaintenanceSchema accepts filters', () => {
    const result = listMaintenanceSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      maintenance_type: 'preventive',
      status: 'scheduled',
    })
    expect(result.maintenance_type).toBe('preventive')
    expect(result.status).toBe('scheduled')
  })

  test('createMaintenanceSchema accepts valid maintenance', () => {
    const result = createMaintenanceSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Oil Change',
    })
    expect(result.title).toBe('Oil Change')
    expect(result.maintenance_type).toBe('preventive')
    expect(result.status).toBe('scheduled')
    expect(result.parts_cost).toBe(0)
    expect(result.labor_cost).toBe(0)
    expect(result.total_cost).toBe(0)
  })

  test('createMaintenanceSchema requires equipment_id and title', () => {
    expect(() => createMaintenanceSchema.parse({})).toThrow()
    expect(() => createMaintenanceSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createMaintenanceSchema rejects title > 255 chars', () => {
    expect(() => createMaintenanceSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createMaintenanceSchema validates scheduled_date format', () => {
    const result = createMaintenanceSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Oil Change',
      scheduled_date: '2026-02-01',
    })
    expect(result.scheduled_date).toBe('2026-02-01')
  })

  test('updateMaintenanceSchema accepts partial updates', () => {
    const result = updateMaintenanceSchema.parse({ status: 'completed', total_cost: 350 })
    expect(result.status).toBe('completed')
    expect(result.total_cost).toBe(350)
    expect(result.title).toBeUndefined()
  })
})

// ============================================================================
// Inspection Schemas
// ============================================================================

describe('Module 35 — Inspection Schemas', () => {
  test('listInspectionsSchema accepts valid params', () => {
    const result = listInspectionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listInspectionsSchema accepts filters', () => {
    const result = listInspectionsSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      inspection_type: 'pre_use',
      result: 'pass',
    })
    expect(result.inspection_type).toBe('pre_use')
    expect(result.result).toBe('pass')
  })

  test('createInspectionSchema accepts valid inspection', () => {
    const result = createInspectionSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.equipment_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.inspection_type).toBe('pre_use')
    expect(result.result).toBe('pass')
    expect(result.checklist).toEqual([])
  })

  test('createInspectionSchema requires equipment_id', () => {
    expect(() => createInspectionSchema.parse({})).toThrow()
  })

  test('createInspectionSchema validates inspection_date format', () => {
    const result = createInspectionSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      inspection_date: '2026-01-15',
    })
    expect(result.inspection_date).toBe('2026-01-15')
  })

  test('createInspectionSchema rejects invalid inspection_date format', () => {
    expect(() => createInspectionSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      inspection_date: '01-15-2026',
    })).toThrow()
  })

  test('updateInspectionSchema accepts partial updates', () => {
    const result = updateInspectionSchema.parse({ result: 'fail', deficiencies: 'Hydraulic leak' })
    expect(result.result).toBe('fail')
    expect(result.deficiencies).toBe('Hydraulic leak')
    expect(result.inspection_type).toBeUndefined()
  })
})

// ============================================================================
// Cost Schemas
// ============================================================================

describe('Module 35 — Cost Schemas', () => {
  test('listCostsSchema accepts valid params', () => {
    const result = listCostsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listCostsSchema accepts filters', () => {
    const result = listCostsSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      job_id: '550e8400-e29b-41d4-a716-446655440001',
      cost_type: 'fuel',
    })
    expect(result.cost_type).toBe('fuel')
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('createCostSchema accepts valid cost', () => {
    const result = createCostSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 250.50,
    })
    expect(result.equipment_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.amount).toBe(250.50)
    expect(result.cost_type).toBe('daily_rate')
  })

  test('createCostSchema requires equipment_id and amount', () => {
    expect(() => createCostSchema.parse({})).toThrow()
    expect(() => createCostSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createCostSchema rejects negative amount', () => {
    expect(() => createCostSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: -50,
    })).toThrow()
  })

  test('createCostSchema validates cost_date format', () => {
    const result = createCostSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 100,
      cost_date: '2026-01-15',
    })
    expect(result.cost_date).toBe('2026-01-15')
  })

  test('createCostSchema rejects invalid cost_date format', () => {
    expect(() => createCostSchema.parse({
      equipment_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 100,
      cost_date: '01/15/2026',
    })).toThrow()
  })

  test('updateCostSchema accepts partial updates', () => {
    const result = updateCostSchema.parse({ amount: 300, cost_type: 'repair' })
    expect(result.amount).toBe(300)
    expect(result.cost_type).toBe('repair')
    expect(result.description).toBeUndefined()
  })
})
