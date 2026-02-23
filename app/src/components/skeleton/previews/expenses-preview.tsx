'use client'

import { useState } from 'react'

import {
  Receipt,
  DollarSign,
  CreditCard,
  Building,
  Calendar,
  Camera,
  Upload,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Car,
  Utensils,
  Package,
  Wrench,
  Fuel,
  FileText,
  MoreHorizontal,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// Types
type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'
type ExpenseCategory = 'materials' | 'fuel' | 'meals' | 'tools' | 'travel' | 'supplies' | 'other'

interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  vendor: string
  date: Date
  submittedBy: string
  status: ExpenseStatus
  jobId?: string
  jobName?: string
  costCode?: string
  receiptUrl?: string
  notes?: string
  approvedBy?: string
  approvedAt?: Date
  reimbursedAt?: Date
  paymentMethod?: 'card' | 'cash' | 'personal'
  mileage?: number
}

// Mock data
const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Lumber - 2x4 framing materials',
    amount: 847.50,
    category: 'materials',
    vendor: 'ABC Lumber Supply',
    date: new Date(Date.now() - 86400000),
    submittedBy: 'Mike Torres',
    status: 'approved',
    jobId: 'job-1',
    jobName: 'Johnson Kitchen Remodel',
    costCode: '06-100',
    receiptUrl: '/receipts/exp-001.jpg',
    approvedBy: 'Sarah Chen',
    approvedAt: new Date(Date.now() - 43200000),
    paymentMethod: 'card',
  },
  {
    id: '2',
    description: 'Fuel - Site visits Feb 15-17',
    amount: 124.85,
    category: 'fuel',
    vendor: 'Shell Gas Station',
    date: new Date(Date.now() - 172800000),
    submittedBy: 'David Park',
    status: 'submitted',
    mileage: 247,
    paymentMethod: 'personal',
    notes: 'Multiple site visits for inspections',
  },
  {
    id: '3',
    description: 'Client lunch meeting',
    amount: 78.45,
    category: 'meals',
    vendor: 'The Grill House',
    date: new Date(Date.now() - 259200000),
    submittedBy: 'Sarah Chen',
    status: 'reimbursed',
    jobId: 'job-1',
    jobName: 'Johnson Kitchen Remodel',
    receiptUrl: '/receipts/exp-003.jpg',
    approvedBy: 'Admin',
    reimbursedAt: new Date(Date.now() - 86400000),
    paymentMethod: 'personal',
  },
  {
    id: '4',
    description: 'Power tools - Dewalt drill set',
    amount: 349.99,
    category: 'tools',
    vendor: 'Home Depot',
    date: new Date(Date.now() - 345600000),
    submittedBy: 'Mike Torres',
    status: 'rejected',
    notes: 'Company already owns similar equipment',
    paymentMethod: 'personal',
  },
  {
    id: '5',
    description: 'Electrical supplies - Wire, outlets',
    amount: 215.30,
    category: 'supplies',
    vendor: 'Elite Electrical Supply',
    date: new Date(Date.now() - 432000000),
    submittedBy: 'Mike Torres',
    status: 'approved',
    jobId: 'job-2',
    jobName: 'Smith Residence',
    costCode: '16-100',
    receiptUrl: '/receipts/exp-005.jpg',
    approvedBy: 'Sarah Chen',
    paymentMethod: 'card',
  },
  {
    id: '6',
    description: 'Hardware store - Misc fasteners',
    amount: 42.15,
    category: 'supplies',
    vendor: 'Lowes',
    date: new Date(),
    submittedBy: 'David Park',
    status: 'draft',
    jobId: 'job-1',
    jobName: 'Johnson Kitchen Remodel',
    paymentMethod: 'cash',
  },
]

