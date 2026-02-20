'use client'

import { useState } from 'react'
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  Plus,
  MoreHorizontal,
  HardHat,
  Wrench,
  ClipboardList,
  Shield,
  AlertTriangle,
  Calendar,
  Building2,
  Star,
  Clock,
  PhoneCall,
  UserCheck,
  Truck,
  Briefcase,
  Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types (Job-Specific Team Roster)
// ---------------------------------------------------------------------------

type TeamMemberType = 'employee' | 'subcontractor' | 'consultant'
type AccessLevel = 'full' | 'limited' | 'view_only'

interface JobTeamMember {
  id: string
  name: string
  role: 'pm' | 'superintendent' | 'foreman' | 'field' | 'estimator' | 'coordinator'
  roleLabel: string
  team_member_type: TeamMemberType
  email: string
  phone: string
  start_date: string
  end_date?: string
  responsibilities: string[]
  is_primary: boolean
  access_level: AccessLevel
  status: 'active' | 'upcoming' | 'completed'
}

interface Subcontractor {
  id: string
  company_name: string
  contact_person: string
  contact_phone: string
  contact_email: string
  on_site_schedule: string
  package_scope: string
  emergency_contact: string
  emergency_phone: string
  status: 'active' | 'scheduled' | 'completed'
}

interface EmergencyContact {
  id: string
  name: string
  role: string
  phone: string
  priority: number
}

// ---------------------------------------------------------------------------
// Mock Data - Job-Specific Team
// ---------------------------------------------------------------------------

const mockJobTeamMembers: JobTeamMember[] = [
  {
    id: '1',
    name: 'Mike Smith',
    role: 'pm',
    roleLabel: 'Project Manager',
    team_member_type: 'employee',
    email: 'mike@rossbuilt.com',
    phone: '(727) 555-0101',
    start_date: '2026-01-15',
    end_date: undefined,
    responsibilities: ['Overall project coordination', 'Client communication', 'Budget management', 'Change order approval'],
    is_primary: true,
    access_level: 'full',
    status: 'active',
  },
  {
    id: '2',
    name: 'Tom Brown',
    role: 'superintendent',
    roleLabel: 'Superintendent',
    team_member_type: 'employee',
    email: 'tom@rossbuilt.com',
    phone: '(727) 555-0102',
    start_date: '2026-01-15',
    end_date: undefined,
    responsibilities: ['Daily site supervision', 'Subcontractor coordination', 'Safety compliance', 'Quality control'],
    is_primary: true,
    access_level: 'full',
    status: 'active',
  },
  {
    id: '3',
    name: 'Carlos Mendez',
    role: 'foreman',
    roleLabel: 'Foreman',
    team_member_type: 'employee',
    email: 'carlos@rossbuilt.com',
    phone: '(727) 555-0103',
    start_date: '2026-01-20',
    end_date: undefined,
    responsibilities: ['Crew supervision', 'Material coordination', 'Daily progress tracking'],
    is_primary: false,
    access_level: 'limited',
    status: 'active',
  },
  {
    id: '4',
    name: 'Sarah Mitchell',
    role: 'coordinator',
    roleLabel: 'Project Coordinator',
    team_member_type: 'employee',
    email: 'sarah@rossbuilt.com',
    phone: '(727) 555-0104',
    start_date: '2026-01-15',
    end_date: undefined,
    responsibilities: ['Scheduling', 'Permit coordination', 'Documentation'],
    is_primary: false,
    access_level: 'full',
    status: 'active',
  },
  {
    id: '5',
    name: 'James Wilson',
    role: 'estimator',
    roleLabel: 'Estimator',
    team_member_type: 'consultant',
    email: 'james@wilsonestimating.com',
    phone: '(727) 555-0105',
    start_date: '2025-12-01',
    end_date: '2026-01-30',
    responsibilities: ['Cost analysis', 'Change order pricing', 'Value engineering'],
    is_primary: false,
    access_level: 'limited',
    status: 'completed',
  },
  {
    id: '6',
    name: 'David Chen',
    role: 'field',
    roleLabel: 'Field Technician',
    team_member_type: 'employee',
    email: 'david@rossbuilt.com',
    phone: '(727) 555-0106',
    start_date: '2026-02-15',
    end_date: undefined,
    responsibilities: ['Finish carpentry', 'Punch list items'],
    is_primary: false,
    access_level: 'view_only',
    status: 'upcoming',
  },
]

