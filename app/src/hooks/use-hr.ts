'use client'

/**
 * Module 34: HR & Workforce Management React Query Hooks
 *
 * Covers employees, certifications, documents, departments, and positions.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Employee,
  EmployeeCertification,
  EmployeeDocument,
  Department,
  Position,
} from '@/types/hr-workforce'

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Employees ────────────────────────────────────────────────────────────────

type EmployeeListParams = {
  page?: number
  limit?: number
  employment_status?: string
  employment_type?: string
  department_id?: string
  position_id?: string
  q?: string
}

type EmployeeCreateInput = {
  first_name: string
  last_name: string
  employee_number: string
  hire_date: string
  employment_status?: string | null
  employment_type?: string | null
  pay_type?: string | null
  base_wage?: number | null
  email?: string | null
  phone?: string | null
  department_id?: string | null
  position_id?: string | null
  address?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  notes?: string | null
}

const employeeHooks = createApiHooks<EmployeeListParams, EmployeeCreateInput>(
  'employees',
  '/api/v2/hr/employees'
)

export const useEmployees = employeeHooks.useList
export const useEmployee = employeeHooks.useDetail
export const useCreateEmployee = employeeHooks.useCreate
export const useUpdateEmployee = employeeHooks.useUpdate
export const useDeleteEmployee = employeeHooks.useDelete

// ── Employee Certifications ──────────────────────────────────────────────────

type CertListParams = {
  page?: number
  limit?: number
  employee_id?: string
  status?: string
}

type CertCreateInput = {
  employee_id: string
  certification_name: string
  certification_type?: string | null
  certification_number?: string | null
  issuing_authority?: string | null
  issued_date?: string | null
  expiration_date?: string | null
  status?: string
  document_url?: string | null
  notes?: string | null
}

const certHooks = createApiHooks<CertListParams, CertCreateInput>(
  'hr-certifications',
  '/api/v2/hr/certifications'
)

export const useHrCertifications = certHooks.useList
export const useHrCertification = certHooks.useDetail
export const useCreateHrCertification = certHooks.useCreate
export const useUpdateHrCertification = certHooks.useUpdate
export const useDeleteHrCertification = certHooks.useDelete

// ── Employee Documents ───────────────────────────────────────────────────────

type DocListParams = {
  page?: number
  limit?: number
  employee_id?: string
  document_type?: string
}

type DocCreateInput = {
  employee_id: string
  title: string
  document_type: string
  description?: string | null
  file_url?: string | null
  file_name?: string | null
  file_size_bytes?: number | null
}

const docHooks = createApiHooks<DocListParams, DocCreateInput>(
  'hr-documents',
  '/api/v2/hr/documents'
)

export const useHrDocuments = docHooks.useList
export const useHrDocument = docHooks.useDetail
export const useCreateHrDocument = docHooks.useCreate
export const useUpdateHrDocument = docHooks.useUpdate
export const useDeleteHrDocument = docHooks.useDelete

// ── Departments ──────────────────────────────────────────────────────────────

type DeptListParams = {
  page?: number
  limit?: number
  q?: string
}

type DeptCreateInput = {
  name: string
  description?: string | null
  parent_id?: string | null
  head_user_id?: string | null
  is_active?: boolean
}

const deptHooks = createApiHooks<DeptListParams, DeptCreateInput>(
  'departments',
  '/api/v2/hr/departments'
)

export const useDepartments = deptHooks.useList
export const useDepartment = deptHooks.useDetail
export const useCreateDepartment = deptHooks.useCreate
export const useUpdateDepartment = deptHooks.useUpdate
export const useDeleteDepartment = deptHooks.useDelete

// ── Positions ────────────────────────────────────────────────────────────────

type PositionListParams = {
  page?: number
  limit?: number
  department_id?: string
  q?: string
}

type PositionCreateInput = {
  title: string
  description?: string | null
  department_id?: string | null
  pay_grade?: string | null
  is_active?: boolean
}

const positionHooks = createApiHooks<PositionListParams, PositionCreateInput>(
  'positions',
  '/api/v2/hr/positions'
)

export const usePositions = positionHooks.useList
export const usePosition = positionHooks.useDetail
export const useCreatePosition = positionHooks.useCreate
export const useUpdatePosition = positionHooks.useUpdate
export const useDeletePosition = positionHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { Employee, EmployeeCertification, EmployeeDocument, Department, Position }
