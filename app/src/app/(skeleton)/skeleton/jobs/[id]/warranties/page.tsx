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
        'Warranty catalog for job',
        'Product warranties',
        'Workmanship warranties',
        'Manufacturer info',
        'Expiration tracking',
        'Claim procedures',
        'Document storage',
        'Client access',
        'Warranty binder generation',
        'Claim history',
        'Vendor responsibilities',
        'Reminder notifications',
        'Registration status',
        'Transfer documentation',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'input', description: 'Product warranties' },
        { name: 'Vendors', type: 'input', description: 'Vendor warranties' },
        { name: 'Document Storage', type: 'output', description: 'Warranty docs' },
        { name: 'Client Portal', type: 'output', description: 'Client access' },
        { name: 'Warranty Claims', type: 'output', description: 'Service requests' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'item', type: 'string', required: true, description: 'Warrantied item' },
        { name: 'category', type: 'string', description: 'Appliance, HVAC, Roofing, etc.' },
        { name: 'warranty_type', type: 'string', required: true, description: 'Product, Labor, Extended' },
        { name: 'provider', type: 'string', required: true, description: 'Manufacturer or contractor' },
        { name: 'vendor_id', type: 'uuid', description: 'Installing vendor' },
        { name: 'start_date', type: 'date', required: true, description: 'Warranty start' },
        { name: 'duration_months', type: 'integer', required: true, description: 'Coverage duration' },
        { name: 'expiration_date', type: 'date', description: 'Calculated end' },
        { name: 'terms', type: 'text', description: 'Warranty terms' },
        { name: 'claim_contact', type: 'string', description: 'Who to contact' },
        { name: 'claim_phone', type: 'string', description: 'Claim phone' },
        { name: 'registration_number', type: 'string', description: 'Registration number' },
        { name: 'documents', type: 'jsonb', description: 'Warranty documents' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Registration',
          description: 'Prompts registration.',
          trigger: 'On installation'
        },
        {
          name: 'Warranty Binder',
          description: 'Compiles documents.',
          trigger: 'On closeout'
        },
        {
          name: 'Claim Routing',
          description: 'Routes service calls.',
          trigger: 'On claim'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
