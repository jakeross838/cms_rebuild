'use client'

import { useState } from 'react'

import {
  Download,
  Plus,
  ChevronRight,
  ChevronDown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  MoreHorizontal,
  Search,
  Settings,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  BarChart3,
  Layers,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
type AccountStatus = 'active' | 'inactive' | 'locked'

interface GLAccount {
  id: string
  accountNumber: string
  accountName: string
  type: AccountType
  balance: number
  ytdActivity: number
  status: AccountStatus
  parentId?: string
  depth: number
  hasChildren: boolean
}

const mockAccounts: GLAccount[] = [
  { id: '1', accountNumber: '1000', accountName: 'Cash & Bank Accounts', type: 'Asset', balance: 847230, ytdActivity: 1245000, status: 'active', depth: 0, hasChildren: true },
  { id: '2', accountNumber: '1010', accountName: 'Operating Account', type: 'Asset', balance: 623450, ytdActivity: 892000, status: 'active', parentId: '1', depth: 1, hasChildren: false },
  { id: '3', accountNumber: '1020', accountName: 'Payroll Account', type: 'Asset', balance: 89780, ytdActivity: 245000, status: 'active', parentId: '1', depth: 1, hasChildren: false },
  { id: '4', accountNumber: '1030', accountName: 'Trust Account', type: 'Asset', balance: 134000, ytdActivity: 108000, status: 'locked', parentId: '1', depth: 1, hasChildren: false },
  { id: '5', accountNumber: '1100', accountName: 'Accounts Receivable', type: 'Asset', balance: 412500, ytdActivity: 3432500, status: 'active', depth: 0, hasChildren: true },
  { id: '6', accountNumber: '1110', accountName: 'AR - Trade', type: 'Asset', balance: 367000, ytdActivity: 3245000, status: 'active', parentId: '5', depth: 1, hasChildren: false },
  { id: '7', accountNumber: '1120', accountName: 'Retainage Receivable', type: 'Asset', balance: 45500, ytdActivity: 187500, status: 'active', parentId: '5', depth: 1, hasChildren: false },
  { id: '8', accountNumber: '1200', accountName: 'Inventory', type: 'Asset', balance: 28340, ytdActivity: 156000, status: 'active', depth: 0, hasChildren: false },
  { id: '9', accountNumber: '1300', accountName: 'Work in Progress', type: 'Asset', balance: 1245000, ytdActivity: 2890000, status: 'active', depth: 0, hasChildren: false },
  { id: '10', accountNumber: '1500', accountName: 'Equipment', type: 'Asset', balance: 187000, ytdActivity: 45000, status: 'active', depth: 0, hasChildren: false },
  { id: '11', accountNumber: '1510', accountName: 'Accumulated Depreciation', type: 'Asset', balance: -42000, ytdActivity: -21000, status: 'active', depth: 0, hasChildren: false },
  { id: '12', accountNumber: '2000', accountName: 'Accounts Payable', type: 'Liability', balance: 312450, ytdActivity: 2678000, status: 'active', depth: 0, hasChildren: false },
  { id: '13', accountNumber: '2100', accountName: 'Retainage Payable', type: 'Liability', balance: 67800, ytdActivity: 234000, status: 'active', depth: 0, hasChildren: false },
  { id: '14', accountNumber: '2200', accountName: 'Accrued Expenses', type: 'Liability', balance: 24500, ytdActivity: 98000, status: 'active', depth: 0, hasChildren: false },
  { id: '15', accountNumber: '3000', accountName: "Owner's Equity", type: 'Equity', balance: 1847320, ytdActivity: 0, status: 'active', depth: 0, hasChildren: false },
  { id: '16', accountNumber: '3100', accountName: 'Retained Earnings', type: 'Equity', balance: 436000, ytdActivity: 436000, status: 'active', depth: 0, hasChildren: false },
  { id: '17', accountNumber: '4000', accountName: 'Contract Revenue', type: 'Revenue', balance: 3245000, ytdActivity: 3245000, status: 'active', depth: 0, hasChildren: false },
  { id: '18', accountNumber: '4100', accountName: 'Change Order Revenue', type: 'Revenue', balance: 187500, ytdActivity: 187500, status: 'active', depth: 0, hasChildren: false },
  { id: '19', accountNumber: '5000', accountName: 'Direct Labor', type: 'Expense', balance: 892000, ytdActivity: 892000, status: 'active', depth: 0, hasChildren: false },
  { id: '20', accountNumber: '5100', accountName: 'Materials', type: 'Expense', balance: 1123000, ytdActivity: 1123000, status: 'active', depth: 0, hasChildren: false },
  { id: '21', accountNumber: '5200', accountName: 'Subcontractor Costs', type: 'Expense', balance: 678000, ytdActivity: 678000, status: 'active', depth: 0, hasChildren: false },
  { id: '22', accountNumber: '5300', accountName: 'Equipment Costs', type: 'Expense', balance: 45000, ytdActivity: 45000, status: 'active', depth: 0, hasChildren: false },
  { id: '23', accountNumber: '6000', accountName: 'General & Administrative', type: 'Expense', balance: 234000, ytdActivity: 234000, status: 'active', depth: 0, hasChildren: false },
]

const typeConfig: Record<AccountType, { color: string; bgColor: string }> = {
  Asset: { color: 'text-stone-700', bgColor: 'bg-stone-100' },
  Liability: { color: 'text-red-700', bgColor: 'bg-red-100' },
  Equity: { color: 'text-warm-700', bgColor: 'bg-warm-100' },
  Revenue: { color: 'text-green-700', bgColor: 'bg-green-100' },
  Expense: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
}

const statusConfig: Record<AccountStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'text-green-600', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'text-warm-400', icon: Unlock },
  locked: { label: 'Locked', color: 'text-amber-600', icon: Lock },
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absValue >= 1000000) return sign + '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return sign + '$' + (absValue / 1000).toFixed(1) + 'K'
  return sign + '$' + absValue.toFixed(2)
}

function formatFullCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  return sign + '$' + absValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function isDebitNormal(type: AccountType): boolean {
  return type === 'Asset' || type === 'Expense'
}

export function ChartOfAccountsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['1', '5']))

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredAccounts = sortItems(
    mockAccounts.filter(a => {
      if (!matchesSearch(a, search, ['accountNumber', 'accountName', 'type'])) return false
      if (activeTab !== 'all' && a.type !== activeTab) return false
      // Hide children of collapsed parents
      if (a.parentId && !expandedGroups.has(a.parentId)) return false
      return true
    }),
    activeSort as keyof GLAccount | '',
    sortDirection,
  )

  // Stats calculations
  const totalAssets = mockAccounts
    .filter(a => a.type === 'Asset' && a.depth === 0)
    .reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = mockAccounts
    .filter(a => a.type === 'Liability')
    .reduce((sum, a) => sum + a.balance, 0)
  const totalEquity = mockAccounts
    .filter(a => a.type === 'Equity')
    .reduce((sum, a) => sum + a.balance, 0)
  const totalAccounts = mockAccounts.length

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Chart of Accounts</h3>
              <span className="text-sm text-warm-500">{totalAccounts} accounts | General Ledger</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Settings className="h-4 w-4" />
              Configure
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Layers className="h-4 w-4" />
              Total Accounts
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalAccounts}</div>
            <div className="text-xs text-warm-500 mt-0.5">5 categories</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Total Assets
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{formatCurrency(totalAssets)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <TrendingDown className="h-4 w-4" />
              Total Liabilities
            </div>
            <div className="text-xl font-bold text-red-700 mt-1">{formatCurrency(totalLiabilities)}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Net Equity
            </div>
            <div className="text-xl font-bold text-warm-700 mt-1">{formatCurrency(totalEquity)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search accounts..."
          tabs={[
            { key: 'all', label: 'All', count: mockAccounts.length },
            { key: 'Asset', label: 'Assets', count: mockAccounts.filter(a => a.type === 'Asset').length },
            { key: 'Liability', label: 'Liabilities', count: mockAccounts.filter(a => a.type === 'Liability').length },
            { key: 'Equity', label: 'Equity', count: mockAccounts.filter(a => a.type === 'Equity').length },
            { key: 'Revenue', label: 'Revenue', count: mockAccounts.filter(a => a.type === 'Revenue').length },
            { key: 'Expense', label: 'Expenses', count: mockAccounts.filter(a => a.type === 'Expense').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'accountNumber', label: 'Account #' },
            { value: 'accountName', label: 'Name' },
            { value: 'type', label: 'Type' },
            { value: 'balance', label: 'Balance' },
            { value: 'ytdActivity', label: 'YTD Activity' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredAccounts.length}
          totalCount={mockAccounts.length}
        />
      </div>

      {/* Accounts Table */}
      <div className="bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-warm-200 bg-warm-50 text-xs font-medium text-warm-500 uppercase tracking-wider">
          <div className="col-span-1">Account #</div>
          <div className="col-span-4">Account Name</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-2 text-right">YTD Activity</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto divide-y divide-warm-100">
          {filteredAccounts.map(account => {
            const typeStyle = typeConfig[account.type]
            const statusStyle = statusConfig[account.status]
            const StatusIcon = statusStyle.icon
            const debitNormal = isDebitNormal(account.type)

            return (
              <div
                key={account.id}
                className={cn(
                  'grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-warm-50 transition-colors',
                  account.depth === 0 && account.hasChildren && 'font-medium bg-warm-50/50',
                )}
              >
                {/* Account Number */}
                <div className="col-span-1">
                  <span className="font-mono text-sm text-warm-700">{account.accountNumber}</span>
                </div>

                {/* Account Name */}
                <div className="col-span-4 flex items-center gap-1.5">
                  {account.hasChildren ? <button
                      onClick={() => toggleGroup(account.id)}
                      className="p-0.5 hover:bg-warm-200 rounded"
                    >
                      {expandedGroups.has(account.id) ? (
                        <ChevronDown className="h-3.5 w-3.5 text-warm-500" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-warm-500" />
                      )}
                    </button> : null}
                  <span
                    className={cn('text-sm text-warm-900', !account.hasChildren && 'ml-5')}
                    style={{ paddingLeft: account.depth > 0 ? `${account.depth * 16}px` : undefined }}
                  >
                    {account.accountName}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="col-span-1">
                  <span className={cn('text-xs px-2 py-0.5 rounded font-medium', typeStyle.bgColor, typeStyle.color)}>
                    {account.type}
                  </span>
                </div>

                {/* Balance */}
                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn(
                      'text-sm font-medium',
                      account.balance < 0 ? 'text-red-600' : 'text-warm-900',
                    )}>
                      {formatFullCurrency(account.balance)}
                    </span>
                    <span className="text-[10px] text-warm-400 w-6">
                      {debitNormal ? (account.balance >= 0 ? 'Dr' : 'Cr') : (account.balance >= 0 ? 'Cr' : 'Dr')}
                    </span>
                  </div>
                </div>

                {/* YTD Activity */}
                <div className="col-span-2 text-right">
                  <span className={cn(
                    'text-sm',
                    account.ytdActivity < 0 ? 'text-red-600' : 'text-warm-600',
                  )}>
                    {formatFullCurrency(account.ytdActivity)}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex justify-center">
                  <span className={cn('flex items-center gap-1', statusStyle.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">{statusStyle.label}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                  <button className="p-1 hover:bg-warm-100 rounded">
                    <MoreHorizontal className="h-4 w-4 text-warm-400" />
                  </button>
                </div>
              </div>
            )
          })}

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-warm-400 text-sm">
              No accounts match your filters
            </div>
          )}
        </div>
      </div>

      {/* Balance Verification */}
      <div className="bg-stone-50 border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-warm-500">Balance Verification:</span>
            <div className="flex items-center gap-4">
              <span className="text-stone-700 font-medium">Assets: {formatCurrency(totalAssets)}</span>
              <span className="text-warm-400">=</span>
              <span className="text-red-700 font-medium">Liabilities: {formatCurrency(totalLiabilities)}</span>
              <span className="text-warm-400">+</span>
              <span className="text-warm-700 font-medium">Equity: {formatCurrency(totalEquity)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Balanced</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Account Analysis:</span>
          </div>
          <p className="text-sm text-amber-700">
            Trust Account (1030) is locked per compliance requirements.
            WIP balance ($1.25M) is 38% of total assets -- consider reviewing for over/under billing.
            No activity detected on Inventory (1200) in 14 days. Equipment depreciation is on schedule.
            Suggest adding a sub-account under 5200 Subcontractor Costs for retainage tracking.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Account Health Analysis',
            insight: 'All accounts balanced. WIP-to-Revenue ratio of 38% is within healthy range for construction. Trust account compliance verified.',
          },
          {
            feature: 'Missing Accounts Detection',
            insight: 'Consider adding: Sales Tax Payable (2300), Worker Comp Payable (2400), and separate sub-accounts for equipment retainage.',
          },
          {
            feature: 'Unusual Balance Detection',
            insight: 'Accumulated Depreciation (-$42K) is tracking correctly. No anomalies in debit/credit normal balances detected across all 23 accounts.',
          },
        ]}
      />
    </div>
  )
}
