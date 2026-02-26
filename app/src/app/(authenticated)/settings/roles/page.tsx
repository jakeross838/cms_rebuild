'use client'

import { useEffect, useState } from 'react'

import {
  Shield,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Users,
  Lock,
} from 'lucide-react'

import { RoleModal } from '@/components/settings/RoleModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { toast } from 'sonner'

interface Role {
  id: string
  name: string
  description: string | null
  base_role: UserRole
  is_system: boolean
  permissions: string[]
  company_id: string | null
  created_at: string
}

const BASE_ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  pm: 'Project Manager',
  superintendent: 'Superintendent',
  office: 'Office Staff',
  field: 'Field Crew',
  read_only: 'Read Only',
}

const BASE_ROLE_COLORS: Record<UserRole, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  pm: 'bg-green-100 text-green-800',
  superintendent: 'bg-amber-100 text-amber-800',
  office: 'bg-stone-100 text-stone-800',
  field: 'bg-emerald-100 text-emerald-800',
  read_only: 'bg-gray-100 text-gray-800',
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/roles?limit=100')
      if (!response.ok) throw new Error('Failed to fetch roles')

      const data = await response.json()
      setRoles(data.data || [])
    } catch (err) {
      setError((err as Error)?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleDelete = async (roleId: string) => {
    setDeletingId(roleId)
    setOpenDropdown(null)

    try {
      const response = await fetch(`/api/v1/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete role')
      }

      fetchRoles()
      toast.success('Role deleted')
    } catch (err) {
      const msg = (err as Error)?.message || 'Failed to delete role'
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleModalSuccess = () => {
    setShowModal(false)
    setEditingRole(null)
    fetchRoles()
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setShowModal(true)
    setOpenDropdown(null)
  }

  // Separate system roles from custom roles
  const systemRoles = roles.filter((r) => r.is_system)
  const customRoles = roles.filter((r) => !r.is_system)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system roles and create custom roles for your team
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Role
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchRoles} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* System Roles Section */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              System Roles
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Built-in roles with predefined permissions. These cannot be modified or deleted.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-card rounded-lg border p-4 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{role.name}</h3>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            BASE_ROLE_COLORS[role.base_role]
                          )}
                        >
                          {BASE_ROLE_LABELS[role.base_role]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description || 'No description'}
                      </p>
                    </div>
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{role.permissions.length} permissions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Roles Section */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Custom Roles
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Roles you&apos;ve created with customized permissions based on system roles.
            </p>

            {customRoles.length === 0 ? (
              <div className="bg-card rounded-lg border p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No custom roles yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a custom role to grant specific permissions to team members.
                </p>
                <Button onClick={() => setShowModal(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Role
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customRoles.map((role) => (
                  <div
                    key={role.id}
                    className="bg-card rounded-lg border p-4 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{role.name}</h3>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded',
                              BASE_ROLE_COLORS[role.base_role]
                            )}
                          >
                            Based on {BASE_ROLE_LABELS[role.base_role]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description || 'No description'}
                        </p>
                      </div>

                      <div className="relative">
                        {deletingId === role.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setOpenDropdown(openDropdown === role.id ? null : role.id)
                              }
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>

                            {openDropdown === role.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdown(null)}
                                  onKeyDown={(e) => e.key === 'Escape' && setOpenDropdown(null)}
                                  role="button"
                                  tabIndex={-1}
                                  aria-label="Close menu"
                                />
                                <div className="absolute right-0 mt-1 w-32 bg-background rounded-md shadow-lg border z-20">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleEdit(role)}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => { setPendingDeleteId(role.id); setShowDeleteDialog(true); setOpenDropdown(null) }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{role.permissions.length} custom permissions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete role?"
        description="This role will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDeleteId) {
            handleDelete(pendingDeleteId)
            setShowDeleteDialog(false)
            setPendingDeleteId(null)
          }
        }}
      />

      {/* Role Modal */}
      {showModal ? <RoleModal
          role={editingRole}
          onClose={() => {
            setShowModal(false)
            setEditingRole(null)
          }}
          onSuccess={handleModalSuccess}
        /> : null}
    </div>
  )
}
