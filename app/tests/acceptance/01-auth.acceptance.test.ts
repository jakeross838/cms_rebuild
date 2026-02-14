/**
 * Module 01 — Auth & Access Control Acceptance Tests
 * Verifies spec contract requirements from docs/modules/01-auth-and-access.md
 */

import { describe, it, expect } from 'vitest'

import { ROLE_HIERARCHY, CANONICAL_ROLES } from '@/types/auth'
import {
  DEFAULT_PERMISSIONS,
  resolvePermissions,
  hasPermission,
  isRoleAtLeast,
} from '@/lib/auth/permissions'
import type { UserRole } from '@/types/database'
import type { Permission } from '@/types/auth'

// Spec: "Seven canonical, locked, non-deletable system roles"
describe('Spec: 7 canonical roles exist in correct hierarchy', () => {
  it('exactly 7 roles defined', () => {
    expect(CANONICAL_ROLES).toHaveLength(7)
  })

  it('roles are in descending hierarchy order', () => {
    const expected: UserRole[] = ['owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only']
    expect(CANONICAL_ROLES).toEqual(expected)
  })

  it('each role has a unique hierarchy level', () => {
    const levels = Object.values(ROLE_HIERARCHY)
    const unique = new Set(levels)
    expect(unique.size).toBe(7)
  })

  it('hierarchy: owner > admin > pm > superintendent > office > field > read_only', () => {
    expect(isRoleAtLeast('owner', 'admin')).toBe(true)
    expect(isRoleAtLeast('admin', 'pm')).toBe(true)
    expect(isRoleAtLeast('pm', 'superintendent')).toBe(true)
    expect(isRoleAtLeast('superintendent', 'office')).toBe(true)
    expect(isRoleAtLeast('office', 'field')).toBe(true)
    expect(isRoleAtLeast('field', 'read_only')).toBe(true)

    // Reverse is not true
    expect(isRoleAtLeast('read_only', 'field')).toBe(false)
    expect(isRoleAtLeast('field', 'office')).toBe(false)
  })
})

// Spec: "Open mode: All authenticated internal users see everything except billing"
describe('Spec: Open mode allows all actions except billing for non-owner', () => {
  const resources = ['jobs', 'clients', 'vendors', 'invoices', 'draws', 'budgets'] as const
  const actions = ['create', 'read', 'update', 'delete'] as const

  for (const role of CANONICAL_ROLES) {
    it(`${role} can perform all non-billing actions in open mode`, () => {
      for (const resource of resources) {
        for (const action of actions) {
          expect(
            hasPermission(role, [], resource, action, 'all', 'open')
          ).toBe(true)
        }
      }
    })
  }

  it('only owner can access billing in open mode', () => {
    expect(hasPermission('owner', [], 'billing', 'read', 'all', 'open')).toBe(true)
    expect(hasPermission('owner', [], 'billing', 'update', 'all', 'open')).toBe(true)
  })

  it('admin cannot access billing in open mode', () => {
    expect(hasPermission('admin', [], 'billing', 'read', 'all', 'open')).toBe(false)
  })

  it('no non-owner role can access billing in open mode', () => {
    const nonOwners: UserRole[] = ['admin', 'pm', 'superintendent', 'office', 'field', 'read_only']
    for (const role of nonOwners) {
      expect(hasPermission(role, [], 'billing', 'read', 'all', 'open')).toBe(false)
    }
  })
})

// Spec: "Custom roles inherit from a base system role"
describe('Spec: Custom role permission resolution', () => {
  it('custom role inherits base permissions', () => {
    const basePerms = DEFAULT_PERMISSIONS.office
    const resolved = resolvePermissions('office')
    expect(resolved).toEqual(expect.arrayContaining(basePerms))
  })

  it('custom role adds permissions beyond base', () => {
    // "Selection Coordinator" = office + selections:approve:all
    const adds: Permission[] = ['change_orders:approve:all']
    const resolved = resolvePermissions('office', adds)
    expect(resolved).toContain('change_orders:approve:all')
    // Still has base permissions
    expect(resolved).toContain('jobs:read:all')
  })

  it('custom role removes permissions from base', () => {
    // "Assistant PM" = pm - budgets:approve:all
    const removes: Permission[] = ['budgets:update:all']
    const resolved = resolvePermissions('pm', undefined, removes)
    expect(resolved).not.toContain('budgets:update:all')
    // Still has other PM permissions
    expect(resolved).toContain('jobs:create:all')
  })
})

// Spec: Standard mode enforces actual permission lists
describe('Spec: Standard mode permission enforcement', () => {
  it('owner has full access in standard mode', () => {
    const perms = resolvePermissions('owner')
    expect(hasPermission('owner', perms, 'billing', 'read', 'all', 'standard')).toBe(true)
    expect(hasPermission('owner', perms, 'jobs', 'delete', 'all', 'standard')).toBe(true)
    expect(hasPermission('owner', perms, 'users', 'create', 'all', 'standard')).toBe(true)
  })

  it('admin has full access except billing in standard mode', () => {
    const perms = resolvePermissions('admin')
    expect(hasPermission('admin', perms, 'jobs', 'delete', 'all', 'standard')).toBe(true)
    expect(hasPermission('admin', perms, 'billing', 'read', 'all', 'standard')).toBe(false)
  })

  it('field has limited access in standard mode', () => {
    const perms = resolvePermissions('field')
    expect(hasPermission('field', perms, 'daily_logs', 'create', 'own', 'standard')).toBe(true)
    expect(hasPermission('field', perms, 'invoices', 'read', 'all', 'standard')).toBe(false)
    expect(hasPermission('field', perms, 'jobs', 'create', 'all', 'standard')).toBe(false)
  })

  it('read_only can only read in standard mode', () => {
    const perms = resolvePermissions('read_only')
    // Can read assigned
    expect(hasPermission('read_only', perms, 'jobs', 'read', 'assigned', 'standard')).toBe(true)
    // Cannot create
    expect(hasPermission('read_only', perms, 'jobs', 'create', 'all', 'standard')).toBe(false)
    // Cannot update
    expect(hasPermission('read_only', perms, 'jobs', 'update', 'all', 'standard')).toBe(false)
  })
})

// Spec: Permission format is resource:action:scope
describe('Spec: Permission format validation', () => {
  it('all default permissions follow resource:action:scope format', () => {
    for (const role of CANONICAL_ROLES) {
      for (const perm of DEFAULT_PERMISSIONS[role]) {
        const parts = perm.split(':')
        expect(parts).toHaveLength(3)
        expect(parts[0].length).toBeGreaterThan(0)
        expect(parts[1].length).toBeGreaterThan(0)
        expect(['all', 'own', 'assigned', 'none']).toContain(parts[2])
      }
    }
  })
})
