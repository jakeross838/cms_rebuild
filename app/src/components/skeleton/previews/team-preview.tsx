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
  Shield,
  Eye,
  AlertTriangle,
  Award,
  Clock,
  Calendar,
  Building2,
  UserCog,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// Types (aligned to Module 01 auth spec + Module 03 core data model)
// ---------------------------------------------------------------------------

interface TeamMember {
  id: string
  name: string
  role: 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
  roleLabel: string
  customRole?: string
  email: string
  phone: string
  activeJobs: number
  status: 'active' | 'invited' | 'deactivated' | 'expired' | 'on-leave'
  lastActive: string
  hireDate: string
  department?: string
  reportsTo?: string
  certifications: Array<{ name: string; expiresAt: string; status: 'valid' | 'expiring' | 'expired' }>
  permissionsMode: string
  jobStatusAccess: string[]
  projectOverrides: number
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Jake Ross',
    role: 'owner',
    roleLabel: 'Owner',
    email: 'jake@rossbuilt.com',
    phone: '(727) 555-0101',
    activeJobs: 5,
    status: 'active',
    lastActive: 'Now',
    hireDate: '2020-01-15',
    department: 'Leadership',
    certifications: [
      { name: 'CGC License', expiresAt: '2027-06-01', status: 'valid' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['pre_construction', 'active', 'warranty', 'closed'],
    projectOverrides: 0,
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    role: 'pm',
    roleLabel: 'Project Manager',
    email: 'sarah@rossbuilt.com',
    phone: '(727) 555-0102',
    activeJobs: 3,
    status: 'active',
    lastActive: '10 min ago',
    hireDate: '2022-03-01',
    department: 'Project Management',
    reportsTo: 'Jake Ross',
    certifications: [
      { name: 'OSHA 30', expiresAt: '2026-12-15', status: 'valid' },
      { name: 'PMP', expiresAt: '2027-08-01', status: 'valid' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['pre_construction', 'active', 'warranty'],
    projectOverrides: 0,
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'superintendent',
    roleLabel: 'Superintendent',
    email: 'mike@rossbuilt.com',
    phone: '(727) 555-0103',
    activeJobs: 2,
    status: 'active',
    lastActive: '30 min ago',
    hireDate: '2021-06-15',
    department: 'Field Operations',
    reportsTo: 'Sarah Mitchell',
    certifications: [
      { name: 'OSHA 30', expiresAt: '2026-03-15', status: 'expiring' },
      { name: 'First Aid/CPR', expiresAt: '2026-07-01', status: 'valid' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['active', 'warranty'],
    projectOverrides: 0,
  },
  {
    id: '4',
    name: 'David Chen',
    role: 'superintendent',
    roleLabel: 'Superintendent',
    email: 'david@rossbuilt.com',
    phone: '(727) 555-0104',
    activeJobs: 2,
    status: 'on-leave',
    lastActive: '1 week ago',
    hireDate: '2023-01-10',
    department: 'Field Operations',
    reportsTo: 'Sarah Mitchell',
    certifications: [
      { name: 'OSHA 30', expiresAt: '2026-09-01', status: 'valid' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['active', 'warranty'],
    projectOverrides: 0,
  },
  {
    id: '5',
    name: 'Emily Parker',
    role: 'pm',
    roleLabel: 'Project Manager',
    customRole: 'Estimator',
    email: 'emily@rossbuilt.com',
    phone: '(727) 555-0105',
    activeJobs: 4,
    status: 'active',
    lastActive: '2 hours ago',
    hireDate: '2022-08-01',
    department: 'Estimating',
    reportsTo: 'Jake Ross',
    certifications: [
      { name: 'OSHA 10', expiresAt: '2025-11-01', status: 'expired' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['pre_construction', 'active', 'warranty'],
    projectOverrides: 1,
  },
  {
    id: '6',
    name: 'Carlos Mendez',
    role: 'field',
    roleLabel: 'Field',
    customRole: 'Foreman',
    email: 'carlos@rossbuilt.com',
    phone: '(727) 555-0106',
    activeJobs: 1,
    status: 'active',
    lastActive: '1 hour ago',
    hireDate: '2023-04-15',
    department: 'Field Operations',
    reportsTo: 'Mike Rodriguez',
    certifications: [
      { name: 'OSHA 10', expiresAt: '2027-01-15', status: 'valid' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['active'],
    projectOverrides: 0,
  },
  {
    id: '7',
    name: 'Lisa Johnson',
    role: 'office',
    roleLabel: 'Office',
    email: 'lisa@rossbuilt.com',
    phone: '(727) 555-0107',
    activeJobs: 0,
    status: 'active',
    lastActive: '45 min ago',
    hireDate: '2023-09-01',
    department: 'Administration',
    reportsTo: 'Jake Ross',
    certifications: [],
    permissionsMode: 'open',
    jobStatusAccess: ['pre_construction', 'active', 'warranty', 'closed'],
    projectOverrides: 0,
  },
  {
    id: '8',
    name: 'Tom Williams',
    role: 'field',
    roleLabel: 'Field',
    customRole: 'Foreman',
    email: 'tom@rossbuilt.com',
    phone: '(727) 555-0108',
    activeJobs: 2,
    status: 'active',
    lastActive: '3 hours ago',
    hireDate: '2024-01-10',
    department: 'Field Operations',
    reportsTo: 'Mike Rodriguez',
    certifications: [
      { name: 'OSHA 10', expiresAt: '2026-11-01', status: 'valid' },
    ],
    permissionsMode: 'open',
    jobStatusAccess: ['active'],
    projectOverrides: 0,
  },
  {
    id: '9',
    name: 'New PM Hire',
    role: 'pm',
    roleLabel: 'Project Manager',
    email: 'newhire@rossbuilt.com',
    phone: '',
    activeJobs: 0,
    status: 'invited',
    lastActive: '-',
    hireDate: '2026-02-01',
    department: 'Project Management',
    certifications: [],
    permissionsMode: 'open',
    jobStatusAccess: [],
    projectOverrides: 0,
  },
  {
    id: '10',
    name: 'Former Employee',
    role: 'field',
    roleLabel: 'Field',
    email: 'former@rossbuilt.com',
    phone: '(727) 555-0199',
    activeJobs: 0,
    status: 'deactivated',
    lastActive: '3 months ago',
    hireDate: '2023-06-01',
    department: 'Field Operations',
    certifications: [],
    permissionsMode: 'open',
    jobStatusAccess: [],
    projectOverrides: 0,
  },
]

// ---------------------------------------------------------------------------
// Role & Status Configurations (7 canonical roles from Module 01)
// ---------------------------------------------------------------------------

const roles = [
  { id: 'owner', label: 'Owner', icon: Shield, color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'bg-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'pm', label: 'Project Manager', icon: ClipboardList, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'superintendent', label: 'Superintendent', icon: HardHat, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'office', label: 'Office', icon: Calculator, color: 'bg-teal-500', bgLight: 'bg-teal-50', textColor: 'text-teal-700' },
  { id: 'field', label: 'Field', icon: Wrench, color: 'bg-orange-500', bgLight: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'read_only', label: 'Read-Only', icon: Eye, color: 'bg-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-700' },
]

const statuses = [
  { id: 'active', label: 'Active', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'invited', label: 'Invited', color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'on-leave', label: 'On Leave', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'deactivated', label: 'Deactivated', color: 'bg-red-500', bgLight: 'bg-red-50', textColor: 'text-red-700' },
  { id: 'expired', label: 'Expired', color: 'bg-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-700' },
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

// ---------------------------------------------------------------------------
// TeamMemberCard
// ---------------------------------------------------------------------------

function TeamMemberCard({ member }: { member: TeamMember }) {
  const roleConfig = getRoleConfig(member.role)
  const statusConfig = getStatusConfig(member.status)
  const RoleIcon = roleConfig.icon
  const expiringCerts = member.certifications.filter(c => c.status === 'expiring' || c.status === 'expired')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
            member.status === 'active' || member.status === 'on-leave' ? roleConfig.color : 'bg-gray-400'
          )}>
            {getInitials(member.name)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{member.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleIcon className={cn("h-3.5 w-3.5", roleConfig.textColor)} />
              <span className={cn("text-sm", roleConfig.textColor)}>{member.roleLabel}</span>
              {member.customRole && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{member.customRole}</span>
              )}
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
        {member.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{member.phone}</span>
          </div>
        )}
        {member.reportsTo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCog className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Reports to: {member.reportsTo}</span>
          </div>
        )}
      </div>

      {/* Certifications */}
      {member.certifications.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {member.certifications.map((cert, i) => (
            <span key={i} className={cn(
              "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
              cert.status === 'valid' ? "bg-green-50 text-green-700" :
              cert.status === 'expiring' ? "bg-amber-50 text-amber-700" :
              "bg-red-50 text-red-700"
            )}>
              <Award className="h-3 w-3" />
              {cert.name}
              {cert.status === 'expiring' && <AlertTriangle className="h-3 w-3" />}
            </span>
          ))}
        </div>
      )}

      {/* Job status access badges */}
      {member.jobStatusAccess.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {member.jobStatusAccess.map(status => (
            <span key={status} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
              {status.replace('_', '-')}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{member.activeJobs}</span> jobs
            </span>
          </div>
          {member.projectOverrides > 0 && (
            <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
              {member.projectOverrides} override{member.projectOverrides > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1",
          statusConfig.bgLight,
          statusConfig.textColor
        )}>
          {member.status === 'active' ? (
            <UserCheck className="h-3 w-3" />
          ) : member.status === 'deactivated' ? (
            <UserX className="h-3 w-3" />
          ) : null}
          {statusConfig.label}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TeamPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [filterRole, setFilterRole] = useState<string | 'all'>('all')

  const filteredMembers = sortItems(
    mockTeamMembers.filter(member => {
      if (!matchesSearch(member, search, ['name', 'email', 'roleLabel', 'customRole', 'department'])) return false
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
  const invitedMembers = mockTeamMembers.filter(m => m.status === 'invited').length
  const deactivatedMembers = mockTeamMembers.filter(m => m.status === 'deactivated').length
  const onLeaveMembers = mockTeamMembers.filter(m => m.status === 'on-leave').length
  const expiringCerts = mockTeamMembers.flatMap(m => m.certifications).filter(c => c.status === 'expiring' || c.status === 'expired').length
  const totalActiveJobs = mockTeamMembers.reduce((sum, m) => sum + m.activeJobs, 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Team Directory</h3>
          <span className="text-sm text-gray-500">{totalTeam} team members</span>
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Module 1</span>
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Module 3</span>
          {expiringCerts > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {expiringCerts} cert{expiringCerts > 1 ? 's' : ''} expiring/expired
            </span>
          )}
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search team..."
          tabs={[
            { key: 'all', label: 'All', count: mockTeamMembers.length },
            { key: 'active', label: 'Active', count: activeMembers },
            { key: 'invited', label: 'Invited', count: invitedMembers },
            { key: 'on-leave', label: 'On Leave', count: onLeaveMembers },
            { key: 'deactivated', label: 'Deactivated', count: deactivatedMembers },
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
            { value: 'roleLabel', label: 'Role' },
            { value: 'activeJobs', label: 'Active Jobs' },
            { value: 'lastActive', label: 'Last Active' },
            { value: 'hireDate', label: 'Hire Date' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'Invite Member', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredMembers.length}
          totalCount={mockTeamMembers.length}
        />
      </div>

      {/* Permissions Mode Indicator */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-medium text-blue-800">Permissions Mode:</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Open</span>
          <span className="text-blue-600">All internal users see everything. Switch to Standard when ready for RBAC enforcement.</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-7 gap-3">
          <StatCard icon={Users} label="Total" value={totalTeam.toString()} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard icon={UserCheck} label="Active" value={activeMembers.toString()} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatCard icon={Shield} label="Owners" value={mockTeamMembers.filter(m => m.role === 'owner').length.toString()} iconColor="text-purple-600" iconBg="bg-purple-50" />
          <StatCard icon={ClipboardList} label="PMs" value={mockTeamMembers.filter(m => m.role === 'pm').length.toString()} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatCard icon={HardHat} label="Supers" value={mockTeamMembers.filter(m => m.role === 'superintendent').length.toString()} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <StatCard icon={Briefcase} label="Job Load" value={totalActiveJobs.toString()} subValue="total assignments" iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard icon={Award} label="Certs" value={expiringCerts.toString()} subValue="needs attention" iconColor="text-red-600" iconBg="bg-red-50" />
        </div>
      </div>

      {/* Team Grid */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <span>Emily Parker has highest workload (4 jobs) - consider redistributing upcoming projects</span>
            <span>|</span>
            <span>David Chen returns from leave next week - 2 jobs pending reassignment</span>
            <span>|</span>
            <span>Mike Rodriguez OSHA 30 expires in 33 days - schedule renewal training</span>
            <span>|</span>
            <span>Emily Parker OSHA 10 is expired - immediate action required</span>
          </div>
        </div>
      </div>
    </div>
  )
}