const categoryConfig: Record<ExpenseCategory, { icon: typeof Package; label: string; color: string; bg: string }> = {
  materials: { icon: Package, label: 'Materials', color: 'text-blue-600', bg: 'bg-blue-100' },
  fuel: { icon: Fuel, label: 'Fuel', color: 'text-amber-600', bg: 'bg-amber-100' },
  meals: { icon: Utensils, label: 'Meals', color: 'text-orange-600', bg: 'bg-orange-100' },
  tools: { icon: Wrench, label: 'Tools', color: 'text-purple-600', bg: 'bg-purple-100' },
  travel: { icon: Car, label: 'Travel', color: 'text-green-600', bg: 'bg-green-100' },
  supplies: { icon: Briefcase, label: 'Supplies', color: 'text-stone-600', bg: 'bg-stone-100' },
  other: { icon: Receipt, label: 'Other', color: 'text-warm-600', bg: 'bg-warm-100' },
}

const statusConfig: Record<ExpenseStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'text-warm-600', bg: 'bg-warm-100', icon: Edit3 },
  submitted: { label: 'Pending', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
  approved: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  reimbursed: { label: 'Reimbursed', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: DollarSign },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ExpenseRow({ expense, onView }: { expense: Expense; onView: () => void }) {
  const category = categoryConfig[expense.category]
  const status = statusConfig[expense.status]
  const CategoryIcon = category.icon
  const StatusIcon = status.icon

  return (
    <div
      onClick={onView}
      className="bg-warm-0 border border-warm-200 rounded-lg p-4 hover:border-warm-300 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div className={cn('p-2.5 rounded-lg', category.bg)}>
          <CategoryIcon className={cn('h-5 w-5', category.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-warm-800 truncate">{expense.description}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded flex items-center gap-1', status.bg, status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-warm-500">
                <span>{expense.vendor}</span>
                <span className="text-warm-300">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(expense.date)}
                </span>
                {expense.jobName ? <>
                    <span className="text-warm-300">|</span>
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      {expense.jobName}
                    </span>
                  </> : null}
              </div>
              {expense.notes && expense.status === 'rejected' ? <p className="text-xs text-red-600 mt-1">{expense.notes}</p> : null}
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className="text-lg font-semibold text-warm-800">{formatCurrency(expense.amount)}</p>
              <p className="text-xs text-warm-500">{expense.submittedBy}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100">
            <div className="flex items-center gap-3">
              {expense.receiptUrl ? <span className="flex items-center gap-1 text-xs text-warm-500">
                  <FileText className="h-3.5 w-3.5" />
                  Receipt attached
                </span> : null}
              {expense.costCode ? <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">
                  {expense.costCode}
                </span> : null}
              {expense.mileage ? <span className="text-xs text-warm-500">
                  {expense.mileage} miles
                </span> : null}
            </div>
            <ChevronRight className="h-4 w-4 text-warm-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function NewExpenseForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<ExpenseCategory>('supplies')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-warm-0 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-warm-200 flex items-center justify-between">
          <h2 className="font-semibold text-warm-900">New Expense</h2>
          <button onClick={onClose} className="text-warm-500 hover:text-warm-700 text-xl">
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4 overflow-auto max-h-[calc(90vh-130px)]">
          {/* Receipt Upload */}
          <div className="border-2 border-dashed border-warm-200 rounded-lg p-6 text-center hover:border-warm-300 transition-colors cursor-pointer">
            <Camera className="h-8 w-8 text-warm-400 mx-auto mb-2" />
            <p className="text-sm text-warm-600 font-medium">Upload Receipt</p>
            <p className="text-xs text-warm-500 mt-1">Take a photo or upload an image</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-warm-500 mb-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-warm-500 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1">Description</label>
            <input
              type="text"
              placeholder="What was this expense for?"
              className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1">Vendor</label>
            <input
              type="text"
              placeholder="Where did you make the purchase?"
              className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key as ExpenseCategory)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      category === key
                        ? cn(config.bg, config.color)
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-warm-500 mb-1">Link to Job (Optional)</label>
              <select className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-warm-0 focus:outline-none focus:ring-2 focus:ring-stone-300">
                <option value="">Select a job...</option>
                <option value="job-1">Johnson Kitchen Remodel</option>
                <option value="job-2">Smith Residence</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-warm-500 mb-1">Cost Code (Optional)</label>
              <select className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-warm-0 focus:outline-none focus:ring-2 focus:ring-stone-300">
                <option value="">Select cost code...</option>
                <option value="06-100">06-100 Framing</option>
                <option value="16-100">16-100 Electrical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1">Payment Method</label>
            <div className="flex gap-2">
              {[
                { value: 'card', label: 'Company Card', icon: CreditCard },
                { value: 'personal', label: 'Personal Card', icon: CreditCard },
                { value: 'cash', label: 'Cash', icon: DollarSign },
              ].map((method) => (
                <button
                  key={method.value}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-warm-200 rounded-lg text-sm text-warm-600 hover:bg-warm-50"
                >
                  <method.icon className="h-4 w-4" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add any additional details..."
              className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-warm-200 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-warm-600 hover:bg-warm-100 rounded-lg text-sm">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-warm-200 text-warm-700 rounded-lg text-sm hover:bg-warm-50">
              Save Draft
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg text-sm hover:bg-stone-800">
              <Upload className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExpensesPreview() {
  const [filter, setFilter] = useState<'all' | ExpenseStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewExpense, setShowNewExpense] = useState(false)

  const filteredExpenses = mockExpenses.filter((expense) => {
    if (filter !== 'all' && expense.status !== filter) return false
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false
    if (searchQuery && !expense.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalPending = mockExpenses.filter(e => e.status === 'submitted').reduce((sum, e) => sum + e.amount, 0)
  const totalApproved = mockExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0)
  const totalReimbursed = mockExpenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0)
  const totalRejected = mockExpenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 font-display flex items-center gap-2">
              <Receipt className="h-6 w-6 text-stone-600" />
              Expense Tracking
            </h1>
            <p className="text-warm-600 mt-1">Track and manage project expenses and reimbursements</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowNewExpense(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg text-sm hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" />
              New Expense
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Pending Approval</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-warm-500 mt-1">
              {mockExpenses.filter(e => e.status === 'submitted').length} expenses
            </p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Approved</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalApproved)}</p>
            <p className="text-xs text-warm-500 mt-1">
              {mockExpenses.filter(e => e.status === 'approved').length} expenses
            </p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Reimbursed</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totalReimbursed)}</p>
            <p className="text-xs text-warm-500 mt-1">
              {mockExpenses.filter(e => e.status === 'reimbursed').length} expenses
            </p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">This Month</span>
              <TrendingUp className="h-4 w-4 text-stone-500" />
            </div>
            <p className="text-2xl font-semibold text-warm-800">{formatCurrency(1658.24)}</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3" />
              12% less than last month
            </p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">AI Expense Insights</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• Receipt scanning detected $847.50 matches PO #892 for Johnson Kitchen - auto-linked</li>
                <li>• Fuel expenses trending 15% higher this month - consider route optimization</li>
                <li>• 2 expenses pending for more than 5 days - approval reminder sent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-warm-0 rounded-xl border border-warm-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-warm-100 rounded-lg p-1">
              {(['all', 'draft', 'submitted', 'approved', 'reimbursed', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                    filter === f
                      ? 'bg-warm-0 text-warm-800 shadow-sm'
                      : 'text-warm-600 hover:text-warm-800'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="px-3 py-2 border border-warm-200 rounded-lg text-sm bg-warm-0 focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onView={() => console.log('View expense', expense.id)}
            />
          ))}

          {filteredExpenses.length === 0 && (
            <div className="bg-warm-0 border border-warm-200 rounded-lg p-8 text-center">
              <Receipt className="h-12 w-12 text-warm-300 mx-auto mb-3" />
              <p className="text-warm-600">No expenses match your filters</p>
            </div>
          )}
        </div>

        {/* Quick Add Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-4">
          <button
            onClick={() => setShowNewExpense(true)}
            className="flex items-center gap-2 hover:text-stone-200 transition-colors"
          >
            <Camera className="h-5 w-5" />
            <span className="text-sm">Snap Receipt</span>
          </button>
          <div className="w-px h-6 bg-stone-600" />
          <button
            onClick={() => setShowNewExpense(true)}
            className="flex items-center gap-2 hover:text-stone-200 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Quick Add</span>
          </button>
        </div>
      </div>

      {/* New Expense Modal */}
      {showNewExpense ? <NewExpenseForm onClose={() => setShowNewExpense(false)} /> : null}
    </div>
  )
}
