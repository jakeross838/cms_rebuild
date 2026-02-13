'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Download,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
  Sparkles,
  MoreHorizontal,
  DollarSign,
  User,
  Shield,
  FileText,
  RotateCcw,
  ClipboardCheck,
  Layers,
  AlertTriangle,
  Calendar,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ── Types ────────────────────────────────────────────────────

type PunchItemStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'closed' | 'rejected'
type Priority = 'critical' | 'high' | 'medium' | 'low' | 'cosmetic'
type CostResponsibility = 'vendor_backcharge' | 'builder_warranty' | 'shared' | 'none'
type PhotoStage = 'issue' | 'repair' | 'verification' | 'rejection'
type ItemSource = 'walkthrough' | 'checklist' | 'client_portal' | 'daily_log'

interface PunchItemPhoto {
  stage: PhotoStage
  url: string
  hasAnnotations: boolean
}

interface PunchItem {
  id: string
  itemNumber: string
  description: string
  room: string
  floorLevel: string
  trade: string
  assignedVendor: string
  assignedVendorId: string
  priority: Priority
  status: PunchItemStatus
  photos: PunchItemPhoto[]
  dueDate?: string
  createdAt: string
  completedAt?: string
  verifiedAt?: string
  rejectionCount: number
  lastRejectionReason?: string
  costResponsibility: CostResponsibility
  estimatedCost?: number
  actualCost?: number
  source: ItemSource
  checklistRef?: string
  warrantyConversion: boolean
  hasPlanPin: boolean
  notes?: string
}

// ── Mock Data ────────────────────────────────────────────────

