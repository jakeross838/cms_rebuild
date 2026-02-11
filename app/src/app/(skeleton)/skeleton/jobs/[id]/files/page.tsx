'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Contracts', 'Plans', 'Permits', 'Files', 'Client Portal'
]

export default function FilesSkeleton() {
  return (
    <PageSpec
      title="Files & Documents"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/FILES.md"
      description="Centralized document management for all job-related files. Organize plans, permits, contracts, warranties, and more with AI-powered extraction and search. Documents are versioned, searchable, and shareable with clients and vendors via portals."
      workflow={constructionWorkflow}
      features={[
        'File browser with folder organization',
        'Default folders: Plans, Permits, Contracts, Warranties, Specs, Photos',
        'Drag and drop upload',
        'Version control for updated documents',
        'AI text extraction from PDFs and images',
        'Full-text search across all documents',
        'Document preview without download',
        'Share specific files/folders with client portal',
        'Share specific files with vendor portal',
        'Document expiration tracking (permits, insurance)',
        'Required document checklist by phase',
        'Bulk download as ZIP',
        'Link documents to budget items, POs, etc.',
        'Automatic filing from email attachments',
        'Mobile upload with auto-categorization',
      ]}
      connections={[
        { name: 'Contracts', type: 'input', description: 'Executed contracts stored here' },
        { name: 'Client Portal', type: 'output', description: 'Selected documents shared with client' },
        { name: 'Vendor Portal', type: 'output', description: 'Plans and specs shared with vendors' },
        { name: 'Invoices', type: 'bidirectional', description: 'Invoice PDFs stored and linked' },
        { name: 'Permits', type: 'input', description: 'Permit documents tracked' },
        { name: 'Warranties', type: 'input', description: 'Warranty documents stored' },
        { name: 'Document Intelligence', type: 'bidirectional', description: 'AI extracts and indexes content' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'folder_id', type: 'uuid', description: 'FK to folders' },
        { name: 'name', type: 'string', required: true, description: 'File name' },
        { name: 'file_type', type: 'string', description: 'PDF, DWG, JPG, etc.' },
        { name: 'file_url', type: 'string', required: true, description: 'Storage URL' },
        { name: 'file_size', type: 'integer', description: 'Size in bytes' },
        { name: 'version', type: 'integer', description: 'Version number' },
        { name: 'uploaded_at', type: 'timestamp', required: true, description: 'Upload timestamp' },
        { name: 'uploaded_by', type: 'uuid', description: 'User who uploaded' },
        { name: 'category', type: 'string', description: 'Document category' },
        { name: 'extracted_text', type: 'text', description: 'AI-extracted text content' },
        { name: 'expires_at', type: 'date', description: 'Expiration date if applicable' },
        { name: 'shared_with_client', type: 'boolean', description: 'Visible in client portal' },
        { name: 'shared_with_vendors', type: 'uuid[]', description: 'Vendor IDs with access' },
        { name: 'tags', type: 'string[]', description: 'Document tags' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Categorization',
          description: 'Automatically categorizes uploaded documents: "Detected: Building permit for Smith Residence. Filed to Permits folder. Extracted permit number and expiration date."',
          trigger: 'On upload'
        },
        {
          name: 'Content Extraction',
          description: 'Extracts key information from documents: "From contract: Project value $2.45M, Start date March 1, Completion August 15, Payment schedule: 6 draws."',
          trigger: 'On upload'
        },
        {
          name: 'Expiration Alerts',
          description: 'Tracks document expirations: "Builder risk insurance expires in 30 days. Permit #2024-1234 expires in 60 days. Action required."',
          trigger: 'Daily check'
        },
        {
          name: 'Missing Document Detection',
          description: 'Identifies missing required documents: "Phase: Rough-in. Missing documents: Plumbing inspection report, Electrical inspection report. Required before proceeding."',
          trigger: 'On phase advancement'
        },
        {
          name: 'Smart Search',
          description: 'Natural language search across all documents: "Find the window specifications" returns PGT Impact Window spec sheet from Specs folder with relevant pages highlighted.',
          trigger: 'On search'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Files - Smith Residence                     [Upload] [New Folder]   │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [Find in all documents...                    ] [🔍]        │
├──────────────────┬──────────────────────────────────────────────────┤
│ FOLDERS          │  📁 PLANS (12 files)                             │
│                  │                                                  │
│ 📁 Plans (12)    │  ┌─────────────────────────────────────────────┐ │
│ 📁 Permits (5)   │  │ 📄 Architectural Plans v3.pdf        8.2 MB │ │
│ 📁 Contracts (3) │  │    Updated: Jan 15 | Version 3 of 3         │ │
│ 📁 Specs (8)     │  │    🌐 Shared with: Client, All Vendors      │ │
│ 📁 Warranties (2)│  │    [Preview] [Download] [Share] [Versions]  │ │
│ 📁 Insurance (4) │  └─────────────────────────────────────────────┘ │
│ 📁 Inspections(6)│  ┌─────────────────────────────────────────────┐ │
│ 📁 Photos (156)  │  │ 📄 Structural Engineering.pdf        2.1 MB │ │
│                  │  │    Uploaded: Jan 10 | Version 1              │ │
│ ─────────────────│  │    🌐 Shared with: Framing Contractor       │ │
│ ALERTS           │  └─────────────────────────────────────────────┘ │
│ ⚠ Insurance exp  │  ┌─────────────────────────────────────────────┐ │
│   in 30 days     │  │ 📄 MEP Plans.dwg                     4.5 MB │ │
│ ⚠ Missing: Elec  │  │    Uploaded: Jan 8 | CAD Drawing            │ │
│   inspection     │  │    🌐 Shared with: Electrical, Plumbing     │ │
│                  │  └─────────────────────────────────────────────┘ │
├──────────────────┴──────────────────────────────────────────────────┤
│ AI: "2 documents expiring soon. 1 required inspection missing.      │
│ Permit expires Feb 28—renewal process typically takes 2 weeks."     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
