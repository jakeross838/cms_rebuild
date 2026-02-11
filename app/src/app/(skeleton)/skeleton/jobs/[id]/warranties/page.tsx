'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobWarrantiesPage() {
  return (
    <PageSpec
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
        { name: 'registration_number', type: 'string', description: 'Registration #' },
        { name: 'documents', type: 'jsonb', description: 'Warranty documents' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Registration',
          description: 'Prompts registration. "HVAC system installed. Manufacturer warranty requires registration within 30 days for full coverage."',
          trigger: 'On installation'
        },
        {
          name: 'Warranty Binder',
          description: 'Compiles documents. "Generating warranty binder: 45 items documented. Missing: Appliance registration."',
          trigger: 'On closeout'
        },
        {
          name: 'Claim Routing',
          description: 'Routes service calls. "Roof leak reported. Metal roof has 20-year warranty. Contact: Roofing Co at (727) 555-ROOF."',
          trigger: 'On claim'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Warranties - Smith Residence                   Items: 45            │
├─────────────────────────────────────────────────────────────────────┤
│ Category: [All ▾]    Status: [All ▾]         [Generate Binder]     │
├─────────────────────────────────────────────────────────────────────┤
│ MAJOR SYSTEMS                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🏠 Structural - Ross Built                                      │ │
│ │    10-year structural warranty | Expires: Jan 2035              │ │
│ │    Coverage: Foundation, framing, load-bearing elements         │ │
│ │    [View Terms] [View Certificate]                              │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 🌡️ HVAC System - Carrier                                        │ │
│ │    5-year parts, 10-year compressor | Expires: Jan 2030/2035   │ │
│ │    Registration: ✓ Completed | Installed by: ABC HVAC          │ │
│ │    [View Terms] [Contact Info]                                  │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 🏠 Roofing - Metal Standing Seam                                │ │
│ │    20-year manufacturer + 5-year labor | Exp: Jan 2045/2030    │ │
│ │    Installed by: Coastal Roofing                               │ │
│ │    [View Terms] [Contact Info]                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ⚠ NEEDS ACTION                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Appliances - Kitchen (Sub-Zero, Wolf)                          │ │
│ │ Registration required within 30 days for full warranty         │ │
│ │ Installed: Jan 20 | Deadline: Feb 19                           │ │
│ │ [Register Now] [View Instructions]                              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Registered: 42 | Pending Registration: 3 | Total Coverage: $2.4M   │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
