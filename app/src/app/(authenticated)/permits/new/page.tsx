'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreatePermit } from '@/hooks/use-permitting'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewPermitPage() {
  const router = useRouter()
  const supabase = createClient()
  const createPermit = useCreatePermit()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    job_id: '',
    permit_number: '',
    permit_type: '',
    jurisdiction: '',
    applied_date: '',
    notes: '',
  })

  useEffect(() => {
    async function loadDropdowns() {
      if (!companyId) return

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      if (jobsData) setJobs(jobsData)
    }
    loadDropdowns()
  }, [companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createPermit.isPending) return
    setError(null)

    if (!formData.job_id) { setError('Job is required'); return }

    try {
      await createPermit.mutateAsync({
        job_id: formData.job_id,
        permit_number: formData.permit_number || null,
        permit_type: formData.permit_type || 'Other',
        jurisdiction: formData.jurisdiction || null,
        applied_date: formData.applied_date || null,
        notes: formData.notes || null,
        status: 'applied',
      })

      toast.success('Permit created')
      router.push('/permits')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create permit'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/permits" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Permits
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Permit</h1>
        <p className="text-muted-foreground">Track a new building permit application</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Permit Info */}
        <Card>
          <CardHeader>
            <CardTitle>Permit Details</CardTitle>
            <CardDescription>Basic permit information</CardDescription>
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
                <label htmlFor="permit_number" className="text-sm font-medium">Permit Number</label>
                <Input id="permit_number" name="permit_number" value={formData.permit_number} onChange={handleChange} placeholder="e.g., BLD-2026-00123" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="permit_type" className="text-sm font-medium">Permit Type</label>
                <select id="permit_type" name="permit_type" value={formData.permit_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select type...</option>
                  {['Building', 'Electrical', 'Plumbing', 'Mechanical', 'Demolition', 'Other'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="jurisdiction" className="text-sm font-medium">Jurisdiction</label>
                <Input id="jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} placeholder="e.g., City of Austin" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="applied_date" className="text-sm font-medium">Applied Date</label>
              <Input id="applied_date" name="applied_date" type="date" value={formData.applied_date} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Any notes about this permit application..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/permits"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createPermit.isPending}>
            {createPermit.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Permit'}
          </Button>
        </div>
      </form>
    </div>
  )
}
