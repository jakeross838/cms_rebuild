'use client'

import { useState } from 'react'
import {
  Upload,
  Download,
  MoreHorizontal,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  ChevronRight,
  Calendar,
  User,
  HardDrive,
  Sparkles,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface DocumentFile {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'xls' | 'jpg' | 'png' | 'zip' | 'dwg' | 'other'
  size: string
  sizeBytes: number
  dateModified: string
  uploadedBy: string
  category: string
  aiNote?: string
}

interface FolderItem {
  id: string
  name: string
  filesCount: number
  color: string
}

const mockFolders: FolderItem[] = [
  { id: '1', name: 'Plans', filesCount: 24, color: 'bg-blue-100 text-blue-600' },
  { id: '2', name: 'Permits', filesCount: 12, color: 'bg-green-100 text-green-600' },
  { id: '3', name: 'Contracts', filesCount: 8, color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Photos', filesCount: 156, color: 'bg-amber-100 text-amber-600' },
  { id: '5', name: 'Specs', filesCount: 18, color: 'bg-red-100 text-red-600' },
  { id: '6', name: 'Invoices', filesCount: 32, color: 'bg-teal-100 text-teal-600' },
]

const mockFiles: DocumentFile[] = [
  {
    id: '1',
    name: 'Foundation_Plan_Rev3.pdf',
    type: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2516582,
    dateModified: '2024-11-08',
    uploadedBy: 'John Smith',
    category: 'Plans',
  },
  {
    id: '2',
    name: 'Building_Permit_Approved.pdf',
    type: 'pdf',
    size: '1.2 MB',
    sizeBytes: 1258291,
    dateModified: '2024-11-06',
    uploadedBy: 'Mike Johnson',
    category: 'Permits',
    aiNote: 'Permit expires in 45 days - renewal recommended',
  },
  {
    id: '3',
    name: 'General_Contract_v2.doc',
    type: 'doc',
    size: '856 KB',
    sizeBytes: 876544,
    dateModified: '2024-11-05',
    uploadedBy: 'Sarah Davis',
    category: 'Contracts',
  },
  {
    id: '4',
    name: 'Site_Survey_2024.dwg',
    type: 'dwg',
    size: '8.7 MB',
    sizeBytes: 9122611,
    dateModified: '2024-11-04',
    uploadedBy: 'Tom Wilson',
    category: 'Plans',
  },
  {
    id: '5',
    name: 'Material_Specifications.xls',
    type: 'xls',
    size: '524 KB',
    sizeBytes: 536576,
    dateModified: '2024-11-03',
    uploadedBy: 'Lisa Brown',
    category: 'Specs',
  },
  {
    id: '6',
    name: 'Electrical_Layout_Final.pdf',
    type: 'pdf',
    size: '3.1 MB',
    sizeBytes: 3250586,
    dateModified: '2024-11-02',
    uploadedBy: 'John Smith',
    category: 'Plans',
    aiNote: 'References outdated panel specs - verify with electrician',
  },
  {
    id: '7',
    name: 'Project_Photos_Week12.zip',
    type: 'zip',
    size: '45.2 MB',
    sizeBytes: 47395635,
    dateModified: '2024-11-01',
    uploadedBy: 'Mike Johnson',
    category: 'Photos',
  },
  {
    id: '8',
    name: 'HVAC_Specifications.pdf',
    type: 'pdf',
    size: '1.8 MB',
    sizeBytes: 1887437,
    dateModified: '2024-10-30',
    uploadedBy: 'Sarah Davis',
    category: 'Specs',
  },
]

const fileTypeIcons: Record<string, typeof File> = {
  pdf: FileText,
  doc: FileText,
  xls: FileSpreadsheet,
  jpg: FileImage,
  png: FileImage,
  zip: FileArchive,
  dwg: File,
  other: File,
}

const fileTypeColors: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  xls: 'text-green-500',
  jpg: 'text-purple-500',
  png: 'text-purple-500',
  zip: 'text-amber-500',
  dwg: 'text-orange-500',
  other: 'text-gray-500',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FolderCard({ folder, isSelected, onClick }: { folder: FolderItem; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full",
        isSelected
          ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className={cn("p-2 rounded-lg", folder.color)}>
        {isSelected ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{folder.name}</div>
        <div className="text-xs text-gray-500">{folder.filesCount} files</div>
      </div>
      <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", isSelected && "rotate-90")} />
    </button>
  )
}

function FileRow({ file }: { file: DocumentFile }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-gray-500'

  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer group">
      <div className={cn("flex-shrink-0", iconColor)}>
        <FileIcon className="h-8 w-8" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{file.name}</div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span className="uppercase font-medium">{file.type}</span>
          <span>{file.size}</span>
        </div>
        {file.aiNote && (
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
            <Sparkles className="h-3 w-3" />
            <span>{file.aiNote}</span>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500">
        <Calendar className="h-3.5 w-3.5" />
        <span>{formatDate(file.dateModified)}</span>
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 min-w-[120px]">
        <User className="h-3.5 w-3.5" />
        <span className="truncate">{file.uploadedBy}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Preview">
          <Eye className="h-4 w-4 text-gray-400" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Download">
          <Download className="h-4 w-4 text-gray-400" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="More">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export function DocumentsPreview() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('All Types')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState()

  const filteredFiles = sortItems(
    mockFiles.filter(file => {
      if (selectedFolder && file.category !== selectedFolder) return false
      if (typeFilter !== 'All Types') {
        const typeMap: Record<string, string[]> = {
          'PDF': ['pdf'],
          'DOC': ['doc'],
          'XLS': ['xls'],
          'Images': ['jpg', 'png'],
          'Archives': ['zip'],
          'CAD': ['dwg'],
        }
        const allowedTypes = typeMap[typeFilter] || []
        if (!allowedTypes.includes(file.type)) return false
      }
      if (!matchesSearch(file, search, ['name', 'uploadedBy', 'category'])) return false
      if (activeTab !== 'all' && file.category !== activeTab) return false
      return true
    }),
    activeSort as keyof DocumentFile | '',
    sortDirection,
  )

  // Calculate quick stats
  const totalFiles = mockFiles.length
  const totalSize = mockFiles.reduce((sum, f) => sum + f.sizeBytes, 0)
  const totalSizeFormatted = totalSize >= 1073741824
    ? (totalSize / 1073741824).toFixed(1) + ' GB'
    : (totalSize / 1048576).toFixed(1) + ' MB'

  const categoryStats = mockFolders.map(folder => ({
    name: folder.name,
    count: mockFiles.filter(f => f.category === folder.name).length,
  }))

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Documents & Files</h3>
          <span className="text-sm text-gray-500">{totalFiles} files | {totalSizeFormatted} total</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search files..."
          tabs={[
            { key: 'all', label: 'All', count: mockFiles.length },
            ...mockFolders.map(f => ({
              key: f.name,
              label: f.name,
              count: mockFiles.filter(file => file.category === f.name).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Types',
              value: typeFilter,
              options: [
                { value: 'PDF', label: 'PDF' },
                { value: 'DOC', label: 'DOC' },
                { value: 'XLS', label: 'XLS' },
                { value: 'Images', label: 'Images' },
                { value: 'Archives', label: 'Archives' },
                { value: 'CAD', label: 'CAD' },
              ],
              onChange: setTypeFilter,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'dateModified', label: 'Date Modified' },
            { value: 'sizeBytes', label: 'Size' },
            { value: 'uploadedBy', label: 'Uploaded By' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Upload, label: 'Upload Files', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredFiles.length}
          totalCount={mockFiles.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <File className="h-4 w-4" />
              Total Files
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalFiles}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <HardDrive className="h-4 w-4" />
              Storage Used
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{totalSizeFormatted}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <FileText className="h-4 w-4" />
              Plans & Specs
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">
              {categoryStats.filter(c => c.name === 'Plans' || c.name === 'Specs').reduce((sum, c) => sum + c.count, 0)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <Folder className="h-4 w-4" />
              Categories
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{mockFolders.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Folder Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white p-3 space-y-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full",
              selectedFolder === null
                ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
          >
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <Folder className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">All Files</div>
              <div className="text-xs text-gray-500">{totalFiles} files</div>
            </div>
          </button>
          {mockFolders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              isSelected={selectedFolder === folder.name}
              onClick={() => setSelectedFolder(selectedFolder === folder.name ? null : folder.name)}
            />
          ))}
        </div>

        {/* File List */}
        <div className="flex-1 p-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {filteredFiles.length > 0 ? (
              filteredFiles.map(file => (
                <FileRow key={file.id} file={file} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No files match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Document Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              1 permit expiring soon
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              3 plans updated this week
            </span>
            <span>|</span>
            <span>2 files reference outdated specs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
