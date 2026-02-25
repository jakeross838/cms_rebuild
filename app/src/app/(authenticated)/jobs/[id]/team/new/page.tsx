'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface CompanyUser {
  id: string
  name: string
  email: string | null
  role: string | null
}

const ROLE_OPTIONS = [
  { value: '', label: 'No override (use company role)' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'pm', label: 'Project Manager' },
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'office', label: 'Office' },
  { value: 'field', label: 'Field' },
  { value: 'read_only', label: 'Read Only' },
]

export default function NewTeamMemberPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<CompanyUser[]>([])

  const [formData, setFormData] = useState({
    user_id: '',
    role_override: '',
  })

  useEffect(() => {
    async function loadUsers() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoadingUsers(false)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) {
        setError('No company found')
        setLoadingUsers(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (fetchError) {
        setError('Failed to load users')
      } else {
        setUsers((data || []) as CompanyUser[])
      }
      setLoadingUsers(false)
    }
    loadUsers()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      if (!formData.user_id) throw new Error('Please select a user')

      type RoleOverride = 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'

      const { error: insertError } = await supabase
        .from('project_user_roles')
        .insert({
          company_id: companyId,
          user_id: formData.user_id,
          job_id: jobId,
          role_override: (formData.role_override || null) as RoleOverride | null,
          granted_by: user.id,
        })

      if (insertError) throw insertError

      router.push(`/jobs/${jobId}/team`)
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to add team member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/team`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Team
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add Team Member</h1>
        <p className="text-muted-foreground">Assign a user to this job with an optional role override</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Team Assignment</CardTitle>
            <CardDescription>Select a user and optionally override their role for this job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="user_id" className="text-sm font-medium">User <span className="text-red-500">*</span></label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />Loading users...
                </div>
              ) : (
                <select id="user_id" name="user_id" value={formData.user_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || u.id.slice(0, 8)}{u.role ? ` (${u.role})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="role_override" className="text-sm font-medium">Role Override</label>
              <select id="role_override" name="role_override" value={formData.role_override} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Leave empty to use the user&apos;s company-wide role. Override only applies to this job.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/team`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : 'Add Team Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
