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
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface PermitData {
  id: string
  permit_number: string | null
  permit_type: string | null
  jurisdiction: string | null
  status: string | null
  applied_date: string | null
  issued_date: string | null
  expiration_date: string | null
  conditions: string | null
  notes: string | null
  created_at: string | null
}

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Approved', 'Issued', 'Expired', 'Denied'] as const

// ── Component ──────────────────────────────────────────────────

export default function PermitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const permitId = params.id as string

  const [permit, setPermit] = useState<PermitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    permit_number: '',
    permit_type: '',
    jurisdiction: '',
    status: '',
    applied_date: '',
    issued_date: '',
    expiration_date: '',
    conditions: '',
    notes: '',
  })

  useEffect(() => {
    async function loadPermit() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('permits')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', permitId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Permit not found')
        setLoading(false)
        return
      }

      const p = data as PermitData
      setPermit(p)
      setFormData({
        permit_number: p.permit_number || '',
        permit_type: p.permit_type || '',
        jurisdiction: p.jurisdiction || '',
        status: p.status || 'draft',
        applied_date: p.applied_date || '',
        issued_date: p.issued_date || '',
        expiration_date: p.expiration_date || '',
        conditions: p.conditions || '',
        notes: p.notes || '',
      })
      setLoading(false)
    }
    loadPermit()
  }, [permitId, supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('permits')
        .update({
          permit_number: formData.permit_number || null,
          permit_type: formData.permit_type || undefined,
          jurisdiction: formData.jurisdiction || null,
          status: formData.status,
          applied_date: formData.applied_date || null,
          issued_date: formData.issued_date || null,
          expiration_date: formData.expiration_date || null,
          conditions: formData.conditions || null,
          notes: formData.notes || null,
        })
        .eq('id', permitId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setPermit((prev) =>
        prev
          ? {
              ...prev,
              permit_number: formData.permit_number || null,
              permit_type: formData.permit_type || null,
              jurisdiction: formData.jurisdiction || null,
              status: formData.status,
              applied_date: formData.applied_date || null,
              issued_date: formData.issued_date || null,
              expiration_date: formData.expiration_date || null,
              conditions: formData.conditions || null,
              notes: formData.notes || null,
            }
          : prev
      )
      toast.success('Permit updated')
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save permit')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('permits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', permitId)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive permit')
      toast.error('Failed to archive permit')
      return
    }

    toast.success('Permit archived')
    router.push('/permits')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!permit) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/permits" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Permits
        </Link>
        <p className="text-destructive">{error || 'Permit not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/permits" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Permits
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{permit.permit_number || 'No Permit Number'}</h1>
            <p className="text-muted-foreground">
              {permit.permit_type || 'Permit'} {permit.jurisdiction ? `| ${permit.jurisdiction}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Permit updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Permit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Permit Number</span>
                    <p className="font-medium">{permit.permit_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">
                      <Badge className={`${getStatusColor(permit.status ?? 'draft')} rounded`}>{formatStatus(permit.status ?? 'draft')}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{permit.permit_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jurisdiction</span>
                    <p className="font-medium">{permit.jurisdiction || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied Date</span>
                    <p className="font-medium">{permit.applied_date ? formatDate(permit.applied_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued Date</span>
                    <p className="font-medium">{permit.issued_date ? formatDate(permit.issued_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiration Date</span>
                    <p className="font-medium">{permit.expiration_date ? formatDate(permit.expiration_date) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {permit.conditions && (
              <Card>
                <CardHeader><CardTitle>Conditions</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{permit.conditions}</p>
                </CardContent>
              </Card>
            )}

            {permit.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{permit.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Permit
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Permit Information</CardTitle>
                <CardDescription>Update permit details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="permit_number" className="text-sm font-medium">Permit Number</label>
                    <Input id="permit_number" name="permit_number" value={formData.permit_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="permit_type" className="text-sm font-medium">Permit Type</label>
                    <select id="permit_type" name="permit_type" value={formData.permit_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select type...</option>
                      {['Building', 'Electrical', 'Plumbing', 'Mechanical', 'Demolition', 'Other'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="jurisdiction" className="text-sm font-medium">Jurisdiction</label>
                    <Input id="jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="applied_date" className="text-sm font-medium">Applied Date</label>
                    <Input id="applied_date" name="applied_date" type="date" value={formData.applied_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="issued_date" className="text-sm font-medium">Issued Date</label>
                    <Input id="issued_date" name="issued_date" type="date" value={formData.issued_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expiration_date" className="text-sm font-medium">Expiration Date</label>
                    <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Conditions</CardTitle></CardHeader>
              <CardContent>
                <textarea id="conditions" aria-label="Conditions" name="conditions" value={formData.conditions} onChange={handleChange} rows={3} placeholder="Permit conditions or requirements..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes about this permit..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive permit?"
        description="This permit will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
