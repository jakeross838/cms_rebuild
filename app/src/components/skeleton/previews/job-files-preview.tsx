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
  X,
  History,
  Share2,
  FileSearch,
  Wand2,
  ScanText,
  Brain,
  FolderPlus,
  CloudUpload,
  Tag,
  Mail,
  Lock,
  CheckCircle2,
  Shield,
  ExternalLink,
  Archive,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeatureCard, AIFeaturesPanel } from '@/components/skeleton/ui'
import { BulkSelectBar } from '@/components/skeleton/ui'

interface DocumentFile {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'xls' | 'jpg' | 'png' | 'zip' | 'dwg' | 'other'
  size: string
  sizeBytes: number
  dateModified: string
  uploadedBy: string
  category: string
  version: number
  thumbnail?: string
  status: 'active' | 'archived' | 'legal_hold'
  documentType: string
  aiClassification?: string
  aiConfidence?: number
  tags: string[]
  expiresAt?: string
  approvalStatus?: 'draft' | 'submitted' | 'under_review' | 'revisions_requested' | 'approved' | 'rejected'
  portalVisible: boolean
  sharedWithVendors: string[]
  linkedEntities: { type: string; label: string }[]
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed'
  ingestedVia: 'upload' | 'email' | 'scan' | 'api'
  aiNote?: string
}

interface FolderItem {
  id: string
  name: string
  filesCount: number
  color: string
}

interface UploadingFile {
  id: string
  name: string
  size: number
  progress: number
}

