'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  MoreHorizontal,
  Package,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Inbox,
  Truck,
  Receipt,
  ShieldAlert,
  Link2,
  GitBranch,
  Layers,
  BarChart3,
  XCircle,
  ShieldCheck,
  CircleDot,
  AlertCircle,
  Gauge,
  ExternalLink,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeatureCard, AIFeaturesPanel } from '@/components/skeleton/ui'

interface PurchaseOrder {
  id: string
  poNumber: string
  vendorName: string
  jobName: string
  // Amounts
  subtotal: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  invoicedAmount: number
  remainingAmount: number
  // PO metadata
  poType: 'standard' | 'blanket' | 'emergency'
  costCode: string
  paymentTerms: string
  itemsCount: number
  // Dates
  issueDate: string
  requiredByDate?: string
  expectedDelivery?: string
  // Status & workflow
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'acknowledged' | 'partial_delivery' | 'fully_received' | 'invoiced' | 'closed' | 'cancelled'
  approvalProgress?: { completed: number; total: number; currentApprover?: string }
  versionNumber: number
  // Receiving
  receivedPct: number
  backorderedItems: number
  // Tracking
  trackingNumber?: string
  carrier?: 'ups' | 'fedex' | 'usps' | 'freight'
  // Three-way match
  threeWayMatchStatus?: 'full_match' | 'partial_match' | 'variance' | 'pending'
  varianceAmount?: number
  variancePct?: number
  // Emergency
  isEmergency: boolean
  emergencyReason?: string
  // Blanket
  blanketLimit?: number
  blanketUsed?: number
  // Cross-module links
  changeOrderId?: string
  changeOrderNumber?: string
  bidId?: string
  bidReference?: string
  selectionId?: string
  selectionName?: string
  // AI
  aiNote?: string
  aiPriceAssessment?: string
}

const carrierLinks: Record<string, (tracking: string) => string> = {
  ups: (t) => `https://www.ups.com/track?tracknum=${t}`,
  fedex: (t) => `https://www.fedex.com/fedextrack/?trknbr=${t}`,
  usps: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
  freight: (t) => `#`, // Generic freight - no link
}

