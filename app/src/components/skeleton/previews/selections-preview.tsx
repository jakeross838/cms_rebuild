'use client'

import { useState } from 'react'
import {
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  Package,
  Calendar,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Image,
  Palette,
  FileSignature,
  Truck,
  ArrowRightLeft,
  ShoppingCart,
  BarChart3,
  Send,
  Star,
  LinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type SelectionStatus =
  | 'not_started'
  | 'options_presented'
  | 'client_reviewing'
  | 'selected'
  | 'confirmed'
  | 'ordered'
  | 'received'
  | 'installed'
  | 'change_requested'

type PricingModel = 'allowance' | 'fixed' | 'cost_plus'

interface Selection {
  id: string
  category: string
  room: string
  itemName: string
  selectedProduct: string | null
  price: number
  allowance: number
  pricingModel: PricingModel
  markupPct: number
  status: SelectionStatus
  deadline: string
  daysUntilDeadline: number
  leadTimeDays: number | null
  vendor: string | null
  designerRecommended: boolean
  commentCount: number
  inspirationCount: number
  optionsCount: number
  hasSignature: boolean
  poNumber: string | null
  scheduleDependency: string | null
  aiNote: string | null
}

const mockSelections: Selection[] = [
  {
    id: '1',
    category: 'Flooring',
    room: 'Master Bedroom',
    itemName: 'Master Bedroom Hardwood',
    selectedProduct: 'White Oak 5" Engineered',
    price: 8500,
    allowance: 7500,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'ordered',
    deadline: 'Dec 15',
    daysUntilDeadline: 18,
    leadTimeDays: 21,
    vendor: 'ABC Flooring',
    designerRecommended: true,
    commentCount: 3,
    inspirationCount: 5,
    optionsCount: 4,
    hasSignature: true,
    poNumber: 'PO-2026-0142',
    scheduleDependency: 'Flooring Install - Week 18',
    aiNote: null,
  },
  {
    id: '2',
    category: 'Flooring',
    room: 'Living Area',
    itemName: 'Living Area Tile',
    selectedProduct: 'Porcelain 24x24 Gray',
    price: 4200,
    allowance: 4500,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'confirmed',
    deadline: 'Dec 20',
    daysUntilDeadline: 23,
    leadTimeDays: 10,
    vendor: 'Tile Warehouse',
    designerRecommended: false,
    commentCount: 1,
    inspirationCount: 2,
    optionsCount: 3,
    hasSignature: true,
    poNumber: null,
    scheduleDependency: 'Tile Install - Week 19',
    aiNote: null,
  },
  {
    id: '3',
    category: 'Fixtures',
    room: 'Master Bath',
    itemName: 'Master Bath Faucets',
    selectedProduct: null,
    price: 0,
    allowance: 1200,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'options_presented',
    deadline: 'Dec 10',
    daysUntilDeadline: 3,
    leadTimeDays: null,
    vendor: null,
    designerRecommended: false,
    commentCount: 2,
    inspirationCount: 0,
    optionsCount: 5,
    hasSignature: false,
    poNumber: null,
    scheduleDependency: 'Plumbing Trim - Week 22',
    aiNote: 'Decision needed in 3 days to avoid schedule delay',
  },
  {
    id: '4',
    category: 'Fixtures',
    room: 'Kitchen',
    itemName: 'Kitchen Sink',
    selectedProduct: 'Kohler Farmhouse 33"',
    price: 850,
    allowance: 800,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'installed',
    deadline: 'Nov 25',
    daysUntilDeadline: -12,
    leadTimeDays: 14,
    vendor: 'Plumbing Supply Co',
    designerRecommended: true,
    commentCount: 0,
    inspirationCount: 1,
    optionsCount: 3,
    hasSignature: true,
    poNumber: 'PO-2026-0098',
    scheduleDependency: null,
    aiNote: null,
  },
  {
    id: '5',
    category: 'Appliances',
    room: 'Kitchen',
    itemName: 'Refrigerator',
    selectedProduct: 'Sub-Zero 48" Built-in',
    price: 12500,
    allowance: 8000,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'ordered',
    deadline: 'Jan 5',
    daysUntilDeadline: 39,
    leadTimeDays: 84,
    vendor: 'Elite Appliances',
    designerRecommended: false,
    commentCount: 4,
    inspirationCount: 3,
    optionsCount: 3,
    hasSignature: true,
    poNumber: 'PO-2026-0125',
    scheduleDependency: 'Appliance Install - Week 24',
    aiNote: '12-week lead time -- on track for install date',
  },
  {
    id: '6',
    category: 'Appliances',
    room: 'Kitchen',
    itemName: 'Range/Oven',
    selectedProduct: null,
    price: 0,
    allowance: 6000,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'client_reviewing',
    deadline: 'Dec 8',
    daysUntilDeadline: 1,
    leadTimeDays: null,
    vendor: null,
    designerRecommended: false,
    commentCount: 1,
    inspirationCount: 2,
    optionsCount: 4,
    hasSignature: false,
    poNumber: null,
    scheduleDependency: 'Appliance Install - Week 24',
    aiNote: 'Critical: Must select today to meet schedule',
  },
  {
    id: '7',
    category: 'Appliances',
    room: 'Kitchen',
    itemName: 'Dishwasher',
    selectedProduct: 'Miele G7000',
    price: 1800,
    allowance: 1500,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'selected',
    deadline: 'Dec 15',
    daysUntilDeadline: 18,
    leadTimeDays: 14,
    vendor: 'Elite Appliances',
    designerRecommended: true,
    commentCount: 0,
    inspirationCount: 0,
    optionsCount: 3,
    hasSignature: false,
    poNumber: null,
    scheduleDependency: 'Appliance Install - Week 24',
    aiNote: null,
  },
  {
    id: '8',
    category: 'Countertops',
    room: 'Kitchen',
    itemName: 'Kitchen Counters',
    selectedProduct: 'Calacatta Quartz',
    price: 9200,
    allowance: 8500,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'ordered',
    deadline: 'Dec 18',
    daysUntilDeadline: 21,
    leadTimeDays: 21,
    vendor: 'Stone Masters',
    designerRecommended: true,
    commentCount: 6,
    inspirationCount: 8,
    optionsCount: 5,
    hasSignature: true,
    poNumber: 'PO-2026-0133',
    scheduleDependency: 'Counter Install - Week 20',
    aiNote: null,
  },
  {
    id: '9',
    category: 'Countertops',
    room: 'Master Bath',
    itemName: 'Master Bath Vanity Top',
    selectedProduct: null,
    price: 0,
    allowance: 2500,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'not_started',
    deadline: 'Dec 22',
    daysUntilDeadline: 25,
    leadTimeDays: null,
    vendor: null,
    designerRecommended: false,
    commentCount: 0,
    inspirationCount: 0,
    optionsCount: 0,
    hasSignature: false,
    poNumber: null,
    scheduleDependency: 'Counter Install - Week 21',
    aiNote: null,
  },
  {
    id: '10',
    category: 'Lighting',
    room: 'Dining Room',
    itemName: 'Dining Chandelier',
    selectedProduct: 'Visual Comfort Darlana',
    price: 2400,
    allowance: 2000,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'selected',
    deadline: 'Jan 10',
    daysUntilDeadline: 44,
    leadTimeDays: 28,
    vendor: 'Lighting Design Co',
    designerRecommended: true,
    commentCount: 2,
    inspirationCount: 4,
    optionsCount: 6,
    hasSignature: false,
    poNumber: null,
    scheduleDependency: 'Lighting Trim - Week 23',
    aiNote: null,
  },
  {
    id: '11',
    category: 'Lighting',
    room: 'Whole House',
    itemName: 'Recessed Lighting Package',
    selectedProduct: 'Lutron LED 4"',
    price: 3200,
    allowance: 3500,
    pricingModel: 'fixed',
    markupPct: 0,
    status: 'installed',
    deadline: 'Nov 20',
    daysUntilDeadline: -17,
    leadTimeDays: 7,
    vendor: 'Electric Supply',
    designerRecommended: false,
    commentCount: 0,
    inspirationCount: 0,
    optionsCount: 2,
    hasSignature: true,
    poNumber: 'PO-2026-0087',
    scheduleDependency: null,
    aiNote: null,
  },
  {
    id: '12',
    category: 'Cabinetry',
    room: 'Kitchen',
    itemName: 'Kitchen Cabinets',
    selectedProduct: 'Custom Shaker Maple',
    price: 28000,
    allowance: 25000,
    pricingModel: 'allowance',
    markupPct: 0,
    status: 'received',
    deadline: 'Dec 1',
    daysUntilDeadline: 4,
    leadTimeDays: 42,
    vendor: 'Custom Cabinet Co',
    designerRecommended: false,
    commentCount: 8,
    inspirationCount: 12,
    optionsCount: 4,
    hasSignature: true,
    poNumber: 'PO-2026-0110',
    scheduleDependency: 'Cabinet Install - Week 17',
    aiNote: 'Received on site Dec 1 -- on schedule for install',
  },
  {
    id: '13',
    category: 'Fixtures',
    room: 'Master Bath',
    itemName: 'Freestanding Tub',
    selectedProduct: 'Victoria + Albert Amiata',
    price: 4800,
    allowance: 3500,
    pricingModel: 'cost_plus',
    markupPct: 15,
    status: 'change_requested',
    deadline: 'Dec 5',
    daysUntilDeadline: -2,
    leadTimeDays: 35,
    vendor: 'Plumbing Supply Co',
    designerRecommended: true,
    commentCount: 5,
    inspirationCount: 3,
    optionsCount: 4,
    hasSignature: true,
    poNumber: 'PO-2026-0115',
    scheduleDependency: 'Plumbing Trim - Week 22',
    aiNote: 'Change request: client wants different finish. Cancellation fee $240. New lead time 5 weeks.',
  },
]

const rooms = ['All Rooms', 'Kitchen', 'Master Bath', 'Master Bedroom', 'Living Area', 'Dining Room', 'Whole House']
const categories = ['All', 'Flooring', 'Fixtures', 'Appliances', 'Countertops', 'Lighting', 'Cabinetry']

const statusConfig: Record<SelectionStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: 'Not Started', color: 'bg-warm-100 text-warm-600', icon: Clock },
  options_presented: { label: 'Options Presented', color: 'bg-stone-100 text-stone-700', icon: Eye },
  client_reviewing: { label: 'Client Reviewing', color: 'bg-stone-100 text-stone-700', icon: Eye },
  selected: { label: 'Selected', color: 'bg-stone-100 text-stone-700', icon: CheckCircle },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700', icon: FileSignature },
  ordered: { label: 'Ordered', color: 'bg-warm-100 text-warm-700', icon: ShoppingCart },
  received: { label: 'Received', color: 'bg-stone-100 text-stone-700', icon: Truck },
  installed: { label: 'Installed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  change_requested: { label: 'Change Requested', color: 'bg-sand-100 text-sand-700', icon: ArrowRightLeft },
}

