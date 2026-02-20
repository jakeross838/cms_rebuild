'use client'

import {
  Plus,
  Mail,
  Send,
  Clock,
  BarChart3,
  Zap,
  Sparkles,
  Eye,
  Edit,
  Pause,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Star,
  Camera,
  Share2,
  MessageSquare,
  Globe,
  Award,
  ExternalLink,
  Image,
  FileText,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'automated'
type CampaignType = 'one-time' | 'automated' | 'drip'
type CampaignChannel = 'email' | 'sms' | 'social'

interface Campaign {
  id: string
  name: string
  type: CampaignType
  channel: CampaignChannel
  status: CampaignStatus
  subject: string
  audienceLabel: string
  recipientCount: number
  scheduledAt?: string
  sentAt?: string
  opens?: number
  clicks?: number
  openRate?: number
  clickRate?: number
  unsubscribes?: number
  bounceRate?: number
  isActive?: boolean
  aiNote?: string
  leadsGenerated?: number
  revenue?: number
  utmCampaign?: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'February Newsletter',
    type: 'one-time',
    channel: 'email',
    status: 'scheduled',
    subject: 'New Year, New Projects - See What We\'re Building',
    audienceLabel: 'All past clients',
    recipientCount: 127,
    scheduledAt: 'Feb 1, 9:00 AM',
    utmCampaign: 'feb-2026-newsletter',
    aiNote: 'Optimal send time selected based on past engagement. Tuesday 9am shows 2.3x open rate vs other days.',
  },
  {
    id: '2',
    name: 'Project Milestone Updates',
    type: 'automated',
    channel: 'email',
    status: 'automated',
    subject: 'Project Progress Update - {{project_name}}',
    audienceLabel: 'Active project clients',
    recipientCount: 0,
    isActive: true,
    opens: 89,
    openRate: 45,
    clickRate: 22,
    aiNote: '45% open rate - 2x industry average. Clients engage most with progress photos.',
  },
  {
    id: '3',
    name: 'Annual Maintenance Reminder',
    type: 'automated',
    channel: 'email',
    status: 'automated',
    subject: 'Time for Your Annual Home Maintenance Check',
    audienceLabel: 'Completed projects (1+ year)',
    recipientCount: 0,
    isActive: true,
    opens: 34,
    openRate: 38,
    clickRate: 12,
    aiNote: '8 sent this month. 2 clients requested maintenance service callbacks.',
    leadsGenerated: 2,
  },
  {
    id: '4',
    name: 'January Newsletter',
    type: 'one-time',
    channel: 'email',
    status: 'sent',
    subject: 'Holiday Wrap-up & 2026 Plans',
    audienceLabel: 'All past clients',
    recipientCount: 125,
    sentAt: 'Jan 5',
    opens: 52,
    clicks: 18,
    openRate: 42,
    clickRate: 14,
    unsubscribes: 0,
    bounceRate: 1.2,
    leadsGenerated: 1,
    revenue: 250000,
    utmCampaign: 'jan-2026-newsletter',
  },
  {
    id: '5',
    name: 'Referral Campaign - Winter 2026',
    type: 'drip',
    channel: 'email',
    status: 'scheduled',
    subject: 'Know Someone Who Needs Home Updates?',
    audienceLabel: 'Recent satisfied clients (4.5+ rating)',
    recipientCount: 45,
    scheduledAt: 'Jan 20, 10:00 AM',
    utmCampaign: 'winter-referral-2026',
    aiNote: 'Targeting clients with 4.5+ satisfaction score. This segment has 3x referral conversion rate.',
  },
  {
    id: '6',
    name: 'Post-Completion Review Request',
    type: 'automated',
    channel: 'email',
    status: 'automated',
    subject: 'How was your experience with {{builder_name}}?',
    audienceLabel: 'Substantial completion milestone',
    recipientCount: 0,
    isActive: true,
    opens: 12,
    openRate: 60,
    clickRate: 40,
    aiNote: '60% open rate. 4 Google reviews collected this quarter. Consider adding Houzz review option.',
    leadsGenerated: 0,
  },
  {
    id: '7',
    name: 'Smith Residence Portfolio Post',
    type: 'one-time',
    channel: 'social',
    status: 'draft',
    subject: 'Check out our latest coastal build - Smith Residence',
    audienceLabel: 'Social followers',
    recipientCount: 0,
    aiNote: 'AI-generated hashtags: #CustomHomeBuilder #CoastalLiving #LuxuryHome #NewConstruction',
  },
]

