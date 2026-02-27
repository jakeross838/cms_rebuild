'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Warranty Claim' }


export default function NewWarrantyClaimPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([])
  const [warranties, setWarranties] = useState<{ id: string; title: string; job_id: string | null }[]>([])

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    job_id: '',
    warranty_id: '',
    title: '',
    description: '',
    priority: 'Medium',
    reported_date: today,
    due_date: '',
    resolution_notes: '',
  })

  useEffect(() => {
    async function loadDropdowns() {
      if (!companyId) return

      const [jobsRes, warrantiesRes] = await Promise.all([
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
        supabase.from('warranties').select('id, title, job_id').eq('company_id', companyId).is('deleted_at', null).order('title'),
      ])

      if (jobsRes.data) setJobs(jobsRes.data)
      if (warrantiesRes.data) setWarranties(warrantiesRes.data as { id: string; title: string; job_id: string | null }[])
    }
    loadDropdowns()
  }, [companyId])

  // Filter warranties by selected job (if a job is selected)
  const filteredWarranties = formData.job_id
    ? warranties.filter((w) => w.job_id === formData.job_id)
    : warranties

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      // Reset warranty when job changes
      if (name === 'job_id') next.warranty_id = ''
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.title.trim()) { setError('Title is required'); setLoading(false); return }

      const claimNumber = `WC-${Date.now().toString(36).toUpperCase()}`

      const insertPayload = {
        company_id: companyId,
        claim_number: claimNumber,
        job_id: formData.job_id || null,
        warranty_id: formData.warranty_id || null,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: 'Open',
        reported_date: formData.reported_date || undefined,
        due_date: formData.due_date || undefined,
        resolution_notes: formData.resolution_notes || null,
        reported_by: authUser.id,
        created_by: authUser.id,
      }

      const { error: insertError } = await supabase
        .from('warranty_claims')
        .insert(insertPayload as never)

      if (insertError) throw insertError

      toast.success('Warranty claim created')
      router.push('/warranty-claims')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create warranty claim'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/warranty-claims" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranty Claims
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Warranty Claim</h1>
        <p className="text-muted-foreground">File a new warranty claim</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Job & Warranty Linkage */}
        <Card>
          <CardHeader>
            <CardTitle>Linkage</CardTitle>
            <CardDescription>Link this claim to a job and warranty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No job</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="warranty_id" className="text-sm font-medium">Warranty</label>
                <select id="warranty_id" name="warranty_id" value={formData.warranty_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No warranty</option>
                  {filteredWarranties.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
            <CardDescription>Describe the warranty issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Kitchen faucet leak" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description" aria-label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue in detail..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="reported_date" className="text-sm font-medium">Reported Date</label>
                <Input id="reported_date" name="reported_date" type="date" value={formData.reported_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Notes</CardTitle>
            <CardDescription>Optional notes about planned resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              id="resolution_notes" aria-label="Resolution notes"
              name="resolution_notes"
              value={formData.resolution_notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any initial notes about how to resolve this claim..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/warranty-claims"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Claim'}
          </Button>
        </div>
      </form>
    </div>
  )
}
