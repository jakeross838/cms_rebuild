'use client'

import { useEffect, useState } from 'react'

import {
  MoreHorizontal,
  Edit,
  UserX,
  UserCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import type { UserRole, User } from '@/types/database'
import { toast } from 'sonner'

interface UserTableProps {
  search?: string
  roleFilter?: UserRole
  statusFilter?: 'all' | 'active' | 'inactive'
  onEdit: (userId: string) => void
  onStatusChange: () => void
}

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  pm: 'Project Manager',
  superintendent: 'Superintendent',
  office: 'Office Staff',
  field: 'Field Crew',
  read_only: 'Read Only',
}

const ROLE_COLORS: Record<UserRole, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  pm: 'bg-green-100 text-green-800',
  superintendent: 'bg-amber-100 text-amber-800',
  office: 'bg-stone-100 text-stone-800',
  field: 'bg-emerald-100 text-emerald-800',
  read_only: 'bg-gray-100 text-gray-800',
}

export function UserTable({
  search,
  roleFilter,
  statusFilter = 'active',
  onEdit,
  onStatusChange,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          status: statusFilter,
        })

        if (search) params.set('search', search)
        if (roleFilter) params.set('role', roleFilter)

        const response = await fetch(`/api/v1/users?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        setUsers(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.total || 0)
      } catch (err) {
        setError((err as Error)?.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, search, roleFilter, statusFilter])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, statusFilter])

  const handleDeactivate = async (userId: string) => {
    if (actionLoading) return
    setActionLoading(userId)
    setOpenDropdown(null)

    try {
      const response = await fetch(`/api/v1/users/${userId}/deactivate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to deactivate user')
      }

      onStatusChange()
    } catch (err) {
      console.error('Deactivate error:', err)
      toast.error((err as Error)?.message || 'Failed to deactivate user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivate = async (userId: string) => {
    if (actionLoading) return
    setActionLoading(userId)
    setOpenDropdown(null)

    try {
      const response = await fetch(`/api/v1/users/${userId}/reactivate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to reactivate user')
      }

      onStatusChange()
    } catch (err) {
      console.error('Reactivate error:', err)
      toast.error((err as Error)?.message || 'Failed to reactivate user')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => setPage(1)} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                Last Login
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isActive = user.is_active && !user.deleted_at
              const isLoading = actionLoading === user.id

              return (
                <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded',
                        ROLE_COLORS[user.role ?? 'field']
                      )}
                    >
                      {ROLE_LABELS[user.role ?? 'field']}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded',
                        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      )}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(user.last_login_at) || 'Never'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setOpenDropdown(openDropdown === user.id ? null : user.id)
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {openDropdown === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                                onKeyDown={(e) => e.key === 'Escape' && setOpenDropdown(null)}
                                role="button"
                                tabIndex={-1}
                                aria-label="Close menu"
                              />
                              <div className="absolute right-0 mt-1 w-40 bg-background rounded-md shadow-lg border z-20">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setOpenDropdown(null)
                                      onEdit(user.id)
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>

                                  {isActive ? (
                                    <button
                                      onClick={() => handleDeactivate(user.id)}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                    >
                                      <UserX className="h-4 w-4" />
                                      Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleReactivate(user.id)}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                      Reactivate
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of{' '}
            {totalCount} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
