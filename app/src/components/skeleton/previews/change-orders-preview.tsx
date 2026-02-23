'use client'

import { useState } from 'react'

import {
  Plus,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  ClipboardList,
  GitBranch,
  MessageSquare,
  PenLine,
  ShieldCheck,
  Eye,
  Ban,
  Link2,
  Layers,
  BarChart3,
  Camera,
  FileCheck,
  Receipt,
  Signature,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeatureCard, AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

interface ChangeOrder {
  id: string
  coNumber: string
  title: string
  description: string
  // Cost breakdown
  materialsCost: number
  laborCost: number
  equipmentCost: number
  subcontractorCost: number
  subtotal: number
  markupType: 'single_pct' | 'split_oh_profit' | 'tiered' | 'fixed_fee'
  markupPct: number
  markupAmount: number
  totalAmount: number
  isCredit: boolean
  // Source & cause
  sourceType: 'field' | 'client_request' | 'design_change' | 'allowance_overage' | 'code_change' | 'builder_initiated'
  causeCategory: string
  initiatedBy: string
  // Dates
  createdDate: string
  // Schedule
  scheduleImpact: number
  affectedTasks: string[]
  // Status & workflow
  status: 'draft' | 'internal_review' | 'client_presented' | 'negotiation' | 'approved' | 'rejected' | 'withdrawn' | 'voided'
  negotiationStatus?: 'proposed' | 'client_counter' | 'builder_counter' | 'revised' | 'final'
  versionNumber: number
  approvalProgress: { completed: number; total: number }
  internalApprovedAt?: string
  clientApprovedAt?: string
  clientSignature?: boolean
  // Cross-module links
  rfiId?: string
  rfiNumber?: string
  selectionId?: string
  selectionName?: string
  linkedPoIds?: string[]
  costCode: string
  contractId?: string
  // AI
  aiNote?: string
  aiConfidence?: number
  // Documentation completeness
  hasPhotos?: boolean
  hasScopeDescription?: boolean
  hasCostBreakdown?: boolean
  hasClientApproval?: boolean
}

const mockChangeOrders: ChangeOrder[] = [
  {
    id: '1',
    coNumber: 'CO-001',
    title: 'Master bath tile upgrade',
    description: 'Upgraded master bath tile to porcelain slab per owner selection change',
    materialsCost: 3200,
    laborCost: 1200,
    equipmentCost: 0,
    subcontractorCost: 0,
    subtotal: 4400,
    markupType: 'single_pct',
    markupPct: 15,
    markupAmount: 660,
    totalAmount: 5060,
    isCredit: false,
    sourceType: 'client_request',
    causeCategory: 'Client Request',
    initiatedBy: 'Sarah Johnson (Owner)',
    createdDate: '2026-01-15',
    scheduleImpact: 0,
    affectedTasks: [],
    status: 'approved',
    versionNumber: 1,
    approvalProgress: { completed: 2, total: 2 },
    internalApprovedAt: '2026-01-17',
    clientApprovedAt: '2026-01-19',
    clientSignature: true,
    selectionId: 'sel-042',
    selectionName: 'Master Bath Tile',
    costCode: '09 - Finishes',
    hasPhotos: true,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: true,
  },
  {
    id: '2',
    coNumber: 'CO-002',
    title: 'Additional piling - soil conditions',
    description: 'Additional piling due to unexpected rock encountered during excavation. Geotechnical report attached.',
    materialsCost: 8500,
    laborCost: 6200,
    equipmentCost: 2800,
    subcontractorCost: 0,
    subtotal: 17500,
    markupType: 'split_oh_profit',
    markupPct: 20,
    markupAmount: 3500,
    totalAmount: 21000,
    isCredit: false,
    sourceType: 'field',
    causeCategory: 'Unforeseen Condition',
    initiatedBy: 'Carlos Mendez (Super)',
    createdDate: '2026-01-22',
    scheduleImpact: 5,
    affectedTasks: ['Foundation', 'Slab Pour'],
    status: 'approved',
    versionNumber: 2,
    approvalProgress: { completed: 3, total: 3 },
    internalApprovedAt: '2026-01-24',
    clientApprovedAt: '2026-01-28',
    clientSignature: true,
    costCode: '03 - Concrete',
    linkedPoIds: ['PO-2026-0098'],
    aiNote: 'Similar soil issues on 3 nearby coastal projects. Recommend budgeting +10% contingency for coastal sites.',
    aiConfidence: 0.92,
    hasPhotos: true,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: true,
  },
  {
    id: '3',
    coNumber: 'CO-003',
    title: 'Hip roof design modification',
    description: 'Complex hip roof redesign per architect revision. Originating from RFI-012 structural review.',
    materialsCost: 5500,
    laborCost: 4800,
    equipmentCost: 0,
    subcontractorCost: 2500,
    subtotal: 12800,
    markupType: 'single_pct',
    markupPct: 15,
    markupAmount: 1920,
    totalAmount: 14720,
    isCredit: false,
    sourceType: 'design_change',
    causeCategory: 'Design Error',
    initiatedBy: 'David Park (Architect)',
    createdDate: '2026-02-01',
    scheduleImpact: 3,
    affectedTasks: ['Roof Framing', 'Roof Sheathing'],
    status: 'negotiation',
    negotiationStatus: 'client_counter',
    versionNumber: 3,
    approvalProgress: { completed: 2, total: 2 },
    internalApprovedAt: '2026-02-03',
    rfiId: 'rfi-012',
    rfiNumber: 'RFI-012',
    costCode: '06 - Carpentry',
    aiNote: 'Client counter-proposed $12,500. Original: $14,720. Pending 8 days -- follow up recommended.',
    aiConfidence: 0.88,
    hasPhotos: true,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: false,
  },
  {
    id: '4',
    coNumber: 'CO-004',
    title: 'Kitchen appliance upgrade',
    description: 'Kitchen appliance upgrade to Wolf/Sub-Zero package. Allowance overage of $15,200 over original $8,000 allowance.',
    materialsCost: 15200,
    laborCost: 0,
    equipmentCost: 0,
    subcontractorCost: 0,
    subtotal: 15200,
    markupType: 'single_pct',
    markupPct: 10,
    markupAmount: 1520,
    totalAmount: 16720,
    isCredit: false,
    sourceType: 'allowance_overage',
    causeCategory: 'Allowance Overage',
    initiatedBy: 'System (Auto-generated)',
    createdDate: '2026-02-05',
    scheduleImpact: 2,
    affectedTasks: ['Appliance Install'],
    status: 'client_presented',
    versionNumber: 1,
    approvalProgress: { completed: 2, total: 2 },
    internalApprovedAt: '2026-02-06',
    selectionId: 'sel-018',
    selectionName: 'Kitchen Appliances',
    costCode: '11 - Equipment',
    aiNote: 'Auto-generated from selection overage. Allowance: $8,000, Selected: $23,200. Client portal presentation sent Feb 7.',
    hasPhotos: false,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: false,
  },
  {
    id: '5',
    coNumber: 'CO-005',
    title: 'Hurricane shutters - code requirement',
    description: 'Additional hurricane shutters required for windows not in original scope per updated building code interpretation.',
    materialsCost: 6200,
    laborCost: 1800,
    equipmentCost: 0,
    subcontractorCost: 0,
    subtotal: 8000,
    markupType: 'single_pct',
    markupPct: 15,
    markupAmount: 1200,
    totalAmount: 9200,
    isCredit: false,
    sourceType: 'code_change',
    causeCategory: 'Code Change',
    initiatedBy: 'Building Inspector',
    createdDate: '2026-02-08',
    scheduleImpact: 0,
    affectedTasks: [],
    status: 'internal_review',
    versionNumber: 1,
    approvalProgress: { completed: 1, total: 3 },
    costCode: '08 - Doors & Windows',
    aiNote: 'Step 1/3 approved (PM). Awaiting Director review. Auto-escalation in 2 days.',
    hasPhotos: true,
    hasScopeDescription: true,
    hasCostBreakdown: false,
    hasClientApproval: false,
  },
  {
    id: '6',
    coNumber: 'CO-006',
    title: 'Delete guest bath upgrade - credit',
    description: 'Revert guest bath from upgraded spec to standard per owner request. Credit to contract.',
    materialsCost: -1800,
    laborCost: -400,
    equipmentCost: 0,
    subcontractorCost: 0,
    subtotal: -2200,
    markupType: 'single_pct',
    markupPct: 10,
    markupAmount: -220,
    totalAmount: -2420,
    isCredit: true,
    sourceType: 'client_request',
    causeCategory: 'Client Request',
    initiatedBy: 'Sarah Johnson (Owner)',
    createdDate: '2026-02-10',
    scheduleImpact: -1,
    affectedTasks: ['Guest Bath Tile'],
    status: 'approved',
    versionNumber: 1,
    approvalProgress: { completed: 2, total: 2 },
    internalApprovedAt: '2026-02-10',
    clientApprovedAt: '2026-02-11',
    clientSignature: true,
    selectionId: 'sel-045',
    selectionName: 'Guest Bath Tile',
    costCode: '09 - Finishes',
    hasPhotos: true,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: true,
  },
  {
    id: '7',
    coNumber: 'CO-007',
    title: 'Relocate HVAC per structural requirements',
    description: 'HVAC equipment relocation required by structural engineer review. Cost absorbed by design team.',
    materialsCost: 1200,
    laborCost: 1500,
    equipmentCost: 0,
    subcontractorCost: 0,
    subtotal: 2700,
    markupType: 'single_pct',
    markupPct: 15,
    markupAmount: 405,
    totalAmount: 3105,
    isCredit: false,
    sourceType: 'design_change',
    causeCategory: 'Design Error',
    initiatedBy: 'Mike Torres (Engineer)',
    createdDate: '2026-02-12',
    scheduleImpact: 0,
    affectedTasks: [],
    status: 'rejected',
    versionNumber: 1,
    approvalProgress: { completed: 1, total: 2 },
    costCode: '23 - HVAC',
    rfiId: 'rfi-015',
    rfiNumber: 'RFI-015',
    aiNote: 'Rejected: Design team responsible per contract terms. No owner cost impact.',
    hasPhotos: false,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: false,
  },
  {
    id: '8',
    coNumber: 'CO-008',
    title: 'Value engineering - exterior cladding',
    description: 'Switch from imported stone to domestic alternative with similar aesthetic. Cost savings passed to client.',
    materialsCost: -4500,
    laborCost: -800,
    equipmentCost: 0,
    subcontractorCost: 0,
    subtotal: -5300,
    markupType: 'single_pct',
    markupPct: 10,
    markupAmount: -530,
    totalAmount: -5830,
    isCredit: true,
    sourceType: 'builder_initiated',
    causeCategory: 'Value Engineering',
    initiatedBy: 'Jake Ross (PM)',
    createdDate: '2026-02-11',
    scheduleImpact: -3,
    affectedTasks: ['Exterior Cladding'],
    status: 'draft',
    versionNumber: 1,
    approvalProgress: { completed: 0, total: 2 },
    costCode: '04 - Masonry',
    aiNote: 'Domestic stone lead time 2 weeks vs. imported 8 weeks. Schedule improvement of 3 days on critical path.',
    aiConfidence: 0.95,
    hasPhotos: true,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: false,
  },
  {
    id: '9',
    coNumber: 'CO-009',
    title: 'Outdoor kitchen addition - withdrawn',
    description: 'Client requested outdoor kitchen. Withdrawn after cost review.',
    materialsCost: 12000,
    laborCost: 8500,
    equipmentCost: 1200,
    subcontractorCost: 4500,
    subtotal: 26200,
    markupType: 'split_oh_profit',
    markupPct: 20,
    markupAmount: 5240,
    totalAmount: 31440,
    isCredit: false,
    sourceType: 'client_request',
    causeCategory: 'Client Request',
    initiatedBy: 'Sarah Johnson (Owner)',
    createdDate: '2026-01-08',
    scheduleImpact: 10,
    affectedTasks: ['Exterior', 'Plumbing Rough', 'Electrical Rough'],
    status: 'withdrawn',
    versionNumber: 2,
    approvalProgress: { completed: 2, total: 2 },
    internalApprovedAt: '2026-01-10',
    costCode: '12 - Furnishings',
    aiNote: 'Withdrawn by client Jan 15 after cost presentation. Within 48-hour withdrawal window.',
    hasPhotos: false,
    hasScopeDescription: true,
    hasCostBreakdown: true,
    hasClientApproval: false,
  },
]

const statusConfigMap = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-700', icon: FileText },
  internal_review: { label: 'Internal Review', color: 'bg-stone-100 text-stone-700', icon: Eye },
  client_presented: { label: 'Client Presented', color: 'bg-stone-100 text-stone-700', icon: PenLine },
  negotiation: { label: 'Negotiation', color: 'bg-warm-100 text-warm-700', icon: MessageSquare },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-sand-100 text-sand-700', icon: Ban },
  voided: { label: 'Voided', color: 'bg-red-100 text-red-600', icon: XCircle },
}

