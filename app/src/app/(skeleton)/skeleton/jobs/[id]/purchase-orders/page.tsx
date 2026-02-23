'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PurchaseOrdersPreview } from '@/components/skeleton/previews/purchase-orders-preview'
import { cn } from '@/lib/utils'

export default function JobPurchaseOrdersPage() {
  
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <PurchaseOrdersPreview />
      ) : (
        <PageSpec
      title="Job Purchase Orders"
      phase="Phase 0 - Foundation"
      planFile="docs/modules/18-purchase-orders.md"
      description="End-to-end purchase order lifecycle for this job. POs created manually, from bid awards, change orders, budget lines, or schedule-driven procurement. Supports delivery tracking, three-way matching (PO to receipt to invoice), backorder management, blanket POs, emergency procurement, and PO amendments. Committed costs feed budget forecasting and cash flow projections."
      workflow={['Create PO', 'Approve (Threshold)', 'Send to Vendor', 'Vendor Acknowledges', 'Track Delivery', 'Receive & Inspect', '3-Way Match', 'Close']}
      features={[
        'Filterable PO list with all 10 statuses (draft through closed/cancelled)',
        'PO creation from budget line, bid award, change order, or schedule alert',
        'Line item editor with cost code picker, quantity, unit price, tax rate',
        'Configurable approval workflow with dollar thresholds',
        'Emergency PO bypass with reason and after-the-fact review',
        'Email/portal PO delivery to vendors',
        'Vendor acknowledgment tracking',
        'Mobile-friendly receiving form with photo capture',
        'Partial receipt and backorder management',
        'Damaged item reporting with auto-vendor notification',
        'Three-way matching: PO vs receipt vs invoice',
        'Configurable variance tolerance (auto-approve under threshold)',
        'PO amendments with version history',
        'Blanket PO with release tracking and usage gauge',
        'Budget impact preview before approval',
        'Cost code assignment and budget commitment tracking',
        'Tracking number and carrier link',
        'Selection-linked line items from catalog',
        'Cross-project procurement aggregation alerts',
        'Schedule-driven lead time alerts',
        'Payment term optimization (early-pay discount)',
        'Material substitution workflow',
        'PDF generation with builder branding',
      ]}
      connections={[
        { name: 'Budget', type: 'bidirectional', description: 'Committed cost tracking, budget impact on approval' },
        { name: 'Vendors', type: 'input', description: 'Vendor directory, payment terms, rate sheets' },
        { name: 'Vendor Portal', type: 'output', description: 'Vendor views/acknowledges POs' },
        { name: 'Deliveries', type: 'output', description: 'Delivery tracking from POs' },
        { name: 'Invoices', type: 'bidirectional', description: 'Three-way matching (PO-receipt-invoice)' },
        { name: 'Selections', type: 'input', description: 'PO line items reference catalog selections' },
        { name: 'Change Orders', type: 'input', description: 'CO-triggered PO creation' },
        { name: 'Bids', type: 'input', description: 'PO auto-generated from bid award' },
        { name: 'Schedule', type: 'input', description: 'Lead time alerts, delivery impact on schedule' },
        { name: 'QuickBooks', type: 'output', description: 'Sync POs as Bills to accounting' },
        { name: 'Notifications', type: 'output', description: 'Approval alerts, delivery reminders' },
        { name: 'Price Intelligence', type: 'bidirectional', description: 'PO costs update pricing database' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant isolation' },
        { name: 'project_id', type: 'uuid', required: true, description: 'This project' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'FK to vendors' },
        { name: 'po_number', type: 'string', required: true, description: 'Formatted per builder template' },
        { name: 'status', type: 'string', required: true, description: 'draft | pending_approval | approved | sent | acknowledged | partial_delivery | fully_received | invoiced | closed | cancelled' },
        { name: 'po_type', type: 'string', required: true, description: 'standard | blanket | emergency' },
        { name: 'issue_date', type: 'date', description: 'Date PO issued' },
        { name: 'required_by_date', type: 'date', description: 'Date materials needed' },
        { name: 'expected_delivery_date', type: 'date', description: 'Vendor-confirmed delivery' },
        { name: 'subtotal', type: 'decimal', description: 'Sum of line items' },
        { name: 'tax_amount', type: 'decimal', description: 'Tax' },
        { name: 'shipping_amount', type: 'decimal', description: 'Shipping charges' },
        { name: 'total_amount', type: 'decimal', description: 'Final PO total' },
        { name: 'blanket_limit', type: 'decimal', description: 'Max for blanket POs' },
        { name: 'blanket_used', type: 'decimal', description: 'Amount released against blanket' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, 2/10 Net 30, etc.' },
        { name: 'tracking_number', type: 'string', description: 'Carrier tracking number' },
        { name: 'change_order_id', type: 'uuid', description: 'Linked CO if PO from change order' },
        { name: 'bid_id', type: 'uuid', description: 'Linked bid if PO from bid award' },
        { name: 'is_emergency', type: 'boolean', description: 'Emergency PO flag' },
        { name: 'emergency_reason', type: 'text', description: 'Reason for emergency bypass' },
        { name: 'version_number', type: 'integer', description: 'Amendment version tracking' },
        { name: 'approved_at', type: 'timestamp', description: 'Approval timestamp' },
        { name: 'approved_by', type: 'uuid', description: 'Approver' },
      ]}
      aiFeatures={[
        {
          name: 'Budget Impact Analysis',
          description: 'Shows full impact before approval. "This PO commits $12,450 to 16-Electrical. Current: $36,550. After: $49,000 (100% of budget). No remaining budget."',
          trigger: 'Before PO approval'
        },
        {
          name: 'Vendor Recommendation',
          description: 'Suggests best vendor by trade, pricing, and performance. "For drywall: ABC Supply ($4.35/SF, 98% on-time, 4.5 quality). DEF Supply ($4.10/SF, 85% on-time, 3.8 quality)."',
          trigger: 'On PO creation'
        },
        {
          name: 'Price Intelligence Check',
          description: 'Compares line items to historical costs. "12 outlets @ $185/ea is 8% above avg ($172/ea). Market trend: +5%. Slightly high but within range."',
          trigger: 'On line item entry'
        },
        {
          name: 'Procurement Aggregation',
          description: 'Identifies consolidation opportunities across projects. "3 jobs need 2x4 lumber this month. Consolidate for volume discount. Est. savings: $2,800 (8%)."',
          trigger: 'On similar POs'
        },
        {
          name: 'Lead Time Alert',
          description: 'Warns when order timing conflicts with schedule. "Windows needed Mar 1. Vendor lead time: 16 weeks. Must order by Nov 8. Order immediately."',
          trigger: 'On PO creation for long-lead items'
        },
        {
          name: 'Three-Way Match',
          description: 'Auto-matches invoices to POs and receipts. Flags variances above tolerance. "Invoice $10,800 vs PO $10,000. Variance: $800 (8%) exceeds 2% tolerance. Review required."',
          trigger: 'On invoice receipt'
        },
        {
          name: 'Backorder Schedule Impact',
          description: 'Cross-references backorders with schedule. "HVAC condensing unit backordered. Needed for task HVAC Install starting Feb 10. Current vendor ETA: Feb 25. 15-day schedule risk."',
          trigger: 'On partial delivery'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Purchase Orders - Smith Residence               Total: $485,000     │
├─────────────────────────────────────────────────────────────────────┤
│ Status: [All ▾]    Vendor: [All ▾]                    [+ New PO]   │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING DELIVERY                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PO-2024-089  ABC Lumber       $24,500    ETA: Feb 1             │ │
│ │ Framing package - 2nd floor                                     │ │
│ │ Status: In Transit | [Track] [View PO]                          │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ PO-2024-092  PGT Windows      $45,000    ETA: Feb 15            │ │
│ │ Impact windows (18 units)                                       │ │
│ │ Status: Manufacturing | [Track] [View PO]                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ NEEDS APPROVAL                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PO-2024-095  XYZ Electric     $12,450    Created: Jan 27        │ │
│ │ Rough-in electrical materials                                   │ │
│ │ ⚠ 8% over budget for Electrical Materials                       │ │
│ │ [Approve] [Reject] [Edit]                                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENT                                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PO-2024-088  Coastal Concrete $18,000    ✓ Received Jan 25      │ │
│ │ PO-2024-085  ABC Lumber       $32,000    ✓ Received Jan 20      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
