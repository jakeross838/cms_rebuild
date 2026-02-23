'use client'

import { useState } from 'react'

import {
  Download,
  Plus,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  MoreHorizontal,
  FileText,
  ArrowRightLeft,
  Zap,
  RefreshCw,
  Edit3,
  SlidersHorizontal,
  Eye,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

type JEType = 'auto' | 'manual' | 'recurring' | 'adjusting'
type JEStatus = 'posted' | 'draft' | 'pending_approval'

interface JournalLine {
  account: string
  accountName: string
  debit?: number
  credit?: number
}

interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  description: string
  type: JEType
  status: JEStatus
  totalAmount: number
  sourceModule?: string
  lines: JournalLine[]
  createdBy?: string
  approver?: string
  memo?: string
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    entryNumber: 'JE-0147',
    date: '2026-02-18',
    description: 'Invoice #892 -- ABC Lumber',
    type: 'auto',
    status: 'posted',
    totalAmount: 24000,
    sourceModule: 'Accounts Payable',
    lines: [
      { account: '5100', accountName: 'Materials', debit: 24000 },
      { account: '2000', accountName: 'Accounts Payable', credit: 24000 },
    ],
    createdBy: 'System',
  },
  {
    id: '2',
    entryNumber: 'JE-0146',
    date: '2026-02-18',
    description: 'Client Payment -- Smith Residence Draw #4',
    type: 'auto',
    status: 'posted',
    totalAmount: 87500,
    sourceModule: 'Accounts Receivable',
    lines: [
      { account: '1010', accountName: 'Operating Account', debit: 87500 },
      { account: '1110', accountName: 'AR - Trade', credit: 87500 },
    ],
    createdBy: 'System',
  },
  {
    id: '3',
    entryNumber: 'JE-0145',
    date: '2026-02-17',
    description: 'Payroll Week Ending 2/14',
    type: 'auto',
    status: 'posted',
    totalAmount: 34200,
    sourceModule: 'Payroll',
    lines: [
      { account: '5000', accountName: 'Direct Labor', debit: 34200 },
      { account: '1020', accountName: 'Payroll Account', credit: 34200 },
    ],
    createdBy: 'System',
  },
  {
    id: '4',
    entryNumber: 'JE-0144',
    date: '2026-02-17',
    description: 'Monthly Depreciation -- February',
    type: 'recurring',
    status: 'posted',
    totalAmount: 3500,
    sourceModule: 'Fixed Assets',
    lines: [
      { account: '5300', accountName: 'Equipment Costs', debit: 3500 },
      { account: '1510', accountName: 'Accumulated Depreciation', credit: 3500 },
    ],
    createdBy: 'System',
    memo: 'Monthly straight-line depreciation for all equipment',
  },
  {
    id: '5',
    entryNumber: 'JE-0143',
    date: '2026-02-16',
    description: 'Retainage Release -- Harbor View',
    type: 'manual',
    status: 'pending_approval',
    totalAmount: 12400,
    sourceModule: 'Accounts Receivable',
    lines: [
      { account: '1010', accountName: 'Operating Account', debit: 12400 },
      { account: '1120', accountName: 'Retainage Receivable', credit: 12400 },
    ],
    createdBy: 'Sarah Johnson',
    approver: 'Mike Ross',
    memo: 'Release retainage per project completion certificate',
  },
  {
    id: '6',
    entryNumber: 'JE-0142',
    date: '2026-02-15',
    description: 'Insurance Premium -- Monthly',
    type: 'recurring',
    status: 'posted',
    totalAmount: 2800,
    sourceModule: 'General',
    lines: [
      { account: '6000', accountName: 'General & Administrative', debit: 2800 },
      { account: '1010', accountName: 'Operating Account', credit: 2800 },
    ],
    createdBy: 'System',
  },
  {
    id: '7',
    entryNumber: 'JE-0141',
    date: '2026-02-15',
    description: 'PO #2847 -- Coastal Plumbing',
    type: 'auto',
    status: 'posted',
    totalAmount: 8900,
    sourceModule: 'Purchase Orders',
    lines: [
      { account: '5200', accountName: 'Subcontractor Costs', debit: 8900 },
      { account: '2000', accountName: 'Accounts Payable', credit: 8900 },
    ],
    createdBy: 'System',
  },
  {
    id: '8',
    entryNumber: 'JE-0140',
    date: '2026-02-14',
    description: 'Bank Fee -- February',
    type: 'manual',
    status: 'posted',
    totalAmount: 45,
    sourceModule: 'Banking',
    lines: [
      { account: '6000', accountName: 'General & Administrative', debit: 45 },
      { account: '1010', accountName: 'Operating Account', credit: 45 },
    ],
    createdBy: 'Lisa Chen',
  },
  {
    id: '9',
    entryNumber: 'JE-0139',
    date: '2026-02-14',
    description: 'Accrual -- Unbilled Revenue Smith Res',
    type: 'adjusting',
    status: 'posted',
    totalAmount: 15000,
    sourceModule: 'Revenue Recognition',
    lines: [
      { account: '1300', accountName: 'Work in Progress', debit: 15000 },
      { account: '4000', accountName: 'Contract Revenue', credit: 15000 },
    ],
    createdBy: 'Sarah Johnson',
    memo: 'Accrue unbilled work completed through 2/14',
  },
  {
    id: '10',
    entryNumber: 'JE-0138',
    date: '2026-02-13',
    description: 'Correct miscoded expense -- reclassify',
    type: 'manual',
    status: 'posted',
    totalAmount: 3200,
    sourceModule: 'General',
    lines: [
      { account: '5200', accountName: 'Subcontractor Costs', debit: 3200 },
      { account: '5100', accountName: 'Materials', credit: 3200 },
    ],
    createdBy: 'Lisa Chen',
    memo: 'Reclassify expense from Materials to Subcontractor per PM review',
  },
]

