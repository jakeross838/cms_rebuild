'use client'

import {
  Plus,
  Sparkles,
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  Download,
  Zap,
  Globe,
  Shield,
  BookOpen,
  ShoppingBag,
  Users,
  Tag,
  Copy,
  Upload,
  Award,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type TemplateCategory = 'Contracts' | 'Proposals' | 'Purchase Orders' | 'Change Orders' | 'Subcontracts' | 'Pre-Con Agreements' | 'Letters'
type TemplateSource = 'builder' | 'platform' | 'marketplace'

interface Template {
  id: string
  name: string
  category: TemplateCategory
  description: string
  pages: number
  variables: number
  signatureFields: number
  clauseCount: number
  usageCount: number
  lastUsed: string
  isDefault: boolean
  isFavorite: boolean
  lastUpdated: string
  version: string
  source: TemplateSource
  stateApplicability?: string[]
  contractType?: string
  isLegallyReviewed?: boolean
  reviewedDate?: string
  aiSuggestion?: string
  marketplaceRating?: number
  marketplaceInstalls?: number
  publisherName?: string
  price?: number
  regionTags?: string[]
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Cost-Plus with GMP',
    category: 'Contracts',
    description: 'Cost-plus contract with guaranteed maximum price, savings split provisions, and audit rights',
    pages: 24,
    variables: 45,
    signatureFields: 4,
    clauseCount: 34,
    usageCount: 128,
    lastUsed: '2 days ago',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 15, 2026',
    version: '3.2',
    source: 'builder',
    stateApplicability: ['SC', 'NC', 'GA'],
    contractType: 'gmp',
    isLegallyReviewed: true,
    reviewedDate: 'Dec 2025',
    aiSuggestion: 'New SC mechanic lien statute took effect Jan 1, 2026. Update clause 14.3 for compliance.',
  },
  {
    id: '2',
    name: 'Fixed Price Residential',
    category: 'Contracts',
    description: 'Lump sum contract for well-defined scopes with clear inclusion/exclusion lists',
    pages: 18,
    variables: 38,
    signatureFields: 3,
    clauseCount: 28,
    usageCount: 64,
    lastUsed: '1 week ago',
    isDefault: false,
    isFavorite: true,
    lastUpdated: 'Dec 10, 2025',
    version: '2.1',
    source: 'builder',
    stateApplicability: ['SC', 'NC'],
    contractType: 'fixed_price',
    isLegallyReviewed: true,
    reviewedDate: 'Nov 2025',
  },
  {
    id: '3',
    name: 'Time & Materials Contract',
    category: 'Contracts',
    description: 'T&M billing with weekly invoicing, labor rate schedules, and not-to-exceed cap option',
    pages: 20,
    variables: 42,
    signatureFields: 3,
    clauseCount: 24,
    usageCount: 32,
    lastUsed: '3 weeks ago',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Nov 28, 2025',
    version: '1.4',
    source: 'builder',
    contractType: 't_and_m',
  },
  {
    id: '4',
    name: 'Residential Proposal',
    category: 'Proposals',
    description: 'Full scope proposal with selections, allowances, payment schedule, and tier comparison',
    pages: 12,
    variables: 52,
    signatureFields: 2,
    clauseCount: 8,
    usageCount: 156,
    lastUsed: 'Today',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 18, 2026',
    version: '4.0',
    source: 'builder',
    aiSuggestion: 'Consider adding payment schedule breakdown option. Clients who see draw milestones convert 15% more.',
  },
  {
    id: '5',
    name: 'Standard Subcontract',
    category: 'Subcontracts',
    description: 'Trade subcontract with scope attachment, insurance requirements, and warranty pass-through',
    pages: 14,
    variables: 36,
    signatureFields: 4,
    clauseCount: 26,
    usageCount: 89,
    lastUsed: '3 days ago',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 5, 2026',
    version: '2.8',
    source: 'builder',
    stateApplicability: ['SC'],
    isLegallyReviewed: true,
    reviewedDate: 'Jan 2026',
  },
  {
    id: '6',
    name: 'Pre-Construction Agreement',
    category: 'Pre-Con Agreements',
    description: 'Paid design/planning phase agreement with milestone billing and scope limitations',
    pages: 8,
    variables: 28,
    signatureFields: 2,
    clauseCount: 14,
    usageCount: 24,
    lastUsed: '2 weeks ago',
    isDefault: true,
    isFavorite: false,
    lastUpdated: 'Dec 20, 2025',
    version: '1.2',
    source: 'builder',
    contractType: 'precon',
  },
  {
    id: '7',
    name: 'Standard Purchase Order',
    category: 'Purchase Orders',
    description: 'PO for material and service orders with delivery terms and acceptance criteria',
    pages: 2,
    variables: 28,
    signatureFields: 1,
    clauseCount: 8,
    usageCount: 342,
    lastUsed: 'Yesterday',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 10, 2026',
    version: '2.0',
    source: 'builder',
  },
  {
    id: '8',
    name: 'Standard Change Order',
    category: 'Change Orders',
    description: 'Change order with scope modification, cost impact, schedule impact, and approval signatures',
    pages: 4,
    variables: 35,
    signatureFields: 2,
    clauseCount: 6,
    usageCount: 91,
    lastUsed: '3 days ago',
    isDefault: true,
    isFavorite: true,
    lastUpdated: 'Jan 12, 2026',
    version: '2.3',
    source: 'builder',
    aiSuggestion: 'New impact fee disclosure requirement added for SC. Include in cost impact section.',
  },
  {
    id: '9',
    name: 'Florida Builder Starter Pack',
    category: 'Contracts',
    description: 'FL-specific contracts with right-to-cure, Chapter 558, and hurricane provisions',
    pages: 28,
    variables: 52,
    signatureFields: 4,
    clauseCount: 42,
    usageCount: 0,
    lastUsed: 'Not installed',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Jan 20, 2026',
    version: '1.0',
    source: 'marketplace',
    stateApplicability: ['FL'],
    isLegallyReviewed: true,
    reviewedDate: 'Jan 2026',
    marketplaceRating: 4.8,
    marketplaceInstalls: 234,
    publisherName: 'RossOS Official',
    price: 0,
    regionTags: ['FL', 'Southeast'],
  },
  {
    id: '10',
    name: 'Luxury Custom Home Contract',
    category: 'Contracts',
    description: 'Premium contract template for $1M+ custom homes with detailed warranty, allowance, and selection provisions',
    pages: 32,
    variables: 68,
    signatureFields: 5,
    clauseCount: 48,
    usageCount: 0,
    lastUsed: 'Not installed',
    isDefault: false,
    isFavorite: false,
    lastUpdated: 'Feb 1, 2026',
    version: '2.0',
    source: 'marketplace',
    marketplaceRating: 4.9,
    marketplaceInstalls: 87,
    publisherName: 'Elite Builder Consulting',
    price: 149,
    regionTags: ['National'],
  },
]

