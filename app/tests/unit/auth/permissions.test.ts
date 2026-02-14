import { describe, it, expect } from 'vitest'

import {
  DEFAULT_PERMISSIONS,
  resolvePermissions,
  hasPermission,
  canPerform,
  isRoleAtLeast,
  checkPermission,
  parsePermission,
  getRolesAtOrBelow,
} from '@/lib/auth/permissions'
import { ROLE_HIERARCHY, CANONICAL_ROLES } from '@/types/auth'
import type { UserRole } from '@/types/database'
import type { Permission } from '@/types/auth'

describe('ROLE_HIERARCHY', () => {
  it('defines all 7 canonical roles', () => {
    expect(Object.keys(ROLE_HIERARCHY)).toHaveLength(7)
    expect(CANONICAL_ROLES).toHaveLength(7)
  })

  it('owner has highest hierarchy value', () => {
    expect(ROLE_HIERARCHY.owner).toBe(7)
  })

  it('read_only has lowest hierarchy value', () => {
    expect(ROLE_HIERARCHY.read_only).toBe(1)
  })

  it('hierarchy is strictly descending', () => {
    const order: UserRole[] = ['owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only']
    for (let i = 0; i < order.length - 1; i++) {
      expect(ROLE_HIERARCHY[order[i]]).toBeGreaterThan(ROLE_HIERARCHY[order[i + 1]])
    }
  })
})

describe('isRoleAtLeast', () => {
  it('owner is at least any role', () => {
    for (const role of CANONICAL_ROLES) {
      expect(isRoleAtLeast('owner', role)).toBe(true)
    }
  })

  it('read_only is only at least read_only', () => {
    expect(isRoleAtLeast('read_only', 'read_only')).toBe(true)
    expect(isRoleAtLeast('read_only', 'field')).toBe(false)
    expect(isRoleAtLeast('read_only', 'owner')).toBe(false)
  })

  it('pm is at least superintendent but not admin', () => {
    expect(isRoleAtLeast('pm', 'superintendent')).toBe(true)
    expect(isRoleAtLeast('pm', 'pm')).toBe(true)
    expect(isRoleAtLeast('pm', 'admin')).toBe(false)
  })

  it('admin is at least admin but not owner', () => {
    expect(isRoleAtLeast('admin', 'admin')).toBe(true)
    expect(isRoleAtLeast('admin', 'owner')).toBe(false)
  })
})

describe('getRolesAtOrBelow', () => {
  it('returns all roles for owner', () => {
    expect(getRolesAtOrBelow('owner')).toHaveLength(7)
  })

  it('returns only read_only for read_only', () => {
    expect(getRolesAtOrBelow('read_only')).toEqual(['read_only'])
  })
})

describe('DEFAULT_PERMISSIONS', () => {
  it('defines permissions for all 7 roles', () => {
    for (const role of CANONICAL_ROLES) {
      expect(DEFAULT_PERMISSIONS[role]).toBeDefined()
      expect(Array.isArray(DEFAULT_PERMISSIONS[role])).toBe(true)
    }
  })

  it('owner has billing permissions', () => {
    expect(DEFAULT_PERMISSIONS.owner).toContain('billing:read:all')
    expect(DEFAULT_PERMISSIONS.owner).toContain('billing:update:all')
  })

  it('admin does NOT have billing permissions', () => {
    const adminPerms = DEFAULT_PERMISSIONS.admin
    const billingPerms = adminPerms.filter(p => p.startsWith('billing:'))
    expect(billingPerms).toHaveLength(0)
  })

  it('read_only has only read permissions', () => {
    for (const perm of DEFAULT_PERMISSIONS.read_only) {
      expect(perm).toContain(':read:')
    }
  })

  it('field has create/read/update on daily_logs:own', () => {
    expect(DEFAULT_PERMISSIONS.field).toContain('daily_logs:create:own')
    expect(DEFAULT_PERMISSIONS.field).toContain('daily_logs:read:own')
    expect(DEFAULT_PERMISSIONS.field).toContain('daily_logs:update:own')
  })

  it('owner has more permissions than admin', () => {
    expect(DEFAULT_PERMISSIONS.owner.length).toBeGreaterThan(DEFAULT_PERMISSIONS.admin.length)
  })

  it('admin has more permissions than pm', () => {
    expect(DEFAULT_PERMISSIONS.admin.length).toBeGreaterThan(DEFAULT_PERMISSIONS.pm.length)
  })
})

