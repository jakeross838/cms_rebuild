import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Mail } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface MarketingCampaign {
  id: string
  name: string
  description: string | null
  campaign_type: string
  channel: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget: number
  actual_spend: number
  leads_generated: number
  proposals_sent: number
  contracts_won: number
  contract_value_won: number
  roi_pct: number | null
}

export const metadata: Metadata = { title: 'Email Marketing' }

export default async function EmailMarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(`name.ilike.%${escapeLike(params.search)}%,description.ilike.%${escapeLike(params.search)}%`)
  }

  const { data: campaignsData, error } = await query
  if (error) throw error
  const campaigns = (campaignsData || []) as MarketingCampaign[]

  const totalSpend = campaigns.reduce((s, c) => s + c.actual_spend, 0)
  const totalLeads = campaigns.reduce((s, c) => s + c.leads_generated, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.contract_value_won, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-muted-foreground">{campaigns.length} campaigns</p>
        </div>
        <Link href="/email-marketing/new"><Button><Plus className="h-4 w-4 mr-2" />New Campaign</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Spend</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Leads Generated</p>
            <p className="text-2xl font-bold text-blue-600">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Revenue Won</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Campaigns</p>
            <p className="text-2xl font-bold">{campaigns.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search campaigns..." aria-label="Search campaigns" defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            All Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <div className="divide-y divide-border">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/email-marketing/${campaign.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent transition-colors -mx-6 px-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{campaign.name}</span>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        <Badge variant="outline" className="text-xs">{campaign.campaign_type}</Badge>
                        {campaign.channel && <Badge variant="outline" className="text-xs">{campaign.channel}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {campaign.start_date && `${formatDate(campaign.start_date)}`}
                        {campaign.end_date && ` — ${formatDate(campaign.end_date)}`}
                        {` • ${campaign.leads_generated} leads • ${campaign.contracts_won} won`}
                        {campaign.roi_pct != null && ` • ${campaign.roi_pct.toFixed(0)}% ROI`}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(campaign.actual_spend)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(campaign.budget)} budget</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No campaigns match your search' : 'No marketing campaigns yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
