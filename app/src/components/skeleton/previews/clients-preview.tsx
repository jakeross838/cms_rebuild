'use client'

import { useState } from 'react'

import {
  User,
  Building2,
  Mail,
  Phone,
  DollarSign,
  FolderOpen,
  Sparkles,
  Plus,
  MoreHorizontal,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  ArrowUpRight,
  Shield,
  UserPlus,
  Download,
  Upload,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

type ClientStatus = 'active' | 'pending' | 'completed' | 'on-hold' | 'warranty'

type CommunicationPref = 'email' | 'phone' | 'text' | 'in-person'

type ClientSource = 'referral' | 'website' | 'realtor' | 'repeat' | 'social_media' | 'other'

type ClientTier = 'standard' | 'premium' | 'luxury'

interface Client {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  mobile?: string
  address?: string
  totalProjects: number
  activeProjects: number
  totalContractValue: number
  currentProjectStatus: ClientStatus
  currentProjectName?: string
  communicationPreference: CommunicationPref
  lastContact: string
  clientSince: string
  source: ClientSource
  referredBy?: string
  referralsGiven: number
  portalEnabled: boolean
  portalLastLogin?: string
  tier: ClientTier
  tags: string[]
  pendingSelections: number
  pendingActions: number
  satisfactionScore?: number
  aiDecisionSpeed?: 'fast' | 'moderate' | 'deliberate'
  aiBudgetSensitivity?: 'low' | 'moderate' | 'high'
  aiStylePreferences?: string[]
  aiInsight?: string
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John & Sarah Smith',
    email: 'jsmith@email.com',
    phone: '(843) 555-0123',
    mobile: '(843) 555-0124',
    address: '456 Main St, Bradenton, FL',
    totalProjects: 3,
    activeProjects: 1,
    totalContractValue: 2450000,
    currentProjectStatus: 'active',
    currentProjectName: 'Smith Residence',
    communicationPreference: 'text',
    lastContact: '2 days ago',
    clientSince: '2022',
    source: 'referral',
    referredBy: 'Robert Johnson',
    referralsGiven: 2,
    portalEnabled: true,
    portalLastLogin: '2 hours ago',
    tier: 'luxury',
    tags: ['VIP', 'Repeat Client'],
    pendingSelections: 3,
    pendingActions: 4,
    satisfactionScore: 92,
    aiDecisionSpeed: 'fast',
    aiBudgetSensitivity: 'low',
    aiStylePreferences: ['Modern', 'White/Gray Palette', 'Premium Brands'],
    aiInsight: 'High engagement -- responds within 24hrs avg. Sarah is primary decision-maker. Text preferred.',
  },
  {
    id: '2',
    name: 'Robert Johnson',
    company: 'Johnson Properties LLC',
    email: 'robert@johnsonprops.com',
    phone: '(843) 555-0456',
    totalProjects: 5,
    activeProjects: 2,
    totalContractValue: 4200000,
    currentProjectStatus: 'active',
    currentProjectName: 'Johnson Beach House',
    communicationPreference: 'phone',
    lastContact: '1 week ago',
    clientSince: '2019',
    source: 'repeat',
    referralsGiven: 3,
    portalEnabled: true,
    portalLastLogin: '3 days ago',
    tier: 'luxury',
    tags: ['Top Client', 'Developer'],
    pendingSelections: 0,
    pendingActions: 1,
    satisfactionScore: 88,
    aiDecisionSpeed: 'fast',
    aiBudgetSensitivity: 'low',
    aiStylePreferences: ['Coastal', 'Traditional', 'Natural Materials'],
    aiInsight: 'Top repeat client -- 67% referral source. Schedule quarterly review.',
  },
  {
    id: '3',
    name: 'David Miller',
    email: 'dmiller@gmail.com',
    phone: '(843) 555-0789',
    totalProjects: 1,
    activeProjects: 0,
    totalContractValue: 320000,
    currentProjectStatus: 'completed',
    currentProjectName: 'Miller Addition',
    communicationPreference: 'text',
    lastContact: '3 weeks ago',
    clientSince: '2024',
    source: 'website',
    referralsGiven: 0,
    portalEnabled: true,
    portalLastLogin: '2 weeks ago',
    tier: 'standard',
    tags: [],
    pendingSelections: 0,
    pendingActions: 0,
    satisfactionScore: 78,
    aiDecisionSpeed: 'deliberate',
    aiBudgetSensitivity: 'high',
    aiInsight: 'Project complete. Warranty phase. Consider 6-month follow-up for referral request.',
  },
  {
    id: '4',
    name: 'Thomas Wilson',
    company: 'Wilson Development Group',
    email: 'twilson@wilsondev.com',
    phone: '(843) 555-0321',
    totalProjects: 8,
    activeProjects: 3,
    totalContractValue: 12500000,
    currentProjectStatus: 'active',
    currentProjectName: 'Wilson Custom',
    communicationPreference: 'in-person',
    lastContact: '3 days ago',
    clientSince: '2018',
    source: 'repeat',
    referralsGiven: 5,
    portalEnabled: true,
    portalLastLogin: '1 day ago',
    tier: 'luxury',
    tags: ['Top Client', 'VIP', 'Developer'],
    pendingSelections: 2,
    pendingActions: 2,
    satisfactionScore: 95,
    aiDecisionSpeed: 'fast',
    aiBudgetSensitivity: 'low',
    aiStylePreferences: ['Contemporary', 'High-End Finishes', 'Smart Home'],
    aiInsight: 'Top client by lifetime value ($12.5M). 5 referrals given. Schedule quarterly review.',
  },
  {
    id: '5',
    name: 'Michael Davis',
    email: 'mdavis@coastal.net',
    phone: '(843) 555-0654',
    totalProjects: 2,
    activeProjects: 1,
    totalContractValue: 1850000,
    currentProjectStatus: 'pending',
    currentProjectName: 'Davis Coastal Home',
    communicationPreference: 'email',
    lastContact: '5 days ago',
    clientSince: '2023',
    source: 'realtor',
    referredBy: 'Jane Doe Realty',
    referralsGiven: 0,
    portalEnabled: false,
    tier: 'premium',
    tags: [],
    pendingSelections: 0,
    pendingActions: 1,
    aiDecisionSpeed: 'moderate',
    aiBudgetSensitivity: 'moderate',
    aiInsight: 'Awaiting contract decision -- 5 days. Similar clients decide within 7 days avg. Follow up recommended.',
  },
  {
    id: '6',
    name: 'Emily Anderson',
    email: 'eanderson@gmail.com',
    phone: '(843) 555-0987',
    totalProjects: 1,
    activeProjects: 1,
    totalContractValue: 680000,
    currentProjectStatus: 'on-hold',
    communicationPreference: 'phone',
    lastContact: '2 weeks ago',
    clientSince: '2024',
    source: 'social_media',
    referralsGiven: 0,
    portalEnabled: true,
    portalLastLogin: '10 days ago',
    tier: 'standard',
    tags: [],
    pendingSelections: 0,
    pendingActions: 0,
    aiDecisionSpeed: 'deliberate',
    aiBudgetSensitivity: 'high',
    aiInsight: 'Project on hold -- financing pending. No portal login in 10 days. Proactive outreach recommended.',
  },
  {
    id: '7',
    name: 'Patricia & Mark Thompson',
    email: 'pthompson@email.com',
    phone: '(843) 555-1234',
    totalProjects: 1,
    activeProjects: 0,
    totalContractValue: 890000,
    currentProjectStatus: 'warranty',
    currentProjectName: 'Thompson Renovation',
    communicationPreference: 'email',
    lastContact: '1 month ago',
    clientSince: '2023',
    source: 'referral',
    referredBy: 'John & Sarah Smith',
    referralsGiven: 1,
    portalEnabled: true,
    portalLastLogin: '3 weeks ago',
    tier: 'premium',
    tags: ['Warranty'],
    pendingSelections: 0,
    pendingActions: 0,
    satisfactionScore: 85,
    aiDecisionSpeed: 'moderate',
    aiBudgetSensitivity: 'moderate',
    aiInsight: 'Warranty period active. HVAC service call predicted within 6 months based on system age.',
  },
]

