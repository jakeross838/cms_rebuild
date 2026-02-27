'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────────────

interface DrawRequestData {
  id: string
  draw_number: number | null
  application_date: string | null
  period_to: string | null
  status: string | null
  contract_amount: number | null
  total_completed: number | null
  retainage_pct: number | null
  retainage_amount: number | null
  total_earned: number | null
  less_previous: number | null
  current_due: number | null
  balance_to_finish: number | null
  lender_reference: string | null
  notes: string | null
  created_at: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '$0.00'
  return currencyFmt.format(value)
}

function statusVariant(
  status: string | null
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'default'
    case 'submitted':
    case 'pending':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DrawRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [draw, setDraw] = useState<DrawRequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    draw_number: '',
    application_date: '',
    period_to: '',
    status: '',
    contract_amount: '',
    total_completed: '',
    retainage_pct: '',
    retainage_amount: '',
    total_earned: '',
    less_previous: '',
    current_due: '',
    balance_to_finish: '',
    lender_reference: '',
    notes: '',
  })

  useEffect(() => {
    async function loadDraw() {
      if (!companyId) { setError('No company found'); setLoading(false); return }
      const { data, error: fetchError } = await supabase
        .from('draw_requests')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Draw request not found')
        setLoading(false)
        return
      }

      const d = data as DrawRequestData
      setDraw(d)
      setFormData({
        draw_number: d.draw_number?.toString() || '',
        application_date: d.application_date || '',
        period_to: d.period_to || '',
        status: d.status || '',
        contract_amount: d.contract_amount?.toString() || '',
        total_completed: d.total_completed?.toString() || '',
        retainage_pct: d.retainage_pct?.toString() || '',
        retainage_amount: d.retainage_amount?.toString() || '',
        total_earned: d.total_earned?.toString() || '',
        less_previous: d.less_previous?.toString() || '',
        current_due: d.current_due?.toString() || '',
        balance_to_finish: d.balance_to_finish?.toString() || '',
        lender_reference: d.lender_reference || '',
        notes: d.notes || '',
      })
      setLoading(false)
    }
    loadDraw()
  }, [params.id, supabase, companyId])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('draw_requests')
        .update({
          draw_number: formData.draw_number
            ? parseInt(formData.draw_number, 10)
            : undefined,
          application_date: formData.application_date || undefined,
          period_to: formData.period_to || undefined,
          status: formData.status || undefined,
          contract_amount: formData.contract_amount
            ? parseFloat(formData.contract_amount)
            : undefined,
          total_completed: formData.total_completed
            ? parseFloat(formData.total_completed)
            : undefined,
          retainage_pct: formData.retainage_pct
            ? parseFloat(formData.retainage_pct)
            : undefined,
          retainage_amount: formData.retainage_amount
            ? parseFloat(formData.retainage_amount)
            : undefined,
          total_earned: formData.total_earned
            ? parseFloat(formData.total_earned)
            : undefined,
          less_previous: formData.less_previous
            ? parseFloat(formData.less_previous)
            : undefined,
          current_due: formData.current_due
            ? parseFloat(formData.current_due)
            : undefined,
          balance_to_finish: formData.balance_to_finish
            ? parseFloat(formData.balance_to_finish)
            : undefined,
          lender_reference: formData.lender_reference || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      toast.success('Saved')
      setDraw((prev) =>
        prev
          ? {
              ...prev,
              draw_number: formData.draw_number
                ? parseInt(formData.draw_number, 10)
                : null,
              application_date: formData.application_date || null,
              period_to: formData.period_to || null,
              status: formData.status || null,
              contract_amount: formData.contract_amount
                ? parseFloat(formData.contract_amount)
                : null,
              total_completed: formData.total_completed
                ? parseFloat(formData.total_completed)
                : null,
              retainage_pct: formData.retainage_pct
                ? parseFloat(formData.retainage_pct)
                : null,
              retainage_amount: formData.retainage_amount
                ? parseFloat(formData.retainage_amount)
                : null,
              total_earned: formData.total_earned
                ? parseFloat(formData.total_earned)
                : null,
              less_previous: formData.less_previous
                ? parseFloat(formData.less_previous)
                : null,
              current_due: formData.current_due
                ? parseFloat(formData.current_due)
                : null,
              balance_to_finish: formData.balance_to_finish
                ? parseFloat(formData.balance_to_finish)
                : null,
              lender_reference: formData.lender_reference || null,
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

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('draw_requests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive draw request')
      toast.error('Failed to archive draw request')
      return
    }

    toast.success('Archived')
    router.push('/draw-requests')
    router.refresh()
  }

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not found state ──────────────────────────────────────────────────────

  if (!draw) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          href="/draw-requests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Draw Requests
        </Link>
        <p className="text-destructive">{error || 'Draw request not found'}</p>
      </div>
    )
  }

  // ── View / Edit ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/draw-requests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Draw Requests
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Draw Request #{draw.draw_number ?? '--'}
            </h1>
            <p className="text-muted-foreground">
              Created{' '}
              {formatDate(draw.created_at) || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">
                Edit
              </Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
          Draw request updated successfully
        </div>
      )}

      <div className="space-y-6">
        {!editing ? (
          <>
            {/* View Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Draw Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Draw Number</dt>
                    <dd className="font-medium text-foreground">
                      #{draw.draw_number ?? '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant={statusVariant(draw.status)}>
                        {formatStatus(draw.status || 'draft')}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Application Date</dt>
                    <dd className="font-medium text-foreground">
                      {formatDate(draw.application_date) || '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Period To</dt>
                    <dd className="font-medium text-foreground">
                      {formatDate(draw.period_to) || '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Lender Reference</dt>
                    <dd className="font-medium text-foreground">
                      {draw.lender_reference || '--'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Contract Amount</dt>
                    <dd className="font-medium text-foreground">
                      {formatCurrency(draw.contract_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Completed</dt>
                    <dd className="font-medium text-foreground">
                      {formatCurrency(draw.total_completed)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Retainage %</dt>
                    <dd className="font-medium text-foreground">
                      {draw.retainage_pct !== null
                        ? `${draw.retainage_pct}%`
                        : '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Retainage Amount</dt>
                    <dd className="font-medium text-foreground">
                      {formatCurrency(draw.retainage_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Earned</dt>
                    <dd className="font-medium text-foreground">
                      {formatCurrency(draw.total_earned)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      Less Previous Certificates
                    </dt>
                    <dd className="font-medium text-foreground">
                      {formatCurrency(draw.less_previous)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Current Due</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatCurrency(draw.current_due)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Balance to Finish</dt>
                    <dd className="font-medium text-foreground">
                      {formatCurrency(draw.balance_to_finish)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {draw.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {draw.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowArchiveDialog(true)}
              >
                Archive Draw Request
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Draw Details</CardTitle>
                <CardDescription>
                  Update draw request information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="draw_number"
                      className="text-sm font-medium"
                    >
                      Draw Number
                    </label>
                    <Input
                      id="draw_number"
                      name="draw_number"
                      type="number"
                      value={formData.draw_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="application_date"
                      className="text-sm font-medium"
                    >
                      Application Date
                    </label>
                    <Input
                      id="application_date"
                      name="application_date"
                      type="date"
                      value={formData.application_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="period_to" className="text-sm font-medium">
                      Period To
                    </label>
                    <Input
                      id="period_to"
                      name="period_to"
                      type="date"
                      value={formData.period_to}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lender_reference"
                      className="text-sm font-medium"
                    >
                      Lender Reference
                    </label>
                    <Input
                      id="lender_reference"
                      name="lender_reference"
                      value={formData.lender_reference}
                      onChange={handleChange}
                      placeholder="e.g., Loan #12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>
                  Update financial amounts for this draw
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="contract_amount"
                      className="text-sm font-medium"
                    >
                      Contract Amount
                    </label>
                    <Input
                      id="contract_amount"
                      name="contract_amount"
                      type="number"
                      step="0.01"
                      value={formData.contract_amount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="total_completed"
                      className="text-sm font-medium"
                    >
                      Total Completed
                    </label>
                    <Input
                      id="total_completed"
                      name="total_completed"
                      type="number"
                      step="0.01"
                      value={formData.total_completed}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="retainage_pct"
                      className="text-sm font-medium"
                    >
                      Retainage %
                    </label>
                    <Input
                      id="retainage_pct"
                      name="retainage_pct"
                      type="number"
                      step="0.01"
                      value={formData.retainage_pct}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="retainage_amount"
                      className="text-sm font-medium"
                    >
                      Retainage Amount
                    </label>
                    <Input
                      id="retainage_amount"
                      name="retainage_amount"
                      type="number"
                      step="0.01"
                      value={formData.retainage_amount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="total_earned"
                      className="text-sm font-medium"
                    >
                      Total Earned
                    </label>
                    <Input
                      id="total_earned"
                      name="total_earned"
                      type="number"
                      step="0.01"
                      value={formData.total_earned}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="less_previous"
                      className="text-sm font-medium"
                    >
                      Less Previous Certificates
                    </label>
                    <Input
                      id="less_previous"
                      name="less_previous"
                      type="number"
                      step="0.01"
                      value={formData.less_previous}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="current_due"
                      className="text-sm font-medium"
                    >
                      Current Due
                    </label>
                    <Input
                      id="current_due"
                      name="current_due"
                      type="number"
                      step="0.01"
                      value={formData.current_due}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="balance_to_finish"
                      className="text-sm font-medium"
                    >
                      Balance to Finish
                    </label>
                    <Input
                      id="balance_to_finish"
                      name="balance_to_finish"
                      type="number"
                      step="0.01"
                      value={formData.balance_to_finish}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
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
        title="Archive draw request?"
        description="This draw request will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
