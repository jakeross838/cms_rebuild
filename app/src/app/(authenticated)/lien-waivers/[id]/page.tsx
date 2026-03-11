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
import { useLienWaiver, useUpdateLienWaiver, useDeleteLienWaiver, useRejectLienWaiver } from '@/hooks/use-lien-waivers'
import { useVendors } from '@/hooks/use-vendors'
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

const WAIVER_TYPES = [
  'conditional_progress',
  'unconditional_progress',
  'conditional_final',
  'unconditional_final',
]

interface LienWaiverData {
  id: string
  vendor_id: string | null
  claimant_name: string | null
  waiver_type: string | null
  status: string | null
  amount: number | null
  through_date: string | null
  check_number: string | null
  notes: string | null
  requested_at: string | null
  received_at: string | null
  approved_at: string | null
  created_at: string | null
  updated_at: string | null
}

export default function LienWaiverDetailPage() {
  const params = useParams()
  const router = useRouter()
  const entityId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useLienWaiver(entityId)
  const updateWaiver = useUpdateLienWaiver(entityId)
  const deleteWaiver = useDeleteLienWaiver()
  const rejectWaiver = useRejectLienWaiver(entityId)
  const waiver = (response as { data: LienWaiverData } | undefined)?.data ?? null

  const { data: vendorsResponse, isLoading: vendorsLoading, isError: vendorsError } = useVendors({ limit: 500 })
  const vendors = ((vendorsResponse as { data: { id: string; name: string }[] } | undefined)?.data ?? [])
  const vendorName = waiver?.vendor_id ? vendors.find((v) => v.id === waiver.vendor_id)?.name ?? null : null

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const [formData, setFormData] = useState({
    claimant_name: '',
    vendor_id: '',
    waiver_type: 'conditional_progress',
    amount: '',
    through_date: '',
    check_number: '',
    notes: '',
  })

  useEffect(() => {
    if (waiver) {
      setFormData({
        claimant_name: waiver.claimant_name || '',
        vendor_id: waiver.vendor_id || '',
        waiver_type: waiver.waiver_type || 'conditional_progress',
        amount: waiver.amount != null ? String(waiver.amount) : '',
        through_date: waiver.through_date || '',
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
    if (!formData.claimant_name.trim()) { toast.error('Claimant Name is required'); return }

    setError(null)
    try {
      await updateWaiver.mutateAsync({
        claimant_name: formData.claimant_name || null,
        vendor_id: formData.vendor_id || null,
        waiver_type: formData.waiver_type || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        through_date: formData.through_date || null,
        check_number: formData.check_number || null,
        notes: formData.notes || null,
      } as Record<string, unknown>)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleArchive = async () => {
    try {
      setArchiving(true)
      await deleteWaiver.mutateAsync(entityId)
      toast.success('Archived')
      router.push('/lien-waivers')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const canReject = waiver && ['received', 'pending', 'sent'].includes(waiver.status || '')

  const handleReject = async () => {
    try {
      await rejectWaiver.mutateAsync({ reason: rejectReason || undefined })
      toast.success('Lien waiver rejected')
      setShowRejectDialog(false)
      setRejectReason('')
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to reject'
      toast.error(errorMessage)
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
        <Link href="/lien-waivers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Waivers
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Lien waiver not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/lien-waivers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Waivers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{waiver.claimant_name || 'Unknown Claimant'}</h1>
            <p className="text-muted-foreground">
              Created {formatDate(waiver.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null); if (waiver) { setFormData({ claimant_name: waiver.claimant_name || '', vendor_id: waiver.vendor_id || '', waiver_type: waiver.waiver_type || 'conditional_progress', amount: waiver.amount != null ? String(waiver.amount) : '', through_date: waiver.through_date || '', check_number: waiver.check_number || '', notes: waiver.notes || '' }) } }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateWaiver.isPending}>
                  {updateWaiver.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}
      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            {/* View Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Waiver Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Claimant</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.claimant_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Vendor</dt>
                    <dd className="font-medium text-foreground mt-0.5">{vendorsLoading ? 'Loading...' : vendorName || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Waiver Type</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.waiver_type || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.amount != null ? formatCurrency(waiver.amount) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-0.5"><Badge className={getStatusColor(waiver.status || 'draft')}>{formatStatus(waiver.status || 'draft')}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Through Date</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.through_date ? formatDate(waiver.through_date) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Check #</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.check_number || '-'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Requested</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.requested_at ? formatDate(waiver.requested_at) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Received</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.received_at ? formatDate(waiver.received_at) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Approved</dt>
                    <dd className="font-medium text-foreground mt-0.5">{waiver.approved_at ? formatDate(waiver.approved_at) : '-'}</dd>
                  </div>
                </dl>
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

            <div className="flex justify-end gap-2">
              {canReject && (
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowRejectDialog(true)} disabled={rejectWaiver.isPending}>
                  {rejectWaiver.isPending ? 'Rejecting...' : 'Reject'}
                </Button>
              )}
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Lien Waiver'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Waiver Details</CardTitle>
                <CardDescription>Update lien waiver information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="claimant_name" className="text-sm font-medium">Claimant Name <span className="text-red-500">*</span></label>
                    <Input id="claimant_name" name="claimant_name" value={formData.claimant_name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
                    <select
                      id="vendor_id"
                      name="vendor_id"
                      value={formData.vendor_id}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">{vendorsLoading ? 'Loading vendors...' : vendorsError ? 'Failed to load vendors' : 'Select a vendor...'}</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="waiver_type" className="text-sm font-medium">Waiver Type</label>
                    <select
                      id="waiver_type"
                      name="waiver_type"
                      value={formData.waiver_type}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {WAIVER_TYPES.map((type) => (
                        <option key={type} value={type}>{formatStatus(type)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                    <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="through_date" className="text-sm font-medium">Through Date</label>
                    <Input id="through_date" name="through_date" type="date" value={formData.through_date} onChange={handleChange} />
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
                <textarea
                  id="notes" aria-label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
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
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={showRejectDialog}
        onOpenChange={(open) => { setShowRejectDialog(open); if (!open) setRejectReason('') }}
        title="Reject lien waiver?"
        description="This will mark the lien waiver as rejected."
        confirmLabel="Reject"
        onConfirm={handleReject}
      >
        <div className="space-y-1.5 px-1">
          <label htmlFor="reject-reason" className="text-sm font-medium">Reason (optional)</label>
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Why is this waiver being rejected?"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