const statusConfig: Record<ClientStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: 'Completed', color: 'bg-stone-100 text-stone-700', icon: CheckCircle },
  'on-hold': { label: 'On Hold', color: 'bg-warm-100 text-warm-700', icon: AlertCircle },
  warranty: { label: 'Warranty', color: 'bg-warm-100 text-warm-700', icon: Shield },
}

const communicationConfig: Record<CommunicationPref, { label: string; icon: typeof Mail }> = {
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
  text: { label: 'Text', icon: MessageSquare },
  'in-person': { label: 'In-Person', icon: Users },
}

const tierConfig: Record<ClientTier, { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-warm-100 text-warm-600' },
  premium: { label: 'Premium', color: 'bg-stone-100 text-stone-600' },
  luxury: { label: 'Luxury', color: 'bg-amber-100 text-amber-700' },
}

const sourceLabels: Record<ClientSource, string> = {
  referral: 'Referral',
  website: 'Website',
  realtor: 'Realtor',
  repeat: 'Repeat Client',
  social_media: 'Social Media',
  other: 'Other',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function ClientCard({ client }: { client: Client }) {
  const status = statusConfig[client.currentProjectStatus]
  const commPref = communicationConfig[client.communicationPreference]
  const tier = tierConfig[client.tier]
  const StatusIcon = status.icon
  const CommIcon = commPref.icon

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-stone-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-warm-900">{client.name}</h4>
              {client.tags.includes('VIP') && (
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              )}
            </div>
            {client.company ? <div className="flex items-center gap-1 text-sm text-warm-500">
                <Building2 className="h-3 w-3" />
                <span>{client.company}</span>
              </div> : null}
            {client.currentProjectName ? <div className="text-xs text-warm-400 mt-0.5">Current: {client.currentProjectName}</div> : null}
          </div>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Mail className="h-3.5 w-3.5 text-warm-400" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Phone className="h-3.5 w-3.5 text-warm-400" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-400">
          <Clock className="h-3 w-3" />
          <span>Last contact: {client.lastContact} | Since {client.clientSince}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-warm-50 rounded-lg p-2">
          <div className="text-xs text-warm-500 flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            Projects
          </div>
          <div className="font-semibold text-warm-900">
            {client.totalProjects}
            {client.activeProjects > 0 && (
              <span className="text-xs font-normal text-green-600 ml-1">
                ({client.activeProjects} active)
              </span>
            )}
          </div>
        </div>
        <div className="bg-warm-50 rounded-lg p-2">
          <div className="text-xs text-warm-500 flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Lifetime Value
          </div>
          <div className="font-semibold text-warm-900">{formatCurrency(client.totalContractValue)}</div>
        </div>
      </div>

      {/* Cross-module connection badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn("text-xs px-1.5 py-0.5 rounded", tier.color)}>
          {tier.label}
        </span>
        {client.portalEnabled ? <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Globe className="h-3 w-3" />Portal
          </span> : null}
        {!client.portalEnabled && (
          <span className="text-xs bg-warm-50 text-warm-400 px-1.5 py-0.5 rounded">No Portal</span>
        )}
        {client.referralsGiven > 0 && (
          <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" />
            {client.referralsGiven} referral{client.referralsGiven > 1 ? 's' : ''}
          </span>
        )}
        {client.pendingSelections > 0 && (
          <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
            {client.pendingSelections} selections due
          </span>
        )}
        {client.source !== 'other' && (
          <span className="text-xs bg-warm-50 text-warm-500 px-1.5 py-0.5 rounded">
            via {sourceLabels[client.source]}
          </span>
        )}
      </div>

      {/* AI Profile row */}
      {(client.aiDecisionSpeed || client.aiBudgetSensitivity || client.aiStylePreferences) ? <div className="flex items-center gap-1.5 flex-wrap mb-3 pt-2 border-t border-warm-100">
          <Sparkles className="h-3 w-3 text-stone-500" />
          {client.aiDecisionSpeed ? <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">
              {client.aiDecisionSpeed} decisions
            </span> : null}
          {client.aiBudgetSensitivity ? <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">
              {client.aiBudgetSensitivity} budget sensitivity
            </span> : null}
          {client.aiStylePreferences?.slice(0, 2).map(pref => (
            <span key={pref} className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">
              {pref}
            </span>
          ))}
          {(client.aiStylePreferences?.length ?? 0) > 2 && (
            <span className="text-xs text-warm-400">+{(client.aiStylePreferences?.length ?? 0) - 2} more</span>
          )}
        </div> : null}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
        <div className="flex items-center gap-1 text-xs text-warm-500">
          <CommIcon className="h-3 w-3" />
          <span>Prefers {commPref.label}</span>
        </div>
        {client.satisfactionScore !== undefined && (
          <div className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            client.satisfactionScore >= 90 ? "bg-green-50 text-green-700" :
            client.satisfactionScore >= 75 ? "bg-stone-50 text-stone-700" :
            "bg-amber-50 text-amber-700"
          )}>
            Satisfaction: {client.satisfactionScore}%
          </div>
        )}
      </div>

      {client.aiInsight ? <div className="mt-3 p-2 bg-stone-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-stone-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-stone-700">{client.aiInsight}</span>
        </div> : null}
    </div>
  )
}

