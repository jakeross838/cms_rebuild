'use client'

import { useState } from 'react'
import {
  Download,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Clock,
  Building2,
  ArrowRightLeft,
  ArrowRight,
  Link2,
  RefreshCw,
  XCircle,
  Search,
  ChevronDown,
  Minus,
  Plus,
  Landmark,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type MatchStatus = 'matched' | 'unmatched' | 'outstanding'

interface BankTransaction {
  id: string
  date: string
  type: string
  reference: string
  description: string
  amount: number
  matchStatus: MatchStatus
  matchedBookEntryId?: string
}

interface BookEntry {
  id: string
  date: string
  reference: string
  description: string
  amount: number
  matchStatus: MatchStatus
  matchedBankTxnId?: string
}

const mockBankTransactions: BankTransaction[] = [
  { id: 'b1', date: '2026-02-15', type: 'DEP', reference: 'DEP', description: 'Online Deposit', amount: 87500, matchStatus: 'matched', matchedBookEntryId: 'k1' },
  { id: 'b2', date: '2026-02-14', type: 'CHK', reference: 'CHK 4521', description: 'ABC Lumber Supply', amount: -24000, matchStatus: 'matched', matchedBookEntryId: 'k2' },
  { id: 'b3', date: '2026-02-13', type: 'ACH', reference: 'ACH', description: 'ADP Payroll', amount: -34200, matchStatus: 'matched', matchedBookEntryId: 'k3' },
  { id: 'b4', date: '2026-02-12', type: 'CHK', reference: 'CHK 4520', description: 'Coastal Plumbing', amount: -8900, matchStatus: 'matched', matchedBookEntryId: 'k4' },
  { id: 'b5', date: '2026-02-11', type: 'ACH', reference: 'ACH', description: 'Monthly Insurance', amount: -2800, matchStatus: 'matched', matchedBookEntryId: 'k5' },
  { id: 'b6', date: '2026-02-10', type: 'FEE', reference: 'FEE', description: 'Monthly Service Fee', amount: -45, matchStatus: 'unmatched' },
  { id: 'b7', date: '2026-02-08', type: 'DEP', reference: 'DEP', description: 'Wire Transfer', amount: 42000, matchStatus: 'unmatched' },
  { id: 'b8', date: '2026-02-05', type: 'CHK', reference: 'CHK 4519', description: 'XYZ Electric', amount: -12450, matchStatus: 'outstanding' },
]

const mockBookEntries: BookEntry[] = [
  { id: 'k1', date: '2026-02-15', reference: 'JE-0146', description: 'Client Payment -- Smith Residence Draw #4', amount: 87500, matchStatus: 'matched', matchedBankTxnId: 'b1' },
  { id: 'k2', date: '2026-02-14', reference: 'JE-0147', description: 'Invoice #892 -- ABC Lumber', amount: -24000, matchStatus: 'matched', matchedBankTxnId: 'b2' },
  { id: 'k3', date: '2026-02-13', reference: 'JE-0145', description: 'Payroll Week Ending 2/14', amount: -34200, matchStatus: 'matched', matchedBankTxnId: 'b3' },
  { id: 'k4', date: '2026-02-12', reference: 'JE-0141', description: 'PO #2847 -- Coastal Plumbing', amount: -8900, matchStatus: 'matched', matchedBankTxnId: 'b4' },
  { id: 'k5', date: '2026-02-11', reference: 'JE-0142', description: 'Insurance Premium -- Monthly', amount: -2800, matchStatus: 'matched', matchedBankTxnId: 'b5' },
  { id: 'k6', date: '2026-02-16', reference: 'JE-0143', description: 'Retainage Release -- Harbor View', amount: -12400, matchStatus: 'unmatched' },
  { id: 'k7', date: '2026-02-17', reference: 'JE-0144', description: 'Monthly Depreciation (non-cash)', amount: -3500, matchStatus: 'unmatched' },
]

const matchStatusConfig: Record<MatchStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  matched: { label: 'Matched', color: 'text-green-700', bgColor: 'bg-green-50', icon: CheckCircle },
  unmatched: { label: 'Unmatched', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: AlertTriangle },
  outstanding: { label: 'Outstanding', color: 'text-stone-700', bgColor: 'bg-stone-50', icon: Clock },
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
  return sign + '$' + absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
}

