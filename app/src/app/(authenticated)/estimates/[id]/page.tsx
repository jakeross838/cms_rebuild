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
import { formatDate, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface EstimateData {
  id: string
  name: string
  estimate_type: string | null
  status: string | null
  contract_type: string | null
  total: number | null
  subtotal: number | null
  markup_pct: number | null
  overhead_pct: number | null
  profit_pct: number | null
  valid_until: string | null
  description: string | null
  notes: string | null
  version: number | null
  created_at: string | null
}

const ESTIMATE_TYPE_OPTIONS = ['lump_sum', 'cost_plus', 'time_and_materials', 'unit_price', 'gmp', 'design_build']

export default function EstimateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [estimate, setEstimate] = useState<EstimateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    estimate_type: '',
    contract_type: '',
    markup_pct: '',
    overhead_pct: '',
    profit_pct: '',
    valid_until: '',
    description: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEstimate() {
      if (!companyId) { setError('No company found'); setLoading(false); return }
      const { data, error: fetchError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Estimate not found')
        setLoading(false)
        return
      }

      const e = data as EstimateData
      setEstimate(e)
      setFormData({
        name: e.name || '',
        estimate_type: e.estimate_type || '',
        contract_type: e.contract_type || '',
        markup_pct: e.markup_pct?.toString() || '',
        overhead_pct: e.overhead_pct?.toString() || '',
        profit_pct: e.profit_pct?.toString() || '',
        valid_until: e.valid_until || '',
        description: e.description || '',
        notes: e.notes || '',
      })
      setLoading(false)
    }
    loadEstimate()
  }, [params.id, supabase, companyId])

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
        .from('estimates')
        .update({
          name: formData.name,
          estimate_type: formData.estimate_type || undefined,
          contract_type: formData.contract_type || null,
          markup_pct: formData.markup_pct ? parseFloat(formData.markup_pct) : null,
          overhead_pct: formData.overhead_pct ? parseFloat(formData.overhead_pct) : null,
          profit_pct: formData.profit_pct ? parseFloat(formData.profit_pct) : null,
          valid_until: formData.valid_until || null,
          description: formData.description || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setEstimate((prev) => prev ? {
        ...prev,
        name: formData.name,
        estimate_type: formData.estimate_type || null,
        contract_type: formData.contract_type || null,
        markup_pct: formData.markup_pct ? parseFloat(formData.markup_pct) : null,
        overhead_pct: formData.overhead_pct ? parseFloat(formData.overhead_pct) : null,
        profit_pct: formData.profit_pct ? parseFloat(formData.profit_pct) : null,
        valid_until: formData.valid_until || null,
        description: formData.description || null,
        notes: formData.notes || null,
      } : prev)
      toast.success('Estimate updated')
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save estimate')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('estimates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive estimate')
      toast.error('Failed to archive estimate')
      return
    }

    toast.success('Estimate archived')
    router.push('/estimates')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/estimates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Estimates
        </Link>
        <p className="text-destructive">{error || 'Estimate not found'}</p>
      </div>
    )
  }

  const formatCurrency = (val: number | null) => {
    if (val == null) return '--'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  const formatPct = (val: number | null) => {
    if (val == null) return '--'
    return `${val}%`
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/estimates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Estimates
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{estimate.name}</h1>
              {estimate.status && (
                <Badge variant="outline" className="text-xs">{formatStatus(estimate.status)}</Badge>
              )}
              {estimate.version && estimate.version > 1 && (
                <span className="text-xs text-muted-foreground">v{estimate.version}</span>
              )}
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(estimate.created_at) || 'Unknown'}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Estimate updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Estimate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{estimate.estimate_type ? estimate.estimate_type.replace('_', ' ') : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contract Type</span>
                    <p className="font-medium">{estimate.contract_type ? estimate.contract_type.replace('_', ' ') : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until</span>
                    <p className="font-medium">{formatDate(estimate.valid_until) || '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal</span>
                    <p className="font-medium">{formatCurrency(estimate.subtotal)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total</span>
                    <p className="font-medium text-lg">{formatCurrency(estimate.total)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Markup</span>
                    <p className="font-medium">{formatPct(estimate.markup_pct)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Overhead</span>
                    <p className="font-medium">{formatPct(estimate.overhead_pct)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profit</span>
                    <p className="font-medium">{formatPct(estimate.profit_pct)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {estimate.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{estimate.description}</p>
                </CardContent>
              </Card>
            )}

            {estimate.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{estimate.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Estimate
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Estimate Information</CardTitle>
                <CardDescription>Update estimate details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="estimate_type" className="text-sm font-medium">Estimate Type</label>
                    <select id="estimate_type" name="estimate_type" value={formData.estimate_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">--</option>
                      {ESTIMATE_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contract_type" className="text-sm font-medium">Contract Type</label>
                    <Input id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="valid_until" className="text-sm font-medium">Valid Until</label>
                  <Input id="valid_until" name="valid_until" type="date" value={formData.valid_until} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Percentages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="markup_pct" className="text-sm font-medium">Markup %</label>
                    <Input id="markup_pct" name="markup_pct" type="number" step="0.01" value={formData.markup_pct} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="overhead_pct" className="text-sm font-medium">Overhead %</label>
                    <Input id="overhead_pct" name="overhead_pct" type="number" step="0.01" value={formData.overhead_pct} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="profit_pct" className="text-sm font-medium">Profit %</label>
                    <Input id="profit_pct" name="profit_pct" type="number" step="0.01" value={formData.profit_pct} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description & Notes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive estimate?"
        description="This estimate will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
