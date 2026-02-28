'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useJobs } from '@/hooks/use-jobs'
import { useCreateLienWaiverTracking } from '@/hooks/use-lien-waivers'
import { useVendors } from '@/hooks/use-vendors'
import { toast } from 'sonner'

type JobRow = { id: string; name: string }
type VendorRow = { id: string; name: string }

export default function NewLienLawRecordPage() {
  const router = useRouter()
  const createMutation = useCreateLienWaiverTracking()

  // ── Dropdown data ──────────────────────────────────────────────
  const { data: jobsResponse } = useJobs({ limit: 500 } as Record<string, string | number | boolean | undefined>)
  const jobs: JobRow[] = ((jobsResponse as { data: JobRow[] } | undefined)?.data ?? [])

  const { data: vendorsResponse } = useVendors({ limit: 500 } as Record<string, string | number | boolean | undefined>)
  const vendors: VendorRow[] = ((vendorsResponse as { data: VendorRow[] } | undefined)?.data ?? [])

  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    job_id: '',
    vendor_id: '',
    expected_amount: '',
    period_start: '',
    period_end: '',
    is_compliant: true,
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (createMutation.isPending) return
    setError(null)

    if (!formData.job_id.trim()) {
      setError('Job is required')
      return
    }

    try {
      await createMutation.mutateAsync({
        job_id: formData.job_id,
        vendor_id: formData.vendor_id || undefined,
        expected_amount: formData.expected_amount ? Number(formData.expected_amount) : null,
        period_start: formData.period_start || null,
        period_end: formData.period_end || null,
        is_compliant: formData.is_compliant,
        notes: formData.notes || null,
      })

      toast.success('Tracking record created')
      router.push('/compliance/lien-law')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create record'
      toast.error(errorMessage)
      setError(errorMessage)
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Record
          </Button>
        </div>
      </form>
    </div>
  )
}
