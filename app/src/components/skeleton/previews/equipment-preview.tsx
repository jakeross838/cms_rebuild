'use client'

import { useState } from 'react'
import {
  Plus,
  Sparkles,
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  MapPin,
  User,
  Clock,
  MoreHorizontal,
  Calendar,
  DollarSign,
  QrCode,
  Settings,
  PenTool,
  Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Equipment {
  id: string
  name: string
  assetTag: string
  category: 'Vehicle' | 'Heavy Equipment' | 'Power Tool' | 'Hand Tool' | 'Safety'
  make: string
  model: string
  status: 'available' | 'in-use' | 'maintenance' | 'retired'
  currentJob?: string
  assignedTo?: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNote?: string
  usage?: string
  aiNote?: string
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: '2023 Ford F-250',
    assetTag: 'ROSS-01',
    category: 'Vehicle',
    make: 'Ford',
    model: 'F-250 Super Duty',
    status: 'in-use',
    currentJob: 'Smith Residence',
    assignedTo: 'Mike Rodriguez',
    purchaseDate: 'Jan 2023',
    purchasePrice: 65000,
    currentValue: 55000,
    lastMaintenance: 'Jan 15, 2026',
    nextMaintenance: 'Feb 15, 2026',
    usage: '12,450 miles',
  },
  {
    id: '2',
    name: '2022 Ford Transit',
    assetTag: 'ROSS-02',
    category: 'Vehicle',
    make: 'Ford',
    model: 'Transit 250',
    status: 'in-use',
    currentJob: 'Johnson Beach House',
    assignedTo: 'Carlos Mendez',
    purchaseDate: 'Mar 2022',
    purchasePrice: 45000,
    currentValue: 35000,
    lastMaintenance: 'Dec 20, 2025',
    nextMaintenance: 'Mar 20, 2026',
    usage: '28,200 miles',
  },
  {
    id: '3',
    name: 'Bobcat S650 Skid Steer',
    assetTag: 'ROSS-10',
    category: 'Heavy Equipment',
    make: 'Bobcat',
    model: 'S650',
    status: 'available',
    purchaseDate: 'Jun 2021',
    purchasePrice: 52000,
    currentValue: 38000,
    lastMaintenance: 'Jan 5, 2026',
    nextMaintenance: 'In 50 hours',
    maintenanceNote: 'Maintenance due in 50 hours',
    usage: '850 hours',
    aiNote: 'At 40% utilization - consider rental vs ownership analysis',
  },
  {
    id: '4',
    name: 'Cat 303 Mini Excavator',
    assetTag: 'ROSS-11',
    category: 'Heavy Equipment',
    make: 'Caterpillar',
    model: '303 CR',
    status: 'in-use',
    currentJob: 'Harbor View Custom',
    assignedTo: 'Tom Williams',
    purchaseDate: 'Aug 2022',
    purchasePrice: 68000,
    currentValue: 52000,
    lastMaintenance: 'Feb 1, 2026',
    usage: '620 hours',
  },
  {
    id: '5',
    name: 'Generator 7500W',
    assetTag: 'ROSS-20',
    category: 'Heavy Equipment',
    make: 'Honda',
    model: 'EU7000iS',
    status: 'maintenance',
    purchaseDate: 'Apr 2020',
    purchasePrice: 4500,
    currentValue: 2800,
    lastMaintenance: 'Jan 25, 2026',
    maintenanceNote: 'Oil change and filter replacement in progress',
    usage: '500 hours',
  },
  {
    id: '6',
    name: 'DeWalt Laser Level',
    assetTag: 'TOOL-045',
    category: 'Power Tool',
    make: 'DeWalt',
    model: 'DW089K',
    status: 'in-use',
    currentJob: 'Smith Residence',
    assignedTo: 'Mike Rodriguez',
    purchaseDate: 'Sep 2023',
    purchasePrice: 450,
    currentValue: 350,
    aiNote: 'Last checked out Jan 15 - confirm still at Smith job',
  },
  {
    id: '7',
    name: 'Milwaukee M18 Drill Kit',
    assetTag: 'TOOL-052',
    category: 'Power Tool',
    make: 'Milwaukee',
    model: 'M18 Fuel',
    status: 'available',
    purchaseDate: 'Nov 2023',
    purchasePrice: 380,
    currentValue: 300,
  },
  {
    id: '8',
    name: 'Dewalt Table Saw',
    assetTag: 'TOOL-030',
    category: 'Power Tool',
    make: 'DeWalt',
    model: 'DWE7491RS',
    status: 'in-use',
    currentJob: 'Johnson Beach House',
    assignedTo: 'Carlos Mendez',
    purchaseDate: 'Feb 2022',
    purchasePrice: 650,
    currentValue: 450,
  },
]

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'in-use': { label: 'In Use', color: 'bg-blue-100 text-blue-700', icon: MapPin },
  maintenance: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700', icon: Wrench },
  retired: { label: 'Retired', color: 'bg-gray-100 text-gray-500', icon: Settings },
}

