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
      planFile="views/operations/DELIVERIES.md"
      description="Track incoming material deliveries across all jobs. Know what's arriving when and where. Coordinate with job schedules to ensure materials arrive when needed and site is prepared to receive them."
      workflow={workflow}
      features={[
        'Delivery list with status',
        'Calendar view of upcoming deliveries',
        'Filter by job, vendor, date',
        'Expected vs actual delivery dates',
        'Delivery time windows',
        'Site contact and instructions',
        'Delivery confirmation',
        'Photo documentation on receipt',
        'Discrepancy reporting',
        'Back-order tracking',
        'Delivery cost tracking',
        'Coordinate with schedule tasks',
        'Notifications for delays',
        'Vendor delivery performance',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'input', description: 'Deliveries from POs' },
        { name: 'Jobs', type: 'bidirectional', description: 'Deliveries to job sites' },
        { name: 'Job Schedule', type: 'bidirectional', description: 'Coordinate with tasks' },
        { name: 'Calendar', type: 'output', description: 'Shows on calendar' },
        { name: 'Vendors', type: 'input', description: 'Vendor delivery tracking' },
        { name: 'Invoices', type: 'output', description: 'Verify receipt before payment' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'po_id', type: 'uuid', required: true, description: 'Source PO' },
        { name: 'job_id', type: 'uuid', required: true, description: 'Delivery job' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Delivering vendor' },
        { name: 'description', type: 'string', required: true, description: 'What is being delivered' },
        { name: 'expected_date', type: 'date', required: true, description: 'Expected delivery' },
        { name: 'expected_time', type: 'string', description: 'Time window' },
        { name: 'actual_date', type: 'date', description: 'Actual delivery date' },
        { name: 'status', type: 'string', required: true, description: 'Scheduled, In Transit, Delivered, Delayed, Partial' },
        { name: 'site_contact', type: 'string', description: 'Who receives' },
        { name: 'delivery_instructions', type: 'text', description: 'Special instructions' },
        { name: 'received_by', type: 'uuid', description: 'Who received' },
        { name: 'received_notes', type: 'text', description: 'Condition notes' },
        { name: 'photos', type: 'jsonb', description: 'Delivery photos' },
        { name: 'discrepancy', type: 'text', description: 'Any issues' },
      ]}
      aiFeatures={[
        {
          name: 'Schedule Coordination',
          description: 'Ensures deliveries align with work. "Windows arriving Thursday. Framing must be complete by Wednesday."',
          trigger: 'On schedule change'
        },
        {
          name: 'Delay Prediction',
          description: 'Predicts delays based on vendor patterns. "ABC Lumber: 20% deliveries delayed. Buffer recommended."',
          trigger: 'On delivery schedule'
        },
        {
          name: 'Site Readiness',
          description: 'Checks site can receive delivery. "Drywall delivery scheduled but no forklift on site. Add equipment."',
          trigger: 'Day before delivery'
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