export function ClientsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const filteredClients = sortItems(
    mockClients.filter(client => {
      if (!matchesSearch(client, search, ['name', 'email', 'company', 'currentProjectName'])) return false
      if (activeTab !== 'all' && client.currentProjectStatus !== activeTab) return false
      if (tierFilter !== 'all' && client.tier !== tierFilter) return false
      if (sourceFilter !== 'all' && client.source !== sourceFilter) return false
      return true
    }),
    activeSort as keyof Client | '',
    sortDirection,
  )

  const totalClients = mockClients.length
  const activeProjects = mockClients.reduce((sum, c) => sum + c.activeProjects, 0)
  const lifetimeValue = mockClients.reduce((sum, c) => sum + c.totalContractValue, 0)
  const totalReferrals = mockClients.reduce((sum, c) => sum + c.referralsGiven, 0)
  const portalActive = mockClients.filter(c => c.portalEnabled).length
  const pendingActions = mockClients.reduce((sum, c) => sum + c.pendingActions, 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Clients</h3>
          <span className="text-sm text-warm-500">{totalClients} clients | {activeProjects} active projects</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search clients, projects, companies..."
          tabs={[
            { key: 'all', label: 'All', count: mockClients.length },
            ...Object.entries(statusConfig)
              .filter(([key]) => mockClients.some(c => c.currentProjectStatus === key))
              .map(([key, config]) => ({
                key,
                label: config.label,
                count: mockClients.filter(c => c.currentProjectStatus === key).length,
              })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Tiers',
              value: tierFilter,
              options: Object.entries(tierConfig).map(([key, val]) => ({ value: key, label: val.label })),
              onChange: setTierFilter,
            },
            {
              label: 'All Sources',
              value: sourceFilter,
              options: Object.entries(sourceLabels).map(([key, label]) => ({ value: key, label })),
              onChange: setSourceFilter,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'totalContractValue', label: 'Lifetime Value' },
            { value: 'totalProjects', label: 'Projects' },
            { value: 'clientSince', label: 'Client Since' },
            { value: 'lastContact', label: 'Last Contact' },
            { value: 'referralsGiven', label: 'Referrals' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Upload, label: 'Import', onClick: () => {} },
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'Add Client', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredClients.length}
          totalCount={mockClients.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-warm-500 text-xs font-medium">
              <Users className="h-3.5 w-3.5" />
              Clients
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalClients}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-warm-500 text-xs font-medium">
              <FolderOpen className="h-3.5 w-3.5" />
              Active Projects
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{activeProjects}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-warm-500 text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              Lifetime Value
            </div>
            <div className="text-xl font-bold text-stone-600 mt-1">{formatCurrency(lifetimeValue)}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-warm-500 text-xs font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Referrals Given
            </div>
            <div className="text-xl font-bold text-green-600 mt-1">{totalReferrals}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-warm-500 text-xs font-medium">
              <Globe className="h-3.5 w-3.5" />
              Portal Active
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{portalActive}</div>
          </div>
          <div className={cn("rounded-lg p-3", pendingActions > 0 ? "bg-red-50" : "bg-warm-50")}>
            <div className={cn("flex items-center gap-1 text-xs font-medium", pendingActions > 0 ? "text-red-600" : "text-warm-500")}>
              <AlertCircle className="h-3.5 w-3.5" />
              Pending Actions
            </div>
            <div className={cn("text-xl font-bold mt-1", pendingActions > 0 ? "text-red-700" : "text-warm-900")}>{pendingActions}</div>
          </div>
        </div>
      </div>

      {/* Client Cards */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-warm-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-warm-300" />
            <p>No clients found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Client Intelligence"
          columns={2}
          features={[
            {
              feature: 'Referral Potential',
              trigger: 'Real-time',
              insight: 'Identifies clients likely to refer based on satisfaction scores, engagement patterns, and past referral history.',
              severity: 'success',
              confidence: 87,
            },
            {
              feature: 'Communication Analysis',
              trigger: 'On change',
              insight: 'Tracks response patterns and preferences to optimize outreach timing and channel selection.',
              severity: 'info',
              confidence: 92,
            },
            {
              feature: 'Satisfaction Scoring',
              trigger: 'Real-time',
              insight: 'Predicts client satisfaction based on interactions, portal usage, and project milestone completion.',
              severity: 'info',
              confidence: 85,
            },
            {
              feature: 'Repeat Business',
              trigger: 'Daily',
              insight: 'Identifies candidates for repeat projects by analyzing project history, property portfolio, and engagement signals.',
              severity: 'success',
              confidence: 78,
            },
            {
              feature: 'Testimonial Candidates',
              trigger: 'On change',
              insight: 'Suggests clients for testimonials and reviews based on satisfaction scores and project outcomes.',
              severity: 'info',
              confidence: 83,
            },
          ]}
        />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Client Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Thomas Wilson accounts for 57% of lifetime value ($12.5M) -- top referral source with 5 referrals.
              Michael Davis awaiting decision for 5 days -- similar clients decide within 7 days avg. Follow up today.
            </p>
            <p>
              Emily Anderson has not logged into portal in 10 days during on-hold status -- proactive outreach recommended.
              Patricia Thompson entering warranty period -- predict HVAC service call within 6 months.
              2 clients due for quarterly check-in based on communication patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
