'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { WarrantiesPreview } from '@/components/skeleton/previews/warranties-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobWarrantiesPage() {
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
      {activeTab === 'preview' ? <WarrantiesPreview /> : <PageSpec
      title="Job Warranties"
      phase="Phase 2 - Closeout"
      planFile="views/jobs/WARRANTIES.md"
      description="Track all warranties for products and workmanship on this job. Document warranty terms, expiration dates, and claim procedures. Essential for client handoff and future service calls."
      workflow={['Document Warranty', 'Client Handoff', 'Monitor Expiration', 'Handle Claims']}
      features={[
        'Warranty binder with builder, manufacturer, and workmanship warranties',
        'Dual-track warranty: manufacturer product warranty + builder/vendor workmanship warranty',
        'Warranty start date documentation per category (CO date, substantial completion, install date)',
        'Configurable warranty terms per builder (1yr, 2yr, 10yr structural)',
        'Expiration tracking with 60/30/7-day alerts',
        'Warranty registration tracking with product serial numbers',
        'Claim contact info per warranty (phone, email, procedures)',
        'Selection module linkage (warranty tied to selected products)',
        'Warranty reserve calculation at closeout (configurable % of contract)',
        'Reserve draw-down dashboard per project',
        'Warranty cost tracking by vendor, category, and claim',
        'Scheduled walkthroughs: 30-day, 11-month, custom intervals',
        'Mobile walkthrough checklists with room-by-room items',
        'Walkthrough findings auto-create warranty claims',
        'Homeowner co-sign on walkthrough completion',
        'Warranty binder PDF generation for client handoff',
        'Client portal access to warranty information',
        'Claim history per warranty item',
        'Vendor performance tracking for warranty work (response time, callback rate)',
        'Transfer documentation for property resale',
      ]}
      connections={[
        { name: 'Purchase Orders (M18)', type: 'input', description: 'Product warranties from installed items' },
        { name: 'Vendor Management (M10)', type: 'input', description: 'Vendor workmanship warranties and contacts' },
        { name: 'Selection Management (M21)', type: 'input', description: 'Product selections link to manufacturer warranties' },
        { name: 'Document Storage (M6)', type: 'bidirectional', description: 'Warranty documents, walkthrough photos' },
        { name: 'Client Portal (M29)', type: 'output', description: 'Client access to warranty binder and claim submission' },
        { name: 'Warranty Claims (M31)', type: 'output', description: 'Claims filed against warranties' },
        { name: 'Notification Engine (M5)', type: 'output', description: 'Expiration alerts, walkthrough reminders, SLA alerts' },
        { name: 'Financial Reporting (M19)', type: 'output', description: 'Warranty cost roll-up into financial reports' },
        { name: 'Estimating Engine (M20)', type: 'output', description: 'Historical warranty costs feed future reserve estimates' },
        { name: 'Contracts (M38)', type: 'input', description: 'Subcontract warranty terms per trade' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'item', type: 'string', required: true, description: 'Warrantied item name' },
        { name: 'category', type: 'string', description: 'Structural, HVAC, Plumbing, Electrical, Appliance, etc.' },
        { name: 'warranty_type', type: 'string', required: true, description: 'builder, manufacturer, workmanship, extended' },
        { name: 'provider', type: 'string', required: true, description: 'Manufacturer or contractor' },
        { name: 'vendor_id', type: 'uuid', description: 'FK to installing vendor' },
        { name: 'manufacturer', type: 'string', description: 'Manufacturer name if different from vendor' },
        { name: 'start_date', type: 'date', required: true, description: 'Warranty start date (per category)' },
        { name: 'duration_months', type: 'integer', required: true, description: 'Coverage duration in months' },
        { name: 'expiration_date', type: 'date', description: 'Calculated end date' },
        { name: 'coverage_type', type: 'string', description: 'full, parts, labor, limited' },
        { name: 'terms', type: 'text', description: 'Warranty terms and conditions' },
        { name: 'claim_contact', type: 'string', description: 'Contact name for claims' },
        { name: 'claim_phone', type: 'string', description: 'Phone number for claims' },
        { name: 'registration_number', type: 'string', description: 'Product registration number' },
        { name: 'selection_link_id', type: 'uuid', description: 'FK to selection item' },
        { name: 'documents', type: 'jsonb', description: 'Warranty documents and certificates' },
        { name: 'cost_to_date', type: 'decimal', description: 'Total warranty costs against this item' },
        { name: 'claim_count', type: 'integer', description: 'Number of claims filed' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Registration Prompts',
          description: 'Detects installed products requiring warranty registration and prompts team with manufacturer registration links and serial numbers.',
          trigger: 'On installation/PO completion'
        },
        {
          name: 'Warranty Binder Compilation',
          description: 'Compiles all warranty documents, registration confirmations, and coverage summaries into a client-ready warranty binder PDF at closeout.',
          trigger: 'On project closeout'
        },
        {
          name: 'Claim Routing Intelligence',
          description: 'Analyzes claim details to route to correct party: manufacturer (product defect), vendor (workmanship), or builder (general warranty).',
          trigger: 'On claim submission'
        },
        {
          name: 'Walkthrough Scheduling',
          description: 'Auto-generates 30-day and 11-month walkthrough tasks at project closeout. Reminds team when walkthroughs approach.',
          trigger: 'On closeout + periodic check'
        },
        {
          name: 'Warranty Reserve Intelligence',
          description: 'Uses historical warranty cost data to recommend reserve percentages for future projects by type, size, and vendor.',
          trigger: 'On project creation / estimating'
        },
        {
          name: 'Pattern Detection',
          description: 'Identifies recurring warranty issues across projects (same product lot, same vendor, same trade) and recommends proactive inspections.',
          trigger: 'On claim submission'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
