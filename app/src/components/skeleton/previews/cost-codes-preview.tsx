'use client'

import { useState } from 'react'
import {
  Plus,
  Sparkles,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Link2,
  Edit2,
  MoreHorizontal,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  FolderTree,
  Hash,
  Building2,
  Merge,
  Archive,
  Ruler,
  ShoppingCart,
  FileText,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'
import React from 'react'

interface CostCode {
  id: string
  code: string
  name: string
  system: 'csi' | 'custom' | 'hybrid'
  level: number
  defaultUnit?: string
  defaultUnitCost?: number
  qbAccount?: string
  qbMapped: boolean
  glAccount?: string
  defaultMarkup: number
  trackLabor: boolean
  isActive: boolean
  usageCount: number
  linkedBudgetLines: number
  linkedPOs: number
  linkedInvoices: number
  children?: CostCode[]
}

const mockCostCodes: CostCode[] = [
  {
    id: '1',
    code: '01',
    name: 'General Conditions',
    system: 'csi',
    level: 1,
    defaultUnit: 'LS',
    qbAccount: '5000-General',
    qbMapped: true,
    glAccount: '5000',
    defaultMarkup: 10,
    trackLabor: true,
    isActive: true,
    usageCount: 245,
    linkedBudgetLines: 18,
    linkedPOs: 12,
    linkedInvoices: 45,
    children: [
      { id: '1-1', code: '01-100', name: 'Project Management', system: 'csi', level: 2, defaultUnit: 'HR', defaultUnitCost: 85, qbAccount: '5010-PM', qbMapped: true, glAccount: '5010', defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 89, linkedBudgetLines: 6, linkedPOs: 2, linkedInvoices: 15 },
      { id: '1-2', code: '01-200', name: 'Temporary Facilities', system: 'csi', level: 2, defaultUnit: 'MO', defaultUnitCost: 1200, qbAccount: '5020-Temp', qbMapped: true, glAccount: '5020', defaultMarkup: 8, trackLabor: false, isActive: true, usageCount: 67, linkedBudgetLines: 5, linkedPOs: 4, linkedInvoices: 12 },
      { id: '1-3', code: '01-300', name: 'Permits & Fees', system: 'csi', level: 2, defaultUnit: 'EA', qbAccount: '5030-Permits', qbMapped: true, glAccount: '5030', defaultMarkup: 5, trackLabor: false, isActive: true, usageCount: 52, linkedBudgetLines: 4, linkedPOs: 0, linkedInvoices: 8 },
      { id: '1-4', code: '01-400', name: 'Insurance', system: 'csi', level: 2, defaultUnit: 'LS', qbAccount: '5040-Insurance', qbMapped: true, glAccount: '5040', defaultMarkup: 0, trackLabor: false, isActive: true, usageCount: 37, linkedBudgetLines: 3, linkedPOs: 0, linkedInvoices: 10 },
    ]
  },
  {
    id: '2',
    code: '06',
    name: 'Wood & Plastics',
    system: 'csi',
    level: 1,
    defaultUnit: 'SF',
    qbAccount: '5600-Carpentry',
    qbMapped: true,
    glAccount: '5600',
    defaultMarkup: 15,
    trackLabor: true,
    isActive: true,
    usageCount: 412,
    linkedBudgetLines: 24,
    linkedPOs: 18,
    linkedInvoices: 56,
    children: [
      { id: '2-1', code: '06-100', name: 'Rough Carpentry', system: 'csi', level: 2, defaultUnit: 'SF', defaultUnitCost: 12.50, qbAccount: '5610-Rough', qbMapped: true, glAccount: '5610', defaultMarkup: 15, trackLabor: true, isActive: true, usageCount: 156, linkedBudgetLines: 10, linkedPOs: 8, linkedInvoices: 22 },
      { id: '2-2', code: '06-200', name: 'Finish Carpentry', system: 'csi', level: 2, defaultUnit: 'LF', defaultUnitCost: 8.75, qbAccount: '5620-Finish', qbMapped: true, glAccount: '5620', defaultMarkup: 18, trackLabor: true, isActive: true, usageCount: 189, linkedBudgetLines: 9, linkedPOs: 7, linkedInvoices: 24 },
      { id: '2-3', code: '06-300', name: 'Millwork', system: 'csi', level: 2, defaultUnit: 'EA', defaultUnitCost: 450, qbAccount: '5630-Millwork', qbMapped: true, glAccount: '5630', defaultMarkup: 20, trackLabor: true, isActive: true, usageCount: 67, linkedBudgetLines: 5, linkedPOs: 3, linkedInvoices: 10 },
    ]
  },
  {
    id: '3',
    code: '07',
    name: 'Thermal & Moisture',
    system: 'csi',
    level: 1,
    defaultUnit: 'SF',
    qbAccount: '5700-ThermalMoisture',
    qbMapped: true,
    glAccount: '5700',
    defaultMarkup: 12,
    trackLabor: true,
    isActive: true,
    usageCount: 198,
    linkedBudgetLines: 12,
    linkedPOs: 8,
    linkedInvoices: 20,
    children: [
      { id: '3-1', code: '07-100', name: 'Waterproofing', system: 'csi', level: 2, defaultUnit: 'SF', defaultUnitCost: 3.25, qbAccount: '5710-WP', qbMapped: true, glAccount: '5710', defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 78, linkedBudgetLines: 4, linkedPOs: 3, linkedInvoices: 7 },
      { id: '3-2', code: '07-200', name: 'Insulation', system: 'csi', level: 2, defaultUnit: 'SF', defaultUnitCost: 1.85, qbAccount: '5720-Insulation', qbMapped: true, glAccount: '5720', defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 65, linkedBudgetLines: 4, linkedPOs: 3, linkedInvoices: 6 },
      { id: '3-3', code: '07-300', name: 'Roofing', system: 'csi', level: 2, defaultUnit: 'SQ', defaultUnitCost: 285, qbAccount: '5730-Roofing', qbMapped: true, glAccount: '5730', defaultMarkup: 15, trackLabor: true, isActive: true, usageCount: 55, linkedBudgetLines: 4, linkedPOs: 2, linkedInvoices: 7 },
    ]
  },
  {
    id: '4',
    code: '08',
    name: 'Doors & Windows',
    system: 'csi',
    level: 1,
    defaultUnit: 'EA',
    qbMapped: false,
    defaultMarkup: 12,
    trackLabor: true,
    isActive: true,
    usageCount: 287,
    linkedBudgetLines: 14,
    linkedPOs: 10,
    linkedInvoices: 18,
    children: [
      { id: '4-1', code: '08-100', name: 'Doors', system: 'csi', level: 2, defaultUnit: 'EA', defaultUnitCost: 850, qbMapped: false, defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 145, linkedBudgetLines: 7, linkedPOs: 5, linkedInvoices: 9 },
      { id: '4-2', code: '08-200', name: 'Windows', system: 'csi', level: 2, defaultUnit: 'EA', defaultUnitCost: 1200, qbMapped: false, defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 142, linkedBudgetLines: 7, linkedPOs: 5, linkedInvoices: 9 },
    ]
  },
  {
    id: '5',
    code: '09',
    name: 'Finishes',
    system: 'csi',
    level: 1,
    defaultUnit: 'SF',
    qbAccount: '5900-Finishes',
    qbMapped: true,
    glAccount: '5900',
    defaultMarkup: 15,
    trackLabor: true,
    isActive: true,
    usageCount: 523,
    linkedBudgetLines: 28,
    linkedPOs: 22,
    linkedInvoices: 65,
    children: [
      { id: '5-1', code: '09-100', name: 'Drywall', system: 'csi', level: 2, defaultUnit: 'SF', defaultUnitCost: 2.75, qbAccount: '5910-Drywall', qbMapped: true, glAccount: '5910', defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 178, linkedBudgetLines: 10, linkedPOs: 8, linkedInvoices: 22 },
      { id: '5-2', code: '09-200', name: 'Tile', system: 'csi', level: 2, defaultUnit: 'SF', defaultUnitCost: 14.50, qbAccount: '5920-Tile', qbMapped: true, glAccount: '5920', defaultMarkup: 18, trackLabor: true, isActive: true, usageCount: 156, linkedBudgetLines: 8, linkedPOs: 7, linkedInvoices: 20 },
      { id: '5-3', code: '09-300', name: 'Paint', system: 'csi', level: 2, defaultUnit: 'SF', defaultUnitCost: 1.95, qbAccount: '5930-Paint', qbMapped: true, glAccount: '5930', defaultMarkup: 15, trackLabor: true, isActive: true, usageCount: 189, linkedBudgetLines: 10, linkedPOs: 7, linkedInvoices: 23 },
    ]
  },
  {
    id: '6',
    code: '15',
    name: 'Mechanical',
    system: 'csi',
    level: 1,
    defaultUnit: 'LS',
    qbAccount: '6500-Mechanical',
    qbMapped: true,
    glAccount: '6500',
    defaultMarkup: 10,
    trackLabor: true,
    isActive: true,
    usageCount: 312,
    linkedBudgetLines: 16,
    linkedPOs: 12,
    linkedInvoices: 38,
    children: [
      { id: '6-1', code: '15-100', name: 'Plumbing', system: 'csi', level: 2, defaultUnit: 'EA', defaultUnitCost: 125, qbAccount: '6510-Plumbing', qbMapped: true, glAccount: '6510', defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 167, linkedBudgetLines: 8, linkedPOs: 6, linkedInvoices: 20 },
      { id: '6-2', code: '15-200', name: 'HVAC', system: 'csi', level: 2, defaultUnit: 'TON', defaultUnitCost: 3200, qbAccount: '6520-HVAC', qbMapped: true, glAccount: '6520', defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 145, linkedBudgetLines: 8, linkedPOs: 6, linkedInvoices: 18 },
    ]
  },
  {
    id: '7',
    code: '16',
    name: 'Electrical',
    system: 'csi',
    level: 1,
    defaultUnit: 'LS',
    qbAccount: '6600-Electrical',
    qbMapped: true,
    glAccount: '6600',
    defaultMarkup: 10,
    trackLabor: true,
    isActive: true,
    usageCount: 298,
    linkedBudgetLines: 14,
    linkedPOs: 10,
    linkedInvoices: 32,
    children: [
      { id: '7-1', code: '16-100', name: 'Electrical Rough', system: 'csi', level: 2, defaultUnit: 'EA', qbAccount: '6610-ElecRough', qbMapped: true, glAccount: '6610', defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 156, linkedBudgetLines: 7, linkedPOs: 5, linkedInvoices: 16 },
      { id: '7-2', code: '16-200', name: 'Electrical Finish', system: 'csi', level: 2, defaultUnit: 'EA', qbAccount: '6620-ElecFinish', qbMapped: true, glAccount: '6620', defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 142, linkedBudgetLines: 7, linkedPOs: 5, linkedInvoices: 16 },
    ]
  },
  {
    id: '8',
    code: 'CUST-01',
    name: 'Smart Home / Low Voltage',
    system: 'custom',
    level: 1,
    defaultUnit: 'LS',
    qbMapped: false,
    defaultMarkup: 15,
    trackLabor: true,
    isActive: false,
    usageCount: 23,
    linkedBudgetLines: 2,
    linkedPOs: 1,
    linkedInvoices: 3,
  },
]

function CostCodeRow({
  code,
  level = 0,
  expanded,
  onToggle
}: {
  code: CostCode
  level?: number
  expanded: boolean
  onToggle: () => void
}) {
  const hasChildren = code.children && code.children.length > 0

  return (
    <>
      <tr className={cn(
        "hover:bg-gray-50 transition-colors",
        level > 0 && "bg-gray-50/50",
        !code.isActive && "opacity-60"
      )}>
        <td className="py-3 px-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            style={{ paddingLeft: `${level * 20}px` }}
            onClick={hasChildren ? onToggle : undefined}
          >
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )
            ) : (
              <div className="w-4" />
            )}
            <span className="font-mono text-sm font-medium text-gray-700">{code.code}</span>
            {code.system === 'custom' && (
              <span className="text-[10px] bg-cyan-50 text-cyan-600 px-1 py-0.5 rounded">Custom</span>
            )}
            {!code.isActive && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded flex items-center gap-0.5">
                <Archive className="h-2.5 w-2.5" />
                Inactive
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={cn(
            "text-sm",
            level === 0 ? "font-medium text-gray-900" : "text-gray-700"
          )}>
            {code.name}
          </span>
        </td>
        <td className="py-3 px-3 text-center">
          {code.defaultUnit && (
            <span className="text-xs text-gray-500 font-mono">{code.defaultUnit}</span>
          )}
        </td>
        <td className="py-3 px-3 text-right">
          {code.defaultUnitCost ? (
            <span className="text-xs text-gray-600">${code.defaultUnitCost.toFixed(2)}</span>
          ) : (
            <span className="text-xs text-gray-300">-</span>
          )}
        </td>
        <td className="py-3 px-4">
          {code.qbMapped ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">{code.qbAccount}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">Not mapped</span>
            </div>
          )}
        </td>
        <td className="py-3 px-3 text-center">
          <span className="text-sm text-gray-600">{code.defaultMarkup}%</span>
        </td>
        <td className="py-3 px-3 text-center">
          {code.trackLabor ? (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Yes</span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">No</span>
          )}
        </td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-2 text-xs">
            {code.linkedBudgetLines > 0 && (
              <span className="flex items-center gap-0.5 text-gray-500" title="Linked budget lines">
                <BarChart3 className="h-3 w-3" />{code.linkedBudgetLines}
              </span>
            )}
            {code.linkedPOs > 0 && (
              <span className="flex items-center gap-0.5 text-blue-500" title="Linked POs">
                <ShoppingCart className="h-3 w-3" />{code.linkedPOs}
              </span>
            )}
            {code.linkedInvoices > 0 && (
              <span className="flex items-center gap-0.5 text-green-500" title="Linked invoices">
                <FileText className="h-3 w-3" />{code.linkedInvoices}
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-3 text-center">
          <span className="text-sm text-gray-600">{code.usageCount}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1">
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Merge">
              <Merge className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="More actions">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

export function CostCodesPreview() {
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set(['1', '2', '5']))
  const { search, setSearch, activeSort, setActiveSort, sortDirection, toggleSortDirection, activeTab, setActiveTab } = useFilterState({ defaultTab: 'active' })

  const toggleCode = (id: string) => {
    const newExpanded = new Set(expandedCodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCodes(newExpanded)
  }

  // Calculate stats
  const totalCodes = mockCostCodes.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0)
  const activeCodes = mockCostCodes.filter(c => c.isActive).reduce((sum, c) => sum + 1 + (c.children?.filter(ch => ch.isActive).length || 0), 0)
  const unmappedCodes = mockCostCodes.reduce((sum, c) => {
    let count = c.qbMapped ? 0 : 1
    count += c.children?.filter(ch => !ch.qbMapped).length || 0
    return sum + count
  }, 0)
  const totalUsage = mockCostCodes.reduce((sum, c) => sum + c.usageCount, 0)
  const divisions = mockCostCodes.length
  const csiCount = mockCostCodes.filter(c => c.system === 'csi').length
  const customCount = mockCostCodes.filter(c => c.system === 'custom').length

  // Filter codes based on tab
  const filteredCodes = mockCostCodes.filter(code => {
    if (activeTab === 'active' && !code.isActive) return false
    if (activeTab === 'unmapped' && code.qbMapped) return false
    if (activeTab === 'custom' && code.system !== 'custom') return false
    if (search && !matchesSearch(code, search, ['name', 'code'])) return false
    return true
  })

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Cost Codes</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              CSI MasterFormat
            </span>
            {customCount > 0 && (
              <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded">
                +{customCount} Custom
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Hierarchical cost code structure with QuickBooks mapping and unit pricing
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search codes..."
          tabs={[
            { key: 'active', label: 'Active', count: activeCodes },
            { key: 'all', label: 'All Codes', count: totalCodes },
            { key: 'unmapped', label: 'Unmapped', count: unmappedCodes },
            { key: 'custom', label: 'Custom', count: customCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'code', label: 'Code' },
            { value: 'name', label: 'Name' },
            { value: 'usageCount', label: 'Usage' },
            { value: 'defaultMarkup', label: 'Markup' },
            { value: 'defaultUnitCost', label: 'Unit Cost' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export CSV', onClick: () => {} },
            { icon: Upload, label: 'Import CSV', onClick: () => {} },
            { icon: Plus, label: 'Add Code', onClick: () => {}, variant: 'primary' },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Hash className="h-3.5 w-3.5" />
              Total Codes
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{totalCodes}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <FolderTree className="h-3.5 w-3.5" />
              Divisions
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{divisions}</div>
            <div className="text-[10px] text-gray-400">{csiCount} CSI / {customCount} Custom</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Link2 className="h-3.5 w-3.5" />
              QB Mapped
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {totalCodes - unmappedCodes}
              <span className="text-sm font-normal text-gray-500">/{totalCodes}</span>
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            unmappedCodes > 0 ? "bg-amber-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              unmappedCodes > 0 ? "text-amber-600" : "text-gray-500"
            )}>
              <AlertCircle className="h-3.5 w-3.5" />
              Unmapped
            </div>
            <div className={cn(
              "text-lg font-bold mt-1",
              unmappedCodes > 0 ? "text-amber-700" : "text-gray-900"
            )}>
              {unmappedCodes}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Ruler className="h-3.5 w-3.5" />
              With Unit Costs
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {mockCostCodes.reduce((sum, c) => sum + (c.children?.filter(ch => ch.defaultUnitCost).length || 0), 0)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Total Usage
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{totalUsage.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setExpandedCodes(new Set(mockCostCodes.map(c => c.id)))}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedCodes(new Set())}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Collapse All
          </button>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">Hierarchy: Division &gt; Code &gt; Item (CSI MasterFormat)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link2 className="h-4 w-4" />
          <span>QuickBooks synced 2 hours ago</span>
          <button className="text-blue-600 hover:text-blue-700 ml-2">Sync Now</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600 w-32">Code</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th className="text-center py-3 px-3 font-medium text-gray-600 w-16">Unit</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600 w-20">Unit Cost</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">QuickBooks Account</th>
              <th className="text-center py-3 px-3 font-medium text-gray-600 w-20">Markup</th>
              <th className="text-center py-3 px-3 font-medium text-gray-600 w-20">Labor</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600 w-24">Links</th>
              <th className="text-center py-3 px-3 font-medium text-gray-600 w-20">Usage</th>
              <th className="w-28"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredCodes.map(code => {
              const isExpanded = expandedCodes.has(code.id)
              return (
                <React.Fragment key={code.id}>
                  <CostCodeRow
                    code={code}
                    level={0}
                    expanded={isExpanded}
                    onToggle={() => toggleCode(code.id)}
                  />
                  {isExpanded && code.children?.map(child => (
                    <CostCodeRow
                      key={child.id}
                      code={child}
                      level={1}
                      expanded={false}
                      onToggle={() => {}}
                    />
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Suggestions:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-amber-700">
            <span>3 codes need QuickBooks mapping (Doors & Windows division + Smart Home)</span>
            <span className="text-amber-300">|</span>
            <span>06-200 Finish Carpentry is most used (189 entries) -- consider subcategories for trim vs cabinets vs built-ins</span>
            <span className="text-amber-300">|</span>
            <span>Tile markup (18%) is 3% above your regional average (15%) -- may affect bid competitiveness</span>
            <span className="text-amber-300">|</span>
            <span>CUST-01 Smart Home is inactive with 2 open budget lines -- reassign before deactivating</span>
          </div>
        </div>
      </div>
    </div>
  )
}
