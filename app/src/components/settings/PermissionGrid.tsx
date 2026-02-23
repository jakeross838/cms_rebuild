'use client'

import { useMemo } from 'react'

import { resolvePermissions } from '@/lib/auth/permissions'
import { cn } from '@/lib/utils'
import type { PermissionResource, PermissionAction, PermissionScope, Permission } from '@/types/auth'
import type { UserRole } from '@/types/database'

interface PermissionGridProps {
  baseRole: UserRole
  selectedPermissions: string[]
  onChange: (permissions: string[]) => void
}

// Resources organized by category
const PERMISSION_RESOURCES: { category: string; resources: { key: PermissionResource; label: string }[] }[] = [
  {
    category: 'Core Data',
    resources: [
      { key: 'jobs', label: 'Jobs' },
      { key: 'clients', label: 'Clients' },
      { key: 'vendors', label: 'Vendors' },
    ],
  },
  {
    category: 'Financial',
    resources: [
      { key: 'invoices', label: 'Invoices' },
      { key: 'draws', label: 'Draws' },
      { key: 'budgets', label: 'Budgets' },
      { key: 'cost_codes', label: 'Cost Codes' },
      { key: 'change_orders', label: 'Change Orders' },
      { key: 'purchase_orders', label: 'Purchase Orders' },
      { key: 'lien_waivers', label: 'Lien Waivers' },
    ],
  },
  {
    category: 'Operations',
    resources: [
      { key: 'daily_logs', label: 'Daily Logs' },
      { key: 'documents', label: 'Documents' },
      { key: 'schedules', label: 'Schedules' },
    ],
  },
  {
    category: 'Administration',
    resources: [
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' },
      { key: 'settings', label: 'Settings' },
      { key: 'billing', label: 'Billing' },
    ],
  },
]

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'read', label: 'Read' },
  { key: 'create', label: 'Create' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' },
]

const SCOPES: { key: PermissionScope; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'bg-green-500' },
  { key: 'own', label: 'Own', color: 'bg-blue-500' },
  { key: 'assigned', label: 'Assigned', color: 'bg-amber-500' },
  { key: 'none', label: 'None', color: 'bg-red-500' },
]

export function PermissionGrid({ baseRole, selectedPermissions, onChange }: PermissionGridProps) {
  // Get the base role's default permissions
  const basePermissions = useMemo(() => {
    return resolvePermissions(baseRole)
  }, [baseRole])

  // Build a map of permission -> scope from base role
  const basePermissionMap = useMemo(() => {
    const map = new Map<string, PermissionScope>()
    for (const perm of basePermissions) {
      const [resource, action, scope] = perm.split(':') as [PermissionResource, PermissionAction, PermissionScope]
      map.set(`${resource}:${action}`, scope)
    }
    return map
  }, [basePermissions])

  // Build a map of current custom permissions
  const customPermissionMap = useMemo(() => {
    const map = new Map<string, PermissionScope>()
    for (const perm of selectedPermissions) {
      const [resource, action, scope] = perm.split(':') as [PermissionResource, PermissionAction, PermissionScope]
      map.set(`${resource}:${action}`, scope)
    }
    return map
  }, [selectedPermissions])

  // Get the effective scope for a resource:action
  const getEffectiveScope = (resource: PermissionResource, action: PermissionAction): PermissionScope => {
    const key = `${resource}:${action}`
    // Custom permission takes precedence
    if (customPermissionMap.has(key)) {
      return customPermissionMap.get(key)!
    }
    // Fall back to base role
    return basePermissionMap.get(key) || 'none'
  }

  // Check if the permission differs from base
  const isCustomized = (resource: PermissionResource, action: PermissionAction): boolean => {
    const key = `${resource}:${action}`
    return customPermissionMap.has(key)
  }

  // Handle scope change
  const handleScopeChange = (resource: PermissionResource, action: PermissionAction, scope: PermissionScope) => {
    const key = `${resource}:${action}`
    const baseScope = basePermissionMap.get(key) || 'none'

    // If setting back to base, remove from custom
    if (scope === baseScope) {
      onChange(selectedPermissions.filter((p) => !p.startsWith(`${key}:`)))
    } else {
      // Add/update custom permission
      const newPerm: Permission = `${resource}:${action}:${scope}`
      const filtered = selectedPermissions.filter((p) => !p.startsWith(`${key}:`))
      onChange([...filtered, newPerm])
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Legend */}
      <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-4 text-xs">
        <span className="text-muted-foreground font-medium">Scopes:</span>
        {SCOPES.map((scope) => (
          <div key={scope.key} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', scope.color)} />
            <span className="text-muted-foreground">{scope.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Resource</th>
              {ACTIONS.map((action) => (
                <th
                  key={action.key}
                  className="text-center px-2 py-2 font-medium text-muted-foreground min-w-[70px]"
                >
                  {action.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_RESOURCES.map((category) => (
              <>
                {/* Category header */}
                <tr key={`cat-${category.category}`} className="border-b bg-muted/20">
                  <td
                    colSpan={ACTIONS.length + 1}
                    className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {category.category}
                  </td>
                </tr>

                {/* Resources */}
                {category.resources.map((resource) => (
                  <tr key={resource.key} className="border-b last:border-b-0 hover:bg-muted/10">
                    <td className="px-4 py-2 font-medium text-foreground">{resource.label}</td>
                    {ACTIONS.map((action) => {
                      const currentScope = getEffectiveScope(resource.key, action.key)
                      const customized = isCustomized(resource.key, action.key)

                      return (
                        <td key={action.key} className="text-center px-2 py-2">
                          <select
                            value={currentScope}
                            onChange={(e) =>
                              handleScopeChange(
                                resource.key,
                                action.key,
                                e.target.value as PermissionScope
                              )
                            }
                            className={cn(
                              'h-7 w-full max-w-[80px] rounded border text-xs px-1',
                              customized
                                ? 'border-primary bg-primary/5 font-medium'
                                : 'border-input bg-background'
                            )}
                            title={customized ? 'Custom (differs from base role)' : 'Inherited from base role'}
                          >
                            {SCOPES.map((scope) => (
                              <option key={scope.key} value={scope.key}>
                                {scope.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {selectedPermissions.length > 0 && (
        <div className="bg-muted/30 px-4 py-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{selectedPermissions.length}</span> custom
            permissions set (overriding base role)
          </p>
        </div>
      )}
    </div>
  )
}