export function BankReconciliationPreview() {
  const [selectedBankAccount, setSelectedBankAccount] = useState('operating')
  const [bankSearchTerm, setBankSearchTerm] = useState('')
  const [bookSearchTerm, setBookSearchTerm] = useState('')
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set())
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set())

  const toggleBankSelect = (id: string) => {
    setSelectedBankIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBookSelect = (id: string) => {
    setSelectedBookIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Reconciliation calculations
  const bankBalance = 623450.00
  const statementEndingBalance = 671555.00
  const bookBalance = 615005.00

  const matchedCount = mockBankTransactions.filter(t => t.matchStatus === 'matched').length
  const unmatchedBankCount = mockBankTransactions.filter(t => t.matchStatus === 'unmatched').length
  const outstandingCount = mockBankTransactions.filter(t => t.matchStatus === 'outstanding').length
  const unmatchedBookCount = mockBookEntries.filter(e => e.matchStatus === 'unmatched').length

  // Reconciliation summary
  const beginningBalance = 574450.00
  const totalDeposits = mockBankTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalChecksPayments = Math.abs(mockBankTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
  const adjustments = 0
  const calculatedEndingBalance = beginningBalance + totalDeposits - totalChecksPayments + adjustments
  const difference = calculatedEndingBalance - statementEndingBalance

  // Filter bank transactions
  const filteredBankTxns = mockBankTransactions.filter(t => {
    if (!bankSearchTerm) return true
    const query = bankSearchTerm.toLowerCase()
    return t.description.toLowerCase().includes(query) || t.reference.toLowerCase().includes(query)
  })

  // Filter book entries
  const filteredBookEntries = mockBookEntries.filter(e => {
    if (!bookSearchTerm) return true
    const query = bookSearchTerm.toLowerCase()
    return e.description.toLowerCase().includes(query) || e.reference.toLowerCase().includes(query)
  })

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Bank Reconciliation</h3>
              <span className="text-sm text-warm-500">February 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <RefreshCw className="h-4 w-4" />
              Sync Bank Feed
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <CheckCircle className="h-4 w-4" />
              Complete Reconciliation
            </button>
          </div>
        </div>
      </div>

      {/* Bank Account Selector */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-warm-500" />
            <span className="text-sm text-warm-600">Bank Account:</span>
            <select
              value={selectedBankAccount}
              onChange={(e) => setSelectedBankAccount(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-warm-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 cursor-pointer font-medium"
            >
              <option value="operating">1010 - Operating Account</option>
              <option value="payroll">1020 - Payroll Account</option>
              <option value="trust">1030 - Trust Account</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warm-500" />
            <span className="text-sm text-warm-600">Statement Date:</span>
            <span className="text-sm font-medium text-warm-900">Feb 18, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-warm-500" />
            <span className="text-sm text-warm-600">Statement Ending Balance:</span>
            <span className="text-sm font-bold text-warm-900">{formatFullCurrency(statementEndingBalance)}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Landmark className="h-4 w-4" />
              Bank Balance
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{formatCurrency(statementEndingBalance)}</div>
            <div className="text-xs text-stone-600 mt-0.5">Per bank statement</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Book Balance
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(bookBalance)}</div>
            <div className="text-xs text-warm-500 mt-0.5">Per general ledger</div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            Math.abs(difference) < 1 ? 'bg-green-50' : 'bg-red-50',
          )}>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              Math.abs(difference) < 1 ? 'text-green-600' : 'text-red-600',
            )}>
              <ArrowRightLeft className="h-4 w-4" />
              Difference
            </div>
            <div className={cn(
              'text-xl font-bold mt-1',
              Math.abs(difference) < 1 ? 'text-green-700' : 'text-red-700',
            )}>
              {formatFullCurrency(difference)}
            </div>
            <div className={cn(
              'text-xs mt-0.5',
              Math.abs(difference) < 1 ? 'text-green-500' : 'text-red-500',
            )}>
              {Math.abs(difference) < 1 ? 'Reconciled' : 'Needs review'}
            </div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            (unmatchedBankCount + unmatchedBookCount) > 0 ? 'bg-amber-50' : 'bg-green-50',
          )}>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              (unmatchedBankCount + unmatchedBookCount) > 0 ? 'text-amber-600' : 'text-green-600',
            )}>
              <AlertTriangle className="h-4 w-4" />
              Unmatched Items
            </div>
            <div className={cn(
              'text-xl font-bold mt-1',
              (unmatchedBankCount + unmatchedBookCount) > 0 ? 'text-amber-700' : 'text-green-700',
            )}>
              {unmatchedBankCount + unmatchedBookCount + outstandingCount}
            </div>
            <div className="text-xs text-warm-500 mt-0.5">{unmatchedBankCount} bank, {unmatchedBookCount} book, {outstandingCount} outstanding</div>
          </div>
        </div>
      </div>

      {/* Split View: Bank Transactions / Book Entries */}
      <div className="grid grid-cols-2 divide-x divide-warm-200">
        {/* Left: Bank Transactions */}
        <div>
          <div className="bg-stone-50 border-b border-warm-200 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-stone-600" />
                <span className="text-sm font-semibold text-stone-800">Bank Transactions</span>
                <span className="text-xs text-stone-600">({mockBankTransactions.length})</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-warm-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={bankSearchTerm}
                  onChange={(e) => setBankSearchTerm(e.target.value)}
                  className="pl-7 pr-2 py-1 text-xs border border-warm-200 rounded w-32 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-1 px-4 py-1.5 text-[10px] font-medium text-warm-500 uppercase tracking-wider bg-warm-50 border-b border-warm-100 sticky top-0">
              <div className="col-span-1"></div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Ref</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-center">Status</div>
            </div>

            {filteredBankTxns.map(txn => {
              const matchConfig = matchStatusConfig[txn.matchStatus]
              const MatchIcon = matchConfig.icon

              return (
                <div
                  key={txn.id}
                  className={cn(
                    'grid grid-cols-12 gap-1 px-4 py-2 items-center border-b border-warm-50 hover:bg-warm-50 transition-colors text-sm',
                    txn.matchStatus === 'matched' && 'bg-green-50/30',
                    txn.matchStatus === 'unmatched' && 'bg-amber-50/30',
                    selectedBankIds.has(txn.id) && 'ring-1 ring-stone-300 bg-stone-50',
                  )}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedBankIds.has(txn.id)}
                      onChange={() => toggleBankSelect(txn.id)}
                      className="h-3.5 w-3.5 rounded border-warm-300 text-stone-600 focus:ring-stone-500"
                      disabled={txn.matchStatus === 'matched'}
                    />
                  </div>
                  <div className="col-span-2 text-xs text-warm-600">{formatDate(txn.date)}</div>
                  <div className="col-span-2 font-mono text-xs text-warm-500">{txn.reference}</div>
                  <div className="col-span-4 text-xs text-warm-800 truncate">{txn.description}</div>
                  <div className={cn(
                    'col-span-2 text-right text-xs font-medium',
                    txn.amount >= 0 ? 'text-green-700' : 'text-warm-900',
                  )}>
                    {formatFullCurrency(txn.amount)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <MatchIcon className={cn('h-3.5 w-3.5', matchConfig.color)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Book Entries */}
        <div>
          <div className="bg-stone-50 border-b border-warm-200 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-stone-600" />
                <span className="text-sm font-semibold text-stone-800">Book Entries</span>
                <span className="text-xs text-stone-500">({mockBookEntries.length})</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-warm-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={bookSearchTerm}
                  onChange={(e) => setBookSearchTerm(e.target.value)}
                  className="pl-7 pr-2 py-1 text-xs border border-warm-200 rounded w-32 focus:outline-none focus:ring-1 focus:ring-stone-300"
                />
              </div>
            </div>
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-1 px-4 py-1.5 text-[10px] font-medium text-warm-500 uppercase tracking-wider bg-warm-50 border-b border-warm-100 sticky top-0">
              <div className="col-span-1"></div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Ref</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-center">Status</div>
            </div>

            {filteredBookEntries.map(entry => {
              const matchConfig = matchStatusConfig[entry.matchStatus]
              const MatchIcon = matchConfig.icon

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'grid grid-cols-12 gap-1 px-4 py-2 items-center border-b border-warm-50 hover:bg-warm-50 transition-colors text-sm',
                    entry.matchStatus === 'matched' && 'bg-green-50/30',
                    entry.matchStatus === 'unmatched' && 'bg-amber-50/30',
                    selectedBookIds.has(entry.id) && 'ring-1 ring-stone-300 bg-stone-50',
                  )}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.has(entry.id)}
                      onChange={() => toggleBookSelect(entry.id)}
                      className="h-3.5 w-3.5 rounded border-warm-300 text-stone-600 focus:ring-stone-500"
                      disabled={entry.matchStatus === 'matched'}
                    />
                  </div>
                  <div className="col-span-2 text-xs text-warm-600">{formatDate(entry.date)}</div>
                  <div className="col-span-2 font-mono text-xs text-warm-500">{entry.reference}</div>
                  <div className="col-span-4 text-xs text-warm-800 truncate">{entry.description}</div>
                  <div className={cn(
                    'col-span-2 text-right text-xs font-medium',
                    entry.amount >= 0 ? 'text-green-700' : 'text-warm-900',
                  )}>
                    {formatFullCurrency(entry.amount)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <MatchIcon className={cn('h-3.5 w-3.5', matchConfig.color)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Match Action Bar */}
      {(selectedBankIds.size > 0 || selectedBookIds.size > 0) && (
        <div className="bg-stone-50 border-t border-stone-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-700">
              {selectedBankIds.size} bank + {selectedBookIds.size} book items selected
            </span>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
                <Link2 className="h-3.5 w-3.5" />
                Match Selected
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                <Plus className="h-3.5 w-3.5" />
                Create JE for Bank Item
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                <XCircle className="h-3.5 w-3.5" />
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Summary */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-warm-500" />
          Reconciliation Summary
        </h4>
        <div className="grid grid-cols-2 gap-6">
          {/* Bank Side */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-warm-500 uppercase tracking-wider mb-2">Bank Statement</div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-warm-600">Beginning Balance</span>
              <span className="text-sm font-medium text-warm-900">{formatFullCurrency(beginningBalance)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Deposits & Credits
              </span>
              <span className="text-sm font-medium text-green-700">{formatFullCurrency(totalDeposits)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-red-600 flex items-center gap-1">
                <Minus className="h-3 w-3" /> Checks & Payments
              </span>
              <span className="text-sm font-medium text-red-700">-{formatFullCurrency(totalChecksPayments)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-warm-600 flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" /> Adjustments
              </span>
              <span className="text-sm font-medium text-warm-900">{formatFullCurrency(adjustments)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t-2 border-warm-300 font-semibold">
              <span className="text-sm text-warm-900">Ending Balance</span>
              <span className="text-sm text-warm-900">{formatFullCurrency(calculatedEndingBalance)}</span>
            </div>
          </div>

          {/* Book Side */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-warm-500 uppercase tracking-wider mb-2">Book Adjustments</div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-warm-600">GL Book Balance</span>
              <span className="text-sm font-medium text-warm-900">{formatFullCurrency(bookBalance)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Outstanding Checks ({outstandingCount})
              </span>
              <span className="text-sm font-medium text-amber-700">-{formatFullCurrency(12450)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Deposits in Transit
              </span>
              <span className="text-sm font-medium text-amber-700">{formatFullCurrency(42000)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-warm-100">
              <span className="text-sm text-warm-600 flex items-center gap-1">
                <Minus className="h-3 w-3" /> Bank Fees Not Recorded
              </span>
              <span className="text-sm font-medium text-warm-900">-{formatFullCurrency(45)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t-2 border-warm-300 font-semibold">
              <span className="text-sm text-warm-900">Adjusted Book Balance</span>
              <span className="text-sm text-warm-900">{formatFullCurrency(bookBalance - 12450 + 42000 - 45)}</span>
            </div>
          </div>
        </div>

        {/* Final Difference */}
        <div className={cn(
          'mt-4 p-3 rounded-lg flex items-center justify-between',
          Math.abs(difference) < 1 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200',
        )}>
          <div className="flex items-center gap-2">
            {Math.abs(difference) < 1 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={cn(
              'text-sm font-semibold',
              Math.abs(difference) < 1 ? 'text-green-800' : 'text-red-800',
            )}>
              {Math.abs(difference) < 1 ? 'Reconciliation Complete' : 'Unreconciled Difference'}
            </span>
          </div>
          <span className={cn(
            'text-lg font-bold',
            Math.abs(difference) < 1 ? 'text-green-700' : 'text-red-700',
          )}>
            {formatFullCurrency(difference)}
          </span>
        </div>
      </div>

      {/* Matched Items Legend */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-2.5">
        <div className="flex items-center gap-6 text-xs text-warm-500">
          <span className="font-medium">Legend:</span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" /> Matched ({matchedCount})
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600" /> Unmatched ({unmatchedBankCount + unmatchedBookCount})
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-stone-600" /> Outstanding ({outstandingCount})
          </span>
          <span className="ml-auto text-warm-400">Last bank sync: Feb 18, 2026 9:30 AM</span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Reconciliation Insights:</span>
          </div>
          <p className="text-sm text-amber-700">
            Wire transfer deposit ($42,000) on Feb 8 has no matching book entry -- likely a client payment that needs to be recorded.
            Monthly service fee ($45) should be recorded as a G&A expense.
            CHK 4519 to XYZ Electric ($12,450) is outstanding 13 days -- consider following up with vendor to confirm receipt.
            5 of 8 bank transactions auto-matched (62.5% match rate). Industry average: 85%.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Auto-Match Engine',
            insight: '5 transactions automatically matched by amount, date, and payee. 2 items flagged for manual review due to date discrepancy.',
          },
          {
            feature: 'Missing Entry Detection',
            insight: 'Wire transfer ($42K) and bank fee ($45) have no corresponding book entries. Recommend creating journal entries to record these items.',
          },
          {
            feature: 'Outstanding Check Aging',
            insight: 'CHK 4519 to XYZ Electric has been outstanding for 13 days. Average check clearing time for this vendor: 5 days. Flag for follow-up.',
          },
        ]}
      />
    </div>
  )
}