const categories: TemplateCategory[] = [
  'Contracts',
  'Proposals',
  'Purchase Orders',
  'Change Orders',
  'Subcontracts',
  'Pre-Con Agreements',
  'Letters',
]

const categoryColors: Record<string, string> = {
  Contracts: 'bg-purple-100 text-purple-700',
  Proposals: 'bg-blue-100 text-blue-700',
  'Purchase Orders': 'bg-green-100 text-green-700',
  'Change Orders': 'bg-orange-100 text-orange-700',
  Subcontracts: 'bg-teal-100 text-teal-700',
  'Pre-Con Agreements': 'bg-indigo-100 text-indigo-700',
  Letters: 'bg-gray-100 text-gray-700',
}

function TemplateCard({ template }: { template: Template }) {
  const isMarketplace = template.source === 'marketplace'

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      isMarketplace ? "border-blue-200" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
            {template.source === 'platform' && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Award className="h-3 w-3" />
                Official
              </span>
            )}
            {isMarketplace && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ShoppingBag className="h-3 w-3" />
                Marketplace
              </span>
            )}
            {template.isLegallyReviewed && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5" title={`Reviewed ${template.reviewedDate}`}>
                <Shield className="h-3 w-3" />
                Reviewed
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{template.name}</h4>
          <span className="text-[10px] text-gray-400">v{template.version}</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>

      <div className="flex items-center gap-3 mb-2 text-sm flex-wrap">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-600 text-xs">{template.pages}p</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-600 text-xs">{template.variables} vars</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-600 text-xs">{template.clauseCount} clauses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Edit className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-600 text-xs">{template.signatureFields} sig</span>
        </div>
      </div>

      {/* State applicability */}
      {template.stateApplicability && template.stateApplicability.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="h-3 w-3 text-gray-400" />
          {template.stateApplicability.map(state => (
            <span key={state} className="text-[10px] px-1 py-0.5 bg-gray-100 text-gray-600 rounded">{state}</span>
          ))}
        </div>
      )}

      {/* Marketplace info */}
      {isMarketplace && (
        <div className="flex items-center gap-3 mb-2 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="font-medium text-gray-700">{template.marketplaceRating}</span>
          </div>
          <span className="text-gray-400">{template.marketplaceInstalls} installs</span>
          <span className="text-gray-500">by {template.publisherName}</span>
          {template.price !== undefined && (
            <span className={cn("font-medium", template.price === 0 ? "text-green-600" : "text-gray-900")}>
              {template.price === 0 ? 'Free' : `$${template.price}`}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {!isMarketplace && (
            <>
              <span className="text-xs text-gray-500">
                Used {template.usageCount}x
              </span>
              <span className="text-xs text-gray-400">|</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {template.lastUsed}
              </div>
            </>
          )}
        </div>
      </div>

      {template.aiSuggestion && (
        <div className="mt-3 p-2 rounded-md bg-amber-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="text-amber-700">{template.aiSuggestion}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {isMarketplace ? (
          <>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              <Download className="h-3.5 w-3.5" />
              {template.price === 0 ? 'Install' : `Buy $${template.price}`}
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              <Copy className="h-3.5 w-3.5" />
              Clone
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
          </>
        )}
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
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">Default</span>
              )}
              {template.source === 'marketplace' && (
                <ShoppingBag className="h-3.5 w-3.5 text-indigo-500" />
              )}
              {template.isLegallyReviewed && (
                <Shield className="h-3.5 w-3.5 text-green-500" />
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
      <td className="py-3 px-4 text-center text-xs text-gray-600">{template.pages}p</td>
      <td className="py-3 px-4 text-center text-xs text-gray-600">{template.variables}</td>
      <td className="py-3 px-4 text-center text-xs text-gray-600">{template.clauseCount}</td>
      <td className="py-3 px-4 text-center text-xs text-gray-600">{template.usageCount}x</td>
      <td className="py-3 px-4 text-center text-xs text-gray-500">v{template.version}</td>
      <td className="py-3 px-4 text-right text-xs text-gray-500">{template.lastUsed}</td>
      <td className="py-3 px-4">
        <button className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

export function TemplatesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredTemplates = sortItems(
    mockTemplates.filter(template => {
      if (!matchesSearch(template, search, ['name', 'description', 'category', 'publisherName'])) return false
      if (activeTab === 'marketplace') return template.source === 'marketplace'
      if (activeTab !== 'all' && template.category !== activeTab) return false
      return true
    }),
    activeSort as keyof Template | '',
    sortDirection,
  )

  // Calculate stats
  const builderTemplates = mockTemplates.filter(t => t.source === 'builder').length
  const marketplaceTemplates = mockTemplates.filter(t => t.source === 'marketplace').length
  const legallyReviewed = mockTemplates.filter(t => t.isLegallyReviewed).length
  const totalUsage = mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)
  const withAISuggestions = mockTemplates.filter(t => t.aiSuggestion).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Document Templates & Marketplace</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {builderTemplates} builder + {marketplaceTemplates} marketplace
          </span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search templates, publishers..."
          tabs={[
            { key: 'all', label: 'All', count: mockTemplates.length },
            ...categories.map(cat => ({
              key: cat,
              label: cat,
              count: mockTemplates.filter(t => t.category === cat).length,
            })),
            { key: 'marketplace', label: 'Marketplace', count: marketplaceTemplates },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'usageCount', label: 'Usage' },
            { value: 'pages', label: 'Pages' },
            { value: 'lastUpdated', label: 'Last Updated' },
            { value: 'clauseCount', label: 'Clauses' },
            { value: 'marketplaceRating', label: 'Rating' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'New Template', onClick: () => {}, variant: 'primary' },
            { icon: Upload, label: 'Publish', onClick: () => {} },
          ]}
          resultCount={filteredTemplates.length}
          totalCount={mockTemplates.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Builder Templates
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{builderTemplates}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Total Usage
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{totalUsage}x</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Legally Reviewed
            </div>
            <div className="text-lg font-bold text-green-700 mt-0.5">{legallyReviewed}</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-indigo-600 text-xs">
              <ShoppingBag className="h-3.5 w-3.5" />
              Marketplace
            </div>
            <div className="text-lg font-bold text-indigo-700 mt-0.5">{marketplaceTemplates}</div>
          </div>
          <div className={cn(
            'rounded-lg p-2.5',
            withAISuggestions > 0 ? 'bg-amber-50' : 'bg-gray-50'
          )}>
            <div className={cn(
              'flex items-center gap-1.5 text-xs',
              withAISuggestions > 0 ? 'text-amber-600' : 'text-gray-500'
            )}>
              <Sparkles className="h-3.5 w-3.5" />
              AI Suggestions
            </div>
            <div className={cn(
              'text-lg font-bold mt-0.5',
              withAISuggestions > 0 ? 'text-amber-700' : 'text-gray-900'
            )}>
              {withAISuggestions}
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            <FileText className="h-3 w-3" />
            Contracts (Module 38)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            <BookOpen className="h-3 w-3" />
            Estimating (Module 20)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <Globe className="h-3 w-3" />
            Marketplace (Module 48)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <Tag className="h-3 w-3" />
            State Compliance
          </span>
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
                <th className="text-center py-3 px-4 font-medium text-gray-600">Clauses</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Usage</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Version</th>
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
          <div className="flex-1 text-sm text-blue-700 space-y-1">
            <p>SC mechanic lien statute updated Jan 2026 - 2 templates need clause updates for compliance. Review recommended.</p>
            <p>Standard Cost-Plus with GMP is your most-used contract. Consider publishing to the marketplace to help other SC builders.</p>
            <p>"Florida Builder Starter Pack" is trending in the marketplace (234 installs). Regional packs for your state are available.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
