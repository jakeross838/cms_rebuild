/**
 * Permission Resolution Engine
 * Module 01 — Pure functions, no DB, no React
 */

import {
  ROLE_HIERARCHY,
  type Permission,
  type PermissionAction,
  type PermissionResource,
  type PermissionScope,
  type PermissionsMode,
} from '@/types/auth'
import type { UserRole } from '@/types/database'

// ============================================================================
// Default Permissions Per Role
// ============================================================================

/** Default permissions for each canonical role (from Module 01 spec) */
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    // Full access to everything
    'jobs:create:all', 'jobs:read:all', 'jobs:update:all', 'jobs:delete:all', 'jobs:export:all',
    'clients:create:all', 'clients:read:all', 'clients:update:all', 'clients:delete:all', 'clients:export:all',
    'vendors:create:all', 'vendors:read:all', 'vendors:update:all', 'vendors:delete:all', 'vendors:export:all',
    'invoices:create:all', 'invoices:read:all', 'invoices:update:all', 'invoices:delete:all', 'invoices:approve:all', 'invoices:export:all',
    'draws:create:all', 'draws:read:all', 'draws:update:all', 'draws:delete:all', 'draws:approve:all', 'draws:export:all',
    'budgets:create:all', 'budgets:read:all', 'budgets:update:all', 'budgets:delete:all', 'budgets:approve:all', 'budgets:export:all',
    'cost_codes:create:all', 'cost_codes:read:all', 'cost_codes:update:all', 'cost_codes:delete:all',
    'daily_logs:create:all', 'daily_logs:read:all', 'daily_logs:update:all', 'daily_logs:delete:all', 'daily_logs:export:all',
    'documents:create:all', 'documents:read:all', 'documents:update:all', 'documents:delete:all', 'documents:export:all',
    'schedules:create:all', 'schedules:read:all', 'schedules:update:all', 'schedules:delete:all', 'schedules:export:all',
    'change_orders:create:all', 'change_orders:read:all', 'change_orders:update:all', 'change_orders:delete:all', 'change_orders:approve:all', 'change_orders:export:all',
    'purchase_orders:create:all', 'purchase_orders:read:all', 'purchase_orders:update:all', 'purchase_orders:delete:all', 'purchase_orders:approve:all', 'purchase_orders:export:all',
    'lien_waivers:create:all', 'lien_waivers:read:all', 'lien_waivers:update:all', 'lien_waivers:delete:all', 'lien_waivers:export:all',
    'users:create:all', 'users:read:all', 'users:update:all', 'users:delete:all',
    'roles:create:all', 'roles:read:all', 'roles:update:all', 'roles:delete:all',
    'settings:read:all', 'settings:update:all',
    'billing:read:all', 'billing:update:all',
  ],

  admin: [
    // Same as owner EXCEPT billing
    'jobs:create:all', 'jobs:read:all', 'jobs:update:all', 'jobs:delete:all', 'jobs:export:all',
    'clients:create:all', 'clients:read:all', 'clients:update:all', 'clients:delete:all', 'clients:export:all',
    'vendors:create:all', 'vendors:read:all', 'vendors:update:all', 'vendors:delete:all', 'vendors:export:all',
    'invoices:create:all', 'invoices:read:all', 'invoices:update:all', 'invoices:delete:all', 'invoices:approve:all', 'invoices:export:all',
    'draws:create:all', 'draws:read:all', 'draws:update:all', 'draws:delete:all', 'draws:approve:all', 'draws:export:all',
    'budgets:create:all', 'budgets:read:all', 'budgets:update:all', 'budgets:delete:all', 'budgets:approve:all', 'budgets:export:all',
    'cost_codes:create:all', 'cost_codes:read:all', 'cost_codes:update:all', 'cost_codes:delete:all',
    'daily_logs:create:all', 'daily_logs:read:all', 'daily_logs:update:all', 'daily_logs:delete:all', 'daily_logs:export:all',
    'documents:create:all', 'documents:read:all', 'documents:update:all', 'documents:delete:all', 'documents:export:all',
    'schedules:create:all', 'schedules:read:all', 'schedules:update:all', 'schedules:delete:all', 'schedules:export:all',
    'change_orders:create:all', 'change_orders:read:all', 'change_orders:update:all', 'change_orders:delete:all', 'change_orders:approve:all', 'change_orders:export:all',
    'purchase_orders:create:all', 'purchase_orders:read:all', 'purchase_orders:update:all', 'purchase_orders:delete:all', 'purchase_orders:approve:all', 'purchase_orders:export:all',
    'lien_waivers:create:all', 'lien_waivers:read:all', 'lien_waivers:update:all', 'lien_waivers:delete:all', 'lien_waivers:export:all',
    'users:create:all', 'users:read:all', 'users:update:all', 'users:delete:all',
    'roles:create:all', 'roles:read:all', 'roles:update:all', 'roles:delete:all',
    'settings:read:all', 'settings:update:all',
  ],

  pm: [
    'jobs:create:all', 'jobs:read:all', 'jobs:update:all', 'jobs:export:all',
    'clients:create:all', 'clients:read:all', 'clients:update:all', 'clients:export:all',
    'vendors:create:all', 'vendors:read:all', 'vendors:update:all', 'vendors:export:all',
    'invoices:create:all', 'invoices:read:assigned', 'invoices:update:assigned', 'invoices:approve:assigned', 'invoices:export:all',
    'draws:create:all', 'draws:read:all', 'draws:update:all', 'draws:export:all',
    'budgets:read:all', 'budgets:create:all', 'budgets:update:all', 'budgets:export:all',
    'cost_codes:read:all',
    'daily_logs:create:all', 'daily_logs:read:all', 'daily_logs:update:all', 'daily_logs:export:all',
    'documents:create:all', 'documents:read:all', 'documents:update:all', 'documents:export:all',
    'schedules:create:all', 'schedules:read:all', 'schedules:update:all', 'schedules:export:all',
    'change_orders:create:all', 'change_orders:read:all', 'change_orders:update:all', 'change_orders:approve:assigned', 'change_orders:export:all',
    'purchase_orders:create:all', 'purchase_orders:read:all', 'purchase_orders:update:all', 'purchase_orders:export:all',
    'lien_waivers:create:all', 'lien_waivers:read:all', 'lien_waivers:update:all', 'lien_waivers:export:all',
    'users:read:all',
    'roles:read:all',
    'settings:read:all',
  ],

  superintendent: [
    'jobs:read:assigned',
    'clients:read:assigned',
    'vendors:read:all', 'vendors:update:all',
    'budgets:read:all',
    'daily_logs:create:all', 'daily_logs:read:assigned', 'daily_logs:update:assigned',
    'documents:create:all', 'documents:read:assigned', 'documents:update:assigned',
    'schedules:read:all',
    'cost_codes:read:all',
    'users:read:all',
    'roles:read:all',
  ],

  office: [
    'jobs:read:all',
    'clients:read:all', 'clients:create:all', 'clients:update:all',
    'vendors:read:all', 'vendors:create:all', 'vendors:update:all',
    'invoices:create:all', 'invoices:read:all', 'invoices:update:all', 'invoices:export:all',
    'draws:create:all', 'draws:read:all', 'draws:update:all', 'draws:export:all',
    'budgets:read:all', 'budgets:update:all', 'budgets:export:all',
    'cost_codes:read:all',
    'daily_logs:read:all',
    'documents:create:all', 'documents:read:all', 'documents:update:all', 'documents:export:all',
    'schedules:read:all', 'schedules:update:all',
    'change_orders:read:all',
    'purchase_orders:create:all', 'purchase_orders:read:all', 'purchase_orders:update:all', 'purchase_orders:export:all',
    'lien_waivers:create:all', 'lien_waivers:read:all', 'lien_waivers:update:all', 'lien_waivers:export:all',
    'users:read:all',
    'roles:read:all',
    'settings:read:all',
  ],

  field: [
    'jobs:read:assigned',
    'daily_logs:create:own', 'daily_logs:read:own', 'daily_logs:update:own',
    'documents:read:assigned',
    'schedules:read:assigned',
    'cost_codes:read:all',
    'users:read:all',
  ],

  read_only: [
    'jobs:read:assigned',
    'clients:read:assigned',
    'vendors:read:assigned',
    'daily_logs:read:assigned',
    'documents:read:assigned',
    'schedules:read:assigned',
    'budgets:read:assigned',
    'cost_codes:read:all',
    'users:read:all',
  ],
}