const templates = [
  { name: 'Newsletter', icon: Mail, color: 'bg-stone-50 text-stone-600' },
  { name: 'Project Update', icon: Zap, color: 'bg-sand-50 text-sand-600' },
  { name: 'Review Request', icon: Star, color: 'bg-amber-50 text-amber-600' },
  { name: 'Referral Request', icon: Users, color: 'bg-warm-50 text-stone-600' },
  { name: 'Milestone Alert', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { name: 'Maintenance Reminder', icon: Clock, color: 'bg-stone-50 text-stone-600' },
  { name: 'Case Study', icon: FileText, color: 'bg-stone-50 text-stone-600' },
  { name: 'Social Post', icon: Share2, color: 'bg-warm-50 text-sand-600' },
  { name: 'Photo Gallery', icon: Image, color: 'bg-stone-50 text-stone-600' },
]

const segmentations = [
  { label: 'Past Clients', count: 185, description: 'All completed project clients' },
  { label: 'Active Projects', count: 42, description: 'Clients with active jobs' },
  { label: 'Prospects (Leads)', count: 68, description: 'Pipeline leads and inquiries' },
  { label: 'High Engagement', count: 93, description: 'Opened 3+ recent emails' },
  { label: 'Referral Sources', count: 31, description: 'Agents, architects, past referrers' },
  { label: 'Inactive (6+ months)', count: 47, description: 'No engagement in 6 months' },
]

const reviewPlatforms = [
  { name: 'Google Business', rating: 4.9, reviews: 47, trend: '+3 this month' },
  { name: 'Houzz', rating: 4.8, reviews: 32, trend: '+1 this month' },
  { name: 'Facebook', rating: 4.7, reviews: 18, trend: 'No change' },
  { name: 'BBB', rating: 'A+', reviews: 5, trend: 'No change' },
]

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const statusConfig = {
    scheduled: { bg: 'bg-stone-50', text: 'text-stone-700', icon: Clock },
    sent: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
    automated: { bg: 'bg-warm-50', text: 'text-warm-700', icon: Zap },
    draft: { bg: 'bg-warm-50', text: 'text-warm-700', icon: Edit },
  }

  const channelConfig = {
    email: { icon: Mail, label: 'Email' },
    sms: { icon: MessageSquare, label: 'SMS' },
    social: { icon: Share2, label: 'Social' },
  }

  const config = statusConfig[campaign.status]
  const channelInfo = channelConfig[campaign.channel]
  const StatusIcon = config.icon
  const ChannelIcon = channelInfo.icon

  return (
    <div className="bg-white border border-warm-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-warm-900">{campaign.name}</h4>
            <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", config.bg, config.text)}>
              <StatusIcon className="h-3 w-3" />
              {campaign.status === 'automated' ? 'Active' : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-warm-100 text-warm-600 flex items-center gap-1">
              <ChannelIcon className="h-3 w-3" />
              {channelInfo.label}
            </span>
            {campaign.type === 'drip' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-stone-50 text-stone-700">Drip</span>
            )}
          </div>

          <p className="text-sm text-warm-600 mb-2 line-clamp-1">{campaign.subject}</p>

          <div className="flex items-center gap-4 text-xs text-warm-600 mb-2">
            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              {campaign.audienceLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {campaign.recipientCount > 0 ? `${campaign.recipientCount} recipients` : 'Automated'}
            </span>
            {campaign.utmCampaign && (
              <span className="flex items-center gap-1 text-warm-400">
                <Globe className="h-3.5 w-3.5" />
                {campaign.utmCampaign}
              </span>
            )}
          </div>

          {/* Performance metrics for sent campaigns */}
          {campaign.status === 'sent' && (
            <div className="flex items-center gap-4 text-xs mb-2">
              {campaign.leadsGenerated !== undefined && campaign.leadsGenerated > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {campaign.leadsGenerated} lead{campaign.leadsGenerated > 1 ? 's' : ''} generated
                </span>
              )}
              {campaign.revenue !== undefined && campaign.revenue > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-3.5 w-3.5" />
                  ${(campaign.revenue / 1000).toFixed(0)}K attributed revenue
                </span>
              )}
              {campaign.bounceRate !== undefined && (
                <span className="text-warm-400">{campaign.bounceRate}% bounce</span>
              )}
            </div>
          )}

          {campaign.aiNote && (
            <div className="p-2 bg-amber-50 rounded-md flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-amber-700">{campaign.aiNote}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {campaign.status === 'scheduled' && campaign.scheduledAt && (
            <div className="text-right">
              <div className="text-xs text-warm-500">Scheduled</div>
              <div className="text-sm font-medium text-warm-900">{campaign.scheduledAt}</div>
            </div>
          )}

          {campaign.status === 'sent' && (
            <div className="text-right">
              <div className="text-xs text-warm-500">Sent {campaign.sentAt}</div>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <div>
                  <div className="font-semibold text-warm-900">{campaign.opens}</div>
                  <div className="text-xs text-warm-500">{campaign.openRate}% open</div>
                </div>
                <div>
                  <div className="font-semibold text-warm-900">{campaign.clicks}</div>
                  <div className="text-xs text-warm-500">{campaign.clickRate}% click</div>
                </div>
                {campaign.unsubscribes !== undefined && (
                  <div>
                    <div className="font-semibold text-warm-900">{campaign.unsubscribes}</div>
                    <div className="text-xs text-warm-500">unsub</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {campaign.status === 'automated' && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </div>
              {campaign.openRate && (
                <div className="text-xs text-warm-500">{campaign.openRate}% open rate</div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Preview">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Edit">
              <Edit className="h-4 w-4" />
            </button>
            {campaign.isActive ? (
              <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Pause">
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Activate">
                <Play className="h-4 w-4" />
              </button>
            )}
            <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Analytics">
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmailMarketingPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const filteredCampaigns = sortItems(
    mockCampaigns.filter(campaign => {
      if (!matchesSearch(campaign, search, ['name', 'subject', 'audienceLabel', 'channel'])) return false
      if (activeTab !== 'all' && campaign.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Campaign | '',
    sortDirection,
  )

  // Calculate stats
  const totalSent = mockCampaigns.filter(c => c.status === 'sent').length
  const totalScheduled = mockCampaigns.filter(c => c.status === 'scheduled').length
  const totalAutomated = mockCampaigns.filter(c => c.status === 'automated').length
  const avgOpenRate = Math.round(
    mockCampaigns
      .filter(c => c.openRate)
      .reduce((sum, c) => sum + (c.openRate || 0), 0) /
    mockCampaigns.filter(c => c.openRate).length
  ) || 0
  const totalLeads = mockCampaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0)
  const totalRevenue = mockCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-warm-900">Marketing & Outreach</h3>
            <div className="text-sm text-warm-500 mt-1">
              This month: {totalSent} sent | {totalScheduled} scheduled | {totalAutomated} automated
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
            <Mail className="h-4 w-4 text-stone-500" />
            <div>
              <div className="text-sm font-semibold text-stone-700">{totalSent}</div>
              <div className="text-[10px] text-stone-600">Sent</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
            <Clock className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-sm font-semibold text-amber-700">{totalScheduled}</div>
              <div className="text-[10px] text-amber-600">Scheduled</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Zap className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-semibold text-green-700">{totalAutomated}</div>
              <div className="text-[10px] text-green-600">Automated</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-warm-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-stone-600" />
            <div>
              <div className="text-sm font-semibold text-warm-700">{avgOpenRate}%</div>
              <div className="text-[10px] text-stone-600">Avg Open Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
            <Target className="h-4 w-4 text-stone-600" />
            <div>
              <div className="text-sm font-semibold text-stone-700">{totalLeads}</div>
              <div className="text-[10px] text-stone-600">Leads Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <div>
              <div className="text-sm font-semibold text-emerald-700">${(totalRevenue / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-emerald-600">Attributed Rev</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-warm-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded">
            <Users className="h-3 w-3" />
            Lead CRM
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <Camera className="h-3 w-3" />
            Project Photos
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-warm-50 text-warm-700 rounded">
            <Award className="h-3 w-3" />
            Portfolio
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <Star className="h-3 w-3" />
            Reviews
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded">
            <Globe className="h-3 w-3" />
            Client Portal
          </span>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search campaigns..."
          tabs={[
            { key: 'all', label: 'All', count: mockCampaigns.length },
            { key: 'draft', label: 'Drafts', count: mockCampaigns.filter(c => c.status === 'draft').length },
            { key: 'scheduled', label: 'Scheduled', count: mockCampaigns.filter(c => c.status === 'scheduled').length },
            { key: 'sent', label: 'Sent', count: mockCampaigns.filter(c => c.status === 'sent').length },
            { key: 'automated', label: 'Automated', count: mockCampaigns.filter(c => c.status === 'automated').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'recipientCount', label: 'Recipients' },
            { value: 'openRate', label: 'Open Rate' },
            { value: 'status', label: 'Status' },
            { value: 'channel', label: 'Channel' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredCampaigns.length}
          totalCount={mockCampaigns.length}
        />
      </div>

      {/* Campaign List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredCampaigns.map(campaign => (
          <CampaignRow key={campaign.id} campaign={campaign} />
        ))}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No campaigns match your filters
          </div>
        )}
      </div>

      {/* Review Monitoring */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Reputation Monitoring
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {reviewPlatforms.map((platform) => (
            <div key={platform.name} className="p-3 bg-warm-50 rounded-lg border border-warm-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-warm-900">{platform.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-warm-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-warm-900">{platform.rating}</span>
                </div>
                <span className="text-xs text-warm-500">({platform.reviews} reviews)</span>
              </div>
              <div className="text-[10px] text-warm-400 mt-1">{platform.trend}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates and Segmentation */}
      <div className="bg-white border-t border-warm-200 px-4 py-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-warm-900 mb-3">Email & Content Templates</h4>
          <div className="grid grid-cols-3 gap-3">
            {templates.map(template => {
              const Icon = template.icon
              return (
                <button
                  key={template.name}
                  className={cn("p-3 rounded-lg border border-warm-200 hover:border-warm-300 text-left transition-colors", template.color)}
                >
                  <Icon className="h-5 w-5 mb-2" />
                  <div className="text-xs font-medium">{template.name}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-warm-900 mb-3">Audience Segments</h4>
          <div className="grid grid-cols-3 gap-3">
            {segmentations.map((segment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-warm-50 rounded-lg border border-warm-200">
                <div>
                  <span className="text-sm text-warm-700 font-medium">{segment.label}</span>
                  <div className="text-[10px] text-warm-400">{segment.description}</div>
                </div>
                <span className="text-sm font-semibold text-warm-900">{segment.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel ROI */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <h4 className="text-xs font-semibold text-warm-700 mb-2">Channel Performance (Last 90 Days)</h4>
        <div className="flex items-center gap-3">
          {[
            { channel: 'Referral Program', leads: 8, roi: '420%', color: 'bg-green-100 text-green-700' },
            { channel: 'Website/SEO', leads: 5, roi: '180%', color: 'bg-stone-100 text-stone-700' },
            { channel: 'Houzz Profile', leads: 3, roi: '150%', color: 'bg-sand-100 text-sand-700' },
            { channel: 'Email Campaigns', leads: 3, roi: '310%', color: 'bg-warm-100 text-warm-700' },
            { channel: 'Social Media', leads: 2, roi: '90%', color: 'bg-warm-100 text-sand-700' },
            { channel: 'Parade of Homes', leads: 1, roi: '75%', color: 'bg-amber-100 text-amber-700' },
          ].map((ch) => (
            <div key={ch.channel} className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-xs", ch.color)}>
              <span className="font-medium">{ch.channel}</span>
              <span>{ch.leads}L</span>
              <span className="font-semibold">{ch.roi} ROI</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>Your average open rate (42%) is 2x higher than construction industry average. Milestone update emails perform best with 45% open rate.</p>
            <p>Referral program is your highest-ROI channel at 420%. Consider increasing referral reward to boost volume. 3 past clients haven't been asked for referrals yet.</p>
            <p>Portfolio page for "Davis Coastal Home" has been viewed 47 times - generating interest. Consider a case study to capitalize on momentum.</p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI-Powered Email Marketing"
          columns={2}
          features={[
            {
              feature: 'Send Time Optimization',
              trigger: 'Real-time',
              insight: 'Best time to send emails based on recipient engagement patterns and historical open rates.',
              detail: 'Analyzes past campaign performance to determine optimal send times for each audience segment.',
              confidence: 92,
              severity: 'success',
            },
            {
              feature: 'Subject Line Analysis',
              trigger: 'On creation',
              insight: 'Predicts open rates by analyzing subject line effectiveness using AI models.',
              detail: 'Evaluates subject line length, tone, personalization, and urgency to forecast engagement.',
              confidence: 87,
              severity: 'info',
            },
            {
              feature: 'Audience Segmentation',
              trigger: 'Daily',
              insight: 'Smart list segmentation based on client behavior, engagement history, and project status.',
              detail: 'Automatically groups contacts by engagement level, project type, and likelihood to convert.',
              confidence: 94,
              severity: 'success',
            },
            {
              feature: 'Content Suggestions',
              trigger: 'On creation',
              insight: 'AI content recommendations tailored to your audience and campaign goals.',
              detail: 'Suggests copy improvements, calls-to-action, and personalization tokens based on best practices.',
              confidence: 85,
              severity: 'info',
            },
            {
              feature: 'Performance Prediction',
              trigger: 'On submission',
              insight: 'Predicts campaign results including open rates, click rates, and conversion likelihood.',
              detail: 'Uses machine learning to forecast campaign performance before sending.',
              confidence: 89,
              severity: 'success',
            },
          ]}
        />
      </div>
    </div>
  )
}
