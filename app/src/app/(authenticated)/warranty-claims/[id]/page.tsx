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
import { useWarrantyClaimFlat, useUpdateWarrantyClaimFlat } from '@/hooks/use-warranty'
import { fetchJson } from '@/lib/api/fetch'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────
interface WarrantyClaimData {
  id: string
  claim_number: string | null
  title: string
  description: string | null
  status: string
  priority: string | null
  reported_date: string | null
  due_date: string | null
  resolution_notes: string | null
  resolution_cost: number | null
  created_at: string | null
}

// ── Component ──────────────────────────────────────────────────
export default function WarrantyClaimDetailPage() {
  const params = useParams()
  const router = useRouter()
  const claimId = params.id as string

  const { data: response, isLoading, error: fetchError } = useWarrantyClaimFlat(claimId)
  const updateMutation = useUpdateWarrantyClaimFlat(claimId)

  const claim = (response as { data: WarrantyClaimData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    status: 'submitted',
    due_date: '',
    resolution_notes: '',
    resolution_cost: '',
  })

  // ── Sync form data from hook response ─────────────────────────
  useEffect(() => {
    if (claim) {
      setFormData({
        title: claim.title,
        description: claim.description || '',
        priority: claim.priority || 'normal',
        status: claim.status || 'submitted',
        due_date: claim.due_date || '',
        resolution_notes: claim.resolution_notes || '',
        resolution_cost: claim.resolution_cost !== null ? String(claim.resolution_cost) : '',
      })
    }
  }, [claim])

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const costValue = formData.resolution_cost.trim() !== ''
        ? parseFloat(formData.resolution_cost)
        : null

      if (costValue !== null && isNaN(costValue)) {
        throw new Error('Resolution cost must be a valid number')
      }

      await updateMutation.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        resolution_notes: formData.resolution_notes || null,
        resolution_cost: costValue,
      })
      toast.success('Saved')
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

  const handleArchive = async () => {
    try {
      setArchiving(true)
      await fetchJson(`/api/v2/warranty-claims/${claimId}`, { method: 'DELETE' })
      toast.success('Archived')
      router.push('/warranty-claims')
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
      setArchiving(false)
    }
  }

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not found state ──────────────────────────────────────────────
  if (!claim) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/warranty-claims" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranty Claims
        </Link>
        <p className="text-destructive">{fetchError?.message || error || 'Warranty claim not found'}</p>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/warranty-claims" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranty Claims
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{claim.title}</h1>
              <Badge className={getStatusColor(claim.status.toLowerCase().replace(/ /g, '_'))}>{formatStatus(claim.status)}</Badge>
              {claim.priority && <Badge className={getStatusColor(claim.priority)}>{formatStatus(claim.priority)}</Badge>}
            </div>
            <p className="text-muted-foreground">
              {claim.claim_number && <span className="font-mono text-xs mr-2">{claim.claim_number}</span>}
              Filed {formatDate(claim.created_at) || 'Unknown'}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Warranty claim updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            {/* ── View Mode ────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reported Date</p>
                    <p className="text-sm font-medium">{formatDate(claim.reported_date) || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <p className="text-sm font-medium">{formatDate(claim.due_date) || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resolution Cost</p>
                    <p className="text-sm font-medium">{formatCurrency(claim.resolution_cost)}</p>
                  </div>
                </div>
                {claim.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{claim.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {claim.resolution_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{claim.resolution_notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Claim'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* ── Edit Mode ────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Details</CardTitle>
                <CardDescription>Update warranty claim information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea
                    id="description" aria-label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
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
                      <option value="submitted">Submitted</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="denied">Denied</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="resolution_cost" className="text-sm font-medium">Resolution Cost ($)</label>
                    <Input
                      id="resolution_cost"
                      name="resolution_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.resolution_cost}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Notes</CardTitle>
                <CardDescription>Document resolution details</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  id="resolution_notes" aria-label="Resolution notes"
                  name="resolution_notes"
                  value={formData.resolution_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Notes about how this claim was resolved..."
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
        title="Archive warranty claim?"
        description="This warranty claim will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
