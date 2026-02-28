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
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

const WAIVER_TYPES = [
  'Conditional Progress',
  'Unconditional Progress',
  'Conditional Final',
  'Unconditional Final',
]

interface LienWaiverData {
  id: string
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
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [waiver, setWaiver] = useState<LienWaiverData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    claimant_name: '',
    waiver_type: 'Conditional Progress',
    amount: '',
    through_date: '',
    check_number: '',
    notes: '',
  })

  useEffect(() => {
    async function loadWaiver() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('lien_waivers')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Lien waiver not found')
        setLoading(false)
        return
      }

      const w = data as LienWaiverData
      setWaiver(w)
      setFormData({
        claimant_name: w.claimant_name || '',
        waiver_type: w.waiver_type || 'Conditional Progress',
        amount: w.amount != null ? String(w.amount) : '',
        through_date: w.through_date || '',
        check_number: w.check_number || '',
        notes: w.notes || '',
      })
      setLoading(false)
    }
    loadWaiver()
  }, [params.id, companyId])

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
        .from('lien_waivers')
        .update({
          claimant_name: formData.claimant_name || null,
          waiver_type: formData.waiver_type || undefined,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          through_date: formData.through_date || null,
          check_number: formData.check_number || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setWaiver((prev) => prev ? {
        ...prev,
        claimant_name: formData.claimant_name || null,
        waiver_type: formData.waiver_type || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        through_date: formData.through_date || null,
        check_number: formData.check_number || null,
        notes: formData.notes || null,
      } : prev)
      setSuccess(true)
      setEditing(false)
      toast.success('Saved')
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
      const { error: deleteError } = await supabase
        .from('lien_waivers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (deleteError) {
        const errorMessage = 'Failed to archive lien waiver'
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      toast.success('Archived')
      router.push('/lien-waivers')
      router.refresh()
  
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
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
        <p className="text-destructive">{error || 'Lien waiver not found'}</p>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Lien waiver updated successfully</div>}

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

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Lien Waiver
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
                <div className="space-y-2">
                  <label htmlFor="claimant_name" className="text-sm font-medium">Claimant Name <span className="text-red-500">*</span></label>
                  <Input id="claimant_name" name="claimant_name" value={formData.claimant_name} onChange={handleChange} required />
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
                        <option key={type} value={type}>{type}</option>
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
    </div>
  )
}
