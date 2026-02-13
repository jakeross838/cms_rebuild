'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Client {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  totalProjects: number
  activeProjects: number
  totalContractValue: number
  currentProjectStatus: 'active' | 'pending' | 'completed' | 'on-hold'
  communicationPreference: 'email' | 'phone' | 'text' | 'in-person'
  lastContact: string
  clientSince: string
  aiInsight?: string
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John & Sarah Smith',
    email: 'jsmith@email.com',
    phone: '(843) 555-0123',
    totalProjects: 3,
    activeProjects: 1,
    totalContractValue: 2450000,
    currentProjectStatus: 'active',
    communicationPreference: 'email',
    lastContact: '2 days ago',
    clientSince: '2022',
    aiInsight: 'High engagement - responds within 24hrs avg',
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
    communicationPreference: 'phone',
    lastContact: '1 week ago',
    clientSince: '2019',
    aiInsight: 'Repeat client - 67% referral source',
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
    communicationPreference: 'text',
    lastContact: '3 weeks ago',
    clientSince: '2024',
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
    communicationPreference: 'in-person',
    lastContact: '3 days ago',
    clientSince: '2018',
    aiInsight: 'Top client - schedule quarterly review',
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
    communicationPreference: 'email',
    lastContact: '5 days ago',
    clientSince: '2023',
    aiInsight: 'Awaiting decision - follow up recommended',
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
    aiInsight: 'Project on hold - financing pending',
  },
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  'on-hold': { label: 'On Hold', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

const communicationConfig = {
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
  text: { label: 'Text', icon: MessageSquare },
  'in-person': { label: 'In-Person', icon: Users },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function ClientCard({ client }: { client: Client }) {
  const status = statusConfig[client.currentProjectStatus]
  const commPref = communicationConfig[client.communicationPreference]
  const StatusIcon = status.icon
  const CommIcon = commPref.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{client.name}</h4>
            {client.company && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Building2 className="h-3 w-3" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-3.5 w-3.5 text-gray-400" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          <span>{client.phone}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            Projects
          </div>
          <div className="font-semibold text-gray-900">
            {client.totalProjects}
            {client.activeProjects > 0 && (
              <span className="text-xs font-normal text-green-600 ml-1">
                ({client.activeProjects} active)
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Total Value
          </div>
          <div className="font-semibold text-gray-900">{formatCurrency(client.totalContractValue)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", status.color)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CommIcon className="h-3 w-3" />
          <span>{commPref.label}</span>
        </div>
      </div>

      {client.aiInsight && (
        <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-blue-700">{client.aiInsight}</span>
        </div>
      )}
    </div>
  )
}

export function ClientsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredClients = sortItems(
    mockClients.filter(client => {
      if (!matchesSearch(client, search, ['name', 'email', 'company'])) return false
      if (activeTab !== 'all' && client.currentProjectStatus !== activeTab) return false
      return true
    }),
    activeSort as keyof Client | '',
    sortDirection,
  )

  const totalClients = mockClients.length
  const activeProjects = mockClients.reduce((sum, c) => sum + c.activeProjects, 0)
  const lifetimeValue = mockClients.reduce((sum, c) => sum + c.totalContractValue, 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Clients</h3>
          <span className="text-sm text-gray-500">{totalClients} clients | {activeProjects} active projects</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search clients..."
          tabs={[
            { key: 'all', label: 'All', count: mockClients.length },
            { key: 'active', label: 'Active', count: mockClients.filter(c => c.currentProjectStatus === 'active').length },
            { key: 'pending', label: 'Pending', count: mockClients.filter(c => c.currentProjectStatus === 'pending').length },
            { key: 'completed', label: 'Completed', count: mockClients.filter(c => c.currentProjectStatus === 'completed').length },
            { key: 'on-hold', label: 'On Hold', count: mockClients.filter(c => c.currentProjectStatus === 'on-hold').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'totalContractValue', label: 'Contract Value' },
            { value: 'totalProjects', label: 'Projects' },
            { value: 'clientSince', label: 'Client Since' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'Add Client', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredClients.length}
          totalCount={mockClients.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Users className="h-4 w-4" />
              Total Clients
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalClients}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FolderOpen className="h-4 w-4" />
              Active Projects
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{activeProjects}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              Lifetime Value
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(lifetimeValue)}</div>
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
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No clients found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <p className="text-sm text-amber-700">
            Thomas Wilson accounts for 57% of lifetime value. Michael Davis awaiting decision for 5 days - similar clients decide within 7 days avg.
            2 clients due for quarterly check-in based on communication patterns.
          </p>
        </div>
      </div>
    </div>
  )
}