const carrierNames: Record<string, string> = {
  ups: 'UPS',
  fedex: 'FedEx',
  usps: 'USPS',
  freight: 'Freight',
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2026-0142',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Smith Residence',
    subtotal: 23200,
    taxAmount: 1160,
    shippingAmount: 140,
    totalAmount: 24500,
    invoicedAmount: 0,
    remainingAmount: 24500,
    poType: 'standard',
    costCode: '06 - Carpentry',
    paymentTerms: 'Net 30',
    itemsCount: 12,
    issueDate: '2026-01-08',
    requiredByDate: '2026-01-20',
    expectedDelivery: '2026-01-15',
    status: 'acknowledged',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: false,
    trackingNumber: '1Z999AA10123456784',
    carrier: 'ups',
    aiPriceAssessment: 'Within market range (+2.1%)',
  },
  {
    id: '2',
    poNumber: 'PO-2026-0141',
    vendorName: 'PGT Industries',
    jobName: 'Smith Residence',
    subtotal: 42500,
    taxAmount: 2125,
    shippingAmount: 375,
    totalAmount: 45000,
    invoicedAmount: 0,
    remainingAmount: 45000,
    poType: 'standard',
    costCode: '08 - Doors & Windows',
    paymentTerms: 'Net 45',
    itemsCount: 24,
    issueDate: '2026-01-06',
    requiredByDate: '2026-02-15',
    expectedDelivery: '2026-02-20',
    status: 'acknowledged',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: false,
    selectionId: 'sel-012',
    selectionName: 'Impact Windows',
    aiNote: 'Lead time 6+ weeks. Order for Johnson job by Jan 20 or framing schedule slips.',
    aiPriceAssessment: 'Negotiated rate, 5% below list',
  },
  {
    id: '3',
    poNumber: 'PO-2026-0140',
    vendorName: 'Custom Cabinet Co',
    jobName: 'Johnson Beach House',
    subtotal: 17800,
    taxAmount: 0,
    shippingAmount: 700,
    totalAmount: 18500,
    invoicedAmount: 0,
    remainingAmount: 18500,
    poType: 'standard',
    costCode: '06 - Carpentry',
    paymentTerms: '50% deposit, balance on delivery',
    itemsCount: 8,
    issueDate: '2026-01-05',
    status: 'sent',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: false,
    selectionId: 'sel-028',
    selectionName: 'Kitchen Cabinets',
    aiNote: 'No vendor acknowledgment in 3 days. Follow up recommended. This vendor avg 1.2 day response.',
  },
  {
    id: '4',
    poNumber: 'PO-2026-0139',
    vendorName: 'Sherwin-Williams',
    jobName: 'Miller Addition',
    subtotal: 2900,
    taxAmount: 203,
    shippingAmount: 97,
    totalAmount: 3200,
    invoicedAmount: 3200,
    remainingAmount: 0,
    poType: 'standard',
    costCode: '09 - Finishes',
    paymentTerms: 'Net 30',
    itemsCount: 6,
    issueDate: '2026-01-04',
    status: 'invoiced',
    versionNumber: 1,
    receivedPct: 100,
    backorderedItems: 0,
    threeWayMatchStatus: 'full_match',
    isEmergency: false,
    aiPriceAssessment: 'At contract rate',
  },
  {
    id: '5',
    poNumber: 'PO-2026-0138',
    vendorName: 'Jones Plumbing Supply',
    jobName: 'Smith Residence',
    subtotal: 11900,
    taxAmount: 595,
    shippingAmount: 305,
    totalAmount: 12800,
    invoicedAmount: 13100,
    remainingAmount: -300,
    poType: 'standard',
    costCode: '15 - Plumbing',
    paymentTerms: 'Net 30',
    itemsCount: 15,
    issueDate: '2026-01-02',
    status: 'invoiced',
    versionNumber: 1,
    receivedPct: 100,
    backorderedItems: 0,
    threeWayMatchStatus: 'variance',
    varianceAmount: 300,
    variancePct: 2.3,
    isEmergency: false,
    aiNote: 'Invoice $300 over PO (2.3%). Within auto-approve tolerance (2%). Auto-approved with audit log.',
  },
  {
    id: '6',
    poNumber: 'PO-2026-0143',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Wilson Custom Home',
    subtotal: 8100,
    taxAmount: 400,
    shippingAmount: 0,
    totalAmount: 8500,
    invoicedAmount: 0,
    remainingAmount: 8500,
    poType: 'standard',
    costCode: '06 - Carpentry',
    paymentTerms: 'Net 30',
    itemsCount: 5,
    issueDate: '2026-01-09',
    status: 'draft',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: false,
    aiNote: 'Consolidation opportunity: Combine with PO-0142 (ABC Lumber, same materials). Est. savings: $850 (volume discount).',
    aiPriceAssessment: '8% above your avg. for framing lumber',
  },
  {
    id: '7',
    poNumber: 'PO-2026-0137',
    vendorName: 'Cool Air HVAC',
    jobName: 'Johnson Beach House',
    subtotal: 26500,
    taxAmount: 0,
    shippingAmount: 1500,
    totalAmount: 28000,
    invoicedAmount: 14000,
    remainingAmount: 14000,
    poType: 'standard',
    costCode: '23 - HVAC',
    paymentTerms: 'Net 30',
    itemsCount: 4,
    issueDate: '2025-12-30',
    expectedDelivery: '2026-01-10',
    status: 'partial_delivery',
    versionNumber: 1,
    receivedPct: 50,
    backorderedItems: 2,
    threeWayMatchStatus: 'partial_match',
    isEmergency: false,
    changeOrderId: 'co-002',
    changeOrderNumber: 'CO-002',
    trackingNumber: '794644790132',
    carrier: 'fedex',
    aiNote: '2 items backordered: condensing unit (ETA Jan 25) and handler (ETA Feb 3). Schedule task "HVAC Install" may slip.',
  },
  {
    id: '8',
    poNumber: 'PO-2026-0136',
    vendorName: 'Smith Electric Supply',
    jobName: 'Miller Addition',
    subtotal: 8700,
    taxAmount: 435,
    shippingAmount: 65,
    totalAmount: 9200,
    invoicedAmount: 9200,
    remainingAmount: 0,
    poType: 'standard',
    costCode: '16 - Electrical',
    paymentTerms: '2/10 Net 30',
    itemsCount: 22,
    issueDate: '2025-12-28',
    status: 'closed',
    versionNumber: 1,
    receivedPct: 100,
    backorderedItems: 0,
    threeWayMatchStatus: 'full_match',
    isEmergency: false,
    aiPriceAssessment: 'Early pay discount captured: $184 savings',
  },
  {
    id: '9',
    poNumber: 'PO-2026-0144',
    vendorName: 'Coastal Concrete',
    jobName: 'Smith Residence',
    subtotal: 6800,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: 6800,
    invoicedAmount: 0,
    remainingAmount: 6800,
    poType: 'emergency',
    costCode: '03 - Concrete',
    paymentTerms: 'Due on Delivery',
    itemsCount: 3,
    issueDate: '2026-01-12',
    status: 'approved',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: true,
    emergencyReason: 'Foundation pour scheduled tomorrow, original supplier cancelled delivery',
    changeOrderId: 'co-002',
    changeOrderNumber: 'CO-002',
    aiNote: 'Emergency PO bypassed normal approval. After-the-fact review required by owner within 48 hours.',
  },
  {
    id: '10',
    poNumber: 'PO-2026-BPO-001',
    vendorName: 'ABC Lumber Supply',
    jobName: 'All Projects',
    subtotal: 0,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: 0,
    invoicedAmount: 28500,
    remainingAmount: 21500,
    poType: 'blanket',
    costCode: '06 - Carpentry',
    paymentTerms: 'Net 30',
    itemsCount: 0,
    issueDate: '2026-01-01',
    status: 'approved',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: false,
    blanketLimit: 50000,
    blanketUsed: 28500,
    aiNote: 'Blanket PO 57% utilized. 3 releases issued. At current rate, limit reached by mid-March.',
  },
  {
    id: '11',
    poNumber: 'PO-2026-0145',
    vendorName: 'Home Depot Pro',
    jobName: 'Miller Addition',
    subtotal: 4200,
    taxAmount: 294,
    shippingAmount: 0,
    totalAmount: 4494,
    invoicedAmount: 0,
    remainingAmount: 4494,
    poType: 'standard',
    costCode: '04 - Framing',
    paymentTerms: 'Net 30',
    itemsCount: 8,
    issueDate: '2026-01-10',
    status: 'pending_approval',
    versionNumber: 1,
    receivedPct: 0,
    backorderedItems: 0,
    isEmergency: false,
    approvalProgress: { completed: 1, total: 3, currentApprover: 'Mike Johnson (PM)' },
    aiNote: 'Approving this PO will consume 85% of 04-Framing budget. $2,340 remaining.',
  },
  {
    id: '12',
    poNumber: 'PO-2026-0146',
    vendorName: 'Coastal Roofing Supply',
    jobName: 'Johnson Beach House',
    subtotal: 15200,
    taxAmount: 1064,
    shippingAmount: 350,
    totalAmount: 16614,
    invoicedAmount: 16614,
    remainingAmount: 0,
    poType: 'standard',
    costCode: '07 - Roofing',
    paymentTerms: 'Net 30',
    itemsCount: 14,
    issueDate: '2025-12-20',
    status: 'fully_received',
    versionNumber: 1,
    receivedPct: 100,
    backorderedItems: 0,
    threeWayMatchStatus: 'full_match',
    isEmergency: false,
    trackingNumber: 'PRO-2026-88541',
    carrier: 'freight',
    aiPriceAssessment: 'Competitive pricing, 3% below market avg',
  },
]

