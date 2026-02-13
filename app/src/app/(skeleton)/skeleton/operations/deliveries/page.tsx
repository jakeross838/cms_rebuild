'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { DeliveriesPreview } from '@/components/skeleton/previews/deliveries-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const workflow = ['PO Created', 'Delivery Scheduled', 'Arriving Soon', 'Received', 'Verified']

export default function DeliveriesPage() {
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
      {activeTab === 'preview' ? <DeliveriesPreview /> : <PageSpec
      title="Deliveries"
      phase="Phase 2 - Operations"
      planFile="docs/modules/18-purchase-orders.md (Section 6: Delivery Tracking)"
      description="Cross-job delivery tracking and receiving management. Tracks all incoming material deliveries from POs, including partial receipts, backorder management, damage reporting, and three-way matching integration. Configurable receiving workflow (field or office). Schedule impact analysis for delayed or backordered materials. Vendor on-time delivery performance tracking feeds into vendor scorecards."
      workflow={workflow}
      features={[
        'Delivery list grouped by timeline (today, tomorrow, upcoming, delayed, partial, delivered)',
        'Calendar view of upcoming deliveries across all jobs',
        'Filter by job, vendor, status, date range',
        'Expected vs actual delivery dates with variance tracking',
        'Delivery time windows with site preparation alerts',
        'Site contact assignment and special instructions',
        'Mobile-friendly receiving form with quantity check-off',
        'Partial receipt support with backorder auto-flagging',
        'Photo documentation on receipt (configurable: optional or required)',
        'Damaged item reporting with photos and auto-vendor notification',
        'Wrong item flagging with return workflow',
        'Condition status: good, damaged, wrong_item',
        'Tracking number with carrier link (UPS/FedEx/freight)',
        'Receiving location: job_site, warehouse, office',
        'Backorder dashboard with schedule impact cross-reference',
        'Three-way matching integration (PO-receipt-invoice)',
        'Schedule task dependency tracking per delivery',
        'Schedule impact warnings when deliveries delay or backorder',
        'Vendor on-time delivery rate tracking',
        'Delivery value tracking and cost code association',
        'Delivery performance reports by vendor',
        'Weather impact on delivery scheduling',
        'Automated reminders to vendors for upcoming delivery dates',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'input', description: 'Deliveries sourced from PO line items and expected dates' },
        { name: 'PO Receipts', type: 'output', description: 'Receipt records created for three-way matching' },
        { name: 'Jobs', type: 'bidirectional', description: 'Deliveries scoped to job sites' },
        { name: 'Job Schedule', type: 'bidirectional', description: 'Schedule impact analysis for delays/backorders' },
        { name: 'Calendar', type: 'output', description: 'Delivery events shown on company calendar (green)' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor delivery performance feeds scorecards' },
        { name: 'Invoices', type: 'output', description: 'Receipt data feeds three-way matching' },
        { name: 'Budget', type: 'output', description: 'Received amounts update committed cost tracking' },
        { name: 'Notifications', type: 'output', description: 'Delay alerts, upcoming delivery reminders' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key (v2_po_receipts)' },
        { name: 'purchase_order_id', type: 'uuid', required: true, description: 'Source PO' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant isolation' },
        { name: 'received_by', type: 'uuid', required: true, description: 'User who received' },
        { name: 'received_at', type: 'timestamp', description: 'When received' },
        { name: 'location', type: 'string', description: 'job_site | warehouse | office' },
        { name: 'notes', type: 'text', description: 'General receiving notes' },
        { name: 'photos', type: 'text[]', description: 'Array of photo file URLs' },
        { name: 'receipt_item.po_item_id', type: 'uuid', required: true, description: 'Link to PO line item' },
        { name: 'receipt_item.quantity_received', type: 'decimal', required: true, description: 'Quantity received this delivery' },
        { name: 'receipt_item.condition', type: 'string', description: 'good | damaged | wrong_item' },
        { name: 'receipt_item.damage_notes', type: 'text', description: 'Damage description' },
        { name: 'receipt_item.damage_photos', type: 'text[]', description: 'Damage photo URLs' },
        { name: 'po.expected_delivery_date', type: 'date', description: 'Expected delivery from PO' },
        { name: 'po.tracking_number', type: 'string', description: 'Carrier tracking number' },
        { name: 'po.carrier', type: 'string', description: 'Shipping carrier name' },
        { name: 'po_item.backordered_quantity', type: 'decimal', description: 'Items not yet received' },
      ]}
      aiFeatures={[
        {
          name: 'Schedule Coordination',
          description: 'Cross-references deliveries with schedule tasks. "Windows arriving Thursday. Framing must complete by Wednesday. Current status: 85% complete -- on track."',
          trigger: 'On schedule change or delivery update'
        },
        {
          name: 'Delay Prediction',
          description: 'Uses vendor history to predict delays. "ABC Lumber: 18% late delivery rate. This delivery has 22% probability of delay based on current order volume. Buffer recommended."',
          trigger: 'On delivery schedule'
        },
        {
          name: 'Site Readiness Check',
          description: 'Validates site can receive delivery. "Drywall delivery requires boom truck. Confirm equipment on site. Area below east wall must be clear for staging."',
          trigger: 'Day before delivery'
        },
        {
          name: 'Backorder Schedule Impact',
          description: 'Calculates schedule risk from backorders. "HVAC condensing unit backordered. ETA Feb 25. Task HVAC Install scheduled Feb 10. Schedule slip: +15 days on critical path."',
          trigger: 'On partial delivery'
        },
        {
          name: 'Vendor Performance Alert',
          description: 'Flags vendors below on-time threshold. "Elite Appliances: 72% on-time rate (threshold: 85%). 3 of last 4 deliveries late. Consider alternative supplier for future orders."',
          trigger: 'On vendor performance calculation'
        },
        {
          name: 'Damage Pattern Detection',
          description: 'Identifies recurring damage issues. "Smith Electric Supply: 2nd delivery with damaged breakers in 3 months. Recommend requesting improved packaging or considering alternative supplier."',
          trigger: 'On damage report'
        },
        {
          name: 'Weather Impact',
          description: 'Checks weather forecast against upcoming deliveries. "Rain forecast Feb 14-15. Lumber delivery scheduled Feb 14 -- materials require covered staging. Alert site contact."',
          trigger: 'On weather forecast update'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Deliveries                                     [+ Manual Delivery]  │
├─────────────────────────────────────────────────────────────────────┤
│ View: [List] [Calendar]    Job: [All ▾]    Status: [All ▾]         │
├─────────────────────────────────────────────────────────────────────┤
│ TODAY - January 28                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🚛 Windows - PGT Impact                         9am - 12pm      │ │
│ │    Smith Residence | PO-089 | ABC Glass                         │ │
│ │    18 windows, 2 sliders | Site contact: Mike                   │ │
│ │    ⚠ Forklift needed for unloading                              │ │
│ │    [Mark Received] [Report Issue] [View PO]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ TOMORROW - January 29                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🚛 Lumber Package                               7am - 9am       │ │
│ │    Johnson Beach House | PO-092 | Coastal Lumber                │ │
│ │    Framing package for 2nd floor                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ⚠ DELAYED                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🚛 Appliances - Kitchen                         Was: Jan 25     │ │
│ │    Smith Residence | Backordered - New ETA: Feb 5               │ │
│ │    AI: "10 day delay may impact trim-out schedule"              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ This Week: 8 deliveries | On Time: 6 | Delayed: 2                  │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
