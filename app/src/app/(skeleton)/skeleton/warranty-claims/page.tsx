'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Client Report', 'Warranty Check', 'Claim Filed', 'Resolution', 'Closeout'
]

export default function WarrantyClaimsSkeleton() {
  return (
    <PageSpec
      title="Warranty Claims"
      phase="Phase 5 - Warranty"
      planFile="views/warranty/WARRANTY_CLAIMS.md"
      description="Manage post-completion warranty service requests. Clients report issues, system checks warranty coverage, claims are filed with appropriate parties (manufacturer, vendor, or builder), and resolution is tracked to completion."
      workflow={constructionWorkflow}
      features={[
        'Claim intake via client portal or phone',
        'Automatic warranty coverage check',
        'Route to appropriate party (manufacturer, vendor, builder)',
        'Track claim status through resolution',
        'Photo documentation of issues',
        'Service appointment scheduling',
        'Vendor assignment and notification',
        'Client communication log',
        'Resolution documentation',
        'Client satisfaction tracking',
        'Claim analytics by type, vendor, product',
        'SLA tracking for response times',
        'Recurring issue detection',
        'Cost tracking for builder warranty work',
      ]}
      connections={[
        { name: 'Warranties', type: 'input', description: 'Claims filed against warranties' },
        { name: 'Client Portal', type: 'bidirectional', description: 'Clients submit and track claims' },
        { name: 'Vendors', type: 'output', description: 'Vendor warranty work assigned' },
        { name: 'Vendor Intelligence', type: 'output', description: 'Claim data feeds vendor scores' },
        { name: 'Photos', type: 'input', description: 'Issue photos attached' },
        { name: 'Jobs', type: 'input', description: 'Claims linked to completed jobs' },
        { name: 'Email', type: 'output', description: 'Notifications sent to all parties' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'warranty_id', type: 'uuid', description: 'FK to warranties' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'claim_number', type: 'string', required: true, description: 'Claim reference number' },
        { name: 'title', type: 'string', required: true, description: 'Issue summary' },
        { name: 'description', type: 'text', required: true, description: 'Detailed description' },
        { name: 'category', type: 'string', description: 'Structural, MEP, Finish, Appliance, etc.' },
        { name: 'priority', type: 'string', required: true, description: 'Emergency, High, Normal, Low' },
        { name: 'status', type: 'string', required: true, description: 'Submitted, Evaluating, In Progress, Resolved, Closed' },
        { name: 'responsible_party', type: 'string', description: 'Builder, Vendor, Manufacturer' },
        { name: 'assigned_vendor_id', type: 'uuid', description: 'FK to vendors if assigned' },
        { name: 'reported_at', type: 'timestamp', required: true, description: 'When reported' },
        { name: 'scheduled_date', type: 'date', description: 'Service appointment date' },
        { name: 'resolved_at', type: 'timestamp', description: 'When resolved' },
        { name: 'resolution_notes', type: 'text', description: 'How resolved' },
        { name: 'cost', type: 'decimal', description: 'Cost if builder warranty' },
        { name: 'client_satisfied', type: 'boolean', description: 'Client satisfaction' },
        { name: 'photos', type: 'jsonb', description: 'Issue photos' },
      ]}
      aiFeatures={[
        {
          name: 'Coverage Analysis',
          description: 'Automatically checks warranty coverage: "Issue: HVAC not cooling. Coverage check: Compressor (10yr - covered), Labor (1yr - expired). Recommend: File parts claim with Trane, schedule service at builder cost for labor."',
          trigger: 'On claim submission'
        },
        {
          name: 'Routing Intelligence',
          description: 'Routes to appropriate party: "Tile grout cracking in bathroom. Pattern matches installation issue (not product defect). Routing to ABC Tile for workmanship warranty."',
          trigger: 'On claim evaluation'
        },
        {
          name: 'Pattern Detection',
          description: 'Identifies recurring issues: "3rd window seal failure at Smith residence. All PGT windows from same lot. Recommend: Contact PGT for batch inspection."',
          trigger: 'On claim submission'
        },
        {
          name: 'Priority Assessment',
          description: 'AI assesses true priority: "Client reports \'water issue\' - analyzing photos shows active roof leak over electrical panel. Escalating to Emergency."',
          trigger: 'On claim submission'
        },
        {
          name: 'Resolution Suggestions',
          description: 'Suggests resolution based on similar past claims: "Similar HVAC claims resolved by: capacitor replacement (60%), refrigerant recharge (25%), thermostat reset (15%)."',
          trigger: 'On claim assignment'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Warranty Claims                             [+ New Claim]           │
├─────────────────────────────────────────────────────────────────────┤
│ Open: 8 | This Month: 12 | Avg Resolution: 4.2 days | Satisfaction: 94% │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All ▾] Priority: [All ▾] Status: [All ▾]                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 🔴 EMERGENCY                                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CLM-2024-089 Water leak - Smith Residence           Submitted   │ │
│ │ "Water dripping from ceiling in master bath"         2 hrs ago  │ │
│ │ AI: "Active leak. Photos show water staining. Emergency."       │ │
│ │ Coverage: Builder 2yr warranty (active)                         │ │
│ │ [Assign Vendor] [Schedule Emergency] [View Photos]              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🟡 IN PROGRESS                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CLM-2024-085 HVAC not cooling - Johnson             Scheduled   │ │
│ │ Assigned: ABC HVAC | Appt: Tomorrow 9am                         │ │
│ │ Coverage: Trane warranty (parts only, labor expired)            │ │
│ │ Est. Cost: $150 labor (builder responsibility)                  │ │
│ │ [View Details] [Reschedule] [Contact Vendor]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ✓ RECENTLY RESOLVED                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CLM-2024-082 Cabinet door alignment - Davis         Resolved    │ │
│ │ Resolved: Jan 26 | 3 days | Client satisfied: Yes              │ │
│ │ Resolution: Hinges adjusted by Cabinet Pros (vendor warranty)   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "Pattern detected: 3 similar window seal claims this quarter.  │
│ Consider proactive inspection of all PGT windows from 2023 batch." │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
