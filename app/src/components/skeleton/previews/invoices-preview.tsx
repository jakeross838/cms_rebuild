'use client'

import { useState } from 'react'
import {
  Download,
  Plus,
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
  Upload,
  ShieldCheck,
  Link2,
  Ban,
  GitBranch,
  Receipt,
  Scale,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type InvoiceStatus = 'needs_review' | 'ready_for_approval' | 'approved' | 'in_draw' | 'paid' | 'disputed' | 'denied' | 'split' | 'voided'

type InvoiceType = 'standard' | 'progress' | 'final' | 'credit_memo' | 'retainage_release'

type ContractType = 'lump_sum' | 'time_materials' | 'unit_price' | 'cost_plus'

interface Invoice {
  id: string
  invoiceNumber: string
  vendorName: string
  jobName: string
  amount: number
  taxAmount: number
  retainageAmount: number
  netAmount: number
  dueDate: string
  status: InvoiceStatus
  submittedDate: string
  invoiceType: InvoiceType
  contractType: ContractType
  description?: string
  costCode?: string
  poNumber?: string
  poVariance?: number
  drawNumber?: number
  lienWaiverStatus: 'not_required' | 'required' | 'received' | 'pending'
  paymentTerms: string
  paymentMethod?: 'check' | 'ach' | 'wire' | 'credit_card'
  paidDate?: string
  approvalStep?: string
  aiConfidence?: number
  aiNote?: string
  isDuplicate?: boolean
  isAutoCoded?: boolean
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-0847',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Smith Residence',
    amount: 12450.00,
    taxAmount: 0,
    retainageAmount: 1245.00,
    netAmount: 11205.00,
    dueDate: '2025-12-18',
    status: 'needs_review',
    submittedDate: '2025-12-02',
    invoiceType: 'standard',
    contractType: 'lump_sum',
    description: 'Framing lumber - Phase 2',
    costCode: '03-Framing-Materials',
    poNumber: 'PO-089',
    poVariance: 920,
    lienWaiverStatus: 'received',
    paymentTerms: 'Net 30',
    aiConfidence: 0.92,
    aiNote: 'Amount 8% higher than PO-089 ($11,530) - review recommended',
    isAutoCoded: true,
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-0846',
    vendorName: 'PGT Industries',
    jobName: 'Smith Residence',
    amount: 45800.00,
    taxAmount: 0,
    retainageAmount: 4580.00,
    netAmount: 41220.00,
    dueDate: '2025-12-15',
    status: 'ready_for_approval',
    submittedDate: '2025-11-28',
    invoiceType: 'final',
    contractType: 'lump_sum',
    description: 'Impact windows - Final payment',
    costCode: '08-Windows',
    poNumber: 'PO-072',
    lienWaiverStatus: 'pending',
    paymentTerms: 'Net 15',
    approvalStep: 'PM Review',
    aiConfidence: 0.98,
    isAutoCoded: true,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2025-0843',
    vendorName: 'Jones Plumbing',
    jobName: 'Johnson Beach House',
    amount: 8750.00,
    taxAmount: 0,
    retainageAmount: 875.00,
    netAmount: 7875.00,
    dueDate: '2025-12-10',
    status: 'approved',
    submittedDate: '2025-11-25',
    invoiceType: 'progress',
    contractType: 'lump_sum',
    description: 'Rough-in plumbing complete - 60% billing',
    costCode: '15-Plumbing',
    poNumber: 'PO-088',
    lienWaiverStatus: 'received',
    paymentTerms: '2/10 Net 30',
    approvalStep: 'Approved by Jake R.',
    aiConfidence: 1.0,
    aiNote: 'Pay by Dec 8, 2025 for 2% early payment discount ($175 savings)',
    isAutoCoded: true,
  },
  {
    id: '4',
    invoiceNumber: 'INV-2025-0840',
    vendorName: 'Smith Electric',
    jobName: 'Miller Addition',
    amount: 6200.00,
    taxAmount: 0,
    retainageAmount: 0,
    netAmount: 6200.00,
    dueDate: '2025-12-05',
    status: 'paid',
    submittedDate: '2025-11-20',
    invoiceType: 'standard',
    contractType: 'time_materials',
    description: 'Electrical rough-in - 42 hrs @ $85/hr + materials',
    costCode: '16-Electrical',
    lienWaiverStatus: 'received',
    paymentTerms: 'Net 30',
    paymentMethod: 'ach',
    paidDate: '2025-12-03',
    aiConfidence: 0.97,
  },
  {
    id: '5',
    invoiceNumber: 'INV-2025-0838',
    vendorName: 'Cool Air HVAC',
    jobName: 'Smith Residence',
    amount: 15600.00,
    taxAmount: 0,
    retainageAmount: 1560.00,
    netAmount: 14040.00,
    dueDate: '2025-11-28',
    status: 'disputed',
    submittedDate: '2025-11-15',
    invoiceType: 'standard',
    contractType: 'lump_sum',
    description: 'HVAC equipment and installation',
    costCode: '23-HVAC',
    poNumber: 'PO-081',
    poVariance: 2100,
    lienWaiverStatus: 'not_required',
    paymentTerms: 'Net 30',
    aiConfidence: 0.88,
    aiNote: 'Disputed: Missing equipment serial numbers. Amount $2,100 over PO.',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2025-0835',
    vendorName: 'Custom Cabinet Co',
    jobName: 'Davis Coastal Home',
    amount: 28400.00,
    taxAmount: 0,
    retainageAmount: 2840.00,
    netAmount: 25560.00,
    dueDate: '2025-12-20',
    status: 'needs_review',
    submittedDate: '2025-12-01',
    invoiceType: 'progress',
    contractType: 'lump_sum',
    description: 'Kitchen cabinets - 50% deposit',
    costCode: '06-Cabinetry',
    poNumber: 'PO-095',
    lienWaiverStatus: 'required',
    paymentTerms: 'Net 30',
    aiConfidence: 0.95,
    isAutoCoded: true,
  },
  {
    id: '7',
    invoiceNumber: 'INV-2025-0830',
    vendorName: 'ABC Framing',
    jobName: 'Wilson Custom',
    amount: 32100.00,
    taxAmount: 0,
    retainageAmount: 3210.00,
    netAmount: 28890.00,
    dueDate: '2025-12-08',
    status: 'ready_for_approval',
    submittedDate: '2025-11-22',
    invoiceType: 'standard',
    contractType: 'lump_sum',
    description: 'Framing labor - Phase 1',
    costCode: '03-Framing-Labor',
    lienWaiverStatus: 'received',
    paymentTerms: 'Net 30',
    approvalStep: 'Owner Review (>$25K)',
    aiConfidence: 0.96,
    isAutoCoded: true,
  },
  {
    id: '8',
    invoiceNumber: 'INV-2025-0828',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Smith Residence',
    amount: -2400.00,
    taxAmount: 0,
    retainageAmount: 0,
    netAmount: -2400.00,
    dueDate: '2025-12-15',
    status: 'approved',
    submittedDate: '2025-11-29',
    invoiceType: 'credit_memo',
    contractType: 'lump_sum',
    description: 'Credit for returned material - damaged shipment',
    costCode: '03-Framing-Materials',
    poNumber: 'PO-089',
    lienWaiverStatus: 'not_required',
    paymentTerms: 'Net 30',
    aiConfidence: 0.99,
    aiNote: 'Credit memo linked to original INV-2025-0812. PO-089 balance adjusted.',
  },
  {
    id: '9',
    invoiceNumber: 'INV-2025-0825',
    vendorName: 'Coastal Concrete',
    jobName: 'Johnson Beach House',
    amount: 18000.00,
    taxAmount: 0,
    retainageAmount: 1800.00,
    netAmount: 16200.00,
    dueDate: '2025-12-05',
    status: 'in_draw',
    submittedDate: '2025-11-18',
    invoiceType: 'standard',
    contractType: 'unit_price',
    description: 'Foundation pilings - 24 units @ $750/ea',
    costCode: '02-Foundation',
    poNumber: 'PO-075',
    drawNumber: 3,
    lienWaiverStatus: 'received',
    paymentTerms: 'Net 30',
    aiConfidence: 0.97,
  },
  {
    id: '10',
    invoiceNumber: 'INV-2025-0820',
    vendorName: 'Jones Plumbing',
    jobName: 'Smith Residence',
    amount: 4200.00,
    taxAmount: 0,
    retainageAmount: 0,
    netAmount: 4200.00,
    dueDate: '2025-12-01',
    status: 'denied',
    submittedDate: '2025-11-12',
    invoiceType: 'standard',
    contractType: 'lump_sum',
    description: 'Extra bathroom rough-in',
    lienWaiverStatus: 'not_required',
    paymentTerms: 'Net 30',
    aiConfidence: 0.72,
    aiNote: 'Denied: No approved change order for additional scope. Vendor notified.',
    isDuplicate: false,
  },
]

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  needs_review: { label: 'Needs Review', color: 'text-sand-700', bgColor: 'bg-sand-100', icon: Eye },
  ready_for_approval: { label: 'Ready for Approval', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: Clock },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  in_draw: { label: 'In Draw', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: Receipt },
  paid: { label: 'Paid', color: 'text-warm-700', bgColor: 'bg-warm-100', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  denied: { label: 'Denied', color: 'text-red-700', bgColor: 'bg-red-100', icon: Ban },
  split: { label: 'Split', color: 'text-warm-700', bgColor: 'bg-warm-100', icon: GitBranch },
  voided: { label: 'Voided', color: 'text-warm-500', bgColor: 'bg-warm-50', icon: XCircle },
}

