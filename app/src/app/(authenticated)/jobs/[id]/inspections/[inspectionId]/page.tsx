'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface InspectionData {
  id: string
  inspection_type: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  inspector_name: string | null
  inspector_phone: string | null
  permit_id: string
  is_reinspection: boolean
  completed_at: string | null
  notes: string | null
  created_at: string
}

interface InspectionFormData {
  inspection_type: string
  status: string
  scheduled_date: string
  scheduled_time: string
  inspector_name: string
  inspector_phone: string
  notes: string
}

const STATUS_OPTIONS = ['scheduled', 'in_progress', 'passed', 'failed', 'cancelled', 'rescheduled']

// ── Component ──────────────────────────────────────────────────

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const inspectionId = params.inspectionId as string

  const [inspection, setInspection] = useState<InspectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<InspectionFormData>({
    inspection_type: '',
    status: 'scheduled',
    scheduled_date: '',
    scheduled_time: '',
    inspector_name: '',
    inspector_phone: '',
    notes: '',
  })

  useEffect(() => {
    async function loadInspection() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('permit_inspections')
        .select('*')
        .eq('id', inspectionId)
        .eq('job_id', jobId)
        .single()

      if (fetchError || !data) {
        setError('Inspection not found')
        setLoading(false)
        return
      }

      const i = data as InspectionData
      setInspection(i)
      setFormData({
        inspection_type: i.inspection_type,
        status: i.status,
        scheduled_date: i.scheduled_date || '',
        scheduled_time: i.scheduled_time || '',
        inspector_name: i.inspector_name || '',
        inspector_phone: i.inspector_phone || '',
        notes: i.notes || '',
      })
      setLoading(false)
    }
    loadInspection()
  }, [inspectionId, jobId, supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('permit_inspections')
        .update({
          inspection_type: formData.inspection_type,
          status: formData.status,
          scheduled_date: formData.scheduled_date || null,
          scheduled_time: formData.scheduled_time || null,
          inspector_name: formData.inspector_name || null,
          inspector_phone: formData.inspector_phone || null,
          notes: formData.notes || null,
        })
        .eq('id', inspectionId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setInspection((prev) =>
        prev
          ? {
              ...prev,
              inspection_type: formData.inspection_type,
              status: formData.status,
              scheduled_date: formData.scheduled_date || null,
              scheduled_time: formData.scheduled_time || null,
              inspector_name: formData.inspector_name || null,
              inspector_phone: formData.inspector_phone || null,
              notes: formData.notes || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      toast.success('Updated')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmArchive = async () => {
    setArchiving(true)
    const { error: archiveError } = await supabase
      .from('permit_inspections')
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', inspectionId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)
    if (archiveError) {
      setError('Failed to archive inspection')
      toast.error('Failed to archive inspection')
      setArchiving(false)
      return
    }
    toast.success('Archived')
    router.push(`/jobs/${jobId}/inspections`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!inspection) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/inspections`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inspections
        </Link>
        <p className="text-destructive">{error || 'Inspection not found'}</p>
      </div>
    )
  }

  const resultColor: Record<string, string> = {
    passed: 'bg-success-bg text-success-dark',
    failed: 'bg-danger-bg text-danger-dark',
    scheduled: 'bg-info-bg text-info-dark',
    in_progress: 'bg-warning-bg text-warning-dark',
    cancelled: 'bg-warm-100 text-warm-700',
    rescheduled: 'bg-warm-100 text-warm-700',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/inspections`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inspections
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {formatStatus(inspection.inspection_type)}
              </h1>
              <Badge className={resultColor[inspection.status] || getStatusColor(inspection.status)}>
                {formatStatus(inspection.status)}
              </Badge>
              {inspection.is_reinspection && (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-xs">Re-inspection</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {inspection.scheduled_date ? `Scheduled for ${formatDate(inspection.scheduled_date)}` : 'Not scheduled'}
              {inspection.scheduled_time ? ` at ${inspection.scheduled_time}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Inspection updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{formatStatus(inspection.inspection_type)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">{formatStatus(inspection.status)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Re-inspection</span>
                    <p className="font-medium">{inspection.is_reinspection ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed</span>
                    <p className="font-medium">{inspection.completed_at ? formatDate(inspection.completed_at) : 'Not completed'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Scheduled Date</span>
                    <p className="font-medium">{inspection.scheduled_date ? formatDate(inspection.scheduled_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scheduled Time</span>
                    <p className="font-medium">{inspection.scheduled_time || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Inspector Name</span>
                    <p className="font-medium">{inspection.inspector_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inspector Phone</span>
                    <p className="font-medium">{inspection.inspector_phone || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {inspection.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inspection.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Inspection Information</CardTitle>
                <CardDescription>Update inspection details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="inspection_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                    <Input id="inspection_type" name="inspection_type" value={formData.inspection_type} onChange={handleChange} required placeholder="e.g., Framing, Electrical, Plumbing" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="scheduled_date" className="text-sm font-medium">Scheduled Date</label>
                    <Input id="scheduled_date" name="scheduled_date" type="date" value={formData.scheduled_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="scheduled_time" className="text-sm font-medium">Scheduled Time</label>
                    <Input id="scheduled_time" name="scheduled_time" type="time" value={formData.scheduled_time} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Inspector</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="inspector_name" className="text-sm font-medium">Inspector Name</label>
                    <Input id="inspector_name" name="inspector_name" value={formData.inspector_name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inspector_phone" className="text-sm font-medium">Inspector Phone</label>
                    <Input id="inspector_phone" name="inspector_phone" type="tel" value={formData.inspector_phone} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this inspection?"
        description="This inspection will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
