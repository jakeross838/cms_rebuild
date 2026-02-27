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

export const metadata: Metadata = { title: 'New Lien Law Record' }


export default function NewLienLawRecordPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<{id: string, name: string}[]>([])
  const [vendors, setVendors] = useState<{id: string, name: string}[]>([])

  const [formData, setFormData] = useState({
    job_id: '',
    vendor_id: '',
    expected_amount: '',
    period_start: '',
    period_end: '',
    is_compliant: true,
    notes: '',
  })

  // Load jobs and vendors for dropdowns
  useEffect(() => {
    async function loadDropdownData() {
      if (!companyId) return

      const [jobsResult, vendorsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, name')
          .eq('company_id', companyId)
          .is('deleted_at', null)
          .order('name'),
        supabase
          .from('vendors')
          .select('id, name')
          .eq('company_id', companyId)
          .is('deleted_at', null)
          .order('name'),
      ])

      if (jobsResult.data) setJobs(jobsResult.data)
      if (vendorsResult.data) setVendors(vendorsResult.data)
    }

    loadDropdownData()
  }, [supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!formData.job_id.trim()) {
        setError('Job is required')
        setSaving(false)
        return
      }

      if (!companyId) throw new Error('No company found')

      const { error: insertError } = await supabase
        .from('lien_waiver_tracking')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          vendor_id: formData.vendor_id || undefined,
          expected_amount: formData.expected_amount ? Number(formData.expected_amount) : null,
          period_start: formData.period_start || null,
          period_end: formData.period_end || null,
          is_compliant: formData.is_compliant,
          notes: formData.notes || null,
        })

      if (insertError) throw insertError

      toast.success('Tracking record created')
      router.push('/compliance/lien-law')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create record'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/compliance/lien-law" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Law
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">New Tracking Record</h1>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Card>
        <CardHeader>
          <CardTitle>Record Details</CardTitle>
          <CardDescription>Track lien waiver compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="job_id" className="text-sm font-medium">Job</label>
              <select
                id="job_id"
                name="job_id"
                required
                value={formData.job_id}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a job...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
              <select
                id="vendor_id"
                name="vendor_id"
                required
                value={formData.vendor_id}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="expected_amount" className="text-sm font-medium">Expected Amount</label>
            <Input id="expected_amount" name="expected_amount" type="number" step="0.01" value={formData.expected_amount} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="period_start" className="text-sm font-medium">Period Start</label>
              <Input id="period_start" name="period_start" type="date" value={formData.period_start} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="period_end" className="text-sm font-medium">Period End</label>
              <Input id="period_end" name="period_end" type="date" value={formData.period_end} onChange={handleChange} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="is_compliant" name="is_compliant" type="checkbox" checked={formData.is_compliant} onChange={handleChange} className="h-4 w-4 rounded border-input" />
            <label htmlFor="is_compliant" className="text-sm font-medium">Compliant</label>
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Link href="/compliance/lien-law"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Record
          </Button>
        </div>
      </form>
    </div>
  )
}