const statusConfig: Record<PurchaseOrder['status'], { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-700', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-stone-100 text-stone-700', icon: CheckCircle2 },
  sent: { label: 'Sent', color: 'bg-stone-100 text-stone-700', icon: Send },
  acknowledged: { label: 'Acknowledged', color: 'bg-warm-100 text-warm-700', icon: Inbox },
  partial_delivery: { label: 'Partial Delivery', color: 'bg-sand-100 text-sand-700', icon: Package },
  fully_received: { label: 'Fully Received', color: 'bg-emerald-100 text-emerald-700', icon: Truck },
  invoiced: { label: 'Invoiced', color: 'bg-stone-100 text-stone-700', icon: Receipt },
  closed: { label: 'Closed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const poTypeConfig: Record<PurchaseOrder['poType'], { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-warm-50 text-warm-600' },
  blanket: { label: 'Blanket', color: 'bg-stone-50 text-stone-600' },
  emergency: { label: 'Emergency', color: 'bg-red-50 text-red-600' },
}

const matchStatusConfig: Record<string, { label: string; color: string }> = {
  full_match: { label: 'Matched', color: 'text-green-600' },
  partial_match: { label: 'Partial', color: 'text-amber-600' },
  variance: { label: 'Variance', color: 'text-red-600' },
  pending: { label: 'Pending', color: 'text-warm-500' },
}

