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
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Low: 'bg-warm-100 text-warm-700',
    Medium: 'bg-info-bg text-info-dark',
    High: 'bg-warning-bg text-warning-dark',
    Urgent: 'bg-danger-bg text-danger-dark',
  }
  return colors[priority] || 'bg-warm-100 text-warm-700'
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '--'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

// ── Component ──────────────────────────────────────────────────────
export default function WarrantyClaimDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [claim, setClaim] = useState<WarrantyClaimData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    due_date: '',
    resolution_notes: '',
    resolution_cost: '',
  })

  // ── Load claim ───────────────────────────────────────────────────
  useEffect(() => {
    async function loadClaim() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('warranty_claims')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Warranty claim not found')
        setLoading(false)
        return
      }

      const c = data as WarrantyClaimData
      setClaim(c)
      setFormData({
        title: c.title,
        description: c.description || '',
        priority: c.priority || 'Medium',
        status: c.status || 'Open',
        due_date: c.due_date || '',
        resolution_notes: c.resolution_notes || '',
        resolution_cost: c.resolution_cost !== null ? String(c.resolution_cost) : '',
      })
      setLoading(false)
    }
    loadClaim()
  }, [params.id, supabase, companyId])

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
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

      const { error: updateError } = await supabase
        .from('warranty_claims')
        .update({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.due_date || null,
          resolution_notes: formData.resolution_notes || null,
          resolution_cost: costValue,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setClaim((prev) => prev ? {
        ...prev,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        resolution_notes: formData.resolution_notes || null,
        resolution_cost: costValue,
      } : prev)
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
    const { error: deleteError } = await supabase
      .from('warranty_claims')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive warranty claim')
      toast.error('Failed to archive warranty claim')
      return
    }
    toast.success('Archived')

    router.push('/warranty-claims')
    router.refresh()
  }

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
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
        <p className="text-destructive">{error || 'Warranty claim not found'}</p>
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
              <Badge className={getStatusColor(claim.status.toLowerCase().replace(/ /g, '_'))}>{claim.status}</Badge>
              {claim.priority && <Badge className={getPriorityColor(claim.priority)}>{claim.priority}</Badge>}
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
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Claim
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
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
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
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
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
