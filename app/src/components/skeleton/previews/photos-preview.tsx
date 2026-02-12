'use client'

import { useState } from 'react'
import {
  Upload,
  Filter,
  Calendar,
  Grid3X3,
  List,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  ChevronDown,
  Image,
  Tag,
  Home,
  Download,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  date: string
  phase: string
  room: string
  color: string
  selected?: boolean
}

const mockPhotos: Photo[] = [
  { id: '1', date: '2024-01-15', phase: 'Foundation', room: 'Exterior - Front', color: 'bg-slate-400' },
  { id: '2', date: '2024-01-15', phase: 'Foundation', room: 'Exterior - Side', color: 'bg-slate-500' },
  { id: '3', date: '2024-01-16', phase: 'Foundation', room: 'Exterior - Rear', color: 'bg-gray-400' },
  { id: '4', date: '2024-01-18', phase: 'Framing', room: 'Living Room', color: 'bg-amber-300' },
  { id: '5', date: '2024-01-18', phase: 'Framing', room: 'Master Bedroom', color: 'bg-amber-400' },
  { id: '6', date: '2024-01-19', phase: 'Framing', room: 'Kitchen', color: 'bg-orange-300' },
  { id: '7', date: '2024-01-20', phase: 'Framing', room: 'Bathroom', color: 'bg-orange-400' },
  { id: '8', date: '2024-01-22', phase: 'Electrical', room: 'Living Room', color: 'bg-yellow-300' },
  { id: '9', date: '2024-01-22', phase: 'Electrical', room: 'Kitchen', color: 'bg-yellow-400' },
  { id: '10', date: '2024-01-23', phase: 'Plumbing', room: 'Bathroom', color: 'bg-blue-300' },
  { id: '11', date: '2024-01-23', phase: 'Plumbing', room: 'Kitchen', color: 'bg-blue-400' },
  { id: '12', date: '2024-01-25', phase: 'Drywall', room: 'Master Bedroom', color: 'bg-purple-300' },
]

const phases = ['All Phases', 'Foundation', 'Framing', 'Electrical', 'Plumbing', 'Drywall', 'Finish']
const rooms = ['All Rooms', 'Exterior - Front', 'Exterior - Side', 'Exterior - Rear', 'Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom']
const dateRanges = ['All Dates', 'Today', 'This Week', 'This Month', 'Custom Range']

const phaseColors: Record<string, string> = {
  'Foundation': 'bg-gray-100 text-gray-700',
  'Framing': 'bg-amber-100 text-amber-700',
  'Electrical': 'bg-yellow-100 text-yellow-700',
  'Plumbing': 'bg-blue-100 text-blue-700',
  'Drywall': 'bg-purple-100 text-purple-700',
  'Finish': 'bg-green-100 text-green-700',
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
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
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
            <button className="px-3 py-1.5 bg-white text-gray-900 text-sm rounded-lg font-medium hover:bg-gray-100">
              View
            </button>
          )}
        </div>
      </div>

      {/* Selection checkbox */}
      {bulkSelectMode && (
        <div className="absolute top-2 left-2">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-500 bg-white rounded" />
          ) : (
            <Square className="h-5 w-5 text-gray-400 bg-white/80 rounded" />
          )}
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", phaseColors[photo.phase] || 'bg-gray-100 text-gray-700')}>
            {photo.phase}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/90">
          <Home className="h-3 w-3" />
          <span className="truncate">{photo.room}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/70 mt-0.5">
          <Calendar className="h-3 w-3" />
          <span>{new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  )
}

export function PhotosPreview() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [selectedPhase, setSelectedPhase] = useState('All Phases')
  const [selectedRoom, setSelectedRoom] = useState('All Rooms')
  const [selectedDate, setSelectedDate] = useState('All Dates')

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
    setSelectedPhotos(new Set(mockPhotos.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPhotos(new Set())
  }

  const filteredPhotos = mockPhotos.filter(photo => {
    if (selectedPhase !== 'All Phases' && photo.phase !== selectedPhase) return false
    if (selectedRoom !== 'All Rooms' && photo.room !== selectedRoom) return false
    return true
  })

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Project Photos</h3>
              <span className="text-sm text-gray-500">145 photos</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Smith Residence | Last upload: Jan 25, 2024
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Upload Photos
            </button>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              {selectedDate}
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Phase Filter */}
          <div className="relative">
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="appearance-none flex items-center gap-1.5 px-3 py-1.5 pr-8 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {phases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
            <Tag className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Room Filter */}
          <div className="relative">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="appearance-none flex items-center gap-1.5 px-3 py-1.5 pr-8 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <Home className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Select Toggle */}
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
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            <CheckSquare className="h-4 w-4" />
            Bulk Select
          </button>

          {/* View Mode Toggle */}
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
        </div>
      </div>

      {/* Bulk Actions Bar (when in bulk select mode) */}
      {bulkSelectMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-700 font-medium">
              {selectedPhotos.size} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Deselect All
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg",
                selectedPhotos.size > 0
                  ? "text-gray-600 border border-gray-200 hover:bg-white"
                  : "text-gray-400 border border-gray-200 cursor-not-allowed"
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
                  : "text-gray-400 border border-gray-200 cursor-not-allowed"
              )}
              disabled={selectedPhotos.size === 0}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="p-4 max-h-96 overflow-y-auto">
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
          <div className="text-center py-12 text-gray-400">
            <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No photos match your filters</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            AI auto-tagged 145 photos by room and phase. 12 photos detected as progress milestones. 3 potential safety concerns flagged for review.
          </p>
        </div>
      </div>
    </div>
  )
}
