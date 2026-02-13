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

const mockFolders: FolderItem[] = [
  { id: '1', name: 'Plans & Specifications', filesCount: 18, color: 'bg-blue-100 text-blue-600' },
  { id: '2', name: 'Permits & Inspections', filesCount: 8, color: 'bg-green-100 text-green-600' },
  { id: '3', name: 'Contracts', filesCount: 5, color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Insurance & Compliance', filesCount: 7, color: 'bg-orange-100 text-orange-600' },
  { id: '5', name: 'Submittals', filesCount: 11, color: 'bg-indigo-100 text-indigo-600' },
  { id: '6', name: 'Change Orders', filesCount: 4, color: 'bg-rose-100 text-rose-600' },
  { id: '7', name: 'Warranties', filesCount: 6, color: 'bg-cyan-100 text-cyan-600' },
  { id: '8', name: 'Specs', filesCount: 12, color: 'bg-red-100 text-red-600' },
  { id: '9', name: 'Photos', filesCount: 156, color: 'bg-amber-100 text-amber-600' },
  { id: '10', name: 'Correspondence', filesCount: 9, color: 'bg-teal-100 text-teal-600' },
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
  doc: 'text-blue-500',
  xls: 'text-green-500',
  jpg: 'text-purple-500',
  png: 'text-purple-500',
  zip: 'text-amber-500',
  dwg: 'text-orange-500',
  other: 'text-gray-500',
}

const thumbnailColors: Record<string, string> = {
  plan: 'bg-blue-100',
  permit: 'bg-green-100',
  cad: 'bg-orange-100',
  photo: 'bg-purple-100',
}

const approvalStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  revisions_requested: { label: 'Revisions Req.', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-02-12')
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
        <div className="font-medium text-gray-900 truncate text-sm">{folder.name}</div>
        <div className="text-xs text-gray-500">{folder.filesCount} files</div>
      </div>
      <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", isSelected && "rotate-90")} />
    </button>
  )
}

function FileThumbnail({ file }: { file: DocumentFile }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-gray-500'
  const bgColor = file.thumbnail ? thumbnailColors[file.thumbnail] : 'bg-gray-100'

  return (
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", bgColor)}>
      <FileIcon className={cn("h-6 w-6", iconColor)} />
    </div>
  )
}

