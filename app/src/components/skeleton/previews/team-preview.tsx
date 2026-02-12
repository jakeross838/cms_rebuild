'use client'

import { useState } from 'react'
import {
  Users,
  Mail,
  Phone,
  Briefcase,
  Search,
  Filter,
  Grid3X3,
  List,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterRole, setFilterRole] = useState<string | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all')

  const filteredMembers = mockTeamMembers.filter(member => {
    const roleMatch = filterRole === 'all' || member.role === filterRole
    const statusMatch = filterStatus === 'all' || member.status === filterStatus
    return roleMatch && statusMatch
  })

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Team Directory</h3>
            <span className="text-sm text-gray-500">{totalTeam} team members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5",
                  viewMode === 'grid' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5",
                  viewMode === 'list' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        </div>
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

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-6">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Role:</span>
            <button
              onClick={() => setFilterRole('all')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                filterRole === 'all'
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All Roles
            </button>
            {roles.map(role => {
              const count = mockTeamMembers.filter(m => m.role === role.id).length
              const RoleIcon = role.icon
              return (
                <button
                  key={role.id}
                  onClick={() => setFilterRole(role.id)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5",
                    filterRole === role.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                  {role.label}
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                filterStatus === 'all'
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All
            </button>
            {statuses.map(status => {
              const count = mockTeamMembers.filter(m => m.status === status.id).length
              return (
                <button
                  key={status.id}
                  onClick={() => setFilterStatus(status.id)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2",
                    filterStatus === status.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full", status.color)} />
                  {status.label}
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {filteredMembers.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
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