const sourceTypeConfig: Record<ChangeOrder['sourceType'], { label: string; color: string }> = {
  client_request: { label: 'Client Request', color: 'bg-stone-50 text-stone-700' },
  field: { label: 'Field Condition', color: 'bg-sand-50 text-sand-700' },
  design_change: { label: 'Design Change', color: 'bg-warm-50 text-warm-700' },
  code_change: { label: 'Code Change', color: 'bg-red-50 text-red-700' },
  allowance_overage: { label: 'Allowance Overage', color: 'bg-stone-50 text-stone-700' },
  builder_initiated: { label: 'Builder Initiated', color: 'bg-emerald-50 text-emerald-700' },
}

const negotiationLabels: Record<string, string> = {
  proposed: 'Proposed',
  client_counter: 'Client Counter',
  builder_counter: 'Builder Counter',
  revised: 'Revised',
  final: 'Final',
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value >= 0 ? '+' : '-'
  if (absValue >= 1000000) return sign + '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return sign + '$' + (absValue / 1000).toFixed(1) + 'K'
  return sign + '$' + absValue.toFixed(0)
}

function formatCurrencyPlain(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1000000) return '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return '$' + (absValue / 1000).toFixed(1) + 'K'
  return '$' + absValue.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// AI Feature 4: Documentation Completeness Checker
