'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Mail, MapPin, Phone, Save, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface LeadData {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  source: string | null
  source_detail: string | null
  project_type: string | null
  expected_contract_value: number | null
  status: string | null
  priority: string | null
  address: string | null
  lot_address: string | null
  timeline: string | null
  budget_range_low: number | null
  budget_range_high: number | null
  created_at: string | null
}

const SOURCE_OPTIONS = ['other', 'referral', 'website', 'social_media', 'walk_in', 'phone']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [lead, setLead] = useState<LeadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: '',
    source_detail: '',
    project_type: '',
    expected_contract_value: '',
    priority: '',
    address: '',
    lot_address: '',
    timeline: '',
    budget_range_low: '',
    budget_range_high: '',
  })

  useEffect(() => {
    async function loadLead() {
      if (!companyId) { setError('No company found'); setLoading(false); return }
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Lead not found')
        setLoading(false)
        return
      }

      const l = data as LeadData
      setLead(l)
      setFormData({
        first_name: l.first_name || '',
        last_name: l.last_name || '',
        email: l.email || '',
        phone: l.phone || '',
        source: l.source || '',
        source_detail: l.source_detail || '',
        project_type: l.project_type || '',
        expected_contract_value: l.expected_contract_value?.toString() || '',
        priority: l.priority || '',
        address: l.address || '',
        lot_address: l.lot_address || '',
        timeline: l.timeline || '',
        budget_range_low: l.budget_range_low?.toString() || '',
        budget_range_high: l.budget_range_high?.toString() || '',
      })
      setLoading(false)
    }
    loadLead()
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
        .from('leads')
        .update({
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          email: formData.email || null,
          phone: formData.phone || null,
          source: formData.source || undefined,
          source_detail: formData.source_detail || null,
          project_type: formData.project_type || null,
          expected_contract_value: formData.expected_contract_value ? parseFloat(formData.expected_contract_value) : null,
          priority: formData.priority || undefined,
          address: formData.address || null,
          lot_address: formData.lot_address || null,
          timeline: formData.timeline || null,
          budget_range_low: formData.budget_range_low ? parseFloat(formData.budget_range_low) : null,
          budget_range_high: formData.budget_range_high ? parseFloat(formData.budget_range_high) : null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setLead((prev) => prev ? {
        ...prev,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        source: formData.source || null,
        source_detail: formData.source_detail || null,
        project_type: formData.project_type || null,
        expected_contract_value: formData.expected_contract_value ? parseFloat(formData.expected_contract_value) : null,
        priority: formData.priority || null,
        address: formData.address || null,
        lot_address: formData.lot_address || null,
        timeline: formData.timeline || null,
        budget_range_low: formData.budget_range_low ? parseFloat(formData.budget_range_low) : null,
        budget_range_high: formData.budget_range_high ? parseFloat(formData.budget_range_high) : null,
      } : prev)
      toast.success('Lead updated')
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save lead')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive lead')
      toast.error('Failed to archive lead')
      return
    }

    toast.success('Lead archived')
    router.push('/leads')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/leads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Leads
        </Link>
        <p className="text-destructive">{error || 'Lead not found'}</p>
      </div>
    )
  }


  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/leads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Leads
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {lead.first_name} {lead.last_name}
              </h1>
              {lead.status && (
                <Badge className={getStatusColor(lead.status || 'new')}>{formatStatus(lead.status || 'new')}</Badge>
              )}
              {lead.priority && (
                <Badge className={getStatusColor(lead.priority || 'normal')}>{formatStatus(lead.priority || 'normal')}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Lead since {formatDate(lead.created_at) || 'Unknown'}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Lead updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.first_name} {lead.last_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.address || 'No address'}</span>
                </div>
                {lead.lot_address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Lot: {lead.lot_address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Source</span>
                    <p className="font-medium">{lead.source ? formatStatus(lead.source) : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source Detail</span>
                    <p className="font-medium">{lead.source_detail || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Project Type</span>
                    <p className="font-medium">{lead.project_type ? formatStatus(lead.project_type) : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeline</span>
                    <p className="font-medium">{lead.timeline || '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Expected Contract Value</span>
                    <p className="font-medium">{formatCurrency(lead.expected_contract_value)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget Range</span>
                    <p className="font-medium">
                      {lead.budget_range_low != null || lead.budget_range_high != null
                        ? `${formatCurrency(lead.budget_range_low)} - ${formatCurrency(lead.budget_range_high)}`
                        : '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Lead
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update lead details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="text-sm font-medium">First Name</label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="text-sm font-medium">Last Name</label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lot_address" className="text-sm font-medium">Lot Address</label>
                  <Input id="lot_address" name="lot_address" value={formData.lot_address} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="source" className="text-sm font-medium">Source</label>
                    <select id="source" name="source" value={formData.source} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">--</option>
                      {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="source_detail" className="text-sm font-medium">Source Detail</label>
                    <Input id="source_detail" name="source_detail" value={formData.source_detail} onChange={handleChange} placeholder="e.g., Referred by John" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="project_type" className="text-sm font-medium">Project Type</label>
                    <Input id="project_type" name="project_type" value={formData.project_type} onChange={handleChange} placeholder="e.g., new_construction" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">--</option>
                      {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{formatStatus(p)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="timeline" className="text-sm font-medium">Timeline</label>
                  <Input id="timeline" name="timeline" value={formData.timeline} onChange={handleChange} placeholder="e.g., Q3 2026" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="expected_contract_value" className="text-sm font-medium">Expected Contract Value</label>
                  <Input id="expected_contract_value" name="expected_contract_value" type="number" value={formData.expected_contract_value} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="budget_range_low" className="text-sm font-medium">Budget Range Low</label>
                    <Input id="budget_range_low" name="budget_range_low" type="number" value={formData.budget_range_low} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="budget_range_high" className="text-sm font-medium">Budget Range High</label>
                    <Input id="budget_range_high" name="budget_range_high" type="number" value={formData.budget_range_high} onChange={handleChange} placeholder="0.00" />
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
        title="Archive lead?"
        description="This lead will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