const typeConfig: Record<JEType, { label: string; color: string; bgColor: string; icon: typeof Zap }> = {
  auto: { label: 'Auto', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: Zap },
  manual: { label: 'Manual', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: Edit3 },
  recurring: { label: 'Recurring', color: 'text-warm-700', bgColor: 'bg-warm-100', icon: RefreshCw },
  adjusting: { label: 'Adjusting', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: SlidersHorizontal },
}

const statusConfig: Record<JEStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  posted: { label: 'Posted', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  draft: { label: 'Draft', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absValue >= 1000000) return sign + '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return sign + '$' + (absValue / 1000).toFixed(1) + 'K'
  return sign + '$' + absValue.toFixed(2)
}

function formatFullCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function JournalEntryRow({ entry, isExpanded, onToggle }: { entry: JournalEntry; isExpanded: boolean; onToggle: () => void }) {
  const typeStyle = typeConfig[entry.type]
  const statusStyle = statusConfig[entry.status]
  const TypeIcon = typeStyle.icon
  const StatusIcon = statusStyle.icon

  return (
    <div className={cn(
      'bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow',
      entry.status === 'pending_approval' ? 'border-amber-200' : 'border-warm-200',
    )}>
      {/* Main row */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={onToggle} className="p-1 hover:bg-warm-100 rounded">
              <Eye className={cn('h-4 w-4', isExpanded ? 'text-stone-600' : 'text-warm-400')} />
            </button>

            <span className="font-mono text-sm font-medium text-warm-900 w-20">{entry.entryNumber}</span>

            <div className="flex items-center gap-1.5 text-sm text-warm-500 w-24">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(entry.date)}
            </div>

            <span className="text-sm text-warm-800 flex-1 truncate">{entry.description}</span>

            <div className="flex items-center gap-2">
              <span className={cn('text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1', typeStyle.bgColor, typeStyle.color)}>
                <TypeIcon className="h-3 w-3" />
                {typeStyle.label}
              </span>

              <span className={cn('text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1', statusStyle.bgColor, statusStyle.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusStyle.label}
              </span>
            </div>

            <span className="text-sm font-semibold text-warm-900 w-28 text-right">
              {formatFullCurrency(entry.totalAmount)}
            </span>

            {entry.sourceModule ? <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded w-32 text-center truncate">
                {entry.sourceModule}
              </span> : null}

            <button className="p-1.5 hover:bg-warm-100 rounded">
              <MoreHorizontal className="h-4 w-4 text-warm-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail lines */}
      {isExpanded ? <div className="border-t border-warm-100 bg-warm-50 px-4 py-3">
          <div className="ml-8">
            {/* Line items header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-warm-500 uppercase tracking-wider mb-2">
              <div className="col-span-2">Account</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-3 text-right">Debit</div>
              <div className="col-span-3 text-right">Credit</div>
            </div>

            {/* Line items */}
            {entry.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 py-1.5 text-sm border-b border-warm-100 last:border-0">
                <div className="col-span-2 font-mono text-warm-600">{line.account}</div>
                <div className="col-span-4 text-warm-800">{line.accountName}</div>
                <div className="col-span-3 text-right font-medium">
                  {line.debit ? formatFullCurrency(line.debit) : ''}
                </div>
                <div className="col-span-3 text-right font-medium">
                  {line.credit ? formatFullCurrency(line.credit) : ''}
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="grid grid-cols-12 gap-2 pt-2 mt-1 border-t border-warm-200 text-sm font-semibold">
              <div className="col-span-6 text-warm-500">Total</div>
              <div className="col-span-3 text-right text-warm-900">
                {formatFullCurrency(entry.lines.reduce((sum, l) => sum + (l.debit || 0), 0))}
              </div>
              <div className="col-span-3 text-right text-warm-900">
                {formatFullCurrency(entry.lines.reduce((sum, l) => sum + (l.credit || 0), 0))}
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-3 flex items-center gap-4 text-xs text-warm-500">
              {entry.createdBy ? <span>Created by: {entry.createdBy}</span> : null}
              {entry.approver ? <span className="text-amber-600">Approver: {entry.approver}</span> : null}
              {entry.memo ? <span className="italic text-warm-400">Memo: {entry.memo}</span> : null}
            </div>

            {/* Approval actions */}
            {entry.status === 'pending_approval' && (
              <div className="mt-3 flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve & Post
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div> : null}
    </div>
  )
}

export function JournalEntriesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['5']))
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredEntries = sortItems(
    mockEntries.filter(e => {
      if (!matchesSearch(e, search, ['entryNumber', 'description', 'sourceModule'])) return false
      if (activeTab !== 'all' && e.status !== activeTab) return false
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      return true
    }),
    activeSort as keyof JournalEntry | '',
    sortDirection,
  )

  // Stats
  const totalEntries = mockEntries.length
  const autoPosted = mockEntries.filter(e => e.type === 'auto' && e.status === 'posted').length
  const manualEntries = mockEntries.filter(e => e.type === 'manual').length
  const pendingApproval = mockEntries.filter(e => e.status === 'pending_approval').length

  const totalDebits = mockEntries
    .filter(e => e.status === 'posted')
    .reduce((sum, e) => sum + e.lines.reduce((s, l) => s + (l.debit || 0), 0), 0)
  const totalCredits = mockEntries
    .filter(e => e.status === 'posted')
    .reduce((sum, e) => sum + e.lines.reduce((s, l) => s + (l.credit || 0), 0), 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Journal Entries</h3>
              <span className="text-sm text-warm-500">February 2026 | {totalEntries} entries</span>
              {pendingApproval > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pendingApproval} pending
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <FileText className="h-4 w-4" />
              Total Entries (MTD)
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalEntries}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Zap className="h-4 w-4" />
              Auto-Posted
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{autoPosted}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-600 text-sm">
              <Edit3 className="h-4 w-4" />
              Manual Entries
            </div>
            <div className="text-xl font-bold text-warm-700 mt-1">{manualEntries}</div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            pendingApproval > 0 ? 'bg-amber-50' : 'bg-green-50',
          )}>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              pendingApproval > 0 ? 'text-amber-600' : 'text-green-600',
            )}>
              <Clock className="h-4 w-4" />
              Pending Approval
            </div>
            <div className={cn(
              'text-xl font-bold mt-1',
              pendingApproval > 0 ? 'text-amber-700' : 'text-green-700',
            )}>
              {pendingApproval}
            </div>
          </div>
        </div>
      </div>

      {/* Debit/Credit Summary */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm text-warm-500">Posted Totals (MTD):</span>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-warm-900">{formatCurrency(totalDebits)}</div>
              <div className="text-xs text-warm-500">Total Debits</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-warm-900">{formatCurrency(totalCredits)}</div>
              <div className="text-xs text-warm-500">Total Credits</div>
            </div>
            <div className="flex items-center gap-1.5">
              {totalDebits === totalCredits ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Balanced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">Out of balance: {formatCurrency(Math.abs(totalDebits - totalCredits))}</span>
                </>
              )}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-warm-400">
            <span className="flex items-center gap-1"><ArrowRightLeft className="h-3 w-3" /> Auto: {mockEntries.filter(e => e.type === 'auto').length}</span>
            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Recurring: {mockEntries.filter(e => e.type === 'recurring').length}</span>
            <span className="flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" /> Adjusting: {mockEntries.filter(e => e.type === 'adjusting').length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search entries, descriptions..."
          tabs={[
            { key: 'all', label: 'All', count: mockEntries.length },
            { key: 'posted', label: 'Posted', count: mockEntries.filter(e => e.status === 'posted').length },
            { key: 'pending_approval', label: 'Pending', count: mockEntries.filter(e => e.status === 'pending_approval').length },
            { key: 'draft', label: 'Draft', count: mockEntries.filter(e => e.status === 'draft').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Types',
              value: typeFilter,
              options: [
                { value: 'auto', label: 'Auto' },
                { value: 'manual', label: 'Manual' },
                { value: 'recurring', label: 'Recurring' },
                { value: 'adjusting', label: 'Adjusting' },
              ],
              onChange: setTypeFilter,
            },
          ]}
          sortOptions={[
            { value: 'entryNumber', label: 'Entry #' },
            { value: 'date', label: 'Date' },
            { value: 'totalAmount', label: 'Amount' },
            { value: 'type', label: 'Type' },
            { value: 'status', label: 'Status' },
            { value: 'description', label: 'Description' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredEntries.length}
          totalCount={mockEntries.length}
        />
      </div>

      {/* Entries List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredEntries.map(entry => (
          <JournalEntryRow
            key={entry.id}
            entry={entry}
            isExpanded={expandedIds.has(entry.id)}
            onToggle={() => toggleExpand(entry.id)}
          />
        ))}
        {filteredEntries.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No journal entries match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Journal Analysis:</span>
          </div>
          <p className="text-sm text-amber-700">
            JE-0143 (retainage release) awaiting approval from Mike Ross -- flagged as high priority.
            All auto-posted entries balanced correctly. Reclassification JE-0138 corrected a $3,200 miscoding
            between Materials and Subcontractor Costs. Monthly depreciation recurring entry JE-0144 is on schedule.
            1 adjusting entry for unbilled revenue recorded this period.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Auto-Posting Accuracy',
            insight: 'All 4 auto-posted entries this week matched source documents with 100% accuracy. No corrections needed.',
          },
          {
            feature: 'Approval Workflow',
            insight: 'JE-0143 ($12,400 retainage release) has been pending approval for 2 days. Average approval time: 1.2 days.',
          },
          {
            feature: 'Recurring Entry Monitor',
            insight: '2 recurring entries posted on schedule this month. Next: Insurance Premium due Mar 15, Depreciation due Mar 1.',
          },
          {
            feature: 'Reclassification Detection',
            insight: 'JE-0138 reclassified $3,200 from Materials to Subcontractor. Pattern detected: 3 similar reclassifications in past 60 days for this cost code.',
          },
        ]}
      />
    </div>
  )
}
