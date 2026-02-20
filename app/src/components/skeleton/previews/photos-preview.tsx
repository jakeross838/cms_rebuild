'use client'

import { useState } from 'react'
import {
  Upload,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  Tag,
  Home,
  Download,
  Trash2,
  Image,
  Plus,
  Star,
  Eye,
  EyeOff,
  Camera,
  Clock,
  Brain,
  Share2,
  MapPin,
  Layers,
  Award,
  AlertTriangle,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

interface Photo {
  id: string
  date: string
  phase: string
  trade: string
  room: string
  color: string
  qualityScore: number
  clientSuitable: boolean
  isMilestone: boolean
  milestoneType?: string
  isDuplicate: boolean
  dailyLogId?: string
  punchItemId?: string
  uploadedBy: string
  aiCaption: string
  gpsLat?: number
  gpsLng?: number
  selected?: boolean
}

const mockPhotos: Photo[] = [
  {
    id: '1',
    date: '2026-02-12',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Roof - North Side',
    color: 'bg-amber-400',
    qualityScore: 0.94,
    clientSuitable: true,
    isMilestone: false,
    isDuplicate: false,
    dailyLogId: 'LOG-020',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Roof sheathing installation in progress, north elevation',
  },
  {
    id: '2',
    date: '2026-02-12',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Roof - North Side',
    color: 'bg-amber-500',
    qualityScore: 0.91,
    clientSuitable: true,
    isMilestone: true,
    milestoneType: 'sheathing_complete',
    isDuplicate: false,
    dailyLogId: 'LOG-020',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'North roof sheathing nearing completion -- milestone shot',
  },
  {
    id: '3',
    date: '2026-02-12',
    phase: 'Rough-In',
    trade: 'Waterproofing',
    room: 'Exterior - Windows',
    color: 'bg-stone-300',
    qualityScore: 0.87,
    clientSuitable: false,
    isMilestone: false,
    isDuplicate: false,
    dailyLogId: 'LOG-020',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Window flashing installation detail',
  },
  {
    id: '4',
    date: '2026-02-11',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Roof - Hip Rafters',
    color: 'bg-amber-300',
    qualityScore: 0.93,
    clientSuitable: true,
    isMilestone: false,
    isDuplicate: false,
    dailyLogId: 'LOG-019',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Hip rafter installation, looking northeast',
  },
  {
    id: '5',
    date: '2026-02-11',
    phase: 'Rough-In',
    trade: 'Electrical',
    room: 'Garage',
    color: 'bg-amber-300',
    qualityScore: 0.88,
    clientSuitable: false,
    isMilestone: false,
    isDuplicate: false,
    dailyLogId: 'LOG-019',
    uploadedBy: 'Tom Wilson',
    aiCaption: 'Electrical panel set in garage -- 200A service',
  },
  {
    id: '6',
    date: '2026-02-10',
    phase: 'Rough-In',
    trade: 'Electrical',
    room: 'Master Bedroom',
    color: 'bg-amber-400',
    qualityScore: 0.82,
    clientSuitable: false,
    isMilestone: false,
    isDuplicate: false,
    dailyLogId: 'LOG-018',
    uploadedBy: 'Tom Wilson',
    aiCaption: 'Electrical rough-in, master bedroom wall -- junction boxes installed',
  },
  {
    id: '7',
    date: '2026-02-09',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Roof - Ridge Beam',
    color: 'bg-orange-400',
    qualityScore: 0.96,
    clientSuitable: true,
    isMilestone: true,
    milestoneType: 'ridge_beam_set',
    isDuplicate: false,
    dailyLogId: 'LOG-017',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Ridge beam set -- roof framing milestone',
    gpsLat: 26.1234,
    gpsLng: -80.5678,
  },
  {
    id: '8',
    date: '2026-02-09',
    phase: 'Rough-In',
    trade: 'Plumbing',
    room: 'Master Bath',
    color: 'bg-stone-400',
    qualityScore: 0.90,
    clientSuitable: true,
    isMilestone: true,
    milestoneType: 'plumbing_topout',
    isDuplicate: false,
    dailyLogId: 'LOG-017',
    uploadedBy: 'Tom Wilson',
    aiCaption: 'Plumbing top-out complete, master bathroom',
  },
  {
    id: '9',
    date: '2026-02-09',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Staging Area',
    color: 'bg-warm-400',
    qualityScore: 0.62,
    clientSuitable: false,
    isMilestone: false,
    isDuplicate: false,
    dailyLogId: 'LOG-017',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Rafters staged for installation -- equipment in foreground',
  },
  {
    id: '10',
    date: '2026-02-07',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Exterior - Full House',
    color: 'bg-amber-500',
    qualityScore: 0.97,
    clientSuitable: true,
    isMilestone: true,
    milestoneType: 'walls_complete',
    isDuplicate: false,
    dailyLogId: 'LOG-016',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'All wall framing complete -- major milestone, full exterior view',
    gpsLat: 26.1234,
    gpsLng: -80.5679,
  },
  {
    id: '11',
    date: '2026-02-07',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Exterior - Full House',
    color: 'bg-amber-400',
    qualityScore: 0.78,
    clientSuitable: false,
    isMilestone: false,
    isDuplicate: true,
    dailyLogId: 'LOG-016',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Duplicate of photo #10 -- similar angle',
  },
  {
    id: '12',
    date: '2026-02-07',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Interior - Bedrooms',
    color: 'bg-orange-300',
    qualityScore: 0.85,
    clientSuitable: true,
    isMilestone: false,
    isDuplicate: false,
    uploadedBy: 'Tom Wilson',
    aiCaption: 'Interior wall framing, bedrooms 2 and 3',
  },
  {
    id: '13',
    date: '2026-02-06',
    phase: 'Foundation',
    trade: 'Concrete',
    room: 'Exterior - Front',
    color: 'bg-warm-500',
    qualityScore: 0.91,
    clientSuitable: true,
    isMilestone: false,
    isDuplicate: false,
    punchItemId: 'PL-003',
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Foundation crack noted near front entry -- punch list item documented',
  },
  {
    id: '14',
    date: '2026-02-05',
    phase: 'Framing',
    trade: 'Framing',
    room: 'Kitchen',
    color: 'bg-amber-200',
    qualityScore: 0.45,
    clientSuitable: false,
    isMilestone: false,
    isDuplicate: false,
    uploadedBy: 'Mike Johnson',
    aiCaption: 'Kitchen framing -- poor lighting, image quality below threshold',
  },
]

const phases = ['Foundation', 'Framing', 'Rough-In', 'Insulation', 'Drywall', 'Finish']
const trades = ['Framing', 'Electrical', 'Plumbing', 'Waterproofing', 'Concrete', 'HVAC']
const rooms = [
  'Exterior - Full House', 'Exterior - Front', 'Exterior - Windows',
  'Roof - North Side', 'Roof - Hip Rafters', 'Roof - Ridge Beam',
  'Master Bedroom', 'Master Bath', 'Kitchen', 'Garage',
  'Interior - Bedrooms', 'Staging Area',
]

const phaseColors: Record<string, string> = {
  'Foundation': 'bg-warm-100 text-warm-700',
  'Framing': 'bg-amber-100 text-amber-700',
  'Rough-In': 'bg-amber-100 text-amber-700',
  'Electrical': 'bg-amber-100 text-amber-700',
  'Plumbing': 'bg-stone-100 text-stone-700',
  'Insulation': 'bg-warm-100 text-sand-700',
  'Drywall': 'bg-warm-100 text-warm-700',
  'Finish': 'bg-green-100 text-green-700',
}

const tradeColors: Record<string, string> = {
  'Framing': 'bg-amber-50 text-amber-600',
  'Electrical': 'bg-amber-50 text-amber-600',
  'Plumbing': 'bg-stone-50 text-stone-600',
  'Waterproofing': 'bg-stone-50 text-stone-600',
  'Concrete': 'bg-warm-50 text-warm-600',
  'HVAC': 'bg-stone-50 text-stone-600',
}

function PhotoCard({
  photo,
  isSelected,
  onToggleSelect,
  bulkSelectMode
}: {
  photo: Photo
  isSelected: boolean
  onToggleSelect: () => void
  bulkSelectMode: boolean
}) {
  return (
    <div
      className={cn(
        "relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
        isSelected ? "border-stone-500 ring-2 ring-stone-200" : "border-transparent hover:border-warm-300",
        photo.isDuplicate && "opacity-50",
      )}
      onClick={bulkSelectMode ? onToggleSelect : undefined}
    >
      {/* Placeholder thumbnail */}
      <div className={cn("aspect-square", photo.color)}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Image className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {!bulkSelectMode && (
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white text-warm-900 text-sm rounded-lg font-medium hover:bg-warm-100">
                View
              </button>
              <button className="p-1.5 bg-warm-50 text-warm-700 rounded-lg hover:bg-white">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selection checkbox */}
      {bulkSelectMode && (
        <div className="absolute top-2 left-2">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-stone-500 bg-white rounded" />
          ) : (
            <Square className="h-5 w-5 text-warm-400 bg-warm-50 rounded" />
          )}
        </div>
      )}

      {/* Top-right badges */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {photo.isMilestone && (
          <span className="bg-amber-400 text-amber-900 p-1 rounded">
            <Award className="h-3.5 w-3.5" />
          </span>
        )}
        {photo.clientSuitable && (
          <span className="bg-green-400 text-white p-1 rounded">
            <Eye className="h-3.5 w-3.5" />
          </span>
        )}
        {photo.isDuplicate && (
          <span className="bg-red-400 text-white p-1 rounded">
            <Layers className="h-3.5 w-3.5" />
          </span>
        )}
        {photo.qualityScore < 0.6 && (
          <span className="bg-red-500 text-white p-1 rounded">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", phaseColors[photo.phase] || 'bg-warm-100 text-warm-700')}>
            {photo.phase}
          </span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", tradeColors[photo.trade] || 'bg-warm-50 text-warm-600')}>
            {photo.trade}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/90">
          <Home className="h-3 w-3" />
          <span className="truncate">{photo.room}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 text-xs text-white/70">
            <Calendar className="h-3 w-3" />
            <span>{new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {/* Cross-module links */}
          <div className="flex items-center gap-1">
            {photo.dailyLogId && (
              <span className="text-[10px] bg-stone-500/80 text-white px-1 py-0.5 rounded">
                {photo.dailyLogId}
              </span>
            )}
            {photo.punchItemId && (
              <span className="text-[10px] bg-sand-500/80 text-white px-1 py-0.5 rounded">
                {photo.punchItemId}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhotosPreview() {
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [tradeFilter, setTradeFilter] = useState('all')
  const [qualityFilter, setQualityFilter] = useState('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const togglePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPhotos(new Set())
  }

  const filteredPhotos = sortItems(
    mockPhotos.filter(photo => {
      if (!matchesSearch(photo, search, ['phase', 'room', 'trade', 'aiCaption'])) return false
      if (tradeFilter !== 'all' && photo.trade !== tradeFilter) return false
      if (qualityFilter !== 'all') {
        if (qualityFilter === 'High Quality' && photo.qualityScore < 0.85) return false
        if (qualityFilter === 'Client Ready' && !photo.clientSuitable) return false
        if (qualityFilter === 'Milestones' && !photo.isMilestone) return false
        if (qualityFilter === 'Low Quality' && photo.qualityScore >= 0.6) return false
        if (qualityFilter === 'Duplicates' && !photo.isDuplicate) return false
      }
      if (activeTab !== 'all' && photo.phase !== activeTab) return false
      return true
    }),
    activeSort as keyof Photo | '',
    sortDirection,
  )

  // Stats
  const totalPhotos = mockPhotos.length
  const clientReadyCount = mockPhotos.filter(p => p.clientSuitable).length
  const milestoneCount = mockPhotos.filter(p => p.isMilestone).length
  const duplicateCount = mockPhotos.filter(p => p.isDuplicate).length
  const lowQualityCount = mockPhotos.filter(p => p.qualityScore < 0.6).length
  const avgQuality = Math.round((mockPhotos.reduce((sum, p) => sum + p.qualityScore, 0) / totalPhotos) * 100)
  const fromDailyLogs = mockPhotos.filter(p => p.dailyLogId).length
  const linkedToPunchList = mockPhotos.filter(p => p.punchItemId).length

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Project Photos</h3>
          <span className="text-sm text-warm-500">{totalPhotos} photos | Last upload: Feb 12, 2026</span>
          {milestoneCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
              <Award className="h-3 w-3" />
              {milestoneCount} milestones
            </span>
          )}
          {duplicateCount > 0 && (
            <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded">
              {duplicateCount} duplicate{duplicateCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search photos by phase, trade, room, or caption..."
          tabs={[
            { key: 'all', label: 'All', count: mockPhotos.length },
            ...phases.filter(phase => mockPhotos.some(p => p.phase === phase)).map(phase => ({
              key: phase,
              label: phase,
              count: mockPhotos.filter(p => p.phase === phase).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Trades',
              value: tradeFilter,
              options: trades.filter(t => mockPhotos.some(p => p.trade === t)).map(t => ({ value: t, label: t })),
              onChange: setTradeFilter,
            },
            {
              label: 'All Quality',
              value: qualityFilter,
              options: [
                { value: 'High Quality', label: 'High Quality (85%+)' },
                { value: 'Client Ready', label: 'Client Ready' },
                { value: 'Milestones', label: 'Milestones Only' },
                { value: 'Low Quality', label: 'Low Quality (<60%)' },
                { value: 'Duplicates', label: 'Duplicates' },
              ],
              onChange: setQualityFilter,
            },
          ]}
          sortOptions={[
            { value: 'date', label: 'Date' },
            { value: 'phase', label: 'Phase' },
            { value: 'trade', label: 'Trade' },
            { value: 'room', label: 'Room' },
            { value: 'qualityScore', label: 'Quality Score' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Share2, label: 'Share Album', onClick: () => {} },
            { icon: Upload, label: 'Upload Photos', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredPhotos.length}
          totalCount={mockPhotos.length}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-warm-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-warm-900">{totalPhotos}</div>
            <div className="text-xs text-warm-500">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-700">{clientReadyCount}</div>
            <div className="text-xs text-green-600">Client Ready</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-amber-700">{milestoneCount}</div>
            <div className="text-xs text-amber-600">Milestones</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-stone-700">{avgQuality}%</div>
            <div className="text-xs text-stone-600">Avg Quality</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-stone-700">{fromDailyLogs}</div>
            <div className="text-xs text-stone-600">From Logs</div>
          </div>
          <div className={cn("rounded-lg p-2 text-center", lowQualityCount > 0 ? "bg-red-50" : "bg-warm-50")}>
            <div className={cn("text-lg font-bold", lowQualityCount > 0 ? "text-red-700" : "text-warm-700")}>{lowQualityCount}</div>
            <div className={cn("text-xs", lowQualityCount > 0 ? "text-red-600" : "text-warm-500")}>Low Quality</div>
          </div>
        </div>
      </div>

      {/* Bulk Select Toggle Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBulkSelectMode(!bulkSelectMode)
              if (bulkSelectMode) {
                deselectAll()
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
              bulkSelectMode
                ? "bg-stone-100 text-stone-700 border border-stone-200"
                : "text-warm-600 border border-warm-200 hover:bg-warm-50"
            )}
          >
            <CheckSquare className="h-4 w-4" />
            Bulk Select
          </button>
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-warm-500">
            <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-amber-500" /> Milestone</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-green-500" /> Client Ready</span>
            <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-red-400" /> Duplicate</span>
            <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Low Quality</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <Camera className="h-3.5 w-3.5" />
          {linkedToPunchList > 0 && <span>{linkedToPunchList} linked to punch list</span>}
        </div>
      </div>

      {/* Bulk Actions Bar (when in bulk select mode) */}
      {bulkSelectMode && (
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-700 font-medium">
              {selectedPhotos.size} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-stone-600 hover:text-stone-800 underline"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="text-sm text-stone-600 hover:text-stone-800 underline"
            >
              Deselect All
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg",
                selectedPhotos.size > 0
                  ? "text-green-600 border border-green-200 hover:bg-green-50"
                  : "text-warm-400 border border-warm-200 cursor-not-allowed"
              )}
              disabled={selectedPhotos.size === 0}
            >
              <Eye className="h-4 w-4" />
              Mark Client Ready
            </button>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg",
                selectedPhotos.size > 0
                  ? "text-warm-600 border border-warm-200 hover:bg-white"
                  : "text-warm-400 border border-warm-200 cursor-not-allowed"
              )}
              disabled={selectedPhotos.size === 0}
            >
              <Tag className="h-4 w-4" />
              Tag
            </button>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg",
                selectedPhotos.size > 0
                  ? "text-warm-600 border border-warm-200 hover:bg-white"
                  : "text-warm-400 border border-warm-200 cursor-not-allowed"
              )}
              disabled={selectedPhotos.size === 0}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg",
                selectedPhotos.size > 0
                  ? "text-red-600 border border-red-200 hover:bg-red-50"
                  : "text-warm-400 border border-warm-200 cursor-not-allowed"
              )}
              disabled={selectedPhotos.size === 0}
            >
              <Trash2 className="h-4 w-4" />
              Archive
            </button>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="p-4 max-h-[450px] overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          {filteredPhotos.map(photo => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isSelected={selectedPhotos.has(photo.id)}
              onToggleSelect={() => togglePhotoSelect(photo.id)}
              bulkSelectMode={bulkSelectMode}
            />
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-12 text-warm-400">
            <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No photos match your filters</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Photo Intelligence:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" />
              {totalPhotos} photos auto-tagged by trade, phase, and room
            </span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''} detected (ridge beam, walls complete, plumbing top-out)
            </span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {clientReadyCount} photos selected for client portal
            </span>
            <span className="text-amber-400">|</span>
            <span>{duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} detected, {lowQualityCount} low-quality filtered</span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Photo Features"
          columns={2}
          features={[
            {
              feature: 'Auto-Captioning',
              trigger: 'On creation',
              insight: 'AI generates construction-context captions for uploaded photos, describing work progress, materials, and location.',
              severity: 'info',
            },
            {
              feature: 'Phase/Trade Detection',
              trigger: 'On creation',
              insight: 'Automatically tags photos based on visual content, identifying construction phase and trade from image analysis.',
              severity: 'info',
            },
            {
              feature: 'Quality Scoring',
              trigger: 'Real-time',
              insight: `Identifies blurry, dark, or duplicate images. ${lowQualityCount} low-quality photos flagged for review.`,
              severity: lowQualityCount > 0 ? 'warning' : 'success',
            },
            {
              feature: 'Client-Suitable Filtering',
              trigger: 'On creation',
              insight: `Flags photos safe for client sharing based on content analysis. ${clientReadyCount} of ${totalPhotos} photos marked client-ready.`,
              severity: 'success',
            },
            {
              feature: 'Milestone Detection',
              trigger: 'On creation',
              insight: `Identifies milestone-worthy shots documenting key project progress. ${milestoneCount} milestone photos detected.`,
              severity: milestoneCount > 0 ? 'success' : 'info',
            },
            {
              feature: 'Duplicate Detection',
              trigger: 'Real-time',
              insight: `Groups similar photos to reduce clutter and storage. ${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} identified.`,
              severity: duplicateCount > 0 ? 'warning' : 'success',
            },
          ]}
        />
      </div>
    </div>
  )
}