const mockPunchItems: PunchItem[] = [
  {
    id: '1',
    itemNumber: 'PL-001',
    description: 'Touch up paint on north wall - visible brush marks and roller texture mismatch',
    room: 'Master Bedroom',
    floorLevel: '2nd Floor',
    trade: 'Painting',
    assignedVendor: 'Pro Finish Painting',
    assignedVendorId: 'v1',
    priority: 'medium',
    status: 'assigned',
    photos: [{ stage: 'issue', url: '/photos/pl-001-issue.jpg', hasAnnotations: true }],
    dueDate: '2026-02-15',
    createdAt: '2026-02-01',
    rejectionCount: 0,
    costResponsibility: 'vendor_backcharge',
    source: 'walkthrough',
    warrantyConversion: false,
    hasPlanPin: true,
  },
  {
    id: '2',
    itemNumber: 'PL-002',
    description: 'Cabinet door alignment - upper left cabinet hinge needs adjustment, door sits 1/8" low',
    room: 'Kitchen',
    floorLevel: '1st Floor',
    trade: 'Cabinets',
    assignedVendor: 'Custom Cabinet Co',
    assignedVendorId: 'v2',
    priority: 'high',
    status: 'in_progress',
    photos: [
      { stage: 'issue', url: '/photos/pl-002-issue.jpg', hasAnnotations: true },
    ],
    dueDate: '2026-02-12',
    createdAt: '2026-01-28',
    rejectionCount: 0,
    costResponsibility: 'vendor_backcharge',
    source: 'walkthrough',
    warrantyConversion: false,
    hasPlanPin: true,
  },
  {
    id: '3',
    itemNumber: 'PL-003',
    description: 'Grout touch-up near shower door - hairline crack in grout line at floor transition',
    room: 'Master Bath',
    floorLevel: '2nd Floor',
    trade: 'Tile',
    assignedVendor: 'Quality Tile Co',
    assignedVendorId: 'v3',
    priority: 'medium',
    status: 'completed',
    photos: [
      { stage: 'issue', url: '/photos/pl-003-issue.jpg', hasAnnotations: false },
      { stage: 'repair', url: '/photos/pl-003-repair.jpg', hasAnnotations: false },
    ],
    createdAt: '2026-01-25',
    completedAt: '2026-02-05',
    rejectionCount: 0,
    costResponsibility: 'vendor_backcharge',
    source: 'client_portal',
    warrantyConversion: false,
    hasPlanPin: true,
  },
  {
    id: '4',
    itemNumber: 'PL-004',
    description: 'HVAC register cover scratched during drywall installation - replace with matching finish',
    room: 'Living Room',
    floorLevel: '1st Floor',
    trade: 'HVAC',
    assignedVendor: 'CoolAir HVAC',
    assignedVendorId: 'v4',
    priority: 'low',
    status: 'verified',
    photos: [
      { stage: 'issue', url: '/photos/pl-004-issue.jpg', hasAnnotations: false },
      { stage: 'repair', url: '/photos/pl-004-repair.jpg', hasAnnotations: false },
      { stage: 'verification', url: '/photos/pl-004-verify.jpg', hasAnnotations: false },
    ],
    createdAt: '2026-01-20',
    completedAt: '2026-01-28',
    verifiedAt: '2026-02-01',
    rejectionCount: 0,
    costResponsibility: 'shared',
    estimatedCost: 85,
    actualCost: 85,
    source: 'walkthrough',
    warrantyConversion: false,
    hasPlanPin: false,
  },
  {
    id: '5',
    itemNumber: 'PL-005',
    description: 'Window seal gap on east wall - cold air infiltration reported by client. Sealant cracking.',
    room: 'Living Room',
    floorLevel: '1st Floor',
    trade: 'Windows',
    assignedVendor: 'PGT Industries',
    assignedVendorId: 'v5',
    priority: 'critical',
    status: 'open',
    photos: [{ stage: 'issue', url: '/photos/pl-005-issue.jpg', hasAnnotations: true }],
    dueDate: '2026-02-10',
    createdAt: '2026-02-03',
    rejectionCount: 0,
    costResponsibility: 'vendor_backcharge',
    estimatedCost: 450,
    source: 'client_portal',
    warrantyConversion: false,
    hasPlanPin: true,
    notes: 'Client reported cold air coming in. Potential warranty claim against PGT.',
  },
  {
    id: '6',
    itemNumber: 'PL-006',
    description: 'Electrical outlet plate loose on north wall - screw stripped, needs new box',
    room: 'Master Bedroom',
    floorLevel: '2nd Floor',
    trade: 'Electrical',
    assignedVendor: 'Sparks Electric',
    assignedVendorId: 'v6',
    priority: 'cosmetic',
    status: 'assigned',
    photos: [],
    dueDate: '2026-02-18',
    createdAt: '2026-02-05',
    rejectionCount: 0,
    costResponsibility: 'vendor_backcharge',
    source: 'walkthrough',
    warrantyConversion: false,
    hasPlanPin: false,
  },
  {
    id: '7',
    itemNumber: 'PL-007',
    description: 'Baseboard trim gap at corner - 1/4" gap where baseboard meets casing at kitchen entry',
    room: 'Kitchen',
    floorLevel: '1st Floor',
    trade: 'Trim',
    assignedVendor: 'Coastal Framing',
    assignedVendorId: 'v7',
    priority: 'medium',
    status: 'rejected',
    photos: [
      { stage: 'issue', url: '/photos/pl-007-issue.jpg', hasAnnotations: true },
      { stage: 'repair', url: '/photos/pl-007-repair.jpg', hasAnnotations: false },
      { stage: 'rejection', url: '/photos/pl-007-reject.jpg', hasAnnotations: true },
    ],
    createdAt: '2026-01-22',
    rejectionCount: 1,
    lastRejectionReason: 'Caulk was used instead of proper scribe cut. Still visible gap.',
    costResponsibility: 'vendor_backcharge',
    source: 'checklist',
    checklistRef: 'Trim Inspection #2',
    warrantyConversion: false,
    hasPlanPin: true,
  },
  {
    id: '8',
    itemNumber: 'PL-008',
    description: 'Light fixture flickering in dining room chandelier - loose wire at junction box',
    room: 'Dining Room',
    floorLevel: '1st Floor',
    trade: 'Electrical',
    assignedVendor: 'Sparks Electric',
    assignedVendorId: 'v6',
    priority: 'high',
    status: 'completed',
    photos: [
      { stage: 'issue', url: '/photos/pl-008-issue.jpg', hasAnnotations: false },
      { stage: 'repair', url: '/photos/pl-008-repair.jpg', hasAnnotations: false },
    ],
    createdAt: '2026-01-18',
    completedAt: '2026-02-02',
    rejectionCount: 0,
    costResponsibility: 'none',
    source: 'daily_log',
    warrantyConversion: false,
    hasPlanPin: false,
  },
  {
    id: '9',
    itemNumber: 'PL-009',
    description: 'Door sticking at guest bath - needs trimming at bottom edge, swelling from moisture',
    room: 'Guest Bath',
    floorLevel: '1st Floor',
    trade: 'Doors',
    assignedVendor: 'Coastal Framing',
    assignedVendorId: 'v7',
    priority: 'medium',
    status: 'closed',
    photos: [
      { stage: 'issue', url: '/photos/pl-009-issue.jpg', hasAnnotations: false },
      { stage: 'repair', url: '/photos/pl-009-repair.jpg', hasAnnotations: false },
      { stage: 'verification', url: '/photos/pl-009-verify.jpg', hasAnnotations: false },
    ],
    createdAt: '2026-01-15',
    completedAt: '2026-01-25',
    verifiedAt: '2026-01-28',
    rejectionCount: 0,
    costResponsibility: 'builder_warranty',
    estimatedCost: 120,
    actualCost: 95,
    source: 'walkthrough',
    warrantyConversion: false,
    hasPlanPin: false,
  },
  {
    id: '10',
    itemNumber: 'PL-010',
    description: 'Drywall crack above door frame - stress crack at header, needs tape and mud repair',
    room: 'Garage',
    floorLevel: '1st Floor',
    trade: 'Drywall',
    assignedVendor: 'Precision Drywall',
    assignedVendorId: 'v8',
    priority: 'low',
    status: 'open',
    photos: [{ stage: 'issue', url: '/photos/pl-010-issue.jpg', hasAnnotations: true }],
    dueDate: '2026-02-20',
    createdAt: '2026-02-06',
    rejectionCount: 0,
    costResponsibility: 'vendor_backcharge',
    source: 'walkthrough',
    warrantyConversion: false,
    hasPlanPin: true,
  },
]