const categoryConfig = {
  Vehicle: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Heavy Equipment': { icon: Settings, color: 'text-amber-600', bg: 'bg-amber-100' },
  'Power Tool': { icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-100' },
  'Hand Tool': { icon: Wrench, color: 'text-gray-600', bg: 'bg-gray-100' },
  Safety: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
}

function formatCurrency(value: number): string {
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const statusCfg = statusConfig[equipment.status]
  const categoryCfg = categoryConfig[equipment.category]
  const StatusIcon = statusCfg.icon
  const CategoryIcon = categoryCfg.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      equipment.status === 'maintenance' && "border-amber-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", categoryCfg.bg)}>
            <CategoryIcon className={cn("h-5 w-5", categoryCfg.color)} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{equipment.name}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
              <span className="font-mono">{equipment.assetTag}</span>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        {equipment.make} {equipment.model}
      </div>

      {equipment.currentJob && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{equipment.currentJob}</span>
        </div>
      )}

      {equipment.assignedTo && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{equipment.assignedTo}</span>
        </div>
      )}

      {equipment.usage && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Gauge className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{equipment.usage}</span>
        </div>
      )}

      {equipment.maintenanceNote && (
        <div className="mb-3 p-2 rounded bg-amber-50 flex items-start gap-2 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="text-amber-700">{equipment.maintenanceNote}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", statusCfg.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusCfg.label}
        </div>
        <div className="flex items-center gap-2">
          {equipment.nextMaintenance && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {equipment.nextMaintenance}
            </span>
          )}
        </div>
      </div>

      {equipment.aiNote && (
        <div className="mt-3 p-2 rounded-md bg-blue-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
          <span className="text-blue-700">{equipment.aiNote}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {equipment.status === 'available' && (
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            <MapPin className="h-3.5 w-3.5" />
            Assign to Job
          </button>
        )}
        {equipment.status === 'in-use' && (
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
            <CheckCircle className="h-3.5 w-3.5" />
            Check In
          </button>
        )}
        <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          <QrCode className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function EquipmentPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const filteredEquipment = sortItems(
    mockEquipment.filter(equipment => {
      if (!matchesSearch(equipment, search, ['name', 'assetTag', 'make', 'model', 'currentJob', 'assignedTo'])) return false
      const categoryMatch = activeTab === 'all' || equipment.category === activeTab
      const statusMatch = selectedStatus === 'All' || equipment.status === selectedStatus.toLowerCase().replace(' ', '-')
      return categoryMatch && statusMatch
    }),
    activeSort as keyof Equipment | '',
    sortDirection,
  )

  // Calculate stats
  const totalEquipment = mockEquipment.length
  const totalValue = mockEquipment.reduce((sum, e) => sum + e.currentValue, 0)
  const availableCount = mockEquipment.filter(e => e.status === 'available').length
  const inUseCount = mockEquipment.filter(e => e.status === 'in-use').length
  const maintenanceCount = mockEquipment.filter(e => e.status === 'maintenance').length
  const needsMaintenanceCount = mockEquipment.filter(e => e.maintenanceNote).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Equipment & Assets</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {totalEquipment} assets
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Track company equipment, tools, and vehicles
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Settings className="h-4 w-4" />
              Total Assets
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalEquipment}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Value
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Available
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{availableCount}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <MapPin className="h-4 w-4" />
              In Use
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{inUseCount}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            maintenanceCount > 0 ? "bg-amber-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              maintenanceCount > 0 ? "text-amber-600" : "text-gray-500"
            )}>
              <Wrench className="h-4 w-4" />
              Maintenance
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              maintenanceCount > 0 ? "text-amber-700" : "text-gray-900"
            )}>
              {maintenanceCount}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            needsMaintenanceCount > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              needsMaintenanceCount > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Needs Service
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              needsMaintenanceCount > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {needsMaintenanceCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search equipment..."
          tabs={[
            { key: 'all', label: 'All', count: mockEquipment.length },
            { key: 'Vehicle', label: 'Vehicle', count: mockEquipment.filter(e => e.category === 'Vehicle').length },
            { key: 'Heavy Equipment', label: 'Heavy Equipment', count: mockEquipment.filter(e => e.category === 'Heavy Equipment').length },
            { key: 'Power Tool', label: 'Power Tool', count: mockEquipment.filter(e => e.category === 'Power Tool').length },
            { key: 'Hand Tool', label: 'Hand Tool', count: mockEquipment.filter(e => e.category === 'Hand Tool').length },
            { key: 'Safety', label: 'Safety', count: mockEquipment.filter(e => e.category === 'Safety').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Statuses',
              value: selectedStatus,
              options: [
                { value: 'Available', label: 'Available' },
                { value: 'In Use', label: 'In Use' },
                { value: 'Maintenance', label: 'Maintenance' },
              ],
              onChange: setSelectedStatus,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'category', label: 'Category' },
            { value: 'currentValue', label: 'Value' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'Add Asset', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredEquipment.length}
          totalCount={mockEquipment.length}
        />
      </div>

      {/* Equipment Grid */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filteredEquipment.map(equipment => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEquipment.map(equipment => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        )}
        {filteredEquipment.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No equipment matches the current filters</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Asset Intelligence:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span>Bobcat S650 at 40% utilization - rental may be more cost-effective</span>
            <span className="text-amber-400">|</span>
            <span>Generator needs oil change in 50 hours based on usage pattern</span>
            <span className="text-amber-400">|</span>
            <span>Laser level checked out 4 weeks ago - confirm still at Smith job</span>
          </div>
        </div>
      </div>
    </div>
  )
}
