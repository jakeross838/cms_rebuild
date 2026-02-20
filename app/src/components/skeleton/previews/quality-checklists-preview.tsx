'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Star,
  Copy,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Camera,
  FileSignature,
  Ruler,
  GitBranch,
  Lock,
  Building2,
  Sparkles,
  Tag,
  Hash,
  Eye,
  Layers,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InspectionStatus = 'in_progress' | 'pending_approval' | 'completed' | 'not_started'

interface ActiveInspection {
  id: string
  name: string
  status: InspectionStatus
  completedItems: number
  totalItems: number
  ftqScore: number
  assignedInspector: string
  dueDate: string
  trade: string
  phase: string
  projectName: string
  lotNumber: string
}

interface ChecklistTemplate {
  id: string
  name: string
  tradeCategory: string
  itemCount: number
  isSystem: boolean
  rating: number
  usageCount: number
  lastModified: string
  description: string
}

interface FTQByTrade {
  trade: string
  score: number
  inspectionCount: number
  trend: 'up' | 'down' | 'stable'
}

interface FTQByProject {
  projectName: string
  score: number
  inspectionCount: number
  passRate: number
}

interface LowFTQAlert {
  vendorName: string
  trade: string
  ftqScore: number
  threshold: number
  recentInspections: number
}

interface ChecklistSection {
  id: string
  name: string
  items: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  number: string
  description: string
  valueType: 'pass_fail' | 'measurement' | 'photo' | 'signature' | 'text'
  isFTQRated: boolean
  isConditional: boolean
  conditionDescription?: string
  result?: 'pass' | 'fail' | 'na' | null
  measurementValue?: number
  measurementMin?: number
  measurementMax?: number
  measurementUnit?: string
  hasPhoto: boolean
  photoCount: number
  isApprovalGate: boolean
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockActiveInspections: ActiveInspection[] = [
  {
    id: '1',
    name: 'Pre-Drywall Walkthrough - Lot 47',
    status: 'in_progress',
    completedItems: 18,
    totalItems: 25,
    ftqScore: 94,
    assignedInspector: 'Mike Thompson',
    dueDate: 'Feb 14, 2026',
    trade: 'Drywall',
    phase: 'Rough-In Complete',
    projectName: 'Smith Residence',
    lotNumber: 'Lot 47',
  },
  {
    id: '2',
    name: 'Framing Rough Inspection - Lot 52',
    status: 'pending_approval',
    completedItems: 32,
    totalItems: 32,
    ftqScore: 98,
    assignedInspector: 'Sarah Chen',
    dueDate: 'Feb 13, 2026',
    trade: 'Framing',
    phase: 'Framing',
    projectName: 'Johnson Beach House',
    lotNumber: 'Lot 52',
  },
  {
    id: '3',
    name: 'Electrical Rough-In - Lot 47',
    status: 'in_progress',
    completedItems: 12,
    totalItems: 28,
    ftqScore: 89,
    assignedInspector: 'Tom Wilson',
    dueDate: 'Feb 15, 2026',
    trade: 'Electrical',
    phase: 'Rough-In',
    projectName: 'Smith Residence',
    lotNumber: 'Lot 47',
  },
  {
    id: '4',
    name: 'HVAC Startup & Balance - Lot 38',
    status: 'completed',
    completedItems: 20,
    totalItems: 20,
    ftqScore: 100,
    assignedInspector: 'Carlos Mendez',
    dueDate: 'Feb 12, 2026',
    trade: 'HVAC',
    phase: 'MEP Final',
    projectName: 'Harbor View Custom Home',
    lotNumber: 'Lot 38',
  },
  {
    id: '5',
    name: 'Pre-Pour Foundation - Lot 61',
    status: 'not_started',
    completedItems: 0,
    totalItems: 18,
    ftqScore: 0,
    assignedInspector: 'Mike Thompson',
    dueDate: 'Feb 16, 2026',
    trade: 'Foundation',
    phase: 'Foundation',
    projectName: 'Miller Addition',
    lotNumber: 'Lot 61',
  },
]

const mockTemplates: ChecklistTemplate[] = [
  {
    id: '1',
    name: 'Pre-Pour Foundation Checklist',
    tradeCategory: 'Foundation',
    itemCount: 18,
    isSystem: true,
    rating: 4.8,
    usageCount: 342,
    lastModified: 'Jan 15, 2026',
    description: 'Comprehensive foundation inspection before concrete pour',
  },
  {
    id: '2',
    name: 'Framing Rough Inspection',
    tradeCategory: 'Framing',
    itemCount: 32,
    isSystem: true,
    rating: 4.9,
    usageCount: 518,
    lastModified: 'Jan 20, 2026',
    description: 'Structural framing verification per IRC 2021',
  },
  {
    id: '3',
    name: 'Pre-Drywall Walkthrough',
    tradeCategory: 'Drywall',
    itemCount: 25,
    isSystem: true,
    rating: 4.7,
    usageCount: 456,
    lastModified: 'Feb 1, 2026',
    description: 'Final inspection before drywall installation',
  },
  {
    id: '4',
    name: 'Electrical Rough-In',
    tradeCategory: 'Electrical',
    itemCount: 28,
    isSystem: true,
    rating: 4.6,
    usageCount: 389,
    lastModified: 'Jan 28, 2026',
    description: 'Electrical rough-in per NEC 2023 requirements',
  },
  {
    id: '5',
    name: 'HVAC Startup & Balance',
    tradeCategory: 'HVAC',
    itemCount: 20,
    isSystem: true,
    rating: 4.5,
    usageCount: 267,
    lastModified: 'Feb 5, 2026',
    description: 'HVAC system commissioning and air balance verification',
  },
  {
    id: '6',
    name: 'Pre-Closing Walkthrough',
    tradeCategory: 'General',
    itemCount: 45,
    isSystem: true,
    rating: 4.9,
    usageCount: 623,
    lastModified: 'Feb 8, 2026',
    description: 'Final quality walkthrough before homeowner closing',
  },
  {
    id: '7',
    name: 'Daily Safety Checklist',
    tradeCategory: 'Safety',
    itemCount: 15,
    isSystem: true,
    rating: 4.4,
    usageCount: 1247,
    lastModified: 'Jan 10, 2026',
    description: 'Daily jobsite safety verification checklist',
  },
  {
    id: '8',
    name: 'Plumbing Rough-In',
    tradeCategory: 'Plumbing',
    itemCount: 24,
    isSystem: true,
    rating: 4.7,
    usageCount: 398,
    lastModified: 'Jan 25, 2026',
    description: 'Plumbing rough-in inspection per IPC 2021',
  },
  {
    id: '9',
    name: 'Custom Roofing Inspection',
    tradeCategory: 'Roofing',
    itemCount: 22,
    isSystem: false,
    rating: 4.3,
    usageCount: 89,
    lastModified: 'Feb 10, 2026',
    description: 'Custom roofing checklist for coastal high-wind zone',
  },
  {
    id: '10',
    name: 'Insulation Inspection',
    tradeCategory: 'Insulation',
    itemCount: 16,
    isSystem: true,
    rating: 4.5,
    usageCount: 312,
    lastModified: 'Jan 30, 2026',
    description: 'Insulation installation verification per IECC 2021',
  },
]

const mockFTQByTrade: FTQByTrade[] = [
  { trade: 'Foundation', score: 96, inspectionCount: 45, trend: 'up' },
  { trade: 'Framing', score: 94, inspectionCount: 62, trend: 'stable' },
  { trade: 'Electrical', score: 91, inspectionCount: 48, trend: 'down' },
  { trade: 'Plumbing', score: 89, inspectionCount: 41, trend: 'up' },
  { trade: 'HVAC', score: 97, inspectionCount: 35, trend: 'up' },
  { trade: 'Drywall', score: 93, inspectionCount: 52, trend: 'stable' },
  { trade: 'Roofing', score: 95, inspectionCount: 38, trend: 'up' },
  { trade: 'Insulation', score: 92, inspectionCount: 44, trend: 'down' },
]

const mockFTQByProject: FTQByProject[] = [
  { projectName: 'Smith Residence', score: 94, inspectionCount: 18, passRate: 92 },
  { projectName: 'Johnson Beach House', score: 97, inspectionCount: 24, passRate: 98 },
  { projectName: 'Harbor View Custom Home', score: 91, inspectionCount: 31, passRate: 88 },
  { projectName: 'Miller Addition', score: 96, inspectionCount: 12, passRate: 95 },
  { projectName: 'Coastal Retreat', score: 89, inspectionCount: 28, passRate: 85 },
]

const mockLowFTQAlerts: LowFTQAlert[] = [
  { vendorName: 'ABC Framing', trade: 'Framing', ftqScore: 78, threshold: 85, recentInspections: 8 },
  { vendorName: 'Coastal Electric', trade: 'Electrical', ftqScore: 82, threshold: 85, recentInspections: 12 },
  { vendorName: 'Quality Insulation Co', trade: 'Insulation', ftqScore: 79, threshold: 85, recentInspections: 6 },
]

const mockChecklistSections: ChecklistSection[] = [
  {
    id: '1',
    name: 'Site Preparation',
    items: [
      {
        id: '1-1',
        number: '1.1',
        description: 'Excavation depth matches engineered plans',
        valueType: 'measurement',
        isFTQRated: true,
        isConditional: false,
        result: 'pass',
        measurementValue: 48,
        measurementMin: 46,
        measurementMax: 50,
        measurementUnit: 'inches',
        hasPhoto: true,
        photoCount: 2,
        isApprovalGate: false,
      },
      {
        id: '1-2',
        number: '1.2',
        description: 'Soil compaction test passed',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: false,
        result: 'pass',
        hasPhoto: true,
        photoCount: 1,
        isApprovalGate: true,
      },
      {
        id: '1-3',
        number: '1.3',
        description: 'Vapor barrier installed and sealed',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: false,
        result: 'pass',
        hasPhoto: false,
        photoCount: 0,
        isApprovalGate: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Reinforcement',
    items: [
      {
        id: '2-1',
        number: '2.1',
        description: 'Rebar size matches spec (#4 minimum)',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: false,
        result: 'pass',
        hasPhoto: true,
        photoCount: 3,
        isApprovalGate: false,
      },
      {
        id: '2-2',
        number: '2.2',
        description: 'Rebar spacing within tolerance',
        valueType: 'measurement',
        isFTQRated: true,
        isConditional: false,
        result: 'fail',
        measurementValue: 14,
        measurementMin: 10,
        measurementMax: 12,
        measurementUnit: 'inches',
        hasPhoto: true,
        photoCount: 2,
        isApprovalGate: false,
      },
      {
        id: '2-3',
        number: '2.3',
        description: 'Rebar chairs at proper height',
        valueType: 'measurement',
        isFTQRated: true,
        isConditional: false,
        result: 'pass',
        measurementValue: 3,
        measurementMin: 2.5,
        measurementMax: 3.5,
        measurementUnit: 'inches',
        hasPhoto: false,
        photoCount: 0,
        isApprovalGate: false,
      },
      {
        id: '2-4',
        number: '2.4',
        description: 'Post-tension cables installed (if applicable)',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: true,
        conditionDescription: 'Only if engineered plans specify post-tension foundation',
        result: 'na',
        hasPhoto: false,
        photoCount: 0,
        isApprovalGate: false,
      },
    ],
  },
  {
    id: '3',
    name: 'MEP Rough-In Verification',
    items: [
      {
        id: '3-1',
        number: '3.1',
        description: 'Plumbing stubs in correct locations',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: false,
        result: 'pass',
        hasPhoto: true,
        photoCount: 4,
        isApprovalGate: false,
      },
      {
        id: '3-2',
        number: '3.2',
        description: 'Electrical conduit in slab per plan',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: false,
        result: null,
        hasPhoto: false,
        photoCount: 0,
        isApprovalGate: false,
      },
      {
        id: '3-3',
        number: '3.3',
        description: 'Anchor bolt locations verified',
        valueType: 'pass_fail',
        isFTQRated: true,
        isConditional: false,
        result: null,
        hasPhoto: false,
        photoCount: 0,
        isApprovalGate: true,
      },
    ],
  },
  {
    id: '4',
    name: 'Final Approval',
    items: [
      {
        id: '4-1',
        number: '4.1',
        description: 'Engineer signature obtained',
        valueType: 'signature',
        isFTQRated: false,
        isConditional: false,
        result: null,
        hasPhoto: false,
        photoCount: 0,
        isApprovalGate: true,
      },
      {
        id: '4-2',
        number: '4.2',
        description: 'Photo documentation complete',
        valueType: 'photo',
        isFTQRated: false,
        isConditional: false,
        result: null,
        hasPhoto: true,
        photoCount: 8,
        isApprovalGate: false,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-warm-100 text-warm-700',
    icon: Clock,
    iconColor: 'text-warm-500',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-stone-100 text-stone-700',
    icon: Clock,
    iconColor: 'text-stone-500',
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
  },
}

const valueTypeIcons = {
  pass_fail: CheckCircle2,
  measurement: Ruler,
  photo: Camera,
  signature: FileSignature,
  text: ClipboardCheck,
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function ProgressBar({ completed, total, className }: { completed: number; total: number; className?: string }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-warm-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-stone-500' : 'bg-amber-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-warm-500 whitespace-nowrap">
        {completed} of {total}
      </span>
    </div>
  )
}

function FTQBadge({ score, size = 'default' }: { score: number; size?: 'default' | 'large' }) {
  const getColor = () => {
    if (score >= 95) return 'bg-green-100 text-green-700 border-green-200'
    if (score >= 85) return 'bg-stone-100 text-stone-700 border-stone-200'
    if (score >= 75) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  if (size === 'large') {
    return (
      <div className={cn('flex flex-col items-center p-4 rounded-lg border', getColor())}>
        <span className="text-3xl font-bold">{score}%</span>
        <span className="text-sm font-medium">FTQ Score</span>
      </div>
    )
  }

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', getColor())}>
      {score}% FTQ
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3 w-3',
            star <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-warm-300'
          )}
        />
      ))}
      <span className="ml-1 text-xs text-warm-500">{rating.toFixed(1)}</span>
    </div>
  )
}