describe('parsePermission', () => {
  it('parses valid permission string', () => {
    const result = parsePermission('jobs:read:all')
    expect(result).toEqual({ resource: 'jobs', action: 'read', scope: 'all' })
  })

  it('returns null for invalid format', () => {
    expect(parsePermission('invalid')).toBeNull()
    expect(parsePermission('a:b')).toBeNull()
    expect(parsePermission('a:b:c:d')).toBeNull()
  })
})

describe('resolvePermissions', () => {
  it('returns default permissions for a role', () => {
    const perms = resolvePermissions('admin')
    expect(perms).toEqual(expect.arrayContaining(DEFAULT_PERMISSIONS.admin))
  })

  it('adds custom permissions', () => {
    const customAdds: Permission[] = ['billing:read:all']
    const perms = resolvePermissions('admin', customAdds)
    expect(perms).toContain('billing:read:all')
  })

  it('removes custom permissions', () => {
    const customRemoves: Permission[] = ['settings:read:all']
    const perms = resolvePermissions('admin', undefined, customRemoves)
    expect(perms).not.toContain('settings:read:all')
  })

  it('add + remove together', () => {
    const adds: Permission[] = ['billing:read:all']
    const removes: Permission[] = ['settings:update:all']
    const perms = resolvePermissions('admin', adds, removes)
    expect(perms).toContain('billing:read:all')
    expect(perms).not.toContain('settings:update:all')
  })

  it('does not duplicate existing permissions', () => {
    const existing = DEFAULT_PERMISSIONS.owner[0]
    const perms = resolvePermissions('owner', [existing])
    const count = perms.filter(p => p === existing).length
    expect(count).toBe(1)
  })
})

describe('checkPermission', () => {
  const ownerPerms = DEFAULT_PERMISSIONS.owner

  it('finds exact match', () => {
    expect(checkPermission(ownerPerms, 'jobs', 'read', 'all')).toBe(true)
  })

  it('"all" scope satisfies "own" requirement', () => {
    expect(checkPermission(ownerPerms, 'jobs', 'read', 'own')).toBe(true)
  })

  it('"all" scope satisfies "assigned" requirement', () => {
    expect(checkPermission(ownerPerms, 'jobs', 'read', 'assigned')).toBe(true)
  })

  it('returns false for missing permission', () => {
    const fieldPerms = DEFAULT_PERMISSIONS.field
    expect(checkPermission(fieldPerms, 'billing', 'read', 'all')).toBe(false)
  })
})

describe('hasPermission', () => {
  const adminPerms = DEFAULT_PERMISSIONS.admin

  describe('open mode', () => {
    it('allows all actions for any role', () => {
      expect(hasPermission('field', [], 'jobs', 'read', 'all', 'open')).toBe(true)
      expect(hasPermission('read_only', [], 'invoices', 'create', 'all', 'open')).toBe(true)
    })

    it('denies billing for non-owner', () => {
      expect(hasPermission('admin', adminPerms, 'billing', 'read', 'all', 'open')).toBe(false)
      expect(hasPermission('pm', [], 'billing', 'update', 'all', 'open')).toBe(false)
    })

    it('allows billing for owner', () => {
      expect(hasPermission('owner', [], 'billing', 'read', 'all', 'open')).toBe(true)
    })
  })

  describe('standard mode', () => {
    it('checks actual permissions', () => {
      expect(hasPermission('admin', adminPerms, 'jobs', 'read', 'all', 'standard')).toBe(true)
    })

    it('denies missing permissions', () => {
      expect(hasPermission('admin', adminPerms, 'billing', 'read', 'all', 'standard')).toBe(false)
    })

    it('field cannot create jobs in standard mode', () => {
      const fieldPerms = DEFAULT_PERMISSIONS.field
      expect(hasPermission('field', fieldPerms, 'jobs', 'create', 'all', 'standard')).toBe(false)
    })
  })
})

describe('canPerform', () => {
  it('parses permission string and checks', () => {
    const ownerPerms = DEFAULT_PERMISSIONS.owner
    expect(canPerform('owner', ownerPerms, 'jobs:read:all', 'standard')).toBe(true)
    expect(canPerform('owner', ownerPerms, 'billing:read:all', 'standard')).toBe(true)
  })

  it('returns false for invalid permission format', () => {
    expect(canPerform('owner', [], 'invalid', 'open')).toBe(false)
  })

  it('open mode allows everything except billing for non-owners', () => {
    expect(canPerform('field', [], 'jobs:create:all', 'open')).toBe(true)
    expect(canPerform('field', [], 'billing:read:all', 'open')).toBe(false)
  })
})
