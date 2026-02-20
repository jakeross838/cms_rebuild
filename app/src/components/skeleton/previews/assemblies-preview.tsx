'use client'

import { useState } from 'react'
import {
  Plus,
  Sparkles,
  Package,
  DollarSign,
  Clock,
  MoreHorizontal,
  Copy,
  Star,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  FileText,
  Edit2,
  Ruler,
  BarChart3,
  RefreshCw,
  Upload,
  Download,
  X,
  MapPin,
  ArrowUpDown,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

interface AssemblyItem {
  costCode: string
  description: string
  qtyPerUnit: number
  unit: string
  unitCost: number
}

interface CostChangeDetail {
  item: string
  change: number
  percentage: number
}

interface UsageLocation {
  jobName: string
  phase: string
  dateAdded: string
}

interface TierPricing {
  Builder: number
  Standard: number
  Premium: number
  Luxury: number
}

interface Assembly {
  id: string
  name: string
  category: string
  lineItems: number
  defaultTier: 'Builder' | 'Standard' | 'Premium' | 'Luxury'
  totalCost: number
  parameterUnit: string
  costPerUnit: number
  usageCount: number
  lastUsed: string
  createdAt: string
  description: string
  isFavorite: boolean
  isActive: boolean
  hasNestedAssemblies: boolean
  wasteFactorApplied: boolean
  costChange?: number
  costChangeDirection?: 'up' | 'down'
  aiNote?: string
  sampleItems?: AssemblyItem[]
  costChangeDetails?: CostChangeDetail[]
  usageLocations?: UsageLocation[]
  tierPricing?: TierPricing
  costHistory?: { sixtyDays: number; sixMonths: number }
}

const mockAssemblies: Assembly[] = [
  {
    id: '1',
    name: 'Standard Kitchen Package',
    category: 'Kitchen',
    lineItems: 12,
    defaultTier: 'Premium',
    totalCost: 42500,
    parameterUnit: 'EA',
    costPerUnit: 42500,
    usageCount: 34,
    lastUsed: '2 weeks ago',
    createdAt: 'Jan 15, 2025',
    description: 'Cabinets, Counters, Sink, Faucet, Backsplash, Disposal',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    sampleItems: [
      { costCode: '06-400', description: 'Maple Shaker Cabinets', qtyPerUnit: 28, unit: 'LF', unitCost: 450 },
      { costCode: '12-350', description: 'Quartz Countertops', qtyPerUnit: 45, unit: 'SF', unitCost: 85 },
      { costCode: '22-400', description: 'Farmhouse Sink + Faucet', qtyPerUnit: 1, unit: 'EA', unitCost: 1200 },
      { costCode: '09-300', description: 'Tile Backsplash', qtyPerUnit: 30, unit: 'SF', unitCost: 25 },
      { costCode: '22-410', description: 'Garbage Disposal', qtyPerUnit: 1, unit: 'EA', unitCost: 350 },
      { costCode: '26-200', description: 'Under Cabinet Lighting', qtyPerUnit: 12, unit: 'LF', unitCost: 45 },
      { costCode: '06-410', description: 'Cabinet Hardware', qtyPerUnit: 1, unit: 'SET', unitCost: 280 },
    ],
    tierPricing: { Builder: 32000, Standard: 38000, Premium: 42500, Luxury: 58000 },
    usageLocations: [
      { jobName: 'Smith Residence', phase: 'Kitchen', dateAdded: 'Jan 15' },
      { jobName: 'Ocean View Estate', phase: 'Main Kitchen', dateAdded: 'Jan 12' },
      { jobName: 'Downtown Condo', phase: 'Kitchen Remodel', dateAdded: 'Jan 8' },
    ],
    costHistory: { sixtyDays: 2.1, sixMonths: 5.4 },
  },
  {
    id: '2',
    name: 'Coastal Master Bathroom',
    category: 'Bathroom',
    lineItems: 18,
    defaultTier: 'Premium',
    totalCost: 28000,
    parameterUnit: 'EA',
    costPerUnit: 28000,
    usageCount: 22,
    lastUsed: '1 week ago',
    createdAt: 'Dec 10, 2024',
    description: 'Double vanity, walk-in shower, freestanding tub, tile, lighting',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: true,
    wasteFactorApplied: true,
    costChange: 8.5,
    costChangeDirection: 'up',
    aiNote: 'Tile costs increased 8.5% since last review - review selections',
    sampleItems: [
      { costCode: '09-310', description: 'Porcelain Floor Tile', qtyPerUnit: 120, unit: 'SF', unitCost: 12 },
      { costCode: '09-320', description: 'Shower Wall Tile', qtyPerUnit: 80, unit: 'SF', unitCost: 18 },
      { costCode: '12-400', description: 'Double Vanity', qtyPerUnit: 1, unit: 'EA', unitCost: 2800 },
      { costCode: '22-420', description: 'Freestanding Tub', qtyPerUnit: 1, unit: 'EA', unitCost: 3200 },
      { costCode: '22-430', description: 'Frameless Shower Door', qtyPerUnit: 1, unit: 'EA', unitCost: 1800 },
    ],
    costChangeDetails: [
      { item: 'Tile', change: 240, percentage: 12 },
      { item: 'Labor', change: 80, percentage: 5 },
      { item: 'Grout', change: -20, percentage: -3 },
    ],
    tierPricing: { Builder: 18000, Standard: 23000, Premium: 28000, Luxury: 42000 },
    usageLocations: [
      { jobName: 'Coastal Villa', phase: 'Master Bath', dateAdded: 'Jan 18' },
      { jobName: 'Beachfront Home', phase: 'Primary Suite', dateAdded: 'Jan 10' },
    ],
    costHistory: { sixtyDays: 8.5, sixMonths: 12.3 },
  },
  {
    id: '3',
    name: 'Basic Half Bath',
    category: 'Bathroom',
    lineItems: 6,
    defaultTier: 'Standard',
    totalCost: 8500,
    parameterUnit: 'EA',
    costPerUnit: 8500,
    usageCount: 45,
    lastUsed: '3 days ago',
    createdAt: 'Aug 22, 2024',
    description: 'Vanity, toilet, mirror, lighting, flooring',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    sampleItems: [
      { costCode: '12-410', description: 'Single Vanity', qtyPerUnit: 1, unit: 'EA', unitCost: 850 },
      { costCode: '22-440', description: 'Toilet', qtyPerUnit: 1, unit: 'EA', unitCost: 450 },
      { costCode: '08-100', description: 'Framed Mirror', qtyPerUnit: 1, unit: 'EA', unitCost: 280 },
    ],
    tierPricing: { Builder: 6200, Standard: 8500, Premium: 12000, Luxury: 18000 },
    usageLocations: [
      { jobName: 'Miller Home', phase: 'Guest Bath', dateAdded: 'Jan 20' },
    ],
    costHistory: { sixtyDays: 1.2, sixMonths: 3.8 },
  },
  {
    id: '4',
    name: 'Exterior Paint Package',
    category: 'Exterior',
    lineItems: 8,
    defaultTier: 'Standard',
    totalCost: 12000,
    parameterUnit: 'SF',
    costPerUnit: 3.43,
    usageCount: 28,
    lastUsed: '1 month ago',
    createdAt: 'Sep 5, 2024',
    description: 'Prep, prime, 2-coat paint, trim, doors, shutters, cleanup',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    tierPricing: { Builder: 8500, Standard: 12000, Premium: 16000, Luxury: 24000 },
    costHistory: { sixtyDays: 0.5, sixMonths: 2.1 },
  },
  {
    id: '5',
    name: 'HVAC System - 3 Ton',
    category: 'MEP',
    lineItems: 15,
    defaultTier: 'Standard',
    totalCost: 18500,
    parameterUnit: 'TON',
    costPerUnit: 6167,
    usageCount: 31,
    lastUsed: '2 weeks ago',
    createdAt: 'Oct 1, 2024',
    description: 'Condenser, air handler, ductwork, thermostat, permits, startup',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: false,
    costChange: -3.2,
    costChangeDirection: 'down',
    costChangeDetails: [
      { item: 'Condenser', change: -450, percentage: -5 },
      { item: 'Ductwork', change: -140, percentage: -3 },
      { item: 'Labor', change: 80, percentage: 2 },
    ],
    tierPricing: { Builder: 14000, Standard: 18500, Premium: 24000, Luxury: 32000 },
    costHistory: { sixtyDays: -3.2, sixMonths: -1.8 },
  },
  {
    id: '6',
    name: 'Luxury Master Closet',
    category: 'Interior',
    lineItems: 10,
    defaultTier: 'Luxury',
    totalCost: 15000,
    parameterUnit: 'EA',
    costPerUnit: 15000,
    usageCount: 12,
    lastUsed: '3 weeks ago',
    createdAt: 'Nov 18, 2024',
    description: 'Custom shelving, island, lighting, flooring, mirrors, hardware',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    tierPricing: { Builder: 6000, Standard: 9000, Premium: 12000, Luxury: 15000 },
    costHistory: { sixtyDays: 3.1, sixMonths: 7.2 },
  },
  {
    id: '7',
    name: 'Framing Package - Single Story',
    category: 'Structural',
    lineItems: 20,
    defaultTier: 'Standard',
    totalCost: 85000,
    parameterUnit: 'SF',
    costPerUnit: 24.29,
    usageCount: 18,
    lastUsed: '1 week ago',
    createdAt: 'Jul 12, 2024',
    description: 'Wall framing, roof trusses, sheathing, hardware, hurricane clips',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: true,
    wasteFactorApplied: true,
    aiNote: 'Missing hurricane clips - commonly forgotten item',
    sampleItems: [
      { costCode: '06-100', description: '2x4 Wall Framing', qtyPerUnit: 3500, unit: 'LF', unitCost: 4.50 },
      { costCode: '06-110', description: 'Roof Trusses', qtyPerUnit: 24, unit: 'EA', unitCost: 450 },
      { costCode: '06-120', description: 'OSB Sheathing', qtyPerUnit: 180, unit: 'SHT', unitCost: 38 },
      { costCode: '06-130', description: 'Hardware/Connectors', qtyPerUnit: 1, unit: 'LOT', unitCost: 2800 },
    ],
    tierPricing: { Builder: 72000, Standard: 85000, Premium: 95000, Luxury: 110000 },
    usageLocations: [
      { jobName: 'Coastal Villa', phase: 'Framing', dateAdded: 'Jan 15' },
      { jobName: 'Lake House', phase: 'Structure', dateAdded: 'Jan 8' },
    ],
    costHistory: { sixtyDays: 8.5, sixMonths: 12 },
  },
  {
    id: '8',
    name: 'Electrical Rough-In',
    category: 'MEP',
    lineItems: 14,
    defaultTier: 'Standard',
    totalCost: 22000,
    parameterUnit: 'SF',
    costPerUnit: 6.29,
    usageCount: 35,
    lastUsed: '5 days ago',
    createdAt: 'Jun 1, 2024',
    description: 'Panel, circuits, outlets, switches, low voltage, permits',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: false,
    tierPricing: { Builder: 18000, Standard: 22000, Premium: 28000, Luxury: 36000 },
    costHistory: { sixtyDays: 2.4, sixMonths: 4.8 },
  },
  {
    id: '9',
    name: 'Exterior Wall Assembly',
    category: 'Structural',
    lineItems: 8,
    defaultTier: 'Standard',
    totalCost: 18.50,
    parameterUnit: 'LF',
    costPerUnit: 18.50,
    usageCount: 41,
    lastUsed: '4 days ago',
    createdAt: 'May 15, 2024',
    description: 'Framing labor, framing material, sheathing, housewrap, insulation',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    costChange: 4.2,
    costChangeDirection: 'up',
    aiNote: 'Lumber prices trending up 4.2% - review framing material costs',
    costChangeDetails: [
      { item: 'Lumber', change: 0.55, percentage: 6 },
      { item: 'Sheathing', change: 0.22, percentage: 4 },
      { item: 'Insulation', change: -0.05, percentage: -1 },
    ],
    tierPricing: { Builder: 15.00, Standard: 18.50, Premium: 22.00, Luxury: 28.00 },
    costHistory: { sixtyDays: 4.2, sixMonths: 8.5 },
  },
  {
    id: '10',
    name: 'Plumbing Rough-In (Retired)',
    category: 'MEP',
    lineItems: 11,
    defaultTier: 'Standard',
    totalCost: 15200,
    parameterUnit: 'EA',
    costPerUnit: 15200,
    usageCount: 8,
    lastUsed: '6 months ago',
    createdAt: 'Mar 1, 2024',
    description: 'Water supply, drain/waste/vent, fixtures rough, gas piping',
    isFavorite: false,
    isActive: false,
    hasNestedAssemblies: false,
    wasteFactorApplied: false,
    tierPricing: { Builder: 12000, Standard: 15200, Premium: 19000, Luxury: 25000 },
  },
]

const categories = ['All', 'Kitchen', 'Bathroom', 'Exterior', 'MEP', 'Interior', 'Structural']

const tierConfig = {
  Builder: { color: 'bg-warm-100 text-warm-700', label: 'Builder' },
  Standard: { color: 'bg-stone-100 text-stone-700', label: 'Standard' },
  Premium: { color: 'bg-warm-100 text-warm-700', label: 'Premium' },
  Luxury: { color: 'bg-amber-100 text-amber-700', label: 'Luxury' },
}

const tiers: Array<'Builder' | 'Standard' | 'Premium' | 'Luxury'> = ['Builder', 'Standard', 'Premium', 'Luxury']

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function formatCurrencyFull(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-warm-1000" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-warm-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-warm-100 rounded">
            <X className="h-4 w-4 text-warm-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Import Modal Component
function ImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Assemblies">
      <div className="space-y-4">
        <p className="text-sm text-warm-600">Import assemblies from CSV or Excel files.</p>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging ? "border-stone-500 bg-stone-50" : "border-warm-300"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
        >
          <Upload className="h-10 w-10 text-warm-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-warm-700">Drop files here or click to browse</p>
          <p className="text-xs text-warm-500 mt-1">Supports CSV and Excel (.xlsx) files</p>
          <input type="file" className="hidden" accept=".csv,.xlsx,.xls" />
          <button className="mt-4 px-4 py-2 bg-stone-600 text-white text-sm rounded hover:bg-stone-700">
            Select File
          </button>
        </div>
        <div className="text-xs text-warm-500">
          <p className="font-medium mb-1">Required columns:</p>
          <p>Name, Category, Default Tier, Total Cost, Parameter Unit, Cost Per Unit</p>
        </div>
      </div>
    </Modal>
  )
}

