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
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

// -- Types ------------------------------------------------------------------

interface ChangeOrderData {
  id: string
  co_number: string | null
  title: string | null
  description: string | null
  amount: number | null
  status: string | null
  change_type: string | null
  schedule_impact_days: number | null
  created_at: string | null
  approved_at: string | null
}

interface ChangeOrderFormData {
  co_number: string
  title: string
  description: string
  amount: string
  status: string
  change_type: string
  schedule_impact_days: string
}

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'rejected'] as const
const CHANGE_TYPE_OPTIONS = ['addition', 'deduction', 'revision'] as const

// -- Component --------------------------------------------------------------

export default function ChangeOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const jobId = params.id as string
  const coId = params.coId as string

  const [co, setCo] = useState<ChangeOrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const [formData, setFormData] = useState<ChangeOrderFormData>({
    co_number: '',
    title: '',
    description: '',
    amount: '',
    status: 'draft',
    change_type: 'addition',
    schedule_impact_days: '',
  })

  useEffect(() => {
    async function loadCo() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const cid = profile?.company_id
      if (!cid) { setError('No company found'); setLoading(false); return }
      setCompanyId(cid)

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', cid).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('change_orders')
        .select('*')
        .eq('id', coId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Change order not found')
        setLoading(false)
        return
      }

      const c = data as ChangeOrderData
      setCo(c)
      setFormData({
        co_number: c.co_number || '',
        title: c.title || '',
        description: c.description || '',
        amount: c.amount != null ? String(c.amount) : '',
        status: c.status || 'draft',
        change_type: c.change_type || 'addition',
        schedule_impact_days: c.schedule_impact_days != null ? String(c.schedule_impact_days) : '',
      })
      setLoading(false)
    }
    loadCo()
  }, [jobId, coId, supabase])

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
        .from('change_orders')
        .update({
          co_number: formData.co_number || undefined,
          title: formData.title || undefined,
          description: formData.description || undefined,
          amount: formData.amount ? Number(formData.amount) : undefined,
          status: formData.status || 'draft',
          change_type: formData.change_type || undefined,
          schedule_impact_days: formData.schedule_impact_days ? Number(formData.schedule_impact_days) : undefined,
        })
        .eq('id', coId)
        .eq('job_id', jobId)

      if (updateError) throw updateError

      setCo((prev) =>
        prev
          ? {
              ...prev,
              co_number: formData.co_number || null,
              title: formData.title || null,
              description: formData.description || null,
              amount: formData.amount ? Number(formData.amount) : null,
              status: formData.status,
              change_type: formData.change_type || null,
              schedule_impact_days: formData.schedule_impact_days ? Number(formData.schedule_impact_days) : null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('change_orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', coId)
      .eq('job_id', jobId)

    if (deleteError) {
      setError('Failed to archive change order')
      return
    }

    router.push(`/jobs/${jobId}/change-orders`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!co) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/change-orders`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Change Orders
        </Link>
        <p className="text-destructive">{error || 'Change order not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/change-orders`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Change Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {co.co_number && <span className="text-lg font-mono text-muted-foreground">{co.co_number}</span>}
              <h1 className="text-2xl font-bold text-foreground">{co.title ?? 'Untitled Change Order'}</h1>
              <Badge className={`${getStatusColor(co.status ?? 'draft')} rounded`}>
                {(co.status ?? 'draft').replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {co.created_at ? formatDate(co.created_at) : 'Unknown'}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Change order updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Change Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CO Number</p>
                    <p className="font-medium font-mono">{co.co_number || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(co.status ?? 'draft')} rounded`}>
                      {(co.status ?? 'draft').replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className={`font-bold font-mono ${(co.amount ?? 0) >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                      {formatCurrency(co.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Change Type</p>
                    <p className="font-medium">{co.change_type ? co.change_type.charAt(0).toUpperCase() + co.change_type.slice(1) : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule Impact</p>
                    <p className="font-medium">
                      {co.schedule_impact_days != null && co.schedule_impact_days !== 0
                        ? <span className="text-amber-600">{co.schedule_impact_days > 0 ? '+' : ''}{co.schedule_impact_days} days</span>
                        : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approved At</p>
                    <p className="font-medium">{co.approved_at ? formatDate(co.approved_at) : 'Not approved'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {co.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{co.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Change Order
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Change Order Details</CardTitle>
                <CardDescription>Update change order information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="co_number" className="text-sm font-medium">CO Number</label>
                    <Input id="co_number" name="co_number" value={formData.co_number} onChange={handleChange} placeholder="e.g., CO-001" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Change order title" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                    <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="change_type" className="text-sm font-medium">Change Type</label>
                    <select id="change_type" name="change_type" value={formData.change_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {CHANGE_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="schedule_impact_days" className="text-sm font-medium">Schedule Impact (days)</label>
                    <Input id="schedule_impact_days" name="schedule_impact_days" type="number" value={formData.schedule_impact_days} onChange={handleChange} placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Describe the scope of this change</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Describe the change order..." />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive change order?"
        description="This change order will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
