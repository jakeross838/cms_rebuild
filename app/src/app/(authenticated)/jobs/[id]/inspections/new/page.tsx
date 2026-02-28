'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateInspection } from '@/hooks/use-inspections'
import { usePermits } from '@/hooks/use-permitting'
import { toast } from 'sonner'

type PermitRow = { id: string; permit_type: string; permit_number: string | null }

export default function NewInspectionPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const createMutation = useCreateInspection()

  // ── Dropdown data ──────────────────────────────────────────────
  const { data: permitsResponse } = usePermits({ job_id: jobId, limit: 500 } as Record<string, string | number | boolean | undefined>)
  const permits: PermitRow[] = ((permitsResponse as { data: PermitRow[] } | undefined)?.data ?? [])

  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    permit_id: '',
    inspection_type: 'foundation',
    status: 'scheduled',
    scheduled_date: '',
    scheduled_time: '',
    inspector_name: '',
    inspector_phone: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createMutation.isPending) return
    setError(null)

    if (!formData.permit_id) { setError('Please select a permit'); return }

    try {
      await createMutation.mutateAsync({
        job_id: jobId,
        permit_id: formData.permit_id,
        inspection_type: formData.inspection_type,
        status: formData.status,
        scheduled_date: formData.scheduled_date || null,
        scheduled_time: formData.scheduled_time || null,
        inspector_name: formData.inspector_name || null,
        inspector_phone: formData.inspector_phone || null,
        notes: formData.notes || null,
      })

      toast.success('Inspection created')
      router.push(`/jobs/${jobId}/inspections`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create inspection'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/inspections`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inspections
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Inspection</h1>
        <p className="text-muted-foreground">Schedule a new inspection for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
            <CardDescription>Permit, type, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="permit_id" className="text-sm font-medium">Permit <span className="text-red-500">*</span></label>
                <select id="permit_id" name="permit_id" value={formData.permit_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a permit...</option>
                  {permits.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.permit_type}{p.permit_number ? ` (${p.permit_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="inspection_type" className="text-sm font-medium">Inspection Type <span className="text-red-500">*</span></label>
                <select id="inspection_type" name="inspection_type" value={formData.inspection_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="foundation">Foundation</option>
                  <option value="framing">Framing</option>
                  <option value="rough_in">Rough-In</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="fire">Fire</option>
                  <option value="final">Final</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="scheduled">Scheduled</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="conditional">Conditional</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule &amp; Inspector</CardTitle>
            <CardDescription>Date, time, and inspector information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="scheduled_date" className="text-sm font-medium">Scheduled Date</label>
                <Input id="scheduled_date" name="scheduled_date" type="date" value={formData.scheduled_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="scheduled_time" className="text-sm font-medium">Scheduled Time</label>
                <Input id="scheduled_time" name="scheduled_time" value={formData.scheduled_time} onChange={handleChange} placeholder="e.g., 9:00 AM" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="inspector_name" className="text-sm font-medium">Inspector Name</label>
                <Input id="inspector_name" name="inspector_name" value={formData.inspector_name} onChange={handleChange} placeholder="e.g., John Smith" />
              </div>
              <div className="space-y-2">
                <label htmlFor="inspector_phone" className="text-sm font-medium">Inspector Phone</label>
                <Input id="inspector_phone" name="inspector_phone" value={formData.inspector_phone} onChange={handleChange} placeholder="e.g., (512) 555-0123" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes about this inspection..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/inspections`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Inspection'}
          </Button>
        </div>
      </form>
    </div>
  )
}
