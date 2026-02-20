'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Copy,
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Shield,
  GitBranch,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Layers,
  Target,
  Calculator,
  Send,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type ItemType = 'line' | 'allowance' | 'exclusion' | 'alternate'
type ContractType = 'nte' | 'gmp' | 'cost_plus' | 'fixed'
type EstimateStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'expired' | 'converted'
type MarkupType = 'flat' | 'tiered' | 'per_line' | 'built_in'

interface LineItem {
  id: string
  category: string
  costCode: string
  name: string
  itemType: ItemType
  selection: {
    name: string
    tier: 'builder' | 'standard' | 'premium' | 'luxury'
    materialCost: number
    laborCost: number
    leadTime: string
    vendor: string
  }
  quantity: number
  unit: string
  wasteFactor: number
  markupPct: number
  altGroup?: string
  aiSuggested: boolean
  aiConfidence: number
  aiNote?: string
}

interface EstimateHeader {
  name: string
  status: EstimateStatus
  contractType: ContractType
  markupType: MarkupType
  version: number
  validUntil: string
  daysUntilExpiry: number
  projectSf: number
  projectType: string
  defaultTier: string
  createdBy: string
  approvedBy: string | null
  overheadPct: number
  profitPct: number
  contingencyPct: number
}

const mockHeader: EstimateHeader = {
  name: 'Smith Residence Estimate',
  status: 'pending_approval',
  contractType: 'gmp',
  markupType: 'flat',
  version: 2,
  validUntil: 'Mar 15, 2026',
  daysUntilExpiry: 31,
  projectSf: 3500,
  projectType: 'Coastal Elevated',
  defaultTier: 'Premium',
  createdBy: 'Jake Ross',
  approvedBy: null,
  overheadPct: 10,
  profitPct: 8,
  contingencyPct: 5,
}

const mockLineItems: LineItem[] = [
  {
    id: '1',
    category: 'Exterior',
    costCode: '07-200',
    name: 'Porch Ceiling',
    itemType: 'line',
    selection: {
      name: 'Cypress T&G 1x6',
      tier: 'premium',
      materialCost: 8.50,
      laborCost: 4.00,
      leadTime: '2 weeks',
      vendor: 'ABC Lumber',
    },
    quantity: 450,
    unit: 'SF',
    wasteFactor: 10,
    markupPct: 0,
    aiSuggested: true,
    aiConfidence: 0.92,
    aiNote: 'Your most common choice for coastal homes (67%)',
  },
  {
    id: '2',
    category: 'Exterior',
    costCode: '09-900',
    name: 'Exterior Paint',
    itemType: 'line',
    selection: {
      name: 'Sherwin-Williams Duration',
      tier: 'premium',
      materialCost: 2.80,
      laborCost: 1.70,
      leadTime: '3 days',
      vendor: 'Sherwin-Williams',
    },
    quantity: 3500,
    unit: 'SF',
    wasteFactor: 8,
    markupPct: 0,
    aiSuggested: false,
    aiConfidence: 0.95,
  },
  {
    id: '3',
    category: 'Exterior',
    costCode: '08-500',
    name: 'Impact Windows',
    itemType: 'line',
    selection: {
      name: 'PGT WinGuard',
      tier: 'premium',
      materialCost: 85.00,
      laborCost: 25.00,
      leadTime: '8 weeks',
      vendor: 'PGT Industries',
    },
    quantity: 24,
    unit: 'EA',
    wasteFactor: 0,
    markupPct: 0,
    aiSuggested: false,
    aiConfidence: 0.88,
    aiNote: 'Lead time concern: 8 weeks vs. 4 week project start',
  },
  {
    id: '4',
    category: 'Interior',
    costCode: '09-300',
    name: 'Master Bath Tile',
    itemType: 'allowance',
    selection: {
      name: 'Client Selection Pending',
      tier: 'standard',
      materialCost: 18.00,
      laborCost: 12.00,
      leadTime: 'TBD',
      vendor: 'TBD',
    },
    quantity: 120,
    unit: 'SF',
    wasteFactor: 15,
    markupPct: 0,
    aiSuggested: true,
    aiConfidence: 0.75,
    aiNote: 'Client likely to upgrade +$600 based on profile',
  },
  {
    id: '5',
    category: 'Interior',
    costCode: '06-400',
    name: 'Kitchen Cabinets',
    itemType: 'line',
    selection: {
      name: 'Shaker Style Maple',
      tier: 'premium',
      materialCost: 450.00,
      laborCost: 150.00,
      leadTime: '6 weeks',
      vendor: 'Custom Cabinet Co',
    },
    quantity: 28,
    unit: 'LF',
    wasteFactor: 0,
    markupPct: 0,
    aiSuggested: false,
    aiConfidence: 0.90,
  },
  {
    id: '6',
    category: 'Interior',
    costCode: '09-300',
    name: 'Landscaping',
    itemType: 'exclusion',
    selection: {
      name: 'EXCLUDED — By Owner',
      tier: 'standard',
      materialCost: 0,
      laborCost: 0,
      leadTime: 'N/A',
      vendor: 'N/A',
    },
    quantity: 1,
    unit: 'LS',
    wasteFactor: 0,
    markupPct: 0,
    aiSuggested: false,
    aiConfidence: 1.0,
  },
  {
    id: '7',
    category: 'Interior',
    costCode: '09-650',
    name: 'Living Room Flooring',
    itemType: 'alternate',
    altGroup: 'flooring-a',
    selection: {
      name: 'Option A: White Oak Hardwood',
      tier: 'premium',
      materialCost: 12.00,
      laborCost: 4.50,
      leadTime: '3 weeks',
      vendor: 'Flooring Warehouse',
    },
    quantity: 800,
    unit: 'SF',
    wasteFactor: 10,
    markupPct: 0,
    aiSuggested: false,
    aiConfidence: 0.85,
    aiNote: 'Alt B saves $3,200; Alt A is 78% client preference',
  },
  {
    id: '8',
    category: 'Interior',
    costCode: '09-650',
    name: 'Living Room Flooring',
    itemType: 'alternate',
    altGroup: 'flooring-b',
    selection: {
      name: 'Option B: LVP Luxury Vinyl',
      tier: 'standard',
      materialCost: 6.50,
      laborCost: 3.00,
      leadTime: '1 week',
      vendor: 'Flooring Warehouse',
    },
    quantity: 800,
    unit: 'SF',
    wasteFactor: 10,
    markupPct: 0,
    aiSuggested: false,
    aiConfidence: 0.85,
  },
]