// ============================================================================
// Permission Resolution
// ============================================================================

/**
 * Resolve effective permissions for a role with optional custom additions/removals
 */
export function resolvePermissions(
  baseRole: UserRole,
  customAdds?: Permission[],
  customRemoves?: Permission[]
): Permission[] {
  const base = new Set(DEFAULT_PERMISSIONS[baseRole] ?? [])

  if (customRemoves) {
    for (const perm of customRemoves) {
      base.delete(perm)
    }
  }

  if (customAdds) {
    for (const perm of customAdds) {
      base.add(perm)
    }
  }

  return [...base]
}

/**
 * Parse a permission string into its parts
 */
export function parsePermission(permission: string): {
  resource: PermissionResource
  action: PermissionAction
  scope: PermissionScope
} | null {
  const parts = permission.split(':')
  if (parts.length !== 3) return null
  return {
    resource: parts[0] as PermissionResource,
    action: parts[1] as PermissionAction,
    scope: parts[2] as PermissionScope,
  }
}

/**
 * Check if a user's permissions list includes a specific permission.
 * Handles scope matching: 'all' scope satisfies 'own' and 'assigned' checks.
 */
export function checkPermission(
  userPermissions: Permission[],
  resource: PermissionResource,
  action: PermissionAction,
  requiredScope: PermissionScope = 'all'
): boolean {
  for (const perm of userPermissions) {
    const parsed = parsePermission(perm)
    if (!parsed) continue
    if (parsed.resource !== resource || parsed.action !== action) continue

    // 'all' scope satisfies any required scope
    if (parsed.scope === 'all') return true
    // Exact match
    if (parsed.scope === requiredScope) return true
    // 'own' and 'assigned' satisfy each other in relaxed checking
    if (requiredScope === 'own' && parsed.scope === 'assigned') return true
  }
  return false
}

