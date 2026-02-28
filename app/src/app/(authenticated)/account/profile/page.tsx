'use client'

import { useEffect, useState } from 'react'

import { Loader2, Save, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { useUser, useUpdateUser } from '@/hooks/use-users'
import { formatDate, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  created_at: string | null
}

export default function ProfilePage() {
  const { profile: authProfile } = useAuth()
  const userId = authProfile?.id || ''

  const { data: response, isLoading: loading, error: fetchError } = useUser(userId || null)
  const updateUser = useUpdateUser(userId)

  const profile = (response as { data: UserProfile } | undefined)?.data ?? null

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return

    try {
      await updateUser.mutateAsync({
        full_name: formData.name || undefined,
        phone: formData.phone || undefined,
      })
      toast.success('Profile saved')
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-destructive">{fetchError?.message || 'Profile not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6" />
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      {fetchError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {fetchError.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <Input id="role" value={formatStatus(profile.role)} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <label htmlFor="member-since" className="text-sm font-medium">Member Since</label>
            <Input id="member-since" value={formatDate(profile.created_at) || 'N/A'} disabled className="bg-muted" />
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button onClick={handleSave} disabled={updateUser.isPending}>
            {updateUser.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