const statusConfig: Record<EstimateStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-700' },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  sent: { label: 'Sent to Client', color: 'bg-stone-100 text-stone-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700' },
}

const contractTypeLabels: Record<ContractType, string> = {
  nte: 'Not-to-Exceed',
  gmp: 'Guaranteed Max Price',
  cost_plus: 'Cost-Plus',
  fixed: 'Fixed Price',
}

const itemTypeConfig: Record<ItemType, { label: string; color: string }> = {
  line: { label: 'LINE', color: 'bg-stone-50 text-stone-700' },
  allowance: { label: 'ALLOWANCE', color: 'bg-amber-100 text-amber-700' },
  exclusion: { label: 'EXCLUDED', color: 'bg-red-100 text-red-700' },
  alternate: { label: 'ALTERNATE', color: 'bg-purple-100 text-purple-700' },
}

const tierColors = {
  builder: 'bg-warm-100 text-warm-700',
  standard: 'bg-stone-100 text-stone-700',
  premium: 'bg-purple-100 text-purple-700',
  luxury: 'bg-amber-100 text-amber-700',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(2)
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const level = confidence >= 0.9 ? 'high' : confidence >= 0.7 ? 'medium' : 'low'
  const colors = {
    high: 'text-green-600 bg-green-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-red-600 bg-red-50',
  }
  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded flex items-center gap-1', colors[level])}>
      <Target className="h-3 w-3" />
      {Math.round(confidence * 100)}%
    </span>
  )
}