function InspectionCard({ inspection }: { inspection: ActiveInspection }) {
  const config = statusConfig[inspection.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
              inspection.status === 'completed'
                ? 'bg-green-50'
                : inspection.status === 'pending_approval'
                ? 'bg-amber-50'
                : inspection.status === 'in_progress'
                ? 'bg-stone-50'
                : 'bg-warm-50'
            )}
          >
            <StatusIcon className={cn('h-5 w-5', config.iconColor)} />
          </div>
          <div>
            <h4 className="font-medium text-warm-900">{inspection.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded font-medium', config.color)}>
                {config.label}
              </span>
              <FTQBadge score={inspection.ftqScore} />
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-warm-400" />
      </div>

      <ProgressBar completed={inspection.completedItems} total={inspection.totalItems} className="mb-3" />

      <div className="flex items-center gap-4 text-sm text-warm-500 flex-wrap">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {inspection.assignedInspector}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {inspection.dueDate}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100">
        <span className="text-xs bg-warm-100 text-warm-700 px-2 py-0.5 rounded flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {inspection.trade}
        </span>
        <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {inspection.phase}
        </span>
        <span className="text-xs text-warm-400 ml-auto flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {inspection.projectName}
        </span>
      </div>
    </div>
  )
}

function TemplateCard({ template, onClone }: { template: ChecklistTemplate; onClone: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-warm-900">{template.name}</h4>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded font-medium',
                template.isSystem ? 'bg-stone-100 text-stone-700' : 'bg-warm-100 text-warm-700'
              )}
            >
              {template.isSystem ? 'System' : 'Custom'}
            </span>
          </div>
          <p className="text-sm text-warm-500 line-clamp-2">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm text-warm-500">
        <span className="flex items-center gap-1 bg-warm-100 px-2 py-0.5 rounded">
          <Tag className="h-3 w-3" />
          {template.tradeCategory}
        </span>
        <span className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {template.itemCount} items
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100">
        <div className="flex items-center gap-3">
          <StarRating rating={template.rating} />
          <span className="text-xs text-warm-400">{template.usageCount} uses</span>
        </div>
        <button
          onClick={onClone}
          className="flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50 rounded transition-colors"
        >
          <Copy className="h-3 w-3" />
          Clone
        </button>
      </div>
    </div>
  )
}

