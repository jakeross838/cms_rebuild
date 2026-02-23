'use client'

import { useState } from 'react'

import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  Calendar,
  MapPin,
  Wrench,
  Camera,
  User,
  TrendingUp,
  DollarSign,
  Phone,
  Timer,
  ShieldCheck,
  Building2,
  Link2,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClaimStatus = 'submitted' | 'evaluating' | 'dispatched' | 'in_progress' | 'resolved' | 'closed'
type Priority = 'emergency' | 'urgent' | 'standard' | 'cosmetic'
type IssueCategory = 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'finish' | 'exterior' | 'appliance'
type Determination = 'covered' | 'manufacturer_issue' | 'homeowner_responsibility' | 'goodwill' | 'pending'
type VendorDispatchStatus = 'not_dispatched' | 'dispatched' | 'accepted' | 'declined' | 'scheduled' | 'completed'

interface WarrantyClaim {
  id: string
  claimNumber: string
  projectName: string
  clientName: string
  propertyAddress: string
  issueTitle: string
  description: string
  category: IssueCategory
  priority: Priority
  status: ClaimStatus
  determination: Determination
  reportedAt: string
  reportedDaysAgo: number
  slaDeadline: string
  slaHoursRemaining?: number
  location: string
  assignedVendor?: string
  vendorDispatchStatus: VendorDispatchStatus
  scheduledServiceDate?: string
  photos: number
  cost: number
  costBreakdown?: { labor: number; materials: number; vendor: number }
  satisfactionScore?: number
  resolvedAt?: string
  resolutionNotes?: string
  fromWalkthrough?: string
  duplicateOf?: string
  vendorDisputed?: boolean
  aiNote?: string
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockClaims: WarrantyClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2026-089',
    projectName: 'Smith Residence',
    clientName: 'David & Sarah Smith',
    propertyAddress: '142 Oak Harbor Dr, Charleston SC',
    issueTitle: 'Water leak in master bath ceiling',
    description: 'Active water staining and drip from ceiling near shower. Appears to be coming from 2nd floor plumbing above.',
    category: 'plumbing',
    priority: 'emergency',
    status: 'submitted',
    determination: 'pending',
    reportedAt: '2026-02-12 08:30',
    reportedDaysAgo: 0,
    slaDeadline: '2026-02-13 08:30',
    slaHoursRemaining: 22,
    location: 'Master Bathroom - Ceiling',
    photos: 3,
    cost: 0,
    vendorDispatchStatus: 'not_dispatched',
    aiNote: 'Active leak over electrical panel proximity. Photos show expanding water stain. Escalating to Emergency. Recommend immediate dispatch of Jones Plumbing (original trade).',
  },
  {
    id: '2',
    claimNumber: 'CLM-2026-085',
    projectName: 'Johnson Waterfront',
    clientName: 'Mark & Lisa Johnson',
    propertyAddress: '88 Marsh View Ln, Mt Pleasant SC',
    issueTitle: 'HVAC not cooling properly on main floor',
    description: 'System runs but does not reach set temperature. Main floor stays 5-8 degrees above thermostat setting.',
    category: 'mechanical',
    priority: 'urgent',
    status: 'in_progress',
    determination: 'covered',
    reportedAt: '2026-02-09',
    reportedDaysAgo: 3,
    slaDeadline: '2026-02-11 17:00',
    location: 'Main Floor - Living Area',
    assignedVendor: 'Cool Air HVAC',
    vendorDispatchStatus: 'scheduled',
    scheduledServiceDate: '2026-02-14',
    photos: 2,
    cost: 0,
    costBreakdown: { labor: 0, materials: 0, vendor: 0 },
    aiNote: 'Trane compressor warranty (parts) active through 2035. Labor warranty expired Jan 15. Recommend: file parts claim with Trane, builder covers labor cost.',
  },
  {
    id: '3',
    claimNumber: 'CLM-2026-082',
    projectName: 'Davis Custom Home',
    clientName: 'Robert Davis',
    propertyAddress: '310 Folly Rd, James Island SC',
    issueTitle: 'Cabinet door alignment issue - kitchen uppers',
    description: 'Three upper cabinet doors not closing flush. Gaps visible on left side. Appears to have shifted over time.',
    category: 'finish',
    priority: 'standard',
    status: 'resolved',
    determination: 'covered',
    reportedAt: '2026-02-06',
    reportedDaysAgo: 6,
    slaDeadline: '2026-02-13 17:00',
    location: 'Kitchen - Upper Cabinets',
    assignedVendor: 'Cabinet Pros LLC',
    vendorDispatchStatus: 'completed',
    scheduledServiceDate: '2026-02-10',
    photos: 4,
    cost: 350,
    costBreakdown: { labor: 200, materials: 0, vendor: 150 },
    satisfactionScore: 95,
    resolvedAt: '2026-02-10',
    resolutionNotes: 'Hinge adjustment and shimming. All three doors now close flush. No replacement needed.',
  },
  {
    id: '4',
    claimNumber: 'CLM-2026-081',
    projectName: 'Miller Property',
    clientName: 'Karen Miller',
    propertyAddress: '225 Kiawah River Dr, Johns Island SC',
    issueTitle: 'Dishwasher door seal peeling at bottom',
    description: 'Sub-Zero dishwasher door seal separating from frame at the bottom. Water leaking onto floor during cycle.',
    category: 'appliance',
    priority: 'standard',
    status: 'evaluating',
    determination: 'manufacturer_issue',
    reportedAt: '2026-02-08',
    reportedDaysAgo: 4,
    slaDeadline: '2026-02-15 17:00',
    location: 'Kitchen - Dishwasher',
    photos: 4,
    cost: 0,
    vendorDispatchStatus: 'not_dispatched',
    aiNote: 'Sub-Zero product warranty active (2yr full coverage). This is a manufacturer defect. Route to Sub-Zero warranty service directly - (800) 222-7820.',
  },
  {
    id: '5',
    claimNumber: 'CLM-2026-078',
    projectName: 'Taylor Estate',
    clientName: 'James & Michelle Taylor',
    propertyAddress: '550 Ocean Blvd, Isle of Palms SC',
    issueTitle: 'Window seal failure on west side - PGT WinGuard',
    description: 'Two impact windows on west elevation showing condensation between panes. Seal failure confirmed on visual inspection.',
    category: 'exterior',
    priority: 'urgent',
    status: 'dispatched',
    determination: 'manufacturer_issue',
    reportedAt: '2026-02-02',
    reportedDaysAgo: 10,
    slaDeadline: '2026-02-04 17:00',
    location: 'Living Room - West Wall',
    assignedVendor: 'Coastal Windows & Doors',
    vendorDispatchStatus: 'accepted',
    scheduledServiceDate: '2026-02-18',
    photos: 5,
    cost: 0,
    duplicateOf: undefined,
    aiNote: '3rd PGT seal failure this quarter across projects (same lot 2024-B). Recommend: contact PGT for batch inspection of all units from this production run.',
  },
  {
    id: '6',
    claimNumber: 'CLM-2026-075',
    projectName: 'Anderson Home',
    clientName: 'Thomas Anderson',
    propertyAddress: '180 Wentworth St, Charleston SC',
    issueTitle: 'Electrical outlet not functioning in bedroom',
    description: 'Outlet on north wall of bedroom #2 not providing power. Breaker confirmed ON. Other outlets in room work fine.',
    category: 'electrical',
    priority: 'standard',
    status: 'closed',
    determination: 'covered',
    reportedAt: '2026-01-29',
    reportedDaysAgo: 14,
    slaDeadline: '2026-02-05 17:00',
    location: 'Bedroom #2 - North Wall',
    assignedVendor: 'Smith Electric',
    vendorDispatchStatus: 'completed',
    scheduledServiceDate: '2026-02-01',
    photos: 2,
    cost: 150,
    costBreakdown: { labor: 100, materials: 50, vendor: 0 },
    satisfactionScore: 88,
    resolvedAt: '2026-02-01',
    resolutionNotes: 'Loose wire nut on hot lead. Reconnected and tested. Confirmed power at outlet.',
  },
  {
    id: '7',
    claimNumber: 'CLM-2026-071',
    projectName: 'Smith Residence',
    clientName: 'David & Sarah Smith',
    propertyAddress: '142 Oak Harbor Dr, Charleston SC',
    issueTitle: 'Grout cracking along shower base',
    description: 'Hairline cracks in grout along the shower base-to-wall joint. No water intrusion detected yet.',
    category: 'finish',
    priority: 'cosmetic',
    status: 'dispatched',
    determination: 'covered',
    reportedAt: '2026-01-25',
    reportedDaysAgo: 18,
    slaDeadline: '2026-02-08 17:00',
    location: 'Master Bathroom - Shower',
    assignedVendor: 'Lowcountry Tile Works',
    vendorDispatchStatus: 'scheduled',
    scheduledServiceDate: '2026-02-20',
    photos: 2,
    cost: 0,
    fromWalkthrough: '30-day walkthrough',
    aiNote: 'Found during 30-day walkthrough. Pattern consistent with normal settling - grout re-application typically sufficient. Vendor estimated 1 hour.',
  },
  {
    id: '8',
    claimNumber: 'CLM-2026-068',
    projectName: 'Davis Custom Home',
    clientName: 'Robert Davis',
    propertyAddress: '310 Folly Rd, James Island SC',
    issueTitle: 'Foundation crack near garage',
    description: 'Vertical crack approximately 1/8" wide and 18" long observed on interior foundation wall near garage door.',
    category: 'structural',
    priority: 'urgent',
    status: 'evaluating',
    determination: 'pending',
    reportedAt: '2026-02-10',
    reportedDaysAgo: 2,
    slaDeadline: '2026-02-12 17:00',
    location: 'Garage - Interior Foundation Wall',
    photos: 6,
    cost: 0,
    vendorDispatchStatus: 'not_dispatched',
    vendorDisputed: false,
    aiNote: 'Structural claim requires engineering assessment before vendor dispatch. Crack width 1/8" is borderline - recommend structural engineer review. 10-year structural warranty active.',
  },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig: Record<ClaimStatus, { label: string; color: string; bgColor: string; textColor: string; icon: typeof AlertCircle }> = {
  submitted: { label: 'Submitted', color: 'bg-stone-500', bgColor: 'bg-stone-50', textColor: 'text-stone-700', icon: Clock },
  evaluating: { label: 'Evaluating', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: AlertCircle },
  dispatched: { label: 'Dispatched', color: 'bg-warm-500', bgColor: 'bg-warm-50', textColor: 'text-warm-700', icon: User },
  in_progress: { label: 'In Progress', color: 'bg-sand-500', bgColor: 'bg-sand-50', textColor: 'text-sand-700', icon: Wrench },
  resolved: { label: 'Resolved', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-warm-500', bgColor: 'bg-warm-50', textColor: 'text-warm-700', icon: XCircle },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; textColor: string; slaLabel: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700', slaLabel: '24hr response' },
  urgent: { label: 'Urgent', color: 'bg-sand-700', bgColor: 'bg-sand-50', textColor: 'text-sand-700', slaLabel: '48hr response' },
  standard: { label: 'Standard', color: 'bg-stone-600', bgColor: 'bg-stone-50', textColor: 'text-stone-700', slaLabel: '5 business days' },
  cosmetic: { label: 'Cosmetic', color: 'bg-warm-400', bgColor: 'bg-warm-50', textColor: 'text-warm-600', slaLabel: '10 business days' },
}

