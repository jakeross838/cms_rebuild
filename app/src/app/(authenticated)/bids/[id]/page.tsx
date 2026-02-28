'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Calendar, Gavel, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Textarea } from '@/components/ui/textarea'
import { useBidPackage, useUpdateBidPackage, useDeleteBidPackage } from '@/hooks/use-bids'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

const BID_STATUSES = ['draft', 'published', 'closed', 'awarded', 'cancelled']

interface BidPackageData {
  id: string
  title: string
  description: string | null
  trade: string | null
  scope_of_work: string | null
  bid_due_date: string | null
  status: string
  job_id: string | null
  created_by: string | null
  created_at: string | null
}

interface JobInfo {
  id: string
  name: string
}

export default function BidPackageDetailPage() {
  const params = useParams()
  const router = useRouter()

  const bidId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useBidPackage(bidId)
  const updateBid = useUpdateBidPackage(bidId)
  const deleteBid = useDeleteBidPackage()
  const bid = (response as { data: BidPackageData } | undefined)?.data ?? null

  const [jobInfo] = useState<JobInfo | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    trade: '',
    description: '',
    scope_of_work: '',
    bid_due_date: '',
    status: 'draft',
  })

  // ── Initialize form data when bid loads ────────────────────────
  useEffect(() => {
    if (bid) {
      setFormData({
        title: bid.title,
        trade: bid.trade || '',
        description: bid.description || '',
        scope_of_work: bid.scope_of_work || '',
        bid_due_date: bid.bid_due_date || '',
        status: bid.status,
      })
    }
  }, [bid])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ── Save changes ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }

    try {
      await updateBid.mutateAsync({
        title: formData.title,
        trade: formData.trade || null,
        description: formData.description || null,
        scope_of_work: formData.scope_of_work || null,
        bid_due_date: formData.bid_due_date || null,
        status: formData.status,
      } as Record<string, unknown>)

      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      toast.error(errorMessage)
    }
  }

  // ── Archive (soft delete) ───────────────────────────────────────────
  const handleArchive = async () => {
    try {
      setArchiving(true)
      await deleteBid.mutateAsync(bidId)
      toast.success('Archived')
      router.push('/bids')
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      toast.error(msg)
      setArchiving(false)
    }
  }

  // ── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not found state ─────────────────────────────────────────────────
  if (!bid) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/bids" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Bids
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Bid package not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/bids" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Bids
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{bid.title}</h1>
              <Badge className={getStatusColor(bid.status)}>{formatStatus(bid.status)}</Badge>
            </div>
            <p className="text-muted-foreground">
              Created {bid.created_at ? formatDate(bid.created_at) : 'Unknown'}
              {jobInfo && <> &middot; {jobInfo.name}</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateBid.isPending}>
                  {updateBid.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            {/* ── View Mode ──────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Bid Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trade</p>
                    <p className="text-sm">{bid.trade || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bid Due Date</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{bid.bid_due_date ? formatDate(bid.bid_due_date) : 'No due date'}</span>
                    </div>
                  </div>
                </div>
                {jobInfo && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Job</p>
                    <Link href={`/jobs/${jobInfo.id}`} className="text-sm text-primary hover:underline">{jobInfo.name}</Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {bid.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bid.description}</p>
                </CardContent>
              </Card>
            )}

            {bid.scope_of_work && (
              <Card>
                <CardHeader><CardTitle>Scope of Work</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bid.scope_of_work}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Bid Package'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* ── Edit Mode ──────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Bid Details</CardTitle>
                <CardDescription>Update bid package information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                    <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} placeholder="e.g., Framing" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bid_due_date" className="text-sm font-medium">Bid Due Date</label>
                    <Input id="bid_due_date" name="bid_due_date" type="date" value={formData.bid_due_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {BID_STATUSES.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="General description..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scope of Work</CardTitle>
                <CardDescription>Detailed scope for bidders</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea id="scope_of_work" name="scope_of_work" value={formData.scope_of_work} onChange={handleChange} rows={6} placeholder="Detailed scope of work..." />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive bid?"
        description="This bid will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
