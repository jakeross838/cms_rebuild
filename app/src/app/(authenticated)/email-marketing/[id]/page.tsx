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
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

interface CampaignData {
  id: string
  name: string
  campaign_type: string
  status: string
  channel: string | null
  budget: number
  actual_spend: number
  start_date: string | null
  end_date: string | null
  target_audience: string | null
  leads_generated: number
  proposals_sent: number
  contracts_won: number
  contract_value_won: number
  description: string | null
  notes: string | null
  created_at: string | null
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    campaign_type: '',
    channel: '',
    budget: '',
    start_date: '',
    end_date: '',
    target_audience: '',
    description: '',
    notes: '',
  })

  useEffect(() => {
    async function loadCampaign() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)
      const { data, error: fetchError } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .single()

      if (fetchError || !data) {
        setError('Campaign not found')
        setLoading(false)
        return
      }

      const c = data as CampaignData
      setCampaign(c)
      setFormData({
        name: c.name,
        campaign_type: c.campaign_type || '',
        channel: c.channel || '',
        budget: c.budget?.toString() || '0',
        start_date: c.start_date || '',
        end_date: c.end_date || '',
        target_audience: c.target_audience || '',
        description: c.description || '',
        notes: c.notes || '',
      })
      setLoading(false)
    }
    loadCampaign()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConfirmArchive = async () => {
    setArchiving(true)
    try {
      const { error: archiveError } = await supabase
        .from('marketing_campaigns')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', params.id as string)
        .eq('company_id', companyId)
      if (archiveError) throw archiveError
      toast.success('Archived')
      router.push('/email-marketing')
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('marketing_campaigns')
        .update({
          name: formData.name,
          campaign_type: formData.campaign_type || undefined,
          channel: formData.channel || null,
          budget: parseFloat(formData.budget) || 0,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          target_audience: formData.target_audience || null,
          description: formData.description || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      toast.success('Saved')
      setCampaign((prev) => prev ? {
        ...prev,
        name: formData.name,
        campaign_type: formData.campaign_type,
        channel: formData.channel || null,
        budget: parseFloat(formData.budget) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        target_audience: formData.target_audience || null,
        description: formData.description || null,
        notes: formData.notes || null,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/email-marketing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Email Marketing
        </Link>
        <p className="text-destructive">{error || 'Campaign not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/email-marketing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Email Marketing
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
              <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {campaign.campaign_type} campaign{campaign.channel ? ` via ${campaign.channel}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
              </>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Campaign updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="text-sm font-medium">{campaign.campaign_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Channel</p>
                    <p className="text-sm font-medium">{campaign.channel || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">{formatDate(campaign.start_date) || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">{formatDate(campaign.end_date) || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Audience</p>
                    <p className="text-sm font-medium">{campaign.target_audience || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget & Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-sm font-medium">{formatCurrency(campaign.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Spend</p>
                    <p className="text-sm font-medium">{formatCurrency(campaign.actual_spend)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads Generated</p>
                    <p className="text-lg font-bold text-blue-600">{campaign.leads_generated}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proposals Sent</p>
                    <p className="text-lg font-bold">{campaign.proposals_sent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contracts Won</p>
                    <p className="text-lg font-bold text-green-600">{campaign.contracts_won}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Value Won</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(campaign.contract_value_won)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {campaign.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
                </CardContent>
              </Card>
            )}

            {campaign.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.notes}</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
                <CardDescription>Update campaign details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Campaign Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="campaign_type" className="text-sm font-medium">Type</label>
                    <select id="campaign_type" name="campaign_type" value={formData.campaign_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select type...</option>
                      <option value="email">Email</option>
                      <option value="social">Social</option>
                      <option value="print">Print</option>
                      <option value="referral">Referral</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="channel" className="text-sm font-medium">Channel</label>
                    <Input id="channel" name="channel" value={formData.channel} onChange={handleChange} placeholder="e.g., Facebook, Google Ads" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="budget" className="text-sm font-medium">Budget ($)</label>
                    <Input id="budget" name="budget" type="number" step="0.01" value={formData.budget} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                    <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="target_audience" className="text-sm font-medium">Target Audience</label>
                  <Input id="target_audience" name="target_audience" value={formData.target_audience} onChange={handleChange} placeholder="e.g., Homeowners 30-55, Commercial developers" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description & Notes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this campaign?"
        description="This campaign will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