function DocumentationCompletenessCard({ co }: { co: ChangeOrder }) {
  const items = [
    { key: 'photos', label: 'Photos', icon: Camera, complete: co.hasPhotos ?? false },
    { key: 'scope', label: 'Scope description', icon: FileCheck, complete: co.hasScopeDescription ?? false },
    { key: 'cost', label: 'Cost breakdown', icon: Receipt, complete: co.hasCostBreakdown ?? false },
    { key: 'approval', label: 'Client approval', icon: Signature, complete: co.hasClientApproval ?? false },
  ]

  const completedCount = items.filter(item => item.complete).length
  const readinessPercent = Math.round((completedCount / items.length) * 100)
  const missingItems = items.filter(item => !item.complete)

  if (readinessPercent === 100) return null

  return (
    <AIFeatureCard
      feature="Documentation Completeness"
      trigger="Real-time"
      severity={readinessPercent >= 75 ? 'warning' : 'critical'}
      confidence={readinessPercent}
      insight={`${readinessPercent}% ready for approval. ${missingItems.length} item${missingItems.length !== 1 ? 's' : ''} missing.`}
      detail={missingItems.length > 0 ? `Missing: ${missingItems.map(i => i.label).join(', ')}` : undefined}
      action={missingItems.length > 0 ? { label: 'Add Missing Items', onClick: () => {} } : undefined}
    />
  )
}