function FileRow({ file, isSelected, onClick }: { file: DocumentFile; isSelected: boolean; onClick: () => void }) {
  const isExpiringSoon = file.expiresAt && daysUntil(file.expiresAt) <= 90 && daysUntil(file.expiresAt) > 0

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer group",
        isSelected
          ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
          : file.status === 'archived'
            ? "bg-gray-50 border-gray-200 opacity-60"
            : "bg-white border-gray-200 hover:shadow-sm hover:border-gray-300"
      )}
    >
      <FileThumbnail file={file} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">{file.name}</span>
          {file.version > 1 && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
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
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Archived</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
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
              file.extractionStatus === 'processing' ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-gray-100 text-gray-600"
            )}>
              {file.extractionStatus === 'processing' ? 'AI Processing...' : file.extractionStatus}
            </span>
          )}
          {file.ingestedVia !== 'upload' && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <Mail className="h-3 w-3" />
              via {file.ingestedVia}
            </span>
          )}
        </div>
        {/* Cross-module connection badges */}
        {file.linkedEntities.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {file.linkedEntities.map((entity, idx) => (
              <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
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
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Share">
          <Share2 className="h-4 w-4 text-gray-400" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="More">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

function FileDetailsPanel({ file, onClose }: { file: DocumentFile; onClose: () => void }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-gray-500'

  return (
    <div className="w-80 border-l border-gray-200 bg-white p-4 space-y-4 max-h-[450px] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">File Details</h4>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* File Preview */}
      <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
        <FileIcon className={cn("h-16 w-16", iconColor)} />
      </div>

      {/* File Name */}
      <div>
        <div className="text-sm font-medium text-gray-900 break-words">{file.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 uppercase">{file.type} File</span>
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
          <span className="text-gray-500">Size</span>
          <span className="text-gray-900 font-medium">{file.size}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Uploaded by</span>
          <span className="text-gray-900 font-medium">{file.uploadedBy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span className="text-gray-900 font-medium">{formatDate(file.dateModified)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Version</span>
          <span className="text-gray-900 font-medium">v{file.version}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Category</span>
          <span className="text-gray-900 font-medium">{file.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Ingested via</span>
          <span className="text-gray-900 font-medium capitalize">{file.ingestedVia}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">AI Extraction</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            file.extractionStatus === 'completed' ? "bg-green-100 text-green-600" :
            file.extractionStatus === 'processing' ? "bg-blue-100 text-blue-600" :
            "bg-gray-100 text-gray-600"
          )}>
            {file.extractionStatus}
          </span>
        </div>
        {file.aiConfidence !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">AI Confidence</span>
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
            <span className="text-gray-500">Expires</span>
            <span className={cn(
              "font-medium",
              daysUntil(file.expiresAt) <= 30 ? "text-red-600" :
              daysUntil(file.expiresAt) <= 90 ? "text-amber-600" :
              "text-gray-900"
            )}>
              {formatDate(file.expiresAt)}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {file.tags.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 mb-1">Tags</div>
          <div className="flex flex-wrap gap-1">
            {file.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Linked Entities */}
      {file.linkedEntities.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 mb-1">Linked Records</div>
          <div className="flex flex-wrap gap-1">
            {file.linkedEntities.map((entity, idx) => (
              <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-0.5">
                <ExternalLink className="h-3 w-3" />
                {entity.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sharing */}
      <div>
        <div className="text-sm text-gray-500 mb-1">Sharing</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Eye className={cn("h-3.5 w-3.5", file.portalVisible ? "text-green-500" : "text-gray-400")} />
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
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Download className="h-4 w-4" />
          Download
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Share2 className="h-4 w-4" />
          Share
        </button>
        {file.version > 1 && (
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
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

function UploadDropzone() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
      <CloudUpload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
      <div className="text-sm font-medium text-gray-900">Drop files here or click to upload</div>
      <div className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, DWG, JPG, PNG up to 500MB</div>
      <div className="text-xs text-gray-400 mt-1">Files auto-classified by AI and filed to the correct folder</div>
      <button className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Browse Files
      </button>
    </div>
  )
}

function RecentFilesSection({ files, onSelectFile }: { files: DocumentFile[]; onSelectFile: (file: DocumentFile) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Recent Files
        </h4>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {files.map(file => {
          const FileIcon = fileTypeIcons[file.type] || File
          const iconColor = fileTypeColors[file.type] || 'text-gray-500'
          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file)}
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left"
            >
              <FileIcon className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(file.dateModified)}</span>
                  {file.ingestedVia !== 'upload' && (
                    <span className="text-gray-400">via {file.ingestedVia}</span>
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
      color: 'text-blue-600 bg-blue-100',
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
          <div key={feature.name} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("p-1.5 rounded", feature.color)}>
                <feature.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-gray-900">{feature.name}</span>
            </div>
            <p className="text-xs text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function JobFilesPreview() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('All Types')
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses')
  const [showUploadZone, setShowUploadZone] = useState(false)
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

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Job Files</h3>
          <span className="text-sm text-gray-500">{totalFiles} files | {totalSizeFormatted} total</span>
          {expiringCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {expiringCount} expiring
            </span>
          )}
          {pendingApprovalCount > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
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
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <UploadDropzone />
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
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
        <div className="w-64 border-r border-gray-200 bg-white p-3 space-y-2 max-h-[450px] overflow-y-auto">
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
              <div className="text-xs text-gray-500">{mockFiles.length} files</div>
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
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
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

      {/* Recent Files & AI Features Section */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
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
    </div>
  )
}