const mockSubcontractors: Subcontractor[] = [
  {
    id: 'sub-1',
    company_name: 'XYZ Electric',
    contact_person: 'John Davis',
    contact_phone: '(727) 555-1234',
    contact_email: 'john@xyzelectric.com',
    on_site_schedule: 'Mon-Fri 7am-4pm',
    package_scope: 'Electrical rough-in, panel installation, fixture installation',
    emergency_contact: 'John Davis',
    emergency_phone: '(727) 555-1234',
    status: 'active',
  },
  {
    id: 'sub-2',
    company_name: 'ABC Plumbing',
    contact_person: 'Maria Garcia',
    contact_phone: '(727) 555-2345',
    contact_email: 'maria@abcplumbing.com',
    on_site_schedule: 'Tue-Thu 8am-5pm',
    package_scope: 'Plumbing rough-in, fixture installation, water heater',
    emergency_contact: 'Maria Garcia',
    emergency_phone: '(727) 555-2345',
    status: 'active',
  },
  {
    id: 'sub-3',
    company_name: 'Cool Air HVAC',
    contact_person: 'Robert Johnson',
    contact_phone: '(727) 555-3456',
    contact_email: 'robert@coolairhvac.com',
    on_site_schedule: 'Mon, Wed, Fri 7am-3pm',
    package_scope: 'HVAC installation, ductwork, commissioning',
    emergency_contact: 'Robert Johnson',
    emergency_phone: '(727) 555-3456',
    status: 'scheduled',
  },
  {
    id: 'sub-4',
    company_name: 'Premier Drywall',
    contact_person: 'Tony Martinez',
    contact_phone: '(727) 555-4567',
    contact_email: 'tony@premierdrywall.com',
    on_site_schedule: 'Mon-Sat 6am-3pm',
    package_scope: 'Drywall hanging, taping, finishing',
    emergency_contact: 'Tony Martinez',
    emergency_phone: '(727) 555-4567',
    status: 'scheduled',
  },
]

const mockEmergencyContacts: EmergencyContact[] = [
  { id: 'em-1', name: 'Mike Smith', role: 'Project Manager', phone: '(727) 555-0101', priority: 1 },
  { id: 'em-2', name: 'Tom Brown', role: 'Superintendent', phone: '(727) 555-0102', priority: 2 },
  { id: 'em-3', name: 'Jake Ross', role: 'Owner', phone: '(727) 555-0001', priority: 3 },
]

// ---------------------------------------------------------------------------
// Role & Type Configurations
// ---------------------------------------------------------------------------

const roles = [
  { id: 'pm', label: 'Project Manager', icon: ClipboardList, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'superintendent', label: 'Superintendent', icon: HardHat, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'foreman', label: 'Foreman', icon: Users, color: 'bg-sand-500', bgLight: 'bg-sand-50', textColor: 'text-sand-700' },
  { id: 'field', label: 'Field Technician', icon: Wrench, color: 'bg-stone-500', bgLight: 'bg-stone-50', textColor: 'text-stone-700' },
  { id: 'estimator', label: 'Estimator', icon: Briefcase, color: 'bg-warm-500', bgLight: 'bg-warm-50', textColor: 'text-warm-700' },
  { id: 'coordinator', label: 'Coordinator', icon: Calendar, color: 'bg-stone-500', bgLight: 'bg-stone-50', textColor: 'text-stone-700' },
]

const memberTypes = [
  { id: 'employee', label: 'Employee', color: 'bg-stone-500', bgLight: 'bg-stone-50', textColor: 'text-stone-700' },
  { id: 'subcontractor', label: 'Subcontractor', color: 'bg-sand-500', bgLight: 'bg-sand-50', textColor: 'text-sand-700' },
  { id: 'consultant', label: 'Consultant', color: 'bg-warm-500', bgLight: 'bg-warm-50', textColor: 'text-warm-700' },
]

