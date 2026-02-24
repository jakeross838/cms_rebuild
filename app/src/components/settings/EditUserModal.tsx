'use client'

import { useEffect, useState } from 'react'

import { X, Loader2, Save, User as UserIcon, Phone, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import type { UserRole, User } from '@/types/database'

interface EditUserModalProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'owner', label: 'Owner', description: 'Full platform access' },
  { value: 'admin', label: 'Admin', description: 'Full access except billing' },
  { value: 'pm', label: 'Project Manager', description: 'Manage assigned jobs' },
  { value: 'superintendent', label: 'Superintendent', description: 'Field operations' },
  { value: 'office', label: 'Office Staff', description: 'Invoicing, documents' },
  { value: 'field', label: 'Field Crew', description: 'Daily logs, time tracking' },
  { value: 'read_only', label: 'Read Only', description: 'View-only access' },
]

export function EditUserModal({ userId, onClose, onSuccess }: EditUserModalProps) {
  const { user: currentUser, hasRole } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('field')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditingSelf = currentUser?.id === userId
  const canChangeRole = hasRole('admin') && !isEditingSelf

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/v1/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        const data = await response.json()
        const userData = data.data as User
        setUser(userData)
        setName(userData.name || '')
        setPhone(userData.phone || '')
        setRole(userData.role ?? 'field')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = { name, phone }
      if (canChangeRole) {
        payload.role = role
      }

      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close modal"
        />
        <div className="relative bg-background rounded-lg shadow-xl p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close modal"
        />
        <div className="relative bg-background rounded-lg shadow-xl p-8">
          <p className="text-destructive">User not found</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info header */}
        <div className="px-6 py-4 bg-muted/30 border-b">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-foreground">{user.name || 'No name'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error ? <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div> : null}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Role
              {!canChangeRole && (
                <span className="text-xs text-muted-foreground">(Admins only)</span>
              )}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={!canChangeRole}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
            {isEditingSelf ? <p className="text-xs text-muted-foreground">
                You cannot change your own role
              </p> : null}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
