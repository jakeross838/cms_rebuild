'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function VendorsPage() {
  return (
    <PageSpec
      title="Vendors & Subcontractors"
      phase="Phase 0 - Foundation"
      planFile="views/directory/VENDORS.md"
      description="Comprehensive vendor management with AI-powered scorecards. Track subcontractors, suppliers, and service providers with performance metrics, insurance compliance, pricing history, and reliability scores. The system learns which vendors deliver quality on time and at fair prices."
      workflow={['Onboard Vendor', 'Track Performance', 'Manage Compliance', 'Build Intelligence']}
      features={[
        'Vendor profiles with contact info',
        'Trade/category classification',
        'Multiple contacts per vendor',
        'Insurance/COI tracking with expiration alerts',
        'W-9 and tax documentation',
        'License verification',
        'Performance scorecards (Quality, Timeliness, Price, Communication)',
        'Pricing history by selection/service',
        'Payment terms and history',
        'Job history with all work performed',
        'Punch list history',
        'Preferred vendor designation',
        'Vendor portal access',
        'Notes and interaction log',
        'Bid history and win rate',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'bidirectional', description: 'Vendors linked to selections' },
        { name: 'Purchase Orders', type: 'output', description: 'POs issued to vendors' },
        { name: 'Invoices', type: 'input', description: 'Invoices from vendors' },
        { name: 'Bids', type: 'input', description: 'Bid responses' },
        { name: 'Jobs', type: 'output', description: 'Work on jobs' },
        { name: 'Compliance/Insurance', type: 'bidirectional', description: 'Insurance tracking' },
        { name: 'Vendor Portal', type: 'output', description: 'Portal access' },
        { name: 'Lien Waivers', type: 'input', description: 'Waivers from vendors' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_name', type: 'string', required: true, description: 'Company name' },
        { name: 'dba', type: 'string', description: 'Doing business as' },
        { name: 'type', type: 'string', required: true, description: 'Subcontractor, Supplier, Service' },
        { name: 'trades', type: 'string[]', description: 'Trade categories' },
        { name: 'contacts', type: 'jsonb', description: 'Contact persons' },
        { name: 'email', type: 'string', description: 'Primary email' },
        { name: 'phone', type: 'string', description: 'Primary phone' },
        { name: 'address', type: 'jsonb', description: 'Business address' },
        { name: 'tax_id', type: 'string', description: 'EIN/Tax ID' },
        { name: 'w9_on_file', type: 'boolean', description: 'W-9 received' },
        { name: 'insurance_expiry', type: 'date', description: 'COI expiration' },
        { name: 'license_number', type: 'string', description: 'Contractor license' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, etc.' },
        { name: 'score_quality', type: 'decimal', description: 'Quality score 1-5' },
        { name: 'score_timeliness', type: 'decimal', description: 'Timeliness score' },
        { name: 'score_price', type: 'decimal', description: 'Price competitiveness' },
        { name: 'score_communication', type: 'decimal', description: 'Communication score' },
        { name: 'overall_score', type: 'decimal', description: 'Weighted average' },
        { name: 'is_preferred', type: 'boolean', description: 'Preferred vendor' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Active vendor' },
        { name: 'total_spend', type: 'decimal', description: 'Lifetime spend' },
        { name: 'jobs_count', type: 'integer', description: 'Jobs worked' },
      ]}
      aiFeatures={[
        {
          name: 'Performance Scoring',
          description: 'Calculates scores from job data. "Quality: 4.2 (based on punch list ratio), Timeliness: 3.8 (2 delays in 10 jobs)."',
          trigger: 'Continuous'
        },
        {
          name: 'Price Intelligence',
          description: 'Tracks pricing trends. "ABC Electric: $4.35/SF average, 5% above market but excellent quality justifies premium."',
          trigger: 'On invoice'
        },
        {
          name: 'Compliance Alerts',
          description: 'Proactive compliance warnings. "3 vendors have insurance expiring in 30 days. Cannot issue POs until renewed."',
          trigger: 'Daily check'
        },
        {
          name: 'Vendor Recommendations',
          description: 'Suggests best vendor for scope. "For electrical rough-in: ABC Electric (preferred, 4.5 stars) or DEF Electric (lower price, 3.8 stars)."',
          trigger: 'On PO creation'
        },
        {
          name: 'Risk Detection',
          description: 'Identifies vendor risks. "XYZ Plumbing: 3 late completions in a row, increasing punch items. Review relationship."',
          trigger: 'Pattern detection'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Vendors                                          [+ Add Vendor]     │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Trade: [All ▾]  Status: [Active ▾]      │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⭐ ABC Electric                        ★★★★★ 4.8  Preferred    │ │
│ │    Electrical | Mike Johnson | (555) 111-2222                   │ │
│ │    Jobs: 24 | Total Spend: $485K | Avg Price: $4.35/SF         │ │
│ │    Insurance: ✓ Valid until Mar 15 | License: ✓ Active         │ │
│ │    [View Profile] [Create PO] [Request Bid]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ XYZ Plumbing                           ★★★☆☆ 3.4               │ │
│ │    Plumbing | Steve Wilson | (555) 333-4444                     │ │
│ │    Jobs: 12 | Total Spend: $220K | ⚠ 3 late completions        │ │
│ │    Insurance: ⚠ Expires in 15 days | License: ✓ Active         │ │
│ │    AI: "Declining performance trend. Review recommended."       │ │
│ │    [View Profile] [Create PO] [Request Bid]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 48 vendors | Preferred: 12 | ⚠ Compliance issues: 3        │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
