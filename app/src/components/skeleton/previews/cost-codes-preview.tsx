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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'
import React from 'react'

interface CostCode {
  id: string
  code: string
  name: string
  qbAccount?: string
  qbMapped: boolean
  defaultMarkup: number
  trackLabor: boolean
  isActive: boolean
  usageCount: number
  children?: CostCode[]
}

const mockCostCodes: CostCode[] = [
  {
    id: '1',
    code: '01',
    name: 'General Conditions',
    qbAccount: '5000-General',
    qbMapped: true,
    defaultMarkup: 10,
    trackLabor: true,
    isActive: true,
    usageCount: 245,
    children: [
      { id: '1-1', code: '01-100', name: 'Project Management', qbAccount: '5010-PM', qbMapped: true, defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 89 },
      { id: '1-2', code: '01-200', name: 'Temporary Facilities', qbAccount: '5020-Temp', qbMapped: true, defaultMarkup: 8, trackLabor: false, isActive: true, usageCount: 67 },
      { id: '1-3', code: '01-300', name: 'Permits & Fees', qbAccount: '5030-Permits', qbMapped: true, defaultMarkup: 5, trackLabor: false, isActive: true, usageCount: 52 },
      { id: '1-4', code: '01-400', name: 'Insurance', qbAccount: '5040-Insurance', qbMapped: true, defaultMarkup: 0, trackLabor: false, isActive: true, usageCount: 37 },
    ]
  },
  {
    id: '2',
    code: '06',
    name: 'Wood & Plastics',
    qbAccount: '5600-Carpentry',
    qbMapped: true,
    defaultMarkup: 15,
    trackLabor: true,
    isActive: true,
    usageCount: 412,
    children: [
      { id: '2-1', code: '06-100', name: 'Rough Carpentry', qbAccount: '5610-Rough', qbMapped: true, defaultMarkup: 15, trackLabor: true, isActive: true, usageCount: 156 },
      { id: '2-2', code: '06-200', name: 'Finish Carpentry', qbAccount: '5620-Finish', qbMapped: true, defaultMarkup: 18, trackLabor: true, isActive: true, usageCount: 189 },
      { id: '2-3', code: '06-300', name: 'Millwork', qbAccount: '5630-Millwork', qbMapped: true, defaultMarkup: 20, trackLabor: true, isActive: true, usageCount: 67 },
    ]
  },
  {
    id: '3',
    code: '07',
    name: 'Thermal & Moisture',
    qbAccount: '5700-ThermalMoisture',
    qbMapped: true,
    defaultMarkup: 12,
    trackLabor: true,
    isActive: true,
    usageCount: 198,
    children: [
      { id: '3-1', code: '07-100', name: 'Waterproofing', qbAccount: '5710-WP', qbMapped: true, defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 78 },
      { id: '3-2', code: '07-200', name: 'Insulation', qbAccount: '5720-Insulation', qbMapped: true, defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 65 },
      { id: '3-3', code: '07-300', name: 'Roofing', qbAccount: '5730-Roofing', qbMapped: true, defaultMarkup: 15, trackLabor: true, isActive: true, usageCount: 55 },
    ]
  },
  {
    id: '4',
    code: '08',
    name: 'Doors & Windows',
    qbMapped: false,
    defaultMarkup: 12,
    trackLabor: true,
    isActive: true,
    usageCount: 287,
    children: [
      { id: '4-1', code: '08-100', name: 'Doors', qbMapped: false, defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 145 },
      { id: '4-2', code: '08-200', name: 'Windows', qbMapped: false, defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 142 },
    ]
  },
  {
    id: '5',
    code: '09',
    name: 'Finishes',
    qbAccount: '5900-Finishes',
    qbMapped: true,
    defaultMarkup: 15,
    trackLabor: true,
    isActive: true,
    usageCount: 523,
    children: [
      { id: '5-1', code: '09-100', name: 'Drywall', qbAccount: '5910-Drywall', qbMapped: true, defaultMarkup: 12, trackLabor: true, isActive: true, usageCount: 178 },
      { id: '5-2', code: '09-200', name: 'Tile', qbAccount: '5920-Tile', qbMapped: true, defaultMarkup: 18, trackLabor: true, isActive: true, usageCount: 156 },
      { id: '5-3', code: '09-300', name: 'Paint', qbAccount: '5930-Paint', qbMapped: true, defaultMarkup: 15, trackLabor: true, isActive: true, usageCount: 189 },
    ]
  },
  {
    id: '6',
    code: '15',
    name: 'Mechanical',
    qbAccount: '6500-Mechanical',
    qbMapped: true,
    defaultMarkup: 10,
    trackLabor: true,
    isActive: true,
    usageCount: 312,
    children: [
      { id: '6-1', code: '15-100', name: 'Plumbing', qbAccount: '6510-Plumbing', qbMapped: true, defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 167 },
      { id: '6-2', code: '15-200', name: 'HVAC', qbAccount: '6520-HVAC', qbMapped: true, defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 145 },
    ]
  },
  {
    id: '7',
    code: '16',
    name: 'Electrical',
    qbAccount: '6600-Electrical',
    qbMapped: true,
    defaultMarkup: 10,
    trackLabor: true,
    isActive: true,
    usageCount: 298,
    children: [
      { id: '7-1', code: '16-100', name: 'Electrical Rough', qbAccount: '6610-ElecRough', qbMapped: true, defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 156 },
      { id: '7-2', code: '16-200', name: 'Electrical Finish', qbAccount: '6620-ElecFinish', qbMapped: true, defaultMarkup: 10, trackLabor: true, isActive: true, usageCount: 142 },
    ]
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
        level > 0 && "bg-gray-50/50"
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
        <td className="py-3 px-4 text-center">
          <span className="text-sm text-gray-600">{code.defaultMarkup}%</span>
        </td>
        <td className="py-3 px-4 text-center">
          {code.trackLabor ? (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Yes</span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">No</span>
          )}
        </td>
        <td className="py-3 px-4 text-center">
          <span className="text-sm text-gray-600">{code.usageCount}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1">
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
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
  const { search, setSearch, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({})

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
  const unmappedCodes = mockCostCodes.reduce((sum, c) => {
    let count = c.qbMapped ? 0 : 1
    count += c.children?.filter(ch => !ch.qbMapped).length || 0
    return sum + count
  }, 0)
  const totalUsage = mockCostCodes.reduce((sum, c) => sum + c.usageCount, 0)
  const divisions = mockCostCodes.length

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
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Hierarchical cost code structure with QuickBooks mapping
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search codes..."
          sortOptions={[
            { value: 'code', label: 'Code' },
            { value: 'name', label: 'Name' },
            { value: 'usageCount', label: 'Usage' },
            { value: 'defaultMarkup', label: 'Markup' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Upload, label: 'Import', onClick: () => {} },
            { icon: Plus, label: 'Add Code', onClick: () => {}, variant: 'primary' },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Hash className="h-4 w-4" />
              Total Codes
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalCodes}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FolderTree className="h-4 w-4" />
              Divisions
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{divisions}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Link2 className="h-4 w-4" />
              QB Mapped
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {totalCodes - unmappedCodes}
              <span className="text-sm font-normal text-gray-500">/{totalCodes}</span>
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            unmappedCodes > 0 ? "bg-amber-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              unmappedCodes > 0 ? "text-amber-600" : "text-gray-500"
            )}>
              <AlertCircle className="h-4 w-4" />
              Unmapped
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              unmappedCodes > 0 ? "text-amber-700" : "text-gray-900"
            )}>
              {unmappedCodes}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Building2 className="h-4 w-4" />
              Total Usage
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalUsage.toLocaleString()}</div>
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
              <th className="text-left py-3 px-4 font-medium text-gray-600">QuickBooks Account</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 w-24">Markup</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 w-24">Labor</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 w-24">Usage</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {mockCostCodes.map(code => {
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
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span>2 codes need QuickBooks mapping - Doors & Windows division</span>
            <span>|</span>
            <span>06-200 Finish Carpentry most used - consider subcategories for trim vs cabinets</span>
            <span>|</span>
            <span>Markup for Tile (18%) is higher than industry average (15%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
