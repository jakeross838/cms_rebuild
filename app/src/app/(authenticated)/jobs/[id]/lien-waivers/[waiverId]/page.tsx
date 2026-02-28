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
import { useLienWaiver, useUpdateLienWaiver, useDeleteLienWaiver } from '@/hooks/use-lien-waivers'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface LienWaiverData {
  id: string
  waiver_type: string
  vendor_id: string | null
  amount: number | null
  through_date: string | null
  status: string
  claimant_name: string | null
  check_number: string | null
  notes: string | null
  created_at: string
  vendor_name: string | null
}

interface LienWaiverFormData {
  waiver_type: string
  amount: string
  through_date: string
  status: string
  claimant_name: string
  check_number: string
  notes: string
}

const WAIVER_TYPES = ['conditional_progress', 'unconditional_progress', 'conditional_final', 'unconditional_final']
const STATUS_OPTIONS = ['requested', 'received', 'approved', 'rejected', 'expired']

// ── Component ──────────────────────────────────────────────────

export default function LienWaiverDetailPage() {
  const params = useParams()
  const router = useRouter()

  const jobId = params.id as string
  const waiverId = params.waiverId as string

  const { data: response, isLoading: loading, error: fetchError } = useLienWaiver(waiverId)
  const updateLienWaiver = useUpdateLienWaiver(waiverId)
  const deleteLienWaiver = useDeleteLienWaiver()
  const waiver = (response as { data: LienWaiverData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState<LienWaiverFormData>({
    waiver_type: '',
    amount: '',
    through_date: '',
    status: '',
    claimant_name: '',
    check_number: '',
    notes: '',
  })

  useEffect(() => {
    if (waiver) {
      setFormData({
        waiver_type: waiver.waiver_type,
        amount: waiver.amount != null ? String(waiver.amount) : '',
        through_date: waiver.through_date || '',
        status: waiver.status,
        claimant_name: waiver.claimant_name || '',
        check_number: waiver.check_number || '',
        notes: waiver.notes || '',
      })
    }
  }, [waiver])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.waiver_type) { toast.error('Type is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateLienWaiver.mutateAsync({
        waiver_type: formData.waiver_type,
        amount: formData.amount ? Number(formData.amount) : null,
        through_date: formData.through_date || null,
        status: formData.status,
        claimant_name: formData.claimant_name || null,
        check_number: formData.check_number || null,
        notes: formData.notes || null,
      })
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

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deleteLienWaiver.mutateAsync(waiverId)
      toast.success('Archived')
      router.push(`/jobs/${jobId}/lien-waivers`)
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!waiver) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/lien-waivers`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Waivers
        </Link>
        <p className="text-destructive">{error || 'Lien waiver not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/lien-waivers`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Waivers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {formatStatus(waiver.waiver_type)}
              </h1>
              <Badge className={getStatusColor(waiver.status)}>
                {formatStatus(waiver.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {waiver.vendor_name || waiver.claimant_name || 'No vendor'}
              {waiver.through_date ? ` - Through ${formatDate(waiver.through_date)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Lien waiver updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Waiver Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{formatStatus(waiver.waiver_type)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount</span>
                    <p className="font-medium">{waiver.amount != null ? formatCurrency(waiver.amount) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vendor</span>
                    <p className="font-medium">{waiver.vendor_name || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Through Date</span>
                    <p className="font-medium">{waiver.through_date ? formatDate(waiver.through_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Claimant</span>
                    <p className="font-medium">{waiver.claimant_name || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check Number</span>
                    <p className="font-medium">{waiver.check_number || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(waiver.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {waiver.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{waiver.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Lien Waiver'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Waiver Information</CardTitle>
                <CardDescription>Update lien waiver details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="waiver_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                    <select id="waiver_type" name="waiver_type" value={formData.waiver_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {WAIVER_TYPES.map((t) => (
                        <option key={t} value={t}>{formatStatus(t)}</option>
                      ))}
                    </select>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                    <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="through_date" className="text-sm font-medium">Through Date</label>
                    <Input id="through_date" name="through_date" type="date" value={formData.through_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="claimant_name" className="text-sm font-medium">Claimant Name</label>
                    <Input id="claimant_name" name="claimant_name" value={formData.claimant_name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="check_number" className="text-sm font-medium">Check Number</label>
                    <Input id="check_number" name="check_number" value={formData.check_number} onChange={handleChange} />
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
        title="Archive lien waiver?"
        description="This lien waiver will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
