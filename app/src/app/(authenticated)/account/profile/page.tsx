'use client'

import { useEffect, useState } from 'react'

import { Loader2, Save, User, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError || !data) {
        setError('Failed to load profile')
        setLoading(false)
        return
      }

      const p = data as UserProfile
      setProfile(p)
      setFormData({
        name: p.name || '',
        phone: p.phone || '',
      })
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name || undefined,
          phone: formData.phone || undefined,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile((prev) => prev ? {
        ...prev,
        name: formData.name || null,
        phone: formData.phone || null,
      } : prev)
      setSuccess(true)
      toast.success('Profile saved')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setSaving(false)
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
        <p className="text-destructive">{error || 'Profile not found'}</p>
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

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> Profile updated successfully
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
            <Input id="role" value={profile.role} disabled className="bg-muted capitalize" />
          </div>

          <div className="space-y-2">
            <label htmlFor="member-since" className="text-sm font-medium">Member Since</label>
            <Input id="member-since" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} disabled className="bg-muted" />
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