// Export Modal Component
function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Assemblies">
      <div className="space-y-3">
        <p className="text-sm text-warm-600">Choose export format:</p>
        <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-warm-50 text-left">
          <FileText className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-medium text-warm-900">Export as CSV</div>
            <div className="text-xs text-warm-500">Compatible with Excel, Google Sheets</div>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-warm-50 text-left">
          <FileText className="h-5 w-5 text-stone-600" />
          <div>
            <div className="font-medium text-warm-900">Export as Excel</div>
            <div className="text-xs text-warm-500">Native .xlsx format with formatting</div>
          </div>
        </button>
      </div>
    </Modal>
  )
}

// Usage Locations Modal
function UsageLocationsModal({ isOpen, onClose, assembly }: { isOpen: boolean; onClose: () => void; assembly: Assembly }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Where Used: ${assembly.name}`}>
      <div className="space-y-3">
        {assembly.usageLocations && assembly.usageLocations.length > 0 ? (
          assembly.usageLocations.map((location, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg">
              <MapPin className="h-4 w-4 text-warm-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-warm-900">{location.jobName}</div>
                <div className="text-sm text-warm-500">{location.phase}</div>
              </div>
              <div className="text-xs text-warm-400">Added {location.dateAdded}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-warm-500 text-center py-4">No usage locations recorded</p>
        )}
        {assembly.usageCount > (assembly.usageLocations?.length || 0) && (
          <p className="text-xs text-warm-500 text-center">
            ... and {assembly.usageCount - (assembly.usageLocations?.length || 0)} more locations
          </p>
        )}
      </div>
    </Modal>
  )
}

// Tier Comparison Modal
function TierComparisonModal({ isOpen, onClose, assembly }: { isOpen: boolean; onClose: () => void; assembly: Assembly }) {
  if (!assembly.tierPricing) return null

  const currentPrice = assembly.tierPricing[assembly.defaultTier]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tier Pricing: ${assembly.name}`}>
      <div className="space-y-2">
        {tiers.map(tier => {
          const price = assembly.tierPricing![tier]
          const diff = price - currentPrice
          const isDefault = tier === assembly.defaultTier
          const tierCfg = tierConfig[tier]

          return (
            <div
              key={tier}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                isDefault ? "bg-stone-50 border-stone-200" : "bg-white border-warm-200"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("text-xs px-2 py-1 rounded font-medium", tierCfg.color)}>
                  {tierCfg.label}
                </span>
                {isDefault && (
                  <span className="text-xs bg-stone-600 text-white px-1.5 py-0.5 rounded">Current</span>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium text-warm-900">{formatCurrencyFull(price)}</div>
                {!isDefault && (
                  <div className={cn("text-xs", diff > 0 ? "text-red-600" : "text-green-600")}>
                    {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

function AssemblyCard({ assembly }: { assembly: Assembly }) {
  const [showLineItems, setShowLineItems] = useState(false)
  const [showCostDetails, setShowCostDetails] = useState(false)
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTierComparison, setShowTierComparison] = useState(false)
  const [showUsageModal, setShowUsageModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'Builder' | 'Standard' | 'Premium' | 'Luxury'>(assembly.defaultTier)

  const tierCfg = tierConfig[selectedTier]
  const currentPrice = assembly.tierPricing?.[selectedTier] || assembly.totalCost
  const defaultPrice = assembly.tierPricing?.[assembly.defaultTier] || assembly.totalCost
  const tierDiff = currentPrice - defaultPrice

  const displayedItems = assembly.sampleItems?.slice(0, 5) || []
  const remainingItems = (assembly.sampleItems?.length || 0) - 5

  const handleTierChange = (tier: 'Builder' | 'Standard' | 'Premium' | 'Luxury') => {
    setSelectedTier(tier)
    setShowTierDropdown(false)
  }

  return (
    <>
      <div className={cn(
        "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow",
        !assembly.isActive && "opacity-60 border-dashed",
        assembly.isActive && "border-warm-200",
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-warm-500 uppercase bg-warm-100 px-1.5 py-0.5 rounded">
                {assembly.category}
              </span>
              {assembly.isFavorite && (
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              )}
              {!assembly.isActive && (
                <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Inactive</span>
              )}
              {assembly.hasNestedAssemblies && (
                <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Layers className="h-3 w-3" />
                  Nested
                </span>
              )}
              {assembly.costChange !== undefined && assembly.costChangeDirection === 'up' && (
                <span className="flex items-center gap-0.5 text-xs text-red-600">
                  <TrendingUp className="h-3 w-3" />
                  +{assembly.costChange}%
                </span>
              )}
              {assembly.costChange !== undefined && assembly.costChangeDirection === 'down' && (
                <span className="flex items-center gap-0.5 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  {assembly.costChange}%
                </span>
              )}
            </div>
            <h4 className="font-medium text-warm-900">{assembly.name}</h4>
          </div>
          {/* Quick Tier Swap Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTierDropdown(!showTierDropdown)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                tierCfg.color,
                "hover:opacity-80"
              )}
            >
              {tierCfg.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showTierDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                {tiers.map(tier => {
                  const cfg = tierConfig[tier]
                  const price = assembly.tierPricing?.[tier] || assembly.totalCost
                  const diff = price - defaultPrice
                  return (
                    <button
                      key={tier}
                      onClick={() => handleTierChange(tier)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-warm-50",
                        selectedTier === tier && "bg-warm-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("px-1.5 py-0.5 rounded font-medium", cfg.color)}>{cfg.label}</span>
                        {tier === assembly.defaultTier && <span className="text-warm-400">(default)</span>}
                      </div>
                      {diff !== 0 && (
                        <span className={cn(diff > 0 ? "text-red-600" : "text-green-600")}>
                          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tier change indicator */}
        {selectedTier !== assembly.defaultTier && tierDiff !== 0 && (
          <div className={cn(
            "mb-3 px-2 py-1.5 rounded text-xs flex items-center gap-1",
            tierDiff > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          )}>
            <ArrowUpDown className="h-3 w-3" />
            Switch to {selectedTier}: {tierDiff > 0 ? '+' : ''}{formatCurrency(tierDiff)}
          </div>
        )}

        <p className="text-sm text-warm-500 mb-3 line-clamp-2">{assembly.description}</p>

        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-warm-400" />
            <span className="text-warm-600">{assembly.lineItems} items</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-warm-400" />
            <span className="font-medium text-warm-900">{formatCurrency(currentPrice)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-warm-400" />
            <span className="text-warm-600">{formatCurrency(assembly.costPerUnit)}/{assembly.parameterUnit}</span>
          </div>
        </div>

        {/* Cost History */}
        {assembly.costHistory && (
          <div className="flex items-center gap-2 text-xs text-warm-500 mb-3">
            <BarChart3 className="h-3 w-3" />
            <span>
              60 days: <span className={assembly.costHistory.sixtyDays >= 0 ? "text-red-600" : "text-green-600"}>
                {assembly.costHistory.sixtyDays >= 0 ? '+' : ''}{assembly.costHistory.sixtyDays}%
              </span>
            </span>
            <span className="text-warm-300">|</span>
            <span>
              6 months: <span className={assembly.costHistory.sixMonths >= 0 ? "text-red-600" : "text-green-600"}>
                {assembly.costHistory.sixMonths >= 0 ? '+' : ''}{assembly.costHistory.sixMonths}%
              </span>
            </span>
          </div>
        )}

        {assembly.wasteFactorApplied && (
          <div className="flex items-center gap-1 text-xs text-warm-400 mb-3">
            <RefreshCw className="h-3 w-3" />
            <span>Waste factors applied</span>
          </div>
        )}

        {/* Cost Change Details */}
        {assembly.costChange !== undefined && assembly.costChangeDetails && (
          <div className="mb-3">
            <button
              onClick={() => setShowCostDetails(!showCostDetails)}
              className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1"
            >
              {showCostDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              View Details
            </button>
            {showCostDetails && (
              <div className="mt-2 p-2 bg-warm-50 rounded text-xs space-y-1">
                {assembly.costChangeDetails.map((detail, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-warm-600">{detail.item}</span>
                    <span className={detail.change >= 0 ? "text-red-600" : "text-green-600"}>
                      {detail.change >= 0 ? '+' : ''}{formatCurrency(Math.abs(detail.change))} ({detail.percentage >= 0 ? '+' : ''}{detail.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-warm-100">
          <div className="flex items-center gap-3">
            <span className={cn("text-xs px-2 py-1 rounded font-medium", tierCfg.color)}>
              {tierCfg.label}
            </span>
            <span className="text-xs text-warm-500">
              Used {assembly.usageCount}x
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-400">
            <Clock className="h-3.5 w-3.5" />
            {assembly.lastUsed}
          </div>
        </div>

        {assembly.aiNote && (
          <div className="mt-3 p-2 rounded-md bg-amber-50 flex items-start gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
            <span className="text-amber-700">{assembly.aiNote}</span>
          </div>
        )}

        {/* Expandable Line Items Section */}
        {assembly.sampleItems && assembly.sampleItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-warm-100">
            <button
              onClick={() => setShowLineItems(!showLineItems)}
              className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-700"
            >
              {showLineItems ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <Layers className="h-3.5 w-3.5" />
              View Line Items ({assembly.sampleItems.length})
            </button>
            {showLineItems && (
              <div className="mt-2 bg-warm-50 rounded-lg p-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-warm-500 border-b border-warm-200">
                      <th className="text-left py-1 px-1">Name</th>
                      <th className="text-right py-1 px-1">Qty</th>
                      <th className="text-right py-1 px-1">Unit Cost</th>
                      <th className="text-right py-1 px-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-warm-100 last:border-0">
                        <td className="py-1.5 px-1 text-warm-700">{item.description}</td>
                        <td className="py-1.5 px-1 text-right text-warm-600">{item.qtyPerUnit} {item.unit}</td>
                        <td className="py-1.5 px-1 text-right text-warm-600">{formatCurrency(item.unitCost)}</td>
                        <td className="py-1.5 px-1 text-right font-medium text-warm-900">
                          {formatCurrency(item.qtyPerUnit * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {remainingItems > 0 && (
                  <p className="text-xs text-warm-500 mt-2 text-center">... and {remainingItems} more items</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100">
          <button
            onClick={() => setShowTierComparison(true)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Compare Tiers
          </button>
          <button
            onClick={() => setShowUsageModal(true)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50"
          >
            <MapPin className="h-3.5 w-3.5" />
            Where Used
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50">
            <Copy className="h-3.5 w-3.5" />
            Clone
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-stone-600 text-white rounded hover:bg-stone-700">
            <Package className="h-3.5 w-3.5" />
            Use in Estimate
          </button>
        </div>
      </div>

      {/* Modals */}
      <TierComparisonModal isOpen={showTierComparison} onClose={() => setShowTierComparison(false)} assembly={assembly} />
      <UsageLocationsModal isOpen={showUsageModal} onClose={() => setShowUsageModal(false)} assembly={assembly} />
    </>
  )
}

function AssemblyRow({ assembly }: { assembly: Assembly }) {
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'Builder' | 'Standard' | 'Premium' | 'Luxury'>(assembly.defaultTier)

  const tierCfg = tierConfig[selectedTier]
  const currentPrice = assembly.tierPricing?.[selectedTier] || assembly.totalCost
  const defaultPrice = assembly.tierPricing?.[assembly.defaultTier] || assembly.totalCost
  const tierDiff = currentPrice - defaultPrice

  return (
    <tr className={cn(
      "hover:bg-warm-50",
      !assembly.isActive && "opacity-60",
    )}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {assembly.isFavorite && (
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-warm-900">{assembly.name}</span>
              {!assembly.isActive && (
                <span className="text-xs bg-red-50 text-red-600 px-1 py-0.5 rounded">Inactive</span>
              )}
              {assembly.hasNestedAssemblies && (
                <span title="Contains nested assemblies"><Layers className="h-3.5 w-3.5 text-stone-600" /></span>
              )}
            </div>
            <div className="text-xs text-warm-500">{assembly.description}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs font-medium text-warm-500 uppercase bg-warm-100 px-1.5 py-0.5 rounded">
          {assembly.category}
        </span>
      </td>
      <td className="py-3 px-4 text-center text-sm text-warm-600">{assembly.lineItems}</td>
      <td className="py-3 px-4">
        <div className="relative">
          <button
            onClick={() => setShowTierDropdown(!showTierDropdown)}
            className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded font-medium", tierCfg.color)}
          >
            {tierCfg.label}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showTierDropdown && (
            <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
              {tiers.map(tier => {
                const cfg = tierConfig[tier]
                return (
                  <button
                    key={tier}
                    onClick={() => { setSelectedTier(tier); setShowTierDropdown(false) }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-warm-50",
                      selectedTier === tier && "bg-warm-50"
                    )}
                  >
                    <span className={cn("px-1.5 py-0.5 rounded font-medium", cfg.color)}>{cfg.label}</span>
                    {selectedTier === tier && <Check className="h-3 w-3 text-stone-600" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="font-medium text-warm-900">{formatCurrency(currentPrice)}</span>
          {tierDiff !== 0 && (
            <span className={cn("text-xs", tierDiff > 0 ? "text-red-600" : "text-green-600")}>
              ({tierDiff > 0 ? '+' : ''}{formatCurrency(tierDiff)})
            </span>
          )}
          {assembly.costChange !== undefined && assembly.costChangeDirection === 'up' && (
            <span className="text-xs text-red-600">+{assembly.costChange}%</span>
          )}
          {assembly.costChange !== undefined && assembly.costChangeDirection === 'down' && (
            <span className="text-xs text-green-600">{assembly.costChange}%</span>
          )}
        </div>
        <div className="text-xs text-warm-400">{formatCurrency(assembly.costPerUnit)}/{assembly.parameterUnit}</div>
      </td>
      <td className="py-3 px-4 text-center text-sm text-warm-600">{assembly.usageCount}</td>
      <td className="py-3 px-4 text-right text-sm text-warm-500">{assembly.lastUsed}</td>
      <td className="py-3 px-4">
        <button className="p-1 hover:bg-warm-100 rounded">
          <ChevronRight className="h-4 w-4 text-warm-400" />
        </button>
      </td>
    </tr>
  )
}

export function AssembliesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const filteredAssemblies = sortItems(
    mockAssemblies.filter(assembly => {
      if (!matchesSearch(assembly, search, ['name', 'category', 'description'])) return false
      if (activeTab !== 'all' && assembly.category !== activeTab) return false
      return true
    }),
    activeSort as keyof Assembly | '',
    sortDirection,
  )

  // Calculate stats
  const activeAssemblies = mockAssemblies.filter(a => a.isActive)
  const totalAssemblies = activeAssemblies.length
  const totalValue = activeAssemblies.reduce((sum, a) => sum + a.totalCost, 0)
  const totalUsage = activeAssemblies.reduce((sum, a) => sum + a.usageCount, 0)
  const favorites = activeAssemblies.filter(a => a.isFavorite).length
  const withCostIncreases = activeAssemblies.filter(a => a.costChangeDirection === 'up').length
  const withCostDecreases = activeAssemblies.filter(a => a.costChangeDirection === 'down').length
  const nestedCount = activeAssemblies.filter(a => a.hasNestedAssemblies).length
  const inactiveCount = mockAssemblies.filter(a => !a.isActive).length

  // AI Features for the panel
  const aiFeatures = [
    {
      feature: 'Assembly Suggestions',
      trigger: 'On creation',
      insight: 'For Master Bath, consider: Luxury Tile Package ($4,200) - used in 8 similar projects',
      severity: 'info' as const,
      action: { label: 'View Package', onClick: () => {} },
    },
    {
      feature: 'Cost Drift Alert',
      trigger: 'Real-time',
      insight: 'Framing Package up 8.5% in 60 days. Drivers: Lumber +12%, Hardware +3%. Consider: Lock pricing with supplier.',
      severity: 'warning' as const,
      action: { label: 'Review Pricing', onClick: () => {} },
    },
    {
      feature: 'Missing Item Detection',
      trigger: 'On change',
      insight: 'Framing Package may be missing hurricane clips. Required for coastal zone (this project location).',
      severity: 'critical' as const,
      action: { label: 'Add Item', onClick: () => {} },
    },
    {
      feature: 'Variant Recommendation',
      trigger: 'Weekly',
      insight: 'Tile Surround Package used 34 times. Consider: Create Budget ($1,800) and Luxury ($4,200) variants.',
      severity: 'info' as const,
      action: { label: 'Create Variants', onClick: () => {} },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-warm-900">Assemblies & Templates</h3>
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
              {totalAssemblies} active
            </span>
            {inactiveCount > 0 && (
              <span className="text-xs bg-warm-100 text-warm-500 px-2 py-0.5 rounded">
                {inactiveCount} inactive
              </span>
            )}
          </div>
          <div className="text-sm text-warm-500 mt-0.5">
            Reusable building blocks for estimates -- parameterized recipes that auto-calculate child items
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search assemblies..."
          tabs={[
            { key: 'all', label: 'All', count: mockAssemblies.length },
            ...categories.filter(c => c !== 'All').map(cat => ({
              key: cat,
              label: cat,
              count: mockAssemblies.filter(a => a.category === cat).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'totalCost', label: 'Total Cost' },
            { value: 'costPerUnit', label: 'Cost/Unit' },
            { value: 'usageCount', label: 'Usage' },
            { value: 'category', label: 'Category' },
            { value: 'lastUsed', label: 'Last Used' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'New Assembly', onClick: () => {}, variant: 'primary' },
            { icon: Upload, label: 'Import', onClick: () => setShowImportModal(true) },
            { icon: Download, label: 'Export', onClick: () => setShowExportModal(true) },
          ]}
          resultCount={filteredAssemblies.length}
          totalCount={mockAssemblies.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-7 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <Package className="h-4 w-4" />
              Active
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalAssemblies}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Value
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(totalValue)}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <BarChart3 className="h-4 w-4" />
              Total Usage
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalUsage}x</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-sm">
              <Star className="h-4 w-4" />
              Favorites
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{favorites}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Layers className="h-4 w-4" />
              Nested
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{nestedCount}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            withCostIncreases > 0 ? "bg-red-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              withCostIncreases > 0 ? "text-red-600" : "text-warm-500"
            )}>
              <TrendingUp className="h-4 w-4" />
              Cost Increases
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              withCostIncreases > 0 ? "text-red-700" : "text-warm-900"
            )}>
              {withCostIncreases}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            withCostDecreases > 0 ? "bg-green-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              withCostDecreases > 0 ? "text-green-600" : "text-warm-500"
            )}>
              <TrendingDown className="h-4 w-4" />
              Cost Decreases
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              withCostDecreases > 0 ? "text-green-700" : "text-warm-900"
            )}>
              {withCostDecreases}
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Assembly Insights"
          features={aiFeatures}
          columns={2}
        />
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {filteredAssemblies.map(assembly => (
            <AssemblyCard key={assembly.id} assembly={assembly} />
          ))}
          {filteredAssemblies.length === 0 && (
            <div className="col-span-3 text-center py-12 text-warm-500">
              No assemblies match the current filters
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-warm-100 border-b border-warm-200 sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Assembly</th>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Category</th>
                <th className="text-center py-3 px-4 font-medium text-warm-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-warm-600">Default Tier</th>
                <th className="text-right py-3 px-4 font-medium text-warm-600">Total Cost</th>
                <th className="text-center py-3 px-4 font-medium text-warm-600">Usage</th>
                <th className="text-right py-3 px-4 font-medium text-warm-600">Last Used</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-warm-100">
              {filteredAssemblies.map(assembly => (
                <AssemblyRow key={assembly.id} assembly={assembly} />
              ))}
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
            <FileText className="h-3 w-3" />
            Estimates
          </span>
          <span className="bg-warm-50 text-warm-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Cost Codes
          </span>
          <span className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Price Intelligence
          </span>
        </div>
      </div>

      {/* Import/Export Modals */}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  )
}
