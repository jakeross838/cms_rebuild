'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Bid' }


interface JobOption {
  id: string
  name: string
}

export default function NewBidPackagePage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobOption[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    trade: '',
    description: '',
    scope_of_work: '',
    bid_due_date: '',
    job_id: '',
  })

  // ── Load jobs for selector ──────────────────────────────────────────
  useEffect(() => {
    async function loadJobs() {
      if (!companyId) return

      const { data } = await supabase
        .from('jobs')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      setJobs((data || []) as JobOption[])
      setJobsLoading(false)
    }
    loadJobs()
  }, [supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')
      if (!formData.job_id) { setError('Job is required'); setLoading(false); return }
      if (!formData.title.trim()) { setError('Title is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('bid_packages')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          title: formData.title,
          trade: formData.trade || null,
          description: formData.description || null,
          scope_of_work: formData.scope_of_work || null,
          bid_due_date: formData.bid_due_date || null,
          status: 'Draft',
          created_by: authUser.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Bid package created')
      router.push('/bids')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create bid package'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/bids" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Bids
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Bid Package</h1>
        <p className="text-muted-foreground">Create a new bid package for a job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Bid Details</CardTitle>
            <CardDescription>Basic information about this bid package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Framing Package — Phase 1" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select
                  id="job_id"
                  name="job_id"
                  value={formData.job_id}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">{jobsLoading ? 'Loading jobs...' : 'Select a job'}</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} placeholder="e.g., Framing, Electrical, Plumbing" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="bid_due_date" className="text-sm font-medium">Bid Due Date</label>
              <Input id="bid_due_date" name="bid_due_date" type="date" value={formData.bid_due_date} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="General description of what this bid package covers..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scope of Work</CardTitle>
            <CardDescription>Detailed scope for bidders to reference</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="scope_of_work" name="scope_of_work" value={formData.scope_of_work} onChange={handleChange} rows={6} placeholder="Detailed scope of work, specifications, inclusions/exclusions..." />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/bids"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Bid Package'}
          </Button>
        </div>
      </form>
    </div>
  )
}
