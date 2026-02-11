'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Punch List', 'Closeout', 'Warranties', 'Warranty Claims'
]

export default function WarrantiesSkeleton() {
  return (
    <PageSpec
      title="Warranties"
      phase="Phase 0 - Foundation"
      planFile="views/closeout/WARRANTIES.md"
      description="Track all warranty information from installed products and vendor work. Automatically capture warranty details from selections catalog and vendor agreements. Alert before expirations and link to warranty claims when issues arise."
      workflow={constructionWorkflow}
      features={[
        'Warranty list by job with expiration tracking',
        'Auto-import warranties from Selections Catalog',
        'Vendor workmanship warranties from contracts',
        'Builder warranty terms',
        'Warranty documents stored and linked',
        'Expiration calendar view',
        'Alerts before warranty expiration',
        'Link warranties to specific selections/products',
        'Quick access to manufacturer contact info',
        'Warranty claim initiation',
        'Coverage details: What is/isn\'t covered',
        'Transfer warranty info to new owner',
        'Export warranty package for client',
        'QR codes linking to warranty details',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Product warranties from catalog' },
        { name: 'Vendors', type: 'input', description: 'Workmanship warranties from vendors' },
        { name: 'Jobs', type: 'input', description: 'Warranties scoped to job' },
        { name: 'Documents', type: 'bidirectional', description: 'Warranty documents stored' },
        { name: 'Warranty Claims', type: 'output', description: 'Claims filed against warranties' },
        { name: 'Client Portal', type: 'output', description: 'Client can view warranty info' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'type', type: 'string', required: true, description: 'Product, Workmanship, Builder' },
        { name: 'name', type: 'string', required: true, description: 'Warranty name/description' },
        { name: 'selection_id', type: 'uuid', description: 'FK to selections if product warranty' },
        { name: 'vendor_id', type: 'uuid', description: 'FK to vendors if workmanship' },
        { name: 'manufacturer', type: 'string', description: 'Manufacturer name' },
        { name: 'coverage_summary', type: 'text', description: 'What is covered' },
        { name: 'exclusions', type: 'text', description: 'What is not covered' },
        { name: 'start_date', type: 'date', required: true, description: 'Warranty start date' },
        { name: 'end_date', type: 'date', required: true, description: 'Warranty end date' },
        { name: 'duration_years', type: 'integer', description: 'Warranty length in years' },
        { name: 'document_url', type: 'string', description: 'Warranty document' },
        { name: 'contact_phone', type: 'string', description: 'Warranty contact phone' },
        { name: 'contact_email', type: 'string', description: 'Warranty contact email' },
        { name: 'claim_process', type: 'text', description: 'How to file a claim' },
        { name: 'is_transferable', type: 'boolean', description: 'Can transfer to new owner' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Population',
          description: 'Automatically creates warranty records from selections: "Job complete. Created 45 warranty records from installed selections: Windows (20yr), Roofing (30yr), Appliances (1-5yr)..."',
          trigger: 'On job closeout'
        },
        {
          name: 'Expiration Alerts',
          description: 'Proactive alerts for expiring warranties: "Smith Residence: Appliance warranties expire in 30 days. 3 claims can still be filed. Notify client?"',
          trigger: 'Based on expiration dates'
        },
        {
          name: 'Coverage Analysis',
          description: 'Analyzes warranty coverage for reported issues: "Reported issue: HVAC not cooling. Trane warranty covers compressor (10yr), parts (5yr), labor (1yr expired). Recommend: File parts claim."',
          trigger: 'On issue report'
        },
        {
          name: 'Warranty Package Generation',
          description: 'Generates comprehensive warranty package for client: "Created warranty binder with 45 warranties, contact info, coverage summaries, and claim procedures. Ready for client handoff."',
          trigger: 'On closeout'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Warranties - Smith Residence                [+ Add] [Export Package]│
├─────────────────────────────────────────────────────────────────────┤
│ Total: 45 warranties | Expiring soon: 3 | Active claims: 1         │
├─────────────────────────────────────────────────────────────────────┤
│ View: [List] [Calendar] [By Category]     Filter: [All ▾]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ⚠ EXPIRING WITHIN 90 DAYS                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🔧 GE Appliances - Dishwasher              Expires: Apr 15      │ │
│ │    1 year parts & labor | Serial: DW-123456                     │ │
│ │    [View Details] [File Claim] [Contact: 1-800-GE-CARES]        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🏠 BUILDER WARRANTY                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Ross Built - Structural                    Expires: Jan 2034    │ │
│ │    10 year structural warranty | Transferable: Yes              │ │
│ │    Coverage: Foundation, framing, load-bearing walls            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Ross Built - Systems                       Expires: Jan 2026    │ │
│ │    2 year systems warranty | Plumbing, Electrical, HVAC         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🪟 WINDOWS & DOORS (20 items)                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PGT Impact Windows (18)                    Expires: Jan 2044    │ │
│ │    20 year glass, 10 year parts, Lifetime frame                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "3 appliance warranties expire in 90 days. Review with client   │
│ for any unreported issues before coverage ends."                    │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