const mockFolders: FolderItem[] = [
  { id: '1', name: 'Plans & Specifications', filesCount: 18, color: 'bg-stone-100 text-stone-600' },
  { id: '2', name: 'Permits & Inspections', filesCount: 8, color: 'bg-green-100 text-green-600' },
  { id: '3', name: 'Contracts', filesCount: 5, color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Insurance & Compliance', filesCount: 7, color: 'bg-orange-100 text-orange-600' },
  { id: '5', name: 'Submittals', filesCount: 11, color: 'bg-indigo-100 text-indigo-600' },
  { id: '6', name: 'Change Orders', filesCount: 4, color: 'bg-rose-100 text-rose-600' },
  { id: '7', name: 'Warranties', filesCount: 6, color: 'bg-cyan-100 text-cyan-600' },
  { id: '8', name: 'Specs', filesCount: 12, color: 'bg-red-100 text-red-600' },
  { id: '9', name: 'Photos', filesCount: 156, color: 'bg-amber-100 text-amber-600' },
  { id: '10', name: 'Correspondence', filesCount: 9, color: 'bg-teal-100 text-teal-600' },
  { id: '11', name: 'Closeout', filesCount: 3, color: 'bg-slate-100 text-slate-600' },
]

const mockFiles: DocumentFile[] = [
  {
    id: '1',
    name: 'Architectural_Plans_RevC.pdf',
    type: 'pdf',
    size: '12.4 MB',
    sizeBytes: 13004390,
    dateModified: '2026-02-10',
    uploadedBy: 'John Smith',
    category: 'Plans & Specifications',
    version: 3,
    thumbnail: 'plan',
    status: 'active',
    documentType: 'construction_plan',
    aiClassification: 'construction_plan',
    aiConfidence: 0.97,
    tags: ['Architectural', 'Rev C', 'Current'],
    portalVisible: true,
    sharedWithVendors: ['ABC Framing', 'Sparks Electric', 'Gulf Plumbing'],
    linkedEntities: [
      { type: 'submittal', label: 'SUB-012' },
      { type: 'rfi', label: 'RFI-008' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '2',
    name: 'Building_Permit_2026-0847.pdf',
    type: 'pdf',
    size: '1.2 MB',
    sizeBytes: 1258291,
    dateModified: '2026-01-15',
    uploadedBy: 'Mike Johnson',
    category: 'Permits & Inspections',
    version: 1,
    thumbnail: 'permit',
    status: 'active',
    documentType: 'permit',
    aiClassification: 'permit',
    aiConfidence: 0.95,
    tags: ['Building Permit', 'Active'],
    expiresAt: '2026-07-15',
    portalVisible: false,
    sharedWithVendors: [],
    linkedEntities: [{ type: 'permit', label: 'PRM-001' }],
    aiNote: 'Permit #2026-0847 expires Jul 15 -- 153 days remaining',
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '3',
    name: 'General_Contract_Executed.pdf',
    type: 'pdf',
    size: '856 KB',
    sizeBytes: 876544,
    dateModified: '2025-11-20',
    uploadedBy: 'Sarah Davis',
    category: 'Contracts',
    version: 2,
    status: 'active',
    documentType: 'contract',
    aiClassification: 'contract',
    aiConfidence: 0.98,
    tags: ['Executed', 'General Contract'],
    portalVisible: true,
    sharedWithVendors: [],
    linkedEntities: [{ type: 'client', label: 'Anderson Family' }],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '4',
    name: 'Structural_Engineering_Rev2.pdf',
    type: 'pdf',
    size: '8.7 MB',
    sizeBytes: 9122611,
    dateModified: '2026-02-01',
    uploadedBy: 'Tom Wilson',
    category: 'Plans & Specifications',
    version: 2,
    thumbnail: 'plan',
    status: 'active',
    documentType: 'construction_plan',
    aiClassification: 'construction_plan',
    aiConfidence: 0.94,
    tags: ['Structural', 'Rev 2', 'Current'],
    portalVisible: true,
    sharedWithVendors: ['ABC Framing'],
    linkedEntities: [{ type: 'rfi', label: 'RFI-003' }],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '5',
    name: 'Window_Submittal_PGT_Impact.pdf',
    type: 'pdf',
    size: '3.1 MB',
    sizeBytes: 3250586,
    dateModified: '2026-02-05',
    uploadedBy: 'John Smith',
    category: 'Submittals',
    version: 1,
    status: 'active',
    documentType: 'submittal',
    aiClassification: 'submittal',
    aiConfidence: 0.91,
    tags: ['Windows', 'PGT', 'Impact'],
    approvalStatus: 'under_review',
    portalVisible: false,
    sharedWithVendors: ['PGT Industries'],
    linkedEntities: [
      { type: 'vendor', label: 'PGT Industries' },
      { type: 'selection', label: 'SEL-045' },
      { type: 'po', label: 'PO-023' },
    ],
    aiNote: 'Submittal pending architect review -- due in 3 days',
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '6',
    name: 'ABC_Framing_COI_2026.pdf',
    type: 'pdf',
    size: '324 KB',
    sizeBytes: 331776,
    dateModified: '2026-01-08',
    uploadedBy: 'System',
    category: 'Insurance & Compliance',
    version: 1,
    status: 'active',
    documentType: 'certificate_of_insurance',
    aiClassification: 'certificate_of_insurance',
    aiConfidence: 0.96,
    tags: ['COI', 'ABC Framing', 'GL', 'WC'],
    expiresAt: '2026-06-30',
    portalVisible: false,
    sharedWithVendors: [],
    linkedEntities: [
      { type: 'vendor', label: 'ABC Framing' },
    ],
    aiNote: 'GL $2M / WC verified. Additional insured: confirmed. Expires Jun 30.',
    extractionStatus: 'completed',
    ingestedVia: 'email',
  },
  {
    id: '7',
    name: 'Roofing_Warranty_CertainTeed.pdf',
    type: 'pdf',
    size: '456 KB',
    sizeBytes: 466944,
    dateModified: '2026-02-03',
    uploadedBy: 'Sarah Davis',
    category: 'Warranties',
    version: 1,
    status: 'active',
    documentType: 'warranty',
    aiClassification: 'warranty',
    aiConfidence: 0.92,
    tags: ['Warranty', 'Roofing', '25-Year'],
    expiresAt: '2051-02-03',
    portalVisible: true,
    sharedWithVendors: [],
    linkedEntities: [
      { type: 'warranty', label: 'WTY-003' },
      { type: 'vendor', label: 'Coastal Roofing' },
    ],
    aiNote: 'CertainTeed 25-year limited warranty. Registration required within 90 days.',
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '8',
    name: 'Lien_Waiver_Sparks_Electric_Draw2.pdf',
    type: 'pdf',
    size: '218 KB',
    sizeBytes: 223232,
    dateModified: '2026-02-07',
    uploadedBy: 'System',
    category: 'Insurance & Compliance',
    version: 1,
    status: 'active',
    documentType: 'lien_waiver',
    aiClassification: 'lien_waiver',
    aiConfidence: 0.94,
    tags: ['Lien Waiver', 'Unconditional', 'Draw 2'],
    portalVisible: false,
    sharedWithVendors: [],
    linkedEntities: [
      { type: 'vendor', label: 'Sparks Electric' },
      { type: 'lien_waiver', label: 'LW-012' },
      { type: 'draw', label: 'Draw #2' },
    ],
    aiNote: 'Unconditional progress waiver through Jan 31, $18,400. Signature detected.',
    extractionStatus: 'completed',
    ingestedVia: 'email',
  },
  {
    id: '9',
    name: 'Tile_Submittal_DalTile_Porcelain.pdf',
    type: 'pdf',
    size: '5.8 MB',
    sizeBytes: 6081740,
    dateModified: '2026-02-09',
    uploadedBy: 'Lisa Brown',
    category: 'Submittals',
    version: 2,
    status: 'active',
    documentType: 'submittal',
    aiClassification: 'submittal',
    aiConfidence: 0.93,
    tags: ['Tile', 'DalTile', 'Porcelain', 'Master Bath'],
    approvalStatus: 'approved',
    portalVisible: false,
    sharedWithVendors: ['Coastal Tile & Stone'],
    linkedEntities: [
      { type: 'vendor', label: 'Coastal Tile & Stone' },
      { type: 'selection', label: 'SEL-067' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '10',
    name: 'CO-003_Kitchen_Upgrade.pdf',
    type: 'pdf',
    size: '412 KB',
    sizeBytes: 421888,
    dateModified: '2026-02-08',
    uploadedBy: 'Sarah Davis',
    category: 'Change Orders',
    version: 1,
    status: 'active',
    documentType: 'change_order',
    aiClassification: 'change_order',
    aiConfidence: 0.93,
    tags: ['Change Order', 'Kitchen', 'Client-Initiated'],
    approvalStatus: 'approved',
    portalVisible: true,
    sharedWithVendors: [],
    linkedEntities: [
      { type: 'change_order', label: 'CO-003' },
      { type: 'budget', label: '+$14,200' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '11',
    name: 'Window_Schedule.xls',
    type: 'xls',
    size: '312 KB',
    sizeBytes: 319488,
    dateModified: '2026-01-25',
    uploadedBy: 'Lisa Brown',
    category: 'Specs',
    version: 2,
    status: 'active',
    documentType: 'specification',
    tags: ['Windows', 'Schedule'],
    portalVisible: false,
    sharedWithVendors: ['PGT Industries'],
    linkedEntities: [
      { type: 'selection', label: 'SEL-045' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '12',
    name: 'MEP_Specifications_v1.pdf',
    type: 'pdf',
    size: '5.2 MB',
    sizeBytes: 5452595,
    dateModified: '2026-01-20',
    uploadedBy: 'Tom Wilson',
    category: 'Plans & Specifications',
    version: 1,
    status: 'active',
    documentType: 'specification_book',
    aiClassification: 'specification_book',
    aiConfidence: 0.89,
    tags: ['MEP', 'Specifications'],
    portalVisible: false,
    sharedWithVendors: ['Sparks Electric', 'Gulf Plumbing', 'Cool Air HVAC'],
    linkedEntities: [],
    extractionStatus: 'processing',
    ingestedVia: 'upload',
    aiNote: 'Extraction in progress -- 42 pages being processed',
  },
]

const recentFiles = mockFiles.slice(0, 4)

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
  doc: 'text-stone-500',
  xls: 'text-green-500',
  jpg: 'text-purple-500',
  png: 'text-purple-500',
  zip: 'text-amber-500',
  dwg: 'text-orange-500',
  other: 'text-warm-500',
}

const thumbnailColors: Record<string, string> = {
  plan: 'bg-stone-100',
  permit: 'bg-green-100',
  cad: 'bg-orange-100',
  photo: 'bg-purple-100',
}

const approvalStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-600' },
  submitted: { label: 'Submitted', color: 'bg-stone-100 text-stone-700' },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
  revisions_requested: { label: 'Revisions Req.', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

// Storage quota constants
const STORAGE_USED_GB = 2.4
const STORAGE_TOTAL_GB = 10
const MAX_FILES_PER_UPLOAD = 20
const MAX_FILE_SIZE_MB = 500

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-02-12')
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

function FolderCard({ folder, isSelected, onClick }: { folder: FolderItem; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full",
        isSelected
          ? "border-stone-300 bg-stone-50 ring-2 ring-stone-200"
          : "border-warm-200 bg-white hover:border-warm-300 hover:shadow-sm"
      )}
    >
      <div className={cn("p-2 rounded-lg", folder.color)}>
        {isSelected ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-warm-900 truncate text-sm">{folder.name}</div>
        <div className="text-xs text-warm-500">{folder.filesCount} files</div>
      </div>
      <ChevronRight className={cn("h-4 w-4 text-warm-400 transition-transform", isSelected && "rotate-90")} />
    </button>
  )
}

function FileThumbnail({ file }: { file: DocumentFile }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-warm-500'
  const bgColor = file.thumbnail ? thumbnailColors[file.thumbnail] : 'bg-warm-100'

  return (
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", bgColor)}>
      <FileIcon className={cn("h-6 w-6", iconColor)} />
    </div>
  )
}

function FileRow({
  file,
  isSelected,
  onClick,
  isChecked,
  onCheckChange,
  onPreviewClick
}: {
  file: DocumentFile
  isSelected: boolean
  onClick: () => void
  isChecked: boolean
  onCheckChange: (checked: boolean) => void
  onPreviewClick: () => void
}) {
  const isExpiringSoon = file.expiresAt && daysUntil(file.expiresAt) <= 90 && daysUntil(file.expiresAt) > 0

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer group",
        isSelected
          ? "bg-stone-50 border-stone-300 ring-2 ring-stone-200"
          : file.status === 'archived'
            ? "bg-warm-50 border-warm-200 opacity-60"
            : "bg-white border-warm-200 hover:shadow-sm hover:border-warm-300"
      )}
    >
      {/* Checkbox for bulk selection */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckChange(e.target.checked)}
          className="h-4 w-4 rounded border-warm-300 text-stone-600 focus:ring-stone-500"
        />
      </div>

      <div onClick={onClick} className="flex items-center gap-4 flex-1 min-w-0">
        <FileThumbnail file={file} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-warm-900 truncate">{file.name}</span>
            {file.version > 1 && (
              <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <History className="h-3 w-3" />
                v{file.version}
              </span>
            )}
            {file.portalVisible && (
              <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                Client
              </span>
            )}
            {file.sharedWithVendors.length > 0 && (
              <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Share2 className="h-3 w-3" />
                {file.sharedWithVendors.length} vendor{file.sharedWithVendors.length > 1 ? 's' : ''}
              </span>
            )}
            {file.status === 'archived' && (
              <span className="text-xs bg-warm-100 text-warm-500 px-1.5 py-0.5 rounded">Archived</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-warm-500 mt-0.5">
            <span className="uppercase font-medium">{file.type}</span>
            <span>{file.size}</span>
            {file.aiClassification && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                {file.aiClassification.replace(/_/g, ' ')}
              </span>
            )}
            {file.extractionStatus !== 'completed' && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                file.extractionStatus === 'processing' ? "bg-stone-100 text-stone-600 animate-pulse" : "bg-warm-100 text-warm-600"
              )}>
                {file.extractionStatus === 'processing' ? 'AI Processing...' : file.extractionStatus}
              </span>
            )}
            {file.ingestedVia !== 'upload' && (
              <span className="text-xs text-warm-400 flex items-center gap-0.5">
                <Mail className="h-3 w-3" />
                via {file.ingestedVia}
              </span>
            )}
          </div>
          {/* Cross-module connection badges */}
          {file.linkedEntities.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {file.linkedEntities.map((entity, idx) => (
                <span key={idx} className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                  {entity.label}
                </span>
              ))}
            </div>
          )}
          {/* Approval status */}
          {file.approvalStatus && (
            <div className="mt-1">
              <span className={cn("text-xs px-1.5 py-0.5 rounded", approvalStatusConfig[file.approvalStatus]?.color)}>
                {approvalStatusConfig[file.approvalStatus]?.label}
              </span>
            </div>
          )}
          {/* Expiration warning */}
          {isExpiringSoon && file.expiresAt && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Expires {formatDate(file.expiresAt)} ({daysUntil(file.expiresAt)} days)</span>
            </div>
          )}
          {file.aiNote && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
              <Sparkles className="h-3 w-3" />
              <span>{file.aiNote}</span>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-sm text-warm-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(file.dateModified)}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-sm text-warm-500 min-w-[120px]">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{file.uploadedBy}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 hover:bg-warm-100 rounded"
          title="Preview"
          onClick={(e) => {
            e.stopPropagation()
            onPreviewClick()
          }}
        >
          <Eye className="h-4 w-4 text-warm-400" />
        </button>
        <button className="p-1.5 hover:bg-warm-100 rounded" title="Download">
          <Download className="h-4 w-4 text-warm-400" />
        </button>
        <button className="p-1.5 hover:bg-warm-100 rounded" title="Share">
          <Share2 className="h-4 w-4 text-warm-400" />
        </button>
        <button className="p-1.5 hover:bg-warm-100 rounded" title="More">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>
    </div>
  )
}

function FileDetailsPanel({ file, onClose }: { file: DocumentFile; onClose: () => void }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-warm-500'

  return (
    <div className="w-80 border-l border-warm-200 bg-white p-4 space-y-4 max-h-[450px] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-warm-900">File Details</h4>
        <button onClick={onClose} className="p-1 hover:bg-warm-100 rounded">
          <X className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* File Preview */}
      <div className="bg-warm-100 rounded-lg p-6 flex items-center justify-center">
        <FileIcon className={cn("h-16 w-16", iconColor)} />
      </div>

      {/* File Name */}
      <div>
        <div className="text-sm font-medium text-warm-900 break-words">{file.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-warm-500 uppercase">{file.type} File</span>
          {file.aiClassification && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
              {file.aiClassification.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-warm-500">Size</span>
          <span className="text-warm-900 font-medium">{file.size}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-500">Uploaded by</span>
          <span className="text-warm-900 font-medium">{file.uploadedBy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-500">Date</span>
          <span className="text-warm-900 font-medium">{formatDate(file.dateModified)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-500">Version</span>
          <span className="text-warm-900 font-medium">v{file.version}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-500">Category</span>
          <span className="text-warm-900 font-medium">{file.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-500">Ingested via</span>
          <span className="text-warm-900 font-medium capitalize">{file.ingestedVia}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-500">AI Extraction</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            file.extractionStatus === 'completed' ? "bg-green-100 text-green-600" :
            file.extractionStatus === 'processing' ? "bg-stone-100 text-stone-600" :
            "bg-warm-100 text-warm-600"
          )}>
            {file.extractionStatus}
          </span>
        </div>
        {file.aiConfidence !== undefined && (
          <div className="flex justify-between">
            <span className="text-warm-500">AI Confidence</span>
            <span className={cn(
              "font-medium",
              file.aiConfidence >= 0.9 ? "text-green-600" : file.aiConfidence >= 0.8 ? "text-amber-600" : "text-red-600"
            )}>
              {Math.round(file.aiConfidence * 100)}%
            </span>
          </div>
        )}
        {file.expiresAt && (
          <div className="flex justify-between">
            <span className="text-warm-500">Expires</span>
            <span className={cn(
              "font-medium",
              daysUntil(file.expiresAt) <= 30 ? "text-red-600" :
              daysUntil(file.expiresAt) <= 90 ? "text-amber-600" :
              "text-warm-900"
            )}>
              {formatDate(file.expiresAt)}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {file.tags.length > 0 && (
        <div>
          <div className="text-sm text-warm-500 mb-1">Tags</div>
          <div className="flex flex-wrap gap-1">
            {file.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Linked Entities */}
      {file.linkedEntities.length > 0 && (
        <div>
          <div className="text-sm text-warm-500 mb-1">Linked Records</div>
          <div className="flex flex-wrap gap-1">
            {file.linkedEntities.map((entity, idx) => (
              <span key={idx} className="text-xs bg-stone-50 text-stone-600 px-2 py-0.5 rounded flex items-center gap-0.5">
                <ExternalLink className="h-3 w-3" />
                {entity.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sharing */}
      <div>
        <div className="text-sm text-warm-500 mb-1">Sharing</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Eye className={cn("h-3.5 w-3.5", file.portalVisible ? "text-green-500" : "text-warm-400")} />
            <span>{file.portalVisible ? 'Visible in client portal' : 'Hidden from client portal'}</span>
          </div>
          {file.sharedWithVendors.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-purple-500" />
              <span>Shared with: {file.sharedWithVendors.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-warm-200">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 rounded-lg">
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 rounded-lg">
          <Download className="h-4 w-4" />
          Download
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 rounded-lg">
          <Share2 className="h-4 w-4" />
          Share
        </button>
        {file.version > 1 && (
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 rounded-lg">
            <History className="h-4 w-4" />
            Version History ({file.version} versions)
          </button>
        )}
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
          <Trash2 className="h-4 w-4" />
          Archive
        </button>
      </div>
    </div>
  )
}

// Upload Progress Bar Component
function UploadProgressBar({ file, onCancel }: { file: UploadingFile; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-warm-200 rounded-lg">
      <div className="p-2 bg-stone-100 rounded">
        <CloudUpload className="h-4 w-4 text-stone-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-warm-900 truncate">{file.name}</span>
          <span className="text-xs text-warm-500">{formatFileSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-600 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-stone-600 w-10 text-right">{file.progress}%</span>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-warm-100 rounded"
        title="Cancel upload"
      >
        <X className="h-4 w-4 text-warm-400" />
      </button>
    </div>
  )
}

// Storage Quota Progress Bar
function StorageQuotaBar() {
  const usagePercent = (STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100

  const getProgressColor = () => {
    if (usagePercent < 50) return 'bg-green-500'
    if (usagePercent < 80) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTextColor = () => {
    if (usagePercent < 50) return 'text-green-600'
    if (usagePercent < 80) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white border border-warm-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HardDrive className={cn("h-4 w-4", getTextColor())} />
          <span className="text-sm font-medium text-warm-700">Storage</span>
        </div>
        <span className={cn("text-sm font-medium", getTextColor())}>
          {STORAGE_USED_GB} GB of {STORAGE_TOTAL_GB} GB used
        </span>
      </div>
      <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getProgressColor())}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
    </div>
  )
}

// Document Preview Modal
function DocumentPreviewModal({ file, onClose }: { file: DocumentFile; onClose: () => void }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-warm-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
          <div className="flex items-center gap-3">
            <FileIcon className={cn("h-5 w-5", iconColor)} />
            <span className="font-medium text-warm-900">{file.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-warm-100 rounded"
          >
            <X className="h-5 w-5 text-warm-500" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex flex-col items-center justify-center py-16 px-8 bg-warm-50">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-warm-200 mb-4">
            <FileText className="h-20 w-20 text-red-400" />
          </div>
          <p className="text-lg font-medium text-warm-700 mb-1">Preview coming soon</p>
          <p className="text-sm text-warm-500">Document preview functionality is in development</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-warm-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-warm-700 hover:bg-warm-100 rounded-lg"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

function UploadDropzone({ fileCount, totalSize }: { fileCount: number; totalSize: number }) {
  const isFileCountValid = fileCount <= MAX_FILES_PER_UPLOAD
  const isSizeValid = totalSize <= MAX_FILE_SIZE_MB * 1024 * 1024

  return (
    <div className="border-2 border-dashed border-warm-300 rounded-lg p-6 text-center hover:border-stone-400 hover:bg-stone-50/50 transition-colors cursor-pointer">
      <CloudUpload className="h-10 w-10 text-warm-400 mx-auto mb-3" />
      <div className="text-sm font-medium text-warm-900">Drop files here or click to upload</div>
      <div className="text-xs text-warm-500 mt-1">PDF, DOC, XLS, DWG, JPG, PNG up to 500MB</div>
      <div className="text-xs text-warm-400 mt-1">Files auto-classified by AI and filed to the correct folder</div>

      {/* Validation indicators */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className={cn(
          "flex items-center gap-1 text-xs px-2 py-1 rounded",
          isFileCountValid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {isFileCountValid ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          Max {MAX_FILES_PER_UPLOAD} files
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs px-2 py-1 rounded",
          isSizeValid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {isSizeValid ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          Max {MAX_FILE_SIZE_MB}MB per file
        </div>
      </div>

      <button className="mt-3 px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
        Browse Files
      </button>
    </div>
  )
}

function RecentFilesSection({ files, onSelectFile }: { files: DocumentFile[]; onSelectFile: (file: DocumentFile) => void }) {
  return (
    <div className="bg-white border border-warm-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-warm-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-warm-500" />
          Recent Files
        </h4>
        <button className="text-sm text-stone-600 hover:text-stone-700">View All</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {files.map(file => {
          const FileIcon = fileTypeIcons[file.type] || File
          const iconColor = fileTypeColors[file.type] || 'text-warm-500'
          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file)}
              className="flex items-center gap-2 p-2 rounded-lg border border-warm-200 hover:border-warm-300 hover:bg-warm-50 text-left"
            >
              <FileIcon className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-warm-900 truncate">{file.name}</div>
                <div className="flex items-center gap-2 text-xs text-warm-500">
                  <span>{formatDate(file.dateModified)}</span>
                  {file.ingestedVia !== 'upload' && (
                    <span className="text-warm-400">via {file.ingestedVia}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AIFeaturesSection() {
  const aiFeatures = [
    {
      icon: ScanText,
      name: 'OCR & Text Extraction',
      description: 'Extract text from PDFs, images, and scans for full-text search',
      status: 'Active',
      color: 'text-stone-600 bg-stone-100',
    },
    {
      icon: Wand2,
      name: 'Auto-Classification',
      description: 'AI identifies document type and routes to correct folder',
      status: 'Active',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: FileSearch,
      name: 'Smart Search',
      description: 'Search inside document content across all files',
      status: 'Active',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Brain,
      name: 'Entity Extraction',
      description: 'Extract dates, amounts, vendor names, and key terms automatically',
      status: 'Active',
      color: 'text-amber-600 bg-amber-100',
    },
    {
      icon: Shield,
      name: 'Expiration Tracking',
      description: 'Auto-detect and track expiration dates on COIs, permits, licenses',
      status: 'Active',
      color: 'text-red-600 bg-red-100',
    },
    {
      icon: CheckCircle2,
      name: 'Submittal Workflow',
      description: 'Vendor submits, PM reviews, architect approves -- tracked and audited',
      status: 'Active',
      color: 'text-indigo-600 bg-indigo-100',
    },
  ]

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h4 className="font-semibold text-indigo-900">Document Intelligence</h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {aiFeatures.map(feature => (
          <div key={feature.name} className="bg-white rounded-lg p-3 border border-warm-200">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("p-1.5 rounded", feature.color)}>
                <feature.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-warm-900">{feature.name}</span>
            </div>
            <p className="text-xs text-warm-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// New AI Features Panel for document-specific insights
function DocumentAIInsightsPanel() {
  const documentAIFeatures = [
    {
      feature: 'Missing Document Detection',
      trigger: 'Daily',
      insight: "Phase 2 (Framing) starting in 5 days. Missing: Framing inspection approval, Lumber delivery receipt",
      severity: 'warning' as const,
      confidence: 92,
    },
    {
      feature: 'Spec Book AI Extraction',
      trigger: 'On-submission',
      insight: "Processing 'Specifications_v2.pdf' (142 pages). Extracted: 23 product selections, 8 finish schedules",
      severity: 'info' as const,
      confidence: 88,
    },
    {
      feature: 'COI Compliance Check',
      trigger: 'Real-time',
      insight: "ABC Electric COI expires in 15 days. Coverage: $1M General, $2M Umbrella. Meets requirements.",
      severity: 'warning' as const,
      confidence: 96,
    },
    {
      feature: 'Lien Waiver Extraction',
      trigger: 'On-submission',
      insight: "Extracted from 'LW_CoastalPlumbing.pdf': Conditional Final, $12,400, Through: Feb 28, Signature: Present",
      severity: 'success' as const,
      confidence: 94,
    },
  ]

  return (
    <AIFeaturesPanel
      title="Document AI Insights"
      features={documentAIFeatures}
      columns={2}
    />
  )
}

export function JobFilesPreview() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('All Types')
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses')
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([
    // Demo uploading files
    { id: 'upload-1', name: 'Electrical_Plans_Rev2.pdf', size: 8547632, progress: 67 },
    { id: 'upload-2', name: 'HVAC_Submittal.pdf', size: 3245891, progress: 34 },
  ])
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
      if (statusFilter !== 'All Statuses') {
        if (statusFilter === 'Active' && file.status !== 'active') return false
        if (statusFilter === 'Archived' && file.status !== 'archived') return false
        if (statusFilter === 'Expiring' && !(file.expiresAt && daysUntil(file.expiresAt) <= 90)) return false
        if (statusFilter === 'Pending Review' && !(file.approvalStatus === 'under_review' || file.approvalStatus === 'submitted')) return false
      }
      if (!matchesSearch(file, search, ['name', 'uploadedBy', 'category', 'documentType'])) return false
      if (activeTab !== 'all' && file.category !== activeTab) return false
      return true
    }),
    activeSort as keyof DocumentFile | '',
    sortDirection,
  )

  // Calculate quick stats
  const totalFiles = mockFiles.filter(f => f.status === 'active').length
  const totalSize = mockFiles.reduce((sum, f) => sum + f.sizeBytes, 0)
  const totalSizeFormatted = totalSize >= 1073741824
    ? (totalSize / 1073741824).toFixed(1) + ' GB'
    : (totalSize / 1048576).toFixed(1) + ' MB'

  const expiringCount = mockFiles.filter(f => f.expiresAt && daysUntil(f.expiresAt) <= 90 && daysUntil(f.expiresAt) > 0).length
  const pendingApprovalCount = mockFiles.filter(f => f.approvalStatus === 'under_review' || f.approvalStatus === 'submitted').length
  const portalVisibleCount = mockFiles.filter(f => f.portalVisible).length

  // Bulk selection handlers
  const handleFileCheckChange = (fileId: string, checked: boolean) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(fileId)
      } else {
        newSet.delete(fileId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedFileIds(new Set(filteredFiles.map(f => f.id)))
  }

  const handleClearSelection = () => {
    setSelectedFileIds(new Set())
  }

  const handleCancelUpload = (uploadId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== uploadId))
  }

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Job Files</h3>
          <span className="text-sm text-warm-500">{totalFiles} files | {totalSizeFormatted} total</span>
          {expiringCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {expiringCount} expiring
            </span>
          )}
          {pendingApprovalCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
              {pendingApprovalCount} pending review
            </span>
          )}
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search files by name, content, or tag..."
          tabs={[
            { key: 'all', label: 'All', count: mockFiles.length },
            ...mockFolders.slice(0, 5).map(f => ({
              key: f.name,
              label: f.name.split(' ')[0],
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
            {
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { value: 'Active', label: 'Active' },
                { value: 'Archived', label: 'Archived' },
                { value: 'Expiring', label: 'Expiring Soon' },
                { value: 'Pending Review', label: 'Pending Review' },
              ],
              onChange: setStatusFilter,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'dateModified', label: 'Date Modified' },
            { value: 'sizeBytes', label: 'Size' },
            { value: 'uploadedBy', label: 'Uploaded By' },
            { value: 'documentType', label: 'Document Type' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: FolderPlus, label: 'New Folder', onClick: () => {} },
            { icon: Upload, label: 'Upload Files', onClick: () => setShowUploadZone(!showUploadZone), variant: 'primary' },
          ]}
          resultCount={filteredFiles.length}
          totalCount={mockFiles.length}
        />
      </div>

      {/* Upload Dropzone */}
      {showUploadZone && (
        <div className="bg-white border-b border-warm-200 px-4 py-4 space-y-3">
          <UploadDropzone fileCount={0} totalSize={0} />

          {/* Upload progress indicators */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-warm-700">Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? 's' : ''}...</div>
              {uploadingFiles.map(file => (
                <UploadProgressBar
                  key={file.id}
                  file={file}
                  onCancel={() => handleCancelUpload(file.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Storage Quota */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <StorageQuotaBar />
      </div>

      {/* Bulk Selection Bar */}
      {selectedFileIds.size > 0 && (
        <div className="bg-white border-b border-warm-200 px-4 py-2">
          <BulkSelectBar
            selectedCount={selectedFileIds.size}
            totalCount={filteredFiles.length}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          >
            <button className="px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700 flex items-center gap-1.5">
              <Archive className="h-4 w-4" />
              Download ZIP
            </button>
            <button className="px-3 py-1.5 text-sm bg-warm-100 text-warm-700 rounded-lg hover:bg-warm-200 flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              Bulk Tag
            </button>
            <button className="px-3 py-1.5 text-sm bg-warm-100 text-warm-700 rounded-lg hover:bg-warm-200 flex items-center gap-1.5">
              <Share2 className="h-4 w-4" />
              Bulk Share
            </button>
            <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </BulkSelectBar>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <File className="h-4 w-4" />
              Total Files
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalFiles}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <HardDrive className="h-4 w-4" />
              Storage Used
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{totalSizeFormatted}</div>
          </div>
          <div className={cn("rounded-lg p-3", expiringCount > 0 ? "bg-amber-50" : "bg-green-50")}>
            <div className={cn("flex items-center gap-2 text-sm", expiringCount > 0 ? "text-amber-600" : "text-green-600")}>
              <AlertTriangle className="h-4 w-4" />
              Expiring Docs
            </div>
            <div className={cn("text-xl font-bold mt-1", expiringCount > 0 ? "text-amber-700" : "text-green-700")}>{expiringCount}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Pending Review
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{pendingApprovalCount}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Eye className="h-4 w-4" />
              Client Visible
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{portalVisibleCount}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Folder Sidebar */}
        <div className="w-64 border-r border-warm-200 bg-white p-3 space-y-2 max-h-[450px] overflow-y-auto">
          <button
            onClick={() => setSelectedFolder(null)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full",
              selectedFolder === null
                ? "border-stone-300 bg-stone-50 ring-2 ring-stone-200"
                : "border-warm-200 bg-white hover:border-warm-300 hover:shadow-sm"
            )}
          >
            <div className="p-2 rounded-lg bg-warm-100 text-warm-600">
              <Folder className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-warm-900">All Files</div>
              <div className="text-xs text-warm-500">{mockFiles.length} files</div>
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
        <div className="flex-1 p-4 max-h-[450px] overflow-y-auto">
          <div className="space-y-2">
            {filteredFiles.length > 0 ? (
              filteredFiles.map(file => (
                <FileRow
                  key={file.id}
                  file={file}
                  isSelected={selectedFile?.id === file.id}
                  onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                  isChecked={selectedFileIds.has(file.id)}
                  onCheckChange={(checked) => handleFileCheckChange(file.id, checked)}
                  onPreviewClick={() => setPreviewFile(file)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-warm-400">
                <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No files match your search</p>
              </div>
            )}
          </div>
        </div>

        {/* File Details Panel */}
        {selectedFile && (
          <FileDetailsPanel
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        )}
      </div>

      {/* Document AI Insights Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <DocumentAIInsightsPanel />
      </div>

      {/* Recent Files & AI Features Section */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <RecentFilesSection files={recentFiles} onSelectFile={setSelectedFile} />
          <AIFeaturesSection />
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Document Intelligence:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {expiringCount} document{expiringCount !== 1 ? 's' : ''} expiring within 90 days
            </span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Window submittal overdue for architect review
            </span>
            <span className="text-amber-400">|</span>
            <span>Missing: Electrical inspection report for rough-in phase</span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" />
              1 spec book being AI-processed (42 pages)
            </span>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <DocumentPreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}
