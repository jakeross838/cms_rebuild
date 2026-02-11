'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Directory', 'Vendors', 'Cost Codes', 'Purchase Orders', 'Invoices', 'Bids'
]

export default function VendorsListSkeleton() {
  return (
    <PageSpec
      title="Vendors"
      phase="Phase 0 - Foundation"
      planFile="views/directory/VENDORS_CLIENTS_COSTCODES.md"
      description="Vendor Intelligence Profiles powered by data from every interaction. The system automatically builds scorecards from invoices, daily logs, schedule adherence, and quality metrics—no manual rating required. Know exactly who delivers and who doesn't."
      workflow={constructionWorkflow}
      features={[
        'Vendor list with search and trade filtering',
        'Vendor detail with contact and payment info',
        'Trade/specialty categorization with multiple trades per vendor',
        'Insurance certificate tracking with expiration alerts',
        'W-9 and license document storage',
        'Payment history across all jobs',
        'AI-generated performance scorecards',
        'Preferred vendor marking with reasons',
        'Vendor portal invitation and access management',
        'QuickBooks sync for vendor data',
        'Crew/foreman tracking per vendor',
        'Capacity and availability indicators',
        'Bid history and win rate',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'output', description: 'POs issued to vendors' },
        { name: 'Invoices', type: 'output', description: 'Invoices received from vendors' },
        { name: 'Bids', type: 'output', description: 'Bid requests sent to vendors' },
        { name: 'Cost Codes', type: 'bidirectional', description: 'Vendors associated with cost code trades' },
        { name: 'Vendor Portal', type: 'output', description: 'Vendors access their portal' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Vendor sync with accounting' },
        { name: 'Daily Logs', type: 'input', description: 'Manpower and performance data' },
        { name: 'Schedule', type: 'input', description: 'Schedule adherence tracking' },
        { name: 'Punch Lists', type: 'input', description: 'Quality and callback data' },
        { name: 'Vendor Intelligence', type: 'output', description: 'Comprehensive vendor analytics' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Vendor/company name' },
        { name: 'contact_name', type: 'string', description: 'Primary contact person' },
        { name: 'email', type: 'string', description: 'Primary email' },
        { name: 'phone', type: 'string', description: 'Primary phone' },
        { name: 'address', type: 'string', description: 'Business address' },
        { name: 'trade', type: 'string[]', description: 'List of trade specialties' },
        { name: 'is_preferred', type: 'boolean', description: 'Marked as preferred vendor' },
        { name: 'insurance_expiry', type: 'date', description: 'Insurance certificate expiration' },
        { name: 'insurance_document_url', type: 'string', description: 'Insurance certificate file' },
        { name: 'license_number', type: 'string', description: 'Contractor license number' },
        { name: 'license_expiry', type: 'date', description: 'License expiration date' },
        { name: 'w9_url', type: 'string', description: 'W-9 document file' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, etc.' },
        { name: 'ai_reliability_score', type: 'decimal', description: 'AI-calculated reliability 0-100' },
        { name: 'ai_quality_score', type: 'decimal', description: 'AI-calculated quality 0-100' },
        { name: 'ai_price_score', type: 'decimal', description: 'AI-calculated price competitiveness 0-100' },
        { name: 'ai_overall_score', type: 'decimal', description: 'Weighted overall score' },
        { name: 'total_paid', type: 'decimal', description: 'Total payments across all jobs' },
        { name: 'active_jobs_count', type: 'integer', description: 'Current active job count' },
        { name: 'qb_vendor_id', type: 'string', description: 'QuickBooks vendor ID' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Generated Scorecards',
          description: 'Builds vendor scorecards automatically from system data: Reliability (schedule adherence from logs), Quality (punch list items, callbacks), Price (bid vs. market, vs. budget), Communication (response times), Safety (incident logs). No manual rating needed.',
          trigger: 'Continuous calculation from all data'
        },
        {
          name: 'Schedule Adherence Tracking',
          description: 'Calculates actual vs. promised timing: "XYZ Plumbing: Typically starts 2 days late (based on 8 jobs). Average rough-in duration: 5 days (vs. quoted 4 days). Impact: Delays subsequent trades by average 1.5 days."',
          trigger: 'From daily log and schedule data'
        },
        {
          name: 'Quality Metrics',
          description: 'Tracks quality from punch lists and callbacks: "ABC Electric: 0.8 punch items per job (excellent). DEF Electric: 3.2 punch items per job (below average). Warranty callbacks: ABC = 0, DEF = 2 in last year."',
          trigger: 'From punch list and warranty data'
        },
        {
          name: 'Crew Intelligence',
          description: 'Tracks specific crews/foremen: "John\'s crew from ABC Electric: $4.10/SF, 4.5-day avg rough-in. Mike\'s crew: $4.35/SF, 5.2-day avg. When possible, request John\'s crew."',
          trigger: 'From daily log manpower data'
        },
        {
          name: 'Price Competitiveness',
          description: 'Compares vendor pricing to market and historical: "ABC Electric bids average 5% above market but delivers on time with minimal callbacks. Net cost (including time savings) is actually 3% below alternatives."',
          trigger: 'From bid and invoice history'
        },
        {
          name: 'Insurance & License Alerts',
          description: 'Proactive alerts before expiration: "ABC Electric insurance expires in 14 days. Auto-email sent requesting renewal. Block new POs if not renewed by expiration."',
          trigger: '30/14/7 days before expiry'
        },
        {
          name: 'Capacity & Availability',
          description: 'Estimates vendor capacity: "XYZ Plumbing currently on 4 of your jobs + estimated 3 other jobs (from bid activity). Typical capacity: 6 concurrent jobs. Availability: Limited. Consider backup vendor for new starts."',
          trigger: 'From PO and schedule data'
        },
        {
          name: 'Vendor Recommendation Engine',
          description: 'Suggests best vendors for new work: "For 16000-Electrical on elevated coastal home: 1) ABC Electric (score: 92, 8 similar jobs), 2) GHI Electric (score: 85, 3 similar jobs). ABC preferred for coastal experience."',
          trigger: 'On PO/Bid creation'
        },
        {
          name: 'Name Variation Learning',
          description: 'Learns vendor name variations from invoices: "ABC Electric LLC", "A.B.C. Electrical", "ABC Electric Inc" all map to same vendor. Improves invoice matching accuracy over time.',
          trigger: 'On invoice processing'
        },
        {
          name: 'Relationship Health',
          description: 'Monitors relationship indicators: "Payment to ABC Electric: Average 28 days (within Net 30). Volume trend: ↑ 15% YoY. Last dispute: None. Relationship: Healthy."',
          trigger: 'From payment and communication data'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Vendors                                [+ New Vendor] [Import] [▾]   │
├─────────────────────────────────────────────────────────────────────┤
│ Active: 42 vendors | 3 expiring insurance | 2 at capacity           │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [________________] [Trade: All ▾] [Show: All ▾]             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌────────────────┬────────────┬────────────┬──────────┬──────────┐ │
│ │ Vendor         │ Trade      │ AI Score   │ Total $  │ Status   │ │
│ ├────────────────┼────────────┼────────────┼──────────┼──────────┤ │
│ │ ★ ABC Electric │ Electrical │ 92 ████████│ $245,000 │ ● Active │ │
│ │   Reliable, quality, +5%   │ 8 jobs     │ Capacity:OK         │ │
│ ├────────────────┼────────────┼────────────┼──────────┼──────────┤ │
│ │ ★ XYZ Plumbing │ Plumbing   │ 88 ███████ │ $189,000 │ ● Active │ │
│ │   Good quality, -2 day late│ 6 jobs     │ Capacity:OK         │ │
│ ├────────────────┼────────────┼────────────┼──────────┼──────────┤ │
│ │   Best Lumber  │ Supplier   │ 78 ██████  │ $156,000 │ ● Active │ │
│ │   Good price, slow delivery│ 4 jobs     │ Capacity:OK         │ │
│ ├────────────────┼────────────┼────────────┼──────────┼──────────┤ │
│ │   HVAC Pros    │ HVAC       │ 72 █████   │ $92,000  │ ⚠ Expiring│
│ │   Quality issues, callbacks│ 3 jobs     │ Insurance: 7 days   │ │
│ └────────────────┴────────────┴────────────┴──────────┴──────────┘ │
│                                                                     │
│ ★ = Preferred  |  Score: Reliability + Quality + Price + Safety     │
│ ⚠ = Action needed (insurance, license, capacity)                    │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
