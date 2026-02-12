'use client'

import { useState } from 'react'
import {
  Search,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'automated'
type CampaignType = 'one-time' | 'automated' | 'drip'

interface Campaign {
  id: string
  name: string
  type: CampaignType
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
  isActive?: boolean
  aiNote?: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'February Newsletter',
    type: 'one-time',
    status: 'scheduled',
    subject: 'New Year, New Projects - See What We\'re Building',
    audienceLabel: 'All past clients',
    recipientCount: 127,
    scheduledAt: 'Feb 1, 9:00 AM',
    aiNote: 'Optimal send time selected based on past engagement',
  },
  {
    id: '2',
    name: 'Project Milestone Updates',
    type: 'automated',
    status: 'automated',
    subject: 'Project Progress Update',
    audienceLabel: 'Active project clients',
    recipientCount: 0,
    isActive: true,
    aiNote: '45% open rate - Clients love progress photos',
  },
  {
    id: '3',
    name: 'Annual Maintenance Reminder',
    type: 'automated',
    status: 'automated',
    subject: 'Time for Your Annual Home Maintenance Check',
    audienceLabel: 'Completed projects (1+ year)',
    recipientCount: 0,
    isActive: true,
    aiNote: '8 sent this month, steady performance',
  },
  {
    id: '4',
    name: 'January Newsletter',
    type: 'one-time',
    status: 'sent',
    subject: 'Holiday Wrap-up & New Year Plans',
    audienceLabel: 'All past clients',
    recipientCount: 125,
    sentAt: 'Jan 5',
    opens: 52,
    clicks: 18,
    openRate: 42,
    clickRate: 14,
  },
  {
    id: '5',
    name: 'Referral Campaign - Winter 2026',
    type: 'drip',
    status: 'scheduled',
    subject: 'Know Someone Who Needs Home Updates?',
    audienceLabel: 'Recent satisfied clients',
    recipientCount: 45,
    scheduledAt: 'Jan 20, 10:00 AM',
  },
]

const templates = [
  { name: 'Newsletter', icon: Mail, color: 'bg-blue-50 text-blue-600' },
  { name: 'Project Update', icon: Zap, color: 'bg-orange-50 text-orange-600' },
  { name: 'Seasonal Reminder', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
  { name: 'Referral Request', icon: Users, color: 'bg-purple-50 text-purple-600' },
  { name: 'Milestone Alert', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { name: 'Maintenance Check', icon: Zap, color: 'bg-cyan-50 text-cyan-600' },
]

const segmentations = [
  { label: 'Past Clients', count: 185 },
  { label: 'Active Projects', count: 42 },
  { label: 'Prospects', count: 68 },
  { label: 'High Engagement', count: 93 },
  { label: 'Inactive (6+ months)', count: 47 },
]

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const statusConfig = {
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
    sent: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
    automated: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Zap },
    draft: { bg: 'bg-gray-50', text: 'text-gray-700', icon: Edit },
  }

  const config = statusConfig[campaign.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{campaign.name}</h4>
            <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", config.bg, config.text)}>
              <StatusIcon className="h-3 w-3" />
              {campaign.status === 'automated' ? 'Active' : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{campaign.subject}</p>

          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              {campaign.audienceLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {campaign.recipientCount > 0 ? `${campaign.recipientCount} recipients` : 'Automated'}
            </span>
          </div>

          {campaign.aiNote && (
            <div className="p-2 bg-amber-50 rounded-md flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-amber-700">{campaign.aiNote}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {/* Scheduling or Analytics */}
          {campaign.status === 'scheduled' && campaign.scheduledAt && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Scheduled</div>
              <div className="text-sm font-medium text-gray-900">{campaign.scheduledAt}</div>
            </div>
          )}

          {campaign.status === 'sent' && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Sent {campaign.sentAt}</div>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">{campaign.opens}</div>
                  <div className="text-xs text-gray-500">{campaign.openRate}% open</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{campaign.clicks}</div>
                  <div className="text-xs text-gray-500">{campaign.clickRate}% click</div>
                </div>
              </div>
            </div>
          )}

          {campaign.status === 'automated' && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="Preview">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="Edit">
              <Edit className="h-4 w-4" />
            </button>
            {campaign.isActive ? (
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="Pause">
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="Activate">
                <Play className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmailMarketingPreview() {
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'scheduled' | 'sent' | 'automated'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesTab = activeTab === 'all' || campaign.status === activeTab
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

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

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Email Marketing Campaigns</h3>
            <div className="text-sm text-gray-500 mt-1">
              This month: {totalSent} sent • {totalScheduled} scheduled • {totalAutomated} automated
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <Mail className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-lg font-semibold text-blue-700">{totalSent}</div>
              <div className="text-xs text-blue-600">Sent This Month</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-lg font-semibold text-amber-700">{totalScheduled}</div>
              <div className="text-xs text-amber-600">Scheduled</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <Zap className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-lg font-semibold text-green-700">{totalAutomated}</div>
              <div className="text-xs text-green-600">Active Automated</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-lg font-semibold text-purple-700">{avgOpenRate}%</div>
              <div className="text-xs text-purple-600">Avg Open Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {(['all', 'drafts', 'scheduled', 'sent', 'automated'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  activeTab === tab
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredCampaigns.map(campaign => (
          <CampaignRow key={campaign.id} campaign={campaign} />
        ))}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No campaigns match your filters
          </div>
        )}
      </div>

      {/* Templates and Segmentation */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Email Templates</h4>
          <div className="grid grid-cols-3 gap-3">
            {templates.map(template => {
              const Icon = template.icon
              return (
                <button
                  key={template.name}
                  className={cn("p-3 rounded-lg border border-gray-200 hover:border-gray-300 text-left transition-colors", template.color)}
                >
                  <Icon className="h-5 w-5 mb-2" />
                  <div className="text-xs font-medium">{template.name}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Audience Segments</h4>
          <div className="grid grid-cols-2 gap-3">
            {segmentations.map((segment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-700">{segment.label}</span>
                <span className="text-sm font-semibold text-gray-900">{segment.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>Your average open rate (42%) is 2x higher than industry average. Project milestone emails perform best with 45% open rate.</p>
            <p>Recommend scheduling newsletters for Tuesday 9am based on your audience engagement patterns. Consider A/B testing subject lines with urgency words.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