const invoiceTypeLabels: Record<InvoiceType, { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-warm-100 text-warm-600' },
  progress: { label: 'Progress', color: 'bg-stone-50 text-stone-600' },
  final: { label: 'Final', color: 'bg-green-50 text-green-600' },
  credit_memo: { label: 'Credit Memo', color: 'bg-amber-50 text-amber-600' },
  retainage_release: { label: 'Retainage Release', color: 'bg-warm-50 text-stone-600' },
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
  const typeInfo = invoiceTypeLabels[invoice.invoiceType]
  const isWarning = invoice.aiNote?.includes('Disputed') || invoice.aiNote?.includes('higher') || invoice.aiNote?.includes('Denied') || invoice.aiNote?.includes('over PO')
  const isCreditMemo = invoice.invoiceType === 'credit_memo'

  return (
    <div className="bg-white border border-warm-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-warm-900">{invoice.invoiceNumber}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1", status.bgColor, status.color)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
            {invoice.invoiceType !== 'standard' && (
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", typeInfo.color)}>
                {typeInfo.label}
              </span>
            )}
            {invoice.contractType === 'time_materials' && (
              <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">T&M</span>
            )}
            {invoice.contractType === 'unit_price' && (
              <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">Unit Price</span>
            )}
            {invoice.contractType === 'cost_plus' && (
              <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">Cost Plus</span>
            )}
            {invoice.isAutoCoded && (
              <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="h-2.5 w-2.5" />AI Coded
              </span>
            )}
            {invoice.aiConfidence !== undefined && invoice.aiConfidence < 0.9 && (
              <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                {Math.round(invoice.aiConfidence * 100)}% conf
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-2 text-warm-600">
              <Building2 className="h-4 w-4 text-warm-400" />
              <span>{invoice.vendorName}</span>
            </div>
            <div className="flex items-center gap-2 text-warm-600">
              <Briefcase className="h-4 w-4 text-warm-400" />
              <span>{invoice.jobName}</span>
            </div>
          </div>

          {invoice.description && (
            <p className="text-sm text-warm-500 mt-2">{invoice.description}</p>
          )}

          {/* Cross-module connection badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {invoice.poNumber && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
                invoice.poVariance && invoice.poVariance > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700"
              )}>
                <Link2 className="h-3 w-3" />
                {invoice.poNumber}
                {invoice.poVariance !== undefined && invoice.poVariance !== 0 && (
                  <span className="font-medium">
                    {invoice.poVariance > 0 ? '+' : ''}{formatCurrency(invoice.poVariance)}
                  </span>
                )}
              </span>
            )}
            {invoice.costCode && (
              <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded font-mono">
                {invoice.costCode}
              </span>
            )}
            {invoice.drawNumber && (
              <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                Draw #{invoice.drawNumber}
              </span>
            )}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
              invoice.lienWaiverStatus === 'received' ? "bg-green-50 text-green-600" :
              invoice.lienWaiverStatus === 'pending' ? "bg-amber-50 text-amber-600" :
              invoice.lienWaiverStatus === 'required' ? "bg-red-50 text-red-600" :
              "bg-warm-50 text-warm-500"
            )}>
              <ShieldCheck className="h-3 w-3" />
              LW: {invoice.lienWaiverStatus === 'received' ? 'Received' :
                   invoice.lienWaiverStatus === 'pending' ? 'Pending' :
                   invoice.lienWaiverStatus === 'required' ? 'Required' : 'N/A'}
            </span>
            {invoice.retainageAmount > 0 && (
              <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded">
                Ret: {formatCurrency(invoice.retainageAmount)}
              </span>
            )}
            {invoice.approvalStep && invoice.status !== 'paid' && (
              <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                {invoice.approvalStep}
              </span>
            )}
            <span className="text-xs text-warm-400">{invoice.paymentTerms}</span>
          </div>

          {invoice.aiNote && (
            <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              isWarning ? "bg-amber-50" : "bg-stone-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                isWarning ? "text-amber-500" : "text-stone-500"
              )} />
              <span className={isWarning ? "text-amber-700" : "text-stone-700"}>
                {invoice.aiNote}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className={cn("text-lg font-semibold", isCreditMemo ? "text-green-700" : "text-warm-900")}>
              {isCreditMemo ? '(' + formatCurrency(Math.abs(invoice.amount)) + ')' : formatCurrency(invoice.amount)}
            </div>
            {invoice.retainageAmount > 0 && (
              <div className="text-xs text-warm-500 mt-0.5">
                Net: {formatCurrency(invoice.netAmount)}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm mt-1 justify-end">
              <Calendar className="h-3.5 w-3.5 text-warm-400" />
              <span className="text-warm-500">Due {formatDate(invoice.dueDate)}</span>
              {invoice.status !== 'paid' && invoice.status !== 'voided' && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium",
                  dueInfo.isOverdue ? "bg-red-100 text-red-700" :
                  dueInfo.days <= 7 ? "bg-amber-100 text-amber-700" :
                  "bg-warm-100 text-warm-600"
                )}>
                  {dueInfo.label}
                </span>
              )}
              {invoice.paidDate && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  Paid {formatDate(invoice.paidDate)}
                </span>
              )}
            </div>
            {invoice.paymentMethod && invoice.status === 'paid' && (
              <div className="text-xs text-warm-400 mt-0.5 uppercase">{invoice.paymentMethod}</div>
            )}
          </div>
          <button className="p-1.5 hover:bg-warm-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-warm-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function InvoicesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const vendors = [...new Set(mockInvoices.map(inv => inv.vendorName))]
  const jobs = [...new Set(mockInvoices.map(inv => inv.jobName))]

  const filtered = sortItems(
    mockInvoices.filter(inv => {
      if (!matchesSearch(inv, search, ['invoiceNumber', 'vendorName', 'jobName', 'description', 'costCode', 'poNumber'])) return false
      if (activeTab !== 'all' && inv.status !== activeTab) return false
      if (vendorFilter !== 'all' && inv.vendorName !== vendorFilter) return false
      if (jobFilter !== 'all' && inv.jobName !== jobFilter) return false
      if (typeFilter !== 'all' && inv.invoiceType !== typeFilter) return false
      return true
    }),
    activeSort as keyof Invoice | '',
    sortDirection,
  )

  // Calculate quick stats
  const pendingReview = mockInvoices.filter(inv =>
    inv.status === 'needs_review' || inv.status === 'ready_for_approval'
  )
  const pendingApproval = pendingReview.reduce((sum, inv) => sum + inv.amount, 0)
  const pendingCount = pendingReview.length

  const approvedAwaitingPayment = mockInvoices.filter(inv =>
    inv.status === 'approved'
  ).reduce((sum, inv) => sum + inv.netAmount, 0)

  const dueThisWeek = mockInvoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'voided') return false
    const dueInfo = getDaysUntilDue(inv.dueDate)
    return dueInfo.days <= 7 && !dueInfo.isOverdue
  }).reduce((sum, inv) => sum + inv.amount, 0)

  const overdueAmount = mockInvoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'voided') return false
    const dueInfo = getDaysUntilDue(inv.dueDate)
    return dueInfo.isOverdue
  }).reduce((sum, inv) => sum + inv.amount, 0)

  const totalRetainage = mockInvoices
    .filter(inv => inv.status !== 'voided' && inv.status !== 'denied')
    .reduce((sum, inv) => sum + inv.retainageAmount, 0)

  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  // Active statuses for tabs (exclude rare states from tabs but keep in filter)
  const tabStatuses: InvoiceStatus[] = ['needs_review', 'ready_for_approval', 'approved', 'in_draw', 'paid', 'disputed', 'denied']

  // AI Features for Invoices
  const aiFeatures = [
    {
      feature: 'Auto-Coding',
      trigger: 'On submission',
      insight: 'AI matches invoices to cost codes and POs based on vendor history, descriptions, and job context.',
      severity: 'info' as const,
      confidence: 94,
      detail: '7 of 10 invoices were auto-coded with 95%+ confidence. 2 require manual review due to new cost codes.',
    },
    {
      feature: 'Duplicate Detection',
      trigger: 'Real-time',
      insight: 'Flags potential duplicate invoices by analyzing invoice numbers, amounts, dates, and vendor patterns.',
      severity: 'warning' as const,
      confidence: 89,
      action: {
        label: 'Review Flagged',
        onClick: () => {},
      },
    },
    {
      feature: 'PO Variance Alert',
      trigger: 'On submission',
      insight: 'Highlights invoices exceeding PO amounts. INV-0847 is $920 over PO-089, INV-0838 is $2,100 over PO-081.',
      severity: 'warning' as const,
      confidence: 98,
      action: {
        label: 'View Variances',
        onClick: () => {},
      },
    },
    {
      feature: 'Approval Routing',
      trigger: 'On creation',
      insight: 'Suggests approval path based on invoice amount and type. Invoices >$25K route to Owner, $10K-$25K to PM.',
      severity: 'info' as const,
      confidence: 96,
      detail: 'Current queue: 2 invoices pending PM review, 1 pending Owner approval (Wilson Custom $32.1K).',
    },
    {
      feature: 'Payment Optimization',
      trigger: 'Daily',
      insight: 'Suggests batch payments for early payment discounts. Pay Jones Plumbing by Dec 8 to save $175 (2% discount).',
      severity: 'success' as const,
      confidence: 92,
      action: {
        label: 'View Recommendations',
        onClick: () => {},
      },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Invoices</h3>
              <span className="text-sm text-warm-500">{mockInvoices.length} invoices | {formatCurrency(totalAmount)} total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-sand-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sand-600 text-xs font-medium">
              <Eye className="h-3.5 w-3.5" />
              Pending Review ({pendingCount})
            </div>
            <div className="text-lg font-bold text-sand-700 mt-1">{formatCurrency(pendingApproval)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
              <CheckCircle className="h-3.5 w-3.5" />
              Approved / Payable
            </div>
            <div className="text-lg font-bold text-green-700 mt-1">{formatCurrency(approvedAwaitingPayment)}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-xs font-medium">
              <Calendar className="h-3.5 w-3.5" />
              Due This Week
            </div>
            <div className="text-lg font-bold text-stone-700 mt-1">{formatCurrency(dueThisWeek)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            overdueAmount > 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs font-medium",
              overdueAmount > 0 ? "text-red-600" : "text-green-600"
            )}>
              {overdueAmount > 0 ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Overdue
            </div>
            <div className={cn(
              "text-lg font-bold mt-1",
              overdueAmount > 0 ? "text-red-700" : "text-green-700"
            )}>
              {overdueAmount > 0 ? formatCurrency(overdueAmount) : '$0'}
            </div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-xs font-medium">
              <Scale className="h-3.5 w-3.5" />
              Retainage Held
            </div>
            <div className="text-lg font-bold text-warm-700 mt-1">{formatCurrency(totalRetainage)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoices, POs, cost codes..."
          tabs={[
            { key: 'all', label: 'All', count: mockInvoices.length },
            ...tabStatuses
              .filter(key => mockInvoices.some(inv => inv.status === key))
              .map(key => ({
                key,
                label: statusConfig[key].label,
                count: mockInvoices.filter(inv => inv.status === key).length,
              })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Vendors',
              value: vendorFilter,
              options: vendors.map(v => ({ value: v, label: v })),
              onChange: setVendorFilter,
            },
            {
              label: 'All Jobs',
              value: jobFilter,
              options: jobs.map(j => ({ value: j, label: j })),
              onChange: setJobFilter,
            },
            {
              label: 'All Types',
              value: typeFilter,
              options: Object.entries(invoiceTypeLabels).map(([key, val]) => ({ value: key, label: val.label })),
              onChange: setTypeFilter,
            },
          ]}
          sortOptions={[
            { value: 'amount', label: 'Amount' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'submittedDate', label: 'Submitted' },
            { value: 'vendorName', label: 'Vendor' },
            { value: 'jobName', label: 'Job' },
            { value: 'invoiceType', label: 'Type' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Upload, label: 'Upload PDF', onClick: () => {} },
            { icon: Plus, label: 'Add Invoice', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filtered.length}
          totalCount={mockInvoices.length}
        />
      </div>

      {/* Invoice List */}
      <div className="p-4 space-y-3 max-h-[32rem] overflow-y-auto">
        {filtered.map(invoice => (
          <InvoiceRow key={invoice.id} invoice={invoice} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No invoices match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Payment Optimization:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Pay Jones Plumbing by Dec 8 to capture $175 early payment discount (2/10 Net 30).
              ABC Lumber INV-0847 is $920 over PO-089 -- verify change order or update PO before approval.
            </p>
            <p>
              Consolidating 3 Smith Residence invoices into Draw #4 would align with lender submission deadline.
              Cool Air HVAC dispute pending 17 days -- escalation recommended.
              Credit memo from ABC Lumber reduces PO-089 net exposure by $2,400.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="Invoice AI Features"
          features={aiFeatures}
          columns={2}
        />
      </div>
    </div>
  )
}
