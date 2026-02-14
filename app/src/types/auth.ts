/**
 * Auth & Access Control Types
 * Module 01 — Permission types, role hierarchy, auth context
 */

import type { UserRole } from './database'

// ============================================================================
// Permission System
// ============================================================================

/** Resources that can be permissioned */
export type PermissionResource =
  | 'jobs'
  | 'clients'
  | 'vendors'
  | 'invoices'
  | 'draws'
  | 'budgets'
  | 'cost_codes'
  | 'daily_logs'
  | 'documents'
  | 'schedules'
  | 'change_orders'
  | 'purchase_orders'
  | 'lien_waivers'
  | 'users'
  | 'roles'
  | 'settings'
  | 'billing'

/** Actions that can be taken on a resource */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export'

/** Scope of the permission */
export type PermissionScope = 'all' | 'own' | 'assigned' | 'none'

/** Full permission string: resource:action:scope */
export type Permission = `${PermissionResource}:${PermissionAction}:${PermissionScope}`

/** Company permissions mode */
export type PermissionsMode = 'open' | 'standard' | 'strict'

// ============================================================================
// Role Hierarchy
// ============================================================================

/** Numeric hierarchy: higher number = more authority */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 7,
  admin: 6,
  pm: 5,
  superintendent: 4,
  office: 3,
  field: 2,
  read_only: 1,
} as const

/** All canonical roles in order */
export const CANONICAL_ROLES: UserRole[] = [
  'owner',
  'admin',
  'pm',
  'superintendent',
  'office',
  'field',
  'read_only',
] as const

// ============================================================================
// Auth Context
// ============================================================================

/** User profile as returned from Supabase users table */
export interface UserProfile {
  id: string
  company_id: string
  email: string
  name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  last_login_at: string | null
  preferences: Record<string, unknown> | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/** Auth context available to components */
export interface AuthContext {
  user: { id: string; email: string } | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  can: (resource: PermissionResource, action: PermissionAction, scope?: PermissionScope) => boolean
  hasRole: (requiredRole: UserRole) => boolean
}

/** Company settings relevant to auth */
export interface CompanyAuthSettings {
  permissions_mode: PermissionsMode
}

// ============================================================================
// Roles Table Types
// ============================================================================

export interface Role {
  id: string
  company_id: string
  name: string
  description: string | null
  base_role: UserRole
  is_system: boolean
  permissions: Permission[]
  field_overrides: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RoleInsert {
  id?: string
  company_id: string
  name: string
  description?: string | null
  base_role: UserRole
  is_system?: boolean
  permissions?: Permission[]
  field_overrides?: Record<string, unknown>
}

export interface RoleUpdate {
  name?: string
  description?: string | null
  permissions?: Permission[]
  field_overrides?: Record<string, unknown>
}

// ============================================================================
// Auth Audit Log Types
// ============================================================================

export type AuthEventType =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset'
  | 'password_changed'
  | 'user_invited'
  | 'user_deactivated'
  | 'user_reactivated'
  | 'role_changed'
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'

export interface AuthAuditLog {
  id: string
  company_id: string
  user_id: string | null
  event_type: AuthEventType
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuthAuditLogInsert {
  company_id: string
  user_id?: string | null
  event_type: AuthEventType
  ip_address?: string | null
  user_agent?: string | null
  metadata?: Record<string, unknown>
}

// ============================================================================
// Project User Roles Types
// ============================================================================

export interface ProjectUserRole {
  id: string
  company_id: string
  user_id: string
  job_id: string
  role_id: string | null
  role_override: UserRole | null
  granted_by: string
  created_at: string
}

export interface ProjectUserRoleInsert {
  company_id: string
  user_id: string
  job_id: string
  role_id?: string | null
  role_override?: UserRole | null
  granted_by: string
}
