'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PurchaseOrdersPreview } from '@/components/skeleton/previews/purchase-orders-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Budget', 'Purchase Orders', 'Invoices', 'Draws', 'Cost of Sales'
]

export default function PurchaseOrdersSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <PurchaseOrdersPreview /> : <PageSpec
        title="Purchase Orders"
        phase="Phase 0 - Foundation"
        planFile="docs/modules/18-purchase-orders.md"
        description="Company-wide procurement hub. Create and manage purchase orders with AI-powered vendor selection and price intelligence. Supports standard, blanket, and emergency POs. Three-way matching (PO-receipt-invoice), backorder management, cross-project aggregation, schedule-driven lead time alerts, and payment term optimization. All PO types configurable per builder."
        workflow={['Budget/Schedule', 'Create PO', 'Approve (Threshold)', 'Send to Vendor', 'Track Delivery', 'Receive', '3-Way Match Invoice', 'Close']}
        features={[
          'PO list with filtering by status, vendor, job',
          'PO creation with line items and cost code assignment',
          'SELECTION-LINKED: Line items reference Selections Catalog for product/material',
          'Auto-populate: Vendor, pricing, lead time from selection',
          'Selection substitution: Replace one selection with another, recalculate',
          'Approval workflow for POs over threshold',
          'Budget impact preview before approval',
          'Email PO to vendor directly from system',
          'Track received vs ordered quantities',
          'Link invoices to POs for verification',
          'Clone PO from previous orders',
          'Bulk PO creation from estimate selections',
          'PO change orders for scope adjustments',
          'Vendor terms and early payment discounts',
          'Expected delivery date tracking',
          'Lead time alerts from selection data',
        ]}
        connections={[
          { name: 'Selections Catalog', type: 'input', description: 'PO line items reference catalog selections' },
          { name: 'Budget', type: 'input', description: 'PO amounts check against budget commitments' },
          { name: 'Vendors', type: 'input', description: 'Preferred vendor auto-filled from selection' },
          { name: 'Cost Codes', type: 'input', description: 'Line items assigned to cost codes' },
          { name: 'Jobs', type: 'input', description: 'PO scoped to job' },
          { name: 'Invoices', type: 'output', description: 'Invoices match to POs' },
          { name: 'Email', type: 'output', description: 'POs sent to vendors via email' },
          { name: 'Vendor Portal', type: 'output', description: 'Vendors can view/acknowledge POs in portal' },
          { name: 'Cost Intelligence', type: 'bidirectional', description: 'Actual PO costs update catalog pricing' },
          { name: 'Schedule', type: 'input', description: 'Delivery dates align with schedule needs' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
          { name: 'selection_id', type: 'uuid', description: 'FK to selection catalog (enables Selection-to-Actual Tracking)' },
          { name: 'vendor_id', type: 'uuid', required: true, description: 'FK to vendors' },
          { name: 'po_number', type: 'string', required: true, description: 'PO reference number' },
          { name: 'status', type: 'string', required: true, description: 'Draft, Pending Approval, Approved, Sent, Acknowledged, Partially Received, Complete, Cancelled' },
          { name: 'issue_date', type: 'date', description: 'Date PO issued' },
          { name: 'required_date', type: 'date', description: 'Date materials needed (from schedule)' },
          { name: 'expected_delivery', type: 'date', description: 'Vendor-confirmed delivery date' },
          { name: 'subtotal', type: 'decimal', description: 'Sum of line items' },
          { name: 'tax', type: 'decimal', description: 'Tax amount' },
          { name: 'total', type: 'decimal', description: 'Final PO total' },
          { name: 'invoiced_amount', type: 'decimal', description: 'Amount invoiced against PO' },
          { name: 'ai_price_assessment', type: 'string', description: 'AI price comparison result' },
          { name: 'notes', type: 'text', description: 'Internal notes' },
          { name: 'vendor_notes', type: 'text', description: 'Notes visible to vendor' },
        ]}
        aiFeatures={[
          {
            name: 'Vendor Selection',
            description: 'Recommends best vendor based on: cost code/trade match, historical pricing, quality ratings, current availability, and past performance on similar scopes. "For 16000-Electrical: ABC Electric (preferred, avg $4.35/SF) vs. DEF Electric (lower price $4.10/SF, but reliability issues)."',
            trigger: 'On new PO creation'
          },
          {
            name: 'Price Intelligence Check',
            description: 'Compares PO line item pricing to historical cost database: "12 outlets @ $185/ea is 8% above your average ($172/ea). Recent market trend: +5%. Recommendation: Price is slightly high but within market range."',
            trigger: 'On line item entry'
          },
          {
            name: 'Budget Impact Analysis',
            description: 'Shows full budget impact before approval: "This PO will commit $12,450 to 16000-Electrical. Current committed: $36,550. After PO: $49,000 (100% of budget). ⚠ No remaining budget for additional work."',
            trigger: 'Before approval'
          },
          {
            name: 'Bulk Order Opportunity',
            description: 'Identifies consolidation opportunities: "You have 3 jobs needing TruStile doors in next 4 months. Total: 28 doors. Consider bulk PO for volume discount. Estimated savings: $2,800 (8%)."',
            trigger: 'On similar POs across jobs'
          },
          {
            name: 'Lead Time Alert',
            description: 'Warns when PO timing doesn\'t match schedule needs: "Windows needed on site Mar 1 (per schedule). Vendor lead time: 16 weeks. Must order by Nov 8. Current date: Nov 5. ⚠ Order immediately."',
            trigger: 'On PO creation for long-lead items'
          },
          {
            name: 'Scope Completeness',
            description: 'Compares PO to budget/estimate line items: "Electrical budget includes: rough-in, trim, fixtures, panel. This PO covers rough-in only. Remaining scope not yet committed: $28,500."',
            trigger: 'On PO review'
          },
          {
            name: 'Payment Terms Optimization',
            description: 'Suggests optimal payment terms: "ABC Electric offers Net 30. Industry standard for electrical is Net 30. Early payment discount (2% Net 10) would save $249. Cash flow impact: payable Dec 15 vs Dec 25."',
            trigger: 'On vendor selection'
          },
          {
            name: 'Historical Comparison',
            description: 'Shows how this PO compares to similar past orders: "Electrical rough-in for similar 3,500 SF home: Smith job $12,450 vs. Johnson job $11,800 vs. Davis job $12,200. This PO is within normal range."',
            trigger: 'On PO review'
          },
          {
            name: 'Selection-to-Actual Tracking',
            description: 'Compares PO price to catalog selection price: "Cypress T&G ordered at $9.25/LF vs. catalog $8.50/LF (+8.8%). Catalog may need update—this is the 3rd PO above catalog price."',
            trigger: 'On PO creation and completion'
          },
          {
            name: 'Selection Substitution Helper',
            description: 'When selections are unavailable, suggests alternatives from catalog: "Brazilian hardwood backordered 12 weeks. Alternatives: Cypress T&G (in stock, -$5.50/LF), IPE (8 week lead, +$2/LF). Impact to budget and schedule shown."',
            trigger: 'On availability issues'
          },
        ]}
        mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Purchase Orders                             [+ New PO] [Filters]     │
├─────────────────────────────────────────────────────────────────────┤
│ Committed: $485K of $2.45M budget (20%) | Open POs: $63,850         │
├─────────────────────────────────────────────────────────────────────┤
│ NEW PO - Smith Residence                                            │
│ Vendor: [ABC Lumber ▾] (auto-filled from selection)                 │
├─────────────────────────────────────────────────────────────────────┤
│ LINE ITEMS:                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Selection: [Cypress T&G 1x6          ▾] ← from Catalog          │ │
│ │ Qty: [450] SF × $8.50/LF = $3,825 (catalog price)               │ │
│ │ Actual vendor quote: $9.25/LF = $4,162 ⚠ +8.8% vs catalog       │ │
│ │ Lead time: 2 weeks | Needed by: Feb 15 ✓                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Selection: [Stainless Steel Screws   ▾] ← from Catalog          │ │
│ │ Qty: [10] boxes × $45/box = $450 (catalog price) ✓              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ [+ Add Line Item from Catalog]                                      │
├─────────────────────────────────────────────────────────────────────┤
│ PO Total: $4,612 | Budget Impact: 06-Carpentry $195K → $199.6K     │
│ AI: "Cypress 8.8% over catalog. 3rd PO above price—update catalog?"│
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
