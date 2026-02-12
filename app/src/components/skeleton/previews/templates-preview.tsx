'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Sparkles,
  FileText,
  Copy,
  Eye,
  Edit,
  MoreHorizontal,
  Star,
  Clock,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Download,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  category: 'Contracts' | 'Proposals' | 'Purchase Orders' | 'Change Orders' | 'Letters'
  description: string
  pages: number
  variables: number
  signatureFields: number
  usageCount: number
  lastUsed: string
  isDefault: boolean
  isFavorite: boolean
  lastUpdated: string
  aiSuggestion?: string
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Construction Contract',
    category: 'Contracts',
    description: 'Cost-plus with GMP for residential construction',
    pages: 24,
    variables: 45,
    signatureFields: 4,
    usageCount: 128,
    lastUsed: '2 days ago',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 15, 2025',
    aiSuggestion: 'Recently updated payment terms based on industry standards',
  },
  {
    id: '2',
    name: 'Fixed Price Contract',
    category: 'Contracts',
    description: 'Lump sum contract for well-defined scopes',
    pages: 18,
    variables: 38,
    signatureFields: 3,
    usageCount: 64,
    lastUsed: '1 week ago',
    isDefault: false,
    isFavorite: true,
    lastUpdated: 'Dec 10, 2024',
  },
  {
    id: '3',
    name: 'Time & Materials Contract',
    category: 'Contracts',
    description: 'T&M billing with weekly invoicing',
    pages: 20,
    variables: 42,
    signatureFields: 3,
    usageCount: 32,
    lastUsed: '3 weeks ago',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Nov 28, 2024',
  },
  {
    id: '4',
    name: 'Residential Proposal',
    category: 'Proposals',
    description: 'Full scope proposal with selections and pricing',
    pages: 12,
    variables: 52,
    signatureFields: 2,
    usageCount: 156,
    lastUsed: 'Today',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 18, 2025',
    aiSuggestion: 'Consider adding payment schedule breakdown option',
  },
  {
    id: '5',
    name: 'Remodel Proposal - Kitchen',
    category: 'Proposals',
    description: 'Kitchen-focused proposal with standard inclusions',
    pages: 10,
    variables: 48,
    signatureFields: 2,
    usageCount: 89,
    lastUsed: '5 days ago',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Jan 5, 2025',
  },
  {
    id: '6',
    name: 'Commercial Build Proposal',
    category: 'Proposals',
    description: 'Multi-phase commercial construction proposal',
    pages: 16,
    variables: 58,
    signatureFields: 3,
    usageCount: 24,
    lastUsed: '2 weeks ago',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Dec 20, 2024',
  },
  {
    id: '7',
    name: 'Standard Purchase Order',
    category: 'Purchase Orders',
    description: 'PO for material and service orders',
    pages: 2,
    variables: 28,
    signatureFields: 1,
    usageCount: 342,
    lastUsed: 'Yesterday',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 10, 2025',
  },
  {
    id: '8',
    name: 'Equipment Rental PO',
    category: 'Purchase Orders',
    description: 'Equipment rental and lease agreements',
    pages: 3,
    variables: 32,
    signatureFields: 2,
    usageCount: 67,
    lastUsed: '1 week ago',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Jan 2, 2025',
  },
  {
    id: '9',
    name: 'Standard Change Order',
    category: 'Change Orders',
    description: 'Change order for scope modifications',
    pages: 4,
    variables: 35,
    signatureFields: 2,
    usageCount: 91,
    lastUsed: '3 days ago',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 12, 2025',
    aiSuggestion: 'New impact fee disclosure requirement added for your state',
  },
  {
    id: '10',
    name: 'Allowance Adjustment Form',
    category: 'Change Orders',
    description: 'Form for allowance overages and selections',
    pages: 2,
    variables: 30,
    signatureFields: 1,
    usageCount: 245,
    lastUsed: 'Yesterday',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Jan 15, 2025',
  },
]

