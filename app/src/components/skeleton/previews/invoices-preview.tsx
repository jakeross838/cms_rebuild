'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Briefcase,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'received' | 'under_review' | 'approved' | 'paid' | 'disputed'

interface Invoice {
  id: string
  invoiceNumber: string
  vendorName: string
  jobName: string
  amount: number
  dueDate: string
  status: InvoiceStatus
  submittedDate: string
  description?: string
  aiNote?: string
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0847',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Smith Residence',
    amount: 12450.00,
    dueDate: '2024-12-18',
    status: 'received',
    submittedDate: '2024-12-02',
    description: 'Framing lumber - Phase 2',
    aiNote: 'Amount 8% higher than PO - review recommended',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0846',
    vendorName: 'PGT Industries',
    jobName: 'Smith Residence',
    amount: 45800.00,
    dueDate: '2024-12-15',
    status: 'under_review',
    submittedDate: '2024-11-28',
    description: 'Impact windows - Final payment',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0843',
    vendorName: 'Jones Plumbing',
    jobName: 'Johnson Beach House',
    amount: 8750.00,
    dueDate: '2024-12-10',
    status: 'approved',
    submittedDate: '2024-11-25',
    description: 'Rough-in plumbing complete',
    aiNote: 'Pay by Dec 8 for 2% early payment discount ($175)',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0840',
    vendorName: 'Smith Electric',
    jobName: 'Miller Addition',
    amount: 6200.00,
    dueDate: '2024-12-05',
    status: 'paid',
    submittedDate: '2024-11-20',
    description: 'Electrical rough-in',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-0838',
    vendorName: 'Cool Air HVAC',
    jobName: 'Smith Residence',
    amount: 15600.00,
    dueDate: '2024-11-28',
    status: 'disputed',
    submittedDate: '2024-11-15',
    description: 'HVAC equipment and installation',
    aiNote: 'Disputed: Missing equipment serial numbers',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-0835',
    vendorName: 'Custom Cabinet Co',
    jobName: 'Davis Coastal Home',
    amount: 28400.00,
    dueDate: '2024-12-20',
    status: 'received',
    submittedDate: '2024-12-01',
    description: 'Kitchen cabinets - 50% deposit',
  },
  {
    id: '7',
    invoiceNumber: 'INV-2024-0830',
    vendorName: 'ABC Framing',
    jobName: 'Wilson Custom',
    amount: 32100.00,
    dueDate: '2024-12-08',
    status: 'under_review',
    submittedDate: '2024-11-22',
    description: 'Framing labor - Phase 1',
  },
]

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  received: { label: 'Received', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: FileText },
  under_review: { label: 'Under Review', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  paid: { label: 'Paid', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDaysUntilDue(dueDate: string): { days: number; label: string; isOverdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)}d overdue`, isOverdue: true }
  } else if (diffDays === 0) {
    return { days: 0, label: 'Due today', isOverdue: false }
  } else {
    return { days: diffDays, label: `${diffDays}d`, isOverdue: false }
  }
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const status = statusConfig[invoice.status]
  const StatusIcon = status.icon
  const dueInfo = getDaysUntilDue(invoice.dueDate)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.bgColor, status.color)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{invoice.vendorName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span>{invoice.jobName}</span>
            </div>
          </div>

          {invoice.description && (
            <p className="text-sm text-gray-500 mt-2">{invoice.description}</p>
          )}

          {invoice.aiNote && (
            <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              invoice.aiNote.includes('Disputed') || invoice.aiNote.includes('higher') ? "bg-amber-50" : "bg-blue-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                invoice.aiNote.includes('Disputed') || invoice.aiNote.includes('higher') ? "text-amber-500" : "text-blue-500"
              )} />
              <span className={invoice.aiNote.includes('Disputed') || invoice.aiNote.includes('higher') ? "text-amber-700" : "text-blue-700"}>
                {invoice.aiNote}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.amount)}</div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Due {formatDate(invoice.dueDate)}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                dueInfo.isOverdue ? "bg-red-100 text-red-700" :
                dueInfo.days <= 7 ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-600"
              )}>
                {dueInfo.label}
              </span>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function InvoicesPreview() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')

  const vendors = [...new Set(mockInvoices.map(inv => inv.vendorName))]
  const jobs = [...new Set(mockInvoices.map(inv => inv.jobName))]

  const filteredInvoices = mockInvoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (vendorFilter !== 'all' && inv.vendorName !== vendorFilter) return false
    if (jobFilter !== 'all' && inv.jobName !== jobFilter) return false
    return true
  })

  // Calculate quick stats
  const pendingApproval = mockInvoices.filter(inv =>
    inv.status === 'received' || inv.status === 'under_review'
  ).reduce((sum, inv) => sum + inv.amount, 0)

  const dueThisWeek = mockInvoices.filter(inv => {
    if (inv.status === 'paid') return false
    const dueInfo = getDaysUntilDue(inv.dueDate)
    return dueInfo.days <= 7 && !dueInfo.isOverdue
  }).reduce((sum, inv) => sum + inv.amount, 0)

  const overdueAmount = mockInvoices.filter(inv => {
    if (inv.status === 'paid') return false
    const dueInfo = getDaysUntilDue(inv.dueDate)
    return dueInfo.isOverdue
  }).reduce((sum, inv) => sum + inv.amount, 0)

  const pendingCount = mockInvoices.filter(inv =>
    inv.status === 'received' || inv.status === 'under_review'
  ).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Invoices</h3>
              <span className="text-sm text-gray-500">{mockInvoices.length} invoices | {formatCurrency(mockInvoices.reduce((sum, inv) => sum + inv.amount, 0))} total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending Approval ({pendingCount})
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(pendingApproval)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Calendar className="h-4 w-4" />
              Due This Week
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(dueThisWeek)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            overdueAmount > 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              overdueAmount > 0 ? "text-red-600" : "text-green-600"
            )}>
              {overdueAmount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              Overdue Amount
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              overdueAmount > 0 ? "text-red-700" : "text-green-700"
            )}>
              {overdueAmount > 0 ? formatCurrency(overdueAmount) : '$0'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg transition-colors",
                    statusFilter === 'all'
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  All
                </button>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key as InvoiceStatus)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-lg transition-colors",
                      statusFilter === key
                        ? cn(config.bgColor, config.color, "font-medium")
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Vendor Filter */}
            <div className="relative">
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Job Filter */}
            <div className="relative">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredInvoices.map(invoice => (
          <InvoiceRow key={invoice.id} invoice={invoice} />
        ))}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No invoices match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Payment Optimization:</span>
          </div>
          <p className="text-sm text-amber-700">
            Pay Jones Plumbing by Dec 8 to capture $175 early payment discount.
            ABC Lumber invoice is 8% over PO amount - recommend verification before approval.
            Consolidating 3 pending invoices for Smith Residence could improve cash flow timing.
          </p>
        </div>
      </div>
    </div>
  )
}