// AI Feature 5: Budget Cascade Preview
function BudgetCascadePreview({ co }: { co: ChangeOrder }) {
  if (co.status === 'approved' || co.status === 'rejected' || co.status === 'withdrawn' || co.status === 'voided') {
    return null
  }

  // Mock data for budget cascade
  const currentContingency = 18200
  const newContingency = currentContingency - Math.abs(co.totalAmount)

  return (
    <AIFeatureCard
      feature="Budget Cascade Preview"
      trigger="On change"
      severity={newContingency < 10000 ? 'warning' : 'info'}
      insight="Approval will impact project budget and draw schedule."
      detail={`Update ${co.costCode} budget ${formatCurrency(co.totalAmount)}, ${co.isCredit ? 'increase' : 'reduce'} contingency from ${formatCurrencyPlain(currentContingency)} to ${formatCurrencyPlain(Math.max(0, newContingency))}, adjust Draw #4 by ${formatCurrency(co.totalAmount)}`}
      action={{ label: 'Preview Full Impact', onClick: () => {} }}
    />
  )
}

function ChangeOrderCard({ co }: { co: ChangeOrder }) {
  const statusInfo = statusConfigMap[co.status]
  const sourceInfo = sourceTypeConfig[co.sourceType]
  const StatusIcon = statusInfo.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border border-warm-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      co.isCredit && "border-l-4 border-l-green-400",
      co.status === 'rejected' && "opacity-75",
      co.status === 'withdrawn' && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-semibold text-warm-900">{co.coNumber}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium inline-flex items-center gap-1", statusInfo.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
          {co.versionNumber > 1 && (
            <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <GitBranch className="h-3 w-3" />
              v{co.versionNumber}
            </span>
          )}
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-warm-900 mb-1">{co.title}</h4>
      <p className="text-xs text-warm-500 mb-3 line-clamp-2">{co.description}</p>

      {/* Amount & Source */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "text-lg font-bold",
          co.totalAmount >= 0 ? "text-red-600" : "text-green-600"
        )}>
          {formatCurrency(co.totalAmount)}
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded", sourceInfo.color)}>
          {sourceInfo.label}
        </span>
        {co.isCredit ? <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">
            CREDIT
          </span> : null}
      </div>

      {/* AI Feature 1: Cost Estimation - Comparative Analysis */}
      {co.status !== 'approved' && co.status !== 'rejected' && co.status !== 'withdrawn' && (
        <AIFeatureCard
          feature="Cost Estimation"
          trigger="On creation"
          severity="info"
          confidence={87}
          insight={`Similar ${co.title.toLowerCase().includes('tile') ? 'tile upgrade' : co.title.toLowerCase().includes('roof') ? 'roof modification' : 'change'} on Johnson project cost ${formatCurrencyPlain(Math.round(co.totalAmount * 0.87))}. Current estimate ${formatCurrencyPlain(co.totalAmount)} is ${Math.round((co.totalAmount / (co.totalAmount * 0.87) - 1) * 100)}% higher - consider price escalation factors.`}
          action={{ label: 'Apply Estimate', onClick: () => {} }}
          className="mb-3"
        />
      )}

      {/* Cost breakdown */}
      <div className="bg-warm-50 rounded p-2 mb-3 text-xs text-warm-600">
        <div className="flex items-center justify-between mb-1">
          <span>Subtotal</span>
          <span className="font-medium">{formatCurrencyPlain(Math.abs(co.subtotal))}</span>
        </div>
        <div className="flex items-center gap-3 text-warm-400 mb-1">
          {co.materialsCost !== 0 && <span>Mat: {formatCurrencyPlain(Math.abs(co.materialsCost))}</span>}
          {co.laborCost !== 0 && <span>Lab: {formatCurrencyPlain(Math.abs(co.laborCost))}</span>}
          {co.equipmentCost !== 0 && <span>Equip: {formatCurrencyPlain(Math.abs(co.equipmentCost))}</span>}
          {co.subcontractorCost !== 0 && <span>Sub: {formatCurrencyPlain(Math.abs(co.subcontractorCost))}</span>}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-warm-200">
          <span>Markup ({co.markupPct}%{co.markupType === 'split_oh_profit' ? ' OH+P' : ''})</span>
          <span className="font-medium">{formatCurrencyPlain(Math.abs(co.markupAmount))}</span>
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-3 gap-2 text-xs text-warm-600 mb-3">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span className="truncate">{co.initiatedBy.split('(')[0].trim()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(co.createdDate)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span className={cn(
            co.scheduleImpact > 0 ? "text-amber-600 font-medium" :
            co.scheduleImpact < 0 ? "text-green-600 font-medium" :
            "text-warm-500"
          )}>
            {co.scheduleImpact > 0 ? `+${co.scheduleImpact} days` :
             co.scheduleImpact < 0 ? `${co.scheduleImpact} days` :
             'No impact'}
          </span>
        </div>
      </div>

      {/* AI Feature 2: Schedule Impact Analysis - Enhanced */}
      {co.scheduleImpact !== 0 && co.affectedTasks.length > 0 && (
        <AIFeatureCard
          feature="Schedule Impact Analysis"
          trigger="Real-time"
          severity={co.scheduleImpact > 0 ? 'warning' : 'success'}
          insight={co.scheduleImpact > 0
            ? `This CO adds ${co.scheduleImpact} days to ${co.affectedTasks[0]}. Critical path impact: ${co.affectedTasks.length > 1 ? co.affectedTasks[1] : 'Drywall'} start pushed from Mar 15 to Mar ${15 + co.scheduleImpact}.`
            : `This CO saves ${Math.abs(co.scheduleImpact)} days. Critical path improvement: Project completion advanced.`
          }
          detail={`Cascading effects on ${co.affectedTasks.length} task${co.affectedTasks.length !== 1 ? 's' : ''}: ${co.affectedTasks.join(', ')}`}
          icon={<AlertCircle className="h-4 w-4" />}
          className="mb-3"
        />
      )}

      {/* Approval progress */}
      {(co.status === 'internal_review' || co.status === 'client_presented') && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Approval Progress
            </span>
            <span>{co.approvalProgress.completed}/{co.approvalProgress.total}</span>
          </div>
          <div className="w-full bg-warm-200 rounded-full h-1.5">
            <div
              className="bg-stone-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(co.approvalProgress.completed / co.approvalProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Negotiation status */}
      {co.status === 'negotiation' && co.negotiationStatus ? <div className="mb-3 p-2 bg-warm-50 rounded flex items-center gap-2 text-xs">
          <MessageSquare className="h-3.5 w-3.5 text-stone-600" />
          <span className="text-warm-700 font-medium">
            Negotiation: {negotiationLabels[co.negotiationStatus]}
          </span>
        </div> : null}

      {/* AI Feature 4: Documentation Completeness (before approval) */}
      {(co.status === 'draft' || co.status === 'internal_review' || co.status === 'client_presented') && (
        <div className="mb-3">
          <DocumentationCompletenessCard co={co} />
        </div>
      )}

      {/* AI Feature 5: Budget Cascade Preview */}
      {(co.status === 'draft' || co.status === 'internal_review' || co.status === 'client_presented' || co.status === 'negotiation') && (
        <div className="mb-3">
          <BudgetCascadePreview co={co} />
        </div>
      )}

      {/* Cross-module badges */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-xs bg-warm-50 text-warm-600 px-1.5 py-0.5 rounded">{co.costCode}</span>
        {co.rfiNumber ? <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <Link2 className="h-3 w-3" />
            {co.rfiNumber}
          </span> : null}
        {co.selectionName ? <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <Layers className="h-3 w-3" />
            {co.selectionName}
          </span> : null}
        {co.linkedPoIds && co.linkedPoIds.length > 0 ? <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <FileText className="h-3 w-3" />
            {co.linkedPoIds[0]}
          </span> : null}
        {co.clientSignature ? <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <PenLine className="h-3 w-3" />
            e-Signed
          </span> : null}
      </div>

      {/* AI Note */}
      {co.aiNote ? <div className="mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{co.aiNote}</span>
          {co.aiConfidence !== undefined && co.aiConfidence < 0.95 && (
            <span className="text-xs text-amber-400 flex-shrink-0 ml-auto">
              {Math.round(co.aiConfidence * 100)}%
            </span>
          )}
        </div> : null}
    </div>
  )
}

