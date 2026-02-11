'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Portal Login', 'Dashboard', 'Active Jobs', 'POs/Invoices', 'Bids', 'Documents'
]

export default function VendorPortalSkeleton() {
  return (
    <PageSpec
      title="Vendor Portal"
      phase="Phase 2 - Vendor Collaboration"
      planFile="views/vendor-portal/VENDOR_PORTAL.md"
      description="Self-service portal for subcontractors and suppliers. View POs, submit invoices, respond to bids, upload compliance documents, and track payments."
      workflow={constructionWorkflow}
      features={[
        'Vendor self-registration with approval workflow',
        'Dashboard with active work and pending items',
        'View and acknowledge Purchase Orders',
        'Submit invoices against POs',
        'Respond to bid requests with proposals',
        'Upload insurance certificates and W-9',
        'Payment history and aging',
        'Project documents access (their scope only)',
        'Schedule visibility for their work',
        'Mobile-responsive for field access',
      ]}
      connections={[
        { name: 'Vendors', type: 'input', description: 'Vendor account and profile data' },
        { name: 'Purchase Orders', type: 'input', description: 'POs visible to vendor' },
        { name: 'Invoices', type: 'bidirectional', description: 'Vendor submits invoices' },
        { name: 'Bids', type: 'bidirectional', description: 'Vendor responds to bids' },
        { name: 'Documents', type: 'bidirectional', description: 'Vendor uploads compliance docs' },
        { name: 'Payments', type: 'input', description: 'Payment status and history' },
        { name: 'Schedule', type: 'input', description: 'Schedule items for their work' },
        { name: 'Notifications', type: 'output', description: 'Email/push for new POs, bid invites' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'FK to vendors' },
        { name: 'portal_user_id', type: 'uuid', required: true, description: 'Portal auth user' },
        { name: 'role', type: 'string', required: true, description: 'Admin, User (per vendor)' },
        { name: 'last_login', type: 'timestamp', description: 'Last portal access' },
        { name: 'notification_preferences', type: 'jsonb', description: 'Email/push settings' },
        { name: 'accessible_jobs', type: 'uuid[]', description: 'Jobs vendor can see' },
      ]}
      aiFeatures={[
        { name: 'Invoice Assistance', description: 'AI helps vendors fill invoice details from PO data', trigger: 'On invoice creation' },
        { name: 'Document Extraction', description: 'Extracts insurance expiration dates from uploaded certificates', trigger: 'On document upload' },
        { name: 'Bid Guidance', description: 'Provides scope interpretation and clarification for bid responses', trigger: 'On bid view' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ [Builder Logo]  Vendor Portal                   Welcome, ABC Electric│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  ACTION REQUIRED                                              │  │
│  │  • 2 Purchase Orders to acknowledge                           │  │
│  │  • 1 Bid Request due Dec 15                                   │  │
│  │  • Insurance expires in 14 days - Upload renewal              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ 📋 POs       │  │ 🧾 Invoices  │  │ 📨 Bids      │               │
│  │ 3 active     │  │ 2 pending    │  │ 1 open       │               │
│  │ [View All]   │  │ [Submit New] │  │ [Respond]    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │ 💰 Payments  │  │ 📁 Documents │                                 │
│  │ $8,200 due   │  │ 4 files      │                                 │
│  │ [View]       │  │ [Manage]     │                                 │
│  └──────────────┘  └──────────────┘                                 │
│                                                                     │
│  PAYMENT HISTORY                                                    │
│  ─────────────────────────────────────────────────────────────────  │
│  Nov 15: $12,450 - Smith Residence - Paid ✓                        │
│  Oct 28: $8,900 - Johnson Project - Paid ✓                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