const categoryConfig: Record<IssueCategory, { label: string; icon: typeof Wrench; color: string }> = {
  structural: { label: 'Structural', icon: Building2, color: 'text-red-600' },
  mechanical: { label: 'Mechanical', icon: Wrench, color: 'text-stone-600' },
  electrical: { label: 'Electrical', icon: AlertTriangle, color: 'text-amber-600' },
  plumbing: { label: 'Plumbing', icon: AlertCircle, color: 'text-stone-600' },
  finish: { label: 'Finish', icon: Wrench, color: 'text-stone-600' },
  appliance: { label: 'Appliance', icon: Wrench, color: 'text-sand-600' },
  exterior: { label: 'Exterior', icon: Building2, color: 'text-green-600' },
}

const determinationConfig: Record<Determination, { label: string; color: string }> = {
  covered: { label: 'Covered', color: 'bg-green-100 text-green-700' },
  manufacturer_issue: { label: 'Manufacturer', color: 'bg-warm-100 text-warm-700' },
  homeowner_responsibility: { label: 'Homeowner', color: 'bg-warm-100 text-warm-700' },
  goodwill: { label: 'Goodwill Repair', color: 'bg-stone-100 text-stone-700' },
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function ClaimCard({ claim }: { claim: WarrantyClaim }) {
  const status = statusConfig[claim.status]
  const priority = priorityConfig[claim.priority]
  const category = categoryConfig[claim.category]
  const determination = determinationConfig[claim.determination]
  const StatusIcon = status.icon
  const CategoryIcon = category.icon

  return (
    <div className={cn(
      'bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer',
      claim.priority === 'emergency' ? 'border-red-300 bg-red-50/30' :
      claim.priority === 'urgent' ? 'border-sand-200' :
      'border-warm-200'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-warm-900">{claim.claimNumber}</span>
            <span className="text-sm text-warm-500">-- {claim.issueTitle}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-warm-600 mt-1 flex-wrap">
            <span>{claim.clientName}</span>
            <span className="text-warm-300">|</span>
            <span>{claim.projectName}</span>
            <span className="text-warm-300">|</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{claim.location}</span>
            </div>
          </div>
          <p className="text-xs text-warm-400 mt-0.5">{claim.propertyAddress}</p>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded flex-shrink-0">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn('text-xs px-2 py-1 rounded font-medium flex items-center gap-1', status.bgColor, status.textColor)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn('text-xs px-2 py-1 rounded font-medium', priority.bgColor, priority.textColor)}>
          {priority.label}
        </span>
        <span className={cn('text-xs px-2 py-1 rounded font-medium bg-warm-100 text-warm-700 flex items-center gap-1')}>
          <CategoryIcon className="h-3 w-3" />
          {category.label}
        </span>
        <span className={cn('text-xs px-2 py-1 rounded font-medium', determination.color)}>
          {determination.label}
        </span>
        {claim.assignedVendor ? <span className="text-xs px-2 py-1 rounded font-medium bg-stone-50 text-stone-700 flex items-center gap-1">
            <User className="h-3 w-3" />
            {claim.assignedVendor}
          </span> : null}
        {claim.fromWalkthrough ? <span className="text-xs px-2 py-1 rounded font-medium bg-stone-50 text-stone-700 flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            {claim.fromWalkthrough}
          </span> : null}
        {claim.vendorDisputed ? <span className="text-xs px-2 py-1 rounded font-medium bg-red-50 text-red-700">
            Disputed
          </span> : null}
      </div>

      {/* SLA Timer */}
      {claim.slaHoursRemaining !== undefined && claim.status !== 'resolved' && claim.status !== 'closed' && (
        <div className={cn(
          'flex items-center gap-2 text-xs p-2 rounded mb-3',
          claim.slaHoursRemaining <= 4 ? 'bg-red-50 text-red-700' :
          claim.slaHoursRemaining <= 24 ? 'bg-amber-50 text-amber-700' :
          'bg-warm-50 text-warm-600'
        )}>
          <Timer className="h-3.5 w-3.5" />
          <span className="font-medium">SLA: {claim.slaHoursRemaining}h remaining</span>
          <span className="text-warm-400">|</span>
          <span>{priority.slaLabel}</span>
        </div>
      )}

      {/* Vendor dispatch info */}
      {claim.vendorDispatchStatus !== 'not_dispatched' && (
        <div className="flex items-center gap-3 text-xs text-warm-500 mb-3">
          <span className={cn(
            'px-2 py-0.5 rounded font-medium',
            claim.vendorDispatchStatus === 'completed' ? 'bg-green-100 text-green-700' :
            claim.vendorDispatchStatus === 'scheduled' ? 'bg-stone-100 text-stone-700' :
            claim.vendorDispatchStatus === 'accepted' ? 'bg-warm-100 text-warm-700' :
            claim.vendorDispatchStatus === 'declined' ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-700'
          )}>
            {claim.vendorDispatchStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          {claim.scheduledServiceDate ? <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Service: {claim.scheduledServiceDate}
            </span> : null}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-warm-600 pt-3 border-t border-warm-100">
        <div className="flex items-center gap-4">
          {claim.photos > 0 && (
            <div className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" />
              <span>{claim.photos} photo{claim.photos !== 1 ? 's' : ''}</span>
            </div>
          )}
          <span className="text-xs text-warm-400">{claim.reportedDaysAgo === 0 ? 'Today' : `${claim.reportedDaysAgo}d ago`}</span>
          {claim.cost > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-warm-700">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(claim.cost)}
              {claim.costBreakdown ? <span className="text-warm-400 font-normal">
                  (L:{formatCurrency(claim.costBreakdown.labor)} M:{formatCurrency(claim.costBreakdown.materials)})
                </span> : null}
            </span>
          )}
        </div>
        {claim.satisfactionScore !== undefined && (
          <span className={cn('text-xs font-medium px-2 py-1 rounded', claim.satisfactionScore >= 90 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
            {claim.satisfactionScore}% satisfied
          </span>
        )}
      </div>

      {/* Resolution Notes */}
      {claim.resolutionNotes ? <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
          <CheckCircle2 className="h-3 w-3 inline mr-1" />
          {claim.resolutionNotes}
        </div> : null}

      {/* AI Note */}
      {claim.aiNote ? <div className="mt-2 p-2 bg-stone-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-stone-600 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-stone-700">{claim.aiNote}</span>
        </div> : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  subValue,
  iconColor,
  iconBg,
  icon: Icon,
}: {
  label: string
  value: string | number
  subValue?: string
  iconColor: string
  iconBg: string
  icon: typeof AlertCircle
}) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-3">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
        <div>
          <p className="text-xs text-warm-500">{label}</p>
          <p className="text-lg font-semibold text-warm-900">{value}</p>
          {subValue ? <p className="text-xs text-warm-400">{subValue}</p> : null}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WarrantyClaimsPreview() {
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all')
  const [determinationFilter, setDeterminationFilter] = useState<Determination | 'all'>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({})

  // Filter claims
  const filteredClaims = sortItems(
    mockClaims.filter(claim => {
      if (!matchesSearch(claim, search, ['claimNumber', 'issueTitle', 'clientName', 'projectName', 'assignedVendor', 'propertyAddress'])) return false
      if (activeTab !== 'all' && claim.status !== activeTab) return false
      if (priorityFilter !== 'all' && claim.priority !== priorityFilter) return false
      if (categoryFilter !== 'all' && claim.category !== categoryFilter) return false
      if (determinationFilter !== 'all' && claim.determination !== determinationFilter) return false
      return true
    }),
    activeSort as keyof WarrantyClaim | '',
    sortDirection,
  )

  // Stats
  const totalClaims = mockClaims.length
  const openClaims = mockClaims.filter(c => ['submitted', 'evaluating'].includes(c.status)).length
  const dispatchedClaims = mockClaims.filter(c => ['dispatched', 'in_progress'].includes(c.status)).length
  const resolvedClaims = mockClaims.filter(c => c.status === 'resolved').length
  const emergencyClaims = mockClaims.filter(c => c.priority === 'emergency' && c.status !== 'resolved' && c.status !== 'closed').length
  const totalCost = mockClaims.reduce((sum, c) => sum + c.cost, 0)
  const avgResolutionDays = 4.2
  const avgSatisfaction = mockClaims.filter(c => c.satisfactionScore).reduce((sum, c) => sum + (c.satisfactionScore ?? 0), 0) / (mockClaims.filter(c => c.satisfactionScore).length || 1)
  const slaBreaching = mockClaims.filter(c => c.slaHoursRemaining !== undefined && c.slaHoursRemaining <= 4 && c.status !== 'resolved' && c.status !== 'closed').length

  const priorities: Priority[] = ['emergency', 'urgent', 'standard', 'cosmetic']
  const categories: IssueCategory[] = ['structural', 'mechanical', 'electrical', 'plumbing', 'finish', 'exterior', 'appliance']
  const determinations: Determination[] = ['covered', 'manufacturer_issue', 'homeowner_responsibility', 'goodwill', 'pending']

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="mb-3">
          <h3 className="font-semibold text-warm-900">Warranty Claims</h3>
          <p className="text-sm text-warm-500">{totalClaims} claims | {openClaims} open | {dispatchedClaims} dispatched/in-progress | Avg Resolution: {avgResolutionDays}d</p>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search claims, clients, vendors, addresses..."
          tabs={[
            { key: 'all', label: 'All', count: totalClaims },
            { key: 'submitted', label: 'Submitted', count: mockClaims.filter(c => c.status === 'submitted').length },
            { key: 'evaluating', label: 'Evaluating', count: mockClaims.filter(c => c.status === 'evaluating').length },
            { key: 'dispatched', label: 'Dispatched', count: mockClaims.filter(c => c.status === 'dispatched').length },
            { key: 'in_progress', label: 'In Progress', count: mockClaims.filter(c => c.status === 'in_progress').length },
            { key: 'resolved', label: 'Resolved', count: mockClaims.filter(c => c.status === 'resolved').length },
            { key: 'closed', label: 'Closed', count: mockClaims.filter(c => c.status === 'closed').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Priorities',
              value: priorityFilter,
              options: priorities.map(p => ({ value: p, label: priorityConfig[p].label })),
              onChange: (v) => setPriorityFilter(v as Priority | 'all'),
            },
            {
              label: 'All Categories',
              value: categoryFilter,
              options: categories.map(c => ({ value: c, label: categoryConfig[c].label })),
              onChange: (v) => setCategoryFilter(v as IssueCategory | 'all'),
            },
            {
              label: 'All Determinations',
              value: determinationFilter,
              options: determinations.map(d => ({ value: d, label: determinationConfig[d].label })),
              onChange: (v) => setDeterminationFilter(v as Determination | 'all'),
            },
          ]}
          sortOptions={[
            { value: 'claimNumber', label: 'Claim #' },
            { value: 'clientName', label: 'Client' },
            { value: 'priority', label: 'Priority' },
            { value: 'reportedDaysAgo', label: 'Reported Date' },
            { value: 'category', label: 'Category' },
            { value: 'cost', label: 'Cost' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'New Claim', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredClaims.length}
          totalCount={mockClaims.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-7 gap-3">
          <StatCard icon={AlertCircle} label="Open" value={openClaims} iconColor="text-stone-600" iconBg="bg-stone-50" />
          <StatCard icon={User} label="Dispatched" value={dispatchedClaims} iconColor="text-stone-600" iconBg="bg-warm-50" />
          <StatCard icon={CheckCircle2} label="Resolved" value={resolvedClaims} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatCard icon={TrendingUp} label="Avg Resolution" value={`${avgResolutionDays}d`} iconColor="text-stone-600" iconBg="bg-stone-50" />
          <StatCard icon={AlertTriangle} label="Emergency" value={emergencyClaims} subValue={slaBreaching > 0 ? `${slaBreaching} SLA risk` : undefined} iconColor="text-red-600" iconBg="bg-red-50" />
          <StatCard icon={DollarSign} label="Total Cost" value={formatCurrency(totalCost)} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <StatCard icon={ShieldCheck} label="Satisfaction" value={`${Math.round(avgSatisfaction)}%`} iconColor="text-stone-600" iconBg="bg-stone-50" />
        </div>
      </div>

      {/* Claims List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredClaims.length > 0 ? (
          filteredClaims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))
        ) : (
          <div className="text-center py-8 text-warm-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No warranty claims found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Claim Lifecycle Timeline */}
      <div className="border-t border-warm-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-warm-600" />
          <h4 className="font-semibold text-warm-900 text-sm">Claim Lifecycle (CLM-2026-082)</h4>
        </div>
        <div className="flex items-center gap-4">
          {[
            { phase: 'Reported', date: 'Feb 6', color: 'bg-stone-500' },
            { phase: 'Evaluated', date: 'Feb 6', color: 'bg-amber-500' },
            { phase: 'Dispatched', date: 'Feb 7', color: 'bg-warm-500' },
            { phase: 'Vendor Accepted', date: 'Feb 7', color: 'bg-stone-500' },
            { phase: 'Scheduled', date: 'Feb 10', color: 'bg-sand-500' },
            { phase: 'Resolved', date: 'Feb 10', color: 'bg-green-500' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
              <div>
                <span className="text-xs font-medium text-warm-700">{item.phase}</span>
                <span className="text-xs text-warm-400 ml-1">{item.date}</span>
              </div>
              {idx < 5 && <div className="w-4 h-px bg-warm-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* AI Pattern Detection */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Warranty Intelligence:</span>
          </div>
          <div className="space-y-1 text-sm text-amber-700">
            <p>&#x2022; 3 PGT window seal failures this quarter (lot 2024-B) -- recommend proactive batch inspection across all affected projects</p>
            <p>&#x2022; HVAC cooling claims spike May-September. Pre-allocate vendor capacity for warm months.</p>
            <p>&#x2022; Cabinet alignment adjustments resolve 95% of cases -- schedule routine 6-month adjustments proactively</p>
            <p>&#x2022; Warranty reserve utilization at 18% ($3,440 of $18,750). Historical average for similar projects at this stage: 35%. Reserve is healthy.</p>
            <p>&#x2022; CLM-2026-089 (emergency water leak) requires immediate dispatch -- SLA clock at 22 hours</p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          { feature: 'Claim Validation', insight: 'Validates warranty coverage' },
          { feature: 'Pattern Detection', insight: 'Identifies recurring issues' },
          { feature: 'Resolution Tracking', insight: 'Tracks claim resolution' },
          { feature: 'Cost Analysis', insight: 'Analyzes claim costs' },
          { feature: 'Vendor Attribution', insight: 'Assigns responsibility' },
        ]}
      />
    </div>
  )
}