function FTQDashboardContent() {
  const overallFTQ = 93
  const trendDirection = 'up'
  const trendValue = 2.3

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-warm-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-warm-500">Overall FTQ Score</span>
            <div className="flex items-center gap-1 text-green-600">
              {trendDirection === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">+{trendValue}%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-warm-900">{overallFTQ}%</div>
          <p className="text-xs text-warm-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg border border-warm-200 p-4">
          <span className="text-sm text-warm-500">Total Inspections</span>
          <div className="text-3xl font-bold text-warm-900 mt-2">347</div>
          <p className="text-xs text-warm-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-lg border border-warm-200 p-4">
          <span className="text-sm text-warm-500">Pass Rate</span>
          <div className="text-3xl font-bold text-green-600 mt-2">94.2%</div>
          <p className="text-xs text-warm-500 mt-1">First-time pass</p>
        </div>

        <div className="bg-white rounded-lg border border-warm-200 p-4">
          <span className="text-sm text-warm-500">Active Alerts</span>
          <div className="text-3xl font-bold text-amber-600 mt-2">{mockLowFTQAlerts.length}</div>
          <p className="text-xs text-warm-500 mt-1">Below threshold</p>
        </div>
      </div>

      {/* FTQ by Trade - Bar Chart Mock */}
      <div className="bg-white rounded-lg border border-warm-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-warm-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-stone-600" />
            FTQ Score by Trade
          </h4>
          <span className="text-xs text-warm-500">Based on {mockFTQByTrade.reduce((a, t) => a + t.inspectionCount, 0)} inspections</span>
        </div>
        <div className="space-y-3">
          {mockFTQByTrade.map((trade) => (
            <div key={trade.trade} className="flex items-center gap-3">
              <span className="w-24 text-sm text-warm-600">{trade.trade}</span>
              <div className="flex-1 h-6 bg-warm-100 rounded overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded transition-all flex items-center justify-end pr-2',
                    trade.score >= 95 ? 'bg-green-500' : trade.score >= 85 ? 'bg-stone-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${trade.score}%` }}
                >
                  <span className="text-xs font-medium text-white">{trade.score}%</span>
                </div>
              </div>
              <div className="w-16 flex items-center gap-1">
                {trade.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trade.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {trade.trend === 'stable' && <span className="text-xs text-warm-400">--</span>}
                <span className="text-xs text-warm-500">({trade.inspectionCount})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* FTQ by Project */}
        <div className="bg-white rounded-lg border border-warm-200 p-4">
          <h4 className="font-medium text-warm-900 mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-stone-600" />
            FTQ by Project
          </h4>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-warm-500 border-b border-warm-100">
                <th className="text-left pb-2 font-medium">Project</th>
                <th className="text-center pb-2 font-medium">FTQ</th>
                <th className="text-center pb-2 font-medium">Pass Rate</th>
                <th className="text-center pb-2 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {mockFTQByProject.map((project) => (
                <tr key={project.projectName} className="border-b border-warm-50 last:border-0">
                  <td className="py-2 text-sm text-warm-900">{project.projectName}</td>
                  <td className="py-2 text-center">
                    <FTQBadge score={project.score} />
                  </td>
                  <td className="py-2 text-center text-sm text-warm-600">{project.passRate}%</td>
                  <td className="py-2 text-center text-sm text-warm-500">{project.inspectionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low FTQ Alerts */}
        <div className="bg-white rounded-lg border border-amber-200 p-4">
          <h4 className="font-medium text-warm-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Low FTQ Alerts
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
              {mockLowFTQAlerts.length} vendors below threshold
            </span>
          </h4>
          <div className="space-y-3">
            {mockLowFTQAlerts.map((alert) => (
              <div
                key={alert.vendorName}
                className="p-3 bg-amber-50 border border-amber-100 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-warm-900">{alert.vendorName}</span>
                  <span className="text-sm text-red-600 font-medium">{alert.ftqScore}% FTQ</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-warm-500">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {alert.trade}
                  </span>
                  <span>Threshold: {alert.threshold}%</span>
                  <span>{alert.recentInspections} recent inspections</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FTQ Trend Sparkline (simplified mock) */}
      <div className="bg-white rounded-lg border border-warm-200 p-4">
        <h4 className="font-medium text-warm-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          FTQ Trend (Last 12 Weeks)
        </h4>
        <div className="flex items-end gap-1 h-24">
          {[88, 89, 90, 89, 91, 92, 91, 93, 92, 94, 93, 93].map((value, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-full rounded-t transition-all',
                  value >= 93 ? 'bg-green-500' : value >= 90 ? 'bg-stone-500' : 'bg-amber-500'
                )}
                style={{ height: `${(value - 85) * 6}px` }}
              />
              <span className="text-[10px] text-warm-400">W{idx + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-warm-500">
          <span>12 weeks ago: 88%</span>
          <span>Current: 93% (+5.7%)</span>
        </div>
      </div>
    </div>
  )
}

function ChecklistDetailSection() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['1', '2', '3', '4'])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    )
  }

  const getValueTypeIcon = (type: ChecklistItem['valueType']) => {
    const Icon = valueTypeIcons[type]
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
      <div className="p-4 border-b border-warm-200 bg-warm-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-warm-900">Pre-Pour Foundation Checklist</h4>
            <p className="text-sm text-warm-500">Smith Residence - Lot 47</p>
          </div>
          <div className="flex items-center gap-3">
            <FTQBadge score={89} />
            <ProgressBar completed={8} total={12} />
          </div>
        </div>
      </div>

      <div className="divide-y divide-warm-100">
        {mockChecklistSections.map((section) => (
          <div key={section.id}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-warm-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="h-4 w-4 text-warm-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-warm-400" />
                )}
                <span className="font-medium text-warm-900">{section.name}</span>
                <span className="text-xs text-warm-500">
                  ({section.items.filter((i) => i.result).length}/{section.items.length} complete)
                </span>
              </div>
              {section.items.some((i) => i.isApprovalGate) && (
                <span className="text-xs bg-warm-100 text-warm-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Approval Gate
                </span>
              )}
            </button>

            {/* Section Items */}
            {expandedSections.includes(section.id) && (
              <div className="border-t border-warm-100">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 border-b border-warm-50 last:border-0',
                      item.isApprovalGate && 'bg-warm-50',
                      item.result === 'fail' && 'bg-red-50'
                    )}
                  >
                    {/* Item Number */}
                    <span className="text-sm font-medium text-warm-500 w-10">{item.number}</span>

                    {/* Value Type Icon */}
                    <div
                      className={cn(
                        'p-1.5 rounded',
                        item.valueType === 'pass_fail' && 'bg-green-100 text-green-600',
                        item.valueType === 'measurement' && 'bg-stone-100 text-stone-600',
                        item.valueType === 'photo' && 'bg-warm-100 text-stone-600',
                        item.valueType === 'signature' && 'bg-amber-100 text-amber-600',
                        item.valueType === 'text' && 'bg-warm-100 text-warm-600'
                      )}
                    >
                      {getValueTypeIcon(item.valueType)}
                    </div>

                    {/* Description + indicators */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-warm-900">{item.description}</span>
                        {item.isFTQRated && (
                          <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                            FTQ
                          </span>
                        )}
                        {item.isConditional && (
                          <span
                            className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
                            title={item.conditionDescription}
                          >
                            <GitBranch className="h-2.5 w-2.5" />
                            Conditional
                          </span>
                        )}
                        {item.isApprovalGate && (
                          <span className="text-[10px] bg-warm-100 text-warm-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5" />
                            Gate
                          </span>
                        )}
                      </div>
                      {/* Measurement display */}
                      {item.valueType === 'measurement' && item.measurementMin !== undefined && (
                        <div className="text-xs text-warm-500 mt-0.5">
                          Range: {item.measurementMin} - {item.measurementMax} {item.measurementUnit}
                          {item.measurementValue !== undefined && (
                            <span
                              className={cn(
                                'ml-2 font-medium',
                                item.result === 'pass' ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              Actual: {item.measurementValue} {item.measurementUnit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Result */}
                    <div className="flex items-center gap-2">
                      {item.hasPhoto && (
                        <span className="text-xs text-warm-400 flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {item.photoCount}
                        </span>
                      )}
                      {item.result === 'pass' && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Pass
                        </span>
                      )}
                      {item.result === 'fail' && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                          <XCircle className="h-3 w-3" />
                          Fail
                        </span>
                      )}
                      {item.result === 'na' && (
                        <span className="text-xs bg-warm-100 text-warm-500 px-2 py-1 rounded font-medium">
                          N/A
                        </span>
                      )}
                      {item.result === null && (
                        <span className="text-xs text-warm-400 px-2 py-1">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function QualityChecklistsPreview() {
  const [tradeFilter, setTradeFilter] = useState<string>('all')
  const [showDetailView, setShowDetailView] = useState(false)
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } =
    useFilterState({ defaultTab: 'inspections' })

  const trades = [...new Set(mockActiveInspections.map((i) => i.trade))]
  const tradeCategories = [...new Set(mockTemplates.map((t) => t.tradeCategory))]

  const filteredInspections = sortItems(
    mockActiveInspections.filter((i) => {
      if (!matchesSearch(i, search, ['name', 'assignedInspector', 'trade', 'phase', 'projectName'])) return false
      if (tradeFilter !== 'all' && i.trade !== tradeFilter) return false
      return true
    }),
    activeSort as keyof ActiveInspection | '',
    sortDirection
  )

  const filteredTemplates = sortItems(
    mockTemplates.filter((t) => {
      if (!matchesSearch(t, search, ['name', 'tradeCategory', 'description'])) return false
      if (tradeFilter !== 'all' && t.tradeCategory !== tradeFilter) return false
      return true
    }),
    activeSort as keyof ChecklistTemplate | '',
    sortDirection
  )

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Quality Checklists</h3>
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
                <Shield className="h-3 w-3" />
                FTQ360 Enabled
              </span>
            </div>
            <p className="text-sm text-warm-500 mt-0.5">
              Manage quality inspections, templates, and FTQ metrics
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors">
            <Plus className="h-4 w-4" />
            Create New Checklist
          </button>
        </div>
      </div>

      {/* Filter Bar with Tabs */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search checklists, templates, inspectors..."
          tabs={[
            { key: 'inspections', label: 'Active Inspections', count: mockActiveInspections.length },
            { key: 'templates', label: 'Templates', count: mockTemplates.length },
            { key: 'dashboard', label: 'FTQ Dashboard' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={
            activeTab !== 'dashboard'
              ? [
                  {
                    label: 'All Trades',
                    value: tradeFilter,
                    options:
                      activeTab === 'inspections'
                        ? trades.map((t) => ({ value: t, label: t }))
                        : tradeCategories.map((t) => ({ value: t, label: t })),
                    onChange: setTradeFilter,
                  },
                ]
              : []
          }
          sortOptions={
            activeTab === 'inspections'
              ? [
                  { value: 'name', label: 'Name' },
                  { value: 'dueDate', label: 'Due Date' },
                  { value: 'ftqScore', label: 'FTQ Score' },
                  { value: 'assignedInspector', label: 'Inspector' },
                  { value: 'status', label: 'Status' },
                ]
              : activeTab === 'templates'
              ? [
                  { value: 'name', label: 'Name' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'usageCount', label: 'Usage' },
                  { value: 'itemCount', label: 'Item Count' },
                ]
              : []
          }
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={activeTab === 'templates' ? viewMode : undefined}
          onViewModeChange={activeTab === 'templates' ? setViewMode : undefined}
          actions={
            activeTab === 'inspections'
              ? [
                  {
                    icon: Eye,
                    label: showDetailView ? 'Hide Detail' : 'Show Detail',
                    onClick: () => setShowDetailView(!showDetailView),
                  },
                ]
              : activeTab === 'templates'
              ? [{ icon: Settings, label: 'Manage Templates', onClick: () => {} }]
              : []
          }
          resultCount={activeTab === 'inspections' ? filteredInspections.length : filteredTemplates.length}
          totalCount={activeTab === 'inspections' ? mockActiveInspections.length : mockTemplates.length}
        />
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Active Inspections Tab */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-white rounded-lg border border-warm-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-stone-500" />
                  <span className="text-sm text-warm-500">In Progress</span>
                </div>
                <div className="text-2xl font-bold text-stone-600">
                  {mockActiveInspections.filter((i) => i.status === 'in_progress').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-warm-500">Pending Approval</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {mockActiveInspections.filter((i) => i.status === 'pending_approval').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-warm-500">Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {mockActiveInspections.filter((i) => i.status === 'completed').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-stone-600" />
                  <span className="text-sm text-warm-500">Avg FTQ</span>
                </div>
                <div className="text-2xl font-bold text-stone-600">
                  {Math.round(
                    mockActiveInspections
                      .filter((i) => i.ftqScore > 0)
                      .reduce((a, i) => a + i.ftqScore, 0) /
                      mockActiveInspections.filter((i) => i.ftqScore > 0).length
                  )}
                  %
                </div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-warm-500" />
                  <span className="text-sm text-warm-500">Due Today</span>
                </div>
                <div className="text-2xl font-bold text-warm-600">
                  {mockActiveInspections.filter((i) => i.dueDate === 'Feb 13, 2026').length}
                </div>
              </div>
            </div>

            {/* Inspection Cards */}
            <div className="grid grid-cols-2 gap-4">
              {filteredInspections.map((inspection) => (
                <InspectionCard key={inspection.id} inspection={inspection} />
              ))}
            </div>

            {filteredInspections.length === 0 && (
              <div className="text-center py-12 text-warm-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-warm-300" />
                <p>No inspections found matching your criteria</p>
              </div>
            )}

            {/* Checklist Detail View */}
            {showDetailView && (
              <div className="mt-6">
                <h4 className="font-medium text-warm-900 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-stone-600" />
                  Checklist Detail View
                </h4>
                <ChecklistDetailSection />
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3')}>
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onClone={() => {}} />
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-3 text-center py-12 text-warm-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-warm-300" />
                <p>No templates found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* FTQ Dashboard Tab */}
        {activeTab === 'dashboard' && <FTQDashboardContent />}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-stone-50 to-purple-50 border-t border-stone-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-stone-600" />
            <span className="font-medium text-sm text-stone-800">FTQ Intelligence:</span>
          </div>
          <div className="text-sm text-stone-700 space-y-1">
            <p>
              Pre-Drywall inspection Lot 47 is 72% complete. Based on current pace, estimated completion is Feb 14 at 2 PM.
              FTQ score trending strong at 94%.
            </p>
            <p>
              ABC Framing FTQ has dropped below 80% threshold. 3 of last 5 inspections had defects in rebar spacing.
              Recommend pre-inspection QC meeting before next foundation pour.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="border-t border-warm-200 px-4 py-4 bg-white">
        <AIFeaturesPanel
          title="Quality AI Features"
          columns={2}
          features={[
            {
              feature: 'Smart Template Suggestions',
              trigger: 'On-change',
              insight:
                'AI recommends templates based on project phase. For Lot 47 in Rough-In Complete phase, Pre-Drywall Walkthrough template is 96% match.',
              severity: 'info',
              confidence: 96,
            },
            {
              feature: 'Defect Pattern Detection',
              trigger: 'Real-time',
              insight:
                'AI identifies common defects for this trade. Electrical rough-in: 34% of failures are panel clearance issues. Recommend adding explicit 36" measurement check.',
              severity: 'warning',
              confidence: 89,
            },
            {
              feature: 'FTQ Prediction',
              trigger: 'Real-time',
              insight:
                'Based on ABC Framing vendor history (78% FTQ), predicted inspection outcome is 82% pass probability. High risk for rebar spacing defects.',
              severity: 'critical',
              confidence: 78,
            },
            {
              feature: 'Auto-Generated Items',
              trigger: 'On-creation',
              insight:
                'AI suggests 3 additional checklist items based on historical issues at this project: moisture barrier overlap, anchor bolt torque verification, expansion joint placement.',
              severity: 'info',
              confidence: 91,
            },
            {
              feature: 'Photo Analysis Ready',
              trigger: 'On-submission',
              insight:
                'AI will analyze inspection photos for potential defects. Currently trained on: rebar spacing, insulation gaps, electrical clearances, and framing alignment.',
              severity: 'success',
              confidence: 87,
            },
          ]}
        />
      </div>
    </div>
  )
}
