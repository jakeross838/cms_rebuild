'use client'

import { useState } from 'react'

import { X, Loader2, Save, Shield, FileText } from 'lucide-react'

import { PermissionGrid } from '@/components/settings/PermissionGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/types/database'

interface Role {
  id: string
  name: string
  description: string | null
  base_role: UserRole
  is_system: boolean
  permissions: string[]
  company_id: string | null
}

interface RoleModalProps {
  role: Role | null // null for create, Role for edit
  onClose: () => void
  onSuccess: () => void
}

const BASE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access except billing' },
  { value: 'pm', label: 'Project Manager', description: 'Manage assigned jobs' },
  { value: 'superintendent', label: 'Superintendent', description: 'Field operations' },
  { value: 'office', label: 'Office Staff', description: 'Invoicing, documents' },
  { value: 'field', label: 'Field Crew', description: 'Daily logs, time tracking' },
  { value: 'read_only', label: 'Read Only', description: 'View-only access' },
]

export function RoleModal({ role, onClose, onSuccess }: RoleModalProps) {
  const isEditing = !!role
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [baseRole, setBaseRole] = useState<UserRole>(role?.base_role || 'field')
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name,
        description: description || null,
        ...(isEditing ? {} : { base_role: baseRole }),
        permissions,
      }

      const url = isEditing ? `/api/v1/roles/${role.id}` : '/api/v1/roles'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} role`)
      }

      onSuccess()
    } catch (err) {
      setError((err as Error)?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isEditing ? 'Edit Custom Role' : 'Create Custom Role'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Error */}
            {error ? <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div> : null}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Role Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Senior Project Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </label>
              <Input
                type="text"
                placeholder="Brief description of this role's purpose"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Base Role (only for create) */}
            {!isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Base Role
                </label>
                <p className="text-xs text-muted-foreground">
                  This role will inherit all permissions from the base role. You can then add or
                  remove specific permissions.
                </p>
                <select
                  value={baseRole}
                  onChange={(e) => setBaseRole(e.target.value as UserRole)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {BASE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Permissions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Custom Permissions
              </label>
              <p className="text-xs text-muted-foreground">
                Select additional permissions to grant or permissions to remove from the base role.
              </p>
              <PermissionGrid
                baseRole={isEditing ? role.base_role : baseRole}
                selectedPermissions={permissions}
                onChange={setPermissions}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/30">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Create Role'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