function LineItemCard({ item }: { item: LineItem }) {
  const [expanded, setExpanded] = useState(false)
  const totalPerUnit = item.selection.materialCost + item.selection.laborCost
  const wasteAdjustedQty = item.quantity * (1 + item.wasteFactor / 100)
  const lineTotal = totalPerUnit * wasteAdjustedQty
  const isExclusion = item.itemType === 'exclusion'
  const typeConfig = itemTypeConfig[item.itemType]

  return (
    <div className={cn(
      "border rounded-lg bg-white overflow-hidden",
      item.itemType === 'allowance' && "border-amber-200",
      item.itemType === 'exclusion' && "border-red-200 bg-red-50/30",
      item.itemType === 'alternate' && "border-purple-200",
      item.itemType === 'line' && "border-warm-200",
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-warm-50"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-warm-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-warm-400" />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", typeConfig.color)}>
                {typeConfig.label}
              </span>
              <span className="font-medium text-warm-900">{item.name}</span>
              {item.aiSuggested && (
                <span title="AI-suggested pricing"><Sparkles className="h-3.5 w-3.5 text-stone-500" /></span>
              )}
              {item.altGroup && (
                <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  {item.altGroup}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-warm-500">
              <span className="font-mono text-xs">{item.costCode}</span>
              <span>-</span>
              <span>{item.selection.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ConfidenceBadge confidence={item.aiConfidence} />
          <span className={cn("text-xs px-2 py-1 rounded font-medium", tierColors[item.selection.tier])}>
            {item.selection.tier.charAt(0).toUpperCase() + item.selection.tier.slice(1)}
          </span>
          {!isExclusion && (
            <span className="text-sm text-warm-600">
              {item.quantity} {item.unit} x ${totalPerUnit.toFixed(2)}
              {item.wasteFactor > 0 && (
                <span className="text-xs text-warm-400 ml-1">(+{item.wasteFactor}% waste)</span>
              )}
            </span>
          )}
          <span className={cn(
            "font-semibold w-24 text-right",
            isExclusion ? "text-red-500 line-through" : "text-warm-900"
          )}>
            {isExclusion ? '$0' : formatCurrency(lineTotal)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-warm-100">
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-warm-500 uppercase">Selection</label>
              <div className="mt-1 flex items-center gap-2">
                <select className="flex-1 text-sm border border-warm-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-500">
                  <option>{item.selection.name}</option>
                  <option>Hardie Soffit Panel</option>
                  <option>Brazilian Hardwood</option>
                  <option>Vinyl Soffit</option>
                </select>
                <button className="p-2 text-warm-400 hover:text-warm-600 hover:bg-warm-100 rounded">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-warm-500 uppercase">Material</label>
                <div className="mt-1 text-sm">${item.selection.materialCost.toFixed(2)}/{item.unit}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-warm-500 uppercase">Labor</label>
                <div className="mt-1 text-sm">${item.selection.laborCost.toFixed(2)}/{item.unit}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-warm-500 uppercase">Waste</label>
                <div className="mt-1 text-sm">{item.wasteFactor}%</div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-warm-600">
              <Clock className="h-4 w-4" />
              <span>{item.selection.leadTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-warm-600">
              <Package className="h-4 w-4" />
              <span>{item.selection.vendor}</span>
            </div>
            <div className="flex items-center gap-1.5 text-warm-500">
              <Layers className="h-4 w-4" />
              <span className="font-mono text-xs">{item.costCode}</span>
            </div>
          </div>

          {item.aiNote && (
            <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              item.aiNote.includes('concern') || item.aiNote.includes('Lead time') ? "bg-amber-50" : "bg-stone-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                item.aiNote.includes('concern') || item.aiNote.includes('Lead time') ? "text-amber-500" : "text-stone-500"
              )} />
              <span className={item.aiNote.includes('concern') || item.aiNote.includes('Lead time') ? "text-amber-700" : "text-stone-700"}>
                {item.aiNote}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EstimatesPreview() {
  const [selectedItemType, setSelectedItemType] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const categories = [...new Set(mockLineItems.map(item => item.category))]
  const filteredItems = sortItems(
    mockLineItems.filter(item => {
      if (!matchesSearch(item, search, ['name', 'category', 'costCode'])) return false
      if (activeTab !== 'all' && item.category !== activeTab) return false
      if (selectedItemType !== 'all' && item.itemType !== selectedItemType) return false
      return true
    }),
    activeSort as keyof LineItem | '',
    sortDirection,
  )

  // Exclude exclusions and only include first alternate from budget calcs
  const budgetItems = mockLineItems.filter(i => i.itemType !== 'exclusion' && !(i.itemType === 'alternate' && i.altGroup?.endsWith('-b')))
  const subtotal = budgetItems.reduce((sum, item) => {
    const total = (item.selection.materialCost + item.selection.laborCost) * item.quantity * (1 + item.wasteFactor / 100)
    return sum + total
  }, 0)
  const overheadAmount = subtotal * (mockHeader.overheadPct / 100)
  const profitAmount = subtotal * (mockHeader.profitPct / 100)
  const contingency = subtotal * (mockHeader.contingencyPct / 100)
  const grandTotal = subtotal + overheadAmount + profitAmount + contingency
  const costPerSf = grandTotal / mockHeader.projectSf

  // Stats
  const totalLineItems = mockLineItems.filter(i => i.itemType === 'line').length
  const allowanceItems = mockLineItems.filter(i => i.itemType === 'allowance').length
  const exclusionItems = mockLineItems.filter(i => i.itemType === 'exclusion').length
  const alternateItems = mockLineItems.filter(i => i.itemType === 'alternate').length
  const aiSuggestedCount = mockLineItems.filter(i => i.aiSuggested).length
  const avgConfidence = mockLineItems.reduce((sum, i) => sum + i.aiConfidence, 0) / mockLineItems.length
  const leadTimeConcerns = mockLineItems.filter(i => i.aiNote?.toLowerCase().includes('lead time')).length

  const statusCfg = statusConfig[mockHeader.status]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">{mockHeader.name}</h3>
              <span className={cn("text-xs px-2 py-0.5 rounded font-medium", statusCfg.color)}>
                {statusCfg.label}
              </span>
              <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                v{mockHeader.version}
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                {contractTypeLabels[mockHeader.contractType]}
              </span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5 flex items-center gap-3">
              <span>{mockHeader.projectSf.toLocaleString()} SF | {mockHeader.projectType} | Default: {mockHeader.defaultTier}</span>
              <span className="text-warm-300">|</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Valid until {mockHeader.validUntil} ({mockHeader.daysUntilExpiry}d)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <GitBranch className="h-4 w-4" />
              Compare Versions
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Copy className="h-4 w-4" />
              Clone
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">
              <Send className="h-4 w-4" />
              Submit for Approval
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <FileText className="h-4 w-4" />
              Convert to Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-7 gap-3">
          <div className="bg-warm-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-warm-500 text-xs">
              <Layers className="h-3.5 w-3.5" />
              Line Items
            </div>
            <div className="text-lg font-bold text-warm-900 mt-0.5">{totalLineItems}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Allowances
            </div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{allowanceItems}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-red-600 text-xs">
              <XCircle className="h-3.5 w-3.5" />
              Exclusions
            </div>
            <div className="text-lg font-bold text-red-700 mt-0.5">{exclusionItems}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-purple-600 text-xs">
              <GitBranch className="h-3.5 w-3.5" />
              Alternates
            </div>
            <div className="text-lg font-bold text-purple-700 mt-0.5">{alternateItems / 2}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-stone-600 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Suggested
            </div>
            <div className="text-lg font-bold text-stone-700 mt-0.5">{aiSuggestedCount}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <Target className="h-3.5 w-3.5" />
              Avg Confidence
            </div>
            <div className="text-lg font-bold text-green-700 mt-0.5">{Math.round(avgConfidence * 100)}%</div>
          </div>
          <div className={cn(
            "rounded-lg p-2.5",
            leadTimeConcerns > 0 ? "bg-amber-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-xs",
              leadTimeConcerns > 0 ? "text-amber-600" : "text-warm-500"
            )}>
              <AlertTriangle className="h-3.5 w-3.5" />
              Lead Time Flags
            </div>
            <div className={cn(
              "text-lg font-bold mt-0.5",
              leadTimeConcerns > 0 ? "text-amber-700" : "text-warm-900"
            )}>{leadTimeConcerns}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search line items, cost codes..."
          tabs={[
            { key: 'all', label: 'All', count: mockLineItems.length },
            ...categories.map(cat => ({
              key: cat,
              label: cat,
              count: mockLineItems.filter(item => item.category === cat).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Types',
              value: selectedItemType,
              options: [
                { value: 'line', label: `Lines (${totalLineItems})` },
                { value: 'allowance', label: `Allowances (${allowanceItems})` },
                { value: 'exclusion', label: `Exclusions (${exclusionItems})` },
                { value: 'alternate', label: `Alternates (${alternateItems})` },
              ],
              onChange: setSelectedItemType,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'category', label: 'Category' },
            { value: 'quantity', label: 'Quantity' },
            { value: 'costCode', label: 'Cost Code' },
            { value: 'aiConfidence', label: 'AI Confidence' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Plus, label: 'Add Line Item', onClick: () => {} },
            { icon: Package, label: 'Insert Assembly', onClick: () => {} },
            { icon: Calculator, label: 'AI Suggest Pricing', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredItems.length}
          totalCount={mockLineItems.length}
        />
      </div>

      {/* Line Items */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredItems.map(item => (
          <LineItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-4 text-sm">
          <div>
            <div className="text-warm-500">Subtotal</div>
            <div className="text-lg font-semibold text-warm-900">{formatCurrency(subtotal)}</div>
          </div>
          <div>
            <div className="text-warm-500">Overhead ({mockHeader.overheadPct}%)</div>
            <div className="text-lg font-semibold text-warm-900">{formatCurrency(overheadAmount)}</div>
          </div>
          <div>
            <div className="text-warm-500">Profit ({mockHeader.profitPct}%)</div>
            <div className="text-lg font-semibold text-warm-900">{formatCurrency(profitAmount)}</div>
          </div>
          <div>
            <div className="text-warm-500">Contingency ({mockHeader.contingencyPct}%)</div>
            <div className="text-lg font-semibold text-warm-900">{formatCurrency(contingency)}</div>
          </div>
          <div>
            <div className="text-warm-500">$/SF</div>
            <div className="text-lg font-semibold text-warm-900">{formatCurrency(costPerSf)}</div>
          </div>
          <div>
            <div className="text-warm-500">Grand Total</div>
            <div className="text-xl font-bold text-stone-600">{formatCurrency(grandTotal)}</div>
          </div>
        </div>
      </div>

      {/* Cross-Module Connection Badges */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-warm-500 font-medium">Connected:</span>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
            <DollarSign className="h-3 w-3" />
            Public Estimator
            <span className="bg-indigo-200 text-indigo-800 px-1 py-0 rounded text-[9px] ml-0.5">Feed</span>
          </span>
          <span className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Package className="h-3 w-3" />
            Selections Catalog
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Budget Tracking
          </span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Proposals
          </span>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Price Intelligence
          </span>
          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Bid Management
          </span>
          <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Schedule
          </span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {leadTimeConcerns} lead time concern{leadTimeConcerns !== 1 ? 's' : ''}
            </span>
            <span>|</span>
            <span>{allowanceItems} allowance{allowanceItems !== 1 ? 's' : ''} likely to upgrade</span>
            <span>|</span>
            <span>{Math.round(avgConfidence * 100)}% avg pricing confidence</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Escalation: +2.1% if delayed 3 months
            </span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Features"
          columns={2}
          features={[
            {
              feature: 'Historical Pricing',
              trigger: 'on-creation',
              insight: 'Compares to similar past projects',
              detail: 'This estimate is 3% below your average for coastal elevated homes of similar size. Porch ceiling pricing is 8% higher than your last 5 projects.',
              confidence: 87,
              severity: 'info',
            },
            {
              feature: 'Public Estimator Calibration',
              trigger: 'on-save',
              insight: 'Feeds accurate pricing back to public estimator',
              detail: 'This estimate will update the public estimator: Premium finish at $245/SF (current: $238/SF). Kitchen cabinets +8% from baseline.',
              confidence: 94,
              severity: 'success',
            },
            {
              feature: 'Market Rate Check',
              trigger: 'real-time',
              insight: 'Validates pricing against market rates',
              detail: 'Impact windows pricing is competitive. Kitchen cabinet labor rate is 12% below current market - consider adjusting to avoid margin squeeze.',
              confidence: 91,
              severity: 'success',
            },
            {
              feature: 'Estimator Lead Comparison',
              trigger: 'on-lead',
              insight: 'Compares to what lead received on website',
              detail: 'Lead Chen received $890K-$1.1M on estimator. This detailed estimate at $982K is within range. Budget realism: 94%.',
              confidence: 96,
              severity: 'info',
            },
            {
              feature: 'Scope Completeness',
              trigger: 'on-change',
              insight: 'Identifies potentially missing line items',
              detail: 'Consider adding: Soffit venting (typical for coastal), Hurricane straps (code requirement), Waterproofing membrane for exterior.',
              confidence: 78,
              severity: 'warning',
            },
            {
              feature: 'Risk Assessment',
              trigger: 'on-submission',
              insight: 'Flags high-risk assumptions',
              detail: 'High risk: 8-week window lead time vs 4-week project start. Medium risk: Tile allowance historically under-budgeted by 15% for premium clients.',
              confidence: 82,
              severity: 'warning',
            },
            {
              feature: 'Win Probability',
              trigger: 'real-time',
              insight: 'Predicts likelihood of winning bid',
              detail: 'Based on client profile, project type, and pricing position, estimated 73% win probability. Premium tier selections align with client history.',
              confidence: 73,
              severity: 'info',
            },
            {
              feature: 'Estimate Accuracy Tracking',
              trigger: 'on-close',
              insight: 'Tracks estimate vs actual for continuous improvement',
              detail: 'Your last 10 estimates: Avg variance 5.8%. Foundation +12%, Framing -3%, Cabinets +18%. Auto-adjusting category multipliers.',
              confidence: 92,
              severity: 'info',
            },
          ]}
        />
      </div>
    </div>
  )
}