const accessLevels = [
  { id: 'full', label: 'Full Access', icon: Key, color: 'text-green-600' },
  { id: 'limited', label: 'Limited', icon: Shield, color: 'text-amber-600' },
  { id: 'view_only', label: 'View Only', icon: Shield, color: 'text-warm-500' },
]

function getRoleConfig(role: JobTeamMember['role']) {
  return roles.find(r => r.id === role) || roles[0]
}

function getMemberTypeConfig(type: TeamMemberType) {
  return memberTypes.find(t => t.id === type) || memberTypes[0]
}

function getAccessLevelConfig(level: AccessLevel) {
  return accessLevels.find(a => a.id === level) || accessLevels[0]
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Quick Action Buttons
// ---------------------------------------------------------------------------

function QuickActions({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
        title="Call"
        onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${phone}` }}
      >
        <PhoneCall className="h-3.5 w-3.5" />
      </button>
      <button
        className="p-1.5 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors"
        title="Text"
        onClick={(e) => { e.stopPropagation(); window.location.href = `sms:${phone}` }}
      >
        <MessageSquare className="h-3.5 w-3.5" />
      </button>
      <button
        className="p-1.5 rounded-full bg-warm-50 hover:bg-warm-100 text-stone-600 transition-colors"
        title="Email"
        onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${email}` }}
      >
        <Mail className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// JobTeamMemberCard
// ---------------------------------------------------------------------------

function JobTeamMemberCard({ member }: { member: JobTeamMember }) {
  const roleConfig = getRoleConfig(member.role)
  const typeConfig = getMemberTypeConfig(member.team_member_type)
  const accessConfig = getAccessLevelConfig(member.access_level)
  const RoleIcon = roleConfig.icon
  const AccessIcon = accessConfig.icon

  const statusStyles = {
    active: 'bg-green-50 text-green-700',
    upcoming: 'bg-stone-50 text-stone-700',
    completed: 'bg-warm-100 text-warm-500',
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-warm-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      member.status === 'completed' && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
              member.status === 'completed' ? 'bg-warm-400' : roleConfig.color
            )}>
              {getInitials(member.name)}
            </div>
            {member.is_primary && (
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
                <Star className="h-3 w-3 text-amber-800" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-warm-900">{member.name}</h4>
              {member.is_primary && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                  PRIMARY
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleIcon className={cn("h-3.5 w-3.5", roleConfig.textColor)} />
              <span className={cn("text-sm", roleConfig.textColor)}>{member.roleLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QuickActions phone={member.phone} email={member.email} />
          <button className="p-1 hover:bg-warm-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-warm-400" />
          </button>
        </div>
      </div>

      {/* Member Type & Access Level */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeConfig.bgLight, typeConfig.textColor)}>
          {typeConfig.label}
        </span>
        <span className={cn("text-xs flex items-center gap-1", accessConfig.color)}>
          <AccessIcon className="h-3 w-3" />
          {accessConfig.label}
        </span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full ml-auto", statusStyles[member.status])}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Mail className="h-3.5 w-3.5 text-warm-400" />
          <span className="truncate text-xs">{member.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Phone className="h-3.5 w-3.5 text-warm-400" />
          <span className="text-xs">{member.phone}</span>
        </div>
      </div>

      {/* Assignment Dates */}
      <div className="flex items-center gap-3 text-xs text-warm-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Start: {formatDate(member.start_date)}</span>
        </div>
        {member.end_date && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>End: {formatDate(member.end_date)}</span>
          </div>
        )}
      </div>

      {/* Responsibilities */}
      <div className="pt-3 border-t border-warm-100">
        <p className="text-xs font-medium text-warm-700 mb-1">Responsibilities:</p>
        <div className="flex flex-wrap gap-1">
          {member.responsibilities.slice(0, 3).map((resp, i) => (
            <span key={i} className="text-[10px] bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">
              {resp}
            </span>
          ))}
          {member.responsibilities.length > 3 && (
            <span className="text-[10px] text-warm-400">+{member.responsibilities.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SubcontractorCard
// ---------------------------------------------------------------------------

function SubcontractorCard({ sub }: { sub: Subcontractor }) {
  const statusStyles = {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: 'On Site' },
    scheduled: { bg: 'bg-stone-50', text: 'text-stone-700', label: 'Scheduled' },
    completed: { bg: 'bg-warm-100', text: 'text-warm-500', label: 'Completed' },
  }
  const status = statusStyles[sub.status]

  return (
    <div className={cn(
      "bg-white rounded-lg border border-warm-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      sub.status === 'completed' && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-sand-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-sand-600" />
          </div>
          <div>
            <h4 className="font-medium text-warm-900">{sub.company_name}</h4>
            <p className="text-sm text-warm-600">{sub.contact_person}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QuickActions phone={sub.contact_phone} email={sub.contact_email} />
          <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bg, status.text)}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Phone className="h-3.5 w-3.5 text-warm-400" />
          <span className="text-xs">{sub.contact_phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Clock className="h-3.5 w-3.5 text-warm-400" />
          <span className="text-xs">{sub.on_site_schedule}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-warm-100">
        <p className="text-xs font-medium text-warm-700 mb-1">Package Scope:</p>
        <p className="text-xs text-warm-600">{sub.package_scope}</p>
      </div>

      <div className="mt-3 pt-3 border-t border-warm-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-warm-700 font-medium">Emergency:</span>
          <span className="text-xs text-warm-600">{sub.emergency_contact} - {sub.emergency_phone}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Emergency Contacts Footer
// ---------------------------------------------------------------------------

function EmergencyContactsFooter({ contacts }: { contacts: EmergencyContact[] }) {
  return (
    <div className="bg-red-50 border-t border-red-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="font-medium text-sm text-red-800">Emergency Contacts:</span>
        </div>
        <div className="flex items-center gap-4">
          {contacts.sort((a, b) => a.priority - b.priority).map((contact, i) => (
            <div key={contact.id} className="flex items-center gap-2">
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                {contact.priority}
              </span>
              <span className="text-sm text-red-700 font-medium">{contact.name}</span>
              <span className="text-xs text-red-600">({contact.role})</span>
              <a href={`tel:${contact.phone}`} className="text-sm text-red-700 underline hover:text-red-800">
                {contact.phone}
              </a>
              {i < contacts.length - 1 && <span className="text-red-300">|</span>}
            </div>
          ))}
        </div>
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
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-sm text-warm-500">{label}</p>
          <p className="text-xl font-semibold text-warm-900">{value}</p>
          {subValue && <p className="text-xs text-warm-400">{subValue}</p>}
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
  const [filterType, setFilterType] = useState<string | 'all'>('all')

  const filteredMembers = sortItems(
    mockJobTeamMembers.filter(member => {
      if (!matchesSearch(member, search, ['name', 'roleLabel', 'responsibilities'])) return false
      if (activeTab !== 'all' && member.status !== activeTab) return false
      if (filterType !== 'all' && member.team_member_type !== filterType) return false
      return true
    }),
    activeSort as keyof JobTeamMember | '',
    sortDirection,
  )

  const filteredSubcontractors = mockSubcontractors.filter(sub => {
    if (activeTab === 'completed') return sub.status === 'completed'
    if (activeTab === 'active') return sub.status === 'active'
    if (activeTab === 'upcoming') return sub.status === 'scheduled'
    return true
  })

  // Calculate stats
  const totalTeam = mockJobTeamMembers.length
  const activeMembers = mockJobTeamMembers.filter(m => m.status === 'active').length
  const upcomingMembers = mockJobTeamMembers.filter(m => m.status === 'upcoming').length
  const primaryContacts = mockJobTeamMembers.filter(m => m.is_primary).length
  const activeSubcontractors = mockSubcontractors.filter(s => s.status === 'active').length

  // AI Features for job-specific team
  const aiFeatures = [
    {
      feature: 'Team Recommendations',
      trigger: 'On creation',
      insight: 'Based on job type and schedule, recommend: Mike Smith (PM), Tom Brown (Super). Both available.',
      severity: 'success' as const,
      confidence: 92,
      action: { label: 'Auto-Assign', onClick: () => {} },
    },
    {
      feature: 'Contact Routing',
      trigger: 'Real-time',
      insight: 'Question about electrical? Primary contact: XYZ Electric - John @ (727) 555-1234',
      severity: 'info' as const,
      confidence: 88,
      action: { label: 'Call Now', onClick: () => {} },
    },
    {
      feature: 'Availability Alerts',
      trigger: 'Daily',
      insight: 'Mike Smith assigned to 3 jobs during Feb. May need to reassign or hire.',
      severity: 'warning' as const,
      confidence: 85,
      action: { label: 'View Schedule', onClick: () => {} },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Job Team Roster</h3>
          <span className="text-sm text-warm-500">{totalTeam} team members, {mockSubcontractors.length} subcontractors</span>
          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Johnson Residence - Active</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search team..."
          tabs={[
            { key: 'all', label: 'All', count: mockJobTeamMembers.length + mockSubcontractors.length },
            { key: 'active', label: 'Active', count: activeMembers + activeSubcontractors },
            { key: 'upcoming', label: 'Upcoming', count: upcomingMembers + mockSubcontractors.filter(s => s.status === 'scheduled').length },
            { key: 'completed', label: 'Completed', count: mockJobTeamMembers.filter(m => m.status === 'completed').length + mockSubcontractors.filter(s => s.status === 'completed').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Types',
              value: filterType,
              options: memberTypes.map(t => ({ value: t.id, label: t.label })),
              onChange: (v) => setFilterType(v),
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'roleLabel', label: 'Role' },
            { value: 'start_date', label: 'Start Date' },
            { value: 'is_primary', label: 'Primary First' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'Add Team Member', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredMembers.length + filteredSubcontractors.length}
          totalCount={mockJobTeamMembers.length + mockSubcontractors.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 bg-white border-b border-warm-200">
        <div className="grid grid-cols-5 gap-3">
          <StatCard icon={Users} label="Team Members" value={totalTeam.toString()} iconColor="text-stone-600" iconBg="bg-stone-50" />
          <StatCard icon={UserCheck} label="Active Now" value={activeMembers.toString()} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatCard icon={Star} label="Primary Contacts" value={primaryContacts.toString()} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <StatCard icon={Truck} label="Subcontractors" value={mockSubcontractors.length.toString()} subValue={`${activeSubcontractors} on site`} iconColor="text-sand-600" iconBg="bg-sand-50" />
          <StatCard icon={Clock} label="Upcoming" value={upcomingMembers.toString()} iconColor="text-stone-600" iconBg="bg-stone-50" />
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="px-4 py-4 bg-white border-b border-warm-200">
        <AIFeaturesPanel
          title="AI Team Insights"
          features={aiFeatures}
          columns={3}
        />
      </div>

      {/* Team Members Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-warm-600" />
          <h4 className="font-medium text-warm-900">Team Members</h4>
          <span className="text-xs text-warm-500">({filteredMembers.length})</span>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <JobTeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map(member => (
              <JobTeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-warm-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No team members found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Subcontractors Section */}
      <div className="p-4 border-t border-warm-200 bg-sand-50/30">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-sand-600" />
          <h4 className="font-medium text-warm-900">Subcontractors</h4>
          <span className="text-xs text-warm-500">({filteredSubcontractors.length})</span>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubcontractors.map(sub => (
              <SubcontractorCard key={sub.id} sub={sub} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubcontractors.map(sub => (
              <SubcontractorCard key={sub.id} sub={sub} />
            ))}
          </div>
        )}
        {filteredSubcontractors.length === 0 && (
          <div className="text-center py-8 text-warm-400">
            <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No subcontractors found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Emergency Contacts Footer */}
      <EmergencyContactsFooter contacts={mockEmergencyContacts} />
    </div>
  )
}
