/**
 * Module 34 — HR & Workforce Management Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 34 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  EmploymentStatus,
  EmploymentType,
  PayType,
  CertificationStatus,
  DocumentType,
  Employee,
  EmployeeCertification,
  EmployeeDocument,
  Department,
  Position,
} from '@/types/hr-workforce'

import {
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_TYPES,
  PAY_TYPES,
  CERTIFICATION_STATUSES,
  DOCUMENT_TYPES,
} from '@/types/hr-workforce'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  employmentStatusEnum,
  employmentTypeEnum,
  payTypeEnum,
  certificationStatusEnum,
  documentTypeEnum,
  listEmployeesSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  listCertificationsSchema,
  createCertificationSchema,
  updateCertificationSchema,
  listEmployeeDocumentsSchema,
  createEmployeeDocumentSchema,
  updateEmployeeDocumentSchema,
  listDepartmentsSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  listPositionsSchema,
  createPositionSchema,
  updatePositionSchema,
} from '@/lib/validation/schemas/hr-workforce'

// ============================================================================
// Type System
// ============================================================================

describe('Module 34 — HR & Workforce Types', () => {
  test('EmploymentStatus has 5 values', () => {
    const statuses: EmploymentStatus[] = [
      'active', 'inactive', 'terminated', 'on_leave', 'probation',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('EmploymentType has 5 values', () => {
    const types: EmploymentType[] = [
      'full_time', 'part_time', 'contract', 'seasonal', 'temp',
    ]
    expect(types).toHaveLength(5)
  })

  test('PayType has 2 values', () => {
    const types: PayType[] = ['hourly', 'salary']
    expect(types).toHaveLength(2)
  })

  test('CertificationStatus has 4 values', () => {
    const statuses: CertificationStatus[] = [
      'active', 'expired', 'pending_renewal', 'revoked',
    ]
    expect(statuses).toHaveLength(4)
  })

  test('DocumentType has 8 values', () => {
    const types: DocumentType[] = [
      'resume', 'contract', 'tax_form', 'identification', 'certification',
      'performance_review', 'disciplinary', 'other',
    ]
    expect(types).toHaveLength(8)
  })

  test('Employee interface has all required fields', () => {
    const emp: Employee = {
      id: '1', company_id: '1', user_id: null,
      employee_number: 'EMP-001', first_name: 'John', last_name: 'Doe',
      email: 'john@test.com', phone: '555-1234',
      hire_date: '2025-01-15', termination_date: null,
      department_id: null, position_id: null,
      employment_status: 'active', employment_type: 'full_time',
      base_wage: 35.00, pay_type: 'hourly',
      workers_comp_class: '5403',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '555-5678',
      address: '123 Main St', notes: null,
      created_by: '1', created_at: '2025-01-15', updated_at: '2025-01-15',
      deleted_at: null,
    }
    expect(emp.employee_number).toBe('EMP-001')
    expect(emp.employment_status).toBe('active')
    expect(emp.base_wage).toBe(35.00)
  })

  test('EmployeeCertification interface has all required fields', () => {
    const cert: EmployeeCertification = {
      id: '1', company_id: '1', employee_id: '1',
      certification_name: 'OSHA 30-Hour',
      certification_type: 'safety',
      certification_number: 'OSHA-12345',
      issuing_authority: 'OSHA',
      issued_date: '2025-06-01',
      expiration_date: '2026-06-01',
      status: 'active',
      document_url: 'https://example.com/cert.pdf',
      notes: null, created_by: '1',
      created_at: '2025-06-01', updated_at: '2025-06-01',
    }
    expect(cert.certification_name).toBe('OSHA 30-Hour')
    expect(cert.status).toBe('active')
    expect(cert.expiration_date).toBe('2026-06-01')
  })

  test('EmployeeDocument interface has all required fields', () => {
    const doc: EmployeeDocument = {
      id: '1', company_id: '1', employee_id: '1',
      document_type: 'tax_form', title: 'W-4 2025',
      description: 'Federal withholding form',
      file_url: 'https://example.com/w4.pdf',
      file_name: 'w4-2025.pdf', file_size_bytes: 102400,
      uploaded_by: '1',
      created_at: '2025-01-15', updated_at: '2025-01-15',
    }
    expect(doc.document_type).toBe('tax_form')
    expect(doc.title).toBe('W-4 2025')
    expect(doc.file_size_bytes).toBe(102400)
  })

  test('Department interface has all required fields', () => {
    const dept: Department = {
      id: '1', company_id: '1',
      name: 'Field Operations', description: 'All field crews',
      parent_id: null, head_user_id: '1',
      is_active: true,
      created_at: '2025-01-15', updated_at: '2025-01-15',
    }
    expect(dept.name).toBe('Field Operations')
    expect(dept.is_active).toBe(true)
  })

  test('Position interface has all required fields', () => {
    const pos: Position = {
      id: '1', company_id: '1',
      title: 'Project Manager', description: 'Manages construction projects',
      department_id: '1', pay_grade: 'Grade 5',
      is_active: true,
      created_at: '2025-01-15', updated_at: '2025-01-15',
    }
    expect(pos.title).toBe('Project Manager')
    expect(pos.pay_grade).toBe('Grade 5')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 34 — Constants', () => {
  test('EMPLOYMENT_STATUSES has 5 entries with value and label', () => {
    expect(EMPLOYMENT_STATUSES).toHaveLength(5)
    for (const s of EMPLOYMENT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('EMPLOYMENT_STATUSES includes all expected values', () => {
    const values = EMPLOYMENT_STATUSES.map((s) => s.value)
    expect(values).toContain('active')
    expect(values).toContain('inactive')
    expect(values).toContain('terminated')
    expect(values).toContain('on_leave')
    expect(values).toContain('probation')
  })

  test('EMPLOYMENT_TYPES has 5 entries with value and label', () => {
    expect(EMPLOYMENT_TYPES).toHaveLength(5)
    for (const t of EMPLOYMENT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('PAY_TYPES has 2 entries with value and label', () => {
    expect(PAY_TYPES).toHaveLength(2)
    const values = PAY_TYPES.map((t) => t.value)
    expect(values).toContain('hourly')
    expect(values).toContain('salary')
  })

  test('CERTIFICATION_STATUSES has 4 entries with value and label', () => {
    expect(CERTIFICATION_STATUSES).toHaveLength(4)
    for (const s of CERTIFICATION_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('DOCUMENT_TYPES has 8 entries with value and label', () => {
    expect(DOCUMENT_TYPES).toHaveLength(8)
    for (const t of DOCUMENT_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('DOCUMENT_TYPES includes all expected values', () => {
    const values = DOCUMENT_TYPES.map((t) => t.value)
    expect(values).toContain('resume')
    expect(values).toContain('contract')
    expect(values).toContain('tax_form')
    expect(values).toContain('identification')
    expect(values).toContain('certification')
    expect(values).toContain('performance_review')
    expect(values).toContain('disciplinary')
    expect(values).toContain('other')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 34 — Enum Schemas', () => {
  test('employmentStatusEnum accepts all 5 statuses', () => {
    for (const s of ['active', 'inactive', 'terminated', 'on_leave', 'probation']) {
      expect(employmentStatusEnum.parse(s)).toBe(s)
    }
  })

  test('employmentStatusEnum rejects invalid status', () => {
    expect(() => employmentStatusEnum.parse('fired')).toThrow()
  })

  test('employmentTypeEnum accepts all 5 types', () => {
    for (const t of ['full_time', 'part_time', 'contract', 'seasonal', 'temp']) {
      expect(employmentTypeEnum.parse(t)).toBe(t)
    }
  })

  test('employmentTypeEnum rejects invalid type', () => {
    expect(() => employmentTypeEnum.parse('freelance')).toThrow()
  })

  test('payTypeEnum accepts hourly and salary', () => {
    expect(payTypeEnum.parse('hourly')).toBe('hourly')
    expect(payTypeEnum.parse('salary')).toBe('salary')
  })

  test('payTypeEnum rejects invalid type', () => {
    expect(() => payTypeEnum.parse('commission')).toThrow()
  })

  test('certificationStatusEnum accepts all 4 statuses', () => {
    for (const s of ['active', 'expired', 'pending_renewal', 'revoked']) {
      expect(certificationStatusEnum.parse(s)).toBe(s)
    }
  })

  test('certificationStatusEnum rejects invalid status', () => {
    expect(() => certificationStatusEnum.parse('suspended')).toThrow()
  })

  test('documentTypeEnum accepts all 8 types', () => {
    for (const t of ['resume', 'contract', 'tax_form', 'identification', 'certification', 'performance_review', 'disciplinary', 'other']) {
      expect(documentTypeEnum.parse(t)).toBe(t)
    }
  })

  test('documentTypeEnum rejects invalid type', () => {
    expect(() => documentTypeEnum.parse('photo')).toThrow()
  })
})

// ============================================================================
// Employee Schemas
// ============================================================================

describe('Module 34 — Employee Schemas', () => {
  test('listEmployeesSchema accepts valid params', () => {
    const result = listEmployeesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listEmployeesSchema rejects limit > 100', () => {
    expect(() => listEmployeesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listEmployeesSchema accepts all filters', () => {
    const result = listEmployeesSchema.parse({
      employment_status: 'active',
      employment_type: 'full_time',
      department_id: '550e8400-e29b-41d4-a716-446655440000',
      position_id: '550e8400-e29b-41d4-a716-446655440000',
      q: 'John',
    })
    expect(result.employment_status).toBe('active')
    expect(result.employment_type).toBe('full_time')
    expect(result.q).toBe('John')
  })

  test('createEmployeeSchema accepts valid employee', () => {
    const result = createEmployeeSchema.parse({
      employee_number: 'EMP-001',
      first_name: 'John',
      last_name: 'Doe',
      hire_date: '2025-01-15',
    })
    expect(result.employee_number).toBe('EMP-001')
    expect(result.first_name).toBe('John')
    expect(result.employment_status).toBe('active')
    expect(result.employment_type).toBe('full_time')
    expect(result.base_wage).toBe(0)
    expect(result.pay_type).toBe('hourly')
  })

  test('createEmployeeSchema requires employee_number, first_name, last_name, hire_date', () => {
    expect(() => createEmployeeSchema.parse({})).toThrow()
    expect(() => createEmployeeSchema.parse({ employee_number: 'EMP-001' })).toThrow()
    expect(() => createEmployeeSchema.parse({
      employee_number: 'EMP-001', first_name: 'John',
    })).toThrow()
    expect(() => createEmployeeSchema.parse({
      employee_number: 'EMP-001', first_name: 'John', last_name: 'Doe',
    })).toThrow()
  })

  test('createEmployeeSchema rejects employee_number > 50 chars', () => {
    expect(() => createEmployeeSchema.parse({
      employee_number: 'A'.repeat(51),
      first_name: 'John', last_name: 'Doe', hire_date: '2025-01-15',
    })).toThrow()
  })

  test('createEmployeeSchema rejects invalid hire_date format', () => {
    expect(() => createEmployeeSchema.parse({
      employee_number: 'EMP-001', first_name: 'John', last_name: 'Doe',
      hire_date: 'January 15',
    })).toThrow()
  })

  test('createEmployeeSchema accepts full employee with all fields', () => {
    const result = createEmployeeSchema.parse({
      employee_number: 'EMP-001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@test.com',
      phone: '555-1234',
      hire_date: '2025-01-15',
      department_id: '550e8400-e29b-41d4-a716-446655440000',
      position_id: '550e8400-e29b-41d4-a716-446655440000',
      employment_status: 'probation',
      employment_type: 'contract',
      base_wage: 45.50,
      pay_type: 'salary',
      workers_comp_class: '5403',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '555-5678',
      address: '123 Main St',
      notes: 'New hire',
    })
    expect(result.email).toBe('john@test.com')
    expect(result.employment_status).toBe('probation')
    expect(result.base_wage).toBe(45.50)
  })

  test('createEmployeeSchema rejects negative base_wage', () => {
    expect(() => createEmployeeSchema.parse({
      employee_number: 'EMP-001', first_name: 'John', last_name: 'Doe',
      hire_date: '2025-01-15', base_wage: -10,
    })).toThrow()
  })

  test('updateEmployeeSchema accepts partial updates', () => {
    const result = updateEmployeeSchema.parse({ first_name: 'Jane' })
    expect(result.first_name).toBe('Jane')
    expect(result.last_name).toBeUndefined()
  })

  test('updateEmployeeSchema accepts status change', () => {
    const result = updateEmployeeSchema.parse({
      employment_status: 'terminated',
      termination_date: '2026-02-23',
    })
    expect(result.employment_status).toBe('terminated')
    expect(result.termination_date).toBe('2026-02-23')
  })
})

// ============================================================================
// Certification Schemas
// ============================================================================

describe('Module 34 — Certification Schemas', () => {
  test('listCertificationsSchema accepts valid params with defaults', () => {
    const result = listCertificationsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listCertificationsSchema accepts filters', () => {
    const result = listCertificationsSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'expired',
      q: 'OSHA',
    })
    expect(result.employee_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('expired')
    expect(result.q).toBe('OSHA')
  })

  test('createCertificationSchema accepts valid certification', () => {
    const result = createCertificationSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      certification_name: 'OSHA 30-Hour',
    })
    expect(result.certification_name).toBe('OSHA 30-Hour')
    expect(result.status).toBe('active')
  })

  test('createCertificationSchema requires employee_id and certification_name', () => {
    expect(() => createCertificationSchema.parse({})).toThrow()
    expect(() => createCertificationSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createCertificationSchema rejects certification_name > 255 chars', () => {
    expect(() => createCertificationSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      certification_name: 'A'.repeat(256),
    })).toThrow()
  })

  test('createCertificationSchema accepts full certification', () => {
    const result = createCertificationSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      certification_name: 'OSHA 30-Hour',
      certification_type: 'safety',
      certification_number: 'OSHA-12345',
      issuing_authority: 'OSHA',
      issued_date: '2025-06-01',
      expiration_date: '2026-06-01',
      status: 'active',
      document_url: 'https://example.com/cert.pdf',
      notes: 'Annual renewal',
    })
    expect(result.issuing_authority).toBe('OSHA')
    expect(result.expiration_date).toBe('2026-06-01')
  })

  test('createCertificationSchema validates date format', () => {
    expect(() => createCertificationSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      certification_name: 'OSHA 30-Hour',
      issued_date: 'June 1 2025',
    })).toThrow()
  })

  test('updateCertificationSchema accepts partial updates', () => {
    const result = updateCertificationSchema.parse({ status: 'expired' })
    expect(result.status).toBe('expired')
    expect(result.certification_name).toBeUndefined()
  })
})

// ============================================================================
// Document Schemas
// ============================================================================

describe('Module 34 — Document Schemas', () => {
  test('listEmployeeDocumentsSchema accepts valid params with defaults', () => {
    const result = listEmployeeDocumentsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listEmployeeDocumentsSchema accepts filters', () => {
    const result = listEmployeeDocumentsSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      document_type: 'tax_form',
      q: 'W-4',
    })
    expect(result.document_type).toBe('tax_form')
    expect(result.q).toBe('W-4')
  })

  test('createEmployeeDocumentSchema accepts valid document', () => {
    const result = createEmployeeDocumentSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'W-4 2025',
    })
    expect(result.title).toBe('W-4 2025')
    expect(result.document_type).toBe('other')
  })

  test('createEmployeeDocumentSchema requires employee_id and title', () => {
    expect(() => createEmployeeDocumentSchema.parse({})).toThrow()
    expect(() => createEmployeeDocumentSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createEmployeeDocumentSchema rejects title > 255 chars', () => {
    expect(() => createEmployeeDocumentSchema.parse({
      employee_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createEmployeeDocumentSchema accepts all document types', () => {
    for (const dt of ['resume', 'contract', 'tax_form', 'identification', 'certification', 'performance_review', 'disciplinary', 'other']) {
      const result = createEmployeeDocumentSchema.parse({
        employee_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Doc',
        document_type: dt,
      })
      expect(result.document_type).toBe(dt)
    }
  })

  test('updateEmployeeDocumentSchema accepts partial updates', () => {
    const result = updateEmployeeDocumentSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
    expect(result.document_type).toBeUndefined()
  })
})

// ============================================================================
// Department Schemas
// ============================================================================

describe('Module 34 — Department Schemas', () => {
  test('listDepartmentsSchema accepts valid params with defaults', () => {
    const result = listDepartmentsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listDepartmentsSchema accepts is_active filter', () => {
    const result = listDepartmentsSchema.parse({ is_active: 'true' })
    expect(result.is_active).toBe(true)
  })

  test('createDepartmentSchema accepts valid department', () => {
    const result = createDepartmentSchema.parse({ name: 'Field Operations' })
    expect(result.name).toBe('Field Operations')
    expect(result.is_active).toBe(true)
  })

  test('createDepartmentSchema requires name', () => {
    expect(() => createDepartmentSchema.parse({})).toThrow()
  })

  test('createDepartmentSchema rejects name > 200 chars', () => {
    expect(() => createDepartmentSchema.parse({ name: 'A'.repeat(201) })).toThrow()
  })

  test('createDepartmentSchema accepts full department', () => {
    const result = createDepartmentSchema.parse({
      name: 'Field Operations',
      description: 'All field crews and supervisors',
      parent_id: '550e8400-e29b-41d4-a716-446655440000',
      head_user_id: '550e8400-e29b-41d4-a716-446655440000',
      is_active: true,
    })
    expect(result.description).toBe('All field crews and supervisors')
    expect(result.parent_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('updateDepartmentSchema accepts partial updates', () => {
    const result = updateDepartmentSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
    expect(result.description).toBeUndefined()
  })

  test('updateDepartmentSchema accepts is_active toggle', () => {
    const result = updateDepartmentSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
  })
})

// ============================================================================
// Position Schemas
// ============================================================================

describe('Module 34 — Position Schemas', () => {
  test('listPositionsSchema accepts valid params with defaults', () => {
    const result = listPositionsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listPositionsSchema accepts department_id and is_active filters', () => {
    const result = listPositionsSchema.parse({
      department_id: '550e8400-e29b-41d4-a716-446655440000',
      is_active: 'false',
    })
    expect(result.department_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.is_active).toBe(false)
  })

  test('createPositionSchema accepts valid position', () => {
    const result = createPositionSchema.parse({ title: 'Project Manager' })
    expect(result.title).toBe('Project Manager')
    expect(result.is_active).toBe(true)
  })

  test('createPositionSchema requires title', () => {
    expect(() => createPositionSchema.parse({})).toThrow()
  })

  test('createPositionSchema rejects title > 200 chars', () => {
    expect(() => createPositionSchema.parse({ title: 'A'.repeat(201) })).toThrow()
  })

  test('createPositionSchema accepts full position', () => {
    const result = createPositionSchema.parse({
      title: 'Project Manager',
      description: 'Manages construction projects',
      department_id: '550e8400-e29b-41d4-a716-446655440000',
      pay_grade: 'Grade 5',
      is_active: true,
    })
    expect(result.description).toBe('Manages construction projects')
    expect(result.pay_grade).toBe('Grade 5')
  })

  test('updatePositionSchema accepts partial updates', () => {
    const result = updatePositionSchema.parse({ title: 'Senior PM' })
    expect(result.title).toBe('Senior PM')
    expect(result.description).toBeUndefined()
  })

  test('updatePositionSchema accepts is_active toggle', () => {
    const result = updatePositionSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
  })
})