// ── Config ──────────────────────────────────────────────────

const statusConfig: Record<PunchItemStatus, { label: string; color: string; bgColor: string; textColor: string; icon: typeof CircleDot }> = {
  open: { label: 'Open', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: CircleDot },
  assigned: { label: 'Assigned', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', icon: User },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Clock },
  completed: { label: 'Complete', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: RotateCcw },
  verified: { label: 'Verified', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600', icon: CheckCircle2 },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; textColor: string }> = {
  critical: { label: 'Critical', color: 'bg-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  high: { label: 'High', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  medium: { label: 'Medium', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  low: { label: 'Low', color: 'bg-gray-400', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  cosmetic: { label: 'Cosmetic', color: 'bg-blue-300', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
}

const costConfig: Record<CostResponsibility, { label: string; color: string }> = {
  vendor_backcharge: { label: 'Vendor Back-charge', color: 'text-red-600' },
  builder_warranty: { label: 'Builder Warranty', color: 'text-amber-600' },
  shared: { label: 'Shared', color: 'text-purple-600' },
  none: { label: 'No Cost', color: 'text-gray-500' },
}

const sourceConfig: Record<ItemSource, { label: string; icon: typeof FileText }> = {
  walkthrough: { label: 'Walkthrough', icon: Eye },
  checklist: { label: 'Checklist', icon: ClipboardCheck },
  client_portal: { label: 'Client Portal', icon: User },
  daily_log: { label: 'Daily Log', icon: FileText },
}

// ── Sub-Components ──────────────────────────────────────────

function PhotoStages({ photos }: { photos: PunchItemPhoto[] }) {
  if (photos.length === 0) {
    return (
      <span className="text-xs text-amber-600 flex items-center gap-0.5">
        <AlertTriangle className="h-3 w-3" />
        No photo
      </span>
    )
  }

  const stageOrder: PhotoStage[] = ['issue', 'repair', 'verification', 'rejection']
  const stageLabels: Record<PhotoStage, string> = {
    issue: 'Issue',
    repair: 'Repair',
    verification: 'Verify',
    rejection: 'Reject',
  }
  const stageColors: Record<PhotoStage, string> = {
    issue: 'bg-red-400',
    repair: 'bg-blue-400',
    verification: 'bg-green-400',
    rejection: 'bg-amber-400',
  }

  return (
    <div className="flex items-center gap-1">
      <Camera className="h-3 w-3 text-blue-500" />
      {stageOrder.map(stage => {
        const photo = photos.find(p => p.stage === stage)
        if (!photo) return null
        return (
          <span
            key={stage}
            className={cn('h-3 w-3 rounded-full', stageColors[stage])}
            title={`${stageLabels[stage]} photo${photo.hasAnnotations ? ' (annotated)' : ''}`}
          />
        )
      })}
      <span className="text-[10px] text-gray-400 ml-0.5">{photos.length}</span>
    </div>
  )
}

function PunchItemCard({ item }: { item: PunchItem }) {
  const status = statusConfig[item.status]
  const priority = priorityConfig[item.priority]
  const cost = costConfig[item.costResponsibility]
  const source = sourceConfig[item.source]
  const StatusIcon = status.icon
  const SourceIcon = source.icon
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !['verified', 'closed', 'completed'].includes(item.status)

  return (
    <div className={cn(
      "bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      isOverdue ? "border-red-200" : "border-gray-200",
      item.status === 'rejected' ? "border-l-4 border-l-red-500" : ""
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-500">{item.itemNumber}</span>
            {item.hasPlanPin && (
              <span title="Pinned to floor plan"><MapPin className="h-3 w-3 text-blue-500" /></span>
            )}
            <PhotoStages photos={item.photos} />
          </div>
          <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{item.room}</span>
              <span className="text-gray-300">|</span>
              <span>{item.floorLevel}</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{item.trade}</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <SourceIcon className="h-2.5 w-2.5" />
              {source.label}
            </span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Vendor assignment */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xs font-medium text-blue-700">{item.assignedVendor[0]}</span>
        </div>
        <span className="text-xs text-gray-600">{item.assignedVendor}</span>
        {item.dueDate && (
          <span className={cn(
            "text-xs ml-auto flex items-center gap-0.5",
            isOverdue ? "text-red-600 font-medium" : "text-gray-400"
          )}>
            <Calendar className="h-3 w-3" />
            Due: {item.dueDate}
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
          </span>
        )}
      </div>

      {/* Rejection notice */}
      {item.status === 'rejected' && item.lastRejectionReason && (
        <div className="mb-2 p-1.5 bg-red-50 rounded text-xs text-red-700 flex items-start gap-1.5">
          <RotateCcw className="h-3 w-3 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Rejected ({item.rejectionCount}x): </span>
            {item.lastRejectionReason}
          </div>
        </div>
      )}

      {/* Checklist reference */}
      {item.checklistRef && (
        <div className="mb-2 text-xs text-purple-600 flex items-center gap-1">
          <ClipboardCheck className="h-3 w-3" />
          From: {item.checklistRef}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            priority.bgColor,
            priority.textColor
          )}>
            {priority.label}
          </span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1",
            status.bgColor,
            status.textColor
          )}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
            <span className={cn("text-xs flex items-center gap-0.5", cost.color)}>
              <DollarSign className="h-3 w-3" />
              ${item.estimatedCost}
            </span>
          )}
          <span className={cn("text-[10px]", cost.color)}>{cost.label}</span>
        </div>
      </div>
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
  icon: typeof CircleDot
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────

export function PunchListPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [filterRoom, setFilterRoom] = useState<string | 'all'>('all')
  const [filterTrade, setFilterTrade] = useState<string | 'all'>('all')
  const [filterVendor, setFilterVendor] = useState<string | 'all'>('all')
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(['Master Bedroom', 'Kitchen', 'Living Room']))

  // Get unique values for filters
  const rooms = [...new Set(mockPunchItems.map(item => item.room))]
  const trades = [...new Set(mockPunchItems.map(item => item.trade))]
  const vendors = [...new Set(mockPunchItems.map(item => item.assignedVendor))]

  // Filter items
  const filteredItems = sortItems(
    mockPunchItems.filter(item => {
      if (!matchesSearch(item, search, ['description', 'room', 'assignedVendor', 'trade', 'itemNumber'])) return false
      if (activeTab !== 'all' && item.status !== activeTab) return false
      if (filterRoom !== 'all' && item.room !== filterRoom) return false
      if (filterTrade !== 'all' && item.trade !== filterTrade) return false
      if (filterVendor !== 'all' && item.assignedVendor !== filterVendor) return false
      return true
    }),
    activeSort as keyof PunchItem | '',
    sortDirection,
  )

  // Group items by room
  const itemsByRoom = filteredItems.reduce((acc, item) => {
    if (!acc[item.room]) acc[item.room] = []
    acc[item.room].push(item)
    return acc
  }, {} as Record<string, PunchItem[]>)

  // Calculate stats
  const totalItems = mockPunchItems.length
  const verifiedOrClosed = mockPunchItems.filter(item => item.status === 'verified' || item.status === 'closed').length
  const completePercent = Math.round((verifiedOrClosed / totalItems) * 100)
  const openItems = mockPunchItems.filter(item => item.status === 'open' || item.status === 'assigned').length
  const inProgressItems = mockPunchItems.filter(item => item.status === 'in_progress').length
  const rejectedItems = mockPunchItems.filter(item => item.status === 'rejected').length
  const criticalItems = mockPunchItems.filter(item => item.priority === 'critical' && !['verified', 'closed'].includes(item.status)).length
  const totalEstCost = mockPunchItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
  const backchargeCount = mockPunchItems.filter(item => item.costResponsibility === 'vendor_backcharge' && !['verified', 'closed'].includes(item.status)).length

  const toggleRoom = (room: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev)
      if (next.has(room)) {
        next.delete(room)
      } else {
        next.add(room)
      }
      return next
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Punch List - Smith Residence</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                completePercent >= 90 ? "bg-green-100 text-green-700" :
                completePercent >= 50 ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              )}>
                {completePercent}% Complete
              </span>
              {rejectedItems > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" />
                  {rejectedItems} rejected
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {totalItems} total | {openItems} open | {inProgressItems} in progress | {verifiedOrClosed} verified/closed
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="grid grid-cols-7 gap-2">
          <StatCard icon={CircleDot} label="Total Items" value={totalItems} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard icon={CheckCircle2} label="Complete" value={`${completePercent}%`} subValue={`${verifiedOrClosed} of ${totalItems}`} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatCard icon={CircleDot} label="Open" value={openItems} iconColor="text-red-600" iconBg="bg-red-50" />
          <StatCard icon={AlertCircle} label="Critical" value={criticalItems} iconColor="text-red-600" iconBg="bg-red-50" />
          <StatCard icon={RotateCcw} label="Rejected" value={rejectedItems} iconColor="text-red-600" iconBg="bg-red-50" />
          <StatCard icon={DollarSign} label="Est. Cost" value={`$${totalEstCost.toLocaleString()}`} subValue={`${backchargeCount} back-charges`} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <StatCard icon={Layers} label="Rooms" value={rooms.length} subValue={`${trades.length} trades`} iconColor="text-purple-600" iconBg="bg-purple-50" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search items..."
          tabs={[
            { key: 'all', label: 'All', count: mockPunchItems.length },
            { key: 'open', label: 'Open', count: mockPunchItems.filter(i => i.status === 'open').length },
            { key: 'assigned', label: 'Assigned', count: mockPunchItems.filter(i => i.status === 'assigned').length },
            { key: 'in_progress', label: 'In Progress', count: mockPunchItems.filter(i => i.status === 'in_progress').length },
            { key: 'completed', label: 'Complete', count: mockPunchItems.filter(i => i.status === 'completed').length },
            { key: 'rejected', label: 'Rejected', count: mockPunchItems.filter(i => i.status === 'rejected').length },
            { key: 'verified', label: 'Verified', count: mockPunchItems.filter(i => i.status === 'verified').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Rooms',
              value: filterRoom,
              options: rooms.map(room => ({ value: room, label: room })),
              onChange: setFilterRoom,
            },
            {
              label: 'All Trades',
              value: filterTrade,
              options: trades.map(t => ({ value: t, label: t })),
              onChange: setFilterTrade,
            },
            {
              label: 'All Vendors',
              value: filterVendor,
              options: vendors.map(v => ({ value: v, label: v })),
              onChange: setFilterVendor,
            },
          ]}
          sortOptions={[
            { value: 'itemNumber', label: 'Item #' },
            { value: 'description', label: 'Description' },
            { value: 'room', label: 'Room' },
            { value: 'priority', label: 'Priority' },
            { value: 'trade', label: 'Trade' },
            { value: 'assignedVendor', label: 'Vendor' },
            { value: 'dueDate', label: 'Due Date' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: ClipboardCheck, label: 'Walkthrough', onClick: () => {} },
            { icon: Plus, label: 'Add Item', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredItems.length}
          totalCount={mockPunchItems.length}
        />
      </div>

      {/* Punch Items by Room */}
      <div className="max-h-[450px] overflow-y-auto">
        {Object.entries(itemsByRoom).map(([room, items]) => {
          const isExpanded = expandedRooms.has(room)
          const roomComplete = items.filter(i => ['completed', 'verified', 'closed'].includes(i.status)).length
          const roomTotal = items.length
          const roomCritical = items.filter(i => i.priority === 'critical' && !['verified', 'closed'].includes(i.status)).length

          return (
            <div key={room} className="border-b border-gray-100 last:border-b-0">
              {/* Room Header */}
              <button
                onClick={() => toggleRoom(room)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{room}</span>
                  <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                    {roomTotal}
                  </span>
                  {roomCritical > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <AlertCircle className="h-3 w-3" />
                      {roomCritical} critical
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{roomComplete}/{roomTotal} complete</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        roomComplete === roomTotal ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ width: `${(roomComplete / roomTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Room Items */}
              {isExpanded && (
                <div className="p-4 space-y-3 bg-white">
                  {items.map(item => (
                    <PunchItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {Object.keys(itemsByRoom).length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No punch items found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <div className="flex flex-col gap-1 text-sm text-amber-700">
            <span>At current completion rate, punch list will be cleared in ~4 days. PL-005 (window seal gap) is critical and overdue -- vendor response needed.</span>
            <span>PL-007 rejected for inadequate repair. Coastal Framing has 2 items remaining. Quality Tile Co typically resolves items in 3 days -- on track.</span>
            <span>Estimated back-charge total: ${totalEstCost} across {backchargeCount} vendor items. Kitchen cabinet alignment usually requires follow-up 15% of the time.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