export function ChangeOrdersPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [causeFilter, setCauseFilter] = useState<string>('all')

  const filtered = sortItems(
    mockChangeOrders.filter(co => {
      if (!matchesSearch(co, search, ['coNumber', 'title', 'description', 'initiatedBy', 'costCode', 'causeCategory'])) return false
      if (activeTab !== 'all' && co.status !== activeTab) return false
      if (sourceFilter !== 'all' && co.sourceType !== sourceFilter) return false
      if (causeFilter !== 'all' && co.causeCategory !== causeFilter) return false
      return true
    }),
    activeSort as keyof ChangeOrder | '',
    sortDirection,
  )

  // Calculate stats
  const totalCOs = mockChangeOrders.length
  const approvedCOs = mockChangeOrders.filter(co => co.status === 'approved')
  const netApprovedAmount = approvedCOs.reduce((sum, co) => sum + co.totalAmount, 0)
  const pendingCOs = mockChangeOrders.filter(co =>
    co.status === 'internal_review' || co.status === 'client_presented' || co.status === 'negotiation' || co.status === 'draft'
  )
  const pendingAmount = pendingCOs.reduce((sum, co) => sum + co.totalAmount, 0)
  const totalScheduleImpact = approvedCOs.reduce((sum, co) => sum + co.scheduleImpact, 0)
  const originalContract = 2450000
  const revisedContract = originalContract + netApprovedAmount

  // Cause categories from mock data
  const causeCategories = [...new Set(mockChangeOrders.map(co => co.causeCategory))]

  // Cause distribution for stats
  const causeTotals = causeCategories.map(cause => ({
    cause,
    count: mockChangeOrders.filter(co => co.causeCategory === cause).length,
    amount: mockChangeOrders.filter(co => co.causeCategory === cause).reduce((sum, co) => sum + co.totalAmount, 0),
  }))
  const topCause = causeTotals.sort((a, b) => b.count - a.count)[0]

  // AI Feature 3: Cause Pattern Detection
  const designErrorCOs = mockChangeOrders.filter(co => co.causeCategory === 'Design Error')
  const designErrorPercent = Math.round((designErrorCOs.length / totalCOs) * 100)
  const portfolioAvgDesignError = 15

  // AI Insights for bottom panel
  const aiInsights = [
    {
      feature: 'Escalation Alert',
      trigger: 'Real-time' as const,
      severity: 'warning' as const,
      insight: 'CO-003 negotiation pending 8 days -- auto-escalation in 2 days',
      action: { label: 'View CO-003', onClick: () => {} },
    },
    {
      feature: 'Cause Pattern Detection',
      trigger: 'Daily' as const,
      severity: designErrorPercent > portfolioAvgDesignError * 2 ? 'critical' as const : 'warning' as const,
      insight: `${designErrorPercent}% of COs on this job from design errors (portfolio avg: ${portfolioAvgDesignError}%). Consider design review process improvements.`,
      detail: `${designErrorCOs.length} design error COs totaling ${formatCurrency(designErrorCOs.reduce((sum, co) => sum + co.totalAmount, 0))}. Pattern suggests early design coordination meetings could reduce CO volume.`,
      action: { label: 'View Recommendations', onClick: () => {} },
    },
    {
      feature: 'Field Conditions Analysis',
      trigger: 'Weekly' as const,
      severity: 'info' as const,
      insight: 'Field conditions: 43% of net change vs. 25% portfolio avg',
    },
    {
      feature: 'CO Rate Benchmark',
      trigger: 'Weekly' as const,
      severity: 'info' as const,
      insight: `CO rate ${((totalCOs / originalContract) * 1000000).toFixed(1)} COs/$1M vs. portfolio avg 5.2`,
    },
    {
      feature: 'Value Engineering',
      trigger: 'On change' as const,
      severity: 'success' as const,
      insight: 'CO-008 saves 3 schedule days on critical path via domestic stone substitution',
      action: { label: 'View Details', onClick: () => {} },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Change Orders - Smith Residence</h3>
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{totalCOs} Total</span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5">
              Original Contract: {formatCurrencyPlain(originalContract)} | Revised: {formatCurrencyPlain(revisedContract)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <ClipboardList className="h-3.5 w-3.5" />
              Total COs
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalCOs}</div>
            <div className="text-xs text-warm-400">{approvedCOs.length} approved</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            netApprovedAmount >= 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              netApprovedAmount >= 0 ? "text-red-600" : "text-green-600"
            )}>
              {netApprovedAmount >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              Net Approved
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              netApprovedAmount >= 0 ? "text-red-700" : "text-green-700"
            )}>
              {formatCurrency(netApprovedAmount)}
            </div>
            <div className="text-xs text-warm-400">{((netApprovedAmount / originalContract) * 100).toFixed(1)}% of contract</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">
              {pendingCOs.length}
            </div>
            <div className="text-xs text-amber-500">{formatCurrency(pendingAmount)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalScheduleImpact > 0 ? "bg-amber-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              totalScheduleImpact > 0 ? "text-amber-600" : "text-green-600"
            )}>
              <Calendar className="h-3.5 w-3.5" />
              Schedule Impact
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              totalScheduleImpact > 0 ? "text-amber-700" : "text-green-700"
            )}>
              {totalScheduleImpact > 0 ? `+${totalScheduleImpact}` : totalScheduleImpact} days
            </div>
            <div className="text-xs text-warm-400">{approvedCOs.filter(co => co.scheduleImpact !== 0).length} COs w/ impact</div>
          </div>
          {/* AI Feature 3: Cause Pattern Detection - Enhanced stat card */}
          <div className={cn(
            "rounded-lg p-3",
            designErrorPercent > portfolioAvgDesignError * 2 ? "bg-red-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              designErrorPercent > portfolioAvgDesignError * 2 ? "text-red-600" : "text-warm-500"
            )}>
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="flex items-center gap-1">
                Top Cause
                {designErrorPercent > portfolioAvgDesignError * 2 && (
                  <AlertTriangle className="h-3 w-3" />
                )}
              </span>
            </div>
            <div className={cn(
              "text-sm font-bold mt-1",
              designErrorPercent > portfolioAvgDesignError * 2 ? "text-red-700" : "text-warm-900"
            )}>
              {topCause?.cause}
            </div>
            <div className="text-xs text-warm-400">
              {topCause?.count} COs ({formatCurrency(topCause?.amount ?? 0)})
            </div>
            {designErrorPercent > portfolioAvgDesignError && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600">
                <Sparkles className="h-2.5 w-2.5" />
                {designErrorPercent}% vs {portfolioAvgDesignError}% avg
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Feature 3: Cause Pattern Detection - Expanded Analysis */}
      {designErrorPercent > portfolioAvgDesignError && (
        <div className="bg-white border-b border-warm-200 px-4 py-3">
          <AIFeatureCard
            feature="Cause Pattern Detection"
            trigger="Daily"
            severity={designErrorPercent > portfolioAvgDesignError * 2 ? 'critical' : 'warning'}
            confidence={92}
            insight={`${designErrorPercent}% of COs on this job from design errors (portfolio avg: ${portfolioAvgDesignError}%). Consider design review process improvements.`}
            detail="Recommendations: 1) Implement design coordination meetings before each phase. 2) Require architect sign-off on structural details. 3) Add RFI checkpoint before major trade mobilization."
            action={{ label: 'View Full Analysis', onClick: () => {} }}
            collapsible
            defaultCollapsed
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search COs by number, title, requestor, cost code..."
          tabs={[
            { key: 'all', label: 'All', count: mockChangeOrders.length },
            { key: 'draft', label: 'Draft', count: mockChangeOrders.filter(co => co.status === 'draft').length },
            { key: 'internal_review', label: 'In Review', count: mockChangeOrders.filter(co => co.status === 'internal_review').length },
            { key: 'client_presented', label: 'Client', count: mockChangeOrders.filter(co => co.status === 'client_presented').length },
            { key: 'negotiation', label: 'Negotiation', count: mockChangeOrders.filter(co => co.status === 'negotiation').length },
            { key: 'approved', label: 'Approved', count: mockChangeOrders.filter(co => co.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: mockChangeOrders.filter(co => co.status === 'rejected').length },
            { key: 'withdrawn', label: 'Withdrawn', count: mockChangeOrders.filter(co => co.status === 'withdrawn').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Sources',
              value: sourceFilter,
              options: [
                { value: 'client_request', label: 'Client Request' },
                { value: 'field', label: 'Field Condition' },
                { value: 'design_change', label: 'Design Change' },
                { value: 'code_change', label: 'Code Change' },
                { value: 'allowance_overage', label: 'Allowance Overage' },
                { value: 'builder_initiated', label: 'Builder Initiated' },
              ],
              onChange: setSourceFilter,
            },
            {
              label: 'All Causes',
              value: causeFilter,
              options: causeCategories.map(c => ({ value: c, label: c })),
              onChange: setCauseFilter,
            },
          ]}
          sortOptions={[
            { value: 'totalAmount', label: 'Amount' },
            { value: 'createdDate', label: 'Date' },
            { value: 'scheduleImpact', label: 'Schedule Impact' },
            { value: 'coNumber', label: 'CO Number' },
            { value: 'causeCategory', label: 'Cause' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'New CO', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filtered.length}
          totalCount={mockChangeOrders.length}
        />
      </div>

      {/* Change Orders Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[520px] overflow-y-auto">
        {filtered.map(co => (
          <ChangeOrderCard key={co.id} co={co} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-warm-400">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-warm-300" />
            No change orders match the selected filters
          </div>
        )}
      </div>

      {/* AI Insights Bar - Using AIFeaturesPanel */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Insights"
          features={aiInsights}
          columns={2}
        />
      </div>
    </div>
  )
}
