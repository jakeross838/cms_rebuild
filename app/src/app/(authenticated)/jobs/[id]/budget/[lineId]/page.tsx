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
import { useBudgetLineFlat, useUpdateBudgetLineFlat } from '@/hooks/use-budget'
import { fetchJson } from '@/lib/api/fetch'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface BudgetLineData {
  id: string
  description: string
  phase: string | null
  cost_code_id: string | null
  estimated_amount: number
  actual_amount: number
  committed_amount: number
  projected_amount: number
  variance_amount: number
  notes: string | null
  created_at: string
  cost_codes: { code: string; name: string } | null
}

interface BudgetFormData {
  description: string
  phase: string
  estimated_amount: string
  actual_amount: string
  committed_amount: string
  notes: string
}

// ── Component ──────────────────────────────────────────────────

export default function BudgetLineDetailPage() {
  const params = useParams()
  const router = useRouter()

  const jobId = params.id as string
  const lineId = params.lineId as string

  const { data: response, isLoading, error: fetchError } = useBudgetLineFlat(lineId)
  const updateMutation = useUpdateBudgetLineFlat(lineId)

  const line = (response as { data: BudgetLineData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState<BudgetFormData>({
    description: '',
    phase: '',
    estimated_amount: '',
    actual_amount: '',
    committed_amount: '',
    notes: '',
  })

  useEffect(() => {
    if (line) {
      setFormData({
        description: line.description,
        phase: line.phase || '',
        estimated_amount: String(line.estimated_amount),
        actual_amount: String(line.actual_amount),
        committed_amount: String(line.committed_amount),
        notes: line.notes || '',
      })
    }
  }, [line])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.description.trim()) { toast.error('Description is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const estimated = Number(formData.estimated_amount) || 0
      const actual = Number(formData.actual_amount) || 0
      const committed = Number(formData.committed_amount) || 0
      const variance = estimated - actual

      await updateMutation.mutateAsync({
        description: formData.description,
        phase: formData.phase || null,
        estimated_amount: estimated,
        actual_amount: actual,
        committed_amount: committed,
        variance_amount: variance,
        notes: formData.notes || null,
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

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await fetchJson(`/api/v2/budget-lines/${lineId}`, { method: 'DELETE' })
      toast.success('Archived')
      router.push(`/jobs/${jobId}/budget`)
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
      setArchiving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!line) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/budget`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Budget
        </Link>
        <p className="text-destructive">{fetchError?.message || error || 'Budget line not found'}</p>
      </div>
    )
  }

  const varianceColor = line.variance_amount >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/budget`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Budget
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{line.description}</h1>
            <p className="text-muted-foreground">
              {line.cost_codes ? `${line.cost_codes.code} - ${line.cost_codes.name}` : 'No cost code'}
              {line.phase ? ` | ${line.phase}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Budget line updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Estimated</p>
                  <p className="text-lg font-bold">{formatCurrency(line.estimated_amount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Committed</p>
                  <p className="text-lg font-bold">{formatCurrency(line.committed_amount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Actual</p>
                  <p className="text-lg font-bold">{formatCurrency(line.actual_amount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Variance</p>
                  <p className="text-lg font-bold">
                    <Badge className={`${varianceColor} rounded`}>
                      {formatCurrency(line.variance_amount)}
                    </Badge>
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phase</span>
                    <p className="font-medium">{line.phase || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost Code</span>
                    <p className="font-medium">{line.cost_codes ? `${line.cost_codes.code} - ${line.cost_codes.name}` : 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Projected</span>
                    <p className="font-medium">{formatCurrency(line.projected_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {line.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{line.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Budget Line'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Budget Line Details</CardTitle>
                <CardDescription>Update budget line information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
                  <Input id="description" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phase" className="text-sm font-medium">Phase</label>
                  <Input id="phase" name="phase" value={formData.phase} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Amounts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="estimated_amount" className="text-sm font-medium">Estimated</label>
                    <Input id="estimated_amount" name="estimated_amount" type="number" step="0.01" value={formData.estimated_amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="committed_amount" className="text-sm font-medium">Committed</label>
                    <Input id="committed_amount" name="committed_amount" type="number" step="0.01" value={formData.committed_amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="actual_amount" className="text-sm font-medium">Actual</label>
                    <Input id="actual_amount" name="actual_amount" type="number" step="0.01" value={formData.actual_amount} onChange={handleChange} />
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
        title="Archive budget line?"
        description="This budget line will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
