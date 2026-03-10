'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react'

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
import {
  useDrawRequest,
  useUpdateDrawRequest,
  useDeleteDrawRequest,
  useDrawRequestLines,
  useCreateDrawRequestLine,
  useSubmitDrawRequest,
  useApproveDrawRequest,
} from '@/hooks/use-draw-requests'
import { useCostCodes } from '@/hooks/use-cost-codes'
import { formatCurrency, formatDate, formatStatus, getStatusColor, cn } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────────────

interface DrawRequestData {
  id: string
  draw_number: number | null
  job_id: string | null
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
  submitted_at: string | null
  approved_at: string | null
  created_at: string | null
  jobs?: { name: string; job_number: string | null } | null
}

interface DrawLine {
  id: string
  cost_code_id: string | null
  description: string
  scheduled_value: number
  previous_applications: number
  current_work: number
  materials_stored: number
  total_completed: number
  pct_complete: number
  balance_to_finish: number
  retainage: number
  sort_order: number
  cost_codes?: { code: string; name: string } | null
}

interface CostCodeItem {
  id: string
  code: string
  name: string
}

// ── Status colors ────────────────────────────────────────────────────────────

const DRAW_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-stone-100 text-stone-700',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  submitted_to_lender: 'bg-blue-100 text-blue-700',
  funded: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DrawRequestDetailPage() {
  const params = useParams()
  const router = useRouter()

  const drawId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useDrawRequest(drawId)
  const updateDraw = useUpdateDrawRequest(drawId)
  const deleteDraw = useDeleteDrawRequest()
  const submitDraw = useSubmitDrawRequest(drawId)
  const approveDraw = useApproveDrawRequest(drawId)
  const { data: linesResponse } = useDrawRequestLines(drawId)
  const { data: costCodesResponse } = useCostCodes()

  const draw = (response as { data: DrawRequestData } | undefined)?.data ?? null
  const lines = ((linesResponse as { data: DrawLine[] } | undefined)?.data ?? []) as DrawLine[]
  const costCodes = ((costCodesResponse as { data: CostCodeItem[] } | undefined)?.data ?? []) as CostCodeItem[]

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showAddLine, setShowAddLine] = useState(false)

  const createLine = useCreateDrawRequestLine(drawId)

  // New line form
  const [newLine, setNewLine] = useState({
    cost_code_id: '',
    description: '',
    scheduled_value: '',
    previous_applications: '0',
    current_work: '0',
    materials_stored: '0',
  })

  const [formData, setFormData] = useState({
    draw_number: '',
    application_date: '',
    period_to: '',
    contract_amount: '',
    retainage_pct: '',
    lender_reference: '',
    notes: '',
  })

  useEffect(() => {
    if (draw) {
      setFormData({
        draw_number: draw.draw_number?.toString() || '',
        application_date: draw.application_date || '',
        period_to: draw.period_to || '',
        contract_amount: draw.contract_amount?.toString() || '',
        retainage_pct: draw.retainage_pct?.toString() || '',
        lender_reference: draw.lender_reference || '',
        notes: draw.notes || '',
      })
    }
  }, [draw])

  // ── Derived values ──

  const contractAmount = draw?.contract_amount ?? 0
  const totalCompleted = draw?.total_completed ?? 0
  const progressPct = contractAmount > 0 ? Math.round((totalCompleted / contractAmount) * 100) : 0
  const isDraft = draw?.status === 'draft'
  const isPendingReview = draw?.status === 'pending_review'
  const jobName = draw?.jobs?.name ?? null
  const jobNumber = draw?.jobs?.job_number ?? null

  // G703 line totals
  const lineTotals = useMemo(() => {
    return lines.reduce(
      (acc, line) => ({
        scheduledValue: acc.scheduledValue + (line.scheduled_value ?? 0),
        previousApplications: acc.previousApplications + (line.previous_applications ?? 0),
        currentWork: acc.currentWork + (line.current_work ?? 0),
        materialsStored: acc.materialsStored + (line.materials_stored ?? 0),
        totalCompleted: acc.totalCompleted + (line.total_completed ?? 0),
        balanceToFinish: acc.balanceToFinish + (line.balance_to_finish ?? 0),
      }),
      { scheduledValue: 0, previousApplications: 0, currentWork: 0, materialsStored: 0, totalCompleted: 0, balanceToFinish: 0 }
    )
  }, [lines])

  // ── Handlers ──

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setError(null)
    try {
      await updateDraw.mutateAsync({
        draw_number: formData.draw_number ? parseInt(formData.draw_number, 10) : undefined,
        application_date: formData.application_date || undefined,
        period_to: formData.period_to || undefined,
        contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : undefined,
        retainage_pct: formData.retainage_pct ? parseFloat(formData.retainage_pct) : undefined,
        lender_reference: formData.lender_reference || null,
        notes: formData.notes || null,
      } as Record<string, unknown>)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleSubmit = async () => {
    try {
      await submitDraw.mutateAsync({})
      toast.success('Draw request submitted for review')
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to submit')
    }
  }

  const handleApprove = async () => {
    try {
      await approveDraw.mutateAsync({})
      toast.success('Draw request approved')
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to approve')
    }
  }

  const handleAddLine = async () => {
    if (!newLine.description.trim()) { toast.error('Description is required'); return }
    try {
      await createLine.mutateAsync({
        cost_code_id: newLine.cost_code_id || undefined,
        description: newLine.description,
        scheduled_value: parseFloat(newLine.scheduled_value) || 0,
        previous_applications: parseFloat(newLine.previous_applications) || 0,
        current_work: parseFloat(newLine.current_work) || 0,
        materials_stored: parseFloat(newLine.materials_stored) || 0,
        sort_order: lines.length,
      })
      toast.success('Line added')
      setNewLine({ cost_code_id: '', description: '', scheduled_value: '', previous_applications: '0', current_work: '0', materials_stored: '0' })
      setShowAddLine(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add line')
    }
  }

  const handleArchive = async () => {
    try {
      setArchiving(true)
      await deleteDraw.mutateAsync(drawId)
      toast.success('Archived')
      router.push('/draw-requests')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Operation failed')
      setArchiving(false)
    }
  }

  const resetForm = () => {
    setEditing(false)
    setError(null)
    if (draw) {
      setFormData({
        draw_number: draw.draw_number?.toString() || '',
        application_date: draw.application_date || '',
        period_to: draw.period_to || '',
        contract_amount: draw.contract_amount?.toString() || '',
        retainage_pct: draw.retainage_pct?.toString() || '',
        lender_reference: draw.lender_reference || '',
        notes: draw.notes || '',
      })
    }
  }

  const selectClassName = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

  // ── Loading state ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link href="/draw-requests" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Draw Requests
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Draw request not found'}</p>
      </div>
    )
  }

  // ── Render ──

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/draw-requests" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Draw Requests
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Draw #{draw.draw_number ?? '--'}
              </h1>
              <Badge className={DRAW_STATUS_COLORS[draw.status ?? 'draft'] ?? 'bg-stone-100 text-stone-700'}>
                {formatStatus(draw.status || 'draft')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {jobNumber ? `${jobNumber} — ` : ''}{jobName ?? 'No job'}
              {draw.application_date && ` · Application: ${formatDate(draw.application_date)}`}
              {draw.period_to && ` · Period to: ${formatDate(draw.period_to)}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDraft && (
              <Button onClick={handleSubmit} disabled={submitDraw.isPending}>
                {submitDraw.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Submit
              </Button>
            )}
            {isPendingReview && (
              <Button onClick={handleApprove} disabled={approveDraw.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {approveDraw.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Approve
              </Button>
            )}
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />Edit
              </Button>
            ) : (
              <>
                <Button onClick={resetForm} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateDraw.isPending}>
                  {updateDraw.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {(fetchError || error) && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {fetchError?.message || error}
        </div>
      )}

      {editing ? (
        /* ── Edit Mode ── */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Draw Details</CardTitle>
              <CardDescription>Update draw request information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="draw_number" className="text-sm font-medium">Draw Number</label>
                  <Input id="draw_number" name="draw_number" type="number" value={formData.draw_number} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="application_date" className="text-sm font-medium">Application Date</label>
                  <Input id="application_date" name="application_date" type="date" value={formData.application_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="period_to" className="text-sm font-medium">Period To</label>
                  <Input id="period_to" name="period_to" type="date" value={formData.period_to} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contract_amount" className="text-sm font-medium">Contract Amount</label>
                  <Input id="contract_amount" name="contract_amount" type="number" step="0.01" value={formData.contract_amount} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="retainage_pct" className="text-sm font-medium">Retainage %</label>
                  <Input id="retainage_pct" name="retainage_pct" type="number" step="0.01" value={formData.retainage_pct} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lender_reference" className="text-sm font-medium">Lender Reference</label>
                  <Input id="lender_reference" name="lender_reference" value={formData.lender_reference} onChange={handleChange} placeholder="e.g., Loan #12345" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ── View Mode ── */
        <div className="space-y-6">
          {/* G702 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg p-3 bg-blue-50">
              <p className="text-xs font-medium text-blue-700 mb-1">Contract Value</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(contractAmount)}</p>
            </div>
            <div className="rounded-lg p-3 bg-stone-50">
              <p className="text-xs font-medium text-stone-700 mb-1">Previous Billed</p>
              <p className="text-lg font-bold text-stone-900">{formatCurrency(draw.less_previous)}</p>
            </div>
            <div className="rounded-lg p-3 bg-amber-50">
              <p className="text-xs font-medium text-amber-700 mb-1">This Period</p>
              <p className="text-lg font-bold text-amber-900">{formatCurrency(draw.current_due)}</p>
            </div>
            <div className="rounded-lg p-3 bg-emerald-50">
              <p className="text-xs font-medium text-emerald-700 mb-1">Progress</p>
              <p className="text-lg font-bold text-emerald-900">{progressPct}%</p>
              <div className="mt-1 h-1.5 rounded-full bg-emerald-200">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(progressPct, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                G702 Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Total Completed</dt>
                  <dd className="font-medium">{formatCurrency(draw.total_completed)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Retainage ({draw.retainage_pct ?? 0}%)</dt>
                  <dd className="font-medium">{formatCurrency(draw.retainage_amount)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total Earned</dt>
                  <dd className="font-medium">{formatCurrency(draw.total_earned)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Balance to Finish</dt>
                  <dd className="font-medium">{formatCurrency(draw.balance_to_finish)}</dd>
                </div>
              </dl>
              {draw.lender_reference && (
                <p className="text-xs text-muted-foreground mt-3">Lender Ref: {draw.lender_reference}</p>
              )}
            </CardContent>
          </Card>

          {/* G703 Schedule of Values (Line Items) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  G703 — Schedule of Values
                </CardTitle>
                {isDraft && (
                  <Button size="sm" variant="outline" onClick={() => setShowAddLine(!showAddLine)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />Add Line
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Line Form */}
              {showAddLine && isDraft && (
                <div className="mb-4 p-3 rounded-md bg-muted/50 border border-border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Cost Code</label>
                      <select value={newLine.cost_code_id} onChange={(e) => setNewLine((p) => ({ ...p, cost_code_id: e.target.value }))} className={selectClassName}>
                        <option value="">None</option>
                        {costCodes.map((cc) => <option key={cc.id} value={cc.id}>{cc.code} — {cc.name}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-medium">Description *</label>
                      <Input value={newLine.description} onChange={(e) => setNewLine((p) => ({ ...p, description: e.target.value }))} placeholder="Line item description" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Scheduled Value</label>
                      <Input type="number" step="0.01" value={newLine.scheduled_value} onChange={(e) => setNewLine((p) => ({ ...p, scheduled_value: e.target.value }))} placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Previous</label>
                      <Input type="number" step="0.01" value={newLine.previous_applications} onChange={(e) => setNewLine((p) => ({ ...p, previous_applications: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">This Period</label>
                      <Input type="number" step="0.01" value={newLine.current_work} onChange={(e) => setNewLine((p) => ({ ...p, current_work: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Materials Stored</label>
                      <Input type="number" step="0.01" value={newLine.materials_stored} onChange={(e) => setNewLine((p) => ({ ...p, materials_stored: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowAddLine(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddLine} disabled={createLine.isPending}>
                      {createLine.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Lines Table */}
              {lines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-2 font-medium text-muted-foreground">Item</th>
                        <th className="text-left p-2 font-medium text-muted-foreground">Description</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Scheduled Value</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Previous</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">This Period</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Materials</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Total</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">%</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lines.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-accent/50">
                          <td className="p-2 font-mono text-xs text-muted-foreground">
                            {line.cost_codes ? line.cost_codes.code : idx + 1}
                          </td>
                          <td className="p-2">{line.description}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(line.scheduled_value)}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(line.previous_applications)}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(line.current_work)}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(line.materials_stored)}</td>
                          <td className="p-2 text-right font-mono font-medium">{formatCurrency(line.total_completed)}</td>
                          <td className="p-2 text-right font-mono">
                            <span className={cn(
                              line.pct_complete > 100 ? 'text-red-600' : line.pct_complete >= 90 ? 'text-emerald-600' : ''
                            )}>
                              {Math.round(line.pct_complete)}%
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono">{formatCurrency(line.balance_to_finish)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/30 font-medium">
                        <td className="p-2" colSpan={2}>Totals</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(lineTotals.scheduledValue)}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(lineTotals.previousApplications)}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(lineTotals.currentWork)}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(lineTotals.materialsStored)}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(lineTotals.totalCompleted)}</td>
                        <td className="p-2 text-right font-mono">
                          {lineTotals.scheduledValue > 0 ? `${Math.round((lineTotals.totalCompleted / lineTotals.scheduledValue) * 100)}%` : '0%'}
                        </td>
                        <td className="p-2 text-right font-mono">{formatCurrency(lineTotals.balanceToFinish)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No line items yet</p>
                  {isDraft && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowAddLine(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />Add first line
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {draw.notes && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{draw.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Archive */}
          <div className="flex justify-end">
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
              <Trash2 className="h-4 w-4 mr-2" />{archiving ? 'Archiving...' : 'Archive'}
            </Button>
          </div>
        </div>
      )}

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
