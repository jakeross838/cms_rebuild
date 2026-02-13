'use client'

import { useState } from 'react'
import {
  Users,
  Mail,
  Phone,
  Briefcase,
  Plus,
  MoreHorizontal,
  Sparkles,
  UserCheck,
  UserX,
  HardHat,
  Wrench,
  Calculator,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface TeamMember {
  id: string
  name: string
  role: 'Project Manager' | 'Superintendent' | 'Estimator' | 'Foreman' | 'Admin'
  email: string
  phone: string
  activeJobs: number
  status: 'active' | 'on-leave'
  avatar?: string
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Jake Thompson',
    role: 'Project Manager',
    email: 'jake@coastalbuilders.com',
    phone: '(910) 555-0101',
    activeJobs: 4,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    role: 'Project Manager',
    email: 'sarah@coastalbuilders.com',
    phone: '(910) 555-0102',
    activeJobs: 3,
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'Superintendent',
    email: 'mike@coastalbuilders.com',
    phone: '(910) 555-0103',
    activeJobs: 2,
    status: 'active',
  },
  {
    id: '4',
    name: 'David Chen',
    role: 'Superintendent',
    email: 'david@coastalbuilders.com',
    phone: '(910) 555-0104',
    activeJobs: 2,
    status: 'on-leave',
  },
  {
    id: '5',
    name: 'Emily Parker',
    role: 'Estimator',
    email: 'emily@coastalbuilders.com',
    phone: '(910) 555-0105',
    activeJobs: 5,
    status: 'active',
  },
  {
    id: '6',
    name: 'Carlos Mendez',
    role: 'Foreman',
    email: 'carlos@coastalbuilders.com',
    phone: '(910) 555-0106',
    activeJobs: 1,
    status: 'active',
  },
  {
    id: '7',
    name: 'Lisa Johnson',
    role: 'Admin',
    email: 'lisa@coastalbuilders.com',
    phone: '(910) 555-0107',
    activeJobs: 0,
    status: 'active',
  },
  {
    id: '8',
    name: 'Tom Williams',
    role: 'Foreman',
    email: 'tom@coastalbuilders.com',
    phone: '(910) 555-0108',
    activeJobs: 2,
    status: 'active',
  },
]

const roles = [
  { id: 'Project Manager', label: 'Project Manager', icon: ClipboardList, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'Superintendent', label: 'Superintendent', icon: HardHat, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'Estimator', label: 'Estimator', icon: Calculator, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'Foreman', label: 'Foreman', icon: Wrench, color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
  { id: 'Admin', label: 'Admin', icon: Users, color: 'bg-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-700' },
]

const statuses = [
  { id: 'active', label: 'Active', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'on-leave', label: 'On Leave', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
]

function getRoleConfig(role: TeamMember['role']) {
  return roles.find(r => r.id === role) || roles[0]
}

function getStatusConfig(status: TeamMember['status']) {
  return statuses.find(s => s.id === status) || statuses[0]
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const roleConfig = getRoleConfig(member.role)
  const statusConfig = getStatusConfig(member.status)
  const RoleIcon = roleConfig.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {/* Avatar Placeholder */}
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
            member.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
          )}>
            {getInitials(member.name)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{member.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleIcon className={cn("h-3.5 w-3.5", roleConfig.textColor)} />
              <span className={cn("text-sm", roleConfig.textColor)}>{member.role}</span>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="truncate">{member.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{member.phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{member.activeJobs}</span> active jobs
          </span>
        </div>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1",
          statusConfig.bgLight,
          statusConfig.textColor
        )}>
          {member.status === 'active' ? (
            <UserCheck className="h-3 w-3" />
          ) : (
            <UserX className="h-3 w-3" />
          )}
          {statusConfig.label}
        </span>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  iconColor,
  iconBg,
}: {
  icon: typeof Users
  label: string
  value: string
  subValue?: string
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

export function TeamPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [filterRole, setFilterRole] = useState<string | 'all'>('all')

  const filteredMembers = sortItems(
    mockTeamMembers.filter(member => {
      if (!matchesSearch(member, search, ['name', 'email', 'role'])) return false
      if (activeTab !== 'all' && member.status !== activeTab) return false
      if (filterRole !== 'all' && member.role !== filterRole) return false
      return true
    }),
    activeSort as keyof TeamMember | '',
    sortDirection,
  )

  // Calculate stats
  const totalTeam = mockTeamMembers.length
  const activeMembers = mockTeamMembers.filter(m => m.status === 'active').length
  const onLeaveMembers = mockTeamMembers.filter(m => m.status === 'on-leave').length
  const pmCount = mockTeamMembers.filter(m => m.role === 'Project Manager').length
  const superintendentCount = mockTeamMembers.filter(m => m.role === 'Superintendent').length
  const estimatorCount = mockTeamMembers.filter(m => m.role === 'Estimator').length
  const foremanCount = mockTeamMembers.filter(m => m.role === 'Foreman').length
  const adminCount = mockTeamMembers.filter(m => m.role === 'Admin').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Team Directory</h3>
          <span className="text-sm text-gray-500">{totalTeam} team members</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search team..."
          tabs={[
            { key: 'all', label: 'All', count: mockTeamMembers.length },
            { key: 'active', label: 'Active', count: mockTeamMembers.filter(m => m.status === 'active').length },
            { key: 'on-leave', label: 'On Leave', count: mockTeamMembers.filter(m => m.status === 'on-leave').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Roles',
              value: filterRole,
              options: roles.map(r => ({ value: r.id, label: r.label })),
              onChange: (v) => setFilterRole(v),
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'role', label: 'Role' },
            { value: 'activeJobs', label: 'Active Jobs' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'Add Member', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredMembers.length}
          totalCount={mockTeamMembers.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4">
          <StatCard
            icon={Users}
            label="Total Team"
            value={totalTeam.toString()}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={UserCheck}
            label="Active"
            value={activeMembers.toString()}
            subValue="available"
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={ClipboardList}
            label="Project Managers"
            value={pmCount.toString()}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={HardHat}
            label="Superintendents"
            value={superintendentCount.toString()}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            icon={Calculator}
            label="Estimators"
            value={estimatorCount.toString()}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={Wrench}
            label="Foremen"
            value={foremanCount.toString()}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
      </div>


      {/* Team Grid */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No team members found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span>Jake Thompson has highest workload (4 jobs) - consider redistributing upcoming projects</span>
            <span>|</span>
            <span>David Chen returns from leave next week - 2 jobs pending reassignment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