const categories: ('Contracts' | 'Proposals' | 'Purchase Orders' | 'Change Orders' | 'Letters')[] = [
  'Contracts',
  'Proposals',
  'Purchase Orders',
  'Change Orders',
  'Letters',
]

const categoryIcons: Record<string, typeof FileText> = {
  Contracts: FileText,
  Proposals: FileText,
  'Purchase Orders': FileText,
  'Change Orders': FileText,
  Letters: FileText,
}

const categoryColors: Record<string, string> = {
  Contracts: 'bg-purple-100 text-purple-700',
  Proposals: 'bg-blue-100 text-blue-700',
  'Purchase Orders': 'bg-green-100 text-green-700',
  'Change Orders': 'bg-orange-100 text-orange-700',
  Letters: 'bg-gray-100 text-gray-700',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', categoryColors[template.category])}>
              {template.category}
            </span>
            {template.isFavorite && (
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            )}
            {template.isDefault && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                Default
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{template.name}</h4>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>

      <div className="flex items-center gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{template.pages}p</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{template.variables} vars</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <span className="h-4 w-4 text-gray-400">✎</span>
          <span className="text-gray-600">{template.signatureFields} sig</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Used {template.usageCount}x
          </span>
          <span className="text-xs text-gray-400">|</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {template.lastUsed}
          </div>
        </div>
      </div>

      {template.aiSuggestion && (
        <div className="mt-3 p-2 rounded-md bg-blue-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
          <span className="text-blue-700">{template.aiSuggestion}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
          <Edit className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
    </div>
  )
}

function TemplateRow({ template }: { template: Template }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {template.isFavorite && (
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          )}
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {template.name}
              {template.isDefault && (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">{template.description}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', categoryColors[template.category])}>
          {template.category}
        </span>
      </td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{template.pages}p</td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{template.variables}</td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{template.signatureFields}</td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{template.usageCount}x</td>
      <td className="py-3 px-4 text-right text-sm text-gray-500">{template.lastUsed}</td>
      <td className="py-3 px-4">
        <button className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

export function TemplatesPreview() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('Contracts')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = mockTemplates.filter(template => {
    if (selectedCategory !== 'All' && template.category !== selectedCategory) return false
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Calculate stats
  const totalTemplates = mockTemplates.length
  const defaultTemplates = mockTemplates.filter(t => t.isDefault).length
  const favorites = mockTemplates.filter(t => t.isFavorite).length
  const totalUsage = mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)
  const withAISuggestions = mockTemplates.filter(t => t.aiSuggestion).length

  const categoryStats = categories.map(cat => ({
    name: cat,
    count: mockTemplates.filter(t => t.category === cat).length,
  }))

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Document Templates</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {totalTemplates} templates
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Business forms with smart variables and branding
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FileText className="h-4 w-4" />
              Total Templates
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalTemplates}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              Total Usage
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalUsage}x</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Star className="h-4 w-4" />
              Favorites
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{favorites}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Download className="h-4 w-4" />
              Defaults
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{defaultTemplates}</div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            withAISuggestions > 0 ? 'bg-blue-50' : 'bg-gray-50'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              withAISuggestions > 0 ? 'text-blue-600' : 'text-gray-500'
            )}>
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </div>
            <div className={cn(
              'text-xl font-bold mt-1',
              withAISuggestions > 0 ? 'text-blue-700' : 'text-gray-900'
            )}>
              {withAISuggestions}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Category:</span>
          <div className="flex items-center gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 text-sm rounded-lg transition-colors',
                  selectedCategory === cat
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {cat}
                <span className="ml-1 text-xs text-gray-400">
                  ({categoryStats.find(c => c.name === cat)?.count || 0})
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5',
                viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5',
                viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No templates match your search
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Template</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Pages</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Variables</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Signatures</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Usage</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Last Used</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTemplates.map(template => (
                <TemplateRow key={template.id} template={template} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <span>Standard Construction Contract is your most used - consider publishing variants for different regions</span>
            <span>|</span>
            <span>2 templates have pending update suggestions - review to stay compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
