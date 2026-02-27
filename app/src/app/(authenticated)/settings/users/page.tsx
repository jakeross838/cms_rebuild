'use client'

import { useState } from 'react'

import { Users, Plus, Search } from 'lucide-react'

import { EditUserModal } from '@/components/settings/EditUserModal'
import { InviteUserModal } from '@/components/settings/InviteUserModal'
import { UserTable } from '@/components/settings/UserTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/types/database'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleInviteSuccess = () => {
    setShowInviteModal(false)
    setRefreshKey((k) => k + 1)
  }

  const handleEditSuccess = () => {
    setEditingUserId(null)
    setRefreshKey((k) => k + 1)
  }

  const handleStatusChange = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users and their access to your company
          </p>
        </div>

        <Button onClick={() => setShowInviteModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role filter */}
        <select
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="pm">Project Manager</option>
          <option value="superintendent">Superintendent</option>
          <option value="office">Office Staff</option>
          <option value="field">Field Crew</option>
          <option value="read_only">Read Only</option>
        </select>

        {/* Status filter */}
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* User Table */}
      <UserTable
        key={refreshKey}
        search={search}
        roleFilter={roleFilter === 'all' ? undefined : roleFilter}
        statusFilter={statusFilter}
        onEdit={setEditingUserId}
        onStatusChange={handleStatusChange}
      />

      {/* Invite Modal */}
      {showInviteModal ? <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        /> : null}

      {/* Edit Modal */}
      {editingUserId ? <EditUserModal
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={handleEditSuccess}
        /> : null}
    </div>
  )
}
