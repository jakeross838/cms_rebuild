'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface TrackingData {
  id: string
  job_id: string | null
  vendor_id: string | null
  waiver_id: string | null
  expected_amount: number | null
  period_start: string | null
  period_end: string | null
  is_compliant: boolean
  notes: string | null
  created_at: string
}

interface TrackingFormData {
  job_id: string
  vendor_id: string
  expected_amount: string
  period_start: string
  period_end: string
  is_compliant: boolean
  notes: string
}

// ── Component ──────────────────────────────────────────────────

export default function LienLawDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const recordId = params.id as string

  const [record, setRecord] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<TrackingFormData>({
    job_id: '',
    vendor_id: '',
    expected_amount: '',
    period_start: '',
    period_end: '',
    is_compliant: true,
    notes: '',
  })

  useEffect(() => {
    async function loadRecord() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('lien_waiver_tracking')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', recordId)
        .single()

      if (fetchError || !data) {
        setError('Record not found')
        setLoading(false)
        return
      }

      const r = data as TrackingData
      setRecord(r)
      setFormData({
        job_id: r.job_id || '',
        vendor_id: r.vendor_id || '',
        expected_amount: r.expected_amount != null ? String(r.expected_amount) : '',
        period_start: r.period_start || '',
        period_end: r.period_end || '',
        is_compliant: r.is_compliant,
        notes: r.notes || '',
      })
      setLoading(false)
    }
    loadRecord()
  }, [recordId, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('lien_waiver_tracking')
        .update({
          job_id: formData.job_id || undefined,
          vendor_id: formData.vendor_id || undefined,
          expected_amount: formData.expected_amount ? Number(formData.expected_amount) : null,
          period_start: formData.period_start || null,
          period_end: formData.period_end || null,
          is_compliant: formData.is_compliant,
          notes: formData.notes || null,
        })
        .eq('id', recordId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      toast.success('Saved')
      setRecord((prev) =>
        prev
          ? {
              ...prev,
              job_id: formData.job_id || null,
              vendor_id: formData.vendor_id || null,
              expected_amount: formData.expected_amount ? Number(formData.expected_amount) : null,
              period_start: formData.period_start || null,
              period_end: formData.period_end || null,
              is_compliant: formData.is_compliant,
              notes: formData.notes || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error: archiveError } = await supabase
        .from('lien_waiver_tracking')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', recordId)
        .eq('company_id', companyId)

      if (archiveError) {
        setError('Failed to archive record')
        toast.error('Failed to archive record')
        return
      }

      toast.success('Archived')
      router.push('/compliance/lien-law')
      router.refresh()
  
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
    }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/compliance/lien-law" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Law
        </Link>
        <p className="text-destructive">{error || 'Record not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/lien-law" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Law
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Tracking Record</h1>
              <Badge className={getStatusColor(record.is_compliant ? 'approved' : 'rejected')}>
                {record.is_compliant ? 'Compliant' : 'Non-Compliant'}
              </Badge>
            </div>
            <p className="text-muted-foreground">Created {formatDate(record.created_at)}</p>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Record updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Compliance Status</span>
                    <p className="font-medium">{record.is_compliant ? 'Compliant' : 'Non-Compliant'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Amount</span>
                    <p className="font-medium">{record.expected_amount != null ? formatCurrency(record.expected_amount) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Period Start</span>
                    <p className="font-medium">{record.period_start ? formatDate(record.period_start) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Period End</span>
                    <p className="font-medium">{record.period_end ? formatDate(record.period_end) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Job ID</span>
                    <p className="font-medium font-mono text-xs">{record.job_id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vendor ID</span>
                    <p className="font-medium font-mono text-xs">{record.vendor_id || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {record.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Record
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Edit Record</CardTitle>
              <CardDescription>Update tracking information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="job_id" className="text-sm font-medium">Job ID</label>
                  <Input id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="vendor_id" className="text-sm font-medium">Vendor ID</label>
                  <Input id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} />
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
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive tracking record?"
        description="This tracking record will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
