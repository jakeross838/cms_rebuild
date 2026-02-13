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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type PunchItemStatus = 'open' | 'in_progress' | 'complete' | 'verified'
type Priority = 'high' | 'medium' | 'low'

interface PunchItem {
  id: string
  description: string
  room: string
  assignedTo: string
  priority: Priority
  status: PunchItemStatus
  hasPhoto: boolean
  dueDate?: string
  notes?: string
}

const mockPunchItems: PunchItem[] = [
  {
    id: '1',
    description: 'Touch up paint on north wall - visible brush marks',
    room: 'Master Bedroom',
    assignedTo: 'Mike',
    priority: 'medium',
    status: 'open',
    hasPhoto: true,
  },
  {
    id: '2',
    description: 'Cabinet door alignment - upper left cabinet',
    room: 'Kitchen',
    assignedTo: 'Jake',
    priority: 'high',
    status: 'in_progress',
    hasPhoto: true,
    dueDate: '2024-02-15',
  },
  {
    id: '3',
    description: 'Grout touch-up near shower door',
    room: 'Master Bath',
    assignedTo: 'Mike',
    priority: 'medium',
    status: 'complete',
    hasPhoto: false,
  },
  {
    id: '4',
    description: 'HVAC register cover scratched',
    room: 'Living Room',
    assignedTo: 'Sarah',
    priority: 'low',
    status: 'verified',
    hasPhoto: true,
  },
  {
    id: '5',
    description: 'Window seal gap - draft issue',
    room: 'Living Room',
    assignedTo: 'Jake',
    priority: 'high',
    status: 'open',
    hasPhoto: true,
    notes: 'Client reported cold air coming in',
  },
  {
    id: '6',
    description: 'Electrical outlet plate loose',
    room: 'Master Bedroom',
    assignedTo: 'Sarah',
    priority: 'low',
    status: 'open',
    hasPhoto: false,
  },
  {
    id: '7',
    description: 'Baseboard trim gap at corner',
    room: 'Kitchen',
    assignedTo: 'Mike',
    priority: 'medium',
    status: 'in_progress',
    hasPhoto: true,
  },
  {
    id: '8',
    description: 'Light fixture flickering',
    room: 'Dining Room',
    assignedTo: 'Jake',
    priority: 'high',
    status: 'complete',
    hasPhoto: false,
  },
  {
    id: '9',
    description: 'Door sticking - needs adjustment',
    room: 'Guest Bath',
    assignedTo: 'Mike',
    priority: 'medium',
    status: 'verified',
    hasPhoto: false,
  },
  {
    id: '10',
    description: 'Drywall crack above door frame',
    room: 'Garage',
    assignedTo: 'Sarah',
    priority: 'low',
    status: 'open',
    hasPhoto: true,
  },
]

const statusConfig: Record<PunchItemStatus, { label: string; color: string; bgColor: string; textColor: string; icon: typeof CircleDot }> = {
  open: { label: 'Open', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: CircleDot },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Clock },
  complete: { label: 'Complete', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: CheckCircle2 },
  verified: { label: 'Verified', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle2 },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; textColor: string }> = {
  high: { label: 'High', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  medium: { label: 'Medium', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  low: { label: 'Low', color: 'bg-gray-400', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
}

function PunchItemCard({ item }: { item: PunchItem }) {
  const status = statusConfig[item.status]
  const priority = priorityConfig[item.priority]
  const StatusIcon = status.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{item.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{item.room}</span>
            </div>
            {item.hasPhoto && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Camera className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">{item.assignedTo[0]}</span>
          </div>
          <span className="text-xs text-gray-500">{item.assignedTo}</span>
        </div>
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

export function PunchListPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [filterRoom, setFilterRoom] = useState<string | 'all'>('all')
  const [filterAssignee, setFilterAssignee] = useState<string | 'all'>('all')
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(['Master Bedroom', 'Kitchen', 'Living Room']))

  // Get unique rooms and assignees
  const rooms = [...new Set(mockPunchItems.map(item => item.room))]
  const assignees = [...new Set(mockPunchItems.map(item => item.assignedTo))]

  // Filter items
  const filteredItems = sortItems(
    mockPunchItems.filter(item => {
      if (!matchesSearch(item, search, ['description', 'room', 'assignedTo'])) return false
      if (activeTab !== 'all' && item.status !== activeTab) return false
      if (filterRoom !== 'all' && item.room !== filterRoom) return false
      if (filterAssignee !== 'all' && item.assignedTo !== filterAssignee) return false
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
  const completeItems = mockPunchItems.filter(item => item.status === 'complete' || item.status === 'verified').length
  const completePercent = Math.round((completeItems / totalItems) * 100)
  const openItems = mockPunchItems.filter(item => item.status === 'open').length
  const inProgressItems = mockPunchItems.filter(item => item.status === 'in_progress').length
  const highPriorityItems = mockPunchItems.filter(item => item.priority === 'high' && item.status !== 'verified').length
  const mediumPriorityItems = mockPunchItems.filter(item => item.priority === 'medium' && item.status !== 'verified').length
  const lowPriorityItems = mockPunchItems.filter(item => item.priority === 'low' && item.status !== 'verified').length

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
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {totalItems} total items | {openItems} open | {inProgressItems} in progress
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="grid grid-cols-6 gap-3">
          <StatCard
            icon={CircleDot}
            label="Total Items"
            value={totalItems}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={CheckCircle2}
            label="Complete"
            value={`${completePercent}%`}
            subValue={`${completeItems} of ${totalItems}`}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={CircleDot}
            label="Open"
            value={openItems}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            icon={AlertCircle}
            label="High Priority"
            value={highPriorityItems}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            icon={Clock}
            label="Medium Priority"
            value={mediumPriorityItems}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            icon={CircleDot}
            label="Low Priority"
            value={lowPriorityItems}
            iconColor="text-gray-500"
            iconBg="bg-gray-100"
          />
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
            { key: 'in_progress', label: 'In Progress', count: mockPunchItems.filter(i => i.status === 'in_progress').length },
            { key: 'complete', label: 'Complete', count: mockPunchItems.filter(i => i.status === 'complete').length },
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
              label: 'All Assignees',
              value: filterAssignee,
              options: assignees.map(a => ({ value: a, label: a })),
              onChange: setFilterAssignee,
            },
          ]}
          sortOptions={[
            { value: 'description', label: 'Description' },
            { value: 'room', label: 'Room' },
            { value: 'priority', label: 'Priority' },
            { value: 'assignedTo', label: 'Assignee' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'Add Item', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredItems.length}
          totalCount={mockPunchItems.length}
        />
      </div>

      {/* Punch Items by Room */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(itemsByRoom).map(([room, items]) => {
          const isExpanded = expandedRooms.has(room)
          const roomComplete = items.filter(i => i.status === 'complete' || i.status === 'verified').length
          const roomTotal = items.length

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
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{roomComplete}/{roomTotal} complete</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
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
          <p className="text-sm text-amber-700">
            Based on current completion rate, punch list will be cleared in ~3 days.
            Mike typically resolves 4 items/day - consider reassigning 2 high-priority items to balance workload.
            Kitchen cabinet alignment usually requires follow-up 15% of the time.
          </p>
        </div>
      </div>
    </div>
  )
}
