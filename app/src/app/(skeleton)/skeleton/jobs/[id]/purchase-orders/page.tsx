'use client'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PurchaseOrdersPreview } from '@/components/skeleton/previews/purchase-orders-preview'
import { useState } from 'react'
import { Eye, BookOpen } from 'lucide-react'
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
      planFile="views/jobs/PURCHASE_ORDERS.md"
      description="All purchase orders for this job. Track what's been ordered, delivery status, and costs against budget. Approve new POs and manage vendor relationships at the job level."
      workflow={['Create PO', 'Approve', 'Send to Vendor', 'Track Delivery', 'Receive & Close']}
      features={[
        'Job PO list',
        'PO status tracking',
        'Cost code assignment',
        'Budget impact view',
        'Delivery tracking',
        'Vendor performance',
        'PO approval workflow',
        'Quick PO from budget',
        'Material receipts',
        'Back-order tracking',
        'PO change orders',
        'Document attachments',
      ]}
      connections={[
        { name: 'Budget', type: 'bidirectional', description: 'Cost tracking' },
        { name: 'Vendors', type: 'input', description: 'Vendor info' },
        { name: 'Deliveries', type: 'output', description: 'Schedule deliveries' },
        { name: 'Invoices', type: 'output', description: 'Match invoices' },
        { name: 'Selections', type: 'input', description: 'Selected items' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'po_number', type: 'string', required: true, description: 'PO number' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
        { name: 'description', type: 'text', description: 'What is being ordered' },
        { name: 'amount', type: 'decimal', required: true, description: 'Total amount' },
        { name: 'cost_code', type: 'string', description: 'Budget category' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Sent, Partial, Complete' },
        { name: 'expected_delivery', type: 'date', description: 'Expected date' },
        { name: 'actual_delivery', type: 'date', description: 'Actual date' },
        { name: 'approved_by', type: 'uuid', description: 'Approver' },
        { name: 'approved_at', type: 'timestamp', description: 'Approval date' },
      ]}
      aiFeatures={[
        {
          name: 'Budget Check',
          description: 'Validates against budget. "This PO would put Framing Materials 15% over budget. Remaining: $2,400. PO: $5,000."',
          trigger: 'On PO creation'
        },
        {
          name: 'Vendor Suggestion',
          description: 'Recommends vendors. "For drywall: ABC Supply has best price history. 98% on-time delivery."',
          trigger: 'On material selection'
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
