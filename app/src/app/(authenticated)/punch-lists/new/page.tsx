'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreatePunchItem } from '@/hooks/use-punch-lists'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatStatus } from '@/lib/utils'

export default function NewPunchItemPage() {
  const router = useRouter()
  const supabase = createClient()
  const createPunchItem = useCreatePunchItem()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    job_id: '',
    title: '',
    location: '',
    room: '',
    category: '',
    priority: 'normal',
    status: 'open',
    assigned_to: '',
    description: '',
    due_date: '',
    cost_estimate: '',
  })

  useEffect(() => {
    async function loadDropdowns() {
      if (!companyId) return

      const [jobsRes, usersRes] = await Promise.all([
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
        supabase.from('users').select('id, name').eq('company_id', companyId),
      ])

      if (jobsRes.data) setJobs(jobsRes.data)
      if (usersRes.data) setUsers(usersRes.data)
    }
    loadDropdowns()
  }, [companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createPunchItem.isPending) return
    setError(null)

    if (!formData.job_id) { setError('Job is required'); return }
    if (!formData.title.trim()) { setError('Title is required'); return }

    try {
      await createPunchItem.mutateAsync({
        job_id: formData.job_id,
        title: formData.title,
        location: formData.location || null,
        room: formData.room || null,
        category: formData.category || null,
        priority: formData.priority,
        status: formData.status,
        assigned_to: formData.assigned_to || null,
        description: formData.description || null,
        due_date: formData.due_date || null,
        cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
      })

      toast.success('Punch item created')
      router.push('/punch-lists')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create punch item'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/punch-lists" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch Lists
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Punch Item</h1>
        <p className="text-muted-foreground">Create a new punch list item for a job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Punch Item Details</CardTitle>
            <CardDescription>Describe the item that needs attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Touch-up paint in master bedroom" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., 2nd Floor" />
              </div>
              <div className="space-y-2">
                <label htmlFor="room" className="text-sm font-medium">Room</label>
                <Input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Master Bedroom" />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select category...</option>
                  {['structural', 'electrical', 'plumbing', 'hvac', 'finish', 'paint', 'flooring', 'cabinets', 'countertops', 'fixtures', 'appliances', 'exterior', 'landscaping', 'other'].map((c) => (
                    <option key={c} value={c}>{formatStatus(c)}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {['low', 'normal', 'high', 'critical'].map((p) => (
                    <option key={p} value={p}>{formatStatus(p)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {['open', 'in_progress', 'completed', 'verified', 'disputed'].map((s) => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="assigned_to" className="text-sm font-medium">Assigned To</label>
                <select id="assigned_to" name="assigned_to" value={formData.assigned_to} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="cost_estimate" className="text-sm font-medium">Cost Estimate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="cost_estimate" name="cost_estimate" type="number" step="0.01" value={formData.cost_estimate} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the issue in detail..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/punch-lists"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createPunchItem.isPending}>
            {createPunchItem.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Punch Item'}
          </Button>
        </div>
      </form>
    </div>
  )
}