/**
 * Check if a user has a specific permission, accounting for permissions_mode.
 *
 * In 'open' mode: all permissions granted EXCEPT billing:* for non-owners.
 * In 'standard'/'strict' mode: check against resolved permissions.
 */
export function hasPermission(
  userRole: UserRole,
  userPermissions: Permission[],
  resource: PermissionResource,
  action: PermissionAction,
  scope: PermissionScope = 'all',
  permissionsMode: PermissionsMode = 'open'
): boolean {
  // Open mode: allow everything except billing for non-owners
  if (permissionsMode === 'open') {
    if (resource === 'billing' && userRole !== 'owner') {
      return false
    }
    return true
  }

  // Standard and strict modes: check permission list
  return checkPermission(userPermissions, resource, action, scope)
}

/**
 * Convenience wrapper: check a permission string like "jobs:read:all"
 */
export function canPerform(
  userRole: UserRole,
  userPermissions: Permission[],
  permissionString: string,
  permissionsMode: PermissionsMode = 'open'
): boolean {
  const parsed = parsePermission(permissionString)
  if (!parsed) return false
  return hasPermission(userRole, userPermissions, parsed.resource, parsed.action, parsed.scope, permissionsMode)
}

// ============================================================================
// Role Hierarchy
// ============================================================================

/**
 * Check if a user's role is at or above the required level
 */
export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0)
}

/**
 * Get all roles at or below a given level
 */
export function getRolesAtOrBelow(role: UserRole): UserRole[] {
  const level = ROLE_HIERARCHY[role] ?? 0
  return (Object.entries(ROLE_HIERARCHY) as [UserRole, number][])
    .filter(([, l]) => l <= level)
    .map(([r]) => r)
}
