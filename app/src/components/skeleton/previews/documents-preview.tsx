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
  Shield,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Tag,
  Search,
  Mail,
  History,
  Share2,
  Lock,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

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
  status: 'active' | 'archived' | 'legal_hold'
  documentType: string
  aiClassification?: string
  aiConfidence?: number
  tags: string[]
  expiresAt?: string
  approvalStatus?: 'draft' | 'submitted' | 'under_review' | 'revisions_requested' | 'approved' | 'rejected'
  portalVisible: boolean
  linkedEntities: { type: string; label: string }[]
  aiNote?: string
  extractionStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  ingestedVia?: 'upload' | 'email' | 'scan' | 'api'
}

interface FolderItem {
  id: string
  name: string
  filesCount: number
  color: string
  subfolders?: string[]
}

const mockFolders: FolderItem[] = [
  { id: '1', name: 'Plans & Specifications', filesCount: 24, color: 'bg-stone-100 text-stone-600', subfolders: ['Architectural', 'Structural', 'MEP', 'Civil'] },
  { id: '2', name: 'Permits & Inspections', filesCount: 12, color: 'bg-green-100 text-green-600' },
  { id: '3', name: 'Contracts', filesCount: 8, color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Insurance & Compliance', filesCount: 9, color: 'bg-orange-100 text-orange-600' },
  { id: '5', name: 'Invoices', filesCount: 32, color: 'bg-teal-100 text-teal-600' },
  { id: '6', name: 'Change Orders', filesCount: 6, color: 'bg-rose-100 text-rose-600' },
  { id: '7', name: 'Submittals', filesCount: 14, color: 'bg-indigo-100 text-indigo-600' },
  { id: '8', name: 'Photos', filesCount: 156, color: 'bg-amber-100 text-amber-600' },
  { id: '9', name: 'Correspondence', filesCount: 11, color: 'bg-cyan-100 text-cyan-600' },
  { id: '10', name: 'Closeout', filesCount: 3, color: 'bg-warm-100 text-warm-600' },
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
    status: 'active',
    documentType: 'construction_plan',
    aiClassification: 'construction_plan',
    aiConfidence: 0.97,
    tags: ['Architectural', 'Rev C', 'Current'],
    portalVisible: true,
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
    status: 'active',
    documentType: 'permit',
    aiClassification: 'permit',
    aiConfidence: 0.95,
    tags: ['Building Permit', 'Active'],
    expiresAt: '2026-07-15',
    portalVisible: false,
    linkedEntities: [
      { type: 'permit', label: 'PRM-001' },
    ],
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
    linkedEntities: [
      { type: 'client', label: 'Anderson Family' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '4',
    name: 'ABC_Framing_COI_2026.pdf',
    type: 'pdf',
    size: '324 KB',
    sizeBytes: 331776,
    dateModified: '2026-01-08',
    uploadedBy: 'Lisa Brown',
    category: 'Insurance & Compliance',
    version: 1,
    status: 'active',
    documentType: 'certificate_of_insurance',
    aiClassification: 'certificate_of_insurance',
    aiConfidence: 0.96,
    tags: ['COI', 'ABC Framing', 'GL'],
    expiresAt: '2026-06-30',
    portalVisible: false,
    linkedEntities: [
      { type: 'vendor', label: 'ABC Framing' },
    ],
    aiNote: 'GL coverage $2M -- meets minimum. Workers comp verified. Expires Jun 30.',
    extractionStatus: 'completed',
    ingestedVia: 'email',
  },
  {
    id: '5',
    name: 'Structural_Engineering_Rev2.pdf',
    type: 'pdf',
    size: '8.7 MB',
    sizeBytes: 9122611,
    dateModified: '2026-02-01',
    uploadedBy: 'Tom Wilson',
    category: 'Plans & Specifications',
    version: 2,
    status: 'active',
    documentType: 'construction_plan',
    aiClassification: 'construction_plan',
    aiConfidence: 0.94,
    tags: ['Structural', 'Rev 2', 'Current'],
    portalVisible: true,
    linkedEntities: [
      { type: 'rfi', label: 'RFI-003' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '6',
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
    id: '7',
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
    linkedEntities: [
      { type: 'change_order', label: 'CO-003' },
      { type: 'budget', label: '+$14,200' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
  },
  {
    id: '8',
    name: 'Sparks_Electric_Invoice_1247.pdf',
    type: 'pdf',
    size: '1.8 MB',
    sizeBytes: 1887437,
    dateModified: '2026-02-11',
    uploadedBy: 'System',
    category: 'Invoices',
    version: 1,
    status: 'active',
    documentType: 'vendor_invoice',
    aiClassification: 'vendor_invoice',
    aiConfidence: 0.97,
    tags: ['Invoice', 'Electrical', 'Rough-In'],
    portalVisible: false,
    linkedEntities: [
      { type: 'vendor', label: 'Sparks Electric' },
      { type: 'invoice', label: 'INV-1247' },
      { type: 'po', label: 'PO-018' },
      { type: 'cost_code', label: '26-0100' },
    ],
    aiNote: 'Auto-matched to PO-018 (98% confidence). Amount within 2% of PO.',
    extractionStatus: 'completed',
    ingestedVia: 'email',
  },
  {
    id: '9',
    name: 'Plumbing_Inspection_Report.pdf',
    type: 'pdf',
    size: '654 KB',
    sizeBytes: 669696,
    dateModified: '2026-02-09',
    uploadedBy: 'Mike Johnson',
    category: 'Permits & Inspections',
    version: 1,
    status: 'active',
    documentType: 'inspection_report',
    aiClassification: 'inspection_report',
    aiConfidence: 0.88,
    tags: ['Inspection', 'Plumbing', 'Passed'],
    portalVisible: false,
    linkedEntities: [
      { type: 'inspection', label: 'INSP-007' },
      { type: 'schedule', label: 'Plumbing Rough' },
    ],
    extractionStatus: 'completed',
    ingestedVia: 'scan',
  },
  {
    id: '10',
    name: 'Lien_Waiver_ABC_Framing_Draw2.pdf',
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
    linkedEntities: [
      { type: 'vendor', label: 'ABC Framing' },
      { type: 'lien_waiver', label: 'LW-009' },
      { type: 'draw', label: 'Draw #2' },
    ],
    aiNote: 'Unconditional progress waiver through Jan 31. Signature detected. Not notarized.',
    extractionStatus: 'completed',
    ingestedVia: 'email',
  },
  {
    id: '11',
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
    linkedEntities: [],
    extractionStatus: 'processing',
    ingestedVia: 'upload',
    aiNote: 'Extraction in progress -- 42 pages being processed',
  },
  {
    id: '12',
    name: 'Site_Survey_2025.dwg',
    type: 'dwg',
    size: '14.3 MB',
    sizeBytes: 14994227,
    dateModified: '2025-10-15',
    uploadedBy: 'Tom Wilson',
    category: 'Plans & Specifications',
    version: 1,
    status: 'archived',
    documentType: 'construction_plan',
    tags: ['Survey', 'CAD', 'Archived'],
    portalVisible: false,
    linkedEntities: [],
    extractionStatus: 'completed',
    ingestedVia: 'upload',
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
  doc: 'text-stone-500',
  xls: 'text-green-500',
  jpg: 'text-purple-500',
  png: 'text-purple-500',
  zip: 'text-amber-500',
  dwg: 'text-orange-500',
  other: 'text-warm-500',
}

const approvalStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-600' },
  submitted: { label: 'Submitted', color: 'bg-stone-100 text-stone-700' },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
  revisions_requested: { label: 'Revisions Requested', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

const extractionStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-warm-100 text-warm-600' },
  processing: { label: 'Processing', color: 'bg-stone-100 text-stone-600' },
  completed: { label: 'Extracted', color: 'bg-green-100 text-green-600' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-600' },
}

const ingestMethodConfig: Record<string, { label: string; icon: typeof Upload }> = {
  upload: { label: 'Upload', icon: Upload },
  email: { label: 'Email', icon: Mail },
  scan: { label: 'Scan', icon: Search },
  api: { label: 'API', icon: Share2 },
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

function FileRow({ file }: { file: DocumentFile }) {
  const FileIcon = fileTypeIcons[file.type] || File
  const iconColor = fileTypeColors[file.type] || 'text-warm-500'
  const isExpiringSoon = file.expiresAt && daysUntil(file.expiresAt) <= 90

  return (
    <div className={cn(
      "flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer group",
      file.status === 'archived' ? "border-warm-200 opacity-60" : "border-warm-200",
      file.status === 'legal_hold' ? "border-amber-300 bg-amber-50/30" : "",
    )}>
      <div className={cn("flex-shrink-0", iconColor)}>
        <FileIcon className="h-8 w-8" />
      </div>

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
              Portal
            </span>
          )}
          {file.status === 'archived' && (
            <span className="text-xs bg-warm-100 text-warm-500 px-1.5 py-0.5 rounded">Archived</span>
          )}
          {file.status === 'legal_hold' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Lock className="h-3 w-3" />
              Legal Hold
            </span>
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
          {file.aiConfidence !== undefined && file.aiConfidence < 0.9 && (
            <span className="text-xs text-amber-600">
              {Math.round(file.aiConfidence * 100)}% conf.
            </span>
          )}
          {file.extractionStatus && file.extractionStatus !== 'completed' && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded", extractionStatusConfig[file.extractionStatus]?.color)}>
              {extractionStatusConfig[file.extractionStatus]?.label}
            </span>
          )}
          {file.ingestedVia && file.ingestedVia !== 'upload' && (
            <span className="text-xs text-warm-400 flex items-center gap-0.5">
              via {ingestMethodConfig[file.ingestedVia]?.label}
            </span>
          )}
        </div>
        {/* Cross-module connection badges */}
        {file.linkedEntities.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {file.linkedEntities.map((entity, idx) => (
              <span
                key={idx}
                className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded"
              >
                {entity.label}
              </span>
            ))}
          </div>
        )}
        {/* Tags */}
        {file.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Tag className="h-3 w-3 text-warm-400" />
            {file.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs text-warm-500">{tag}{idx < Math.min(file.tags.length, 3) - 1 ? ',' : ''}</span>
            ))}
            {file.tags.length > 3 && <span className="text-xs text-warm-400">+{file.tags.length - 3}</span>}
          </div>
        )}
        {/* Approval workflow status */}
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

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 hover:bg-warm-100 rounded" title="Preview">
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

export function DocumentsPreview() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('All Types')
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses')
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
        if (statusFilter === 'Pending Review' && !file.approvalStatus?.includes('review')) return false
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
  const storageQuota = 250 // GB - Professional tier
  const storageUsedGB = totalSize / 1073741824
  const storagePercent = Math.round((storageUsedGB / storageQuota) * 100)

  const expiringCount = mockFiles.filter(f => f.expiresAt && daysUntil(f.expiresAt) <= 90).length
  const pendingApprovalCount = mockFiles.filter(f => f.approvalStatus === 'under_review' || f.approvalStatus === 'submitted').length
  const aiProcessedCount = mockFiles.filter(f => f.extractionStatus === 'completed').length
  const recentUploads = mockFiles.filter(f => {
    const daysDiff = daysUntil(f.dateModified)
    return daysDiff >= -7 && daysDiff <= 0
  }).length

  const aiFeatures = [
    {
      feature: 'Document Classification',
      trigger: 'On submission',
      insight: 'Auto-categorizes uploaded docs into folders based on content analysis, file names, and metadata.',
      severity: 'info' as const,
      confidence: 96,
      detail: `${aiProcessedCount} documents classified automatically. AI identified document types including contracts, permits, invoices, and submittals.`,
    },
    {
      feature: 'OCR Extraction',
      trigger: 'On submission',
      insight: 'Extracts text from scanned documents using OCR, making them searchable and enabling data extraction.',
      severity: 'info' as const,
      confidence: 92,
      detail: 'Text extracted from PDFs and images. Key data fields identified: dates, amounts, vendor names, and permit numbers.',
    },
    {
      feature: 'Expiration Tracking',
      trigger: 'Daily',
      insight: `Alerts for expiring documents. ${expiringCount} document${expiringCount !== 1 ? 's' : ''} expiring within 90 days including permits, COIs, and licenses.`,
      severity: expiringCount > 0 ? 'warning' as const : 'success' as const,
      confidence: 98,
      action: expiringCount > 0 ? {
        label: 'View Expiring',
        onClick: () => {},
      } : undefined,
    },
    {
      feature: 'Version Control',
      trigger: 'On change',
      insight: 'Tracks document versions automatically, maintaining revision history and highlighting changes between versions.',
      severity: 'info' as const,
      confidence: 95,
      detail: 'Version history maintained for all documents. Current active versions displayed with revision markers.',
    },
    {
      feature: 'Search Intelligence',
      trigger: 'Real-time',
      insight: 'AI-powered document search across file names, extracted text, tags, and metadata for instant results.',
      severity: 'info' as const,
      confidence: 94,
      detail: `${aiProcessedCount} documents indexed and searchable. Natural language queries supported for finding relevant documents.`,
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Documents & Files</h3>
          <span className="text-sm text-warm-500">{totalFiles} active files | {totalSizeFormatted} used</span>
          <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
            {storagePercent}% of {storageQuota} GB quota
          </span>
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
            { icon: Mail, label: 'Email Inbox', onClick: () => {} },
            { icon: Upload, label: 'Upload Files', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredFiles.length}
          totalCount={mockFiles.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <File className="h-4 w-4" />
              Total Files
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalFiles}</div>
            <div className="text-xs text-warm-400 mt-0.5">{recentUploads} added this week</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <HardDrive className="h-4 w-4" />
              Storage
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{totalSizeFormatted}</div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-1">
              <div className="bg-stone-600 h-1.5 rounded-full" style={{ width: `${Math.min(storagePercent, 100)}%` }} />
            </div>
          </div>
          <div className={cn("rounded-lg p-3", expiringCount > 0 ? "bg-amber-50" : "bg-green-50")}>
            <div className={cn("flex items-center gap-2 text-sm", expiringCount > 0 ? "text-amber-600" : "text-green-600")}>
              <AlertTriangle className="h-4 w-4" />
              Expiring
            </div>
            <div className={cn("text-xl font-bold mt-1", expiringCount > 0 ? "text-amber-700" : "text-green-700")}>{expiringCount}</div>
            <div className="text-xs text-warm-400 mt-0.5">within 90 days</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Submittals
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{pendingApprovalCount}</div>
            <div className="text-xs text-warm-400 mt-0.5">pending review</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-indigo-600 text-sm">
              <Brain className="h-4 w-4" />
              AI Processed
            </div>
            <div className="text-xl font-bold text-indigo-700 mt-1">{aiProcessedCount}</div>
            <div className="text-xs text-warm-400 mt-0.5">of {mockFiles.length} total</div>
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

          {/* Email Inbox Section */}
          <div className="pt-2 border-t border-warm-200">
            <button className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-warm-300 text-left w-full hover:bg-warm-50">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-warm-900 text-sm">Email Inbox</div>
                <div className="text-xs text-warm-500">3 new documents</div>
              </div>
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 p-4 max-h-[450px] overflow-y-auto">
          <div className="space-y-2">
            {filteredFiles.length > 0 ? (
              filteredFiles.map(file => (
                <FileRow key={file.id} file={file} />
              ))
            ) : (
              <div className="text-center py-12 text-warm-400">
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
            <span className="font-medium text-sm text-amber-800">Document Intelligence:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {expiringCount} document{expiringCount !== 1 ? 's' : ''} expiring within 90 days
            </span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" />
              {aiProcessedCount} files AI-extracted and searchable
            </span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              1 submittal overdue for architect review
            </span>
            <span className="text-amber-400">|</span>
            <span>Missing: Electrical inspection report for rough-in phase</span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-200 px-4 py-4">
        <AIFeaturesPanel
          title="Document AI Features"
          features={aiFeatures}
          columns={2}
        />
      </div>
    </div>
  )
}