const pricingModelLabels: Record<PricingModel, string> = {
  allowance: 'Allowance',
  fixed: 'Fixed Price',
  cost_plus: 'Cost-Plus',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function SelectionCard({ selection }: { selection: Selection }) {
  const config = statusConfig[selection.status]
  const StatusIcon = config.icon
  const overAllowance = selection.price > selection.allowance && selection.price > 0
  const variance = selection.price - selection.allowance
  const isUrgent = (selection.status === 'not_started' || selection.status === 'options_presented' || selection.status === 'client_reviewing') && selection.daysUntilDeadline <= 3

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      isUrgent ? "border-amber-300" : selection.status === 'change_requested' ? "border-sand-300" : "border-warm-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-warm-500 uppercase">{selection.category}</span>
            <span className="text-xs text-warm-400">-</span>
            <span className="text-xs text-warm-500">{selection.room}</span>
            {isUrgent && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            {selection.designerRecommended && (
              <span className="flex items-center gap-0.5 text-xs text-sand-600" title="Designer recommended">
                <Palette className="h-3 w-3" />
              </span>
            )}
          </div>
          <h4 className="font-medium text-warm-900">{selection.itemName}</h4>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      <div className="mb-3">
        {selection.selectedProduct ? (
          <p className="text-sm text-warm-700">{selection.selectedProduct}</p>
        ) : (
          <p className="text-sm text-warm-400 italic">No selection made</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {selection.vendor && (
            <p className="text-xs text-warm-500">{selection.vendor}</p>
          )}
          {selection.poNumber && (
            <span className="text-xs text-stone-600 flex items-center gap-0.5">
              <LinkIcon className="h-3 w-3" />
              {selection.poNumber}
            </span>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-warm-400" />
            <span className={cn(
              "font-medium",
              overAllowance ? "text-red-600" : "text-warm-900"
            )}>
              {selection.price > 0 ? formatCurrency(selection.price) : '-'}
            </span>
          </div>
          <span className="text-warm-400">/</span>
          <span className="text-warm-500">{formatCurrency(selection.allowance)} {pricingModelLabels[selection.pricingModel].toLowerCase()}</span>
        </div>
        {selection.price > 0 && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            overAllowance ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          )}>
            {overAllowance ? '+' : ''}{formatCurrency(variance)}
          </span>
        )}
      </div>

      {/* Meta indicators */}
      <div className="flex items-center gap-3 mb-3 text-xs text-warm-400">
        {selection.optionsCount > 0 && (
          <span className="flex items-center gap-0.5" title={`${selection.optionsCount} options presented`}>
            <Eye className="h-3 w-3" />
            {selection.optionsCount}
          </span>
        )}
        {selection.commentCount > 0 && (
          <span className="flex items-center gap-0.5" title={`${selection.commentCount} comments`}>
            <MessageSquare className="h-3 w-3" />
            {selection.commentCount}
          </span>
        )}
        {selection.inspirationCount > 0 && (
          <span className="flex items-center gap-0.5" title={`${selection.inspirationCount} inspiration images`}>
            <Image className="h-3 w-3" />
            {selection.inspirationCount}
          </span>
        )}
        {selection.hasSignature && (
          <span className="flex items-center gap-0.5 text-green-500" title="E-signature captured">
            <FileSignature className="h-3 w-3" />
          </span>
        )}
        {selection.leadTimeDays !== null && (
          <span className="flex items-center gap-0.5" title={`${selection.leadTimeDays} day lead time`}>
            <Truck className="h-3 w-3" />
            {selection.leadTimeDays}d
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-warm-100">
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", config.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs",
          isUrgent ? "text-amber-600 font-medium" : "text-warm-500"
        )}>
          <Calendar className="h-3.5 w-3.5" />
          <span>{selection.deadline}</span>
          {selection.daysUntilDeadline > 0 && (selection.status === 'not_started' || selection.status === 'options_presented' || selection.status === 'client_reviewing') && (
            <span className="text-warm-400">({selection.daysUntilDeadline}d)</span>
          )}
        </div>
      </div>

      {selection.scheduleDependency && (
        <div className="mt-2 text-xs text-warm-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {selection.scheduleDependency}
        </div>
      )}

      {selection.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2 text-xs",
          selection.status === 'change_requested' ? "bg-sand-50" : isUrgent ? "bg-amber-50" : "bg-stone-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            selection.status === 'change_requested' ? "text-sand-600" : isUrgent ? "text-amber-500" : "text-stone-500"
          )} />
          <span className={selection.status === 'change_requested' ? "text-sand-700" : isUrgent ? "text-amber-700" : "text-stone-700"}>
            {selection.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

function SelectionRow({ selection }: { selection: Selection }) {
  const config = statusConfig[selection.status]
  const StatusIcon = config.icon
  const overAllowance = selection.price > selection.allowance && selection.price > 0
  const variance = selection.price - selection.allowance
  const isUrgent = (selection.status === 'not_started' || selection.status === 'options_presented' || selection.status === 'client_reviewing') && selection.daysUntilDeadline <= 3

  return (
    <tr className={cn(
      "hover:bg-warm-50",
      isUrgent && "bg-amber-50/50",
      selection.status === 'change_requested' && "bg-sand-50/30",
    )}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-warm-500 uppercase bg-warm-100 px-1.5 py-0.5 rounded">
            {selection.category}
          </span>
          {isUrgent && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {selection.designerRecommended && <Palette className="h-3.5 w-3.5 text-sand-600" />}
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-warm-500">{selection.room}</td>
      <td className="py-3 px-4">
        <div className="font-medium text-warm-900">{selection.itemName}</div>
        {selection.vendor && (
          <div className="text-xs text-warm-500">{selection.vendor}</div>
        )}
      </td>
      <td className="py-3 px-4">
        {selection.selectedProduct ? (
          <span className="text-sm text-warm-700">{selection.selectedProduct}</span>
        ) : (
          <span className="text-sm text-warm-400 italic">Not selected</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <span className={cn(
          "font-medium",
          overAllowance ? "text-red-600" : "text-warm-900"
        )}>
          {selection.price > 0 ? formatCurrency(selection.price) : '-'}
        </span>
        <div className="text-xs text-warm-500">{formatCurrency(selection.allowance)} allow.</div>
      </td>
      <td className="py-3 px-4 text-right">
        {selection.price > 0 && (
          <span className={cn(
            "text-sm font-medium",
            overAllowance ? "text-red-600" : "text-green-600"
          )}>
            {overAllowance ? '+' : ''}{formatCurrency(variance)}
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", config.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className={cn(
          "text-sm",
          isUrgent ? "text-amber-600 font-medium" : "text-warm-600"
        )}>
          {selection.deadline}
        </div>
      </td>
    </tr>
  )
}

export function SelectionsPreview() {
  const [selectedRoom, setSelectedRoom] = useState<string>('All Rooms')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredSelections = sortItems(
    mockSelections.filter(selection => {
      if (!matchesSearch(selection, search, ['itemName', 'selectedProduct', 'vendor', 'category', 'room'])) return false
      const roomMatch = selectedRoom === 'All Rooms' || selection.room === selectedRoom
      const categoryMatch = selectedCategory === 'All' || selection.category === selectedCategory
      const statusMatch = activeTab === 'all' || selection.status === activeTab
      return roomMatch && categoryMatch && statusMatch
    }),
    activeSort as keyof Selection | '',
    sortDirection,
  )

  // Calculate stats
  const totalSelections = mockSelections.length
  const completedStatuses: SelectionStatus[] = ['selected', 'confirmed', 'ordered', 'received', 'installed']
  const selectionsMade = mockSelections.filter(s => completedStatuses.includes(s.status)).length
  const pendingStatuses: SelectionStatus[] = ['not_started', 'options_presented', 'client_reviewing']
  const pendingDecisions = mockSelections.filter(s => pendingStatuses.includes(s.status)).length
  const urgentDecisions = mockSelections.filter(s => pendingStatuses.includes(s.status) && s.daysUntilDeadline <= 3).length
  const changeRequests = mockSelections.filter(s => s.status === 'change_requested').length

  const totalAllowance = mockSelections.reduce((sum, s) => sum + s.allowance, 0)
  const totalSelected = mockSelections.reduce((sum, s) => sum + s.price, 0)
  const selectionsWithPrices = mockSelections.filter(s => s.price > 0)
  const varianceFromSelected = selectionsWithPrices.reduce((sum, s) => sum + (s.price - s.allowance), 0)

  const designerRecommendedCount = mockSelections.filter(s => s.designerRecommended).length
  const totalComments = mockSelections.reduce((sum, s) => sum + s.commentCount, 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-warm-900">Client Selections</h3>
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">Smith Residence</span>
            {changeRequests > 0 && (
              <span className="text-xs bg-sand-100 text-sand-700 px-2 py-0.5 rounded flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" />
                {changeRequests} change request{changeRequests !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-sm text-warm-500 mt-0.5">
            {selectionsMade} of {totalSelections} selections made | {pendingDecisions} pending
            {urgentDecisions > 0 && (
              <span className="text-amber-600 font-medium ml-1">({urgentDecisions} urgent)</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-stone-500 to-green-500 rounded-full transition-all"
              style={{ width: `${(selectionsMade / totalSelections) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-warm-500">
            <span>{Math.round((selectionsMade / totalSelections) * 100)}% complete</span>
            <span>{totalSelections - selectionsMade} remaining</span>
          </div>
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search selections..."
          tabs={[
            { key: 'all', label: 'All', count: mockSelections.length },
            { key: 'not_started', label: 'Not Started', count: mockSelections.filter(s => s.status === 'not_started').length },
            { key: 'options_presented', label: 'Options', count: mockSelections.filter(s => s.status === 'options_presented').length },
            { key: 'client_reviewing', label: 'Reviewing', count: mockSelections.filter(s => s.status === 'client_reviewing').length },
            { key: 'selected', label: 'Selected', count: mockSelections.filter(s => s.status === 'selected').length },
            { key: 'confirmed', label: 'Confirmed', count: mockSelections.filter(s => s.status === 'confirmed').length },
            { key: 'ordered', label: 'Ordered', count: mockSelections.filter(s => s.status === 'ordered').length },
            { key: 'received', label: 'Received', count: mockSelections.filter(s => s.status === 'received').length },
            { key: 'installed', label: 'Installed', count: mockSelections.filter(s => s.status === 'installed').length },
            { key: 'change_requested', label: 'Changes', count: mockSelections.filter(s => s.status === 'change_requested').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Rooms',
              value: selectedRoom === 'All Rooms' ? 'all' : selectedRoom,
              options: rooms.filter(r => r !== 'All Rooms').map(r => ({ value: r, label: r })),
              onChange: (v) => setSelectedRoom(v === 'all' ? 'All Rooms' : v),
            },
            {
              label: 'All Categories',
              value: selectedCategory === 'All' ? 'all' : selectedCategory,
              options: categories.filter(c => c !== 'All').map(c => ({ value: c, label: c })),
              onChange: (v) => setSelectedCategory(v === 'all' ? 'All' : v),
            },
          ]}
          sortOptions={[
            { value: 'itemName', label: 'Item Name' },
            { value: 'room', label: 'Room' },
            { value: 'price', label: 'Price' },
            { value: 'allowance', label: 'Allowance' },
            { value: 'daysUntilDeadline', label: 'Deadline' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'Add Selection', onClick: () => {}, variant: 'primary' },
            { icon: Send, label: 'Send Reminder', onClick: () => {} },
          ]}
          resultCount={filteredSelections.length}
          totalCount={mockSelections.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <CheckCircle className="h-4 w-4" />
              Made
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">
              {selectionsMade} <span className="text-sm font-normal text-warm-500">/ {totalSelections}</span>
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            urgentDecisions > 0 ? "bg-amber-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              urgentDecisions > 0 ? "text-amber-600" : "text-warm-500"
            )}>
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              urgentDecisions > 0 ? "text-amber-700" : "text-warm-900"
            )}>
              {pendingDecisions}
              {urgentDecisions > 0 && (
                <span className="text-sm font-medium text-amber-600 ml-1">({urgentDecisions} urgent)</span>
              )}
            </div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Allowance
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(totalAllowance)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            varianceFromSelected > 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              varianceFromSelected > 0 ? "text-red-600" : "text-green-600"
            )}>
              <BarChart3 className="h-4 w-4" />
              Variance
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              varianceFromSelected > 0 ? "text-red-700" : "text-green-700"
            )}>
              {varianceFromSelected > 0 ? '+' : ''}{formatCurrency(varianceFromSelected)}
            </div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sand-600 text-sm">
              <Star className="h-4 w-4" />
              Designer Picks
            </div>
            <div className="text-xl font-bold text-sand-700 mt-1">{designerRecommendedCount}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <MessageSquare className="h-4 w-4" />
              Comments
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{totalComments}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {filteredSelections.map(selection => (
            <SelectionCard key={selection.id} selection={selection} />
          ))}
          {filteredSelections.length === 0 && (
            <div className="col-span-3 text-center py-12 text-warm-500">
              No selections match the current filters
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-warm-100 border-b border-warm-200 sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Room</th>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Item</th>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Selected Product</th>
                <th className="text-right py-3 px-4 font-medium text-warm-600">Price</th>
                <th className="text-right py-3 px-4 font-medium text-warm-600">Variance</th>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Status</th>
                <th className="text-right py-3 px-4 font-medium text-warm-600">Deadline</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-warm-100">
              {filteredSelections.map(selection => (
                <SelectionRow key={selection.id} selection={selection} />
              ))}
              {filteredSelections.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-warm-500">
                    No selections match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cross-Module Connection Badges */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-warm-500 font-medium">Connected:</span>
          <span className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Package className="h-3 w-3" />
            Selections Catalog
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Budget
          </span>
          <span className="bg-warm-50 text-warm-700 px-2 py-0.5 rounded flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            Purchase Orders
          </span>
          <span className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Schedule
          </span>
          <span className="bg-sand-50 text-sand-700 px-2 py-0.5 rounded flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            Change Orders
          </span>
          <span className="bg-warm-50 text-sand-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Client Portal
          </span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Alert:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {urgentDecisions} selection{urgentDecisions !== 1 ? 's' : ''} need decisions this week to avoid delays
            </span>
            <span>|</span>
            <span>Range/Oven selection critical -- must select today</span>
            <span>|</span>
            <span>Tub change request: $240 cancellation fee + 5 week new lead time</span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Features for Selections"
          columns={2}
          features={[
            {
              feature: 'Budget Impact',
              trigger: 'Real-time',
              insight: 'Current selections are $4,750 over total allowance. Refrigerator (+$4,500) and Countertops (+$700) are the main contributors.',
              severity: 'warning',
              confidence: 92,
            },
            {
              feature: 'Lead Time Alerts',
              trigger: 'On change',
              insight: 'Refrigerator has 12-week lead time. Order placed - arrival expected Week 22, on track for install.',
              detail: 'Long lead time items: Sub-Zero Refrigerator (84 days), Custom Cabinets (42 days), Freestanding Tub (35 days)',
              severity: 'info',
              confidence: 95,
            },
            {
              feature: 'Deadline Tracking',
              trigger: 'Daily',
              insight: '2 selections need decisions within 3 days: Range/Oven (today!) and Master Bath Faucets (3 days).',
              severity: 'critical',
              confidence: 100,
              action: {
                label: 'Send Reminders',
                onClick: () => {},
              },
            },
            {
              feature: 'Popular Choices',
              trigger: 'On creation',
              insight: 'White Oak engineered hardwood is the #1 flooring choice in similar projects (selected in 68% of luxury renovations).',
              detail: 'Other popular selections: Kohler Farmhouse sinks (72%), Calacatta Quartz counters (54%), Visual Comfort lighting (48%)',
              severity: 'success',
              confidence: 87,
            },
            {
              feature: 'Design Compatibility',
              trigger: 'Real-time',
              insight: 'Selected Calacatta Quartz pairs well with the White Oak flooring and Kohler fixtures. Consider matching cabinet hardware.',
              detail: 'AI analyzed color palette, material textures, and style consistency across 8 selected items.',
              severity: 'success',
              confidence: 89,
              action: {
                label: 'View Suggestions',
                onClick: () => {},
              },
            },
          ]}
        />
      </div>
    </div>
  )
}