const vendors = [...new Set(mockPurchaseOrders.map(po => po.vendorName))]
const jobs = [...new Set(mockPurchaseOrders.map(po => po.jobName))]
const poTypes: PurchaseOrder['poType'][] = ['standard', 'blanket', 'emergency']

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1000000) return '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return '$' + (absValue / 1000).toFixed(1) + 'K'
  return '$' + absValue.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function POCard({ po }: { po: PurchaseOrder }) {
  const config = statusConfig[po.status]
  const typeInfo = poTypeConfig[po.poType]
  const StatusIcon = config.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border border-warm-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      po.isEmergency && "border-l-4 border-l-red-400",
      po.poType === 'blanket' && "border-l-4 border-l-stone-400",
      po.status === 'cancelled' && "opacity-60",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-warm-900">{po.poNumber}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", config.color)}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
            {po.poType !== 'standard' && (
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", typeInfo.color)}>
                {po.poType === 'emergency' && <ShieldAlert className="h-3 w-3 inline mr-0.5" />}
                {typeInfo.label}
              </span>
            )}
            {po.versionNumber > 1 && (
              <span className="text-xs bg-warm-100 text-warm-500 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                <GitBranch className="h-3 w-3" />
                v{po.versionNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-warm-500">
            <Building2 className="h-3.5 w-3.5" />
            <span>{po.vendorName}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Job & Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-warm-600">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{po.jobName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-warm-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(po.issueDate)}</span>
          </div>
          {po.itemsCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span>{po.itemsCount} items</span>
            </div>
          )}
          <span className="text-xs text-warm-400">{po.paymentTerms}</span>
        </div>
        {po.expectedDelivery && po.status !== 'fully_received' && po.status !== 'invoiced' && po.status !== 'closed' && (
          <div className="flex items-center gap-1.5 text-sm text-warm-600">
            <Truck className="h-3.5 w-3.5" />
            <span>Expected: {formatDate(po.expectedDelivery)}</span>
            {po.requiredByDate && (
              <span className="text-xs text-warm-400">(Need by: {formatDate(po.requiredByDate)})</span>
            )}
          </div>
        )}
        {/* Tracking number display */}
        {po.trackingNumber && po.carrier && (
          <div className="flex items-center gap-1.5 text-sm text-warm-600">
            <Truck className="h-3.5 w-3.5" />
            <span className="text-xs text-warm-500">{carrierNames[po.carrier]}:</span>
            <span className="text-xs font-mono text-warm-700">{po.trackingNumber}</span>
            {po.carrier !== 'freight' && (
              <a
                href={carrierLinks[po.carrier](po.trackingNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                Track Shipment
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Approval progress for pending_approval status */}
      {po.status === 'pending_approval' && po.approvalProgress && (
        <div className="mb-3 p-2 bg-amber-50 rounded">
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Approval Progress
            </span>
            <span>{po.approvalProgress.completed}/{po.approvalProgress.total}</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-amber-500 transition-all"
              style={{ width: `${(po.approvalProgress.completed / po.approvalProgress.total) * 100}%` }}
            />
          </div>
          {po.approvalProgress.currentApprover && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
              <User className="h-3 w-3" />
              <span>Current: {po.approvalProgress.currentApprover}</span>
            </div>
          )}
        </div>
      )}

      {/* Receiving progress for partial/received */}
      {(po.status === 'partial_delivery' || po.status === 'fully_received') && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
            <span>Received</span>
            <span>{po.receivedPct}%{po.backorderedItems > 0 && ` (${po.backorderedItems} backordered)`}</span>
          </div>
          <div className="w-full bg-warm-200 rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                po.receivedPct === 100 ? "bg-green-500" : "bg-amber-500"
              )}
              style={{ width: `${po.receivedPct}%` }}
            />
          </div>
          {po.backorderedItems > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>{po.backorderedItems} items on backorder</span>
            </div>
          )}
        </div>
      )}

      {/* Blanket PO gauge */}
      {po.poType === 'blanket' && po.blanketLimit && po.blanketUsed !== undefined && (
        <div className="mb-3 p-2 bg-stone-50 rounded">
          <div className="flex items-center justify-between text-xs text-stone-700 mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              Blanket Usage
            </span>
            <span>{formatCurrency(po.blanketUsed)} / {formatCurrency(po.blanketLimit)}</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                (po.blanketUsed / po.blanketLimit) > 0.8 ? "bg-red-500" :
                (po.blanketUsed / po.blanketLimit) > 0.6 ? "bg-amber-500" : "bg-stone-500"
              )}
              style={{ width: `${Math.min((po.blanketUsed / po.blanketLimit) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-stone-600 mt-1">
            {formatCurrency(po.blanketLimit - po.blanketUsed)} remaining
          </div>
        </div>
      )}

      {/* Emergency reason */}
      {po.isEmergency && po.emergencyReason && (
        <div className="mb-3 p-2 bg-red-50 rounded flex items-start gap-2 text-xs">
          <ShieldAlert className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-red-700">{po.emergencyReason}</span>
        </div>
      )}

      {/* Amount section */}
      <div className="flex items-center justify-between pt-3 border-t border-warm-100">
        <div>
          <div className="flex items-center gap-1.5 text-lg font-semibold text-warm-900">
            <DollarSign className="h-4 w-4 text-warm-500" />
            {formatCurrency(po.totalAmount)}
          </div>
          {po.invoicedAmount > 0 && (
            <div className="text-xs text-warm-500">
              Invoiced: {formatCurrency(po.invoicedAmount)}
              {po.remainingAmount > 0 && ` | Remaining: ${formatCurrency(po.remainingAmount)}`}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {po.threeWayMatchStatus && (
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              matchStatusConfig[po.threeWayMatchStatus].color
            )}>
              <CircleDot className="h-3 w-3" />
              {matchStatusConfig[po.threeWayMatchStatus].label}
              {po.variancePct !== undefined && po.variancePct > 0 && (
                <span className="text-red-500 ml-0.5">(+{po.variancePct}%)</span>
              )}
            </span>
          )}
          {po.status === 'draft' && (
            <button className="text-xs text-stone-600 font-medium hover:text-stone-700 flex items-center gap-1">
              <Send className="h-3 w-3" />
              Submit
            </button>
          )}
          {po.status === 'approved' && !po.isEmergency && (
            <button className="text-xs text-stone-600 font-medium hover:text-stone-700 flex items-center gap-1">
              <Send className="h-3 w-3" />
              Send to Vendor
            </button>
          )}
        </div>
      </div>

      {/* Cross-module badges */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="text-xs bg-warm-50 text-warm-600 px-1.5 py-0.5 rounded">{po.costCode}</span>
        {po.changeOrderNumber && (
          <span className="text-xs bg-warm-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <Link2 className="h-3 w-3" />
            {po.changeOrderNumber}
          </span>
        )}
        {po.bidReference && (
          <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <FileText className="h-3 w-3" />
            {po.bidReference}
          </span>
        )}
        {po.selectionName && (
          <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <Layers className="h-3 w-3" />
            {po.selectionName}
          </span>
        )}
        {po.aiPriceAssessment && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded inline-flex items-center gap-0.5",
            po.aiPriceAssessment.includes('above') ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
          )}>
            <BarChart3 className="h-3 w-3" />
            {po.aiPriceAssessment}
          </span>
        )}
      </div>

      {/* AI Note */}
      {po.aiNote && (
        <div className="mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{po.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function PurchaseOrdersPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = sortItems(
    mockPurchaseOrders.filter(po => {
      if (!matchesSearch(po, search, ['poNumber', 'vendorName', 'jobName', 'costCode'])) return false
      if (activeTab !== 'all' && po.status !== activeTab) return false
      if (vendorFilter !== 'all' && po.vendorName !== vendorFilter) return false
      if (jobFilter !== 'all' && po.jobName !== jobFilter) return false
      if (typeFilter !== 'all' && po.poType !== typeFilter) return false
      return true
    }),
    activeSort as keyof PurchaseOrder | '',
    sortDirection,
  )

  // Calculate stats
  const activePOs = mockPurchaseOrders.filter(po => po.status !== 'draft' && po.status !== 'cancelled' && po.status !== 'closed')
  const totalCommitted = activePOs.reduce((sum, po) => sum + po.totalAmount, 0)
  const pendingDelivery = mockPurchaseOrders.filter(po =>
    po.status === 'sent' || po.status === 'acknowledged' || po.status === 'approved'
  )
  const pendingDeliveryAmount = pendingDelivery.reduce((sum, po) => sum + po.totalAmount, 0)
  const totalInvoiced = mockPurchaseOrders.reduce((sum, po) => sum + po.invoicedAmount, 0)
  const backorderedTotal = mockPurchaseOrders.reduce((sum, po) => sum + po.backorderedItems, 0)
  const matchedCount = mockPurchaseOrders.filter(po => po.threeWayMatchStatus === 'full_match').length
  const varianceCount = mockPurchaseOrders.filter(po => po.threeWayMatchStatus === 'variance').length
  const emergencyCount = mockPurchaseOrders.filter(po => po.isEmergency).length

  // Budget context
  const projectBudget = 2450000
  const commitmentPct = ((totalCommitted / projectBudget) * 100).toFixed(1)

  // AI Features for the panel
  const aiFeatures = [
    {
      feature: 'Budget Impact Analysis',
      trigger: 'On submission',
      insight: 'Approving this PO will consume 85% of 04-Framing budget. $2,340 remaining.',
      severity: 'warning' as const,
      confidence: 95,
      action: {
        label: 'View Budget',
        onClick: () => {},
      },
    },
    {
      feature: 'Vendor Recommendation',
      trigger: 'On creation',
      insight: '3 vendors quoted this material. ABC Lumber: $4,200 (selected), XYZ Supply: $4,450, Coastal: $3,980 (new vendor, no rating)',
      severity: 'info' as const,
      confidence: 88,
      detail: 'ABC Lumber has 98% on-time delivery rate and established credit terms. Coastal offers lowest price but has no performance history.',
    },
    {
      feature: 'Price Intelligence Check',
      trigger: 'Real-time',
      insight: 'Material costs 8% above 6-month average. Lumber prices trending up - consider locking price.',
      severity: 'warning' as const,
      confidence: 92,
      action: {
        label: 'View Trends',
        onClick: () => {},
      },
    },
    {
      feature: 'Material Substitution',
      trigger: 'On change',
      insight: 'DeWalt DW735 unavailable. Alternatives: Makita 2012NB (same price), DeWalt DW734 ($50 less, lighter duty)',
      severity: 'info' as const,
      confidence: 85,
      action: {
        label: 'Compare Options',
        onClick: () => {},
      },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-warm-900">Purchase Orders</h3>
            <span className="text-sm text-warm-500">{mockPurchaseOrders.length} total</span>
            {emergencyCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded inline-flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {emergencyCount} emergency
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-warm-500">
          Committed: {formatCurrency(totalCommitted)} of {formatCurrency(projectBudget)} budget ({commitmentPct}%)
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Total Committed
            </div>
            <div className="text-lg font-bold text-stone-700 mt-1">{formatCurrency(totalCommitted)}</div>
            <div className="text-xs text-stone-500">{activePOs.length} active POs</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-xs">
              <Truck className="h-3.5 w-3.5" />
              Pending Delivery
            </div>
            <div className="text-lg font-bold text-amber-700 mt-1">{formatCurrency(pendingDeliveryAmount)}</div>
            <div className="text-xs text-amber-500">{pendingDelivery.length} awaiting</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-xs">
              <Receipt className="h-3.5 w-3.5" />
              Total Invoiced
            </div>
            <div className="text-lg font-bold text-stone-700 mt-1">{formatCurrency(totalInvoiced)}</div>
            <div className="text-xs text-stone-600">{matchedCount} matched, {varianceCount} variance</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            backorderedTotal > 0 ? "bg-sand-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              backorderedTotal > 0 ? "text-sand-600" : "text-warm-500"
            )}>
              <AlertCircle className="h-3.5 w-3.5" />
              Backordered
            </div>
            <div className={cn(
              "text-lg font-bold mt-1",
              backorderedTotal > 0 ? "text-sand-700" : "text-warm-900"
            )}>
              {backorderedTotal} items
            </div>
            <div className="text-xs text-warm-400">across {mockPurchaseOrders.filter(po => po.backorderedItems > 0).length} POs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              3-Way Match
            </div>
            <div className="text-lg font-bold text-green-700 mt-1">{matchedCount}/{matchedCount + varianceCount}</div>
            <div className="text-xs text-green-500">fully matched</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search POs by number, vendor, job, cost code..."
          tabs={[
            { key: 'all', label: 'All', count: mockPurchaseOrders.length },
            { key: 'draft', label: 'Draft', count: mockPurchaseOrders.filter(po => po.status === 'draft').length },
            { key: 'pending_approval', label: 'Pending', count: mockPurchaseOrders.filter(po => po.status === 'pending_approval').length },
            { key: 'sent', label: 'Sent', count: mockPurchaseOrders.filter(po => po.status === 'sent').length },
            { key: 'acknowledged', label: 'Ack\'d', count: mockPurchaseOrders.filter(po => po.status === 'acknowledged').length },
            { key: 'partial_delivery', label: 'Partial', count: mockPurchaseOrders.filter(po => po.status === 'partial_delivery').length },
            { key: 'fully_received', label: 'Received', count: mockPurchaseOrders.filter(po => po.status === 'fully_received').length },
            { key: 'invoiced', label: 'Invoiced', count: mockPurchaseOrders.filter(po => po.status === 'invoiced').length },
            { key: 'closed', label: 'Closed', count: mockPurchaseOrders.filter(po => po.status === 'closed').length },
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
              options: poTypes.map(t => ({ value: t, label: poTypeConfig[t].label })),
              onChange: setTypeFilter,
            },
          ]}
          sortOptions={[
            { value: 'totalAmount', label: 'Amount' },
            { value: 'issueDate', label: 'Issue Date' },
            { value: 'expectedDelivery', label: 'Delivery Date' },
            { value: 'vendorName', label: 'Vendor' },
            { value: 'jobName', label: 'Job' },
            { value: 'costCode', label: 'Cost Code' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'New PO', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filtered.length}
          totalCount={mockPurchaseOrders.length}
        />
      </div>

      {/* PO List */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[520px] overflow-y-auto">
        {filtered.map(po => (
          <POCard key={po.id} po={po} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-warm-500">
            <Package className="h-12 w-12 mx-auto text-warm-300 mb-3" />
            <p>No purchase orders match your filters</p>
          </div>
        )}
      </div>

      {/* AI Features Panel */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="Procurement AI Insights"
          features={aiFeatures}
          columns={2}
        />
      </div>
    </div>
  )
}
