'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    campaign_type: 'email',
    channel: '',
    budget: '',
    start_date: '',
    end_date: '',
    target_audience: '',
    description: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.name.trim()) { setError('Campaign name is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('marketing_campaigns')
        .insert({
          company_id: companyId,
          name: formData.name,
          campaign_type: formData.campaign_type,
          status: 'draft',
          budget: formData.budget ? parseFloat(formData.budget) : 0,
          actual_spend: 0,
          leads_generated: 0,
          proposals_sent: 0,
          contracts_won: 0,
          contract_value_won: 0,
          channel: formData.channel || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          target_audience: formData.target_audience || null,
          description: formData.description || null,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Campaign created')
      router.push('/email-marketing')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create campaign'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/email-marketing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Campaign</h1>
        <p className="text-muted-foreground">Create a marketing campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Name, type, and targeting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Campaign Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Spring Remodel Special" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="campaign_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                <select id="campaign_type" name="campaign_type" value={formData.campaign_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="email">Email</option>
                  <option value="social">Social Media</option>
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
                <Input id="channel" name="channel" value={formData.channel} onChange={handleChange} placeholder="e.g., Mailchimp, Facebook, Google Ads" />
              </div>
              <div className="space-y-2">
                <label htmlFor="target_audience" className="text-sm font-medium">Target Audience</label>
                <Input id="target_audience" name="target_audience" value={formData.target_audience} onChange={handleChange} placeholder="e.g., Homeowners 78701-78705" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget & Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium">Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="budget" name="budget" type="number" step="0.01" value={formData.budget} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description & Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Campaign goals and strategy..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Internal notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/email-marketing"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  )
}
