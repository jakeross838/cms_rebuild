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
import { formatCurrency, formatDate, getStatusColor, formatStatus} from '@/lib/utils'
import { toast } from 'sonner'

// -- Types ------------------------------------------------------------------

interface DrawRequestData {
  id: string
  draw_number: number | null
  status: string | null
  contract_amount: number | null
  total_earned: number | null
  total_completed: number | null
  current_due: number | null
  retainage_amount: number | null
  application_date: string | null
  submitted_at: string | null
  approved_at: string | null
  created_at: string | null
}

interface DrawRequestFormData {
  draw_number: string
  status: string
  contract_amount: string
  total_earned: string
  total_completed: string
  current_due: string
  retainage_amount: string
  application_date: string
}

const STATUS_OPTIONS = ['draft', 'submitted', 'approved', 'rejected', 'paid'] as const

// -- Component --------------------------------------------------------------

export default function DrawRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const drawId = params.drawId as string

  const [draw, setDraw] = useState<DrawRequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<DrawRequestFormData>({
    draw_number: '',
    status: 'draft',
    contract_amount: '',
    total_earned: '',
    total_completed: '',
    current_due: '',
    retainage_amount: '',
    application_date: '',
  })

  useEffect(() => {
    async function loadDraw() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('draw_requests')
        .select('*')
        .eq('id', drawId)
        .eq('job_id', jobId)
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
        draw_number: d.draw_number != null ? String(d.draw_number) : '',
        status: d.status || 'draft',
        contract_amount: d.contract_amount != null ? String(d.contract_amount) : '',
        total_earned: d.total_earned != null ? String(d.total_earned) : '',
        total_completed: d.total_completed != null ? String(d.total_completed) : '',
        current_due: d.current_due != null ? String(d.current_due) : '',
        retainage_amount: d.retainage_amount != null ? String(d.retainage_amount) : '',
        application_date: d.application_date || '',
      })
      setLoading(false)
    }
    loadDraw()
  }, [jobId, drawId, supabase, companyId])

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
        .from('draw_requests')
        .update({
          draw_number: formData.draw_number ? Number(formData.draw_number) : undefined,
          status: formData.status || 'draft',
          contract_amount: formData.contract_amount ? Number(formData.contract_amount) : undefined,
          total_earned: formData.total_earned ? Number(formData.total_earned) : undefined,
          total_completed: formData.total_completed ? Number(formData.total_completed) : undefined,
          current_due: formData.current_due ? Number(formData.current_due) : undefined,
          retainage_amount: formData.retainage_amount ? Number(formData.retainage_amount) : undefined,
          application_date: formData.application_date || undefined,
        })
        .eq('id', drawId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setDraw((prev) =>
        prev
          ? {
              ...prev,
              draw_number: formData.draw_number ? Number(formData.draw_number) : null,
              status: formData.status,
              contract_amount: formData.contract_amount ? Number(formData.contract_amount) : null,
              total_earned: formData.total_earned ? Number(formData.total_earned) : null,
              total_completed: formData.total_completed ? Number(formData.total_completed) : null,
              current_due: formData.current_due ? Number(formData.current_due) : null,
              retainage_amount: formData.retainage_amount ? Number(formData.retainage_amount) : null,
              application_date: formData.application_date || null,
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
      .eq('id', drawId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive draw request')
      toast.error('Failed to archive draw request')
      return
    }
    toast.success('Archived')

    router.push(`/jobs/${jobId}/draws`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/draws`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Draw Requests
        </Link>
        <p className="text-destructive">{error || 'Draw request not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/draws`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Draw Requests
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Draw Request {draw.draw_number != null ? `#${draw.draw_number}` : ''}
              </h1>
              <Badge className={`${getStatusColor(draw.status ?? 'draft')} rounded`}>
                {formatStatus((draw.status ?? 'draft'))}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {draw.application_date ? `Application: ${formatDate(draw.application_date)}` : 'No application date'}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Draw request updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Draw Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Draw Number</p>
                    <p className="font-medium font-mono">{draw.draw_number != null ? `#${draw.draw_number}` : 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(draw.status ?? 'draft')} rounded`}>
                      {formatStatus((draw.status ?? 'draft'))}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Application Date</p>
                    <p className="font-medium">{draw.application_date ? formatDate(draw.application_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted At</p>
                    <p className="font-medium">{draw.submitted_at ? formatDate(draw.submitted_at) : 'Not submitted'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approved At</p>
                    <p className="font-medium">{draw.approved_at ? formatDate(draw.approved_at) : 'Not approved'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Amount</p>
                    <p className="font-bold font-mono">{formatCurrency(draw.contract_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Completed</p>
                    <p className="font-bold font-mono">{formatCurrency(draw.total_completed)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="font-bold font-mono">{formatCurrency(draw.total_earned)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Due</p>
                    <p className="font-bold font-mono text-green-600">{formatCurrency(draw.current_due)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Retainage</p>
                    <p className="font-bold font-mono text-amber-600">{formatCurrency(draw.retainage_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Draw Request
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Draw Details</CardTitle>
                <CardDescription>Update draw request information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="draw_number" className="text-sm font-medium">Draw Number</label>
                    <Input id="draw_number" name="draw_number" type="number" value={formData.draw_number} onChange={handleChange} placeholder="1" />
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
                  <label htmlFor="application_date" className="text-sm font-medium">Application Date</label>
                  <Input id="application_date" name="application_date" type="date" value={formData.application_date} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>Update financial amounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contract_amount" className="text-sm font-medium">Contract Amount ($)</label>
                    <Input id="contract_amount" name="contract_amount" type="number" step="0.01" value={formData.contract_amount} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="total_completed" className="text-sm font-medium">Total Completed ($)</label>
                    <Input id="total_completed" name="total_completed" type="number" step="0.01" value={formData.total_completed} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="total_earned" className="text-sm font-medium">Total Earned ($)</label>
                    <Input id="total_earned" name="total_earned" type="number" step="0.01" value={formData.total_earned} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="current_due" className="text-sm font-medium">Current Due ($)</label>
                    <Input id="current_due" name="current_due" type="number" step="0.01" value={formData.current_due} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="retainage_amount" className="text-sm font-medium">Retainage Amount ($)</label>
                    <Input id="retainage_amount" name="retainage_amount" type="number" step="0.01" value={formData.retainage_amount} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
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
